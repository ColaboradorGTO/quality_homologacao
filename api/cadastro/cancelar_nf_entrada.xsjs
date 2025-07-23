var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.notas-entrada.cancelar-nota-entrada", "slApi"); 
var msg;

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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function fnDesfazVinculoNotaPedido(idResumoEntrada, conn) {
    let query = `UPDATE "VAR_DB_NAME"."VINCPEDIDONOTA" SET 
             "STATIVO" = 'False'
    	     WHERE "IDRESUMOENTRADA" = ${idResumoEntrada}`;
        
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
                    
    pStmt.execute();
	pStmt.close();
	
	fnDesfazVinculoQtdPedidoQtdNFE(idResumoEntrada, conn)
}

function fnDesfazVinculoQtdPedidoQtdNFE(idResumoEntrada, conn){
    let pStmtAtualizaStatus;
    
    let queryExistsReg = `  SELECT
                            	tbrp."IDEMPRESA",
                            	tbdp."IDDETALHEENTRADA",
                            	tbdp."IDPRODUTO",
                            	tbdp."QCOM"
                            FROM
                            	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" tbrp
                            INNER JOIN "VAR_DB_NAME"."DETALHEENTRADANFEPEDIDO" tbdp ON
                            	tbrp."IDRESUMOENTRADA" = tbdp."IDRESUMOENTRADA"
                            LEFT JOIN VINCDETPEDIDODETNOTA tbvn ON 
                            	tbdp.IDDETALHEENTRADA = tbvn.IDDETALHEENTRADA AND tbvn.STATIVO = 'True'
                            WHERE 
                            	tbdp.IDRESUMOENTRADA = ? `;
    
    let lstDetNota = api.sqlQuery(queryExistsReg, parseInt(idResumoEntrada));

	for (let i = 0; i < lstDetNota.length; i++) {
	    
	   let registro = lstDetNota[i];
	    
       let queryAtualizaStatus = ` UPDATE "VAR_DB_NAME"."VINCDETPEDIDODETNOTA" SET
            STATIVO= 'False'
    		WHERE "IDDETALHEENTRADA" =  ? `;
            
        pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
        pStmtAtualizaStatus.setInt(1, parseInt(registro.IDDETALHEENTRADA));
        pStmtAtualizaStatus.execute();
	}
	
	pStmtAtualizaStatus.close();
	
    fnDesfazMovimentaInventario(lstDetNota, conn);

	/*return {
	    "statusPost": "Success",
	    msg: 
	};*/
    
}

function fnDesfazMovimentaInventario(lstDetProdRecepcao, conn) {
    let idEmpresa;
    let qtdInicio = 0;
	let qtdEntrada = 0;
	let qtdSaida = 0;
	let qtdSaidaTransferencia = 0;
	let qtdRetornoAjustePedido = 0;
	let qtdFinal = 0;
	let qtdAjusteBalanco = 0;
	let qtdEntradaVoucher = 0;
	
	let date = new Date();
	let dd = ("0" + date.getDate()).slice(-2);
    let mm = ("0" + (date.getMonth() + 1)).slice(-2);
    let y = date.getFullYear();
 
    let dataAtual = y + '-' + mm + '-' + dd;
    let conn2 = conn; //$.db.getConnection();
		
    for (let i = 0; i < lstDetProdRecepcao.length; i++) {
        let registro = lstDetProdRecepcao[i];

        idEmpresa = registro.IDEMPRESA;
        
        let queryExistsMov = ' SELECT *  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataAtual + ' 00:00:00\' AND \'' + dataAtual + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         let idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
        if(idMovExists.length === 0){
            qtdInicio = 0;
            let queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            let UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntrada = parseInt(registro.QCOM);
               qtdFinal =  qtdInicio - qtdEntrada;
               //Atualiza o status para false do Ultimo Movimento
               let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                let pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntrada = parseInt(registro.QCOM);
               qtdFinal = qtdInicio - qtdEntrada;
            }
            
            
    	    let query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    	    ' "QTDENTRADAVOUCHER", '+
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO" ' +
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
    
        	let pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idEmpresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn2.commit();
        }else{
    
            qtdEntrada = parseInt(idMovExists[0].QTDENTRADA) - parseInt(registro.QCOM);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + qtdEntrada - parseInt(idMovExists[0].QTDSAIDA) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
             let queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADA" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
            let pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
        	pStmt2.setInt(1, qtdEntrada);
        	pStmt2.setInt(2, qtdFinal);
        	
            pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
            pStmt2.execute();
            pStmt2.close();
            
            conn2.commit();
        }
        
    }
   
   return {
       msg: 'Estoque Atualizado com Sucesso!'
   }
}

function fnHandleGet(byId) {
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var numSerie = $.request.parameters.get("numSerie");
    var numNFE = $.request.parameters.get("numNFE");
    var sttransformado = $.request.parameters.get("sttransformado");
    var idFornecedores = $.request.parameters.get("idFornecedores");

    var query =  `SELECT
    	"IDRESUMOENTRADA",
    	"IDGRUPOEMPRESARIAL",
    	"IDSUBGRUPOEMPRESARIAL",
    	"IDEMPRESA",
    	"IDFORNECEDOR",
    	"IDRESUMOPEDIDO",
    	"CUF",
    	"CNF",
    	"NATOP",
    	"INDPAG",
    	"XMOD",
    	"SERIE",
    	"NNF",
    	"DEMI",
    	"DSAIENT",
    	"TPNF",
    	"CMUNFG",
    	"TPIMP",
    	"TPEMIS",
    	"CDV",
    	"TPAMB",
    	"FINNFE",
    	"PROCEMI",
    	"VERPROC",
    	"XMOTIVO",
    	"NPROT",
    	"EMIT_CPF",
    	"EMIT_CNPJ",
    	"EMIT_XNOME",
    	"EMIT_XFANT",
    	"EMIT_XLGR",
    	"EMIT_NRO",
    	"EMIT_XBAIRRO",
    	"EMIT_CMUN",
    	"EMIT_XMUN",
    	"EMIT_UF",
    	"EMIT_CEP",
    	"EMIT_CPAIS",
    	"EMIT_XPAIS",
    	"EMIT_FONE",
    	"EMIT_IE",
    	"EMIT_IM",
    	"EMIT_CNAE",
    	"EMIT_CRT",
    	"DEST_CNPJ",
    	"DEST_XNOME",
    	"DEST_XLGR",
    	"DEST_NRO",
    	"DEST_XBAIRRO",
    	"DEST_CMUN",
    	"DEST_XMUN",
    	"DEST_UF",
    	"DEST_CEP",
    	"DEST_CPAIS",
    	"DEST_XPAIS",
    	"DEST_IE",
    	"VBC",
    	"VICMS",
    	"VBCST",
    	"VST",
    	"VPROD",
    	"VNF",
    	"VFRETE",
    	"VSEG",
    	"VDESC",
    	"VIPI",
    	"VPIS",
    	"VCOFINS",
    	"VOUTRO",
    	"STDIVERGENCIA",
    	"STCONCLUIDO",
    	"NDUPLICATA",
    	"VENCIDUPLICATADATE",
    	"VALORDUPLICATA",
    	"STNFE",
    	"DTCADASTRO"
    FROM
    	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO"
    WHERE
    	1 = ?`;
    	
    var query2 =  `SELECT DISTINCT
    	"IDFORNECEDOR",
    	"EMIT_XNOME",
    	"EMIT_XFANT"
    FROM
    	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO"
    WHERE
        1 = ?`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    if ( byId ) {
        query = query + ' And  IDRESUMOENTRADA = \'' + byId + '\' ';
    }
    if ( idPedido ) {
        query = query + ' And  IDRESUMOPEDIDO = \'' + idPedido + '\' ';
    }

    if ( idFornecedor ) {
        query = `${query} AND IDFORNECEDOR = ${idFornecedor}`;
    }

    if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND ((DEMI BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
        query = query + ' OR (DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\'))';
    }
    
    if(numSerie && numNFE) {
        query = `${query}  AND SERIE = ${numSerie} AND  NNF = ${numNFE}`;
    }
    
    if ( idFornecedores == 'todos' ) {
        api.responseWithQuery(query2, request, 1);
    }
    
    query = query + ' ORDER BY DTCADASTRO, DEMI ';
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    
    let query = `UPDATE
                 	 "VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO"
                 SET
                 	"STCANCELADO" = 'True'
                 WHERE
                 	"IDRESUMOENTRADA" = ? `;
   
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    for (let i = 0; i < bodyJson.length; i++) {

		let registro = bodyJson[i];

        let queryExistsReg = `SELECT
                            	*
                              FROM
                             	"VAR_DB_NAME"."RESUMOENTRADANFEPEDIDO" tbrp
                              WHERE
                            	tbrp.STCANCELADO = 'False'
                            	AND tbrp.IDRESUMOENTRADA = ? `;

        let existReg = api.sqlQuery(queryExistsReg, parseInt(registro.IDRESUMOENTRADA));
        
        if(existReg.length > 0){
            let respSap = slApi.executeCancelarNfe(registro.IDRESUMOENTRADA);
            
            if(true || respSap == 'True'){
            
        		pStmt.setInt(1, parseInt(registro.IDRESUMOENTRADA));
            	pStmt.execute();
            	
            	fnDesfazVinculoNotaPedido(registro.IDRESUMOENTRADA, conn);
            	
            } else {
                return {
            	    statusPost: 'warning',
            	    msg : "Nota não cancelada!",
            	    "msgSAP": respSap
        	    };
            }
            
        } else {
            return {
        	    statusPost: 'warning',
        	    msg : "Esta nota já foi cancelada!"
        	};
        }
    }
        
    pStmt.close();
    	
	return {
	    statusPost: 'Success',
	    msg : "Nota cancelada com sucesso!"
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
        // case $.net.http.POST:
        //     var doc = fnHandlePost();
        //      $.response.setBody(JSON.stringify(doc));
        //     break;            
        // default:
        //     break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}