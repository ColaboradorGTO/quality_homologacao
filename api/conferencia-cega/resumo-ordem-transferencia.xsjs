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

function buscaIdResumoParaInsercao(){
    let querySearch = `
        SELECT 
            IDRESUMOOT
        FROM 
            "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA"
        WHERE 
            IDRESUMOOT = ?
    `;
    
    let queryNextVal = `
        SELECT 
            "VAR_DB_NAME".SEQ_RESUMOORDEMTRANSFERENCIA.NEXTVAL 
        FROM 
            DUMMY 
        WHERE 
            1 = ?
    `;
    
    let idResumo = api.executeScalar(queryNextVal, 1);
    let regQuery = api.sqlQuery(querySearch, idResumo);
    
    if(regQuery.length > 0){
        return buscaIdResumoParaInsercao();
    }
    
    return idResumo;
}

function fnHandleGet(byId) {

    var idTipoFiltro = parseInt($.request.parameters.get("idtipofiltro"));
    var idEmpresaOrigem = parseInt($.request.parameters.get("idEmpresaOrigem"));
    var idEmpresaDestino = parseInt($.request.parameters.get("idEmpresaDestino"));
    var dataPesqInicio = $.request.parameters.get("datapesqinicio");
    var dataPesqFim = $.request.parameters.get("datapesqfim");

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
                ' FROM "VAR_DB_NAME".RESUMOORDEMTRANSFERENCIA rot ' +
                ' JOIN "VAR_DB_NAME".STATUSORDEMTRANSFERENCIA sot ON sot.IDSTATUSOT = rot.IDSTATUSOT ' +
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
        query = query + ' AND rot.DATAEXPEDICAO <= \'' + dataPesqFim +' 23:59:59\' ';
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

function fnDetalheOT(pIdResumoOT, aDetalheOT, conn){

    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEORDEMTRANSFERENCIA" ( ' +
        		' "IDPRODUTO"    , "IDRESUMOOT"   , "QTDEXPEDICAO" ' +
                ' ,"QTDRECEPCAO"  , "QTDDIFERENCA" , "QTDAJUSTE"    , "VLRUNITVENDA" ' +
                ' ,"VLRUNITCUSTO" , "STCONFERIDO"  , "IDUSRAJUSTE"  , "STATIVO" ' +
                ' ,"STFALTA"      , "STSOBRA" ' +
        		' ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

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

}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    //if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    let conn = $.db.getConnection();

    let queryInsert = `
        INSERT INTO "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" (
            "IDRESUMOOT"                  , "IDEMPRESAORIGEM"     , "IDEMPRESADESTINO"    , "DATAEXPEDICAO"
            ,"IDOPERADOREXPEDICAO"        , "NUTOTALITENS"        , "QTDTOTALITENS"       , "QTDTOTALITENSRECEPCIONADO"
            ,"QTDTOTALITENSDIVERGENCIA"   , "NUTOTALVOLUMES"      , "TPVOLUME"            , "VRTOTALCUSTO"
            ,"VRTOTALVENDA"               , "DTRECEPCAO"          , "IDOPERADORRECEPTOR"  , "DSOBSERVACAO"
            ,"IDUSRCANCELAMENTO"          , "DTULTALTERACAO"      , "IDSTDIVERGENCIA"     , "OBSDIVERGENCIA"
            ,"STEMISSAONFE"               , "NUMERONFE"           , "STENTRADAINVENTARIO" , "QTDCONFERENCIA"
            ,"IDSTATUSOT"                 , "IDUSRAJUSTE"         , "DTAJUSTE"            , "QTDTOTALITENSAJUSTE"
        ) VALUES (
            ?, ?, ?, NOW(), 
            ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, ?, ?, ?, 
            ?, NOW(), ?, ?, 
            ?, ?, ?, ?,
            ?, ?, ?, ?
        )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    let pIdResumoOT = buscaIdResumoParaInsercao();
    
    pStmt.setInt(1, pIdResumoOT);
    pStmt.setInt(2, bodyJson[0].IDEMPRESAORIGEM);
    pStmt.setInt(3, bodyJson[0].IDEMPRESADESTINO);
    pStmt.setInt(4, bodyJson[0].IDOPERADOREXPEDICAO);
    pStmt.setInt(5, bodyJson[0].NUTOTALITENS);
    pStmt.setInt(6, bodyJson[0].QTDTOTALITENS);
    pStmt.setInt(7, bodyJson[0].QTDTOTALITENSRECEPCIONADO);
    pStmt.setInt(8, bodyJson[0].QTDTOTALITENSDIVERGENCIA);
    pStmt.setInt(9, bodyJson[0].NUTOTALVOLUMES);
    pStmt.setString(10, bodyJson[0].TPVOLUME);
    pStmt.setFloat(11, bodyJson[0].VRTOTALCUSTO);
    pStmt.setFloat(12, bodyJson[0].VRTOTALVENDA);
    setDateOrNull(pStmt, 13, bodyJson[0].DTRECEPCAO);
    setIntOrNull(pStmt, 14, bodyJson[0].IDOPERADORRECEPTOR);
    pStmt.setString(15, bodyJson[0].DSOBSERVACAO);
    setIntOrNull(pStmt, 16, bodyJson[0].IDUSRCANCELAMENTO);
    setIntOrNull(pStmt, 17, bodyJson[0].IDSTDIVERGENCIA);
    pStmt.setString(18, bodyJson[0].OBSDIVERGENCIA);
    pStmt.setString(19, bodyJson[0].STEMISSAONFE);
    pStmt.setString(20, bodyJson[0].NUMERONFE);
    pStmt.setString(21, bodyJson[0].STENTRADAINVENTARIO);
    pStmt.setInt(22, bodyJson[0].QTDCONFERENCIA);
    pStmt.setInt(23, bodyJson[0].IDSTATUSOT);
    setIntOrNull(pStmt, 24, bodyJson[0].IDUSRAJUSTE);
    setDateOrNull(pStmt, 25, bodyJson[0].DTAJUSTE);
    pStmt.setInt(26, bodyJson[0].QTDTOTALITENSAJUSTE);
    pStmt.execute();
    pStmt.close();

    fnDetalheOT(pIdResumoOT, bodyJson[0].dadosdetalheot, conn);

	conn.commit();
	
	return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}

function fnHandlePut(){

    var conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());
   // if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    var pIdEmpresaOrigem = parseInt(bodyJson[0].IDEMPRESAORIGEM);
    var pIdStatusOT = parseInt(bodyJson[0].IDSTATUSOT);
    var pIdResumoOT = parseInt(bodyJson[0].IDRESUMOOT);

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
    	fnDetalheOT(pIdResumoOT, bodyJson[0].dadosdetalheot, conn);
    	conn.commit();
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
    if(pIdStatusOT === 3){
        var query3 = 'UPDATE "VAR_DB_NAME"."RESUMOORDEMTRANSFERENCIA" SET ' +
                    ' "STEMISSAONFE" = ?, "NUMERONFE" = ?, "IDSTATUSOT" = ?, "DTULTALTERACAO" = NOW(), ' +
                    ' "NUTOTALVOLUMES" = ?, "TPVOLUME" = ? ' +
                	' WHERE "IDRESUMOOT" = ? ';
        var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
        pStmt3.setString(1, 'True');
        pStmt3.setString(2, '');
        pStmt3.setInt(3, pIdStatusOT);
        pStmt3.setInt(4, bodyJson[0].NUTOTALVOLUMES);
        pStmt3.setString(5, bodyJson[0].TPVOLUME);
        pStmt3.setInt(6, pIdResumoOT);
    	pStmt3.execute();
        pStmt3.close();
        conn.commit();
        /*if(bodyJson.NOTAFISCAL === 1){
            //return 'aqui';
            saida_nfe.excuteSaidaNfe(pIdResumoOT);
        }*/
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
                saida_nfe.excuteSaidaNfe(bodyJson[j].IDRESUMOOT);
            }
        }
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