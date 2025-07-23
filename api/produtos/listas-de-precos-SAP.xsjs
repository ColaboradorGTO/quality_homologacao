let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idLista;

/*function obterLinhasDoDetalhe(idResumoLista) {

	var query = `SELECT
                	TBD.IDDETALHELISTAPRECO,
                	TBD.IDRESUMOLISTAPRECO,
                	TBD.IDGRUPOEMPRESARIAL,
                	TBD.IDEMPRESA,
                	TBE.NOFANTASIA,
                	TBD.STATIVO
                FROM
                	"VAR_DB_NAME".DETALHELISTAPRECO TBD
                INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                    TBE.IDEMPRESA = TBD.IDEMPRESA
                WHERE
                    TBD.IDRESUMOLISTAPRECO = ?`;
                    
    query += `ORDER BY TBD.IDEMPRESA`

	var linhas = api.sqlQuery(query, idResumoLista);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"loja": {
				"IDDETALHELISTAPRECO": det.IDDETALHELISTAPRECO,
            	"IDRESUMOLISTAPRECO": det.IDRESUMOLISTAPRECO,
            	"IDGRUPOEMPRESARIAL": det.IDGRUPOEMPRESARIAL,
            	"IDEMPRESA": det.IDEMPRESA,
            	"NOFANTASIA": det.NOFANTASIA,
            	"STATIVO": det.STATIVO
			}
		};

		lines.push(docLine);
	}

	return lines;
}*/

function fnHandleGet(byId) {
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let idLoja = $.request.parameters.get("idLoja");
    let idLista = $.request.parameters.get("idLista");
    let nomeLista = $.request.parameters.get("nomeLista");
    
    let query = `SELECT
                	TBO."ListNum" as IDRESUMOLISTAPRECO,
                	IFNULL(TBE.NOFANTASIA, TBO."ListName") as NOMELISTA,
                	TBE.IDEMPRESA,
                	TO_VARCHAR(TBO."CreateDate", 'DD/MM/YYYY') AS DATACRIACAO,
                	TO_VARCHAR(TBO."UpdateDate", 'DD/MM/YYYY') AS DATAALTERACAO,
                	'True' as STATIVO
                FROM
                	"VAR_DB_NAME".EMPRESA TBE
                RIGHT JOIN SBO_GTO_PRD.OPLN TBO  ON
                    SUBSTRING(TBO."ListName", 1, 4) = SUBSTRING(TBE.NOFANTASIA, 1, 4)
                WHERE
                    1 = ? `;
    
    if ( byId ) {
        query += ` AND TBR.IDRESUMOLISTAPRECO = ${byId}`;
    }
    
    if ( idLista ) {
        query += ` AND TBR.IDRESUMOLISTAPRECO = ${idLista}`;
    }
    
    if ( idLoja ) {
        query += ` AND TBD.IDEMPRESA = ${idLoja}`;
    }
    
    if ( nomeLista ) {
        query += ` AND CONTAINS((TBR.NOMELISTA, TBR.IDRESUMOLISTAPRECO), '%${nomeLista}%')`;
    } 
    
    if ( dtInicio && dtFim ) {
        query += ` AND (TBR.DATACRIACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59' OR TBR.DATAALTERACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59')`;
    }
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    query += ` ORDER BY "ListName", "ListNum" `;
    
    //api.responseWithQuery(query, request, 1);
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		let listaPreco = {
			"listaPreco": {
				"IDRESUMOLISTAPRECO": registro.IDRESUMOLISTAPRECO,
				"NOMELISTA": registro.NOMELISTA,
				"IDEMPRESA": registro.IDEMPRESA,
				"IDUSERCRIACAO": registro.IDUSERCRIACAO,
				"DATACRIACAO": registro.DATACRIACAO,
				"DTCREATE": registro.DTCREATE,
				"IDUSERALTERACAO": registro.IDUSERALTERACAO,
				"DATAALTERACAO": registro.DATAALTERACAO,
				"DTALTER": registro.DTALTER,
				"STATIVO": registro.STATIVO,
			},
		//	"detalheLista": obterLinhasDoDetalhe(registro.IDRESUMOLISTAPRECO)
		};

		data.push(listaPreco);
 
	}

	response.data = data;

	return response;
    
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

function fnHandlePut() {
    let conn = $.db.getConnection();

    let query = `UPDATE "VAR_DB_NAME".RESUMOLISTAPRECO
                 SET 
                    NOMELISTA = ?, 
                    IDUSERALTERACAO = ?, 
                    DATAALTERACAO = now(), 
                    STATIVO = ? 
                 WHERE 
                    IDRESUMOLISTAPRECO = ?`;
        
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 

    for (let i = 0; i < bodyJson.length; i++) {

		let registro = bodyJson[i];

        pStmt.setString(1, registro.NOMELISTA);
        pStmt.setInt(2, registro.IDUSERALTERACAO);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDRESUMOLISTAPRECO);
                    
    	pStmt.execute();
    	atualizaDetalheListaPreco(registro['lojas'], conn);
    	
    	idLista = registro.IDRESUMOLISTAPRECO;
    }
	pStmt.close();

	conn.commit();
	
	return {
	    typeMsg: 'success',
	    msg: "Atualização realizada com sucesso!",
	    "IDRESUMOLISTAPRECO": idLista
	};
}

function criaDetalheListaPreco(lsLojas, IDRESUMOLISTAPRECO, conn){
    let pStmt;
    
    idLista = IDRESUMOLISTAPRECO;
    
    for (let i = 0; i < lsLojas.length; i++) {
		let registro = lsLojas[i];
        
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
        
        pStmt.setInt(1, parseInt(IDRESUMOLISTAPRECO));
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setString(4, registro.STATIVO);
        
        pStmt.execute();
        
    }
	pStmt.close();

	conn.commit();
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    
    let nextId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDRESUMOLISTAPRECO")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOLISTAPRECO" WHERE 1 = ? ', 1);

    let query =`INSERT INTO "VAR_DB_NAME".RESUMOLISTAPRECO
                (
                	IDRESUMOLISTAPRECO,
                	NOMELISTA,
                	IDUSERCRIACAO,
                	DATACRIACAO,
                	STATIVO
                )
                VALUES(?,?,?,now(),'True')`;
		
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());

	for (let i = 0; i < bodyJson.length; i++) {
        
		let registro = bodyJson[i];
		
		pStmt.setInt(1, parseInt(nextId));
	    pStmt.setString(2, registro.NOMELISTA);
	    pStmt.setInt(3, registro.IDUSERCRIACAO);
        
        pStmt.execute();
        criaDetalheListaPreco(registro['lojas'], nextId, conn);
	}

	pStmt.close();

	conn.commit();
	
    return {
	    typeMsg: 'success',
	    msg: "Criado com sucesso!",
	    "IDRESUMOLISTAPRECO": idLista
	};
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