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

    var query2 = 'SELECT T.IDEMPRESA, '+
    ' T.NOFANTASIA, '+
    ' MAX(T.QTD_CLIENTE) AS QTD_CLIENTE, '+
    ' T.QTD_PRODUTO, '+
	' T.VRTOTALVENDA, '+
	' ROUND(T.VRCUSTOTOTAL,2) AS VRCUSTOTOTAL '+
    ' FROM ( '+
    ' SELECT DISTINCT '+
    ' VWV.IDEMPRESA AS IDEMPRESA, '+
    ' E.NOFANTASIA, '+
    ' DENSE_RANK() OVER (PARTITION BY VWV.IDEMPRESA ORDER BY VWV.IDVENDA ASC) AS QTD_CLIENTE, '+
	' SUM(VWV."QTD")OVER(PARTITION BY VWV.IDEMPRESA) as QTD_PRODUTO, '+
	' SUM(VWV."VRTOTALLIQUIDO")OVER(PARTITION BY VWV.IDEMPRESA) as VRTOTALVENDA, '+
	' SUM(VWV."PRECO_COMPRA")OVER(PARTITION BY VWV.IDEMPRESA) as VRCUSTOTOTAL '+
	' FROM "QUALITY_CONC_HML"."VW_VENDAS_PRODUTO_GRUPO_SUBGRUPO" VWV '+
	' INNER JOIN "QUALITY_CONC_HML".EMPRESA E ON VWV.IDEMPRESA = E.IDEMPRESA '+
	' INNER JOIN "QUALITY_CONC_HML".PRODUTO tbps ON VWV.CPROD = tbps.IDPRODUTO '+
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
        query2 = query2 + ' And  (UPPER(tbps.DSNOME) LIKE UPPER(\'%'+produto+'%\') OR tbps.NUCODBARRAS=\''+produto+'\' ) ';
    }
    
    if(uf > 0){
        query2 = query2 + ' AND VWV.SGUF=\''+uf+'\''; 
    }
    
    if (idFornecedor) {
		query2 = query2 + ' And  VWV.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + idFornecedor + '\') ';
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
	
		query2 = query2 + ' And  VWV.GRUPO IN (\'' + DSgrupoGrade + '\') ';
	}
	
	if (idgrade) {
		query2 = query2 + ' And  VWV.IDSUBGRUPO IN (' + idgrade + ') ';
	}
	
	if(idMarcaProduto){
	    query2 = query2 + ' And  VWV.IDMARCA IN (\'' + idMarcaProduto + '\') ';
	}
   
    
    query2 = query2 + ' ) AS T GROUP BY T.IDEMPRESA, T.NOFANTASIA, T.QTD_PRODUTO, T.VRTOTALVENDA,T.VRCUSTOTOTAL ';
    
    //return query2;
    
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