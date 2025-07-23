var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var numeroCfp = $.request.parameters.get("numeroCfp");
    
    if(!numeroCfp) {
        throw "O Camnpo Número do CPF é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' + 
    '   tbrv.IDVOUCHER,' +
    '   tbrv.IDEMPRESAORIGEM,' +
    '   tbrv.IDCAIXAORIGEM,' +
    '   tbrv.IDNFEDEVOLUCAO,' +
    '   TO_VARCHAR(tbrv.DTINVOUCHER,\'YYYY-MM-DD\') AS DTINVOUCHER, ' +
    '   tbrv.IDUSRINVOUCHER,' +
    '   tbrv.IDVENDEDOR,' +
    '   tbrv.IDCLIENTE,' +
    '   tbrv.VRVOUCHER,' +
    '   tbrv.IDEMPRESADESTINO,' +
    '   tbrv.IDCAIXADESTINO,' +
    '   tbrv.IDNFESAIDA,' +
    '   tbrv.DTOUTVOUCHER,' +
    '   TO_VARCHAR(tbrv.DTOUTVOUCHER,\'YYYY-MM-DD\') AS DTOUTVOUCHER, ' +
    '   tbrv.NUVOUCHER,' +
    '   tbrv.IDUSROUTVOUCHER,' +
    '   tbrv.STATIVO,' +
    '   tbrv.STCANCELADO,' +
    '   tbrv.DSMOTIVOCANCELAMENTO,' +
    '   tbrv.IDUSRCANCELAMENTO,' +
    '   tbrv.IDRESUMOVENDAWEB,' +
    '   tbc.DSNOMERAZAOSOCIAL,'+
    '   tbc.NUCPFCNPJ'+
	' FROM ' + 
    '   "VAR_DB_NAME".RESUMOVOUCHER tbrv' +
    '   INNER JOIN "VAR_DB_NAME".CLIENTE tbc ON tbc.IDCLIENTE = tbrv.IDCLIENTE ' +
    ' WHERE ' +
        '	1 = ? ' +
        '   and tbrv.STATIVO = \'True\'';
    
    if(numeroCfp) {
        query = query + ' AND tbc.NUCPFCNPJ = \'' + numeroCfp + '\' ';
    }

   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}