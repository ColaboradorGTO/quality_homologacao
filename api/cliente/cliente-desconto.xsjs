var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
var cpf = $.request.parameters.get("cpf");

var data = new Date(); 
    //data.setDate(data.getDate() - 1);
    //var priorDate = new Date(new Date().setDate(data.getDate() + 30));
    
    var dataVer = data.getDate()+'.'+(data.getMonth()+1)+'.'+data.getFullYear();
    //var dataFinal = priorDate.getDate()+'.'+(priorDate.getMonth()+1)+'.'+priorDate.getFullYear();
    //var dataVer = '30.11.2023';

    //	$.response.contentType = 'application/json';
	//	$.response.setBody(JSON.stringify(dataInicial+"///"+dataFinal));
	//	$.response.status = $.net.http.OK;
	//	return;
var query = ' SELECT ' + 
    '   tbcd.IDCLIENTEDESCONTO,' +
    '   tbcd.NUCPF,' +
    '   tbcd.NOCLIENTE,' +
    '   IFNULL(tbcd.PERCDESC,0) as PERCDESC,' +
    '   TO_VARCHAR(tbcd.DTINICIODESC,\'YYYY-MM-DD HH:MM:SS\') as DTINICIODESC,' +
    '   TO_VARCHAR(tbcd.DTFIMDESC,\'YYYY-MM-DD HH:MM:SS\') as DTFIMDESC,' +
    '   tbcd.TXTMOTIVO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CLIENTEDESCONTO tbcd' +
    ' WHERE ' +
        '	1 = ? '+
        '   and tbcd.DTINICIODESC <= \''+ dataVer +'\' and tbcd.DTFIMDESC >= \''+ dataVer+'\'';
    
    if ( byId ) {
        query = query + ' And  tbcd.IDCLIENTEDESCONTO = \'' + byId + '\' ';
    }
    
    if(cpf) {
        query = query + ' And  tbcd.NUCPF = \'' + cpf + '\' ';
    }
    
    query = query + 'order by tbcd.IDCLIENTEDESCONTO';
    
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

        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
 
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}