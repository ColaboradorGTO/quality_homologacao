let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idLista;

function obterEstoqueAtual(idProduto, tpAlteracao, idListaOuEmpresa){
    let qtdEstoqueAtual = 0 ;
    
    let query = `
        SELECT
        	SUM(IFNULL(TBI.QTDFINAL, 0)) AS QTDESTOQUE  
        FROM 
        	"VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
    `;
    
    if(tpAlteracao == '0'){
        query += `
            INNER JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBD ON
            	TBI.IDEMPRESA = TBD.IDEMPRESA AND TBD.STATIVO = 'True'
            WHERE 
            	TBD.IDRESUMOLISTAPRECO = ?
        `;
    } else {
        query += `
            WHERE 
                AND TBI.IDEMPRESA = ?
        `;
    }
    
    query += ` AND TBI.IDPRODUTO = '${idProduto}' AND TBI.STATIVO = 'True' `;
    
    let respQuery = api.sqlQuery(query, idListaOuEmpresa);
    
    if(respQuery.length){
        qtdEstoqueAtual = respQuery[0].QTDESTOQUE;
    }
    
    return Number(qtdEstoqueAtual);
}

function obterLinhasDoDetalhe(idResumoLista) {

	var query = `
        SELECT DISTINCT
            TBD.IDDETALHEALTERACAOPRECOPRODUTO,
            TBD.IDRESUMOALTERACAOPRECOPRODUTO,
            TBD.TPALTERADOGRUPOEMP,
            TBD.IDGRUPOEMP,
            TBD.IDPRODUTO,
            TO_VARCHAR(IFNULL(TBP.DTCADASTRO, (SELECT "CreateDate" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = TBP.IDPRODUTO)), 'DD/MM/YYYY HH24:MI:SS') AS DTCADASTRO,
            TBP.DSNOME,
            TBP.NUCODBARRAS,
            TBD.PRECOVENDAANTERIOR,
            TBD.PRECOVENDANOVO,
            TBD.QTDESTOQUEAOCADASTRAR,
            TBD.QTDESTOQUEAOEXECUTAR,
            TBD.STATIVO,
            CASE 
			    WHEN TBD.TPALTERADOGRUPOEMP = 0 THEN (
			        SELECT
			            IFNULL(SUM(IFNULL(QTDFINAL, 0)), 0) AS QTDESTOQUE  
			        FROM 
			            "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
			        INNER JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDP ON
			            TBI.IDEMPRESA = TBDP.IDEMPRESA AND TBDP.STATIVO = 'True'
			        WHERE 
			            TBI.IDPRODUTO = TBP.IDPRODUTO
			            AND TBDP.IDRESUMOLISTAPRECO = TBD.IDGRUPOEMP
			            AND TBI.STATIVO = 'True'
			    )
			    ELSE (
			        SELECT
			            IFNULL(SUM(IFNULL(QTDFINAL, 0)), 0) AS QTDESTOQUE  
			        FROM 
			            "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
			        WHERE 
			            TBI.IDPRODUTO = TBD.IDPRODUTO
			            AND TBI.IDEMPRESA = TBD.IDGRUPOEMP
			            AND TBI.STATIVO = 'True'
			    )
			END AS QTDESTOQUEATUAL
        FROM
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.IDPRODUTO = TBD.IDPRODUTO
        WHERE
            TBD.IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    query += `ORDER BY TBD.IDRESUMOALTERACAOPRECOPRODUTO, TBD.IDDETALHEALTERACAOPRECOPRODUTO`

	var linhas = api.sqlQuery(query, idResumoLista);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
        
		var docLine = {
            "@nItem": i + 1,
            "produto": {
                "IDRESUMOALTERACAOPRECOPRODUTO": det.IDRESUMOALTERACAOPRECOPRODUTO,
                "IDDETALHEALTERACAOPRECOPRODUTO": det.IDDETALHEALTERACAOPRECOPRODUTO,
                "IDPRODUTO": det.IDPRODUTO,
                "DTCADASTRO": det.DTCADASTRO,
                "DSNOME": det.DSNOME,
                "NUCODBARRAS": det.NUCODBARRAS,
                "PRECOVENDAANTERIOR": det.PRECOVENDAANTERIOR,
                "PRECOVENDANOVO": det.PRECOVENDANOVO,
                "QTDESTOQUEAOCADASTRAR": det.QTDESTOQUEAOCADASTRAR,
                "QTDESTOQUEAOEXECUTAR": det.QTDESTOQUEAOEXECUTAR,
                "QTDESTOQUEATUAL": det.QTDESTOQUEATUAL,//obterEstoqueAtual(det.IDPRODUTO, det.TPALTERADOGRUPOEMP, det.IDGRUPOEMP),
                "STATIVO": det.STATIVO
            }
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let idLoja = $.request.parameters.get("idLoja");
    let idLista = $.request.parameters.get("idLista");
    let idUser = $.request.parameters.get("idUser");
    let idProd = $.request.parameters.get("idProd");
    let codeBars = $.request.parameters.get("codeBars");
    let descProd = $.request.parameters.get("descProd");
    let idAlteracao = $.request.parameters.get("idAlteracao");
    
    let query = `
        SELECT DISTINCT 
        	TBR.IDRESUMOALTERACAOPRECOPRODUTO,
        	TBR.TPALTERACAO,
        	TBRL.IDRESUMOLISTAPRECO,
        	TBRL.NOMELISTA,
        	TBE.IDEMPRESA,
        	TBE.NOFANTASIA,
        	TBR.IDUSUARIO,
        	TBF.NOFUNCIONARIO,
        	TBR.QTDITENS,
        	TBR.STCANCELADO,
        	TBR.STEXECUTADO,
        	TO_VARCHAR(TBR.DATAALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS DATACRIACAOFORMATADA,
        	TO_VARCHAR(TBR.DATAALTERACAO, 'YYYY-MM-DD HH24:MI:SS') as DATACRIACAO, 
        	TBR.IDUSUARIO,
        	TO_VARCHAR(TBR.AGENDAMENTOALTERACAO, 'DD/MM/YYYY HH24:MI:SS') AS AGENDAMENTOALTERACAOFORMATADO,
        	TO_VARCHAR(TBR.AGENDAMENTOALTERACAO, 'YYYY-MM-DD HH24:MI:SS') as AGENDAMENTOALTERACAO,
        	TBR.RESPATUALIZACAO,
        	TO_VARCHAR(TBR.DATAATUALIZACAO, 'YYYY-MM-DD HH24:MI:SS') as DATAATUALIZACAO
        FROM
        	"VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        LEFT JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON
        	TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBR.IDUSUARIO = TBF.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBD.IDPRODUTO = TBP.IDPRODUTO
        LEFT JOIN "VAR_DB_NAME".EMPRESA TBE ON
        	TBD.IDGRUPOEMP = TBE.IDEMPRESA
        	AND TBD.TPALTERADOGRUPOEMP = 1
        LEFT JOIN "VAR_DB_NAME".RESUMOLISTAPRECO TBRL ON
        	TBD.IDGRUPOEMP = TBRL.IDRESUMOLISTAPRECO
        	AND TBD.TPALTERADOGRUPOEMP = 0
        LEFT JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDL ON
            TBRL.IDRESUMOLISTAPRECO = TBDL.IDRESUMOLISTAPRECO
        WHERE 
            1 = ? 
    `;
    
    if ( idAlteracao ) {
        query += ` AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ${idAlteracao}`;
    }  
    
    if ( idLista ) {
        query += `AND TBD.TPALTERADOGRUPOEMP = 0 AND TBRL.IDRESUMOLISTAPRECO = ${idLista}`;
    } 
    
    if ( idLoja ) {
        query += `AND TBD.TPALTERADOGRUPOEMP = 1 AND TBE.IDEMPRESA = ${idLoja} OR TBDL.IDEMPRESA = ${idLoja}`;
    } 
    
    if ( idUser ) {
        query += `AND TBR.IDUSUARIO = '${idUser}'`;
    } 
    
    if ( idProd ) {
        query += ` AND TBP.IDPRODUTO = '${idProd}'`;
    } 
    
    if ( codeBars ) {
        query += ` AND CONTAINS(TBP.NUCODBARRAS, '%${codeBars}%')`;
    } 
    
    if ( descProd ) {
        descProd = descProd.replace(/\s+/g, '%');
        query += ` AND CONTAINS(TBP.DSNOME, '%${descProd}%')`;
    } 
    
    if(dtInicio && dtFim) {
        query += ` AND (TBR.DATAALTERACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59' OR TBR.AGENDAMENTOALTERACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59')`;
    }
    
    query += ` ORDER BY TBR.IDRESUMOALTERACAOPRECOPRODUTO`;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    //api.responseWithQuery(query, request, 1);
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		let listaAlteracoes = {
			"alteracaoPreco": {
				"IDRESUMOALTERACAOPRECOPRODUTO": registro.IDRESUMOALTERACAOPRECOPRODUTO,
				"NOMELISTA": registro.NOMELISTA,
				"IDUSUARIO": registro.IDUSUARIO,
				"NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"DATACRIACAO": registro.DATACRIACAO,
				"DATACRIACAOFORMATADA": registro.DATACRIACAOFORMATADA,
				"NOEMPRESA": registro.NOFANTASIA,
				"QTDITENS": registro.QTDITENS,
				"STCANCELADO": registro.STCANCELADO,
				"STEXECUTADO": registro.STEXECUTADO,
				"AGENDAMENTOALTERACAO": registro.AGENDAMENTOALTERACAO,
				"AGENDAMENTOALTERACAOFORMATADO": registro.AGENDAMENTOALTERACAOFORMATADO,
				"RESPATUALIZACAO": registro.RESPATUALIZACAO,
				"DATAATUALIZACAO": registro.DATAATUALIZACAO,
				"detalheAlteracao": obterLinhasDoDetalhe(registro.IDRESUMOALTERACAOPRECOPRODUTO)
			},
		};

		data.push(listaAlteracoes);
 
	}

	response.data = data;

	return response;
    
}

function atualizarResumoAlteracao(idResumoAlteracao, idFuncionario, stAtivo, conn){
    let qtdItens;
    
    let queryQtdItens = `
        SELECT 
            COUNT(*) AS QTDITENS
        FROM
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
        WHERE
            STATIVO <> 'False'
            AND STEXCLUIDO <> 'True'
            AND IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let regQtdItens = api.sqlQuery(queryQtdItens, idResumoAlteracao);
    
    qtdItens = Number(regQtdItens[0].QTDITENS || 0);
    
    let updateResumo = `
        UPDATE
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
        SET
            RESPATUALIZACAO = ${idFuncionario},
            DATAATUALIZACAO = now(),
    `;
    
    if(qtdItens <= 1 && stAtivo == 'False'){
        updateResumo += `
            QTDITENS = 0,
            STCANCELADO = 'True',
            LOGALTERACAOPRECOPRODUTO = 'CANCELOU TODOS OS ITENS'
        `;
    } else {
        updateResumo += `
            QTDITENS = ${qtdItens},
            LOGALTERACAOPRECOPRODUTO = NULL
        `;
    }
    
    updateResumo += `
        WHERE
            IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(updateResumo));
    
    pStmtUpdateResumo.setInt(1, Number(idResumoAlteracao));
    
    pStmtUpdateResumo.execute();
    pStmtUpdateResumo.close();
}

function atualizarDetalheAlteracao(idResumoAlteracao, idDetalheAlteracao, idFuncionario, stAtivo, precoVenda, conn){
    let updateProdDetalhe = `
        UPDATE
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
        SET
            RESPATUALIZACAO = ${idFuncionario},
            DATAATUALIZACAO = now(),
    `;
    
    if(stAtivo){
        let stExcluido = stAtivo == 'False' ? 'True' : 'False';
        
        updateProdDetalhe += ` 
            STATIVO = '${stAtivo}',
            STEXCLUIDO = '${stExcluido}'
        `;
        
        if(precoVenda && stAtivo == 'True'){
            updateProdDetalhe += ` , PRECOVENDANOVO = ${parseFloat(precoVenda)} `;
        }
        
    } else {
        updateProdDetalhe += ` PRECOVENDANOVO = ${parseFloat(precoVenda)} `;
    }
    
    updateProdDetalhe += `
        WHERE
            IDRESUMOALTERACAOPRECOPRODUTO = ?
            AND IDDETALHEALTERACAOPRECOPRODUTO = ${idDetalheAlteracao}
    `;
    
    let pStmtUpdateProdDetalhe = conn.prepareStatement(api.replaceDbName(updateProdDetalhe));
    
    pStmtUpdateProdDetalhe.setInt(1, Number(idResumoAlteracao));
    
    pStmtUpdateProdDetalhe.execute();
    pStmtUpdateProdDetalhe.close();
    
    if(stAtivo == 'True'){
        conn.commit();
    }
}

function fnHandlePut(){
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    let IDRESUMOALTERACAOPRECO;
    let updateProd;
    let stAltValida = true;
    let qtdItens;
    let qtdEstoque;
   
   try{ 
       if(bodyJson.length){
            bodyJson.map((dados, indice)=>{
                let idResumoAlteracao = dados.IDRESUMOALTERACAOPRECO;
                let idDetalheAlteracao = dados.IDDETALHEALTERACAOPRECO;
                let stAtivo = dados.STATIVO;
                let precoVenda = dados.PRECOVENDANOVO
                
                let validaAlteracao = `
                    SELECT 
                        * 
                    FROM
                        "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
                    WHERE 
                        TBR.STEXECUTADO <> 'True'
                        AND TBR.STCANCELADO <> 'True'
                        AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
                `;
                
                let regAlteracaoValida = api.sqlQuery(validaAlteracao, idResumoAlteracao);
                
                if(regAlteracaoValida.length){
                    
                    let updateHistProdEmpresa = `
                        UPDATE
                            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
                        SET
                            DTHORAATUALIZADO = now(),
                    `;
                    
                    if(stAtivo){
                        let stExcluido = stAtivo == 'False' ? 'True' : 'False';
                        
                        updateHistProdEmpresa += ` 
                            STATIVO = '${dados.STATIVO}',
                            STEXCLUIDO = '${stExcluido}' 
                        `;
                        
                        if(dados.PRECOVENDANOVO && dados.STATIVO == 'True'){
                            updateHistProdEmpresa += ` , PRECOVENDA = ${parseFloat(dados.PRECOVENDANOVO)} `;
                        }
                        
                    } else {
                        updateHistProdEmpresa += ` PRECOVENDA = ${parseFloat(dados.PRECOVENDANOVO)} `;
                    }
                    
                    updateHistProdEmpresa += `
                        WHERE
                            IDRESUMOALTERACAOPRECOPRODUTO = '${idResumoAlteracao}'
                            AND IDPRODUTO = '${dados.IDPRODUTO}'
                            AND 1 = ?
                    `;
                    
                    let pStmtUpdateHistProdEmpresa = conn.prepareStatement(api.replaceDbName(updateHistProdEmpresa));
                    
                    pStmtUpdateHistProdEmpresa.setInt(1, 1);
                    
                    pStmtUpdateHistProdEmpresa.execute();
                    pStmtUpdateHistProdEmpresa.close();
                    
                    //conn.commit();
                    //return 
                    atualizarDetalheAlteracao(idResumoAlteracao, idDetalheAlteracao, dados.IDFUNCIONARIO, stAtivo, precoVenda, conn)
                    atualizarResumoAlteracao(idResumoAlteracao, dados.IDFUNCIONARIO, stAtivo, conn);
                    
                    IDRESUMOALTERACAOPRECO = dados.IDRESUMOALTERACAOPRECO;
                } else {
                    stAltValida = false;
                }
            })
            
            if(stAltValida){
                conn.commit();
                
                return {
                    "type": 'success',
                    "msg": 'Dados Atualizados com Sucesso!',
                    "IDRESUMOALTERACAOPRECO": IDRESUMOALTERACAOPRECO
                }
            } 
            
            return {
                "type": 'warning',
                "msg": "Está alteração já foi realizada ou cancelada, recarregue a página e tente novamente!"
            };
       }
       
       return {
            "type": 'warning',
            "msg": "Nenhum dado enviado, recarregue a página e tente novamente!"
        };
        
    } catch (error){
        conn.rollback();
        throw error
    } finally{
        conn.close();
    }
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
           // fnHandleGet(id)
           $.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}