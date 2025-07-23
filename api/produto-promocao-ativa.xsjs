var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    var dsProduto = $.request.parameters.get("dsProduto");
    var idProduto = $.request.parameters.get("idProduto");
    
    var query = `
        SELECT DISTINCT
            tbp.IDPRODUTO,
            tbp.IDGRUPOEMPRESARIAL,
            tbp.NUNCM,
            tbp.NUCEST,
            tbp.NUCST_ICMS,
            tbp.NUCFOP,
            tbp.PERC_OUT,
            tbp.NUCODBARRAS,
            tbp.DSNOME,
            tbp.STGRADE,
            tbp.UND,
            tbp.QTDENTRADA,
            tbp.QTDCOMERCIALIZADA,
            tbp.QTDPERDA,
            tbp.QTDDISPONIVEL,
            tbp.PERCISS,
            tbp.PERCPIS,
            tbp.PERCCOFINS,
            tbp.COD_CSOSN,
            tbp.PERCCSOSC,
            tbp.NUCST_IPI,
            tbp.NUCST_PIS,
            tbp.NUCST_COFINS,
            tbp.PERCIPI,
            TO_VARCHAR(tbp.DTULTALTERACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTALTERACAO,
            tbp.STPESAVEL,
            tbp.GRP_MATERIAIS
        FROM "VAR_DB_NAME".PRODUTO tbp
            WHERE 1 = ?
    `;
  

    
    if (idProduto) {
        query = query + ' AND  tbp.IDPRODUTO = \'' + idProduto + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
   
    
    if ( dsProduto ) {
        query += `AND CONTAINS((tbp.IDPRODUTO, tbp.DSNOME, tbp.NUCODBARRAS), '%${dsProduto}%') `;
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
   /* $.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(query));
		$.response.status = $.net.http.OK;
		return;*/
    
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}