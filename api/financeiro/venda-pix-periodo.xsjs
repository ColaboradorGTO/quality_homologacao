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
    
    var idDaMarca = $.request.parameters.get("idMarca");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var idDLojasPesq = $.request.parameters.get("lojas");
    var empresasList = $.request.parameters.get("empresasList");
    var dataCompInicio = $.request.parameters.get("dataCompInicio");
    var dataCompFim = $.request.parameters.get("dataCompFim");

     var query = ` 
        SELECT 
            tbe.IDEMPRESA,
            tbe.NOFANTASIA,
            tbv.IDVENDA,
            tbvp.DSTIPOPAGAMENTO,
            IFNULL ((tbvp.VALORRECEBIDO),0) AS PIX,
            IFNULL (TO_VARCHAR(tbv.DATA_COMPENSACAO, 'DD/mm/YYYY'),'NÃO INFORMADO') AS DATA_COMPENSACAO,
            IFNULL (TO_VARCHAR(tbv.DTHORAFECHAMENTO,'DD/mm/YYYY'),'NÃO INFORMADO') AS DATAVENDA,
            tbvp.NUAUTORIZACAO,
            TBV.STATUS_BLOQUEIO_ATUALIZACAO,
            IFNULL(TBV.DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX, 0) AS DOCENTRY_SAP_CONTAS_A_RECEBER_PGTO_PIX,
            TO_VARCHAR(ERROR_LOG_SAP_PIX) AS ERROR_LOG_SAP_PIX
        FROM
            "VAR_DB_NAME".VENDA tbv
        INNER JOIN "VAR_DB_NAME".VENDAPAGAMENTO tbvp on tbv.IDVENDA = tbvp.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA
        WHERE
            1 = ? 
            AND tbv.STCANCELADO = 'False'
            AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL)
            AND tbvp.NOTEF = 'PIX' AND tbvp.DSTIPOPAGAMENTO='PIX'
    `;

	if (byId) {
		query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
	}
	
	if (empresasList) {
		query = query + ' And  tbe.IDEMPRESA IN (' + empresasList + ') ';
	}else{
	
    	if (idDaMarca == 0) {
    		query = query + ' And  tbe.IDGRUPOEMPRESARIAL IN (1,2,3,4)  ';
    	}else{
    	    query = query + ' And  tbe.IDGRUPOEMPRESARIAL = \'' + idDaMarca + '\' ';
    	}
    	
    	if (idDLojasPesq>0) {
    		query = query + ' And  tbe.IDEMPRESA IN (' + idDLojasPesq + ') ';
    	}
	}
	
	
	if(dataPesquisaInicio && dataPesquisaFim) {
        query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }

    if(dataCompInicio && dataCompFim) {
        query = query + ' AND (tbv.DATA_COMPENSACAO BETWEEN \'' + dataCompInicio + ' 00:00:00\' AND \'' + dataCompFim + ' 23:59:59\')';
    }
  
    query = query + ' ORDER BY tbe.NOFANTASIA, tbv.DTHORAFECHAMENTO ';
    
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