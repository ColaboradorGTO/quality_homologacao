var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var IDRESUMOALTERACAOPRECO;
var conn;

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    var dsGrpEstrutura = $.request.parameters.get("dsGrupoEstrutura");
    
    var query = `
        SELECT
            *
        FROM
            "VAR_DB_NAME".GRUPOESTRUTURA
        WHERE 
            1 = ?
    `;
    
    if(byId){
        query += ` AND IDGRUPOESTRUTURA = ${byId}`;
    }
    
    if(dsGrpEstrutura){
        query += ` AND DSGRUPOESTRUTURA = '${dsGrpEstrutura}'`;
    }
    
    query += `ORDER BY IDGRUPOESTRUTURA`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}