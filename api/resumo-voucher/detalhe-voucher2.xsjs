var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    
    if(!numeroVoucher) {
        throw "O Campo Número do Voucher é um parametro obrigatório !";
    }

    var query = ' SELECT ' +
       	'   tbrv.IDVOUCHER,  ' +
	    '   TO_VARCHAR(tbrv.DTINVOUCHER,\'DD-MM-YYYY\') AS DTINVOUCHER,  ' +
	    '   TO_VARCHAR(tbrv.DTOUTVOUCHER,\'DD-MM-YYYY\') AS DTOUTVOUCHER,  ' +
    	'   tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  ' +
    	'   tbcdestino.DSCAIXA AS DSCAIXADESTINO,  ' +
    	'   tbrv.NUVOUCHER,  ' +
    	'   tbrv.VRVOUCHER,  ' +
    	'   tbrv.STATIVO,  ' +
    	'   tbrv.STCANCELADO,  ' +
	    '   tbemporigem.NOFANTASIA AS EMPORIGEM, ' +
	    '   tbempdestino.NOFANTASIA AS EMPDESTINO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".RESUMOVOUCHER tbrv ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB ' +
        '	LEFT JOIN "VAR_DB_NAME".CAIXA tbcdestino ON tbrv.IDCAIXAORIGEM = tbcdestino.IDCAIXAWEB ' +
	    '	LEFT JOIN "VAR_DB_NAME".EMPRESA tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA ' +
	    '	LEFT JOIN "VAR_DB_NAME".EMPRESA tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?';
        
    if(numeroVoucher) {
        query = query + ' AND tbrv.NUVOUCHER = \'' + numeroVoucher + '\' ';
    
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