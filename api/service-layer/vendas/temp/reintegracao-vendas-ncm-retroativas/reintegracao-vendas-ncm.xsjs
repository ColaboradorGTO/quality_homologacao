let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm-retroativas.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libDevolucao = $.import(`${filePathLibs}.insert-notas`, "devolucao-anulacao"); 
let libNotaSubstituta = $.import(`${filePathLibs}.insert-notas`, "venda-substituta-nfe"); 
let libCancelarDevSomenteSap = $.import(`${filePathLibs}.cancelamento`, "cancelar-dev-somente-sap"); 
let libCancelarNotaSubsSomenteSap = $.import(`${filePathLibs}.cancelamento`, "cancelar-nota-subs-somente-sap"); 
let libDevolucaoExterna = $.import(`${filePathLibs}.insert-notas`, "devolucao-externa"); 
let libVendaSubstitutaExterna = $.import(`${filePathLibs}.insert-notas`, "venda-substituta-externa"); 
let libDevAjuste =  $.import(`${filePathLibs}.insert-notas`, "devolucao-ajuste");
let libVendaAjuste =  $.import(`${filePathLibs}.insert-notas`, "venda-ajuste");

function getListaVendas(idvenda) {
    let query = `
        SELECT
        	TOP 50
        	TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-mm-DD') AS DTHORAFECHAMENTO, 
            TO_VARCHAR(CURRENT_DATE,'YYYY-mm-DD') AS DATA_ATUAL, 
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            TBE.ESTOQUECODIGO,
            TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            TBV.NFE_INFNFE_IDE_NNF,
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 
            TBV.IDCAIXAWEB,
            TBV.NFE_INFNFE_IDE_DHEMI,
            TBV.NFE_INFNFE_IDE_SERIE,
            TBV.PROTNFE_INFPROT_CHNFE,
            TBV.PROTNFE_INFPROT_NPROT,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_XMOTIVO,
            TBV.NFE_INFNFE_TRANSP_MODFRETE, 
            CURRENT_DATE AS DATA_ATUAL_DEVOLUCAO,
            tbvr.DOCENTRYVENDA65,
            ifnull(tbvr.DOCENTRYVENDA55, 0) AS DOCENTRYVENDA55,
            ifnull(tbvr.DOCENTRYDEV, 0) AS DOCENTRYDEV,
            TBVR.DOCENTRYVENDA65
        FROM
        	"VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAS_REINTEGRACAO_TEMPORARIA TBVR ON 
        	TBV.IDVENDA = TBVR.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
        	TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE 
        	1 = ?
        	AND TBVR.STPROCESSOFINALIZADO = 'False'
    `
    if(idvenda) {
        query += ` AND TBV.IDVENDA = '${idvenda}'`
    } else {
        query += ` AND TO_DATE(TBVR.DATAVENDA) BETWEEN '2026.04.01' AND '2026.04.30'`
    }
    
    let dadosVenda = api.sqlQuery(query, 1);
    return dadosVenda;
}

function atualizarStatusQuality(idvenda, conn) {
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            STPROCESSOFINALIZADO = 'True'
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));
	
	try {
	    pStmt.setString(1, idvenda);
    	pStmt.execute();
    	conn.commit();
    	return true;
	} catch(error) {
	    return error;
	} finally {
	    pStmt.close();
	}
}

function executarIntegracao(idvenda){
    let listaVendas = getListaVendas(idvenda);
    
    if(listaVendas.length > 0){
        let session = slApi.loginServiceLayer(true);
        let conn = $.db.getConnection();
        
        for(let i = 0; i < listaVendas.length; i++) {
            let registro = listaVendas[i];
            let statusDev = registro.DOCENTRYDEV == 0 ? false : true;
            let statusNotaSubs = registro.DOCENTRYVENDA55 == 0 ? false : true;
            let statusCancelamentoDev = false;
            let statusCancelamentoNotaSubs = false;
            let statusNotaDevExterna = false;
            let statusNotaVendaExterna = false;
            let statusNotaDevAjuste = false;
            let statusNotaVendaAjuste = false;
            
            if(!statusDev) {
                statusDev = libDevolucao.gerarDevolucao(registro, session, conn);
            }
            
            //return statusDev;
            
            if(statusDev == true && registro.DOCENTRYVENDA55 == false) {
                statusNotaSubs = libNotaSubstituta.gerarVendaSubstituta(registro.IDVENDA, session, conn)
            }
            
            //return statusNotaSubs;
            
            if(statusDev == true && statusNotaSubs == true){
                // efetuar o cancelamento somente no SAP da nota de devolução e a substituta
                statusCancelamentoDev = libCancelarDevSomenteSap.efetuarCancelamento(registro.IDVENDA, session, conn);
                
                //return statusCancelamentoDev;
                
                if(statusCancelamentoDev == true) {
                    statusCancelamentoNotaSubs = libCancelarNotaSubsSomenteSap.efetuarCancelamento(registro.IDVENDA, session, conn);
                    //return statusCancelamentoNotaSubs;
                }
            }
            
            if(statusCancelamentoDev == true && statusCancelamentoNotaSubs == true) {
                // lançar notas como externa
                statusNotaDevExterna = libDevolucaoExterna.gerarDevolucao(registro.IDVENDA, session, conn);
                
                if(statusNotaDevExterna == true) {
                    statusNotaVendaExterna = libVendaSubstitutaExterna.gerarVendaSubstituta(registro.IDVENDA, session, conn);
                    //return statusNotaVendaExterna;
                }
            }
            
            if(statusNotaDevExterna == true && statusNotaVendaExterna == true){
                // lançar notas de devolução e saida como anulação
                statusNotaDevAjuste = libDevAjuste.gerarDevolucao(registro.IDVENDA, session, conn);
                //return statusNotaDevAjuste;
                
                if(statusNotaDevAjuste == true) {
                    statusNotaVendaAjuste = libVendaAjuste.gerarVendaSubstituta(registro.IDVENDA, session, conn);
                   // return statusNotaVendaAjuste;
                    
                    if(statusNotaVendaAjuste == true) atualizarStatusQuality(registro.IDVENDA, conn);
                }
            }
        }
        
        return 'Todos os processos foram realizados, para validação, checar os campos de LOGS.';
    } else {
        return `Não foram encontradas vendas para reintegrar`;
    }
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                let idvenda = $.request.parameters.get("idvenda");
                let doc = executarIntegracao(idvenda);
                $.response.setBody(JSON.stringify(doc));
            break;
                
            default:
                break;
        }
    
    } catch(e) {
        let detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }   
}