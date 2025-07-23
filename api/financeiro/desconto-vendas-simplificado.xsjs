var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupo = $.request.parameters.get("idMarca");
    var dataInicioPesq = $.request.parameters.get("dataInicial");
    var dataFinalPesq = $.request.parameters.get("dataFinal");
    
    
   
    var query = ' SELECT ' +
    	'   E.NOFANTASIA, ' +
    	'   V.IDEMPRESA, ' +
        '   TO_DECIMAL(sum(V.VRRECDINHEIRO),12,2) as VRRECDINHEIRO, ' +
        '   TO_DECIMAL(sum(V.VRRECCARTAO),12,2) as VRRECCARTAO, ' +
        '   TO_DECIMAL(sum(V.VRRECCONVENIO),12,2) as VRRECCONVENIO, ' +
        '   TO_DECIMAL(sum(V.VRRECPOS),12,2) as VRRECPOS, ' +
        '   TO_DECIMAL(sum(V.VRRECVOUCHER),12,2) as VRRECVOUCHER, ' +
        '   TO_DECIMAL(sum(V.VRTOTALPAGO),12,2) as VRTOTALPAGO, ' +
        '   TO_DECIMAL(sum(VD.VPROD),12,2) as ValorTotalProdutoBruto,' +
    	'   TO_DECIMAL(sum(VD.VDESC),12,2) as VrDesconto, ' +
    	'   sum(VD.VRTOTALLIQUIDO) as TotalLiquido, ' +
    	'   (SELECT IFNULL(ROUND(SUM(S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),2),0)' +
        '      FROM' +
        '          QUALITY_CONC_HML.VENDA S1' +
        '      WHERE S1.IDEMPRESA = V.IDEMPRESA AND S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S1.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S1.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)>=5)'+
        '      AND (S1.DTHORAABERTURA BETWEEN \'' + dataInicioPesq + ' 00:00:00\' AND \'' + dataFinalPesq + ' 23:59:59\')'+
        '   GROUP BY S1.IDEMPRESA' +
        '   ) AS VLTOTALDESCONTOFUNCIONARIO,' +
        '   (SELECT IFNULL(ROUND(SUM(S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC),2),0)' +
        '      FROM' +
        '          QUALITY_CONC_HML.VENDA S2' +
        '      WHERE S2.IDEMPRESA = V.IDEMPRESA AND S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC > 0 AND (((S2.NFE_INFNFE_TOTAL_ICMSTOT_VDESC/S2.NFE_INFNFE_TOTAL_ICMSTOT_VPROD)*100)<5)'+
        '      AND (S2.DTHORAABERTURA BETWEEN \'' + dataInicioPesq + ' 00:00:00\' AND \'' + dataFinalPesq + ' 23:59:59\')'+
        '   GROUP BY S2.IDEMPRESA' +
        '   )AS VLTOTALDESCONTOCLIENTE' +
        ' FROM ' +
        '	"VAR_DB_NAME"."VENDADETALHE" VD ' +
        '   INNER JOIN "VAR_DB_NAME".VENDA V ON VD.IDVENDA = V.IDVENDA  ' + 
        '   LEFT JOIN "VAR_DB_NAME".CAIXA CX ON V.IDCAIXAWEB = CX.IDCAIXAWEB  ' + 
        '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON V.IDOPERADOR = FC.IDFUNCIONARIO  ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA E ON E.IDEMPRESA = V.IDEMPRESA  ' + 
        ' WHERE ' +
        '	1 = ?'+
        '   AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0 '+
        '   AND V."STCANCELADO"=\'False\' ';
        
    
    if(idDaEmpresa > 0) {
        query = query + ' AND V.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(idGrupo > 0) {
        query = query + ' AND E.IDGRUPOEMPRESARIAL = \'' + idGrupo + '\' ';
    }
    if(dataInicioPesq && dataFinalPesq) {
        query = query + ' AND (V.DTHORAABERTURA BETWEEN \'' + dataInicioPesq + ' 00:00:00\' AND \'' + dataFinalPesq + ' 23:59:59\')';
    }
    
    query = query + ' GROUP BY E.NOFANTASIA, V."IDEMPRESA" ';
    query = query + ' ORDER BY  V.IDEMPRESA ';
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}