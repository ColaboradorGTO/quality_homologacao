let api = $.import("quality.concentrador.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    let dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    let horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    let idLista = $.request.parameters.get("idLista");
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let codeBars = $.request.parameters.get("codeBars");
    let descProd = $.request.parameters.get("descProd");
    
    let query = `
        SELECT
        	TBP.IDPRODUTO,
        	IFNULL(TBP.DSNOME, TBO."ItemName") AS DSNOME,
        	TBP.NUCODBARRAS,
        	TBP.IDGRUPOEMPRESARIAL,
        	TBO."ItemCode",
        	TBO."CodeBars",
        	TBO.U_IS_EAN_GTO,
        	TBO.U_GRP_EMP
        FROM
        	"VAR_DB_NAME".PRODUTO TBP 
        RIGHT JOIN SBO_GTO_PRD.OITM TBO ON
        	TBP.IDPRODUTO = TBO."ItemCode"
        WHERE 
        	1 = ?
    `;

    if(byId){
        query += ` AND (IDPRODUTO = '${byId}' OR TBO."ItemCode" = '${byId}' `;
    }
    
    if(descProd){
        descProd = descProd.split(' ').join('%');
        query += ` AND ( TBP.DSNOME LIKE '%${descProd}%' OR TBO."ItemName" LIKE '%${descProd}%')`;
    }
    
    if(codeBars){
        query = `
            SELECT 
                (SELECT TBP.IDPRODUTO FROM "VAR_DB_NAME".PRODUTO TBP WHERE TBP.NUCODBARRAS = '${codeBars}') AS IDPRODPRODUTO,
                (SELECT TBO."ItemCode" FROM SBO_GTO_PRD.OITM TBO WHERE TBO."CodeBars" = '${codeBars}') AS IDPRODOITM,
                (SELECT TBD.IDPRODCADASTRO FROM "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBD WHERE TBD.CODBARRAS = '${codeBars}' AND TBD.STCANCELADO <> 'True') AS IDPRODDETPEDIDO
            FROM 
                DUMMY
            WHERE
                1 = ?
        `;
      //  query += ` AND (TBP.NUCODBARRAS = '${codeBars}' OR TBO."CodeBars" = '${codeBars}')`;
    } else {
        query += ` ORDER BY DSNOME ASC `;
    }
    
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