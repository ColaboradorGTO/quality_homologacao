var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId){
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var vlPreco = $.request.parameters.get("vlPreco");
    
    var query = 'SELECT '+
                '   "IDEMPRESA", '+ 
                '   "NOEMPRESA", '+
                '   "GRUPO", '+
                '   "IDSUBGRUPO", '+
                '   "DSSUBGRUPO", '+
                '   "IDPRODUTO", '+
                '   "DSNOME", '+
                '   "NUCODBARRAS", '+
                '   "PRECOCUSTO", '+
                '   "PRECOVENDA", '+
                '   "QTDENTRADA", '+
                '   "QTDSAIDA", '+
                '   "QTDVENDIDO", '+
                '   "QTDDEVOLVIDO", '+
                '   "QTDESTOQUE" '+
                'FROM "QUALITY_CONC_HML"."VW_PRODUTO_PRECO_LOJA_ESTOQUE" WHERE 1=? ';
    
    if(byId){
        query = query + ' and IDPRODUTO='+byId;
    }
    
    if(idEmpresa){
       query = query + ' And  IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if (produto) {
        query = query + ' And  (DSNOME LIKE \'%'+produto+'%\' OR NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if (idFornecedor) {
		query = query + ' And  v2.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
	}
	
	if (idgrupograde) {
	 var DSgrupoGrade = '';
	 if(idgrupograde === '1'){
	     DSgrupoGrade = 'Verão';
	 }else if(idgrupograde === '2'){
	     DSgrupoGrade = 'Calçados/Acessórios';
	 }else if(idgrupograde === '3'){
	     DSgrupoGrade = 'Cama/Mesa/Banho';
	 }else if(idgrupograde === '4'){
	     DSgrupoGrade = 'Utilidades Do Lar';
	 }else if(idgrupograde === '5'){
	     DSgrupoGrade = 'Diversos';
	 }else if(idgrupograde === '6'){
	     DSgrupoGrade = 'Artigos Esportivos';
	 }else if(idgrupograde === '7'){
	     DSgrupoGrade = 'Cosméticos';
	 }else if(idgrupograde === '8'){
	     DSgrupoGrade = 'Acessórios';
	 }else if(idgrupograde === '9'){
	     DSgrupoGrade = 'Peças Íntimas';
	 }else if(idgrupograde === '10'){
	     DSgrupoGrade = 'Inverno';
	 }
	
		query = query + ' And  GRUPO IN (\'' + DSgrupoGrade + '\') ';
	}
	
	if (idgrade) {
		query = query + ' And  IDSUBGRUPO IN (\'' + idgrade + '\') ';
	}
	
	if(vlPreco){
        query = query + ' and PRECOVENDA='+vlPreco;
    }

  //return {"query":query};              
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
	var response = api.sqlQueryPage(query, request, 1);
	var data = [];
   
	for (var i = 0; i < response.data.length; i++) { 

		var registro = response.data[i];
		
		var produtoEstoqueLoja = {
			"produto": {
				"IDEMPRESA":registro.IDEMPRESA,
                "NOEMPRESA":registro.NOEMPRESA,
                "GRUPO":registro.GRUPO,
                "IDSUBGRUPO":registro.IDSUBGRUPO,
                "DSSUBGRUPO":registro.DSSUBGRUPO,
                "IDPRODUTO":registro.IDPRODUTO,
                "DSNOME":registro.DSNOME,
                "NUCODBARRAS":registro.NUCODBARRAS,
                "PRECOCUSTO":registro.PRECOCUSTO,
                "PRECOVENDA":registro.PRECOVENDA,
                "QTDENTRADA":registro.QTDENTRADA,
                "QTDSAIDA":registro.QTDSAIDA,
                "QTDVENDIDO":registro.QTDVENDIDO,
                "QTDDEVOLVIDO":registro.QTDDEVOLVIDO,
                "QTDESTOQUE":registro.QTDESTOQUE
			}
		};

		data.push(produtoEstoqueLoja);

	}

	response.data = data;

	return response;
}



$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
       
       //Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}