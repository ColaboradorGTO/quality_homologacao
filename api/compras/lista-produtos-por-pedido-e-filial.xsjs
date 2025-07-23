var api = $.import("quality.concentrador.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dtInicio = $.request.parameters.get("dtInicio");
    var dtFim = $.request.parameters.get("dtFim");
    var idFilial = $.request.parameters.get("idFilial");
    var idFornecedor = $.request.parameters.get("idFornecedor");
    var idResumoPedido = $.request.parameters.get("idResumoPedido");
    var idProd = $.request.parameters.get("idProd");
    var codBarrasProd = $.request.parameters.get("codBarrasProd");
    var descProd = $.request.parameters.get("descProd");
    var query;
    
    query = `
        SELECT 
            TBR.IDRESUMOPEDIDO,
            TO_VARCHAR(TBR.DTCADASTRO, 'DD/MM/YYYY') AS DTPEDIDO,
            TBF.IDFORNECEDOR,
            TBF.NOFANTASIA AS NOFORNECEDOR,
            IFNULL(TBFAB.DSFABRICANTE, 'Sem Fabricante') AS NOFABRICANTE,
            TBP.IDPRODUTO,
            TBP.DSNOME AS DSPRODUTO,
            TBP.NUCODBARRAS,
            TBDP.QTDPRODUTO AS QTDPRODUTOPEDIDO,
            TBE.IDEMPRESA,
            TBE.NOFANTASIA AS NOFILIAL,
            TBDP.VRVENDA AS VRVENDAPEDIDO, 
            IFNULL(TBPP.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDA,
            IFNULL(TBI.QTDFINAL, 0) AS QTDESTOQUE,
            TBDP.UND AS UM
        FROM 
            "VAR_DB_NAME".RESUMOPEDIDO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP ON 
            TBR.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBDP.IDPRODCADASTRO = TBP.IDPRODUTO 
        INNER JOIN "VAR_DB_NAME".PRODUTO_PRECO TBPP ON
            TBP.IDPRODUTO = TBPP.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBPP.IDEMPRESA = TBE.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON 
            TBR.IDFORNECEDOR = TBF.IDFORNECEDOR
        LEFT JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            TBDP.IDFABRICANTE = TBFAB.IDFABRICANTE 
        LEFT JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI ON
            TBP.IDPRODUTO = TBI.IDPRODUTO AND TBE.IDEMPRESA = TBI.IDEMPRESA AND TBI.STATIVO = 'True'
        WHERE 
            TBR.STCANCELADO = 'False'
            AND TBDP.STCANCELADO = 'False'
            AND TBDP.STCADASTRADO = 'True'
            AND 1 = ? 
    `;

    if(byId){
        query += ` AND  TBR.IDRESUMOPEDIDO = '${byId}' `;
    }
    
    if(idResumoPedido){
        query += ` AND TBR.IDRESUMOPEDIDO = '${idResumoPedido}' `;
    }
    
    if(idFornecedor){
        query += ` AND TBR.IDFORNECEDOR = '${idFornecedor}' `;
    }
    
    if(idFilial){
        query += ` AND TBPP.IDEMPRESA = '${idFilial}' `;
    }
    
    if(idProd){
        query += ` AND CONTAINS(TBP.IDPRODUTO, '${idProd}') `;
    }
    
    if(descProd){
        query += ` AND CONTAINS(TBP.DSNOME, '%${descProd}%') `;
    }
    
    if(codBarrasProd){
        codBarrasProd = codBarrasProd.trim();
        query += ` AND TBP.NUCODBARRAS = '${codBarrasProd}' `;
    }
    
    if(dtInicio && dtFim){
        query += ` AND TBR.DTCADASTRO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59' `;
    }
    
    query += ` ORDER BY TBR.IDRESUMOPEDIDO, TBP.DSNOME `;
    
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
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}