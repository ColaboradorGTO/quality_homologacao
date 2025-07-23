let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idLista;

function obterLinhasDoDetalhe(idResumoLista) {

	var query = `SELECT DISTINCT
                	TBD.IDDETALHEALTERACAOPRECOPRODUTO,
                	TBD.IDRESUMOALTERACAOPRECOPRODUTO,
                	TBD.IDPRODUTO,
                	TBP.DSNOME,
                	TBP.NUCODBARRAS,
                	TBD.PRECOVENDAANTERIOR,
                	TBD.PRECOVENDANOVO
                FROM
                	"VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD
                INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                    TBP.IDPRODUTO = TBD.IDPRODUTO
                WHERE
                    TBD.IDRESUMOALTERACAOPRECOPRODUTO = ?`;
                    
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
            	"DSNOME": det.DSNOME,
            	"NUCODBARRAS": det.NUCODBARRAS,
            	"PRECOVENDAANTERIOR": det.PRECOVENDAANTERIOR,
            	"PRECOVENDANOVO": det.PRECOVENDANOVO
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
        	TO_VARCHAR(TBR.AGENDAMENTOALTERACAO, 'YYYY-MM-DD HH24:MI:SS') as AGENDAMENTOALTERACAO
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
    
    if ( byId ) {
        query += ` AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ${byId}`;
    }  
    
    if ( idLista ) {
        query += `AND TBD.TPALTERADOGRUPOEMP = 0 AND TBRL.IDRESUMOLISTAPRECO = ${idLista}`;
    } 
    
    if ( idLoja ) {
        query += ` AND (TBD.TPALTERADOGRUPOEMP = 1 AND TBE.IDEMPRESA = ${idLoja} OR TBDL.IDEMPRESA = ${idLoja})`;
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
    
    api.responseWithQuery(query, request, 1);
    /*let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		let listaAlteracoes = {
			"alteracaoPreco": {
				"IDRESUMOALTERACAOPRECO": registro.IDRESUMOALTERACAOPRECO,
				"NOMELISTA": registro.NOMELISTA,
				"IDUSUARIO": registro.IDUSUARIO,
				"NOFUNCIONARIO": registro.NOFUNCIONARIO,
				"DATACRIACAO": registro.DATACRIACAO,
				"DATACRIACAOFORMATADA": registro.DATACRIACAOFORMATADA,
				"NOEMPRESA": registro.NOFANTASIA,
				"QTDITENS": registro.QTDITENS,
				"AGENDAMENTOALTERACAO": registro.AGENDAMENTOALTERACAO,
				"AGENDAMENTOALTERACAOFORMATADO": registro.AGENDAMENTOALTERACAOFORMATADO,
				"detalheAlteracao": obterLinhasDoDetalhe(registro.IDRESUMOALTERACAOPRECO)
			},
		};

		data.push(listaAlteracoes);
 
	}

	response.data = data;

	return response;*/
    
}

function atualizaDetalheListaPreco(lsLojas, conn){
    let pStmt;
    
    for (let i = 0; i < lsLojas.length; i++) {
		let registro = lsLojas[i];
        
        if(registro.IDDETALHELISTAPRECO){
            let query = `UPDATE "VAR_DB_NAME".DETALHELISTAPRECO 
                 SET 
                    IDGRUPOEMPRESARIAL = ?, 
                    IDEMPRESA = ?,
                    STATIVO = ?
                WHERE 
                    IDDETALHELISTAPRECO = ?`;
        
            pStmt = conn.prepareStatement(api.replaceDbName(query));
            
            pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
            pStmt.setInt(2, registro.IDEMPRESA);
            pStmt.setString(3, registro.STATIVO);
            pStmt.setInt(4, registro.IDDETALHELISTAPRECO);
 
        } else{
            let queryInsert = `INSERT
                                	INTO
                                	"VAR_DB_NAME".DETALHELISTAPRECO
                                (
                                	IDDETALHELISTAPRECO,
                                	IDRESUMOLISTAPRECO,
                                	IDGRUPOEMPRESARIAL,
                                	IDEMPRESA,
                                	STATIVO
                                )
                                VALUES("VAR_DB_NAME".SEQ_DETALHELISTAPRECO.NEXTVAL,?,?,?,?)`;
            pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
            
            pStmt.setInt(1, registro.IDRESUMOLISTAPRECO);
            pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
            pStmt.setInt(3, registro.IDEMPRESA);
            pStmt.setString(4, registro.STATIVO);
            
            
        }
        pStmt.execute();
        
    }
	pStmt.close();

	conn.commit();
}

// function fnHandlePut() {
//     let conn = $.db.getConnection();

//     let query = `
//         UPDATE 
//             "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
//         SET 
//             AGENDAMENTOALTERACAO = ?, 
//             RESPATUALIZACAO = ?, 
//             DATAATUALIZACAO = now(), 
//             STATIVO = ? 
//         WHERE 
//             IDRESUMOALTERACAOPRECOPRODUTO = ?
//     `;
    
//     let pStmt = conn.prepareStatement(api.replaceDbName(query));
//     let bodyJson = JSON.parse($.request.body.asString()); 

//     for (let i = 0; i < bodyJson.length; i++) {

// 		let registro = bodyJson[i];

//         pStmt.setString(1, registro.NOMELISTA);
//         pStmt.setInt(2, registro.IDUSERALTERACAO);
//         pStmt.setString(3, registro.STATIVO);
//         pStmt.setInt(4, registro.IDRESUMOALTERACAOPRECOPRODUTO);
                    
//     	pStmt.execute();
//     	atualizaDetalheListaPreco(registro['lojas'], conn);
    	
//     	idLista = registro.IDRESUMOLISTAPRECO;
//     }
// 	pStmt.close();

// 	conn.commit();
	
// 	return {
// 	    typeMsg: 'success',
// 	    msg: "Atualização realizada com sucesso!",
// 	    "IDRESUMOLISTAPRECO": idLista
// 	};
// }

// function criaDetalheListaPreco(lsLojas, IDRESUMOLISTAPRECO, conn){
//     let pStmt;
    
//     idLista = IDRESUMOLISTAPRECO;
    
//     for (let i = 0; i < lsLojas.length; i++) {
// 		let registro = lsLojas[i];
        
//         let queryInsert = `INSERT
//                                 	INTO
//                                 	"VAR_DB_NAME".DETALHELISTAPRECO
//                                 (
//                                 	IDDETALHELISTAPRECO,
//                                 	IDRESUMOLISTAPRECO,
//                                 	IDGRUPOEMPRESARIAL,
//                                 	IDEMPRESA,
//                                 	STATIVO
//                                 )
//                                 VALUES("VAR_DB_NAME".SEQ_DETALHELISTAPRECO.NEXTVAL,?,?,?,?)`;
//         pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
        
//         pStmt.setInt(1, parseInt(IDRESUMOLISTAPRECO));
//         pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
//         pStmt.setInt(3, registro.IDEMPRESA);
//         pStmt.setString(4, registro.STATIVO);
        
//         pStmt.execute();
        
//     }
// 	pStmt.close();

// 	conn.commit();
// }

// function fnHandlePost() {
//     let conn = $.db.getConnection();
    
//     let nextId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOLISTAPRECO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOLISTAPRECO" WHERE 1 = ? ', 1);

//     let query =`INSERT INTO "VAR_DB_NAME".RESUMOLISTAPRECO
//                 (
//                 	IDRESUMOLISTAPRECO,
//                 	NOMELISTA,
//                 	IDUSERCRIACAO,
//                 	DATACRIACAO,
//                 	STATIVO
//                 )
//                 VALUES(?,?,?,now(),'True')`;
		
//     let pStmt = conn.prepareStatement(api.replaceDbName(query));
// 	let bodyJson = JSON.parse($.request.body.asString());

// 	for (let i = 0; i < bodyJson.length; i++) {
        
// 		let registro = bodyJson[i];
		
// 		pStmt.setInt(1, parseInt(nextId));
// 	    pStmt.setString(2, registro.NOMELISTA);
// 	    pStmt.setInt(3, registro.IDUSERCRIACAO);
        
//         pStmt.execute();
//         criaDetalheListaPreco(registro['lojas'], nextId, conn);
// 	}

// 	pStmt.close();

// 	conn.commit();
	
//     return {
// 	    typeMsg: 'success',
// 	    msg: "Criado com sucesso!",
// 	    "IDRESUMOLISTAPRECO": idLista
// 	};
// }

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        // case $.net.http.PUT:
        //     var docReturn = fnHandlePut();
        //     $.response.setBody(JSON.stringify(docReturn));
        //     break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id)
           //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        //Handle your POST calls here
        // case $.net.http.POST:
        //     var doc = fnHandlePost();
        //      $.response.setBody(JSON.stringify(doc));
        //     break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}