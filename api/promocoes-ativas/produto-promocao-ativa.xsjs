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

function fnHandlePost() {
    var body = $.request.body ? $.request.body.asString() : '';
    var postData = {};
    
    try {
        var parsedBody = JSON.parse(body);
        // Se foi enviado como array, pega o primeiro elemento
        if (Array.isArray(parsedBody) && parsedBody.length > 0) {
            postData = parsedBody[0];
        } else {
            postData = parsedBody;
        }
    } catch (e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message: "Invalid JSON in request body" }));
        $.response.status = 400;
        return;
    }
    
    var dataUltAtualizacao = postData.dataUltAtualizacao || $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = postData.horaUltAtualizacao || $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = postData.idEmpresa || $.request.parameters.get("idEmpresa");
    var codeBars = postData.codeBars || $.request.parameters.get("codeBars");
    var dsProduto = postData.dsProduto || $.request.parameters.get("dsProduto");
    var idProduto = postData.idProduto || $.request.parameters.get("idProduto");
    
    // Validação: Deve ter pelo menos um filtro para evitar retornar todos os produtos
    if (!idProduto && !codeBars && !dsProduto && !dataUltAtualizacao) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ 
            message: "At least one filter is required: idProduto, codeBars, dsProduto, or dataUltAtualizacao",
            received: postData
        }));
        $.response.status = 400;
        return;
    }
    
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
        var ids;
        if (Array.isArray(idProduto)) {
            // Se idProduto é um array, junta os IDs
            ids = idProduto.map(function(id) { return "'" + String(id).trim() + "'"; }).join(',');
        } else {
            // Se idProduto é uma string, trata como antes
            ids = String(idProduto).split(',').map(function(id) { return "'" + id.trim() + "'"; }).join(',');
        }
        // Log para debug
       
        query = query + ' AND tbp.IDPRODUTO IN (' + ids + ') ';
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
    
    var request = { 
        page: postData.page || $.request.parameters.get("page"),
        pageSize: postData.pageSize || $.request.parameters.get("pageSize")
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
      case $.net.http.POST:
            fnHandlePost();
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}