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


function fnHandlePut() {
    var conn = $.db.getConnection();
    var bodyJson;
    try {
        var query = ` 
            UPDATE "VAR_DB_NAME"."RESUMOPROMOCAOMARKETING"
                SET "STATIVO" = ? 
            WHERE "IDRESUMOPROMOCAOMARKETING" = ? 
        `;

        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        bodyJson = JSON.parse($.request.body.asString());

        for (var i = 0; i < bodyJson.length; i++) {
            var registro = bodyJson[i];

            // Atualização principal
            pStmt.setString(1, registro.STATIVO);
            pStmt.setInt(2, registro.IDRESUMOPROMOCAOMARKETING);
            pStmt.execute();
        }

        pStmt.close();
        conn.commit();

        return {
            "msg": "Atualização Status da promoção realizada com sucesso!",
            "objetoRecebido": bodyJson
        };
    } catch (e) {
        conn.rollback();
        throw e;
    }
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
         case $.net.http.PUT:
            var doc = fnHandlePut();
            $.response.setBody(JSON.stringify(doc));
            break;         
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}
