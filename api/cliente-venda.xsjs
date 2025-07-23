var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFim = $.request.parameters.get("dataFim");

    var query = 'select distinct '+
        ' upper(t2.DSNOMERAZAOSOCIAL) as DSNOMERAZAOSOCIAL, '+
        ' t2.EEMAIL, '+
        ' t1.DEST_CPF, '+
        ' t2.TPCLIENTE, '+
        ' \'NAO INFORMADO\' AS SEXO, '+
        ' T2.DTNASCFUNDACAO, '+
        ' T2.ECIDADE, '+
        ' T2.SGUF, '+
        ' T2.NUTELCELULAR, '+
        ' T2.EENDERECO, '+
        ' T2.EBAIRRO, '+
        ' \'NAO INFORMADO\' AS CLASSIFICACAO_CLIENTE, '+
        ' TO_VARCHAR(T1.DTHORAFECHAMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTHORAFECHAMENTO, '+
        ' T1.IDVENDA, '+
        ' T3.NOFANTASIA, '+
        ' T1.IDEMPRESA, '+
        ' \'NAO INFORMADO\' AS TIPO_LOJA, '+
        ' S1.VENDEDOR_NOME, '+
        ' S1.VENDEDOR_MATRICULA, '+
        ' T1.VRRECDINHEIRO, '+
        ' T1.VRRECCARTAO, '+
        ' T1.VRRECCONVENIO, '+
        ' T1.VRRECPOS, '+
        ' T1.VRRECVOUCHER, '+
        ' T1.VRTOTALPAGO, '+
        ' S1.QTD AS QUANTIDADE_TOTAL_PRODUTO, '+
        ' round(S1.VUNCOM,2) AS SUBTOTAL, '+
        ' S1.VDESC, '+
        ' \'NAO INFORMADO\' AS TOTAL_FRETE, '+
        ' S1.CPROD, '+
        ' S1.DSNOME, '+
        ' \'NAO INFORMADO\' AS QUANTIDADE_PRODUTO, '+
        ' S2.GRUPO, '+
        ' S2.DSSUBGRUPO, '+
        ' \'NAO INFORMADO\' AS COR_PRODUTO, '+
        ' \'NAO INFORMADO\' AS TAMANHO_PRODUTO, '+
        ' \'NAO INFORMADO\' AS OPERACAO_PRODUTO '+
    ' from  '+
        ' QUALITY_CONC_HML.venda t1 '+
        ' inner join QUALITY_CONC_HML.cliente t2 on t2.NUCPFCNPJ = t1.DEST_CPF '+
        ' inner join QUALITY_CONC_HML.empresa t3 on t3.idempresa = t1.idempresa '+
        ' LEFT OUTER JOIN ( '+
        '     SELECT DISTINCT '+
        '         S1.IDVENDA, '+
        '         S1.VENDEDOR_NOME, '+
        '         S1.VENDEDOR_MATRICULA, '+
        '         SUM(S1.QTD) AS QTD, '+
        '         S1.VUNCOM, '+
        '         S1.VDESC, '+
        '         S1.CPROD, '+
        '         S12.DSNOME '+
        '     FROM QUALITY_CONC_HML.VENDADETALHE S1  '+
        '         INNER JOIN QUALITY_CONC_HML.PRODUTO S12 ON S12.IDPRODUTO = S1.CPROD '+
        '     GROUP BY S1.IDVENDA,S1.VENDEDOR_NOME, S1.VENDEDOR_MATRICULA, S1.VUNCOM, S1.VDESC, S1.CPROD,S12.DSNOME '+
        ' )S1 ON S1.IDVENDA = T1.IDVENDA '+
        ' LEFT OUTER JOIN( '+
        '     SELECT distinct '+
        '         S2."Cod.Item", '+
        '         S2."Grupo" AS GRUPO, '+
        '         S2."CodSubGrupo" AS IDSUBGRUPO, '+
        '         S2."SubGrupo" AS DSSUBGRUPO '+
        '     FROM SBO_GTO_PRD.IS_ENT_SAI_DETALHADO S2  '+
        ' )S2 ON S2."Cod.Item" = S1.CPROD '+
    ' where 1=? and t1.DEST_CPF<> \'\'' ; 
    
    if( dataInicio &&  dataFim){
        query = query + 'and t1.dthorafechamento between \'' + dataInicio + ' 00:00:00 \' and \'' + dataFim + ' 23:59:00\' ';
    }
    
    
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

