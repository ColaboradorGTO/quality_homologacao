var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(data, session) {
    
    slApi.post('/Manufacturers',data,session);
    return 'True';
}

function atualizaMigracaoFabricante(idFabricante, idSap){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."FABRICANTE" SET' +
		'  IDSAP = ?, '+
		'  STMIGRADOSAP = \'True\''+
		' WHERE IDFABRICANTE = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idSap.toString());
	pStmt.setInt(2, parseInt(idFabricante));
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function executeFabricante(){
   
    var query = 'SELECT '+
        		'T1."IDFABRICANTE", '+
            	'T1."DSFABRICANTE", '+
            	'T1."DTCADASTRO", '+
            	'T1."DTULTATUALIZACAO", '+
            	'T1."STATIVO", '+
            	'T1."IDSAP", '+
            	'T1."STMIGRADOSAP" '+
                ' FROM "QUALITY_CONC_HML"."FABRICANTE" T1 '+
               	'WHERE  1=? AND' +
        		' T1."IDSAP" is NULL AND (T1.STMIGRADOSAP = \'False\' OR T1.STMIGRADOSAP IS NULL) ';
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
	
		var Str_Json = '{"ManufacturerName": "'+ det.DSFABRICANTE+'"'+
		    ',"U_MarcaCod":'+ parseInt(det.IDFABRICANTE)+
            '}';
        
       
       	if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		} 
       postSl(JSON.parse(Str_Json),session);
       var resultMigracao = api.sqlQuery('select "FirmCode" AS MARCACOD from "SBO_GTO_TESTE1".OMRC where 1=? AND "U_MarcaCod" = '+ parseInt(det.IDFABRICANTE), 1);
	   if(resultMigracao.length > 0)
	   {
	       //return resultMigracao[0].MARCACOD;
	       atualizaMigracaoFabricante(det.IDFABRICANTE, resultMigracao[0].MARCACOD);
	   }
	   
		//lines.push(JSON.parse(Str_Json));
		//lines.push(Str_Json);
	}
    return 'Migração Fabricante realizada com sucesso!';
	//return postSl(lines,'true');
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executeFabricante();
                 $.response.setBody(JSON.stringify({ result : doc }));
                break;
                
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}

