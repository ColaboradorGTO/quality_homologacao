var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idestrutura = $.request.parameters.get("idestrutura");
    var descprod = $.request.parameters.get("descprod");
    var codbarraprod = $.request.parameters.get("codbarraprod");
    var fornprodpromo = $.request.parameters.get("fornprodpromo");
    var fabprodpromo = $.request.parameters.get("fabprodpromo");
    var grupoestprodpromo = $.request.parameters.get("grupoestprodpromo");
        
        var query = ' SELECT ' + 
        '   tbpe.GRUPO,' +
        '   tbpe.IDSUBGRUPO,' +
        '   tbpe.SUBGRUPO,' +
        '   tbpe.IDPRODUTO,' +
        '   tbp.NUCODBARRAS,' +
        '   tbp.DSNOME' +
        ' FROM ' + 
        '   "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA tbpe' +
        '   INNER JOIN "VAR_DB_NAME"."PRODUTO" tbp on tbpe.IDPRODUTO = tbp.IDPRODUTO ' +
        ' WHERE ' +
            '	1 = ?' + 
            ' AND tbp.STATIVO=\'True\''; 
        
        if ( byId ) {
            query = query + ' And tbpe.IDSUBGRUPO = \'' + byId + '\' ';
        }
        
        if ( descprod ) {
            query = query + ' And (UPPER(tbp.DSNOME) LIKE UPPER(\'%'+descprod+'%\') ) ';
        }
        
        if ( codbarraprod ) {
            query = query + ' And (tbp.NUCODBARRAS = \''+codbarraprod+'\' ) ';
        }
        
        if ( fornprodpromo ) {
            query = query + '  And (tbpe.IDRAZAO_SOCIAL_FORNECEDOR = \''+fornprodpromo+'\' ) ';
        }
        
        if ( fabprodpromo ) {
            query = query + '  And (tbpe.IDMARCA = \''+fabprodpromo+'\') ';
        }
	
    	if(grupoestprodpromo) {
            var DSgrupoGrade = '';
            
            	 if(grupoestprodpromo === '1'){
            	     DSgrupoGrade = 'Verão';
            	 }
            	 if(grupoestprodpromo === '2'){
            	     DSgrupoGrade = 'Calçados/Acessórios';
            	 }
            	 if(grupoestprodpromo === '3'){
            	     DSgrupoGrade = 'Cama/Mesa/Banho';
            	 }
            	 if(grupoestprodpromo === '4'){
            	     DSgrupoGrade = 'Utilidades Do Lar';
            	 }
            	 if(grupoestprodpromo === '5'){
            	     DSgrupoGrade = 'Diversos';
            	 }
            	 if(grupoestprodpromo === '6'){
            	     DSgrupoGrade = 'Artigos Esportivos';
            	 }
            	 if(grupoestprodpromo === '7'){
            	     DSgrupoGrade = 'Cosméticos';
            	 }
            	 if(grupoestprodpromo === '8'){
            	     DSgrupoGrade = 'Acessórios';
            	 }
            	 if(grupoestprodpromo === '9'){
            	     DSgrupoGrade = 'Peças Íntimas';
            	 }
            	 if(grupoestprodpromo === '10'){ 
            	     DSgrupoGrade = 'Inverno';
            	 }
        	
    	        query = query + ' AND tbpe.GRUPO IN (\''+DSgrupoGrade+'\') ';
    	}
	
        if(idestrutura) {
            query = query + ' AND tbpe.IDSUBGRUPO IN (' + idestrutura + ') ';
        }

        query = query + ' ORDER BY tbp.DSNOME, tbp.NUCODBARRAS ';

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