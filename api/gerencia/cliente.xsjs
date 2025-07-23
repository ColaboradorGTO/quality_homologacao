var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    let numeroCpfCnpj = $.request.parameters.get("numeroCpfCnpj");
    
    let query = `
        SELECT 
            IDCLIENTE,
            IDEMPRESA,
            DSNOMERAZAOSOCIAL,
            DSAPELIDONOMEFANTASIA,
            TPCLIENTE,
            NUCPFCNPJ,
            NURGINSCESTADUAL,
            NUINSCMUNICIPAL,
            NUCEP,
            NUIBGE,
            EENDERECO,
            NUENDERECO,
            ECOMPLEMENTO,
            EBAIRRO,
            ECIDADE,
            SGUF,
            EEMAIL,
            NUTELCOMERCIAL,
            NUTELCELULAR,
            DTNASCFUNDACAO,
            IDINDICACAOIE,
            DSINDICACAOIE,
            IDUSERCADASTRO,
            NUCNAE,
            STATIVO,
            TO_VARCHAR(DTCADASTRO, 'YYYY-MM-DD') as DTCADASTRO 
        FROM 
            "VAR_DB_NAME".CLIENTE
        WHERE
            1 = ? 
    `;
    
    if ( byId ) {
        query += `AND IDCLIENTE = '${byId}' `;
    }
    
    if(numeroCpfCnpj){
        query += ` AND  NUCPFCNPJ = '${numeroCpfCnpj}' `;
    }
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."CLIENTE"
        SET
            "DSNOMERAZAOSOCIAL" = ?,
            "DSAPELIDONOMEFANTASIA" = ?,
            "TPCLIENTE" = ?,
            "NUCPFCNPJ" = ?,
            "NURGINSCESTADUAL" = ?  ,
            "NUINSCMUNICIPAL" = ?,
            "NUCEP" = ?,
            "NUIBGE" = ?,
            "EENDERECO" = ?,
            "NUENDERECO" = ?,
            "ECOMPLEMENTO" = ?,
            "EBAIRRO" = ?,
            "ECIDADE" = ?,
            "SGUF" = ?,
            "EEMAIL" = ?,
            "NUTELCOMERCIAL" = ?,
            "NUTELCELULAR" = ?,
            "DTNASCFUNDACAO" = ?,
            "IDINDICACAOIE" = ?,
            "DSINDICACAOIE" = ?,
            "IDUSERULTALTERACAO" = ?,
            "NUCNAE" = ?,
            "STATIVO" = 'True',
            "STATUALIZARCADASTROSAP" = 'True',
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE
            "IDCLIENTE" =  ? 
    `;

    let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));
    let bodyJson = JSON.parse($.request.body.asString()); 

    for (let i = 0; i < bodyJson.length; i++) {
        
		let registro = bodyJson[i];
        
        pStmt.setString(1, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt, 2, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(3, (registro.NUCPFCNPJ.length > 11 ? 'JURIDICA' : 'FISICA'));
        pStmt.setString(4, registro.NUCPFCNPJ);
        pStmt.setString(5, registro.NURGINSCESTADUAL);
        setStringOrNull(pStmt, 6, registro.NUINSCMUNICIPAL);
        pStmt.setString(7, registro.NUCEP);
        pStmt.setInt(8, registro.NUIBGE);
        pStmt.setString(9, registro.EENDERECO);
        pStmt.setString(10, registro.NUENDERECO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setString(15, registro.EEMAIL);
        pStmt.setString(16, registro.NUTELCOMERCIAL);
        pStmt.setString(17, registro.NUTELCELULAR);
        setStringOrNull(pStmt, 18, registro.DTNASCFUNDACAO);
        pStmt.setInt(19, registro.IDINDICACAOIE);
        pStmt.setString(20, registro.DSINDICACAOIE);
        pStmt.setInt(21, registro.IDFUNCIONARIO);
        setStringOrNull(pStmt, 22, registro.NUCNAE);
        pStmt.setInt(23, registro.IDCLIENTE);
        
        pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let conn = $.db.getConnection();
    
    let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME"."CLIENTE"
		(
            "IDCLIENTE",
            "IDEMPRESA",
            "DSNOMERAZAOSOCIAL",
            "DSAPELIDONOMEFANTASIA",
            "TPCLIENTE",
            "NUCPFCNPJ",
            "NURGINSCESTADUAL"  ,
            "NUINSCMUNICIPAL",
            "NUCEP",
            "NUIBGE",
            "EENDERECO",
            "NUENDERECO",
            "ECOMPLEMENTO",
            "EBAIRRO",
            "ECIDADE",
            "SGUF",
            "EEMAIL",
            "NUTELCOMERCIAL",
            "NUTELCELULAR",
            "DTNASCFUNDACAO",
            "IDINDICACAOIE",
            "DSINDICACAOIE",
            "IDUSERCADASTRO",
            "NUCNAE",
            "STATIVO",
            "DTCADASTRO"
        )
		VALUES(QUALITY_CONC.SEQ_CLIENTE.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'True', CURRENT_TIMESTAMP) 
	`;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
	let bodyJson = JSON.parse($.request.body.asString());

	for (let i = 0; i < bodyJson.length; i++) {
        
		let registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.DSNOMERAZAOSOCIAL);
        setStringOrNull(pStmt, 3, registro.DSAPELIDONOMEFANTASIA);
        pStmt.setString(4, (registro.NUCPFCNPJ.length > 11 ? 'JURIDICA' : 'FISICA'));
        pStmt.setString(5, registro.NUCPFCNPJ);
        pStmt.setString(6, registro.NURGINSCESTADUAL);
        setStringOrNull(pStmt, 7, registro.NUINSCMUNICIPAL);
        pStmt.setString(8, registro.NUCEP);
        pStmt.setInt(9, registro.NUIBGE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.NUENDERECO);
        pStmt.setString(12, registro.ECOMPLEMENTO);
        pStmt.setString(13, registro.EBAIRRO);
        pStmt.setString(14, registro.ECIDADE);
        pStmt.setString(15, registro.SGUF);
        pStmt.setString(16, registro.EEMAIL);
        pStmt.setString(17, registro.NUTELCOMERCIAL);
        pStmt.setString(18, registro.NUTELCELULAR);
        setStringOrNull(pStmt, 19, registro.DTNASCFUNDACAO);
        pStmt.setInt(20, registro.IDINDICACAOIE);
        pStmt.setString(21, registro.DSINDICACAOIE);
        pStmt.setInt(22, registro.IDFUNCIONARIO);
        setStringOrNull(pStmt, 23, registro.NUCNAE);
        
        pStmt.execute();
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