var api = $.import("quality.concentrador_node.api.apiResponse", "int_api");
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
    var idMenuPai = $.request.parameters.get("idMenuPai")

    
        var query = `
            SELECT 
                ID,
                DSNOME,
                IDMENUPAI,
                URL
            FROM "VAR_DB_NAME"."MENUFILHO"
            WHERE 1 = ?
        `;

        var params = [];
        if(idMenuPai){
            query += `AND IDMENUPAI = '${idMenuPai}' `
        }
        if(byId){
            query += `AND IDMENUPAI = '${byId}' `
        }
        query += "ORDER BY ID";

        
        var request = {
            page: $.request.parameters.get("page"),
            pageSize: $.request.parameters.get("pageSize")
        };

         api.responseWithQuery(query, request, 1);


}

function fnHandlePostMenuFilho() {
    var conn = $.db.getConnection();

    try {
        var query = `
            INSERT INTO "VAR_DB_NAME"."MENUFILHO" ("ID", "DSNOME", "IDMENUPAI", "URL")
            VALUES (?, ?, ?, ?)
        `;
        
        var sqlFinal = api.replaceDbName(query);
        $.trace.debug("SQL gerado: " + sqlFinal);

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

            var linhas = pStmt.executeUpdate();
            $.trace.debug("Linhas afetadas: " + linhas);
        }

        pStmt.close();
        conn.commit();

        return {
            "msg": "Menu filho inserido com sucesso!",
            "objetoRecebido": registros
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