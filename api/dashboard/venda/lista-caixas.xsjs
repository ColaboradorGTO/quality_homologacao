var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataFechamento = $.request.parameters.get("dataFechamento");
    
    var query = ' SELECT ' +
        '   tbc.IDCAIXAWEB, ' +
    	'   tbc.DSCAIXA, ' +
    	'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
    	'   tbf.NOFUNCIONARIO, ' +
    	'   SUM( tbv.VRRECDINHEIRO - tbv.VRTROCO ) AS TOTALVENDIDODINHEIRO, ' +
    	'   SUM( tbv.VRRECCARTAO ) AS TOTALVENDIDOCARTAO, ' +
    	'   SUM( tbv.VRRECPOS ) AS TOTALVENDIDOPOS, ' +
    	'   SUM( tbv.VRRECVOUCHER ) AS TOTALVENDIDOVOUCHER, ' +
    	'   SUM( tbv.VRTOTALPAGO - tbv.VRRECVOUCHER ) AS TOTALVENDIDO,  ' +
    	'   SUM( tbv.VRRECCONVENIO) AS TOTALVENDIDOCONVENIO  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        '   LEFT JOIN "VAR_DB_NAME".CAIXA tbc ON tbv.IDCAIXAWEB = tbc.IDCAIXAWEB ' +
	    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbv.IDOPERADOR = tbf.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and tbv.STCANCELADO = \'False\'';
    
    if(idEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (tbv.DTHORAFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }
    
    query = query + 'GROUP BY tbv.IDCAIXAWEB, tbv.IDOPERADOR, tbc.IDCAIXAWEB, tbc.DSCAIXA, tbv.DTHORAFECHAMENTO, tbf.NOFUNCIONARIO ';
    
    
    
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