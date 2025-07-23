var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idGrupo = $.request.parameters.get("idGrupo");
    var idLoja = $.request.parameters.get("idLoja");
    var dataPesquisaInicio = $.request.parameters.get("dtInicio");
    var dataPesquisaFim = $.request.parameters.get("dtFim");

    var query = ' SELECT ' + 
            ' tbe.IDEMPRESA, ' + 
            ' tbe.NOFANTASIA, ' +
            ' tbv.IDVENDA, ' + 
            ' IFNULL (TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-MM-DD\'),\'NÃO INFORMADO\') AS Data, ' +
            ' CASE WHEN tbvp.NOTEF = \'POS\' THEN tbvp.NUAUTORIZACAO ' +
            ' ELSE (replace(tbvp.NSUAUTORIZADORA,\' VA\',\'\')) ' +
            ' END ' + 
    		' AS Nsu, ' + 
            ' tbvp.NSUTEF AS Autorizacao, ' +
            ' IFNULL (SUM(tbv.VRTOTALPAGO),0) AS VRTOTALPAGO, ' + 
            ' IFNULL (SUM(tbv.VRTOTALDESCONTO),0) AS VRTOTALDESCONTO, ' + 
            ' IFNULL (SUM(tbvp.VALORRECEBIDO),0) AS VRPAGO, ' + 
            ' IFNULL (tbvp.DSTIPOPAGAMENTO, NULL) AS DSTIPOPAGAMENTO, ' + 
            ' IFNULL (tbvp.NSUTEF, NULL) AS NSU, ' + 
            ' IFNULL (tbvp.NUAUTORIZACAO, NULL) AS NUAUTORIZACAO, ' + 
            ' CASE WHEN tbvp.NPARCELAS IS NULL THEN 1 ' +
            ' WHEN tbvp.NPARCELAS = 0 THEN 1 ' +
            ' ELSE tbvp.NPARCELAS ' +
            ' END ' + 
    		' AS Plano, ' +
    		' CASE WHEN DSTIPOPAGAMENTO = \'CREDSYSTEM\' THEN (SELECT e.CODESTABELECIMENTO FROM quality_conc.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO=\'CREDSYSTEM\') ' + 
    		' ELSE (SELECT e.CODESTABELECIMENTO FROM quality_conc.ESTABELECIMENTO e WHERE e.IDEMPRESA = tbe.IDEMPRESA AND e.NUESTABELECIMENTO=\'REDE\') ' +
    		' END ' + 
    		' AS Estabelecimento ' +
            ' FROM ' + 
            ' "VAR_DB_NAME".VENDAPAGAMENTO tbvp ' + 
            ' INNER JOIN "VAR_DB_NAME".VENDA tbv ON tbvp.IDVENDA = tbv.IDVENDA ' +
            ' INNER JOIN "VAR_DB_NAME".EMPRESA tbe on tbv.IDEMPRESA = tbe.IDEMPRESA ' +
            ' WHERE ' +
            ' 1 = ? ' +
            ' AND tbv.STCANCELADO = \'False\' ' +
            ' AND (tbvp.STCANCELADO = \'False\' OR tbvp.STCANCELADO IS NULL) ' +
            ' AND (tbvp.NOTEF = \'POS\' OR tbvp.NOTEF = \'TEF\') ';

    if(idGrupo === '1') {
        // query = query + ' AND tbe.IDEMPRESA IN (1,2,3,4,5,6,7,8,10,11,12,15,23,25,26,27,28,29,30,31,33,35,36,37,38,39,40,42,49,57,60,61,62,69,70,78,80,81,83,84,86,96,100,101,111,103) ';
        query = query + ' AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "VAR_DB_NAME".EMPRESA WHERE IDGRUPOEMPRESARIAL = 1 AND STATIVO = \'True\') ';
    }
    if(idGrupo === '2') {
        // query = query + ' AND tbe.IDEMPRESA IN (9,13,14,16,17,18,19,20,22,24,32,41,44,45,46,51,52,55,63,64,66,67,72,73,76,82,88,89,104,113) ';
        query = query + ' AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "VAR_DB_NAME".EMPRESA WHERE IDGRUPOEMPRESARIAL = 2 AND STATIVO = \'True\') ';
    }
    if(idGrupo === '3') {
        // query = query + ' AND tbe.IDEMPRESA IN (91,98,105,106,107,112) ';
        query = query + ' AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "VAR_DB_NAME".EMPRESA WHERE IDGRUPOEMPRESARIAL = 3 AND STATIVO = \'True\') ';
    }
    if(idGrupo === '4'){
        // query = query + ' AND tbe.IDEMPRESA IN (34,54,93,95,102,21,43,74,47,48,50,53,56,58,65,92,97,71,59,75,77,79,85,87,68,90,94,99,108,109,110) ';
        query = query + ' AND tbe.IDEMPRESA IN (SELECT IDEMPRESA FROM "VAR_DB_NAME".EMPRESA WHERE IDGRUPOEMPRESARIAL = 4 AND STATIVO = \'True\') ';
    }

    if(idLoja) {
        query = query + ' AND tbe.IDEMPRESA =\'' + idLoja +'\' ';
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + ' AND (tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    query = query + ' GROUP BY tbv.IDVENDA,tbvp.DSTIPOPAGAMENTO,tbvp.NSUAUTORIZADORA, tbvp.NSUTEF,tbvp.NPARCELAS,tbvp.NUAUTORIZACAO,tbvp.NOAUTORIZADOR, tbvp.NOTEF,tbv.DTHORAFECHAMENTO,TBVP.DSTIPOPAGAMENTO,tbe.IDEMPRESA, tbe.NOFANTASIA';
    query = query + ' ORDER BY tbe.IDEMPRESA ,tbv.DTHORAFECHAMENTO ';
    
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