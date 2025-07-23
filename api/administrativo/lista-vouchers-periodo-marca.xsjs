var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var dataInicial = $.request.parameters.get("dataInicial");    
    var dataFinal = $.request.parameters.get("dataFinal");
    
    var query = ' SELECT DISTINCT '+
                '     T1.IDEMPRESAORIGEM, '+
                '     T3.NOFANTASIA, '+
                '     T2.IDPRODUTO, '+
                '     T4.DSNOME, '+
                '     T4.NUCODBARRAS '+
                ' FROM QUALITY_CONC_HML.RESUMOVOUCHER T1 '+
                ' INNER JOIN QUALITY_CONC_HML.DETALHEVOUCHER T2 ON T1.IDVOUCHER = T2.IDVOUCHER '+
                ' INNER JOIN QUALITY_CONC_HML.EMPRESA T3 ON T3.IDEMPRESA = T1.IDEMPRESAORIGEM '+
                ' INNER JOIN QUALITY_CONC_HML.PRODUTO T4 ON t2.IDPRODUTO = T4.IDPRODUTO '+
                ' WHERE 1 = ?';
                
    if(idGrupoEmpresarial) {
        query = query + ' AND T3.IDGRUPOEMPRESARIAL = \'' + idGrupoEmpresarial + '\' ';
    }
    
    if(dataInicial && dataFinal) {
        query = query + ' AND (T1.DTINVOUCHER BETWEEN \'' + dataInicial + ' 00:00:00\' AND \'' + dataFinal + ' 23:59:59\')';
    }
                
    query = query + ' GROUP BY T1.IDEMPRESAORIGEM, T3.NOFANTASIA, T2.IDPRODUTO, T4.DSNOME, T4.NUCODBARRAS ';
    query = query + ' ORDER BY  T1.IDEMPRESAORIGEM,T2.IDPRODUTO';
		    
    
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