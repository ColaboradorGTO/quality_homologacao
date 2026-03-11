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


function fnHandleGetMenuPai(byId) {
    var idMenuPai = $.request.parameters.get("idMenuPai")

    
        var query = `
            SELECT 
                IDMENU,
                STATIVO,
                IDMODULO,
                DSMENU
            FROM "VAR_DB_NAME"."MENUPAI"
            WHERE 1 = ?
        `;

        var params = [];
        if(idMenuPai){
            query += `AND IDMENUPAI = '${idMenuPai}' `
        }
        if(byId){
            query += `AND IDMODULO = '${byId}' `
        }
        //query += "ORDER BY ID";

        
        var request = {
            page: $.request.parameters.get("page"),
            pageSize: $.request.parameters.get("pageSize")
        };

         api.responseWithQuery(query, request, 1);


}

function fnHandlePutMenuFilho() {
    var conn = $.db.getConnection();

    try{
        var query = 
        `UPDATE "VAR_DB_NAME"."MENUFILHO"
            SET "DSNOME" = ?
            "URL" = ?
        WHERE "IDMENUPAI" = ?
            AND "ID" = ?
        `

        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        bodyJson = JSON.parse($.request.body.asString());

        for (var i = 0; i < bodyJson.length; i++) {
            var registro = bodyJson[i]

            pSmt.setInt(1, registro.ID);
            pSmt.setString(2, registro.DSNOME);
            pSmt.setInt(3, registro.IDMENUPAI);
            pSmt.setString(4, registro.URL);
        }

        pStmt.close();
        conn.commit();

        return {
                "msg": "Atualização menu filho realizada com sucesso!",
                "objetoRecebido": bodyJson
            };
            
    }catch(error){
        conn.rollback();
        throw e;
    }
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        case $.net.http.GET:
            var id =$.request.parameters.get("id");
            fnHandleGetMenuPai(id)
            break;

        case $.net.http.PUT:
            var docReturn = fnHandlePutMenuFilho();
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