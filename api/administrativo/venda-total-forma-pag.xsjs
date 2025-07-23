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
            	' tbv.IDEMPRESA,' +
            	' e.NOFANTASIA,' +
            	' tbv.IDVENDA,' +
            	' TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-mm-YYYY\') AS DATAVENDA,' +
            	' IFNULL ((tbv.VRRECDINHEIRO),0) AS VRRECDINHEIRO,' +
            	' IFNULL ((tbv.VRRECCARTAO),0) AS VRRECCARTAO,' +
            	' IFNULL ((tbv.VRRECPOS),0) AS VRRECPOS,' +
            	' IFNULL ((tbv.VRRECVOUCHER),0) AS VRRECVOUCHER,' +
            	' IFNULL ((tbv.VRRECCONVENIO),0) AS VRRECCONVENIO,' +
            	' tbvp.DSTIPOPAGAMENTO AS DSPAG,' +
            	' tbvp.NUAUTORIZACAO,' +
            	' tbvp.NOTEF,' +
            	' CASE WHEN (tbvp.NPARCELAS IS NULL) THEN 0' +
                ' ELSE tbvp.NPARCELAS' + 
                ' END ' +
            	' AS NPARCELAS,' +
            	' tbv.NFE_INFNFE_IDE_SERIE AS SERIENF,' +
            	' tbv.PROTNFE_INFPROT_CHNFE AS CHAVENF,' +
            	' tbv.NFE_INFNFE_IDE_NNF AS NUMERONF' +
            	' FROM ' +
            	' "VAR_DB_NAME".VENDA tbv' +
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
                // if(dSFormaPag) {
                //     query = query + 'AND UPPER(tbvp.DSTIPOPAGAMENTO) = \'' + dSFormaPag + '\' ';
                // }
                // if(dSParc>0) {
                //     query = query + 'AND (tbvp.NPARCELAS) = \'' + dSParc + '\' ';
                // }
                
                if(dSFormaPag) {
                  var dSFormaPagArray = dSFormaPag.split(',');
                  if(dSFormaPag.length > 1) {
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
                query = query + ' GROUP BY tbvp.DSTIPOPAGAMENTO,tbvp.NUAUTORIZACAO,tbvp.NPARCELAS,tbvp.NOTEF,TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-mm-YYYY\'),tbv.IDVENDA,tbv.IDEMPRESA,tbv.VRRECDINHEIRO,tbv.VRRECCARTAO,tbv.VRRECPOS,tbv.VRRECVOUCHER,tbv.VRRECCONVENIO,e.NOFANTASIA,tbv.NFE_INFNFE_IDE_SERIE,tbv.PROTNFE_INFPROT_CHNFE,tbv.NFE_INFNFE_IDE_NNF ';
            	query = query + ' ORDER BY tbv.IDEMPRESA,TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'DD-mm-YYYY\') ';
        
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