var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var idMarca = $.request.parameters.get("idGrupoEmpresarial");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var uf = $.request.parameters.get("uf");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var produto = $.request.parameters.get("descricaoProduto");
    var idgrupograde = $.request.parameters.get("idGrupoGrade");
    var idgrade = $.request.parameters.get("idGrade");
    var idMarcaProduto = $.request.parameters.get("idMarcaProduto");
    var dataPesqInicial = $.request.parameters.get("dataInicio"); 
    var dataPesqFinal = $.request.parameters.get("dataFim");

    var query2 = 'SELECT DISTINCT '+
    ' VWV.CPROD, '+
    ' P.NUCODBARRAS, '+
    ' P.DSNOME, '+
    ' SUM(VWV.QTD) AS QTD, '+
    ' ROUND(VWV.VUNCOM,2)VALOR_UNITARIO, '+
    ' (ROUND(VWV.VUNCOM,2)*SUM(VWV.QTD)) AS VALOR_TOTAL '+
	' FROM "QUALITY_CONC_HML"."VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO" VWV '+ 
	' INNER JOIN "QUALITY_CONC_HML".EMPRESA E ON VWV.IDEMPRESA = E.IDEMPRESA '+
	' INNER JOIN "QUALITY_CONC_HML".PRODUTO P ON VWV.CPROD = P.IDPRODUTO '+ 
	' WHERE 1=?';
    
    if(dataPesqInicial && dataPesqFinal){
        query2 = query2 + ' AND (VWV.DTHORAFECHAMENTO  BETWEEN \'' + dataPesqInicial + ' 00:00:00\' AND \'' + dataPesqFinal + ' 23:59:59\')';
    } 
    
    if(idMarca > 0){
        query2 = query2 + ' AND VWV.IDGRUPOEMPRESARIAL IN (' + idMarca + ') ';
    }
    
    if(idEmpresa){
       query2 = query2 + ' And  VWV.IDEMPRESA IN (' + idEmpresa + ') ';
    }
    
    if (produto) {
        query2 = query2 + ' And  (UPPER(P.DSNOME) LIKE UPPER(\'%'+produto+'%\') OR P.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf > 0){
        query2 = query2 + ' AND VWV.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query2 = query2 + ' And  VWV.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
	}
	
	if (idgrupograde) {
	 var lstIdgrupoGrade = idgrupograde.split(',');
	 var DSgrupoGrade = '';
	 var lstDSgrupoGrade = '';
	 
    	for(var i=0; i< lstIdgrupoGrade.length; i++){ 
    	 
        	 if(lstIdgrupoGrade[i] === '1'){
        	     DSgrupoGrade = 'Verão';
        	 }else if(lstIdgrupoGrade[i] === '2'){
        	     DSgrupoGrade = 'Calçados/Acessórios';
        	 }else if(lstIdgrupoGrade[i] === '3'){
        	     DSgrupoGrade = 'Cama/Mesa/Banho';
        	 }else if(lstIdgrupoGrade[i] === '4'){
        	     DSgrupoGrade = 'Utilidades Do Lar';
        	 }else if(lstIdgrupoGrade[i] === '5'){
        	     DSgrupoGrade = 'Diversos';
        	 }else if(lstIdgrupoGrade[i] === '6'){
        	     DSgrupoGrade = 'Artigos Esportivos';
        	 }else if(lstIdgrupoGrade[i] === '7'){
        	     DSgrupoGrade = 'Cosméticos';
        	 }else if(lstIdgrupoGrade[i] === '8'){
        	     DSgrupoGrade = 'Acessórios';
        	 }else if(lstIdgrupoGrade[i] === '9'){
        	     DSgrupoGrade = 'Peças Íntimas';
        	 }else if(lstIdgrupoGrade[i] === '10'){
        	     DSgrupoGrade = 'Inverno';
        	 }
        	 
        	 if(i==0){
        	     lstDSgrupoGrade = '\''+ DSgrupoGrade + '\'';
        	 }else{
        	     lstDSgrupoGrade = lstDSgrupoGrade +',\''+DSgrupoGrade + '\'';
        	 }
        	
    	}
    	
		query2 = query2 + ' And  VWV.GRUPO IN ('+ lstDSgrupoGrade+' ) ';
	}
	
	if (idgrade) {
		query2 = query2 + ' And  VWV.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
if(idMarcaProduto){
	    query2 = query2 + ' And  VWV.IDMARCA IN (' + idMarcaProduto + ') ';
	}
   
    
    query2 = query2 + ' GROUP BY VWV.CPROD, P.NUCODBARRAS, P.DSNOME,VWV.VUNCOM ';
     query2 = query2 + ' ORDER BY SUM(VWV.QTD) DESC ';
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query2, request, 1);
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