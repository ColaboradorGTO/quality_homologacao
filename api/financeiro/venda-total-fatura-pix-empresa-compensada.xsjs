var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {

  var idMarca = $.request.parameters.get("idMarca");
  var idEmpresa = $.request.parameters.get("idEmpresa");
  var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
  var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

  
  var query = ` 
    SELECT 
      tbe.IDEMPRESA, 
      tbe.NOFANTASIA,
      tbe.IDGRUPOEMPRESARIAL, 
      tbe.CONTACREDITOSAP,
      tbdf.DTPROCESSAMENTO, 
      tbdf.DATA_COMPENSACAO,
      tbdf.STCONFERIDO, 
      tbdf.IDDETALHEFATURA, 
      tbdf.IDMOVIMENTOCAIXAWEB, 
      tbdf.NUCODAUTORIZACAO,
      tbf.NOFUNCIONARIO, 
      (SELECT IFNULL(SUM(tbdf.VRRECEBIDO),0) FROM "QUALITY_CONC_HML".DETALHEFATURA tbdf INNER JOIN "QUALITY_CONC_HML".MOVIMENTOCAIXA tbmcf on tbdf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA AND tbdf.STCANCELADO='False' AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL) AND (tbdf.DATA_COMPENSACAO  BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VALORTOTALFATURA,
      (SELECT IFNULL(SUM(tbdf.VRRECEBIDO),0) FROM "QUALITY_CONC_HML".DETALHEFATURA tbdf INNER JOIN "QUALITY_CONC_HML".MOVIMENTOCAIXA tbmcf on tbdf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbdf.IDEMPRESA = tbe.IDEMPRESA AND tbdf.STCANCELADO='False' AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL) AND (tbdf.DTPROCESSAMENTO BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59')) AS VALORTOTALFATURAVENDAPIX
    FROM 
      QUALITY_CONC_HML.VENDA tbv 
      INNER JOIN QUALITY_CONC_HML.DETALHEFATURA tbdf ON tbdf.IDEMPRESA = tbv.IDEMPRESA
      INNER JOIN QUALITY_CONC_HML.EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA 
      LEFT JOIN QUALITY_CONC_HML.FUNCIONARIO tbf ON tbdf.IDFUNCIONARIO = tbf.IDFUNCIONARIO 
    WHERE 1 = ?  AND tbv.STCANCELADO  = 'False'
   
    `;
        
    
  if(idMarca) {
    query = query + ' AND tbe.IDGRUPOEMPRESARIAL = \'' + idMarca + '\' ';
  }
  
  if(idEmpresa>0) {
    query = query + ' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
  }
  
  if(dataPesquisaInicio && dataPesquisaFim) {
    query = query + ' AND (tbdf.DATA_COMPENSACAO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
  }
    

  query = query + `GROUP BY 
       tbe.IDEMPRESA, 
    tbe.NOFANTASIA, 
    tbe.IDGRUPOEMPRESARIAL, 
    tbe.CONTACREDITOSAP, 
    tbdf.DTPROCESSAMENTO,
    tbdf.DATA_COMPENSACAO, 
    tbdf.STCONFERIDO,
    tbdf.IDDETALHEFATURA,
    tbdf.IDMOVIMENTOCAIXAWEB,
    tbf.NOFUNCIONARIO,
    tbdf.NUCODAUTORIZACAO
    `;
  
   query = query + ' ORDER BY  tbdf.DATA_COMPENSACAO';
   
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
            
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}