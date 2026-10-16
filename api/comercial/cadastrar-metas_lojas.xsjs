var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {

    var idgrupoempresa = $.request.parameters.get("idgrupoempresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    var query =  ' SELECT ' +
                '   tbml.IDMETASLOJA, ' +
                '   tbml.DTMETAINICIO, ' +
                '   tbml.DTMETAFIM, ' +
                '   tbml.IDGRUPOEMPRESA, ' +
                '   tbml.IDEMPRESA, ' +
                '   emp.NOFANTASIA, ' +
                '   tbml.IDFUNCIONARIO, ' +
                '   func.NOFUNCIONARIO, ' +
                '   tbml.VRVENDAGERAL, ' +
                '   tbml.PERCMETAVENDAGERAL, ' +
                '   tbml.VRMETAVENDAGERAL, ' +
                '   tbml.VRVENDACALCADOS, ' +
                '   tbml.PERCVENDACALCADOS, ' +
                '   tbml.VRMETAVENDACALCADOS, ' +
                '   tbml.PERCMETAVENDACALCADOS, ' +
                '   tbml.VRVENDAFEMVERINV, ' +
                '   tbml.PERCVENDAFEMVERINV, ' +
                '   tbml.VRMETAVENDAFEMVERINV, ' +
                '   tbml.PERCMETAVENDAFEMVERINV, ' +
                '   tbml.VRVENDAFEMPCINTIMA, ' +
                '   tbml.PERCVENDAFEMPCINTIMA, ' +
                '   tbml.VRMETAVENDAFEMPCINTIMA, ' +
                '   tbml.PERCMETAVENDAFEMPCINTIMA, ' +
                '   tbml.VRVENDAFEMACESSORIOS, ' +
                '   tbml.PERCVENDAFEMACESSORIOS, ' +
                '   tbml.VRMETAVENDAFEMACESSORIOS, ' +
                '   tbml.PERCMETAVENDAFEMACESSORIOS, ' +
                '   tbml.VRVENDAMASCVERINV, ' +
                '   tbml.PERCVENDAMASCVERINV, ' +
                '   tbml.VRMETAVENDAMASCVERINV, ' +
                '   tbml.PERCMETAVENDAMASCVERINV, ' +
                '   tbml.VRVENDAMASCPCINTIMA, ' +
                '   tbml.PERCVENDAMASCPCINTIMA, ' +
                '   tbml.VRMETAVENDAMASCPCINTIMA, ' +
                '   tbml.PERCMETAVENDAMASCPCINTIMA, ' +
                '   tbml.VRVENDAMASCACESSORIOS, ' +
                '   tbml.PERCVENDAMASCACESSORIOS, ' +
                '   tbml.VRMETAVENDAMASCACESSORIOS, ' +
                '   tbml.PERCMETAVENDAMASCACESSORIOS, ' +
                '   tbml.VRVENDAINFANTVERINV, ' +
                '   tbml.PERCVENDAINFANTVERINV, ' +
                '   tbml.VRMETAVENDAINFANTVERINV, ' +
                '   tbml.PERCMETAVENDAINFANTVERINV, ' +
                '   tbml.VRVENDAINFANTPCINTIMA, ' +
                '   tbml.PERCVENDAINFANTPCINTIMA, ' +
                '   tbml.VRMETAVENDAINFANTPCINTIMA, ' +
                '   tbml.PERCMETAVENDAINFANTPCINTIMA, ' +
                '   tbml.VRVENDAINFANTACESSORIOS, ' +
                '   tbml.PERCVENDAINFANTACESSORIOS, ' +
                '   tbml.VRMETAVENDAINFANTACESSORIOS, ' +
                '   tbml.PERCMETAVENDAINFANTACESSORIOS, ' +
                '   tbml.VRVENDACMB, ' +
                '   tbml.PERCVENDACMB, ' +
                '   tbml.VRMETAVENDACMB, ' +
                '   tbml.PERCMETAVENDACMB, ' +
                '   tbml.VRMETAVENDAOUTROS, ' +
                '   tbml.PERCMETAVENDAOUTROS, ' +
                '   tbml.PERCTOTALVENDA, ' +
                '   tbml.STATIVO, ' +
                '   tbml.STSALVO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".METASLOJAS tbml ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA emp ON tbml.IDEMPRESA = emp.IDEMPRESA  ' +
        '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO func ON tbml.IDFUNCIONARIO = func.IDFUNCIONARIO  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbml.STATIVO = \'True\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDGRUPOEMPRESA = \'' + byId + '\' ';
    }
    if ( idgrupoempresa ) {
        query = query + ' And  tbdp.IDGRUPOEMPRESA = \'' + idgrupoempresa + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTMETAINICIO = \'' + dataPesquisaInicio + '\' AND  tbdp.DTMETAFIM = \'' + dataPesquisaFim + '\') ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."METASLOJAS" SET ' +
                '   "DTMETAINICIO"=  ?, ' + 
                '   "DTMETAFIM"=  ?, ' + 
                '   "IDGRUPOEMPRESA"=  ?, ' + 
                '   "IDEMPRESA"=  ?, ' + 
                '   "IDFUNCIONARIO"=  ?, ' + 
                '   "VRVENDAGERAL"=  ?, ' + 
                '   "VRMETAVENDAGERAL"=  ?, ' + 
                '   "VRVENDACALCADOS"=  ?, ' + 
                '   "PERCVENDACALCADOS"=  ?, ' + 
                '   "VRMETAVENDACALCADOS"=  ?, ' + 
                '   "PERCMETAVENDACALCADOS"=  ?, ' + 
                '   "VRVENDAFEMVERINV"=  ?, ' + 
                '   "PERCVENDAFEMVERINV"=  ?, ' + 
                '   "VRMETAVENDAFEMVERINV"=  ?, ' + 
                '   "PERCMETAVENDAFEMVERINV"=  ?, ' + 
                '   "VRVENDAFEMPCINTIMA"=  ?, ' + 
                '   "PERCVENDAFEMPCINTIMA"=  ?, ' + 
                '   "VRMETAVENDAFEMPCINTIMA"=  ?, ' + 
                '   "PERCMETAVENDAFEMPCINTIMA"=  ?, ' + 
                '   "VRVENDAFEMACESSORIOS"=  ?, ' + 
                '   "PERCVENDAFEMACESSORIOS"=  ?, ' + 
                '   "VRMETAVENDAFEMACESSORIOS"=  ?, ' + 
                '   "PERCMETAVENDAFEMACESSORIOS"=  ?, ' + 
                '   "VRVENDAMASCVERINV"=  ?, ' + 
                '   "PERCVENDAMASCVERINV"=  ?, ' + 
                '   "VRMETAVENDAMASCVERINV"=  ?, ' + 
                '   "PERCMETAVENDAMASCVERINV"=  ?, ' + 
                '   "VRVENDAMASCPCINTIMA"=  ?, ' + 
                '   "PERCVENDAMASCPCINTIMA"=  ?, ' + 
                '   "VRMETAVENDAMASCPCINTIMA"=  ?, ' + 
                '   "PERCMETAVENDAMASCPCINTIMA"=  ?, ' + 
                '   "VRVENDAMASCACESSORIOS"=  ?, ' + 
                '   "PERCVENDAMASCACESSORIOS"=  ?, ' + 
                '   "VRMETAVENDAMASCACESSORIOS"=  ?, ' + 
                '   "PERCMETAVENDAMASCACESSORIOS"=  ?, ' + 
                '   "VRVENDAINFANTVERINV"=  ?, ' + 
                '   "PERCVENDAINFANTVERINV"=  ?, ' + 
                '   "VRMETAVENDAINFANTVERINV"=  ?, ' + 
                '   "PERCMETAVENDAINFANTVERINV"=  ?, ' + 
                '   "VRVENDAINFANTPCINTIMA"=  ?, ' + 
                '   "PERCVENDAINFANTPCINTIMA"=  ?, ' + 
                '   "VRMETAVENDAINFANTPCINTIMA"=  ?, ' + 
                '   "PERCMETAVENDAINFANTPCINTIMA"=  ?, ' + 
                '   "VRVENDAINFANTACESSORIOS"=  ?, ' + 
                '   "PERCVENDAINFANTACESSORIOS"=  ?, ' + 
                '   "VRMETAVENDAINFANTACESSORIOS"=  ?, ' + 
                '   "PERCMETAVENDAINFANTACESSORIOS"=  ?, ' + 
                '   "VRVENDACMB"=  ?, ' + 
                '   "PERCVENDACMB"=  ?, ' + 
                '   "VRMETAVENDACMB"=  ?, ' + 
                '   "PERCMETAVENDACMB"=  ?, ' + 
                '   "VRMETAVENDAOUTROS"=  ?, ' + 
                '   "PERCMETAVENDAOUTROS"=  ?, ' + 
                '   "PERCTOTALVENDA"=  ?, ' + 
                '   "STATIVO"=  ?, ' + 
                '   "STSALVO"=  ? ' + 
        ' WHERE "IDMETASLOJA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		
            pStmt.setDate(1, registro.DTMETAINICIO);
            pStmt.setDate(2, registro.DTMETAFIM);
            pStmt.setInt(3, registro.IDGRUPOEMPRESA);
            pStmt.setInt(4, registro.IDEMPRESA);
            pStmt.setInt(5, registro.IDFUNCIONARIO);
            pStmt.setFloat(6, registro.VRVENDAGERAL);
            pStmt.setFloat(7, registro.VRMETAVENDAGERAL);
            pStmt.setFloat(8, registro.VRVENDACALCADOS);
            pStmt.setFloat(9, registro.PERCVENDACALCADOS);
            pStmt.setFloat(10, registro.VRMETAVENDACALCADOS);
            pStmt.setFloat(11, registro.PERCMETAVENDACALCADOS);
            pStmt.setFloat(12, registro.VRVENDAFEMVERINV);
            pStmt.setFloat(13, registro.PERCVENDAFEMVERINV);
            pStmt.setFloat(14, registro.VRMETAVENDAFEMVERINV);
            pStmt.setFloat(15, registro.PERCMETAVENDAFEMVERINV);
            pStmt.setFloat(16, registro.VRVENDAFEMPCINTIMA);
            pStmt.setFloat(17, registro.PERCVENDAFEMPCINTIMA);
            pStmt.setFloat(18, registro.VRMETAVENDAFEMPCINTIMA);
            pStmt.setFloat(19, registro.PERCMETAVENDAFEMPCINTIMA);
            pStmt.setFloat(20, registro.VRVENDAFEMACESSORIOS);
            pStmt.setFloat(21, registro.PERCVENDAFEMACESSORIOS);
            pStmt.setFloat(22, registro.VRMETAVENDAFEMACESSORIOS);
            pStmt.setFloat(23, registro.PERCMETAVENDAFEMACESSORIOS);
            pStmt.setFloat(24, registro.VRVENDAMASCVERINV);
            pStmt.setFloat(25, registro.PERCVENDAMASCVERINV);
            pStmt.setFloat(26, registro.VRMETAVENDAMASCVERINV);
            pStmt.setFloat(27, registro.PERCMETAVENDAMASCVERINV);
            pStmt.setFloat(28, registro.VRVENDAMASCPCINTIMA);
            pStmt.setFloat(29, registro.PERCVENDAMASCPCINTIMA);
            pStmt.setFloat(30, registro.VRMETAVENDAMASCPCINTIMA);
            pStmt.setFloat(31, registro.PERCMETAVENDAMASCPCINTIMA);
            pStmt.setFloat(32, registro.VRVENDAMASCACESSORIOS);
            pStmt.setFloat(33, registro.PERCVENDAMASCACESSORIOS);
            pStmt.setFloat(34, registro.VRMETAVENDAMASCACESSORIOS);
            pStmt.setFloat(35, registro.PERCMETAVENDAMASCACESSORIOS);
            pStmt.setFloat(36, registro.VRVENDAINFANTVERINV);
            pStmt.setFloat(37, registro.PERCVENDAINFANTVERINV);
            pStmt.setFloat(38, registro.VRMETAVENDAINFANTVERINV);
            pStmt.setFloat(39, registro.PERCMETAVENDAINFANTVERINV);
            pStmt.setFloat(40, registro.VRVENDAINFANTPCINTIMA);
            pStmt.setFloat(41, registro.PERCVENDAINFANTPCINTIMA);
            pStmt.setFloat(42, registro.VRMETAVENDAINFANTPCINTIMA);
            pStmt.setFloat(43, registro.PERCMETAVENDAINFANTPCINTIMA);
            pStmt.setFloat(44, registro.VRVENDAINFANTACESSORIOS);
            pStmt.setFloat(45, registro.PERCVENDAINFANTACESSORIOS);
            pStmt.setFloat(46, registro.VRMETAVENDAINFANTACESSORIOS);
            pStmt.setFloat(47, registro.PERCMETAVENDAINFANTACESSORIOS);
            pStmt.setFloat(48, registro.VRVENDACMB);
            pStmt.setFloat(49, registro.PERCVENDACMB);
            pStmt.setFloat(50, registro.VRMETAVENDACMB);
            pStmt.setFloat(51, registro.PERCMETAVENDACMB);
            pStmt.setFloat(52, registro.VRMETAVENDAOUTROS);
            pStmt.setFloat(53, registro.PERCMETAVENDAOUTROS);
            pStmt.setFloat(54, registro.PERCTOTALVENDA);
            pStmt.setString(55, registro.STATIVO);
            pStmt.setString(56, registro.STSALVO);
            pStmt.setInt(57, registro.IDMETASLOJA);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
  
    var query = 'INSERT INTO "VAR_DB_NAME"."METASLOJAS" ' + 
		" ( " +
            ' "IDMETASLOJA", ' +
            ' "DTMETAINICIO", ' +
            ' "DTMETAFIM", ' +
            ' "IDGRUPOEMPRESA", ' +
            ' "IDEMPRESA", ' +
            ' "IDFUNCIONARIO", ' +
            ' "VRVENDAGERAL", ' +
            ' "PERCMETAVENDAGERAL", ' +
            ' "VRMETAVENDAGERAL", ' +
            ' "VRVENDACALCADOS", ' +
            ' "PERCVENDACALCADOS", ' +
            ' "VRMETAVENDACALCADOS", ' +
            ' "PERCMETAVENDACALCADOS", ' +
            ' "VRVENDAFEMVERINV", ' +
            ' "PERCVENDAFEMVERINV", ' +
            ' "VRMETAVENDAFEMVERINV", ' +
            ' "PERCMETAVENDAFEMVERINV", ' +
            ' "VRVENDAFEMPCINTIMA", ' +
            ' "PERCVENDAFEMPCINTIMA", ' +
            ' "VRMETAVENDAFEMPCINTIMA", ' +
            ' "PERCMETAVENDAFEMPCINTIMA", ' +
            ' "VRVENDAFEMACESSORIOS", ' +
            ' "PERCVENDAFEMACESSORIOS", ' +
            ' "VRMETAVENDAFEMACESSORIOS", ' +
            ' "PERCMETAVENDAFEMACESSORIOS", ' +
            ' "VRVENDAMASCVERINV", ' +
            ' "PERCVENDAMASCVERINV", ' +
            ' "VRMETAVENDAMASCVERINV", ' +
            ' "PERCMETAVENDAMASCVERINV", ' +
            ' "VRVENDAMASCPCINTIMA", ' +
            ' "PERCVENDAMASCPCINTIMA", ' +
            ' "VRMETAVENDAMASCPCINTIMA", ' +
            ' "PERCMETAVENDAMASCPCINTIMA", ' +
            ' "VRVENDAMASCACESSORIOS", ' +
            ' "PERCVENDAMASCACESSORIOS", ' +
            ' "VRMETAVENDAMASCACESSORIOS", ' +
            ' "PERCMETAVENDAMASCACESSORIOS", ' +
            ' "VRVENDAINFANTVERINV", ' +
            ' "PERCVENDAINFANTVERINV", ' +
            ' "VRMETAVENDAINFANTVERINV", ' +
            ' "PERCMETAVENDAINFANTVERINV", ' +
            ' "VRVENDAINFANTPCINTIMA", ' +
            ' "PERCVENDAINFANTPCINTIMA", ' +
            ' "VRMETAVENDAINFANTPCINTIMA", ' +
            ' "PERCMETAVENDAINFANTPCINTIMA", ' +
            ' "VRVENDAINFANTACESSORIOS", ' +
            ' "PERCVENDAINFANTACESSORIOS", ' +
            ' "VRMETAVENDAINFANTACESSORIOS", ' +
            ' "PERCMETAVENDAINFANTACESSORIOS", ' +
            ' "VRVENDACMB", ' +
            ' "PERCVENDACMB", ' +
            ' "VRMETAVENDACMB", ' +
            ' "PERCMETAVENDACMB", ' +
            ' "VRMETAVENDAOUTROS", ' +
            ' "PERCMETAVENDAOUTROS", ' +
            ' "PERCTOTALVENDA", ' +
            ' "STATIVO", ' +
            ' "STSALVO" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
		
		
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDMETASLOJA")),0) + 1 FROM "VAR_DB_NAME"."METASLOJAS" WHERE 1 = ? ', 1);
		
		for (var j = 0; j < registro.METASDETALHE.length; j++) {
		    
		    var idMeta = queryId;
		 
            pStmt.setInt(1,idMeta);    
            pStmt.setDate(2, registro.DTMETAINICIO);   
            pStmt.setDate(3, registro.DTMETAFIM);
            pStmt.setInt(4, registro.IDGRUPOEMPRESA);
            pStmt.setInt(5, registro.METASDETALHE[j].IDEmpresaMeta);
            pStmt.setInt(6, registro.IDFUNCIONARIO);
            pStmt.setFloat(7, registro.METASDETALHE[j].VRMetaVenda);
            pStmt.setFloat(8, registro.METASDETALHE[j].PCMetaVenda);
            pStmt.setFloat(9, registro.METASDETALHE[j].VRMeta);
            pStmt.setFloat(10, registro.METASDETALHE[j].VRVendaCalcado);
            pStmt.setFloat(11, registro.METASDETALHE[j].PCVendaCalcado);
            pStmt.setFloat(12, registro.METASDETALHE[j].VRMetaCalcado);
            pStmt.setFloat(13, registro.METASDETALHE[j].PCMetaCalcado);
            pStmt.setFloat(14, registro.METASDETALHE[j].VRVendaFemVeraoInv);
            pStmt.setFloat(15, registro.METASDETALHE[j].PCVendaFemVeraoInv);
            pStmt.setFloat(16, registro.METASDETALHE[j].VRMetaFemVeraoInv);
            pStmt.setFloat(17, registro.METASDETALHE[j].PCMetaFemVeraoInv);
            pStmt.setFloat(18, registro.METASDETALHE[j].VRVendaFemIntimo);
            pStmt.setFloat(19, registro.METASDETALHE[j].PCVendaFemIntimo);
            pStmt.setFloat(20, registro.METASDETALHE[j].VRMetaFemIntimo);
            pStmt.setFloat(21, registro.METASDETALHE[j].PCMetaFemIntimo);
            pStmt.setFloat(22, registro.METASDETALHE[j].VRVendaFemAcess);
            pStmt.setFloat(23, registro.METASDETALHE[j].PCVendaFemAcess);
            pStmt.setFloat(24, registro.METASDETALHE[j].VRMetaFemAcess);
            pStmt.setFloat(25, registro.METASDETALHE[j].PCMetaFemAcess);
            pStmt.setFloat(26, registro.METASDETALHE[j].VRVendaMascVeraoInv);
            pStmt.setFloat(27, registro.METASDETALHE[j].PCVendaMascVeraoInv);
            pStmt.setFloat(28, registro.METASDETALHE[j].VRMetaMascVeraoInv);
            pStmt.setFloat(29, registro.METASDETALHE[j].PCMetaMascVeraoInv);
            pStmt.setFloat(30, registro.METASDETALHE[j].VRVendaMascIntimo);
            pStmt.setFloat(31, registro.METASDETALHE[j].PCVendaMascIntimo);
            pStmt.setFloat(32, registro.METASDETALHE[j].VRMetaMascIntimo);
            pStmt.setFloat(33, registro.METASDETALHE[j].PCMetaMascIntimo);
            pStmt.setFloat(34, registro.METASDETALHE[j].VRVendaMascAcess);
            pStmt.setFloat(35, registro.METASDETALHE[j].PCVendaMascAcess);
            pStmt.setFloat(36, registro.METASDETALHE[j].VRMetaMascAcess);
            pStmt.setFloat(37, registro.METASDETALHE[j].PCMetaMascAcess);
            pStmt.setFloat(38, registro.METASDETALHE[j].VRVendaInfantVeraoInv);
            pStmt.setFloat(39, registro.METASDETALHE[j].PCVendaInfantVeraoInv);
            pStmt.setFloat(40, registro.METASDETALHE[j].VRMetaInfantVeraoInv);
            pStmt.setFloat(41, registro.METASDETALHE[j].PCMetaInfantVeraoInv);
            pStmt.setFloat(42, registro.METASDETALHE[j].VRVendaInfantIntimo);
            pStmt.setFloat(43, registro.METASDETALHE[j].PCVendaInfantIntimo);
            pStmt.setFloat(44, registro.METASDETALHE[j].VRMetaInfantIntimo);
            pStmt.setFloat(45, registro.METASDETALHE[j].PCMetaInfantIntimo);
            pStmt.setFloat(46, registro.METASDETALHE[j].VRVendaInfantAcess);
            pStmt.setFloat(47, registro.METASDETALHE[j].PCVendaInfantAcess);
            pStmt.setFloat(48, registro.METASDETALHE[j].VRMetaInfantAcess);
            pStmt.setFloat(49, registro.METASDETALHE[j].PCMetaInfantAcess);
            pStmt.setFloat(50, registro.METASDETALHE[j].VRVendaCMB);
            pStmt.setFloat(51, registro.METASDETALHE[j].PCVendaCMB);
            pStmt.setFloat(52, registro.METASDETALHE[j].VRMetaCMB);
            pStmt.setFloat(53, registro.METASDETALHE[j].PCMetaCMB);
            pStmt.setFloat(54, registro.METASDETALHE[j].VRVendaOUTROS);
            pStmt.setFloat(55, registro.METASDETALHE[j].PCVendaOUTROS);
            pStmt.setFloat(56, registro.METASDETALHE[j].PCTotal);
            pStmt.setString(57, registro.STATIVO);
            pStmt.setString(58, registro.STSALVO);
        	
            pStmt.execute();
            
            queryId = queryId + 1;
		}

	}
    
    pStmt.close();

	conn.commit();
	
    return {
	    "msg": idMeta
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