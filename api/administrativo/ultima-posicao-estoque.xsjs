var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    var IdEmpresa    = $.request.parameters.get("idempresa");
    var IdGrupo      = $.request.parameters.get("idgrupo");
    var IdSubgrupo   = $.request.parameters.get("idsubgrupo");
    var IdMarca      = $.request.parameters.get("idmarca");
    var IdFornecedor = $.request.parameters.get("idfornecedor");
    var DescProduto  = $.request.parameters.get("descproduto");
    var DtInicial    = $.request.parameters.get("dtinicial");
    var DtFinal      = $.request.parameters.get("dtfinal");
    var stNegativo   = $.request.parameters.get("stNegativo");
    var STAtivo      = $.request.parameters.get("stativo");

    var query = `
        SELECT
            T.IDINVMOVIMENTO,
            T.IDPRODUTO,
            T2.DSNOME AS DSPRODUTO,
            T2.NUCODBARRAS,
            IFNULL(T2.UND,(SELECT "SalUnitMsr" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = T.IDPRODUTO)) AS UND,
            ( CASE WHEN IFNULL(T2.PRECOCUSTO, 0) = 0 THEN 1 ELSE T2.PRECOCUSTO END ) AS PRECOCUSTO,
            TO_DECIMAL(IFNULL(TBPP.PRECO_VENDA, 0), 10, 2) AS PRECOVENDA,
            T.IDEMPRESA,
            TBE.NOFANTASIA,
            T.QTDFINAL,
            T.DTMOVIMENTO,
            TO_VARCHAR(T.DTMOVIMENTO, 'DD/MM/YYYY HH24:MI:SS') AS DTMOVIMENTOFORMATADO
        FROM
            (
            SELECT
                FIRST_VALUE(TBI.IDINVMOVIMENTO ORDER BY TBI.DTMOVIMENTO DESC) AS IDINVMOVIMENTO
            FROM
                "VAR_DB_NAME".INVENTARIOMOVIMENTO TBI
            INNER JOIN "VAR_DB_NAME".EMPRESA e ON e.IDEMPRESA = TBI.IDEMPRESA
    `;
        if(IdEmpresa){
            if(IdEmpresa === '101'){
                query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO ';
            }else{
                query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ';
            }
        }else{
            query = query + ' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ';
        }
        //' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO AND p.IDGRUPOEMPRESARIAL = e.IDGRUPOEMPRESARIAL ' +
        //' LEFT JOIN "VAR_DB_NAME".VW_PRODUTO p ON p.IDPRODUTO = TBI.IDPRODUTO ' +
        query = query + ' LEFT JOIN "VAR_DB_NAME".PRODUTO pp ON pp.IDPRODUTO = TBI.IDPRODUTO ' +
        ' LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO pr ON pr.IDPRODUTO = TBI.IDPRODUTO AND pr.IDEMPRESA = TBI.IDEMPRESA ' +
        ' WHERE 1 = ? ';
    if(IdEmpresa){
        query = query + 'AND TBI.IDEMPRESA = \'' + IdEmpresa + '\' ';
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
        query = query + 'AND p.IDSUBGRUPO IN (\'' + IdSubgrupo + '\') ';
    }
    if(IdMarca){
        query = query + 'AND p.IDMARCA IN (\'' + IdMarca + '\') ';
    }
    if(IdFornecedor){
        query = query + 'AND p.IDRAZAO_SOCIAL_FORNECEDOR IN (\'' + IdFornecedor + '\') ';
    }
    if(DescProduto){
        query = query + 'AND (UPPER(pp.DSNOME) LIKE UPPER(\'%' + DescProduto + '%\') OR pp.NUCODBARRAS LIKE \'%' + DescProduto + '%\') ';
    }
    if(DtInicial){
        query +=` AND TBI.DTMOVIMENTO <= '${DtInicial} 23:59:00' `;
    }
    
    if(STAtivo){
        query = query + 'AND TBI.STATIVO = \'' + STAtivo + '\' ';
    }
    
    query += `
            GROUP BY
                TBI.IDPRODUTO,
                TBI.IDEMPRESA
            )AS R
        INNER JOIN "VAR_DB_NAME".INVENTARIOMOVIMENTO AS T ON
            T.IDINVMOVIMENTO  = R.IDINVMOVIMENTO
        INNER JOIN "VAR_DB_NAME".PRODUTO AS T2 ON
            T2.IDPRODUTO = T.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = T.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO TBPP ON TBPP.IDPRODUTO = T.IDPRODUTO AND TBPP.IDEMPRESA = TBE.IDEMPRESA
    `;
    //throw query;
    query += ` ORDER BY T.IDEMPRESA asc, T.IDPRODUTO asc,  T.DTMOVIMENTO desc ` ;

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