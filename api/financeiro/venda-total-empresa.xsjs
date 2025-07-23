var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisa = $.request.parameters.get("dataPesquisa");
    
    var query = ' SELECT ' +
        ' tbe.IDEMPRESA, '+
        ' tbe.NOFANTASIA, '+
        ' IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, '+
        ' IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, '+
        ' IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, '+
        ' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO!=\'PIX\') AND (tbvp.DSTIPOPAGAMENTO!=\'MoovPay\')) AS VALORTOTALPOS, '+
    	' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'PIX\' AND (tbvp.DSTIPOPAGAMENTO =\'PIX\')) AS VALORTOTALPIX, '+
    	' (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE (tbv1.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\') AND tbv1.IDEMPRESA = tbe.IDEMPRESA AND tbv1.STCANCELADO = \'False\' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = \'POS\' AND (tbvp.DSTIPOPAGAMENTO =\'MoovPay\')) AS TOTALVENDIDOMOOVPAY, '+
        ' IFNULL (SUM(tbv.VRRECPOS),0) AS VALORTOTALPOS2, '+
        ' IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, '+ 
        ' (SELECT IFNULL (SUM(tbf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbf INNER JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO=\'False\' AND (tbf.STPIX = \'False\' OR tbf.STPIX IS NULL) AND (tbf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')) AS VALORTOTALFATURA,' +
        ' (SELECT IFNULL (SUM(tbf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbf INNER JOIN "VAR_DB_NAME".MOVIMENTOCAIXA tbmcf on tbf.IDMOVIMENTOCAIXAWEB = tbmcf.ID WHERE tbf.IDEMPRESA = tbe.IDEMPRESA AND tbf.STCANCELADO=\'False\' AND tbf.STPIX = \'True\' AND (tbf.DTPROCESSAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')) AS VALORTOTALFATURAPIX,' +
        ' (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.IDEMPRESA = tbe.IDEMPRESA AND tbd.STCANCELADO = \'False\' AND tbd.DTDESPESA = \'' + dataPesquisa +'\') AS VALORTOTALDESPESA,  '+
        ' (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.IDEMPRESA = tbe.IDEMPRESA AND tbas.STATIVO = \'True\' AND tbas.DTLANCAMENTO = \'' + dataPesquisa +'\') AS VALORTOTALADIANTAMENTOSALARIAL  '+
        ' FROM ' +
        '	"VAR_DB_NAME".VENDA tbv ' +
        '	INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbv.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ?' +
        ' AND tbv.STCANCELADO = \'False\'';
        
    
    if(idDaEmpresa) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(dataPesquisa) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisa + ' 00:00:00\' AND \'' + dataPesquisa + ' 23:59:59\')';
    }
    query = query + ' GROUP BY tbe.IDEMPRESA, tbe.NOFANTASIA ';
    
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