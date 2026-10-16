var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function validarSeExisteDescricaoOuSiglaAntesDeInserir(descricao, sigla){
    let query = ` 
        SELECT 
            1
        FROM 
            "VAR_DB_NAME".TIPOTECIDOS
        WHERE
            1 = ? 
            AND (
                UPPER(TRIM(DSTIPOTECIDO)) = UPPER(TRIM('${descricao}'))
                OR UPPER(TRIM(DSSIGLA)) = UPPER(TRIM('${sigla}'))
            )
            AND STBLOQUEADOPARACADASTROPRODUTONOVO = 'False'
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return reg.length > 0;
}

function validarSeExisteDescricaoOuSiglaAntesDeAtualizar(id, descricao, sigla){
    let query = ` 
        SELECT 
            1
        FROM 
            "VAR_DB_NAME".TIPOTECIDOS
        WHERE
            1 = ? 
            AND (
                UPPER(TRIM(DSTIPOTECIDO)) = UPPER(TRIM('${descricao}'))
                OR UPPER(TRIM(DSSIGLA)) = UPPER(TRIM('${sigla}'))
            )
            AND IDTPTECIDO <> '${id}'
            AND STBLOQUEADOPARACADASTROPRODUTONOVO = 'False'
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return reg.length > 0;
}

function fnHandleGet(byId) {
    let idTecido = $.request.parameters.get("idTecido");
    let descTecido = $.request.parameters.get("descTecido");
    
    let query = ` 
        SELECT 
            A.IDTPTECIDO,
            A.DSTIPOTECIDO,
            A.DSSIGLA,
            A.STBLOQUEADOPARACADASTROPRODUTONOVO,
            A.STATIVO
        FROM 
            "VAR_DB_NAME".TIPOTECIDOS A
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query += ` AND A.IDTPTECIDO = '${byId}' `;
    }

    if ( idTecido ) {
        query += ` AND A.IDTPTECIDO = '${idTecido}' `;
    }

    if ( descTecido ) {
        query += ` AND CONTAINS((A.DSTIPOTECIDO, A.DSSIGLA), '%${descTecido}%') `;
    }
    
    query += ' ORDER BY A."DSTIPOTECIDO" ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let query = `
        UPDATE 
            "VAR_DB_NAME"."TIPOTECIDOS" 
        SET
            "DSTIPOTECIDO" = ?,
            "DSSIGLA" = ?,
            "STATIVO" = ?,
            "IDUSRULTIMAALTERACAO" = ?,
            "DTHORAULTIMAALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDTPTECIDO" =  ? 
    `;
     
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString());
    
    for (let registro of bodyJson) {
        let exist = validarSeExisteDescricaoOuSiglaAntesDeAtualizar(registro.IDTPTECIDO, registro.DSTIPOTECIDO, registro.DSSIGLA);
        
        if(exist){
            throw new Error('Já existe um Material de Fabricação com essa mesma DESCRIÇÃO ou SIGLA');
        }
        
        pStmt.setString(1, registro.DSTIPOTECIDO);
        pStmt.setString(2, registro.DSSIGLA);
        pStmt.setString(3, registro.STATIVO);
        pStmt.setInt(4, registro.IDFUNCIONARIO);
        pStmt.setInt(5, registro.IDTPTECIDO);
        
        pStmt.executeUpdate();
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

/*function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var queryId = 'SELECT IFNULL(MAX(TO_INT("IDTPTECIDO")),0) + 1 FROM "VAR_DB_NAME"."TIPOTECIDOS" WHERE 1 = ? ';
    
    var query = 'INSERT INTO "VAR_DB_NAME"."TIPOTECIDOS" ' +
		" ( " +
		' "IDTPTECIDO", ' +
        ' "DSTIPOTECIDO", ' +
        ' "STATIVO" ' +
    	' ) ' +
		' VALUES(?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    // if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		var IdTecido = api.executeScalar(queryId,1);

        pStmt.setInt(1, parseInt(IdTecido));
        pStmt.setString(2, registro.DSTIPOTECIDO);
        pStmt.setString(3, registro.STATIVO);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}
*/

function fnHandlePost() {
    let conn = $.db.getConnection();
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."TIPOTECIDOS"
        (
            "DSTIPOTECIDO",
            "DSSIGLA",
            "IDUSRCRIACAO",
            "IDUSRULTIMAALTERACAO"
        )
		VALUES(?, ?, ?, ?)
	`;
	
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());

	for (let registro of bodyJson) {
        let exist = validarSeExisteDescricaoOuSiglaAntesDeInserir(registro.DSTIPOTECIDO, registro.DSSIGLA);
        
        if(exist){
            throw new Error('Já existe um Material de Fabricação com essa mesma DESCRIÇÃO ou SIGLA');
        }
        
        pStmt.setString(1, registro.DSTIPOTECIDO);
        pStmt.setString(2, registro.DSSIGLA);
        pStmt.setInt(3, registro.IDFUNCIONARIO);
        pStmt.setInt(4, registro.IDFUNCIONARIO);
        
        pStmt.executeUpdate();
    }
    
	pStmt.close();

	conn.commit();
	
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
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