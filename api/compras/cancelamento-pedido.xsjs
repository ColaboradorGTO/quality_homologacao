var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libCancelamentoResPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.cancelamento.libs.pedido-compra", "libCancelamentoResPedido");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function getIdResumoPedidoSecundario(idResumoPedido){
    let idResumoPedidoSecundario = 0;
    
    let query = `
        SELECT
            "IDRESUMOPEDIDO"
        FROM
            "VAR_DB_NAME"."RESUMOPEDIDO"
        WHERE 
            "IDPEDIDOPRIMARIO" = ?
    `;
    
    let regResumo = api.sqlQuery(query, idResumoPedido);
    
    if(regResumo.length > 0){
        idResumoPedidoSecundario = Number(regResumo[0].IDRESUMOPEDIDO);
    }
    
    return idResumoPedidoSecundario;
}

function getDocEntryResumoPedido(idResumoPedido){
    let docEntry = 0;
    
    let query = `
        SELECT 
            DOCENTRY_PEDIDO_SAP 
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO 
        WHERE 
            DOCENTRY_PEDIDO_SAP IS NOT NULL
            AND IDRESUMOPEDIDO = ?
    `;
    
    let reg = api.sqlQuery(query, idResumoPedido);
    
    if(reg[0].length > 0){
        docEntry = Number(reg[0].DOCENTRY_PEDIDO_SAP || 0);
    }
    
    return docEntry;
}

function updateDetalhePedido(idResumoPedido, registro){
    let query = `
        UPDATE 
            "VAR_DB_NAME".DETALHEPEDIDO 
        SET 
            STCANCELADO = 'True',
            DTCANCELAMENTO = NULL,
            IDRESPCANCELAMENTO = ?,
            TXTOBSCANCELAMENTO = ?
        WHERE 
            STCANCELADO = 'False'
            AND IDRESUMOPEDIDO = ?
    `;
    
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.setInt(1, registro.IDRESPCANCELAMENTO);
    pStmt.setString(2, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setInt(3, idResumoPedido);
    
    pStmt.execute();
	pStmt.close();
}

function updateDetalhePedidoGrade(idResumoPedido){
    let query = `
        UPDATE 
             "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        SET 
            TBDG.STATIVO = 'False',
            TBDG.STCANCELADO = 'True'
        FROM 
            "VAR_DB_NAME".DETALHEPEDIDOGRADE TBDG
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO TBDP ON 
            TBDG.IDDETALHEPEDIDO  = TBDP.IDDETALHEPEDIDO
        WHERE
            TBDG.STATIVO = 'True'
            AND TBDP.IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoPedido);
    pStmt.execute();
	pStmt.close();
}

function updateDetalheProdutoPedido(idResumoPedido, registro){
    let query = `
        UPDATE
             "VAR_DB_NAME".DETALHEPRODUTOPEDIDO
        SET
            STATIVO = 'False',
            STCANCELADO = 'True',
            DTULTATUALIZACAO = CURRENT_TIMESTAMP,
            IDRESPCANCELAMENTO = ?,
            TXTOBSCANCELAMENTO = ?
        WHERE
            IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, registro.IDRESPCANCELAMENTO);
    pStmt.setString(2, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setInt(3, idResumoPedido);

    pStmt.execute();
	pStmt.close();
}

function validarSeEstaCanceladoSAP(idResumoPedido){
    let docEntryResumoPedido = getDocEntryResumoPedido(idResumoPedido);
    let clausula = docEntryResumoPedido > 0 ? ` AND "DocEntry" = ${docEntryResumoPedido} ` : ` AND "U_ID_VENDA_PDV" = '${idResumoPedido}' `;
    
    let querySAP = `
        SELECT 
            "DocEntry" 
        FROM 
            ${dbNameSAP}.OPOR 
        WHERE 
            1 = ? 
            AND "CANCELED" = 'Y'
            AND "DocStatus" = 'O'
            ${clausula}
    `;
    
    let regExist = api.sqlQuery(querySAP, 1) || '';
    
    return (regExist.length > 0);
}

function cancelarPedidoNoSAP(idResumoPedido){
    let retorno = true;
    
    let query = `
        SELECT 
            IDRESUMOPEDIDO 
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO 
        WHERE 
            STMIGRADOSAP = 'True' 
            AND IDRESUMOPEDIDO = ?
    `;
    
    let respMigrado = api.sqlQuery(query, idResumoPedido);
	
	if(respMigrado.length > 0){
        let stCanceladoSap = validarSeEstaCanceladoSAP(idResumoPedido);
        
        if(!stCanceladoSap){
            retorno = libCancelamentoResPedido.executeCancelamentoPedidoCompra(idResumoPedido);
        }
	}
	
	return retorno;
}

function updatePedidoSecundario(registro, idResumoPedidoSecundario, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO"
        SET
            "IDANDAMENTO" = ?,
            "IDRESPCANCELAMENTO" = ?,
            "DSMOTIVOCANCELAMENTO" = ?,
            "DTCANCELAMENTO" = ?,
            "STCANCELADO" = ?,
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
   
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, registro.IDANDAMENTO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setDate(4, registro.DTCANCELAMENTO);
    pStmt.setString(5, registro.STCANCELADO);
    pStmt.setInt(6, idResumoPedidoSecundario);
    
    pStmt.execute();
    
    updateDetalhePedido(registro, conn, idResumoPedidoSecundario);
    
    updateDetalhePedidoGrade(idResumoPedidoSecundario, conn);
    
    updateDetalheProdutoPedido(registro, conn, idResumoPedidoSecundario);
    
    pStmt.close();
    
    return cancelarPedidoNoSAP(idResumoPedidoSecundario);
}

function executeCancelamentoPedido(idResumoPedido, registro) {
    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOPEDIDO"
        SET
            "IDANDAMENTO" = ?,
            "IDRESPCANCELAMENTO" = ?,
            "DSMOTIVOCANCELAMENTO" = ?,
            "DTCANCELAMENTO" = ?,
            "STCANCELADO" = ?,
            "DTMOVPEDIDO" = now()
        WHERE 
            "IDRESUMOPEDIDO" =  ? 
    `;
  
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, registro.IDANDAMENTO);
    pStmt.setInt(2, registro.IDRESPCANCELAMENTO);
    pStmt.setString(3, registro.DSMOTIVOCANCELAMENTO);
    pStmt.setDate(4, registro.DTCANCELAMENTO);
    pStmt.setString(5, registro.STCANCELADO);
    pStmt.setInt(6, idResumoPedido);
    
	pStmt.execute();
	
	updateDetalhePedido(idResumoPedido, registro);
	
	updateDetalhePedidoGrade(idResumoPedido);
	
	updateDetalheProdutoPedido(idResumoPedido, registro);
	
    pStmt.close();
    
    let stCanceladoSAP = cancelarPedidoNoSAP(idResumoPedido)
    
    if(!stCanceladoSAP){
        return {
            "msg": "Error ao Tentar Cancelar no SAP!"
        };
    }
    
    conn.commit();
}

function fnHandlePut() {
    let registro = JSON.parse($.request.body.asString());
    let idResumoPedidoSecundario = getIdResumoPedidoSecundario(registro.IDRESUMOPEDIDO);
    
    conn = $.db.getConnection();
    
    executeCancelamentoPedido(Number(registro.IDRESUMOPEDIDO), registro);
    
    if(idResumoPedidoSecundario){
        executeCancelamentoPedido(idResumoPedidoSecundario, registro);
    }
    
    return {
        "msg": "Cancelamento realizado com sucesso!"
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
        default:
            break;
    }
    
} catch(e) {
    var detalheError = e.stack.split('\n');
        
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