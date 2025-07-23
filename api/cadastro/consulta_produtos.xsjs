let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    let dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    let horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    let idLista = $.request.parameters.get("idLista");
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let codeBars = $.request.parameters.get("codeBars");
    let descProd = $.request.parameters.get("descProd");
    
    descProd = descProd ? `${descProd.trim}` : descProd;
  //  descProd = descProd ? descProd.split(' ').join('%') : descProd;

    let query = `
        SELECT
        	(SELECT "ItemCode" FROM SBO_GTO_TESTE4.OITM WHERE UPPER("ItemName") LIKE '%${descProd}%' LIMIT 1)AS IDPRODUTOSAP,
        	(SELECT IDPRODUTO FROM "VAR_DB_NAME".PRODUTO WHERE UPPER(DSNOME) LIKE '%${descProd}%' LIMIT 1)AS IDPRODUTOQUALITY,
        	(SELECT IDPRODCADASTRO FROM "VAR_DB_NAME".DETALHEPRODUTOPEDIDO WHERE UPPER(DSPRODUTO) LIKE '%${descProd}%' AND STCANCELADO <> 'True' LIMIT 1) AS IDPRODUTODETALHEPRODPEDIDO
        FROM
        	DUMMY
        WHERE
        	1 = ?
    `;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {

        case $.net.http.GET:
            let id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
          
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}