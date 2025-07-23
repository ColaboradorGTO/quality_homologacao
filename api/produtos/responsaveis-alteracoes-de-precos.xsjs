let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idLista;

function obterLinhasDoDetalhe(idResumoLista) {
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
}

function fnHandleGet(byId) {
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let idLoja = $.request.parameters.get("idLoja");
    let idLista = $.request.parameters.get("idLista");
    let nomeLista = $.request.parameters.get("nomeLista");
    
    let query = `
        SELECT DISTINCT
            TBF.ID,
            TBF.IDFUNCIONARIO,
            TBF.IDEMPRESA,
            TBF.NOFUNCIONARIO,
            TBF.IDPERFIL,
            TBF.DSFUNCAO
        FROM
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON
            TBR.IDUSUARIO = TBF.IDFUNCIONARIO
        WHERE
            1 = ?
    `;
    
    if ( byId ) {
        query += ` AND TBF.IDFUNCIONARIO = ${byId}`;
    }
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
            fnHandleGet(id);
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