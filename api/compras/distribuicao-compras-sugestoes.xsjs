var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function ObterFilial(pIdEmpresa){

    var queryFilial = 'SELECT "IDEMPRESA", "NOFANTASIA" FROM "QUALITY_CONC"."EMPRESA" WHERE 1 = ? ' +
                      'AND "IDGRUPOEMPRESARIAL" = ' + pIdEmpresa + ' ORDER BY IDEMPRESA';
    var retFilial = api.sqlQuery(queryFilial, 1);

    var Str_Json = '[';

    for(var i = 0; i < retFilial.length; i++){ 
        if(i === 0){
            Str_Json = Str_Json + '{';
        }else{
            Str_Json = Str_Json + ',{';
        }
        Str_Json = Str_Json + '"IdFilial":' + retFilial[i].IDEMPRESA;
        Str_Json = Str_Json + ',"DescFilial":"' + retFilial[i].NOFANTASIA + '"}';
    }
    Str_Json = Str_Json + ']';
    return JSON.parse(Str_Json);
}

function ObterLinhasSugestao(pCodBarras, pNumPedido){

	var queryQtdSugestao =  'SELECT "IDDISTRIBUICAOCOMPRAS", "IDFILIAL", "QTDSUGESTAO", "QTDSUGESTAOALTERACAO" ' +
                            'FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRAS ' +
                            'WHERE 1 = ? ' +
		                    'AND "CODBARRAS" = \'' + pCodBarras + '\' ' +
		                    'AND "IDPEDIDOCOMPRA" = ' + pNumPedido + ' ';
    var retQtdSugestao = api.sqlQuery(queryQtdSugestao, 1);

    var Str_Json = '[';

    for(var i = 0; i < retQtdSugestao.length; i++){ 
        if(i === 0){
            Str_Json = Str_Json + '{';
        }else{
            Str_Json = Str_Json + ',{';
        }
    	Str_Json = Str_Json + '"IdDistribuicaoCompras":"' + retQtdSugestao[i].IDDISTRIBUICAOCOMPRAS + '"';
    	Str_Json = Str_Json + ',"IdFilial":"' + retQtdSugestao[i].IDFILIAL + '"';
    	Str_Json = Str_Json + ',"QtdSugestao":"' + retQtdSugestao[i].QTDSUGESTAO + '"';
    	Str_Json = Str_Json + ',"QtdSugestaoAlteracao":"' + retQtdSugestao[i].QTDSUGESTAOALTERACAO + '"}';
    }
    
    Str_Json = Str_Json + ']';
    return JSON.parse(Str_Json);
}

function fnHandleGet(byId) {

    var pIdEmpresa = $.request.parameters.get("idempresa");
    
	var query = 'SELECT DISTINCT "IDPEDIDOCOMPRA", "CODBARRAS", "DSPRODUTO", "PRECOVENDA", "GRADE", "QTDGRADE", "STCONCLUIDO" ' +
                'FROM "VAR_DB_NAME".DISTRIBUICAOCOMPRAS ' +
                'WHERE 1 = ? ';
	if(byId){
		query = query + 'AND IDPEDIDOCOMPRA = \'' + byId + '\' ';
	}
	var retDistribuicao = api.sqlQuery(query, 1);

	var data = [];
  
	for(var i = 0; i < retDistribuicao.length; i++){

        var registro = retDistribuicao[i];
        var distribuicao = {
            "IdPedidoCompra": registro.IDPEDIDOCOMPRA
            ,"IdEmpresa": pIdEmpresa
            ,"CodBarras": registro.CODBARRAS
            ,"DescProduto": registro.DSPRODUTO
            ,"PrecoVenda": registro.PRECOVENDA
            ,"Grade": registro.GRADE
            ,"QtdGrade": registro.QTDGRADE
            ,"StConcluido": registro.STCONCLUIDO
            ,"Filiais": ObterFilial(pIdEmpresa)
            ,"Sugestao": ObterLinhasSugestao(registro.CODBARRAS, byId)
        };
        data.push(distribuicao);
	}
    return data;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}