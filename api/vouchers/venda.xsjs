var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
     var nnf = $.request.parameters.get("nnf");
    var serie = $.request.parameters.get("serie");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var cpf = $.request.parameters.get("cpf");
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFim = $.request.parameters.get("dataFim");
    var codigoProduto = $.request.parameters.get("codigoProduto");
    
    var query = ' SELECT DISTINCT '+
	            '   TBV.IDVENDA, '+
                '	TBV.IDEMPRESA, '+
                '	TBV.VRRECDINHEIRO, '+
                '	TBV.VRRECCARTAO, '+
                '	TBV.VRRECCONVENIO, '+
                '	TBV.VRRECCHEQUE, '+
                '	TBV.VRRECPOS, '+
                '	TBV.VRRECVOUCHER, '+
                '	TBV.VRTOTALPAGO, '+
                '	TBV.VRTOTALVENDA, '+
                '	TBV.DTHORAFECHAMENTO, '+
                '	TBV.STCANCELADO, '+
                '	TBV.NUAUTPOS, '+
                '	TBV.NFE_INFNFE_IDE_MOD, '+
                '	TBV.NFE_INFNFE_IDE_SERIE, '+
                '	TBV.NFE_INFNFE_IDE_NNF, '+
                '	TBV.NFE_INFNFE_IDE_DHEMI, '+
                '	TBV.DEST_CNPJ, '+
                '	TBV.DEST_CPF, '+
                '	TBV.DEST_XNOME, '+
                '	TBV.DEST_XLGR, '+
                '	TBV.DEST_NRO, '+
                '	TBV.DEST_XCPL, '+
                '	TBV.DEST_XBAIRRO, '+
                '	TBV.DEST_CMUN, '+
                '	TBV.DEST_XMUN, '+
                '	TBV.DEST_UF, '+
                '	TBV.DEST_CEP, '+
                '	TBV.DEST_CPAIS, '+
                '	TBV.DEST_XPAIS, '+
                '	TBV.DEST_FONE, '+
                '	TBV.DEST_IE, '+
                '	TBV.DEST_ISUF, '+
                '	TBV.DEST_EMAIL '+
                'FROM "QUALITY_CONC_HML"."VENDA" TBV' +
                '	INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON TBVD.IDVENDA = TBV.IDVENDA ' +
                '	INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON TBP.IDPRODUTO = TBVD.CPROD ' +
                
                ' WHERE ' +
                '	1 = ? and TBV.STCANCELADO=\'False\'';
    
    if ( byId ) {
        query = query + ' And  TBV.IDVENDA = \'' + byId + '\' ';
    }
    
    if ( idEmpresa ) {
        query = query + ' And  TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(nnf && serie){
	    query = query + ' And TBV.NFE_INFNFE_IDE_NNF = \'' + nnf + '\' ';
	    query = query + ' And TBV.NFE_INFNFE_IDE_SERIE = \'' + serie + '\' ';
	}
	
	if(cpf){
	    query = query + ' And TBV.DEST_CPF = \'' + cpf + '\' ';
	}
	
	if(dataInicio && dataFim) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\')';
    }
    
    if ( codigoProduto ) {
        query = query + ' And  TBP.NUCODBARRAS = \'' + codigoProduto + '\' ';
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