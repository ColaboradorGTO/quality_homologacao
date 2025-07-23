var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idVenda = $.request.parameters.get("idVenda");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");    
    var statusCancelado = $.request.parameters.get("status");
    
    var query = 'SELECT DISTINCT '+ 
                '   TBV.IDVENDA, ' +
                '   TBE.NOFANTASIA, ' +
                '   TBC.IDCAIXAWEB, ' +
                '   TBC.DSCAIXA, ' +
                '   TBF.NOFUNCIONARIO, ' +
                '   TBLC.IDCONVENIADO,' +
                '   TBFC.NOFUNCIONARIO AS NOCONVENIADO, ' +
                '   TBFD.NOFUNCIONARIO AS NOFUNDESCONTO, ' +
                '   TBFC.NUCPF AS CPFCONVENIADO, ' +
                '   TBCON.DSCONVENIO, ' +
                '   TBCLIV.DSNOMERAZAOSOCIAL AS NOMECLIENTE, ' +
                '   TBLC.VRBRUTO AS VRBRUTOCONVENIADO,' +
                '   TBLC.VRDESCONTO AS VRDESCONTOCONVENIADO,' +
                '   TBLC.VRLIQUIDO AS VRLIQUIDOCONVENIADO,' +
                '	TO_VARCHAR(TBLC.DTVENCIMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTVENCIMENTOCONVENIADO, ' +
                '   TBV.IDMOVIMENTOCAIXAWEB, ' +
                '   TBV.NFE_INFNFE_IDE_SERIE, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, ' +
                '   TBV.VRTOTALVENDA, ' +
                '   TBV.PROTNFE_INFPROT_CHNFE, ' +
                '   TBV.PROTNFE_INFPROT_NPROT, ' +
                '   TBV.NFE_INFNFE_IDE_NNF, ' +
                '   TBV.DEST_CPF, ' +
                '   TBV.VRRECCONVENIO, ' +
                '   TBV.VRRECVOUCHER, ' +
                '   TBV.VRTOTALDESCONTO, ' +
                '   TBRVOU.NUVOUCHER, ' +
                '   TBCLIVOU.DSNOMERAZAOSOCIAL AS CLIENTEVOUCHER, ' +
                '   TBCLIVOU.NUCPFCNPJ AS CPFCLIENTEVOUCHER, ' +
                '	TO_VARCHAR(TBV.DTHORAABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURA, ' +
                '	TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, '+
                '   TO_VARCHAR(TBV.TXTMOTIVOCANCELAMENTO) AS TXTMOTIVOCANCELAMENTO, ' +
                '   TBV.STATIVO,' +
                '   TBV.STCANCELADO,' +
                '   TO_VARCHAR(TBV.TXTMOTIVODESCONTO) AS TXTMOTIVODESCONTO,' +
                '   TBV.STCONTINGENCIA' +
                //'   ,IFNULL(TBCP.IDCUPOMPROMOCAO, 0) AS IDCUPOMPROMOCAO ' +
                //'   ,TBCP.IDVENDAORIGEM ' +
                //'   ,TBCP.IDVENDADESTINO ' +
                //'   ,IFNULL(TBCP.VRDESCONTO, 0) AS VRDESCONTO ' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA ' +
                '   LEFT JOIN "VAR_DB_NAME".DETLANCCONVENIO TBLC ON TBV.IDVENDA = TBLC.IDRESUMOVENDAWEB ' +
                '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFC ON TBLC.IDCONVENIADO = TBFC.IDFUNCIONARIO ' +
                '   LEFT JOIN "VAR_DB_NAME".CONVENIO TBCON ON TBLC.IDCONVENIO = TBCON.IDCONVENIO ' +
                '   LEFT JOIN "VAR_DB_NAME".RESUMOVOUCHER TBRVOU ON TBV.IDVENDA = TBRVOU.IDRESUMOVENDAWEB ' +
                '   LEFT JOIN "VAR_DB_NAME".CLIENTE TBCLIVOU ON TBRVOU.IDCLIENTE = TBCLIVOU.IDCLIENTE ' +
                '   LEFT JOIN "VAR_DB_NAME".CLIENTE TBCLIV ON TBV.DEST_CPF = TBCLIV.NUCPFCNPJ AND TBCLIV.NUCPFCNPJ!= \'\' AND TBCLIV.NUCPFCNPJ IS NOT NULL' + 
                '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFD ON TBV.DEST_CPF = TBFD.NUCPF AND TBFD.NUCPF!= \'\' AND TBFD.NUCPF IS NOT NULL AND TBFD.STATIVO = \'True\'' + 
                //'   LEFT JOIN "VAR_DB_NAME".CUPOMPROMOCAO TBCP ON (TBCP.IDVENDAORIGEM = TBV.IDVENDA OR TBCP.IDVENDADESTINO = TBV.IDVENDA) ' +
                ' WHERE '+
                '	1 = ?';
    if(statusCancelado) {
        query = query + ' AND TBV.STCANCELADO = \'' + statusCancelado + '\' ';
    }
    
    if(idVenda) {
        query = query + ' AND TBV.IDVENDA = \'' + idVenda + '\' ';
    }
    
    if(idEmpresa > 0) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\')';
    }

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