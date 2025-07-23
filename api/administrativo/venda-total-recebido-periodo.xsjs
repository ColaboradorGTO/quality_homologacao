var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresaGrupo = $.request.parameters.get("idEmpGrupo");
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idFunc = $.request.parameters.get("idFunc");
    var dSFormaPag = $.request.parameters.get("dSFormaPag");
    var dSParc = $.request.parameters.get("dSParc");
    
    var query = ' SELECT ' +
            	' e.NOFANTASIA,' +
            	' cx.DSCAIXA,' +
            	' f.NOFUNCIONARIO,' +
            	' f.NOLOGIN,' +
            	' f.NUCPF,' +
            	' TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-mm-YYYY\') AS DATAVENDA,' +
            	' IFNULL (sum(tbvp.VALORRECEBIDO),0) AS VALORRECEBIDO,' +
            	' CASE WHEN (tbvp.NPARCELAS IS NULL AND tbvp.DSTIPOPAGAMENTO = \'Rede Crédito\') THEN \'Rede Débito\'' +
                ' ELSE tbvp.DSTIPOPAGAMENTO' + 
                ' END ' +
            	' AS DSTIPOPAGAMENTO,' +
            	' tbvp.DSTIPOPAGAMENTO AS DSPAG,' +
            	' tbvp.NOTEF,' +
            	' tbvp.NPARCELAS AS NUPARC,' +
            	' CASE WHEN (tbvp.NPARCELAS IS NULL) THEN 0' +
                ' ELSE tbvp.NPARCELAS' + 
                ' END ' +
            	' AS NPARCELAS' +
            	' FROM ' +
            	' "VAR_DB_NAME".VENDA tbv' +
            	' INNER JOIN "VAR_DB_NAME".CAIXA cx ON tbv.IDCAIXAWEB = cx.IDCAIXAWEB' +
            	' INNER JOIN "VAR_DB_NAME".FUNCIONARIO f ON tbv.IDOPERADOR = f.IDFUNCIONARIO' +
            	' INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO tbvp ON tbv.IDVENDA = tbvp.IDVENDA' +
            	' INNER JOIN "VAR_DB_NAME".EMPRESA e ON tbv.IDEMPRESA = e.IDEMPRESA' +
            	' WHERE ' +	
            	 '	1 = ?' +	 
            	' AND tbv.STCANCELADO = \'False\' '+
            	' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL)';
            	
                if(idDaEmpresaGrupo>0) {
                    query = query + 'AND e.IDSUBGRUPOEMPRESARIAL = \'' + idDaEmpresaGrupo + '\' ';
                }
                if(idDaEmpresa>0) {
                    query = query + 'AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
                }
                if(idFunc) {
                    query = query + 'AND tbv.IDOPERADOR = \'' + idFunc + '\' ';
                }
                // if(dSFormaPag) {
                //     query = query + 'AND UPPER(tbvp.DSTIPOPAGAMENTO) = \'' + dSFormaPag + '\' ';
                // }
                // if(dSParc>0) {
                //     query = query + 'AND (tbvp.NPARCELAS) = \'' + dSParc + '\' ';
                // }
                
                  if(dSFormaPag) {
                  var dSFormaPagArray = dSFormaPag.split(',');
                  if(dSFormaPagArray.length > 1) {
                    query += ' AND UPPER(tbvp.DSTIPOPAGAMENTO) IN (\'' + dSFormaPag.split(',').join('\',\'') + '\') ';
                  } else {
                    query = query += 'AND UPPER(tbvp.DSTIPOPAGAMENTO) = \'' + dSFormaPag + '\' ';
                  }
                }
                
                 if (dSParc) {
     var dSParcArray = dSParc.split(',');
     if (dSParcArray.length > 1) {
         query += ' AND tbvp.NPARCELAS IN (\'' + dSParcArray.join('\',\'') + '\') ';
     } else {
         query += ' AND tbvp.NPARCELAS = \'' + dSParc + '\' ';
     }
 }
 
                if(dataPesquisaInicio && dataPesquisaFim) {
                        query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
                }
                query = query + ' GROUP BY tbvp.DSTIPOPAGAMENTO,tbvp.NOTEF,tbvp.NPARCELAS,e.NOFANTASIA,cx.DSCAIXA,TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-mm-YYYY\'),f.NOFUNCIONARIO,f.NOLOGIN,f.NUCPF ';
            	query = query + ' ORDER BY f.NOFUNCIONARIO ';
        
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