var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let conn;

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

    var pDataIni = $.request.parameters.get("dpesqini");
    var pDataFin = $.request.parameters.get("dpesqfin");
    var idDist = $.request.parameters.get("idDist");

    var query = 
        'SELECT' +
        '   dc.IDDISTRIBUICAOCOMPRAS, dc.OBSERVACAO, dc.STATIVO, dc.IDFILIALORIGEM, dc.IDFABRICANTE, dc.IDTIPOMERCADORIA, dc.IDUSUARIO ' +
        '   ,IFNULL(TO_VARCHAR(dc.DATACRIACAO,\'YYYY-MM-DD HH24:MI:SS\'), \'\') AS DATACRIACAO ' +
        '   ,IFNULL(TO_VARCHAR(dc.DATACRIACAO,\'DD/MM/YYYY\'), \'Não Informado\') AS DATACRIACAOFORMATADA ' +
        '   ,(SELECT IFNULL(NOFANTASIA, \'\') FROM "VAR_DB_NAME".EMPRESA WHERE IDEMPRESA = dc.IDFILIALORIGEM) AS FILIALORIGEM ' +
        '   ,(SELECT IFNULL(DSFABRICANTE, \'\') FROM "VAR_DB_NAME".FABRICANTE WHERE IDFABRICANTE = dc.IDFABRICANTE) AS DSFABRICANTE ' +
        '   ,(SELECT COUNT(*) FROM "VAR_DB_NAME".DQ_DISTRIBUICAOPEDIDOS WHERE IDDISTRIBUICAOCOMPRAS = dc.IDDISTRIBUICAOCOMPRAS) AS STATUS ' +
        'FROM "VAR_DB_NAME".DQ_DISTRIBUICAOCOMPRAS dc ' +
        'WHERE 1 = ? '
    ;

    if(byId){
        query = query + 'AND dc.IDRESUMOENTRADA IN (' + byId + '\) ';
    }
    
    if(pDataIni){
        query = query + ' AND dc.DATACRIACAO >= \'' + pDataIni + ' 00:00:00\' ';
    }
    
    if(pDataFin){
        query = query + ' AND dc.DATACRIACAO <= \'' + pDataFin + ' 23:59:59\' ';
    }
    
    if(idDist){
        query += ` AND dc.IDDISTRIBUICAOCOMPRAS = ${idDist} `;
    }

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

function fnDistribuicaoProdutoItens(nIdDistribuicaoCompras, nIdProdutosNotas, aDistribuicaoProdutoItens){

    var conndpi = conn;//$.db.getConnection();

    var query = 'INSERT INTO "VAR_DB_NAME"."DQ_DISTRIBUICAOPRODUTOITENS" ( ' +
        		' "IDDISTRIBUICAOPRODUTOITENS", "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "STATIVO", "IDFILIALDESTINO", "IDPRODUTOSNOTAS", "QUANTIDADE" ' +
        		' ) VALUES ("VAR_DB_NAME".SEQ_DQ_DISTRIBUICAOPRODUTOITENS.NEXTVAL, ?, NOW(), ?, ?, ?, ?) ';
	var pStmt = conndpi.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < aDistribuicaoProdutoItens.length; i++) {
	    pStmt.setInt(1, nIdDistribuicaoCompras);
	    pStmt.setString(2, aDistribuicaoProdutoItens[i].STATIVO);
        pStmt.setInt(3, parseInt(aDistribuicaoProdutoItens[i].IDFILIALDESTINO));
        pStmt.setInt(4, nIdProdutosNotas);
        pStmt.setInt(5, parseInt(aDistribuicaoProdutoItens[i].QUANTIDADE));
        pStmt.execute();
	}
	
	pStmt.close();
	conndpi.commit();
}

function fnProdutosNotas(nIdDistribuicaoCompras, aProdutoNota, aDistribuicaoProdutoItens, conn){

    var connpn = conn;//$.db.getConnection();

    var query = 'INSERT INTO "VAR_DB_NAME"."DQ_PRODUTOSNOTAS" ( ' +
        		' "IDPRODUTOSNOTAS", "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "STATIVO", "IDPRODUTO", "DSNOME", "NUCODBARRAS", "IDLINHASAP", "QTDPRODUTO" ' +
        		' ,"PRECO", "TOTAL", "QTDRESTANTE", "IDNOTASAP", "NNF" ' +
        		' ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ';
	var pStmt = connpn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < aProdutoNota.length; i++) {
	    var nIdProdutosNotas = api.executeScalar('SELECT "VAR_DB_NAME".SEQ_DQ_PRODUTOSNOTAS.NEXTVAL FROM DUMMY WHERE 1 = ?', 1);
	    pStmt.setInt(1, parseInt(nIdProdutosNotas));
	    pStmt.setInt(2, parseInt(nIdDistribuicaoCompras));
	    pStmt.setString(3, aProdutoNota[i].STATIVO);
        pStmt.setString(4, aProdutoNota[i].IDPRODUTO);
        pStmt.setString(6, aProdutoNota[i].NUCODBARRAS);
        pStmt.setInt(7, parseInt(aProdutoNota[i].IDLINHASAP));
        pStmt.setInt(8, parseInt(aProdutoNota[i].QTDPRODUTO));
        pStmt.setString(5, aProdutoNota[i].DSNOME);
        pStmt.setFloat(9, parseFloat(aProdutoNota[i].PRECO));
        pStmt.setFloat(10, parseFloat(aProdutoNota[i].TOTAL));
        pStmt.setInt(11, parseInt(aProdutoNota[i].QTDRESTANTE));
        pStmt.setString(12, aProdutoNota[i].IDNOTASAP);
        pStmt.setInt(13, parseInt(aProdutoNota[i].NNF));
        pStmt.execute();

        // criar a DQ_DISTRIBUICAOPRODUTOITENS
        fnDistribuicaoProdutoItens(nIdDistribuicaoCompras, nIdProdutosNotas, aDistribuicaoProdutoItens[i]);
	}
	
	pStmt.close();
//	connpn.commit();
}

function fnNotaFiscal(nIdDistribuicaoCompras, aNotaFiscal, conn){

    var connnf = conn;//$.db.getConnection();

    var query = 'INSERT INTO "VAR_DB_NAME"."DQ_NOTASCOMPRAS" ( ' +
        		' "IDNOTASCOMPRAS", "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "STATIVO", "IDNOTASAP", "STSALDO", "NUMNOTAFISCAL" ' +
        		' ) VALUES ("VAR_DB_NAME".SEQ_DQ_NOTASCOMPRAS.NEXTVAL, ?, NOW(), ?, ?, ?, ?) ';
	var pStmt = connnf.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < aNotaFiscal.length; i++) {
	    pStmt.setInt(1, parseInt(nIdDistribuicaoCompras));
	    pStmt.setString(2, aNotaFiscal[i].STATIVO);
        pStmt.setString(3, aNotaFiscal[i].IDNOTASAP);
        pStmt.setString(4, aNotaFiscal[i].STSALDO);
        pStmt.setInt(5, parseInt(aNotaFiscal[i].NUMNOTAFISCAL));
        pStmt.execute();
	}
	
	pStmt.close();
//	connnf.commit();
}

function fnHandlePost(){

    conn = $.db.getConnection();
    
    var nIdDistribuicaoCompras = api.executeScalar('SELECT "VAR_DB_NAME".SEQ_DQ_DISTRIBUICAOCOMPRAS.NEXTVAL FROM DUMMY WHERE 1 = ?', 1);

    var query = 'INSERT INTO "VAR_DB_NAME"."DQ_DISTRIBUICAOCOMPRAS" ( ' +
        		' "IDDISTRIBUICAOCOMPRAS", "DATACRIACAO", "OBSERVACAO", "STATIVO", "IDFILIALORIGEM", "IDFABRICANTE", "IDTIPOMERCADORIA", "IDUSUARIO" ' +
        		' ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?) ';
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

    var bodyJson = JSON.parse($.request.body.asString());

    pStmt.setInt(1, parseInt(nIdDistribuicaoCompras));
    pStmt.setString(2, bodyJson[0].OBSERVACAO);
    pStmt.setString(3, bodyJson[0].STATIVO);
    pStmt.setInt(4, parseInt(bodyJson[0].IDFILIALORIGEM));
    pStmt.setInt(5, parseInt(bodyJson[0].IDFABRICANTE));
    pStmt.setInt(6, parseInt(bodyJson[0].IDTIPOMERCADORIA));
    pStmt.setInt(7, parseInt(bodyJson[0].IDUSUARIO));
    pStmt.execute();
    pStmt.close();

    // criar a DQ_NOTASCOMPRAS
    fnNotaFiscal(nIdDistribuicaoCompras, bodyJson[0].dadosnotafiscal, conn);
    
    // criar a DQ_PRODUTOSNOTAS
    fnProdutosNotas(nIdDistribuicaoCompras, bodyJson[0].produtosnotas, bodyJson[0].distribuicaoprodutoitens, conn);

    conn.commit();
        
    return {
        IdDistribuicaoCompras: nIdDistribuicaoCompras,
        "msg": "Inclusão realizada com sucesso!"
    };

}

function fnHandlePut(){

    conn = $.db.getConnection();

    var bodyJson = JSON.parse($.request.body.asString());

    var pIdDistribuicaoCompras = parseInt(bodyJson[0].IDDISTRIBUICAOCOMPRAS);
    var pFuncao = bodyJson[0].FUNCAO;

    if(pFuncao === "Tela"){
        var querydel1 = 'DELETE FROM "VAR_DB_NAME".DQ_DISTRIBUICAOPRODUTOITENS WHERE IDDISTRIBUICAOCOMPRAS = ?';
        var pStmtdel1 = conn.prepareStatement(api.replaceDbName(querydel1));
        pStmtdel1.setInt(1, pIdDistribuicaoCompras);
        pStmtdel1.execute();
        pStmtdel1.close();
    
        var querydel2 = 'DELETE FROM "VAR_DB_NAME".DQ_PRODUTOSNOTAS WHERE IDDISTRIBUICAOCOMPRAS = ?';
        var pStmtdel2 = conn.prepareStatement(api.replaceDbName(querydel2));
        pStmtdel2.setInt(1, pIdDistribuicaoCompras);
        pStmtdel2.execute();
        pStmtdel2.close();
    
        var querydel3 = 'DELETE FROM "VAR_DB_NAME".DQ_NOTASCOMPRAS WHERE IDDISTRIBUICAOCOMPRAS = ?';
        var pStmtdel3 = conn.prepareStatement(api.replaceDbName(querydel3));
        pStmtdel3.setInt(1, pIdDistribuicaoCompras);
        pStmtdel3.execute();
        pStmtdel3.close();
    
        var query = 'UPDATE "VAR_DB_NAME"."DQ_DISTRIBUICAOCOMPRAS" SET ' +
                    '   "DATACRIACAO" = NOW(), "OBSERVACAO" = ?, "STATIVO" = ?, "IDFILIALORIGEM" = ?, "IDFABRICANTE" = ?' +
                    '   ,"IDTIPOMERCADORIA" = ?, "IDUSUARIO" = ? ' +
                    'WHERE "IDDISTRIBUICAOCOMPRAS" = ? ';
        var pStmt = conn.prepareStatement(api.replaceDbName(query));
        pStmt.setString(1, bodyJson[0].OBSERVACAO);
        pStmt.setString(2, bodyJson[0].STATIVO);
        pStmt.setInt(3, parseInt(bodyJson[0].IDFILIALORIGEM));
        pStmt.setInt(4, parseInt(bodyJson[0].IDFABRICANTE));
        pStmt.setInt(5, parseInt(bodyJson[0].IDTIPOMERCADORIA));
        pStmt.setInt(6, parseInt(bodyJson[0].IDUSUARIO));
        pStmt.setInt(7, pIdDistribuicaoCompras);
    	pStmt.execute();
        pStmt.close();
    
        // criar a DQ_NOTASCOMPRAS
        fnNotaFiscal(pIdDistribuicaoCompras, bodyJson[0].dadosnotafiscal, conn);
        
        // criar a DQ_PRODUTOSNOTAS
        fnProdutosNotas(pIdDistribuicaoCompras, bodyJson[0].produtosnotas, bodyJson[0].distribuicaoprodutoitens, conn);
    
        conn.commit();
    } else {
        var nIdDistribuicaoCompras = parseInt(bodyJson[0].IDDISTRIBUICAOCOMPRAS);
        var nIdProdutosNotas = 0;
        var cNuCodBarras = "";
        var nIdNotaSap = 0;
        var dsNome;
        
        var queryUpd =  `
            UPDATE 
                "VAR_DB_NAME"."DQ_DISTRIBUICAOPRODUTOITENS" 
            SET
                "DATACRIACAO" = CURRENT_TIMESTAMP,  
                "QUANTIDADE" = ?
            WHERE 
                "IDDISTRIBUICAOCOMPRAS" = ? 
                AND "IDFILIALDESTINO" = ? 
                AND "IDPRODUTOSNOTAS" = ?
        `;
        
        var pStmtUpd = conn.prepareStatement(api.replaceDbName(queryUpd));
        
        for (let i = 0; i < bodyJson[0].produtosnotas.length; i++) {
            cNuCodBarras = bodyJson[0].produtosnotas[i].NUCODBARRAS;
            nIdNotaSap = parseInt(bodyJson[0].produtosnotas[i].IDNOTASAP);
            dsNome = bodyJson[0].produtosnotas[i].DSNOME;
            
            let queryIdProdNotas = `
                SELECT 
                    IDPRODUTOSNOTAS 
                FROM 
                    "VAR_DB_NAME"."DQ_PRODUTOSNOTAS" 
                WHERE 
                    NUCODBARRAS = '${cNuCodBarras}' 
                    AND NNF = ${nIdNotaSap} 
                    AND "IDDISTRIBUICAOCOMPRAS" = ? 
            `;
            
            nIdProdutosNotas = api.executeScalar(queryIdProdNotas, parseInt(bodyJson[0].IDDISTRIBUICAOCOMPRAS));
            
            
            for (let j = 0; j < bodyJson[0].distribuicaoprodutoitens[i].length; j++) {
                let qtd = bodyJson[0].distribuicaoprodutoitens[i][j].QUANTIDADE;
                let idFilialDestino = bodyJson[0].distribuicaoprodutoitens[i][j].IDFILIALDESTINO;
                
                let queryStAndQtdNota = `
                    SELECT
                        pn.IDPRODUTOSNOTAS,
                        pn.IDDISTRIBUICAOCOMPRAS,
                        pn.DATACRIACAO,
                        pn.STATIVO,
                        pn.IDPRODUTO,
                        pn.DSNOME,
                        pn.NUCODBARRAS,
                        pn.IDLINHASAP,
                        pn.QTDPRODUTO,
                        pn.PRECO,
                        pn.TOTAL,
                        pn.IDNOTASAP,
                        IFNULL((
                            SELECT SUM(DISTINCT pn1.QTDPRODUTO) - SUM(dpi.QUANTIDADE)
                            FROM "VAR_DB_NAME".DQ_PRODUTOSNOTAS pn1
                            INNER JOIN "VAR_DB_NAME".DQ_DISTRIBUICAOPRODUTOITENS dpi ON dpi.IDPRODUTOSNOTAS = pn1.IDPRODUTOSNOTAS AND dpi.STATIVO = 'True'
                            WHERE pn1.STATIVO = 'True'
                            AND pn1.IDNOTASAP = pn.IDNOTASAP
                            AND pn1.IDPRODUTO = pn.IDPRODUTO
                        ), 0) AS QTDRESTANTE,
                        nc.NUMNOTAFISCAL,
                        nc.STSALDO,
                        IFNULL(TBD.QUANTIDADE, 0) AS QTDDIGITAANTERIOR
                    FROM "VAR_DB_NAME".DQ_PRODUTOSNOTAS pn
                    INNER JOIN "VAR_DB_NAME".DQ_NOTASCOMPRAS nc ON 
                        nc.IDDISTRIBUICAOCOMPRAS = pn.IDDISTRIBUICAOCOMPRAS AND nc.IDNOTASAP = pn.IDNOTASAP
                    INNER JOIN "VAR_DB_NAME".DQ_DISTRIBUICAOPRODUTOITENS TBD ON 
                        pn.IDDISTRIBUICAOCOMPRAS = TBD.IDDISTRIBUICAOCOMPRAS AND TBD.IDPRODUTOSNOTAS = pn.IDPRODUTOSNOTAS
                    WHERE 
                        pn.NUCODBARRAS = '${cNuCodBarras}' 
                        AND pn.NNF = ${nIdNotaSap} 
                        AND TBD.IDFILIALDESTINO = ${idFilialDestino}
                        AND pn.IDDISTRIBUICAOCOMPRAS = ?
                `;
                
                let regStAndQtdNota = api.sqlQuery(queryStAndQtdNota, parseInt(bodyJson[0].IDDISTRIBUICAOCOMPRAS))
                
                if(!regStAndQtdNota.length){
                    throw {
                        message: 'A nota não pertence a essa distribuição, adicione a nota, salve e tente novamente!'
                    }
                }
                
                let { STSALDO, QTDRESTANTE, QTDDIGITAANTERIOR } = regStAndQtdNota[0];
             
                if(STSALDO !== 'True') {
                    
                    QTDRESTANTE += QTDDIGITAANTERIOR;
                    
                    if(Number(QTDRESTANTE) < Number(qtd)){
                        throw {
                            message: `A quantidade inserida do item: ( ${dsNome} ; Cod. Barras: ${cNuCodBarras} ) é maior que a quantidade disponível!`
                        }
                    }
                }
                
                pStmtUpd.setInt(1, parseInt(qtd));
                pStmtUpd.setInt(2, parseInt(nIdDistribuicaoCompras));
                pStmtUpd.setInt(3, parseInt(idFilialDestino));
                pStmtUpd.setInt(4, parseInt(nIdProdutosNotas));
                pStmtUpd.execute();
            }
        }   
        
        pStmtUpd.close(); 
        conn.commit();
        
    }
    
	return {
	    msg : "Atualização realizada com sucesso!"
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

        default:
            break;
    }
} catch(e) {
    conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}