var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var IdEmpresa    = $.request.parameters.get("idempresa");
    var IdGrupo      = $.request.parameters.get("idgrupo");
    var IdSubgrupo   = $.request.parameters.get("idsubgrupo");
    var IdMarca      = $.request.parameters.get("idmarca");
    var IdFornecedor = $.request.parameters.get("idfornecedor");
    var DescProduto  = $.request.parameters.get("descproduto");
    var DtInicial    = $.request.parameters.get("dtinicial");
    var DtFinal      = $.request.parameters.get("dtfinal");
    var STAtivo      = $.request.parameters.get("stativo");

    var query = ` 
        SELECT DISTINCT 
            im.IDEMPRESA
            ,e.NOFANTASIA
            ,IFNULL(p.NUCODBARRAS, (SELECT IFNULL("CodeBars", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = im.IDPRODUTO)) AS NUCODBARRAS
            ,IFNULL(p.DSPRODUTO, (SELECT IFNULL("ItemName", '') FROM "SBO_GTO_PRD"."OITM" WHERE "ItemCode" = im.IDPRODUTO)) as DSPRODUTO
            ,IFNULL(p.IDRAZAO_SOCIAL_FORNECEDOR, (SELECT IFNULL(T1."CardCode", '') FROM "SBO_GTO_PRD"."OITM" T0 INNER JOIN "SBO_GTO_PRD"."OCRD" T1 ON T1."CardCode" = T0."CardCode" WHERE T0."ItemCode" = im.IDPRODUTO)) AS IDRAZAO_SOCIAL_FORNECEDOR
            ,IFNULL(p.RAZAO_SOCIAL_FORNECEDOR, (SELECT IFNULL(T1."CardName", '') FROM "SBO_GTO_PRD"."OITM" T0 INNER JOIN "SBO_GTO_PRD"."OCRD" T1 ON T1."CardCode" = T0."CardCode" WHERE T0."ItemCode" = im.IDPRODUTO)) AS RAZAO_SOCIAL_FORNECEDOR
            ,IFNULL(pp.PRECOCUSTO, 0) AS PRECOCUSTO
            ,IFNULL( IFNULL( pr.PRECO_VENDA, pp.PRECOVENDA), 0) AS PRECOVENDA
            ,im.IDPRODUTO, im.DTMOVIMENTO, im.QTDINICIO, im.QTDENTRADA, im.QTDENTRADAVOUCHER
            ,im.QTDSAIDA, im.QTDSAIDATRANSFERENCIA, im.QTDRETORNOAJUSTEPEDIDO, im.QTDFINAL, im.QTDAJUSTEBALANCO, im.STATIVO
            ,TO_VARCHAR( im.DTMOVIMENTO, 'YYYY-MM-DD') AS DATAMOVIMENTO
            ,pp.SKUVTEX, IFNULL(im.QTDENTRADAECOMMERCE, 0) AS QTDENTRADAECOMMERCE, IFNULL(im.QTDSAIDAECOMMERCE, 0) AS QTDSAIDAECOMMERCE
        FROM "VAR_DB_NAME".INVENTARIOMOVIMENTO im
        INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = im.IDEMPRESA 
    `;
    
        if(IdEmpresa){
            if(IdEmpresa === '101'){
                query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO ';
            }else{
                query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ';
            }
        }else{
            query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ';
        }
        //' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ' +
        //' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = im.IDPRODUTO ' +
        query = query + ' LEFT JOIN "VAR_DB_NAME".PRODUTO pp ON pp.IDPRODUTO = im.IDPRODUTO ' +
        ' LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pr ON pr.IDPRODUTO = im.IDPRODUTO AND pr.IDEMPRESA = im.IDEMPRESA ' +
        ' WHERE 1 = ? ';
    if(idGrupoEmpresarial){
        query += ` AND e.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} `;
    }
    if(IdEmpresa){
        query = query + 'AND im.IDEMPRESA = \'' + IdEmpresa + '\' ';
    }
    if(IdGrupo){
        var listarIdGrupo = IdGrupo.split(',');
        var descGrupo = '';
        var listarDescGrupo = '';

        for(var i = 0; i < listarIdGrupo.length; i++){ 
        
            if(listarIdGrupo[i] === '1'){
                descGrupo = 'Verão';
            }else if(listarIdGrupo[i] === '2'){
                descGrupo = 'Calçados/Acessórios';
            }else if(listarIdGrupo[i] === '3'){
                descGrupo = 'Cama/Mesa/Banho';
            }else if(listarIdGrupo[i] === '4'){
                descGrupo = 'Utilidades Do Lar';
            }else if(listarIdGrupo[i] === '5'){
                descGrupo = 'Diversos';
            }else if(listarIdGrupo[i] === '6'){
                descGrupo = 'Artigos Esportivos';
            }else if(listarIdGrupo[i] === '7'){
                descGrupo = 'Cosméticos';
            }else if(listarIdGrupo[i] === '8'){
                descGrupo = 'Acessórios';
            }else if(listarIdGrupo[i] === '9'){
                descGrupo = 'Peças Íntimas';
            }else if(listarIdGrupo[i] === '10'){
                descGrupo = 'Inverno';
            }

            if(i == 0){
                listarDescGrupo = '\'' + descGrupo + '\'';
            }else{
                listarDescGrupo = listarDescGrupo + ',\'' + descGrupo + '\'';
            }
        
        }
        query = query + 'AND p.GRUPO IN (' + listarDescGrupo + ') ';
    }
    if(IdSubgrupo){
        query += ` AND p.IDSUBGRUPO IN(${IdSubgrupo.split(',').join(',')})`;
    }
    if(IdMarca){
        query += ` AND p.IDMARCA IN (${IdMarca.split(',').join(',')}) `;
    }
    if(IdFornecedor){
        query += ` AND p.IDRAZAO_SOCIAL_FORNECEDOR IN ('${IdFornecedor.split(',').join("','")}') `;
    }
    if(DescProduto){
        query += ` AND CONTAINS((pp.DSNOME, pp.NUCODBARRAS), '%${DescProduto}%') `;
    }
    if(DtInicial && DtFinal){
        query = query + 'AND im.DTMOVIMENTO BETWEEN \'' + DtInicial + ' 00:00:00\' AND \'' + DtFinal + ' 23:59:59\'';
    }
    if(STAtivo){
        query = query + 'AND im.STATIVO = \'' + STAtivo + '\' ';
    }
    
    query = query + 'ORDER BY im.IDEMPRESA asc, im.IDPRODUTO asc,  im.DTMOVIMENTO desc';

    /*$.response.contentType = 'application/json';
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
    switch ($.request.method) {
        //Handle your PUT calls here
        /*case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
        break;*/
        
        //Handle your POST calls here
        /*case $.net.http.POST:
            var doc = fnHandlePost();
            $.response.setBody(JSON.stringify(doc));
        break;*/
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
        break;
        
        default:
        break;
    }
} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}