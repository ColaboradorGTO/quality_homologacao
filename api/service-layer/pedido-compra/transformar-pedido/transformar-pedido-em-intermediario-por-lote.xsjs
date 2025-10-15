let pathLibs = "quality.concentrador_homologacao.api.service-layer.pedido-compra.transformar-pedido.libs";

let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libCancelSAP = $.import(pathLibs, "cancelar-pedido-SAP");
let libCancelQUALITY = $.import(pathLibs, "cancelar-pedido-QUALITY");
let libCriarPrimarioQuality = $.import(pathLibs, "criar-pedido-primario-QUALITY");
let libCriarSecundarioQuality = $.import(pathLibs, "criar-pedido-secundario-QUALITY");
let libCriarProdutoPedidoPrimarioQuality = $.import(pathLibs, "criar-produtos-pedido-primario-QUALITY");
let libMigrarProdutosPrimarioSAP = $.import(pathLibs, "migrar-produtos-pedido-primario-SAP");
let libMigrarProdutosSecundarioSAP = $.import(pathLibs, "migrar-produtos-pedido-secundario-SAP");
let libMigrarPedidoPrimarioSAP = $.import(pathLibs, "migrar-pedido-primario-SAP");
let libMigrarPedidoSecundarioSAP = $.import(pathLibs, "migrar-pedido-secundario-SAP");
let conn;


function getPedidosParaTransformar(){
    let query = `
        SELECT 
            *
        FROM
            "VAR_DB_NAME".PEDIDOSCOMPRASRECRICADOS
        WHERE 
            CONTAINS(
            (
                ST_CANCELADO_SAP,
                ST_CANCELADO_QUALITY,
                ST_CRIADO_PEDIDO_PRIMARIO, 
                ST_CRIADO_PEDIDO_SECUNDARIO, 
                ST_CRIADO_QUALITY_PRODUTOS_PEDIDO_PRIMARIO,
                ST_MIGRADO_SAP_PRODUTOS_PEDIDO_PRIMARIO,
                ST_MIGRADO_SAP_PRODUTOS_PEDIDO_SECUNDARIO,
                ST_MIGRADO_SAP_PEDIDO_PRIMARIO, 
                ST_MIGRADO_SAP_PEDIDO_SECUNDARIO
                )
            , 'False')
            AND 1 = ?
        ORDER BY 
            ID
        LIMIT 100
    `;
    
    return api.sqlQuery(query, 1);
}

function transformarPedidos() {
    let registros = getPedidosParaTransformar();
    
    for(let pedido of registros){
        let {
            IDRESUMOPEDIDO,
            ST_CANCELADO_SAP,
            ST_CANCELADO_QUALITY,
            ST_CRIADO_PEDIDO_PRIMARIO,
            ST_CRIADO_PEDIDO_SECUNDARIO,
            ST_CRIADO_QUALITY_PRODUTOS_PEDIDO_PRIMARIO,
            ST_MIGRADO_SAP_PRODUTOS_PEDIDO_PRIMARIO,
            ST_MIGRADO_SAP_PRODUTOS_PEDIDO_SECUNDARIO,
            ST_MIGRADO_SAP_PEDIDO_PRIMARIO,
            ST_MIGRADO_SAP_PEDIDO_SECUNDARIO
        } = pedido || '';
        
        let stCancelarSAP = ST_CANCELADO_SAP == 'False';
        let stCancelarQuality = ST_CANCELADO_QUALITY == 'False';
        let stCriarPedidoPrimario = ST_CRIADO_PEDIDO_PRIMARIO == 'False';
        let stCriarPedidoSecundario = ST_CRIADO_PEDIDO_SECUNDARIO == 'False';
        let stCriarProdutosPedidoPrimario = ST_CRIADO_QUALITY_PRODUTOS_PEDIDO_PRIMARIO == 'False';
        let stMigrarProdutoPedidoPrimario = ST_MIGRADO_SAP_PRODUTOS_PEDIDO_PRIMARIO == 'False';
        let stMigrarProdutoPedidoSecundario = ST_MIGRADO_SAP_PRODUTOS_PEDIDO_SECUNDARIO == 'False';
        let stMigrarPedidoPrimario = ST_MIGRADO_SAP_PEDIDO_PRIMARIO == 'False';
        let stMigrarPedidoSecundario = ST_MIGRADO_SAP_PEDIDO_SECUNDARIO == 'False';
        
        //return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stCriarProdutosPedidoPrimario, stMigrarProdutoPedidoPrimario, stMigrarProdutoPedidoSecundario, stMigrarPedidoPrimario, stMigrarPedidoSecundario}
        
        if(stCancelarSAP){
            libCancelSAP.cancelarPedidoSAP(Number(IDRESUMOPEDIDO));
            continue;
            return {stCancelarSAP}
        }
        
        if(stCancelarQuality){
            libCancelQUALITY.cancelarPedidoQuality(Number(IDRESUMOPEDIDO));
            continue;
            return {stCancelarSAP, stCancelarQuality}
        }
        
        if(stCriarPedidoPrimario){
            libCriarPrimarioQuality.criarPedidoPrimario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario}
        }
        
        if(stCriarPedidoSecundario){
            libCriarSecundarioQuality.criarPedidoSecundario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario}
        }
        
        if(stCriarProdutosPedidoPrimario){
            libCriarProdutoPedidoPrimarioQuality.criarProdutosPedidoPrimario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stCriarProdutosPedidoPrimario}
        }
        
        if(stMigrarProdutoPedidoPrimario){
            libMigrarProdutosPrimarioSAP.migrarProdutosPedidoPrimario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stCriarProdutosPedidoPrimario, stMigrarProdutoPedidoPrimario}
        }
        
        if(stMigrarProdutoPedidoSecundario){
            libMigrarProdutosSecundarioSAP.migrarProdutosPedidoSecundario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stCriarProdutosPedidoPrimario, stMigrarProdutoPedidoPrimario, stMigrarProdutoPedidoSecundario}
        }
        
        if(stMigrarPedidoPrimario){
            libMigrarPedidoPrimarioSAP.migrarPedidoPrimario(Number(IDRESUMOPEDIDO));
            continue;
            return {IDRESUMOPEDIDO, stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stMigrarPedidoPrimario}
        }
        
        if(stMigrarPedidoSecundario){
            libMigrarPedidoSecundarioSAP.migrarPedidoSecundario(Number(IDRESUMOPEDIDO));
            continue;
            return {stCancelarSAP, stCancelarQuality, stCriarPedidoPrimario, stCriarPedidoSecundario, stMigrarPedidoPrimario, stMigrarPedidoSecundario}
        }
    }
    
    return {
        msg: 'Pedidos Transformados Com Sucesso!'
    }
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.POST:
            var docReturn = transformarPedidos();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        default:
            break;
    }
    
} catch(e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    conn && conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}