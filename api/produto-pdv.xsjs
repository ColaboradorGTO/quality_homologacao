var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    var dsProduto = $.request.parameters.get("dsProduto");
    var stAtivo = $.request.parameters.get("stAtivo");
    
    if(!idEmpresa) {
        throw "O parametro IdEmpresa é um valor obrigatório.";
    }
    
    var query = ' SELECT DISTINCT' + 
    '   tbp.IDPRODUTO,' +
    '   tbp.IDGRUPOEMPRESARIAL,' +
    '   tbp.NUNCM,' +
    '   tbp.NUCEST,' +
    '   tbp.NUCST_ICMS,' +
    '   tbp.NUCFOP,' +
    '   tbp.PERC_OUT,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME,' +
    '   tbp.STGRADE,' +
    '   tbp.UND,' +
    //'   tbp.PRECOCUSTO,' +
    '  ( CASE WHEN IFNULL(tbp.PRECOCUSTO, 0) = 0 THEN 1 ELSE tbp.PRECOCUSTO END ) As PRECOCUSTO,' +
    //'   IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA) As PRECOVENDA,' +
    '   ( CASE WHEN IFNULL(tbpp.PRECO_VENDA, 0) = 0 THEN tbp.PRECOVENDA ELSE tbpp.PRECO_VENDA END ) As PRECOVENDA,' +
    '   tbp.QTDENTRADA,' +
    '   tbp.QTDCOMERCIALIZADA,' +
    '   tbp.QTDPERDA,' +
    '   tbp.QTDDISPONIVEL,' +
    '   (tbn.ImpEstadual * 10) AS PERCICMS, '+
    '   tbp.PERCISS,' +
    '   tbp.PERCPIS,' +
    '   tbp.PERCCOFINS,' +
    '   tbp.COD_CSOSN,' +
    '   tbp.PERCCSOSC,' +
    '   tbp.NUCST_IPI,' +
    '   tbp.NUCST_PIS,' +
    '   tbp.NUCST_COFINS,' +
    '   tbp.PERCIPI,' +
    '   TO_VARCHAR(tbp.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbp.STPESAVEL,' +
    '   tbp.GRP_MATERIAIS,' +
    '   (tbn.ImpEstadual * 10) AS PerICMS, '+
    '   \'\' as "GRUPO", '+
	'   IFNULL(tbp.IDSUBGRUPO,0) as "IDSUBGRUPO", '+
	'   tbse.DSSUBGRUPOESTRUTURA as "SUBGRUPO", '+
	'   0 as "IDMARCA", '+
	'   \'\' as "MARCA", '+
	'   0 as "IDRAZAO_SOCIAL_FORNECEDOR", '+
	'    \'\' as "RAZAO_SOCIAL_FORNECEDOR" '+
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' ;
    if(idEmpresa ==='31' || idEmpresa ==='51' || idEmpresa ==='67' || idEmpresa ==='89' || idEmpresa ==='76' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86' || idEmpresa ==='16' || idEmpresa ==='116'){
        if(idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='51' || idEmpresa ==='67' || idEmpresa ==='89' || idEmpresa ==='76' || idEmpresa ==='116'){
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 2 ';
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='5' || idEmpresa ==='86') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 4 ';
        }else if(idEmpresa ==='70' || idEmpresa ==='16') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 2 OR tbp.IDGRUPOEMPRESARIAL = 4';
        }else{
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on (tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 )';
        }
    }else{
        query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 ';
    }
    query = query  +
    '   INNER JOIN "VAR_DB_NAME".NCM tbn on tbp.NUNCM = tbn.NUNCM AND tbe.SGUF = tbn.SGUF ' +
    '   LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO tbpp on tbpp.IDPRODUTO = tbp.IDPRODUTO AND tbpp.IDEMPRESA =\''+idEmpresa+ '\' '+
    '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA tbse on tbse.IDSUBGRUPOESTRUTURA = tbp.IDSUBGRUPO '+
    //'   INNER JOIN "QUALITY_CONC".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM on TBPEM.IDPRODUTO = tbp.IDPRODUTO ' +
    ' WHERE ' +
        '	1 = ?'+
        //' And  tbe.IDEMPRESA = \'' + idEmpresa + '\' And tbp.STATIVO = \'True\' ';
        ' And  tbe.IDEMPRESA = \'' + idEmpresa + '\' ';
    if ( byId ) {
        query = query + ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.DSNOME, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }
    
    if ( stAtivo ) {
        query = query + ' And  tbp.STATIVO = \'' + stAtivo + '\' ';
    }else{
        query = query + ' And tbp.STATIVO = \'True\' ';  
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}