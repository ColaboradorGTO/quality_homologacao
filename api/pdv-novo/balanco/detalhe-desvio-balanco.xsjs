var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    var idResumoDesvioBalanco = $.request.parameters.get("idResumoDesvioBalanco");
    var query = ' SELECT ' + 
    	' tbddb.IDDETALHEDESVIOBALANCO,' +
    	' tbddb.IDRESUMODESVIOBALANCO,' +
    	' tbddb.DOCUMENTENTRY,' +
    	' tbddb.LINENUMBER,' +
    	' tbddb.ITEMCODE,' +
    	' tbddb.ITEMDESCRIPTION,' +
    	' tbddb.FREEZE,' +
    	' tbddb.WAREHOUSECODE,' +
    	' tbddb.BINENTRY,' +
    	' tbddb.INWAREHOUSEQUANTITY,' +
    	' tbddb.COUNTED,' +
    	' tbddb.UOMCODE,' +
    	' tbddb.BARCODE,' +
    	' tbddb.UOMCOUNTEDQUANTITY,' +
    	' tbddb.ITEMSPERUNIT,' +
    	' tbddb.COUNTEDQUANTITY,' +
    	' tbddb.VARIANCE,' +
    	' tbddb.VARIANCEPERCENTAGE,' +
    	' tbddb.LINESTATUS,' +
    	' tbddb.COUNTERTYPE,' +
    	' tbddb.COUNTERID,' +
    	' tbddb.MULTIPLECOUNTERROLE' +
    
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEDESVIOBALANCO tbddb' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbddb.IDDETALHEDESVIOBALANCO = \'' + byId + '\' ';
    }
    
    if(idResumoDesvioBalanco){
        query = query + ' And  tbddb.IDRESUMODESVIOBALANCO = \'' + idResumoDesvioBalanco + '\' ';
    }
    
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