var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnUpdateResumoPedidoSecundario(registro, conn) {
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO"
        SET
            "IDGRUPOEMPRESARIAL" = ?,
            "IDSUBGRUPOEMPRESARIAL" = ?,
            "IDCOMPRADOR" = ?,
            "IDCONDICAOPAGAMENTO" = ?,
            "IDFORNECEDOR" = ?,
            "IDTRANSPORTADORA" = ?,
            "IDANDAMENTO" = ?,
            "MODPEDIDO" = ?,
            "NOVENDEDOR" = ?,
            "EEMAILVENDEDOR" = ?,
            "DTPEDIDO" = ?,
            "DTPREVENTREGA" = ?,
            "TPFRETE" = ?,
            "DESCPERC01" = ?,
            "DESCPERC02" = ?,
            "DESCPERC03" = ?,
            "PERCCOMISSAO" = ?,
            "VRTOTALLIQUIDO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * ?,
            "OBSPEDIDO" = ?,
            "OBSPEDIDO2" = ?,
            "DTFECHAMENTOPEDIDO" = ?,
            "DTCADASTRO" = ?,
            "TPARQUIVO" = ?,
            "STDISTRIBUIDO" = ?,
            "STAGRUPAPRODUTO" = ?,
            "STCANCELADO" = ?,
            "TPFISCAL" = ?,
            "STRASCUNHO" = ?
        WHERE 
            "IDPEDIDOPRIMARIO" = ?
    `; 

    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
    pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
    pStmt.setInt(3, registro.IDCOMPRADOR);
    pStmt.setInt(4, registro.IDCONDICAOPAGAMENTO);
    pStmt.setString(5, registro.IDFORNECEDOR);
    pStmt.setInt(6, registro.IDTRANSPORTADORA);
    pStmt.setInt(7, registro.IDANDAMENTO);
    pStmt.setString(8, registro.MODPEDIDO);
    pStmt.setString(9, registro.NOVENDEDOR);
    pStmt.setString(10, registro.EEMAILVENDEDOR);
    pStmt.setDate(11, registro.DTPEDIDO);
    pStmt.setDate(12, registro.DTPREVENTREGA);
    pStmt.setString(13, registro.TPFRETE);
    pStmt.setFloat(14, registro.DESCPERC01);
    pStmt.setFloat(15, registro.DESCPERC02);
    pStmt.setFloat(16, registro.DESCPERC03);
    pStmt.setFloat(17, registro.PERCCOMISSAO);
    pStmt.setFloat(18, registro.VRTOTALLIQUIDO);
    pStmt.setString(19, registro.OBSPEDIDO);
    pStmt.setString(20, registro.OBSPEDIDO2);
    pStmt.setDate(21, registro.DTFECHAMENTOPEDIDO);
    pStmt.setDate(22, registro.DTCADASTRO);
    pStmt.setString(23, registro.TPARQUIVO);
    pStmt.setString(24, registro.STDISTRIBUIDO);
    pStmt.setString(25, registro.STAGRUPAPRODUTO);
    pStmt.setString(26, registro.STCANCELADO);
    pStmt.setString(27, registro.TPFISCAL);
    pStmt.setString(28, registro.STRASCUNHO);
    pStmt.setInt(29, registro.IDRESUMOPEDIDO);

	pStmt.execute();
	pStmt.close();

}

function fnHandlePut() {
    let conn = $.db.getConnection();
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO" 
        SET
            "IDGRUPOEMPRESARIAL" = ?,
            "IDSUBGRUPOEMPRESARIAL" = ?,
            "IDCOMPRADOR" = ?,
            "IDCONDICAOPAGAMENTO" = ?,
            "IDFORNECEDOR" = ?,
            "IDTRANSPORTADORA" = ?,
            "IDANDAMENTO" = ?,
            "MODPEDIDO" = ?,
            "NOVENDEDOR" = ?,
            "EEMAILVENDEDOR" = ?,
            "DTPEDIDO" = ?,
            "DTPREVENTREGA" = ?,
            "TPFRETE" = ?,
            "DESCPERC01" = ?,
            "DESCPERC02" = ?,
            "DESCPERC03" = ?,
            "PERCCOMISSAO" = ?,
            "VRTOTALLIQUIDO" = (CASE WHEN IFNULL("FATOR_ACRESCIMO_COMPRA", 0) = 0  THEN 1 ELSE "FATOR_ACRESCIMO_COMPRA" END) * ?,
            "OBSPEDIDO" = ?,
            "OBSPEDIDO2" = ?,
            "DTFECHAMENTOPEDIDO" = ?,
            "DTCADASTRO" = ?,
            "TPARQUIVO" = ?,
            "STDISTRIBUIDO" = ?,
            "STAGRUPAPRODUTO" = ?,
            "STCANCELADO" = ?,
            "TPFISCAL" = ?,
            "STRASCUNHO" = ?
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `; 

    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let registro = JSON.parse($.request.body.asString()); 

    pStmt.setInt(1, registro.IDGRUPOEMPRESARIAL);
    pStmt.setInt(2, registro.IDSUBGRUPOEMPRESARIAL);
    pStmt.setInt(3, registro.IDCOMPRADOR);
    pStmt.setInt(4, registro.IDCONDICAOPAGAMENTO);
    pStmt.setString(5, registro.IDFORNECEDOR);
    pStmt.setInt(6, registro.IDTRANSPORTADORA);
    pStmt.setInt(7, registro.IDANDAMENTO);
    pStmt.setString(8, registro.MODPEDIDO);
    pStmt.setString(9, registro.NOVENDEDOR);
    pStmt.setString(10, registro.EEMAILVENDEDOR);
    pStmt.setDate(11, registro.DTPEDIDO);
    pStmt.setDate(12, registro.DTPREVENTREGA);
    pStmt.setString(13, registro.TPFRETE);
    pStmt.setFloat(14, registro.DESCPERC01);
    pStmt.setFloat(15, registro.DESCPERC02);
    pStmt.setFloat(16, registro.DESCPERC03);
    pStmt.setFloat(17, registro.PERCCOMISSAO);
    pStmt.setFloat(18, registro.VRTOTALLIQUIDO);
    pStmt.setString(19, registro.OBSPEDIDO);
    pStmt.setString(20, registro.OBSPEDIDO2);
    pStmt.setDate(21, registro.DTFECHAMENTOPEDIDO);
    pStmt.setDate(22, registro.DTCADASTRO);
    pStmt.setString(23, registro.TPARQUIVO);
    pStmt.setString(24, registro.STDISTRIBUIDO);
    pStmt.setString(25, registro.STAGRUPAPRODUTO);
    pStmt.setString(26, registro.STCANCELADO);
    pStmt.setString(27, registro.TPFISCAL);
    pStmt.setString(28, registro.STRASCUNHO);
    pStmt.setInt(29, registro.IDRESUMOPEDIDO);

	pStmt.execute();
	pStmt.close();
	
    fnUpdateResumoPedidoSecundario(registro, conn);
    
	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
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