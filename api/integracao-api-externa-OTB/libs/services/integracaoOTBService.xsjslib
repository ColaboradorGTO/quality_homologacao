let path = "quality.concentrador_homologacao.api";

let utils  = $.import(path + ".integracao-api-externa-OTB.libs", "utils");
let apiClient  = $.import(path + ".integracao-api-externa-OTB.libs.services", "apiClient");
let integracaoMonitor  = $.import(path + ".integracao-api-externa-OTB.libs.repositories", "integracaoMonitorRepository");

let dbNameSAP = 'SBO_GTO_PRD';

function executarIntegracao(config){
    let { 
        nomeAPI,
        endpoint,
        tamanhoLote,
        arrayDados,
    } = config;
    
    let res = [];
    
    if(arrayDados.length > 0){
        let conn = $.db.getConnection();
        
        try {
            let dadosEmLotes = utils.formatarEmLotes(arrayDados, tamanhoLote);
            let totalRegistros = arrayDados.length;
            let totalLotes = dadosEmLotes.length;
            //let dtDados = arrayDados[0]["DATA_DADOS"];
            
            let dadosCriarResumo = {
                nomeAPI, 
                totalRegistros, 
                totalLotes,
                //dtDados
            };
            
            let { idResumoIntegracaoOTB } = integracaoMonitor.criarResumoIntegracaoOTB(dadosCriarResumo, conn);
            
            conn.commit();
            
            if(idResumoIntegracaoOTB > 0){
                let statusResumo = '';
                let contadorLotesSucesso = 0;
                let contadorLotesErro = 0;
                
                for(let i = 0; i < dadosEmLotes.length; i++){
                    let { dados, numRegistroInicioLote, numRegistroFimLote } = dadosEmLotes[i];
                    
                    let numeroLote = i + 1;
                    let numRegistroInicio = numRegistroInicioLote;
                    let numRegistroFim = numRegistroFimLote;
                    let totalRegistros = dados.length;
                    let dtHorainicio = utils.getDataHoraBrasil();
                    let statusDetalhe = 'SUCESSO';
                    let msgError = '';
                    let payload = null
                    
                    //return { idResumoIntegracaoOTB, dadosCriarResumo, length: dados.length, dados }
                    
                    //let respIntegracao = { body: { statusReply: 0}, status: 200}//apiClient.post(dados, endpoint);
                    let respIntegracao = apiClient.post(dados, endpoint);
                    
                    if(respIntegracao.body.statusReply != 0 || respIntegracao.status != 200){
                        msgError = respIntegracao.body.message || respIntegracao.message || 'Erro ao tentar integrar';
                        statusDetalhe = 'ERROR';
                        payload = JSON.stringify(dados);
                        
                        contadorLotesErro ++;
                        
                    } else {
                        
                        contadorLotesSucesso++;
                        
                    }
                    
                    let dadosCriarDetalhe = {
                        idResumoIntegracaoOTB, 
                        numeroLote, 
                        numRegistroInicio, 
                        numRegistroFim, 
                        totalRegistros, 
                        dtHorainicio,
                        statusDetalhe,
                        msgError,
                        payload
                    };
                    
                    //return dadosCriarDetalhe
                    
                    integracaoMonitor.criarDetalheIntegracaoOTB(dadosCriarDetalhe, conn);
                    
                    conn.commit();
                    
                    //res.push({length: dados.length, dados, res})
                }
                
                if(contadorLotesSucesso > 0){
                    statusResumo = contadorLotesErro > 0 ? 'CONCLUIDO_COM_ERRO' : 'CONCLUIDO';
                    
                } else if(contadorLotesSucesso == 0 && contadorLotesErro == 0) {
                    statusResumo = 'CONCLUIDO';
                    
                } else {
                    statusResumo = 'FALHA';
                }
                
                let dadosUpdateResumo = { 
                    idResumoIntegracaoOTB, 
                    statusResumo, 
                    contadorLotesSucesso, 
                    contadorLotesErro, 
                    dtHoraFim: utils.getDataHoraBrasil()
                }
                //return dadosUpdateResumo
                integracaoMonitor.atualizarResumoIntegracaoOTB(dadosUpdateResumo, conn);
            }
            
            conn.commit();
            
        } catch(e){
          conn.rollback();
          
          throw new Error(e);
        } finally {
            conn.close();
        }
    }
}

function executarRepescagemIntegracao(endpoint, arrayDados = []){
    if(arrayDados.length > 0){
        let conn = $.db.getConnection();
        let res = []
        try {
            
            let statusResumo = '';
            let contadorLotesSucesso = 0;
            let contadorLotesErro = 0;
            let idResumoIntegracaoOTB
            
            for(let i = 0; i < arrayDados.length; i++){
                let { IDRESUMOINTEGRACAOOTB, IDDETALHEINTEGRACAOOTB, PAYLOAD } = arrayDados[i];
                let idResumoIntegracaoOTB = IDRESUMOINTEGRACAOOTB;
                let idDetalheIntegracaoOTB = IDDETALHEINTEGRACAOOTB;
                let dadosParaIntegrar = JSON.parse(PAYLOAD);
                
                let dtHoraInicio = utils.getDataHoraBrasil();
                let statusDetalhe = 'SUCESSO';
                let msgError = '';
                let payload = null
                
                //res.push({ IDRESUMOINTEGRACAOOTB, IDDETALHEINTEGRACAOOTB, dadosParaIntegrarLength: dadosParaIntegrar.length, dadosParaIntegrar});
                //continue;
                
                let respIntegracao = apiClient.post(dadosParaIntegrar, endpoint);
                //return {respIntegracao}
                if(respIntegracao.body.statusReply != 0 || respIntegracao.status != 200){
                    msgError = respIntegracao.body.message || respIntegracao.message || 'Erro ao tentar integrar';
                    statusDetalhe = 'ERROR';
                    payload = JSON.stringify(dadosParaIntegrar);
                    
                    contadorLotesErro++;
                    
                } else {
                    
                    contadorLotesSucesso++;
                    
                }
                
                let dadosCriarDetalhe = {
                    idResumoIntegracaoOTB,
                    idDetalheIntegracaoOTB,
                    dtHoraInicio,
                    statusDetalhe,
                    msgError,
                    payload
                };
                
                integracaoMonitor.atualizarDetalheIntegracaoOTBRepescagem(dadosCriarDetalhe, conn);
                
                //return {dadosCriarDetalhe}
                //return res;
            }
            
            if(contadorLotesSucesso > 0){
                statusResumo = contadorLotesErro > 0 ? 'CONCLUIDO_COM_ERRO' : 'CONCLUIDO';
            } else {
                statusResumo = 'FALHA'
            }
            
            let dadosUpdateResumo = { 
                idResumoIntegracaoOTB,
                statusResumo, 
                contadorLotesSucesso,
                contadorLotesErro,
            }
            
            integracaoMonitor.atualizarResumoIntegracaoOTBRepescagem(dadosUpdateResumo, conn);
            
            //return dadosUpdateResumo
            
            conn.commit();
            
        } catch(e){
          conn.rollback();
          
          throw new Error(e);
        } finally {
            conn.close();
        }
    }
}