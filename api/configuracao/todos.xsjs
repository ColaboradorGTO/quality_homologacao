var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

var idEmpresa = $.request.parameters.get("idEmpresa");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '	tbc.IDCONFIGURACAO,' +
    '	tbc.IDEMPRESA,' +
    '	tbc.UF,' +
    '	tbc.TPFORMAEMISSAO,' +
    '	tbc.TPMODELODOCFISCAL,' +
    '	tbc.TPVERSAOMODFISCAL,' +
    '	tbc.TPEMISSAO,' +
    '	tbc.TPAMBIENTE,' +
    '	tbc.PATHCERTIFICADO,' +
    '	tbc.NUCERTIFICADO,' +
    '	CAST(tbc.PWSENHA AS VARCHAR) AS PWSENHA,' +
   // '	tbc.TXTDADOSPFX,' +
    '   CAST(tbc.TXTDADOSPFX AS TEXT) AS TXTDADOSPFX,' +
    '	tbc.NULOTEPROD,' +
    '	tbc.NUULTNFPROD,' +
    '	tbc.NULOTHOM,' +
    '	tbc.NUULTNFHOM,' +
    '	tbc.DSCRT,' +
    '	tbc.STATUALIZA_XML,' +
    '	tbc.STEXIBIRERROSCHEMA,' +
    '	tbc.ST_CRIARPASTAMENSALMENTE,' +
    '	tbc.ST_SEPARARARQ_CNPJCERTIFICADO,' +
    '	tbc.DSFORMATOALERTA,' +
    '	tbc.IDTOKEN,' +
    '	tbc.TOKENCSC,' +
    '	tbc.STRETIRARACENTOSXML,' +
    '	tbc.STSALVARARQUIVOENVIORESPOSTA,' +
    '   CAST(tbc.PATHSALVARARQUIVOSENVIORESP AS VARCHAR) AS PATHSALVARARQUIVOSENVIORESP,' +
    '	tbc.PATHARQXDS_SCHEMA,' +
    '	tbc.PATH_ARQNFE,' +
    '	tbc.PATH_ARQCANCELADO,' +
    '	tbc.PATH_ARQ_CARTACORRECAO,' +
    '	tbc.PATH_ARQINUTILIZACAO,' +
    '	tbc.PATH_ARQ_DPEC,' +
    '	tbc.PATH_ARQ_EVENTO,' +
    '	tbc.PATH_LOGO,' +
    '	tbc.DTULTALTERACAO,' +
    '	tbc.DSNOMEPFX,' +
    '	tbc.STCERTIFICADO,' +
    '	tbc.DTVALIDADECERTIFICADO,' +
    '	tbc.CNPJ_AUTXML,' +
    '	tbc.DSPATHNFCE,' +
    '	tbc.ST_SAP_ONLINE,' +
    '	tbc.IDPSPPIX,' +
    '	tbc.IDPSPPIXFATURA' +
    ' FROM ' + 
    '   "VAR_DB_NAME".CONFIGURACAO tbc' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbc.IDCONFIGURACAO = \'' + byId + '\' ';
    }
    
    if(idEmpresa){
	    query = query + ' and tbc.IDEMPRESA = ' + idEmpresa;
	}
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."CONFIGURACAO" SET ' + 
            ' "IDEMPRESA" = ?, ' +
            ' "UF" = ?, ' +
            ' "TPFORMAEMISSAO" = ?, ' +
            ' "TPMODELODOCFISCAL" = ?, ' +
            ' "TPVERSAOMODFISCAL" = ?, ' +
            ' "TPEMISSAO" = ?, ' +
            ' "TPAMBIENTE" = ?, ' +
            ' "PATHCERTIFICADO" = ?, ' +
            ' "NUCERTIFICADO" = ?, ' +
            ' "PWSENHA" = ?, ' +
            ' "TXTDADOSPFX" = ?, ' +
            ' "NULOTEPROD" = ?, ' +
            ' "NUULTNFPROD" = ?, ' +
            ' "NULOTHOM" = ?, ' +
            ' "NUULTNFHOM" = ?, ' +
            ' "DSCRT" = ?, ' +
            ' "STATUALIZA_XML" = ?, ' +
            ' "STEXIBIRERROSCHEMA" = ?, ' +
            ' "ST_CRIARPASTAMENSALMENTE" = ?, ' +
            ' "ST_SEPARARARQ_CNPJCERTIFICADO" = ?, ' +
            ' "DSFORMATOALERTA" = ?, ' +
            ' "IDTOKEN" = ?, ' +
            ' "TOKENCSC" = ?, ' +
            ' "STRETIRARACENTOSXML" = ?, ' +
            ' "STSALVARARQUIVOENVIORESPOSTA" = ?, ' +
            ' "PATHSALVARARQUIVOSENVIORESP" = ?, ' +
            ' "PATHARQXDS_SCHEMA" = ?, ' +
            ' "PATH_ARQNFE" = ?, ' +
            ' "PATH_ARQCANCELADO" = ?, ' +
            ' "PATH_ARQ_CARTACORRECAO" = ?, ' +
            ' "PATH_ARQINUTILIZACAO" = ?, ' +
            ' "PATH_ARQ_DPEC" = ?, ' +
            ' "PATH_ARQ_EVENTO" = ?, ' +
            ' "PATH_LOGO" = ?, ' +
            ' "DTULTALTERACAO" = ?, ' +
            ' "DSNOMEPFX" = ?, ' +
            ' "STCERTIFICADO" = ?, ' +
            ' "DTVALIDADECERTIFICADO" = ?, ' +
            ' "CNPJ_AUTXML" = ?, ' +
            ' "DSPATHNFCE" = ?, ' +
            ' "ST_SAP_ONLINE" = ? '+ 
    	' WHERE "IDCONFIGURACAO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.UF);
        pStmt.setString(3, registro.TPFORMAEMISSAO);
        pStmt.setString(4, registro.TPMODELODOCFISCAL);
        pStmt.setString(5, registro.TPVERSAOMODFISCAL);
        pStmt.setString(6, registro.TPEMISSAO);
        pStmt.setString(7, registro.TPAMBIENTE);
        pStmt.setString(8, registro.PATHCERTIFICADO);
        pStmt.setString(9, registro.NUCERTIFICADO);
        pStmt.setString(10, registro.PWSENHA);
        pStmt.setString(11, registro.TXTDADOSPFX);
        pStmt.setInt(12, registro.NULOTEPROD);
        pStmt.setInt(13, registro.NUULTNFPROD);
        pStmt.setInt(14, registro.NULOTHOM);
        pStmt.setInt(15, registro.NUULTNFHOM);
        pStmt.setString(16, registro.DSCRT);
        pStmt.setString(17, registro.STATUALIZA_XML);
        pStmt.setString(18, registro.STEXIBIRERROSCHEMA);
        pStmt.setString(19, registro.ST_CRIARPASTAMENSALMENTE);
        pStmt.setString(20, registro.ST_SEPARARARQ_CNPJCERTIFICADO);
        pStmt.setString(21, registro.DSFORMATOALERTA);
        pStmt.setString(22, registro.IDTOKEN);
        pStmt.setString(23, registro.TOKENCSC);
        pStmt.setString(24, registro.STRETIRARACENTOSXML);
        pStmt.setString(25, registro.STSALVARARQUIVOENVIORESPOSTA);
        pStmt.setString(26, registro.PATHSALVARARQUIVOSENVIORESP);
        pStmt.setString(27, registro.PATHARQXDS_SCHEMA);
        pStmt.setString(28, registro.PATH_ARQNFE);
        pStmt.setString(29, registro.PATH_ARQCANCELADO);
        pStmt.setString(30, registro.PATH_ARQ_CARTACORRECAO);
        pStmt.setString(31, registro.PATH_ARQINUTILIZACAO);
        pStmt.setString(32, registro.PATH_ARQ_DPEC);
        pStmt.setString(33, registro.PATH_ARQ_EVENTO);
        pStmt.setString(34, registro.PATH_LOGO);
        pStmt.setDate(35, registro.DTULTALTERACAO);
        pStmt.setString(36, registro.DSNOMEPFX);
        pStmt.setString(37, registro.STCERTIFICADO);
        pStmt.setDate(38, registro.DTVALIDADECERTIFICADO);
        pStmt.setString(39, registro.CNPJ_AUTXML);
        pStmt.setString(40, registro.DSPATHNFCE);
        pStmt.setString(41, registro.ST_SAP_ONLINE);
        pStmt.setString(42, registro.IDCONFIGURACAO);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."CONFIGURACAO" ' +
		" ( " +
		' "IDCONFIGURACAO", ' +
        ' "IDEMPRESA", ' +
        ' "UF", ' +
        ' "TPFORMAEMISSAO", ' +
        ' "TPMODELODOCFISCAL", ' +
        ' "TPVERSAOMODFISCAL", ' +
        ' "TPEMISSAO", ' +
        ' "TPAMBIENTE", ' +
        ' "PATHCERTIFICADO", ' +
        ' "NUCERTIFICADO", ' +
        ' "PWSENHA", ' +
        ' "TXTDADOSPFX", ' +
        ' "NULOTEPROD", ' +
        ' "NUULTNFPROD", ' +
        ' "NULOTHOM", ' +
        ' "NUULTNFHOM", ' +
        ' "DSCRT", ' +
        ' "STATUALIZA_XML", ' +
        ' "STEXIBIRERROSCHEMA", ' +
        ' "ST_CRIARPASTAMENSALMENTE", ' +
        ' "ST_SEPARARARQ_CNPJCERTIFICADO", ' +
        ' "DSFORMATOALERTA", ' +
        ' "IDTOKEN", ' +
        ' "TOKENCSC", ' +
        ' "STRETIRARACENTOSXML", ' +
        ' "STSALVARARQUIVOENVIORESPOSTA", ' +
        ' "PATHSALVARARQUIVOSENVIORESP", ' +
        ' "PATHARQXDS_SCHEMA", ' +
        ' "PATH_ARQNFE", ' +
        ' "PATH_ARQCANCELADO", ' +
        ' "PATH_ARQ_CARTACORRECAO", ' +
        ' "PATH_ARQINUTILIZACAO", ' +
        ' "PATH_ARQ_DPEC", ' +
        ' "PATH_ARQ_EVENTO", ' +
        ' "PATH_LOGO", ' +
        ' "DTULTALTERACAO", ' +
        ' "DSNOMEPFX", ' +
        ' "STCERTIFICADO", ' +
        ' "DTVALIDADECERTIFICADO", ' +
        ' "CNPJ_AUTXML", ' +
        ' "DSPATHNFCE", ' +
        ' "ST_SAP_ONLINE" '+ 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_CONFIGURACAO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESA);
        pStmt.setString(2, registro.UF);
        pStmt.setString(3, registro.TPFORMAEMISSAO);
        pStmt.setString(4, registro.TPMODELODOCFISCAL);
        pStmt.setString(5, registro.TPVERSAOMODFISCAL);
        pStmt.setString(6, registro.TPEMISSAO);
        pStmt.setString(7, registro.TPAMBIENTE);
        pStmt.setString(8, registro.PATHCERTIFICADO);
        pStmt.setString(9, registro.NUCERTIFICADO);
        pStmt.setString(10, registro.PWSENHA);
        pStmt.setString(11, registro.TXTDADOSPFX);
        pStmt.setInt(12, registro.NULOTEPROD);
        pStmt.setInt(13, registro.NUULTNFPROD);
        pStmt.setInt(14, registro.NULOTHOM);
        pStmt.setInt(15, registro.NUULTNFHOM);
        pStmt.setString(16, registro.DSCRT);
        pStmt.setString(17, registro.STATUALIZA_XML);
        pStmt.setString(18, registro.STEXIBIRERROSCHEMA);
        pStmt.setString(19, registro.ST_CRIARPASTAMENSALMENTE);
        pStmt.setString(20, registro.ST_SEPARARARQ_CNPJCERTIFICADO);
        pStmt.setString(21, registro.DSFORMATOALERTA);
        pStmt.setString(22, registro.IDTOKEN);
        pStmt.setString(23, registro.TOKENCSC);
        pStmt.setString(24, registro.STRETIRARACENTOSXML);
        pStmt.setString(25, registro.STSALVARARQUIVOENVIORESPOSTA);
        pStmt.setString(26, registro.PATHSALVARARQUIVOSENVIORESP);
        pStmt.setString(27, registro.PATHARQXDS_SCHEMA);
        pStmt.setString(28, registro.PATH_ARQNFE);
        pStmt.setString(29, registro.PATH_ARQCANCELADO);
        pStmt.setString(30, registro.PATH_ARQ_CARTACORRECAO);
        pStmt.setString(31, registro.PATH_ARQINUTILIZACAO);
        pStmt.setString(32, registro.PATH_ARQ_DPEC);
        pStmt.setString(33, registro.PATH_ARQ_EVENTO);
        pStmt.setString(34, registro.PATH_LOGO);
        pStmt.setDate(35, registro.DTULTALTERACAO);
        pStmt.setString(36, registro.DSNOMEPFX);
        pStmt.setString(37, registro.STCERTIFICADO);
        pStmt.setDate(38, registro.DTVALIDADECERTIFICADO);
        pStmt.setString(39, registro.CNPJ_AUTXML);
        pStmt.setString(40, registro.DSPATHNFCE);
        pStmt.setString(41, registro.ST_SAP_ONLINE);
       
    	
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