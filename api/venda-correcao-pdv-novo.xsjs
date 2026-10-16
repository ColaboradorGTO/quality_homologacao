let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function deleteVendaPagamento(idvenda, conn) {
    let queryDelete = `
        DELETE FROM "VAR_DB_NAME".VENDAPAGAMENTO
        WHERE 
            IDVENDA = ?;
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryDelete));
    let cont = 0;

    try {
        pStmt.setString(++cont, idvenda);
        pStmt.execute();
    } catch(error) {
        throw error;
    } finally {
        pStmt.close();
    }
    
    return true;
}

function PutVendaPagamento(idvenda, tagPag, conn) {
    deleteVendaPagamento(idvenda, conn);
    
    let query = `
        INSERT INTO "VAR_DB_NAME".VENDAPAGAMENTO
           (
                IDVENDAPAGAMENTO, IDVENDA, NITEM, TPAG, DSTIPOPAGAMENTO,
                VALORRECEBIDO, VALORDEDUZIDO, VALORLIQUIDO, DTPROCESSAMENTO, 
                DTVENCIMENTO, NPARCELAS, NOTEF, NOAUTORIZADOR, NOCARTAO,NUOPERACAO, 
                NSUTEF, NSUAUTORIZADORA, NUAUTORIZACAO, CPF, NOME
            )
        VALUES 
        (   
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?, 
            ?, ?, ?, ?, ?
        )
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    try {
    	for (let i = 0; i < tagPag.length; i++) {
    		let registro = tagPag[i];
    		let cont = 0;
    
    		pStmt.setString(++cont, `${idvenda}-${registro["@nItem"]}`);
    		pStmt.setString(++cont, idvenda);
    		pStmt.setString(++cont, registro["@nItem"]);
    		pStmt.setString(++cont, registro.detPag.tPag);
    		pStmt.setString(++cont, registro.detPag.DSTipoPagamento);
    		pStmt.setFloat(++cont, registro.detPag.ValorRecebido);
    		pStmt.setFloat(++cont, registro.detPag.ValorDeduzido||0.0);
    		pStmt.setFloat(++cont, registro.detPag.ValorLiquido||0.0);
    		setTimestampOrNull(pStmt, ++cont, registro.detPag.DTProcessamento);
    		setTimestampOrNull(pStmt, ++cont, registro.detPag.DTVencimento);
    		setIntOrNull(pStmt, ++cont, registro.detPag.NParcelas);
    		pStmt.setString(++cont, registro.detPag.NoTEF);
    		pStmt.setString(++cont, registro.detPag.NoAutorizador);
    		pStmt.setString(++cont, registro.detPag.NoCartao);
    		pStmt.setString(++cont, registro.detPag.NuOperacao);
    		pStmt.setString(++cont, registro.detPag.NSUTEF);
    		pStmt.setString(++cont, registro.detPag.NSUAutorizadora);
    		pStmt.setString(++cont, registro.detPag.NuAutorizacao);
    		pStmt.setString(++cont, registro.detPag.CPF);
    		pStmt.setString(++cont, registro.detPag.NOME);
    
    		pStmt.execute();
    	}
    } catch(error) {
        throw error;
    } finally {
        pStmt.close();
    }
	
	return true;
}

function PutVendaDetalhe(idvenda, det, conn) {
    let query = `
        UPDATE
        	"VAR_DB_NAME".VENDADETALHE
        SET
        	VUNCOM = ?,
        	VUNTRIB = ?,
        	VPROD = ?,
        	VDESC = ?,
        	IDUSRDESCONTO = ?,
        	VRTOTALLIQUIDO = ?
        WHERE
        	IDVENDADETALHE = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    try {
        for(let i = 0; i < det.length; i++) {
            let registro = det[i];
            let cont = 0;
            
            pStmt.setFloat(++cont, registro.prod.vUnCom);
            pStmt.setFloat(++cont, registro.prod.vUnTrib);
            pStmt.setFloat(++cont, registro.prod.vProd);
            pStmt.setFloat(++cont, registro.prod.VDESC || 0);
            setIntOrNull(pStmt, ++cont, registro.prod.IDUSRDESCONTO);
            pStmt.setFloat(++cont, registro.prod.valorTotalLiquido);
            pStmt.setString(++cont, `${idvenda}-${registro["@nItem"]}`);
        	
        	pStmt.execute();
        }
    } catch(error) {
        throw error;
    } finally {
	    pStmt.close();
	}
	
	return true;
}

function PutTabelaVenda(registro, conn){
    let query = `
        UPDATE 
        	"VAR_DB_NAME".VENDA
        SET 
           VRRECDINHEIRO = ?,
           VRRECCARTAO = ?,
           VRRECPOS = ?,
           VRRECVOUCHER = ?,
           VRRECCONVENIO = ?,
           TXTMOTIVODESCONTO = ?,
           NFE_INFNFE_INFADIC_INFCPL = ?,
           STALTERADA = 'True'
         WHERE 
         	IDVENDA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let cont = 0;
    
    try {
    	pStmt.setFloat(++cont, registro.VRRECDINHEIRO);
    	pStmt.setFloat(++cont, registro.VRRECCARTAO);
    	pStmt.setFloat(++cont, registro.VRRECPOS);
    	pStmt.setFloat(++cont, registro.VRRECVOUCHER);
    	pStmt.setFloat(++cont, registro.VRRECCONVENIO);
    	pStmt.setString(++cont, registro.TXTMOTIVODESCONTO);
    	pStmt.setString(++cont, registro.NFe.infNFe.infAdic.infCpl);
    	pStmt.setString(++cont, registro.IDVENDA);
    	
        pStmt.execute();
    } catch(error) {
        throw error;
    } finally {
        pStmt.close();
    }
    
    return true;
}

function fnHandlePut(){
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    try {
        for (let i = 0; i < bodyJson.length; i++) {
    		let registro = bodyJson[i];
            
    		PutTabelaVenda(registro, conn);
        	PutVendaDetalhe(registro.IDVENDA, registro.NFe.infNFe.det, conn);
        	PutVendaPagamento(registro.IDVENDA, registro.NFe.infNFe.pag, conn);
        }
    	
    	conn.commit();
    } catch(error) {
        throw error;
    } finally {
        conn.close();
    }
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	let detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }  