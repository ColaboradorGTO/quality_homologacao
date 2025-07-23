var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var codeBarsOuNome = $.request.parameters.get("codeBarsOuNome");
    var IDEmpresa = $.request.parameters.get("IdEmpresaLoja");
    var IDListaLoja = $.request.parameters.get("IdListaLoja");
    
    var query = ' SELECT DISTINCT' + 
    '   tbpv.DATA_ULTIMA_ALTERACAO_PDV,' +
    '   tbpv.CODIGO_ITEM,' +
    '   tbpv.DESCRICAO_ITEM,' +
    '   tbpv.CODIGO_BARRAS,' +
    '   tbpv.PRECO_VENDA_PDV,' +
    '   tbpv.PRECO_VENDA_SAP' +
    ' FROM ' + 
    '   SBO_GTO_PRD.RS_PRECO_VENDA_PDV_X_SAP tbpv' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbpv.CODIGO_ITEM = \'' + byId + '\' ';
    }

    if ( IDListaLoja ) {
        query = query + ' And  tbpv.ID_LISTA_LOJA = \'' + IDListaLoja + '\' ';
    }
    
    if ( IDEmpresa ) {
        query = query + ' And  tbpv.IDEMPRESA = \'' + IDEmpresa + '\' ';
    }
    
   if ( codeBarsOuNome ) {
        query = query + ' And  (tbpv.CODIGO_BARRAS = \'' + codeBarsOuNome + '\' OR tbpv.DESCRICAO_ITEM LIKE \'%'+codeBarsOuNome+'%\') ';
    }
    
    query = query + ' ORDER BY  tbpv.DESCRICAO_ITEM ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
            
                
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}