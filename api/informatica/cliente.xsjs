var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = parseInt($.request.parameters.get("idmarca"));
    var idFilial = parseInt($.request.parameters.get("idloja"));
    var descCliente = $.request.parameters.get("dscliente");
    var nuCpfCnpj = $.request.parameters.get("idcpfcnpj");
    var tpCliente = $.request.parameters.get("idtipocliente");
    var status = $.request.parameters.get("idstatus");

    var query = ' SELECT ' +
                '   c.IDCLIENTE, c.IDEMPRESA, LTRIM(RTRIM(c.DSNOMERAZAOSOCIAL)) AS DSNOMERAZAOSOCIAL, c.DSAPELIDONOMEFANTASIA, c.TPCLIENTE ' +
                '   ,c.NUCPFCNPJ, c.NURGINSCESTADUAL, c.NUINSCMUNICIPAL, c.NUINSCRICAOSUFRAMA, c.TPINDICADORINSCESTADUAL ' +
                '   ,c.STOPTANTESIMPLES, c.NUCEP, c.NUIBGE, c.EENDERECO, c.NUENDERECO ' +
                '   ,c.ECOMPLEMENTO, c.EBAIRRO, c.ECIDADE, c.SGUF, LTRIM(RTRIM(c.EEMAIL)) AS EEMAIL ' +
                '   ,c.NUTELCOMERCIAL, c.NUTELCELULAR, c.DSOBSERVACAO, c.NOCONTATOCLIENTE01, c.EEMAILCONTATOCLIENTE01 ' +
                '   ,c.FONECONTATOCLIENTE01, c.DSCARGOCONTATOCLIENTE01, c.NOCONTATOCLIENTE02, c.EEMAILCONTATOCLIENTE02, c.FONECONTATOCLIENTE02 ' +
                '   ,c.DSCARGOCONTATOCLIENTE02, c.STATIVO ' +
                '   ,IFNULL(TO_VARCHAR(c.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTULTALTERACAO ' +
                '   ,IFNULL(TO_VARCHAR(c.DTULTALTERACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTULTALTERACAOFORMATADA ' +
                '   ,IFNULL(TO_VARCHAR(c.DTNASCFUNDACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTNASCFUNDACAO ' +
                '   ,IFNULL(TO_VARCHAR(c.DTNASCFUNDACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTNASCFUNDACAOFORMATADA ' +
                '   ,e.NOFANTASIA ' +
                ' FROM "VAR_DB_NAME".CLIENTE c ' +
                ' INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = c.IDEMPRESA ' +
                ' WHERE 1 = ? ';
    if ( byId ) {
        query = query + ' AND c.IDCLIENTE = \'' + byId + '\' ';
    }
    if ( idEmpresa ) {
        query = query + ' AND e.IDGRUPOEMPRESARIAL = \'' + idEmpresa + '\' ';
    }
    if ( idFilial ) {
        query = query + ' AND c.IDEMPRESA = \'' + idFilial + '\' ';
    }
    if ( descCliente ) {
        query = query + ' AND UPPER(c.DSNOMERAZAOSOCIAL) LIKE UPPER(\'%' + descCliente + '%\') ';
    }
    if ( nuCpfCnpj ) {
        query = query + ' AND c.NUCPFCNPJ LIKE (\'%' + nuCpfCnpj + '%\') ';
    }
    if ( tpCliente ) {
        query = query + ' AND c.TPCLIENTE = \'' + tpCliente + '\' ';
    }
    if ( status ) {
        query = query + ' AND c.STATIVO = \'' + status + '\' ';
    }

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/
    
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

        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;*/

        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;*/

        default:
            break;
    }

} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}