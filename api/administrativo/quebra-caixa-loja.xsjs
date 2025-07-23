var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    
    if(!idDaEmpresa) {
        throw "O Camnpo ID da Empresa é um parametro obrigatório !";
    }
    
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var queryDeQuebraCaixa = ' SELECT ' +
        '  dl.ID AS IDMOVCAIXAOP,  ' +
        '  IFNULL ( ( dl.VRFISICODINHEIRO ),0) AS VRFISICODINHEIRO,  ' +
        '  IFNULL ( ( dl.VRRECDINHEIRO ),0) AS VRRECDINHEIRO,  ' +
        '  IFNULL ( ( dl.VRAJUSTDINHEIRO ),0) AS VRRECDINHEIROAJUSTE  ' +
        ' FROM ' +
        '	"VAR_DB_NAME".MOVIMENTOCAIXA dl ' +
        ' WHERE ' +
        '	1 = ?'+
        '   and dl.STCANCELADO = \'False\''+
        '   and dl.STFECHADO = \'True\'';
    
    if(idDaEmpresa) {
        queryDeQuebraCaixa = queryDeQuebraCaixa + ' AND dl.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    
        if(dataPesquisa) {
            queryDeQuebraCaixa = queryDeQuebraCaixa + ' AND (dl.DTABERTURA  BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
        }
    }
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(queryDeQuebraCaixa, request, 1);
    
} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}