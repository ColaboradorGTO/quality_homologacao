// var api = $.import("quality.concentrador.api.apiResponse", "int_api");
var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function fnhandleGetEmpresaPromocaoOrigem(idResumoPromocao) {
    var query = `
        SELECT 
            tb.IDRESUMOPROMOCAOMARKETING,
            tb.IDDETALHEPROMOCAOMARKETINGORIGEM,
            tb.IDPRODUTOORIGEM,
            tb.STATIVO,
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME
        FROM VAR_DB_NAME.DETALHEPROMOCAOMARKETINGORIGEM tb
        INNER JOIN VAR_DB_NAME.PRODUTO tbp ON tbp.IDPRODUTO = tb.IDPRODUTOORIGEM
        WHERE IDRESUMOPROMOCAOMARKETING = ?
        AND tb.STATIVO = 'True'
    `;

    var linhas = api.sqlQuery(query, idResumoPromocao);
    var lines = [];

    for (var i = 0; i < linhas.length; i++) {
        var det = linhas[i];

        var docLine = {
            "@nItem": i + 1,
            "det": {
                "IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
                "DETALHEPROMOCAOMARKETINGORIGEM": det.DETALHEPROMOCAOMARKETINGORIGEM,
                "IDPRODUTOORIGEM": det.IDPRODUTOORIGEM,
                "STATIVO": det.STATIVO,
                "IDPRODUTO": det.IDPRODUTO,
                "NUCODBARRAS": det.NUCODBARRAS,
                "DSNOME": det.DSNOME
            }
        };

        lines.push(docLine);
    }
   return lines;
}

function fnhandleGetEmpresaPromocaoDestino(idResumoPromocao) {
    var query = `
        SELECT 
            tb.IDDETALHEPROMOCAOMARKETINGDESTINO, 
            tb.IDRESUMOPROMOCAOMARKETING, 
            tb.IDGRUPOEMDESTINO, 
            tb.IDSUBGRUPOEMDESTINO, 
            tb.IDMARCAEMDESTINO, 
            tb.IDFORNECEDOREMDESTINO, 
            tb.IDPRODUTODESTINO, 
            tb.STATIVO,
            tbp.IDPRODUTO,
            tbp.NUCODBARRAS,
            tbp.DSNOME
        FROM VAR_DB_NAME.DETALHEPROMOCAOMARKETINGDESTINO tb
        INNER JOIN VAR_DB_NAME.PRODUTO tbp 
            ON tbp.IDPRODUTO = tb.IDPRODUTODESTINO
        WHERE tb.IDRESUMOPROMOCAOMARKETING = ?
        AND tb.STATIVO = 'True'

    `;

    var linhas = api.sqlQuery(query, idResumoPromocao);
    var lines = [];

    for (var i = 0; i < linhas.length; i++) {
        var det = linhas[i];

        var docLine = {
            "@nItem": i + 1,
            "det": {
                "IDDETALHEPROMOCAOMARKETINGDESTINO": det.IDDETALHEPROMOCAOMARKETINGDESTINO,
                "IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
                "DETALHEPROMOCAOMARKETINGDESTINO": det.DETALHEPROMOCAOMARKETINGDESTINO,
                "IDPRODUTODESTINO": det.IDPRODUTODESTINO,
                "STATIVO": det.STATIVO,
                "IDPRODUTO": det.IDPRODUTO,
                "NUCODBARRAS": det.NUCODBARRAS,
                "DSNOME": det.DSNOME
            }
        };

        lines.push(docLine);
    }
   return lines;
}

function fnhandleGetEmpresaPromocaoMarketing(idResumoPromocao) {
    var query = `
        SELECT 
            IDRESUMOPROMOCAOMARKETING,
            IDEMPRESA,
            IDEMPRESAPROMOCAOMARKETING
        FROM "VAR_DB_NAME".EMPRESAPROMOCAOMARKETING
        WHERE IDRESUMOPROMOCAOMARKETING = ?
     
    `;

    var linhas = api.sqlQuery(query, idResumoPromocao);
    var lines = [];

    for (var i = 0; i < linhas.length; i++) {
        var det = linhas[i];

        var docLine = {
            "@nItem": i + 1,
            "det": {
                "IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
                "IDEMPRESA": det.IDEMPRESA,
                "IDEMPRESAPROMOCAOMARKETING": det.IDEMPRESAPROMOCAOMARKETING
            }
        };

        lines.push(docLine);
    }
   return lines;
}


function fnHandleGetDetalhePromocao(idResumoPromocao) {
    
    var query = `
        SELECT 
            IDDETALHEPROMO,
            IDRESUMOPROMO, 
            IDPRODUTO     
        FROM "VAR_DB_NAME".DETALHEPROMOCAO
        WHERE 
            IDRESUMOPROMO = ?        
    `;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    var response = api.sqlQuery(query, idResumoPromocao);
    var data = [];

    for (var i = 0; i < response.length; i++) {
        var det = response[i];

        var docLine = {
            "@nItem": i + 1,
            "detalhePromo": {
                "IDDETALHEPROMO": det.IDDETALHEPROMO,
                "IDRESUMOPROMO": det.IDRESUMOPROMO,
                "IDPRODUTO": det.IDPRODUTO
            },
           
        };

        data.push(docLine);
    }

    return response;
}

function fnHandleGet(byId) {
    
    var idResumoPromocao = $.request.parameters.get("idResumoPromocao");
    
    var query = `
        SELECT 
            IDRESUMOPROMOCAOMARKETING, 
            DSPROMOCAOMARKETING, 
            DTHORAINICIO, 
            DTHORAFIM, 
            TPAPLICADOA, 
            APARTIRDEQTD, 
            APARTIRDOVLR, 
            TPFATORPROMO, 
            FATORPROMOVLR, 
            FATORPROMOPERC, 
            TPAPARTIRDE, 
            VLPRECOPRODUTO, 
            IDMECANICARESUMOPROMOCAOMARKETING
        FROM "VAR_DB_NAME".RESUMOPROMOCAOMARKETING
        WHERE 
            1 = ?
        
    `;

    // if ( idResumoPromocao ) {
    //     query = query + ' And  IDRESUMOPROMOCAOMARKETING = \'' + idResumoPromocao + '\' ';
    // }
    
    if ( idResumoPromocao ) {
        
     query = query + ` AND IDRESUMOPROMOCAOMARKETING IN (${idResumoPromocao}) `;
        
    }


    query = query + ' ORDER BY IDRESUMOPROMOCAOMARKETING DESC ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    var response = api.sqlQueryPage(query, request, 1);
    var data = [];

    for (var i = 0; i < response.data.length; i++) {
        var det = response.data[i];

        var docLine = {
            "@nItem": i + 1,
            "ResumoPromocao": {
                "IDRESUMOPROMOCAOMARKETING": det.IDRESUMOPROMOCAOMARKETING,
                "DSPROMOCAOMARKETING": det.DSPROMOCAOMARKETING,
                "DTHORAINICIO": det.DTHORAINICIO ? det.DTHORAINICIO.toISOString() : null,
                "DTHORAFIM": det.DTHORAFIM ? det.DTHORAFIM.toISOString() : null,
                "TPAPLICADOA": det.TPAPLICADOA,
                "APARTIRDEQTD": det.APARTIRDEQTD,
                "APARTIRDOVLR": det.APARTIRDOVLR,
                "TPFATORPROMO": det.TPFATORPROMO,
                "FATORPROMOVLR": det.FATORPROMOVLR,
                "FATORPROMOPERC": det.FATORPROMOPERC,
                "TPAPARTIRDE": det.TPAPARTIRDE,
                "VLPRECOPRODUTO": det.VLPRECOPRODUTO,
                "IDMECANICARESUMOPROMOCAOMARKETING": det.IDMECANICARESUMOPROMOCAOMARKETING
            },
            "empresaPromocaoDestino": fnhandleGetEmpresaPromocaoDestino(det.IDRESUMOPROMOCAOMARKETING),
            "empresaPromocaoOrigem": fnhandleGetEmpresaPromocaoOrigem(det.IDRESUMOPROMOCAOMARKETING)
            // "empresaPromocaoMarketing": fnhandleGetEmpresaPromocaoMarketing(det.IDRESUMOPROMOCAOMARKETING),
            // "detalhePromo": fnHandleGetDetalhePromocao(det.IDRESUMOPROMOCAOMARKETING),
            
        };

        data.push(docLine);
    }
    response.data = data;
    return response;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
          //Handle your GET calls here
        case $.net.http.GET:
            var byId = $.request.parameters.get("byId");
            $.response.setBody(JSON.stringify(fnHandleGet(byId)));
            break;    
            
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}

