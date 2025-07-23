var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
     var idResumoBalanco = $.request.parameters.get("idResumoBalanco");
    var query = ' SELECT ' + 
    '   tbrdb.IDRESUMODESVIOBALANCO,' +
	'   tbrdb.DOCUMENTENTRY,' +
	'   tbrdb.DOCUMENTNUMBER,' +
	'   tbrdb.SERIES,' +
	'   tbrdb.COUNTDATE,' +
	'   tbrdb.COUNTTIME,' +
	'   tbrdb.SINGLECOUNTERTYPE,' +
	'   tbrdb.SINGLECOUNTERID,' +
	'   tbrdb.DOCUMENTSTATUS,' +
	'   tbrdb.REMARKS,' +
	'   tbrdb.REFERENCE2,' +
	'   tbrdb.BRANCHID,' +
	'   tbrdb.DOCOBJECTCODEEX,' +
	'   tbrdb.FINANCIALPERIOD,' +
	'   tbrdb.PERIODINDICATOR,' +
	'   tbrdb.COUNTINGTYPE,' +
	'   tbrdb.IDRESUMOBALANCO'+
    ' FROM ' + 
    '   "VAR_DB_NAME".RESUMODESVIOBALANCO tbrdb' +
    ' WHERE ' +
        '	1 = ? ';
    
    if ( byId ) {
        query = query + ' And  tbrdb.IDRESUMODESVIOBALANCO = \'' + byId + '\' ';
    }
    
    if ( idResumoBalanco ) {
        query = query + ' And  tbrdb.IDRESUMOBALANCO = \'' + idResumoBalanco + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnIncluirDetalhes(conn, lstDetalhe, idResumoDesvioBalanco) {
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEDESVIOBALANCO" ' +
		" ( " +
		' "IDRESUMODESVIOBALANCO", ' +
    	' "DOCUMENTENTRY", ' +
    	' "LINENUMBER", ' +
    	' "ITEMCODE", ' +
    	' "ITEMDESCRIPTION", ' +
    	' "FREEZE", ' +
    	' "WAREHOUSECODE", ' +
    	' "BINENTRY", ' +
    	' "INWAREHOUSEQUANTITY", ' +
    	' "COUNTED", ' +
    	' "UOMCODE", ' +
    	' "BARCODE", ' +
    	' "UOMCOUNTEDQUANTITY", ' +
    	' "ITEMSPERUNIT", ' +
    	' "COUNTEDQUANTITY", ' +
    	' "VARIANCE", ' +
    	' "VARIANCEPERCENTAGE", ' +
    	' "LINESTATUS", ' +
    	' "COUNTERTYPE", ' +
    	' "COUNTERID", ' +
    	' "MULTIPLECOUNTERROLE" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	for (var i = 0; i < lstDetalhe.length; i++) {
        
		var registro = lstDetalhe[i];
		
		pStmt.setInt(1, idResumoDesvioBalanco);
    	pStmt.setInt(2, registro.DOCUMENTENTRY);
    	pStmt.setInt(3, registro.LINENUMBER);
    	pStmt.setString(4, registro.ITEMCODE);
    	pStmt.setString(5, registro.ITEMDESCRIPTION);
    	pStmt.setString(6, registro.FREEZE);
    	pStmt.setString(7, registro.WAREHOUSECODE);
    	pStmt.setInt(8, registro.BINENTRY);
    	pStmt.setFloat(9, registro.INWAREHOUSEQUANTITY);
    	pStmt.setString(10, registro.COUNTED);
    	pStmt.setString(11, registro.UOMCODE);
    	pStmt.setString(12, registro.BARCODE);
    	pStmt.setFloat(13, registro.UOMCOUNTEDQUANTITY);
    	pStmt.setFloat(14, registro.ITEMSPERUNIT);
    	pStmt.setFloat(15, registro.COUNTEDQUANTITY);
    	pStmt.setFloat(16, registro.VARIANCE);
    	pStmt.setFloat(17, registro.VARIANCEPERCENTAGE);
    	pStmt.setString(18, registro.LINESTATUS);
    	pStmt.setString(19, registro.COUNTERTYPE);
    	pStmt.setInt(20, registro.COUNTERID);
    	pStmt.setString(21, registro.MULTIPLECOUNTERROLE);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
	
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    var bodyJson = JSON.parse($.request.body.asString());
    
    var idResumoDesvioBalanco = api.sqlQuery(' SELECT IDRESUMODESVIOBALANCO FROM "VAR_DB_NAME"."RESUMODESVIOBALANCO" WHERE IDRESUMOBALANCO = ? ', bodyJson[0].IDRESUMOBALANCO);
    
    if(idResumoDesvioBalanco.length === 0){
        
        var queryId = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMODESVIOBALANCO")),0) + 1 FROM "VAR_DB_NAME"."RESUMODESVIOBALANCO" WHERE 1 = ? ', 1);
        
        
        var query = 'INSERT INTO "VAR_DB_NAME"."RESUMODESVIOBALANCO" ' +
		" ( " +
		' "DOCUMENTENTRY",' +
    	' "DOCUMENTNUMBER",' +
    	' "SERIES",' +
    	' "COUNTDATE",' +
    	' "COUNTTIME",' +
    	' "SINGLECOUNTERTYPE",' +
    	' "SINGLECOUNTERID",' +
    	' "DOCUMENTSTATUS",' +
    	' "REMARKS",' +
    	' "REFERENCE2",' +
    	' "BRANCHID",' +
    	' "DOCOBJECTCODEEX",' +
    	' "FINANCIALPERIOD",' +
    	' "PERIODINDICATOR",' +
    	' "COUNTINGTYPE",' +
    	' "IDRESUMOBALANCO"' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
    		
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
    	
    	for (var i = 0; i < bodyJson.length; i++) {
            
    		var registro = bodyJson[i];
    		
    		pStmt.setInt(1, registro.DOCUMENTENTRY);
        	pStmt.setInt(2, registro.DOCUMENTNUMBER);
        	pStmt.setInt(3, registro.SERIES);
        	pStmt.setDate(4, registro.COUNTDATE);
        	pStmt.setTime(5, registro.COUNTTIME);
        	pStmt.setString(6, registro.SINGLECOUNTERTYPE);
        	pStmt.setInt(7, registro.SINGLECOUNTERID);
        	pStmt.setString(8, registro.DOCUMENTSTATUS);
        	pStmt.setString(9, registro.REMARKS);
        	pStmt.setString(10, registro.REFERENCE2);
        	pStmt.setInt(11, registro.BRANCHID);
        	pStmt.setString(12, registro.DOCOBJECTCODEEX);
        	pStmt.setInt(13, registro.FINANCIALPERIOD);
        	pStmt.setString(14, registro.PERIODINDICATOR);
        	pStmt.setString(15, registro.COUNTINGTYPE);
        	pStmt.setInt(16, registro.IDRESUMOBALANCO);
        
        	fnIncluirDetalhes(conn, registro.det, queryId);
            pStmt.execute();
            pStmt.close();
	    }
    }else{
        fnIncluirDetalhes(conn, bodyJson[0].det, parseInt(idResumoDesvioBalanco[0].IDRESUMODESVIOBALANCO));
    }



	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
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
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}