let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idsOutlets = ['31','51','67','70','76','89','104','109','113','116'];

function montarResponse(response){
    let newArrayData = [];
    let { data } = response || [];
    
    for(let registro of data){
        let idEmpresa = registro.IDEMPRESA;
        let LISTA_ALVARAS = getAlvarasEmpresa(idEmpresa);
        let objEmpresa = Object.assign({}, registro, { LISTA_ALVARAS });
        
        newArrayData.push(objEmpresa);
    }
    
    response.data = newArrayData;
    
    return response;
}

function fnHandleGet(byId) {
    let stAtivo = $.request.parameters.get("stAtivo");
    
    let query = `
        SELECT
            IDSTATUS,
            DESCRICAO,
            STATIVO
        FROM
            "VAR_DB_NAME".STATUSANDAMENTOALVARA
        WHERE
            1 = ?
        `;
    
    if (byId) {
        query += `AND IDSTATUS = '${byId}' `;
    }

    if(stAtivo){
        query += `AND STATIVO = '${stAtivo}' `;
    }
    
    query += ' ORDER BY IDSTATUS ';
    
    let request = { 
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