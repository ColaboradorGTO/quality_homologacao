var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}
function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInic = $.request.parameters.get("dataPesquisaInic");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var nuCodigoAutorizacao = $.request.parameters.get("nuCodigoAutorizacao");
    
    var query = ' SELECT ' + 
    '   tbdf.IDDETALHEFATURA,' +
    '   tbdf.IDEMPRESA,' +
    '   tbdf.IDFUNCIONARIO,' +
    '   tbdf.IDDETALHEFATURALOCAL,' +
    '   tbdf.IDCAIXAWEB,' +
    '   tbdf.IDCAIXALOCAL,' +
    '   tbdf.NUESTABELECIMENTO,' +
    '   tbdf.NUCARTAO,' +
    '   TO_VARCHAR(tbdf.DTPROCESSAMENTO,\'DD-MM-YYYY\') AS DTPROCESSAMENTO, ' +
    '   TO_VARCHAR(tbdf.HRPROCESSAMENTO,\'HH24:MI:SS\') AS HRPROCESSAMENTO, ' +
    '   tbdf.NUNSU,' +
    '   tbdf.NUNSUHOST,' +
    '   tbdf.NUCODAUTORIZACAO,' +
    '   tbdf.VRRECEBIDO,' +
    '   TO_VARCHAR(tbdf.DTHRMIGRACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTHRMIGRACAO, ' +
    '   tbdf.STCANCELADO,' +
    '   tbdf.IDUSRCACELAMENTO,' +
    '   tbf.NOFUNCIONARIO,' +
    '   tbc.DSCAIXA,' +
    '   tbdf.IDMOVIMENTOCAIXAWEB,' +
    '   tbdf.TXTMOTIVOCANCELAMENTO,' +
    '   tbdf.STPIX,' +
    '   tbdf.NUAUTORIZACAO,' +
    '   tbmc.ID AS IDMOVCAIXA,' +
    '   tbmc.STCONFERIDO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEFATURA tbdf' +
    '   INNER JOIN "VAR_DB_NAME".CAIXA tbc ON tbc.IDCAIXAWEB = tbdf.IDCAIXAWEB '+
    '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdf.IDFuncionario = tbf.IDFuncionario '+
    '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmc ON tbdf.IDMOVIMENTOCAIXAWEB = tbmc.ID '+
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbdf.IDDETALHEFATURA = \'' + byId + '\' ';
    }
    
    if ( nuCodigoAutorizacao ) {
        query = query + ' And  tbdf.NUCODAUTORIZACAO = \'' + nuCodigoAutorizacao + '\' ';
    }
    
    if(idDaEmpresa) {
        query = query + ' AND tbdf.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesquisaInic) {
            query = query + ' AND (tbdf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisaInic + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEFATURA" SET ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "IDFUNCIONARIO" = ?, ' + 
        ' "IDDETALHEFATURALOCAL" = ?, ' + 
        ' "IDCAIXAWEB" = ?, ' + 
        ' "IDCAIXALOCAL" = ?, ' + 
        ' "NUESTABELECIMENTO" = ?, ' + 
        ' "NUCARTAO" = ?, ' + 
        ' "DTPROCESSAMENTO" = ?, ' + 
        ' "HRPROCESSAMENTO" = ?, ' + 
        ' "NUNSU" = ?, ' + 
        ' "NUNSUHOST" = ?, ' + 
        ' "NUCODAUTORIZACAO" = ?, ' + 
        ' "VRRECEBIDO" = ?, ' + 
        ' "DTHRMIGRACAO" = ?, ' + 
        ' "STCANCELADO" = ?, ' + 
        ' "IDUSRCACELAMENTO" = ?, ' +
        ' "IDMOVIMENTOCAIXAWEB = ? ' +
    	' WHERE "IDDETALHEFATURA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDFUNCIONARIO);
        pStmt.setInt(3, registro.IDDETALHEFATURALOCAL);
        pStmt.setInt(4, registro.IDCAIXAWEB);
        pStmt.setInt(5, registro.IDCAIXALOCAL);
        pStmt.setString(6, registro.NUESTABELECIMENTO);
        pStmt.setString(7, registro.NUCARTAO);
        pStmt.setDate(8, registro.DTPROCESSAMENTO);
        pStmt.setTime(9, registro.HRPROCESSAMENTO);
        pStmt.setString(10, registro.NUNSU);
        pStmt.setString(11, registro.NUNSUHOST);
        pStmt.setString(12, registro.NUCODAUTORIZACAO);
        pStmt.setFloat(13, registro.VRRECEBIDO);
        pStmt.setDate(14, registro.DTHRMIGRACAO);
        pStmt.setString(15, registro.STCANCELADO);
        setIntOrNull(pStmt, 16, registro.IDUSRCACELAMENTO);
        pStmt.setString(17, registro.IDMOVIMENTOCAIXAWEB);
    	pStmt.setInt(18, registro.IDDETALHEFATURA);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}



function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    
    
    
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEFATURA" ' +
		" ( " +
		' "IDDETALHEFATURA", ' +
        ' "IDEMPRESA", ' +
        ' "IDFUNCIONARIO", ' +
        ' "IDDETALHEFATURALOCAL", ' +
        ' "IDCAIXAWEB", ' +
        ' "IDCAIXALOCAL", ' +
        ' "NUESTABELECIMENTO", ' +
        ' "NUCARTAO", ' +
        ' "DTPROCESSAMENTO", ' +
        ' "HRPROCESSAMENTO", ' +
        ' "NUNSU", ' +
        ' "NUNSUHOST", ' +
        ' "NUCODAUTORIZACAO", ' +
        ' "VRRECEBIDO", ' +
        ' "DTHRMIGRACAO", ' +
        ' "STCANCELADO", ' +
        ' "IDUSRCACELAMENTO", ' +
        ' "IDMOVIMENTOCAIXAWEB", '+
        ' "STPIX", '+
        ' "NUAUTORIZACAO" '+
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_DETALHEFATURA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var lstId = api.sqlQuery(' SELECT IDDETALHEFATURA FROM "VAR_DB_NAME"."DETALHEFATURA" WHERE IDEMPRESA='+bodyJson[0].IDEMPRESA+' AND VRRECEBIDO = '+bodyJson[0].VRRECEBIDO+' AND STCANCELADO = \'False\' AND DTPROCESSAMENTO = \''+ bodyJson[0].DTPROCESSAMENTO + '\' AND NUCODAUTORIZACAO = ? ', bodyJson[0].NUCODAUTORIZACAO);
	
	
	
    if(lstId.length > 0){
        return {
	        "msg": "Fatura Cadastrada!"
	    };
    }
  
	
	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setInt(2, registro.IDFUNCIONARIO);
        setIntOrNull(pStmt,3, registro.IDDETALHEFATURALOCAL);
        pStmt.setInt(4, registro.IDCAIXAWEB);
        setIntOrNull(pStmt,5, registro.IDCAIXALOCAL);
        pStmt.setString(6, registro.NUESTABELECIMENTO);
        pStmt.setString(7, registro.NUCARTAO);
        pStmt.setDate(8, registro.DTPROCESSAMENTO);
        pStmt.setTime(9, registro.HRPROCESSAMENTO);
        pStmt.setString(10, registro.NUNSU);
        pStmt.setString(11, registro.NUNSUHOST);
        pStmt.setString(12, registro.NUCODAUTORIZACAO);
        pStmt.setFloat(13, registro.VRRECEBIDO);
        setDateOrNull(pStmt,14, registro.DTHRMIGRACAO);
        pStmt.setString(15, registro.STCANCELADO);
        setIntOrNull(pStmt, 16, registro.IDUSRCACELAMENTO);
        pStmt.setString(17, registro.IDMOVIMENTOCAIXAWEB);
        pStmt.setString(18, registro.STPIX);
        pStmt.setString(19, registro.NUAUTORIZACAO);
    	
        pStmt.execute();
	}

	pStmt.close();

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
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
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