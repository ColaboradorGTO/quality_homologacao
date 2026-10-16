var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
function setTimestampOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setInt(fieldId, value);
}

function fnHandleGetMenuFilho(byId) {
    var idMenuPai = $.request.parameters.get("idMenuPai");
    var urlMenu = $.request.parameters.get("urlMenu");

    var query = `
        SELECT 
            ID,
            DSNOME,
            IDMENUPAI,
            URL
        FROM "VAR_DB_NAME"."MENUFILHO"
        WHERE 1 = ?
    `;

    if (idMenuPai) {
        query += `AND IDMENUPAI = '${idMenuPai}' `;
    }
    if (byId) {
        query += `AND ID = '${byId}' `;
    }
    if (urlMenu) {
        query += `AND URL = '${urlMenu}' `;
    }
    query += "ORDER BY ID";

    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}


function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."MENUFILHO" SET ' + 
        ' "DSNOME" = ?, ' + 
        ' "IDMENUPAI" = ?, ' + 
        ' "URL" = ? ' + 
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.DSNOME);
        pStmt.setInt(2, registro.IDMENUPAI);
        pStmt.setString(3, registro.URL);
        pStmt.setInt(4, registro.ID);
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	    
	};
}


function fnHandlePostMenuFilho() {
    var conn = $.db.getConnection();

    try {
        var query = `
            INSERT INTO "VAR_DB_NAME"."MENUFILHO" (
                "ID",
                "DSNOME",
                "IDMENUPAI",
                "URL",
                "N1",
                "N2",
                "N3",
                "N4",
                "ADMINISTRADOR",
                "VISUALIZAR",
                "ALTERAR",
                "CRIAR"
                )
            VALUES (?, ?, ?, ?, 'False', 'False', 'False', 'True', 'False', 'True', 'False', 'False')
        `;
        
        var sqlFinal = api.replaceDbName(query);
        //$.trace.debug("SQL gerado: " + sqlFinal);

        var pStmt = conn.prepareStatement(sqlFinal);
        var bodyJson = JSON.parse($.request.body.asString());
        var registros = Array.isArray(bodyJson) ? bodyJson : [bodyJson];

        for (var i = 0; i < registros.length; i++) {
            var Id = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("ID")),0) + 1 FROM "VAR_DB_NAME"."MENUFILHO" WHERE 1 = ? ', 1);
            var registro = registros[i];

            pStmt.setInt(1, Id);
            pStmt.setString(2, registro.DSNOME);
            pStmt.setInt(3, registro.IDMENUPAI);
            pStmt.setString(4, registro.URL);
        
            
            pStmt.execute();
           // var linhas = pStmt.executeUpdate();
            //$.trace.debug("Linhas afetadas: " + linhas);
        }

        pStmt.close();
        conn.commit();

        return {
            "msg": "Menu filho inserido com sucesso!",
            "objetoRecebido": bodyJson
        };

    } catch (error) {
        conn.rollback();
        throw error;
    }
}



$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        case $.net.http.GET:
            var id =$.request.parameters.get("id");
            fnHandleGetMenuFilho(id)
            break;
            
         case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;

        case $.net.http.POST:
            var docReturn = fnHandlePostMenuFilho();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        default:
            $.response.status = $.net.http.METHOD_NOT_ALLOWED;
            $.response.setBody(JSON.stringify({message: "Método não permitido"}));
            break;
    }
} catch (err) {
    $.response.status = $.net.http.BAD_REQUEST;
    $.response.setBody(JSON.stringify({message: err.toString()}));
}