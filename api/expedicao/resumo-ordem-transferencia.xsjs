var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var saida_nfe = $.import("quality.concentrador_homologacao.api.service-layer.notas-transferencia.saida-nfe", "saida-nfe");
var entrada_nfe = $.import("quality.concentrador_homologacao.api.service-layer.notas-transferencia.entrada-nfe", "entrada-nfe");
var ot_acerto_nfe = $.import("quality.concentrador_homologacao.api.service-layer.notas-transferencia.ot-acerto-nfe", "ot-acerto-nfe");

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

    var idTipoFiltro = parseInt($.request.parameters.get("idtipofiltro"));
    var idEmpresaOrigem = parseInt($.request.parameters.get("idEmpresaOrigem"));
    var idEmpresaDestino = parseInt($.request.parameters.get("idEmpresaDestino"));
    var dataPesqInicio = $.request.parameters.get("datapesqinicio");
    var dataPesqFim = $.request.parameters.get("datapesqfim");
    var idStatusOT = parseInt($.request.parameters.get("idstatusot"));
    var dataFatInicio = $.request.parameters.get("dtinifat");
    var dataFatFim = $.request.parameters.get("dtfimfat");
    var idRotina = $.request.parameters.get("idrotina");
    var dataEntregaIni = $.request.parameters.get("dtinient");
    var dataEntregaFim = $.request.parameters.get("dtfiment");
    
    var query = ' SELECT ' +
                '   rot.IDRESUMOOT ' +
                '   ,rot.IDEMPRESAORIGEM ' +
                '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESAORIGEM) AS EMPRESAORIGEM ' +
                '   ,rot.IDEMPRESADESTINO ' +
                '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = rot.IDEMPRESADESTINO) AS EMPRESADESTINO ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATAEXPEDICAO ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAEXPEDICAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DATAEXPEDICAOFORMATADA ' +
                '   ,rot.IDOPERADOREXPEDICAO ' +
                '   ,rot.NUTOTALITENS ' +
                '   ,rot.QTDTOTALITENS ' +
                '   ,rot.QTDTOTALITENSRECEPCIONADO ' +
                '   ,rot.QTDTOTALITENSDIVERGENCIA ' +
                '   ,rot.NUTOTALVOLUMES ' +
                '   ,rot.TPVOLUME ' +
                '   ,rot.VRTOTALCUSTO ' +
                '   ,rot.VRTOTALVENDA ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTRECEPCAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTRECEPCAO ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTRECEPCAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTRECEPCAOFORMATADA ' +
                '   ,rot.IDOPERADORRECEPTOR ' +
                '   ,rot.DSOBSERVACAO ' +
                '   ,rot.IDUSRCANCELAMENTO ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTULTALTERACAO ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTULTALTERACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DTULTALTERACAOFORMATADA ' +
                '   ,rot.IDSTDIVERGENCIA ' +
                '   ,rot.OBSDIVERGENCIA ' +
                '   ,rot.STEMISSAONFE ' +
                '   ,IFNULL(rot.NUMERONFE, \'\') AS NUMERONFE ' +
                '   ,rot.STENTRADAINVENTARIO ' +
                '   ,IFNULL(rot.QTDCONFERENCIA, 0) AS QTDCONFERENCIA ' +
                '   ,rot.IDSTATUSOT ' +
                '   ,rot.IDUSRAJUSTE ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTAJUSTE,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DTAJUSTE ' +
                '   ,IFNULL(TO_VARCHAR(rot.DTAJUSTE,\'DD/MM/YYYY\'), \'Não Informado\') AS DTAJUSTEFORMATADA ' +
                '   ,rot.QTDTOTALITENSAJUSTE ' +
                '   ,sot.DESCRICAOOT ' +
                '   ,rot.STMIGRADOSAPORIGEM ' +
                '   ,rot.STMIGRADOSAPDESTINO ' +
                '   ,rot.IDSAPORIGEM ' +
                '   ,rot.IDSAPDESTINO ' +
                '   ,rot.ERRORLOGSAP ' +
                '   ,rot.CHAVESEFAZ ' +
                '   ,rot.MSGSEFAZ ' +
                '   ,rot.CODIGORETORNOSEFAZ ' +
                '   ,rot.NUMERONOTASEFAZ ' +
                '   ,rot.CONFEREITENS ' +
                '   ,rot.IDROTINA ' +
                //'   ,rotot.DESCROTINA ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAENTREGA,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATAENTREGA ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAENTREGA,\'YYYY-MM-DD\'), \'\') AS DATAENTREGAFORMATADA ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAEMISSAOSEFAZ,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATAEMISSAOSEFAZ ' +
                '   ,IFNULL(TO_VARCHAR(rot.DATAEMISSAOSEFAZ,\'DD/MM/YYYY\'), \'Não Informado\') AS DATAEMISSAOSEFAZFORMATADA ' +
                ' FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA rot ' +
                ' JOIN "VAR_DB_NAME".STATUSORDEMTRANSFERENCIA sot ON sot.IDSTATUSOT = rot.IDSTATUSOT ' +
                //' JOIN "VAR_DB_NAME".ROTINASORDEMTRANSFERENCIA rotot ON rotot.IDROTINA = rot.IDROTINA ' +
                ' WHERE 1 = ? ';
    if(byId){
        query = query + ' AND rot.IDRESUMOOT = \'' + byId + '\' ';
    }
    if(idTipoFiltro === 1){
        if ( idEmpresaOrigem > 0 ) {
            query = query + ' AND rot.IDEMPRESAORIGEM = \'' + idEmpresaOrigem + '\' ';
        }
        if ( idEmpresaDestino > 0 ) {
            query = query + ' AND rot.IDEMPRESADESTINO = \'' + idEmpresaDestino + '\' ';
        }
    } else if (idTipoFiltro === 2){
        if ( idEmpresaDestino === idEmpresaOrigem ) {
            query = query + ' AND rot.IDEMPRESADESTINO = \'' + idEmpresaDestino + '\' ';
        } else if ( idEmpresaDestino !== idEmpresaOrigem && idEmpresaDestino > 0 ) {
            query = query + ' AND rot.IDEMPRESAORIGEM = \'' + idEmpresaOrigem + '\' AND rot.IDEMPRESADESTINO = \'' + idEmpresaDestino + '\' ';
        } else {
            query = query + ' AND (rot.IDEMPRESAORIGEM = \'' + idEmpresaOrigem + '\' OR rot.IDEMPRESADESTINO = \'' + idEmpresaOrigem + '\') ';
        }
    }
    if(dataPesqInicio){
        query = query + ' AND rot.DATAEXPEDICAO >= \'' + dataPesqInicio + ' 00:00:00\' ';
    }
    if(dataPesqFim){
        query = query + ' AND rot.DATAEXPEDICAO <= \'' + dataPesqFim + ' 23:59:59\' ';
    }
    if(idStatusOT > 0){
        query = query + ' AND rot.IDSTATUSOT = \'' + idStatusOT + '\' ';
    }
    if(dataFatInicio){
        query = query + ' AND rot.DATAEMISSAOSEFAZ >= \'' + dataFatInicio + ' 00:00:00\' ';
    }
    if(dataFatFim){
        query = query + ' AND rot.DATAEMISSAOSEFAZ <= \'' + dataFatFim + ' 23:59:59\' ';
    }
    if(idRotina > 0){
        query = query + ' AND rot.IDROTINA = \'' + idRotina + '\' ';
    }
    if(dataEntregaIni){
        query = query + ' AND rot.DATAENTREGA >= \'' + dataEntregaIni + ' 00:00:00\' ';
    }
    if(dataEntregaFim){
        query = query + ' AND rot.DATAENTREGA <= \'' + dataEntregaFim + ' 23:59:59\' ';
    }
    query = query + 'ORDER BY rot.IDRESUMOOT DESC ';

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };

    api.responseWithQuery(query, request, 1);
}

function fnDetalheOT(pIdResumoOT, aDetalheOT){
    var conndet = $.db.getConnection();

    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ( ' +
        		' "IDPRODUTO"    , "IDRESUMOOT"   , "QTDEXPEDICAO" ' +
                ' ,"QTDRECEPCAO"  , "QTDDIFERENCA" , "QTDAJUSTE"    , "VLRUNITVENDA" ' +
                ' ,"VLRUNITCUSTO" , "STCONFERIDO"  , "IDUSRAJUSTE"  , "STATIVO" ' +
                ' ,"STFALTA"      , "STSOBRA" ' +
        		' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
	var pStmt = conndet.prepareStatement(api.replaceDbName(query));

		for (var i = 0; i < aDetalheOT.length; i++) {

	    pStmt.setString(1, aDetalheOT[i].IDPRODUTO);
	    pStmt.setInt(2, pIdResumoOT);
        pStmt.setInt(3, aDetalheOT[i].QTDEXPEDICAO);
        pStmt.setInt(4, aDetalheOT[i].QTDRECEPCAO);
        pStmt.setInt(5, aDetalheOT[i].QTDDIFERENCA);
        pStmt.setInt(6, aDetalheOT[i].QTDAJUSTE);
        pStmt.setFloat(7, aDetalheOT[i].VLRUNITVENDA);
        pStmt.setFloat(8, aDetalheOT[i].VLRUNITCUSTO);
        pStmt.setString(9, aDetalheOT[i].STCONFERIDO);
        pStmt.setInt(10, aDetalheOT[i].IDUSRAJUSTE);
        pStmt.setString(11, aDetalheOT[i].STATIVO);
        pStmt.setString(12, aDetalheOT[i].STFALTA);
        pStmt.setString(13, aDetalheOT[i].STSOBRA);

        pStmt.execute();
	}
	
	
	pStmt.close();
	
	conndet.commit();
	
}

function fnHandlePost() {
   
    var conn = $.db.getConnection();
 
    var pIdResumoOT = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDRESUMOOT")),0) + 1 FROM "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" WHERE 1 = ? ', 1);

    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" ( ' +
        		' "IDRESUMOOT"                  , "IDEMPRESAORIGEM"     , "IDEMPRESADESTINO"    , "DATAEXPEDICAO" ' +
                ' ,"IDOPERADOREXPEDICAO"        , "NUTOTALITENS"        , "QTDTOTALITENS"       , "QTDTOTALITENSRECEPCIONADO" ' +
                ' ,"QTDTOTALITENSDIVERGENCIA"   , "NUTOTALVOLUMES"      , "TPVOLUME"            , "VRTOTALCUSTO" ' +
                ' ,"VRTOTALVENDA"               , "DTRECEPCAO"          , "IDOPERADORRECEPTOR"  , "DSOBSERVACAO" ' +
                ' ,"IDUSRCANCELAMENTO"          , "DTULTALTERACAO"      , "IDSTDIVERGENCIA"     , "OBSDIVERGENCIA" ' +
                ' ,"STEMISSAONFE"               , "NUMERONFE"           , "STENTRADAINVENTARIO" , "QTDCONFERENCIA" ' +
                ' ,"IDSTATUSOT"                 , "IDUSRAJUSTE"         , "DTAJUSTE"            , "QTDTOTALITENSAJUSTE" ' +
                ' ,"CONFEREITENS"               , "IDROTINA"            , "DATAENTREGA" ' +
        		' ) VALUES (?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';

    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    
    pStmt.setInt(1, pIdResumoOT);
    pStmt.setInt(2, bodyJson.IDEMPRESAORIGEM);
    pStmt.setInt(3, bodyJson.IDEMPRESADESTINO);
    pStmt.setInt(4, bodyJson.IDOPERADOREXPEDICAO);
    pStmt.setInt(5, bodyJson.NUTOTALITENS);
    pStmt.setInt(6, bodyJson.QTDTOTALITENS);
    pStmt.setInt(7, bodyJson.QTDTOTALITENSRECEPCIONADO);
    pStmt.setInt(8, bodyJson.QTDTOTALITENSDIVERGENCIA);
    pStmt.setInt(9, bodyJson.NUTOTALVOLUMES);
    pStmt.setString(10, bodyJson.TPVOLUME);
    pStmt.setFloat(11, bodyJson.VRTOTALCUSTO);
    pStmt.setFloat(12, bodyJson.VRTOTALVENDA);
    setDateOrNull(pStmt, 13, bodyJson.DTRECEPCAO);
    setIntOrNull(pStmt, 14, bodyJson.IDOPERADORRECEPTOR);
    pStmt.setString(15, bodyJson.DSOBSERVACAO);
    setIntOrNull(pStmt, 16, bodyJson.IDUSRCANCELAMENTO);
    setIntOrNull(pStmt, 17, bodyJson.IDSTDIVERGENCIA);
    pStmt.setString(18, bodyJson.OBSDIVERGENCIA);
    pStmt.setString(19, bodyJson.STEMISSAONFE);
    pStmt.setString(20, bodyJson.NUMERONFE);
    pStmt.setString(21, bodyJson.STENTRADAINVENTARIO);
    pStmt.setInt(22, bodyJson.QTDCONFERENCIA);
    pStmt.setInt(23, bodyJson.IDSTATUSOT);
    setIntOrNull(pStmt, 24, bodyJson.IDUSRAJUSTE);
    setDateOrNull(pStmt, 25, bodyJson.DTAJUSTE);
    pStmt.setInt(26, bodyJson.QTDTOTALITENSAJUSTE);
    pStmt.execute();
    pStmt.close();

    fnDetalheOT(pIdResumoOT, bodyJson.dadosdetalheot);

	conn.commit();
	
	return {
	    "msg": "Inclusão realizada com sucesso!",
	    "data": bodyJson
	};
}

function fnHandlePut(){

    var conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());

    var pIdEmpresaOrigem = parseInt(bodyJson[0].IDEMPRESAORIGEM);
    var pIdStatusOT = parseInt(bodyJson[0].IDSTATUSOT);
    var pIdResumoOT = parseInt(bodyJson[0].IDRESUMOOT);
    var lValidaConf = bodyJson[0].LVALIDACONF;

    // rotina para atualizar a OT, que ainda está na origem
    if(pIdStatusOT === 1){
        var query1 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "NUTOTALITENS" = ?, "QTDTOTALITENS" = ?, "VRTOTALCUSTO" = ?, "VRTOTALVENDA" = ?, "DTULTALTERACAO" = NOW(), ' +
                    ' "DSOBSERVACAO" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt1 = conn.prepareStatement(api.replaceDbName(query1));
        pStmt1.setInt(1, bodyJson[0].NUTOTALITENS);
        pStmt1.setInt(2, bodyJson[0].QTDTOTALITENS);
        pStmt1.setFloat(3, bodyJson[0].VRTOTALCUSTO);
        pStmt1.setFloat(4, bodyJson[0].VRTOTALVENDA);
        pStmt1.setString(5, bodyJson[0].DSOBSERVACAO);
        pStmt1.setInt(6, pIdResumoOT);
    	pStmt1.execute();
        pStmt1.close();
 
        var querydet1 = 'DELETE FROM "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA WHERE IDRESUMOOT = ?';
    	var pStmtdet1 = conn.prepareStatement(api.replaceDbName(querydet1));
    	pStmtdet1.setInt(1, pIdResumoOT);
    	pStmtdet1.execute();
    	pStmtdet1.close();

    	conn.commit();    	
    	fnDetalheOT(pIdResumoOT, bodyJson[0].dadosdetalheot);
    }
    
    // rotina para cancelar a OT, que ainda está na origem
    if(pIdStatusOT === 2){
        var query2 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "IDUSRCANCELAMENTO" = ?, "DTULTALTERACAO" = NOW(), "IDSTATUSOT" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
        pStmt2.setInt(1, bodyJson[0].IDUSRCANCELAMENTO);
        pStmt2.setInt(2, pIdStatusOT);
        pStmt2.setInt(3, pIdResumoOT);
    	pStmt2.execute();
        pStmt2.close();
        
        var querydet2 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "STATIVO" = ? WHERE "IDRESUMOOT" = ? ';
        var pStmtdet2 = conn.prepareStatement(api.replaceDbName(querydet2));
        pStmtdet2.setString(1, 'False');
        pStmtdet2.setInt(2, pIdResumoOT);
    	pStmtdet2.execute();
        pStmtdet2.close();
        conn.commit();
    }

    // rotina para gravar a nota e liberar a OT para contagem STEMISSAONFE, NUMERONFE, IDSTATUSOT
    if(pIdStatusOT === 3 && pIdEmpresaOrigem !== 101){
        var query3 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "STEMISSAONFE" = ?, "NUMERONFE" = ?, "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW(), ' +
                    ' "NUTOTALVOLUMES" = ?, "TPVOLUME" = ?, "CONFEREITENS" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
        pStmt3.setString(1, 'True');
        pStmt3.setString(2, '');
        pStmt3.setInt(3, pIdStatusOT);
        pStmt3.setInt(4, bodyJson[0].NUTOTALVOLUMES);
        pStmt3.setString(5, bodyJson[0].TPVOLUME);
        pStmt3.setString(6, bodyJson[0].CONFEREITENS);
        pStmt3.setInt(7, pIdResumoOT);
    	pStmt3.execute();
        pStmt3.close();
        for (var i = 1; i <= bodyJson[0].NUTOTALVOLUMES; i++) {
    	    var queryvol3 = 'INSERT INTO "VAR_DB_NAME"."CONFEREVOLUMEOT" ("IDCONFEREVOLUMEOT", "IDRESUMOOT", "NUMEROVOLUME", "CODIGOBARRAS", "STATIVO") ' +
        		         'VALUES ("VAR_DB_NAME".SEQ_CONFEREVOLUMEOT.NEXTVAL, ?, ?, ?, ?) ';
            var pStmtvol3 = conn.prepareStatement(api.replaceDbName(queryvol3));
            pStmtvol3.setInt(1, pIdResumoOT);
            pStmtvol3.setInt(2, i);
            pStmtvol3.setString(3, pIdResumoOT + "" + i);
            pStmtvol3.setString(4, 'True');
            pStmtvol3.execute();
            pStmtvol3.close();
    	}
        conn.commit();
    } else if(pIdStatusOT === 3 && pIdEmpresaOrigem === 101) {
        query3 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW(), "NUTOTALVOLUMES" = ?, "TPVOLUME" = ?, "CONFEREITENS" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
        if(bodyJson[0].IDSITUACAO === 1){
            pStmt3.setInt(1, 12);
        } else {
            pStmt3.setInt(1, 10);
        }
        pStmt3.setInt(2, bodyJson[0].NUTOTALVOLUMES);
        pStmt3.setString(3, bodyJson[0].TPVOLUME);
        pStmt3.setString(4, bodyJson[0].CONFEREITENS);
        pStmt3.setInt(5, pIdResumoOT);
    	pStmt3.execute();
        pStmt3.close();
        for (var i = 1; i <= bodyJson[0].NUTOTALVOLUMES; i++) {
    	    var queryvol3 = 'INSERT INTO "VAR_DB_NAME"."CONFEREVOLUMEOT" ("IDCONFEREVOLUMEOT", "IDRESUMOOT", "NUMEROVOLUME", "CODIGOBARRAS", "STATIVO") ' +
        		         'VALUES ("VAR_DB_NAME".SEQ_CONFEREVOLUMEOT.NEXTVAL, ?, ?, ?, ?) ';
            var pStmtvol3 = conn.prepareStatement(api.replaceDbName(queryvol3));
            pStmtvol3.setInt(1, pIdResumoOT);
            pStmtvol3.setInt(2, i);
            pStmtvol3.setString(3, pIdResumoOT + "" + i);
            pStmtvol3.setString(4, 'True');
            pStmtvol3.execute();
            pStmtvol3.close();
    	}
        conn.commit();
    }

    // rotina para atualizar a quantidade recepcionada da OT, bem como incluir produtos nãos listados na origem
    if(pIdStatusOT === 4){

        var query4 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "QTDTOTALITENSRECEPCIONADO" = ?, "DTRECEPCAO" = NOW(), "IDOPERADORRECEPTOR" = ?, "DTULTALTERACAO" = NOW() ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt4 = conn.prepareStatement(api.replaceDbName(query4));
        pStmt4.setInt(1, bodyJson[0].QTDTOTALITENSRECEPCIONADO);
        pStmt4.setInt(2, bodyJson[0].IDOPERADORRECEPTOR);
        pStmt4.setInt(3, bodyJson[0].IDRESUMOOT);
    	pStmt4.execute();
        pStmt4.close();
 
        var querydetupd4 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "QTDRECEPCAO" = ?, "STCONFERIDO" = ? ' +
    		              ' WHERE "IDRESUMOOT" = ? AND "IDPRODUTO" = ? ';
    	var pStmtdetupd4 = conn.prepareStatement(api.replaceDbName(querydetupd4));

    	for (var i = 0; i < bodyJson[0].dadosdetalheot.length; i++) {
    	    
    	    var pIdProduto = bodyJson[0].dadosdetalheot[i].IDPRODUTO;

            if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA WHERE STATIVO = \'True\' AND IDRESUMOOT = ' + pIdResumoOT + ' AND IDPRODUTO = ?', pIdProduto) > 0) {
                pStmtdetupd4.setInt(1, bodyJson[0].dadosdetalheot[i].QTDRECEPCAO);
                pStmtdetupd4.setString(2, bodyJson[0].dadosdetalheot[i].STCONFERIDO);
                pStmtdetupd4.setInt(3, pIdResumoOT);
                pStmtdetupd4.setString(4, pIdProduto);
                pStmtdetupd4.execute();
            } else {
                var querydetins4 = 'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ( ' +
                            	' "IDDETALHEOT"   , "IDPRODUTO"    , "IDRESUMOOT"   , "QTDEXPEDICAO" ' +
                                ' ,"QTDRECEPCAO"  , "QTDDIFERENCA" , "QTDAJUSTE"    , "VLRUNITVENDA" ' +
                                ' ,"VLRUNITCUSTO" , "STCONFERIDO"  , "IDUSRAJUSTE"  , "STATIVO" ' +
                                ' ,"STFALTA"      , "STSOBRA" ' +
                        		' ) VALUES ("VAR_DB_NAME".SEQ_DETALHEORDEMTRANSFERENCIA.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
            	var pStmtdetins4 = conn.prepareStatement(api.replaceDbName(querydetins4));

        	    pStmtdetins4.setString(1, pIdProduto);
        	    pStmtdetins4.setInt(2, pIdResumoOT);
                pStmtdetins4.setInt(3, bodyJson[0].dadosdetalheot[i].QTDEXPEDICAO);
                pStmtdetins4.setInt(4, bodyJson[0].dadosdetalheot[i].QTDRECEPCAO);
                pStmtdetins4.setInt(5, bodyJson[0].dadosdetalheot[i].QTDDIFERENCA);
                pStmtdetins4.setInt(6, bodyJson[0].dadosdetalheot[i].QTDAJUSTE);
                pStmtdetins4.setFloat(7, bodyJson[0].dadosdetalheot[i].VLRUNITVENDA);
                pStmtdetins4.setFloat(8, bodyJson[0].dadosdetalheot[i].VLRUNITCUSTO);
                pStmtdetins4.setString(9, bodyJson[0].dadosdetalheot[i].STCONFERIDO);
                setIntOrNull(pStmtdetins4, 10, bodyJson[0].dadosdetalheot[i].IDUSRAJUSTE);
                pStmtdetins4.setString(11, bodyJson[0].dadosdetalheot[i].STATIVO);
                pStmtdetins4.setString(12, bodyJson[0].dadosdetalheot[i].STFALTA);
                pStmtdetins4.setString(13, bodyJson[0].dadosdetalheot[i].STSOBRA);
                pStmtdetins4.execute();
                pStmtdetins4.close();
            }
    	}
    	pStmtdetupd4.close();
        conn.commit();
    }

    // rotina para excluir produtos que foram incluídos na recepção
    if(pIdStatusOT === 5){
        if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA WHERE STATIVO = \'True\' AND IDRESUMOOT = ' + pIdResumoOT + ' AND IDPRODUTO = ?', bodyJson[0].IDPRODUTO) > 0) {
            var querydetdel5 = 'DELETE FROM "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA WHERE IDRESUMOOT = ? AND IDPRODUTO = ?';
        	var pStmtdetdel5 = conn.prepareStatement(api.replaceDbName(querydetdel5));
        	pStmtdetdel5.setInt(1, pIdResumoOT);
        	pStmtdetdel5.setString(2, bodyJson[0].IDPRODUTO);
        	pStmtdetdel5.execute();
        	pStmtdetdel5.close();
            conn.commit();
        }
    }

    // rotina para realizar o fechamento da recepção da OT
    if(pIdStatusOT === 6){
        var query6 = "{ CALL \"QUALITY_CONC_HML\".\"SP_FINALIZAROT\"(?,?,?) }";
        var pStmt6 = conn.prepareCall(query6);
        pStmt6.setInt(1, pIdResumoOT);
        pStmt6.setInt(2, bodyJson[0].IDOPERADORRECEPTOR);
        pStmt6.setInt(3, bodyJson[0].QTDCONFERENCIA);
        pStmt6.execute();
        pStmt6.close();
        conn.commit();
        // Validar Entrada da NFE
        if (api.executeScalar('SELECT QTDTOTALITENSDIVERGENCIA FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA WHERE IDRESUMOOT = ?', pIdResumoOT) === 0) {
            //return 'aqui';
            entrada_nfe.executeEntradaNfe(pIdResumoOT);
        }
    }

    // rotina para atualizar os produtos da OT, bem como incluir produtos nãos listados na origem, no momento do Ajuste (Prevenção e Perdas)
    if(pIdStatusOT === 7){

        var querydetupd7 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "QTDAJUSTE" = ?, "IDUSRAJUSTE" = ? ' +
    		              ' WHERE "IDRESUMOOT" = ? AND "IDPRODUTO" = ? ';
    	var pStmtdetupd7 = conn.prepareStatement(api.replaceDbName(querydetupd7));

    	for (i = 0; i < bodyJson[0].dadosdetalheot.length; i++) {
    	    
    	    pIdProduto = bodyJson[0].dadosdetalheot[i].IDPRODUTO;

            if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".DETALHEORDEMTRANSFERENCIA WHERE STATIVO = \'True\' AND IDRESUMOOT = ' + pIdResumoOT + ' AND IDPRODUTO = ?', pIdProduto) > 0) {
                pStmtdetupd7.setInt(1, bodyJson[0].dadosdetalheot[i].QTDAJUSTE);
                pStmtdetupd7.setInt(2, bodyJson[0].dadosdetalheot[i].IDUSRAJUSTE);
                pStmtdetupd7.setInt(3, pIdResumoOT);
                pStmtdetupd7.setString(4, pIdProduto);
                pStmtdetupd7.execute();
            } else {
                var querydetins7 = 'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ( ' +
                            	' "IDDETALHEOT"   , "IDPRODUTO"    , "IDRESUMOOT"   , "QTDEXPEDICAO" ' +
                                ' ,"QTDRECEPCAO"  , "QTDDIFERENCA" , "QTDAJUSTE"    , "VLRUNITVENDA" ' +
                                ' ,"VLRUNITCUSTO" , "STCONFERIDO"  , "IDUSRAJUSTE"  , "STATIVO" ' +
                                ' ,"STFALTA"      , "STSOBRA" ' +
                        		' ) VALUES ("VAR_DB_NAME".SEQ_DETALHEORDEMTRANSFERENCIA.NEXTVAL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
            	var pStmtdetins7 = conn.prepareStatement(api.replaceDbName(querydetins7));

        	    pStmtdetins7.setString(1, pIdProduto);
        	    pStmtdetins7.setInt(2, pIdResumoOT);
                pStmtdetins7.setInt(3, bodyJson[0].dadosdetalheot[i].QTDEXPEDICAO);
                pStmtdetins7.setInt(4, bodyJson[0].dadosdetalheot[i].QTDRECEPCAO);
                pStmtdetins7.setInt(5, bodyJson[0].dadosdetalheot[i].QTDDIFERENCA);
                pStmtdetins7.setInt(6, bodyJson[0].dadosdetalheot[i].QTDAJUSTE);
                pStmtdetins7.setFloat(7, bodyJson[0].dadosdetalheot[i].VLRUNITVENDA);
                pStmtdetins7.setFloat(8, bodyJson[0].dadosdetalheot[i].VLRUNITCUSTO);
                pStmtdetins7.setString(9, bodyJson[0].dadosdetalheot[i].STCONFERIDO);
                setIntOrNull(pStmtdetins7, 10, bodyJson[0].dadosdetalheot[i].IDUSRAJUSTE);
                pStmtdetins7.setString(11, bodyJson[0].dadosdetalheot[i].STATIVO);
                pStmtdetins7.setString(12, bodyJson[0].dadosdetalheot[i].STFALTA);
                pStmtdetins7.setString(13, bodyJson[0].dadosdetalheot[i].STSOBRA);
        
                pStmtdetins7.execute();
                pStmtdetins7.close();
            }
    	}
    	pStmtdetupd7.close();
    	conn.commit();
    	
    	var cnx = $.db.getConnection();
    	var qry7 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "QTDDIFERENCA" = QTDEXPEDICAO - QTDRECEPCAO - QTDAJUSTE ' +
    		       'WHERE "IDRESUMOOT" = ?';
    	var pStmt7 = cnx.prepareStatement(api.replaceDbName(qry7));
    	pStmt7.setInt(1, pIdResumoOT);
    	pStmt7.execute();
    	pStmt7.close();
    	cnx.commit();
    }

    // rotina para realizar o encerramento  OT
    if(pIdStatusOT === 8){
        var query8 = "{ CALL \"QUALITY_CONC_HML\".\"SP_ENCERRAROT\"(?,?,?,?) }";
        var pStmt8 = conn.prepareCall(query8);
        pStmt8.setInt(1, pIdResumoOT);
        pStmt8.setInt(2, bodyJson[0].IDUSRAJUSTE);
        pStmt8.setInt(3, bodyJson[0].IDSTDIVERGENCIA);
        pStmt8.setString(4, bodyJson[0].OBSDIVERGENCIA);
        pStmt8.execute();
        pStmt8.close();
        conn.commit();

        // Validar Entrada / Acerto da NFE
        ot_acerto_nfe.executeEntradaNfe(pIdResumoOT);
    }

    // rotina para faturar a OT
    if(pIdStatusOT === 9){

        var query9 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "STEMISSAONFE" = ?, "NUMERONFE" = ?, "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW() ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt9 = conn.prepareStatement(api.replaceDbName(query9));
        
        for (i = 0; i < bodyJson.length; i++) {
            
            var registro = bodyJson[i];
            
            pStmt9.setString(1, 'True');
            pStmt9.setString(2, '');
            pStmt9.setInt(3, registro.IDSTATUSOT);
            pStmt9.setInt(4, registro.IDRESUMOOT);
        	pStmt9.execute();
        }

        pStmt9.close();
        conn.commit();
        
        for (var j = 0; j < bodyJson.length; j++) {
            if(bodyJson[j].NOTAFISCAL === 1){
                //return 'aqui';
                return saida_nfe.excuteSaidaNfe(bodyJson[j].IDRESUMOOT);
            }
        }
    }

    // rotina para liberar os pedidos
    if(pIdStatusOT === 10){

        var query10 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW() ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt10 = conn.prepareStatement(api.replaceDbName(query10));
        
        for (i = 0; i < bodyJson.length; i++) {
            
            registro = bodyJson[i];
            
            if (api.executeScalar('SELECT COUNT(1) FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA WHERE 1 = ? AND IDRESUMOOT = ' + pIdResumoOT + ' AND CONFEREITENS = \'True\' ', 1) > 0) {
                pStmt10.setInt(1, 11);
                pStmt10.setInt(2, registro.IDRESUMOOT);
            } else {
                pStmt10.setInt(1, 12);
                pStmt10.setInt(2, registro.IDRESUMOOT);
            }
        	pStmt10.execute();
        }

        pStmt10.close();
        conn.commit();

    }

    // rotina para salvar a OT que está sendo conferida
    if(pIdStatusOT === 11){

        var querydetupd11 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "QTDCONFERIDA" = ? ' +
    		              ' WHERE "IDRESUMOOT" = ? AND "IDPRODUTO" = ? ';
    	var pStmtdetupd11 = conn.prepareStatement(api.replaceDbName(querydetupd11));

    	for (i = 0; i < bodyJson[0].dadosdetalheot.length; i++) {
    	    
    	    pIdProduto = bodyJson[0].dadosdetalheot[i].IDPRODUTO;

            pStmtdetupd11.setInt(1, bodyJson[0].dadosdetalheot[i].QTDCONFERIDA);
            pStmtdetupd11.setInt(2, pIdResumoOT);
            pStmtdetupd11.setString(3, pIdProduto);
            pStmtdetupd11.execute();
    	}
    	pStmtdetupd11.close();
    	conn.commit();
    }

    // rotina para finaliar a OT que está sendo conferida
    if(pIdStatusOT === 12){

        var querydetupd12 = 'UPDATE "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" SET "QTDCONFERIDA" = ? ' +
    		              ' WHERE "IDRESUMOOT" = ? AND "IDPRODUTO" = ? ';
    	var pStmtdetupd12 = conn.prepareStatement(api.replaceDbName(querydetupd12));

    	for (i = 0; i < bodyJson[0].dadosdetalheot.length; i++) {
    	    
    	    pIdProduto = bodyJson[0].dadosdetalheot[i].IDPRODUTO;

            pStmtdetupd12.setInt(1, bodyJson[0].dadosdetalheot[i].QTDCONFERIDA);
            pStmtdetupd12.setInt(2, pIdResumoOT);
            pStmtdetupd12.setString(3, pIdProduto);
            pStmtdetupd12.execute();
    	}
    	pStmtdetupd12.close();

        var query12 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "QTDTOTALCONFERIDA" = ?, "DTCONFERIDA" = NOW(), "IDUSRCONFERIDA" = ?, "IDSTATUSOT" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt12 = conn.prepareStatement(api.replaceDbName(query12));
        
        for (i = 0; i < bodyJson.length; i++) {
            
            registro = bodyJson[i];
            
            pStmt12.setInt(1, registro.QTDTOTALCONFERIDA);
            pStmt12.setInt(2, registro.IDUSRCONFERIDA);
            if(lValidaConf === 'True'){
                pStmt12.setInt(3, 10);
            } else {
                pStmt12.setInt(3, 12);
            }
            pStmt12.setInt(4, registro.IDRESUMOOT);
        	pStmt12.execute();
        }
        pStmt12.close();
    	conn.commit();
    }

    // Finalizando a Conferência Correta dos Volumes
    if(pIdStatusOT === 13){
        var query13 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "STEMISSAONFE" = ?, "NUMERONFE" = ?, "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW(), ' +
                    ' "QTDTOTALVOLUMECONFERIDO" = ?, "DTVOLUMECONFERIDO" = NOW(), "IDUSRVOLUMECONFERIDO" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt13 = conn.prepareStatement(api.replaceDbName(query13));
        pStmt13.setString(1, 'True');
        pStmt13.setString(2, '');
        pStmt13.setInt(3, 3);
        pStmt13.setInt(4, bodyJson[0].QTDTOTALVOLUMECONFERIDO);
        pStmt13.setInt(5, bodyJson[0].IDUSRVOLUMECONFERIDO);
        pStmt13.setInt(6, pIdResumoOT);
    	pStmt13.execute();
        pStmt13.close();
        conn.commit();
    }

   // Finalizando a Conferência INCorreta dos Volumes
    if(pIdStatusOT === 14){

        var querydetupd14 = 'UPDATE "VAR_DB_NAME"."CONFEREVOLUMEOT" SET "STATIVO" = ? ' +
    		              ' WHERE "IDRESUMOOT" = ? ';
    	var pStmtdetupd14 = conn.prepareStatement(api.replaceDbName(querydetupd14));
        pStmtdetupd14.setString(1, 'False');
        pStmtdetupd14.setInt(2, pIdResumoOT);
        pStmtdetupd14.execute();
    	pStmtdetupd14.close();

        var query14 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "QTDTOTALVOLUMECONFERIDO" = ?, "DTVOLUMECONFERIDO" = NOW(), "IDUSRVOLUMECONFERIDO" = ?, "IDSTATUSOT" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt14 = conn.prepareStatement(api.replaceDbName(query14));
        
        pStmt14.setInt(1, bodyJson[0].QTDTOTALVOLUMECONFERIDO);
        pStmt14.setInt(2, bodyJson[0].IDUSRVOLUMECONFERIDO);
        pStmt14.setInt(3, 10);
        pStmt14.setInt(4, pIdResumoOT);
    	pStmt14.execute();
        pStmt14.close();
    	conn.commit();
    }

	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;
        
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}