let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libAtivar = $.import("quality.concentrador_homologacao.api.service-layer.produto.libs", "ativar-produto");
let libInativar = $.import("quality.concentrador_homologacao.api.service-layer.produto.libs", "inativar-produto");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function updateLogError(idProduto, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO"
        SET
            ERRORLOGSAP = ?
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setString(2, idProduto);
	
	pStmt.executeUpdate();
	
	conn.commit();
	
	pStmt.close();
}

function updateLogSuccess(idProduto){
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO"
        SET
            ERRORLOGSAP = NULL
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	
	pStmt.executeUpdate();
	
	conn.commit();
	
	pStmt.close();
}

function validarSeExisteNoSAP(idProduto){
    let query = `
        SELECT 
            "ItemCode"
        FROM
            "${dbNameSAP}".OITM
        WHERE
            "ItemCode" = '${idProduto}'
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return (reg.length > 0);
}

function fnHandlePut() {
    conn = $.db.getConnection();
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."PRODUTO" 
        SET
            "DTULTALTERACAO" = CURRENT_TIMESTAMP,
            "IDFUNCIONARIOINATIVACAO" = ?,
            "DSMOTIVOINATIVACAO" = ?,
            "IDFUNCIONARIOREATIVACAO" = ?,
            "DSMOTIVOREATIVACAO" = ?,
            "STATIVO" = ?
        WHERE 
            "IDPRODUTO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 

    for (let registro of bodyJson) {
        let existSap = validarSeExisteNoSAP(registro.IDPRODUTO);
        
        if(existSap){
            let respSAP = registro.STATIVO == 'True' ? libAtivar.ativarProdutoSAP(registro.IDPRODUTO) : libInativar.inativarProdutoSAP(registro.IDPRODUTO);
            
            //return {respSAP}
            if(!respSAP.success){
                let msgError = respSAP.msgError || `Erro ao tentar ${registro.STATIVO == 'True' ? 'Ativar' : 'Inativar'} o produto no SAP.`;
                
                updateLogError(registro.IDPRODUTO, msgError);
                
                $.response.status = 400;
                
                return {
                    msg : msgError
                };
            }
        }
        
        setIntOrNull(pStmt, 1, (registro.IDFUNCIONARIOINATIVACAO || null));
        setStringOrNull(pStmt, 2, (registro.DSMOTIVOINATIVACAO || null));
        setIntOrNull(pStmt, 3, (registro.IDFUNCIONARIOREATIVACAO || null));
        setStringOrNull(pStmt, 4, (registro.DSMOTIVOREATIVACAO || null));
        pStmt.setString(5, registro.STATIVO);
        pStmt.setString(6, registro.IDPRODUTO);
        
        pStmt.execute();
        
        updateLogSuccess(registro.IDPRODUTO);
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}