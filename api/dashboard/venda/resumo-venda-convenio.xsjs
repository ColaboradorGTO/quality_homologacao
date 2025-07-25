var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idVenda = $.request.parameters.get("idVenda");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");    
    var statusCancelado = $.request.parameters.get("status");
    
    var query = 'SELECT '+ 
                '   TBLC.IDDETLACCONVENIO, ' +
                '   TBE.NOFANTASIA, ' +
                '   TBC.IDCAIXAWEB, ' +
                '   TBC.DSCAIXA, ' +
                '   TBF.NOFUNCIONARIO, ' +
                '   TBLC.IDCONVENIADO,' +
                '   ifnull(TBFC.NOFUNCIONARIO,(select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM QUALITY_CONC.FUNCIONARIO T1 WHERE T1.NUCPF = TBLC.NRCPF)) AS NOCONVENIADO, ' +
                '   IFNULL (TBFC.NUCPF,TBLC.NRCPF) AS CPFCONVENIADO, ' +
                '   TBCON.DSCONVENIO, ' +
                '   TBLC.VRBRUTO AS VRBRUTOCONVENIADO,' +
                '   TBLC.VRDESCONTO AS VRDESCONTOCONVENIADO,' +
                '   TBLC.VRLIQUIDO AS VRLIQUIDOCONVENIADO,' +
                '	TO_VARCHAR(TBLC.DTVENCIMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTVENCIMENTOCONVENIADO, ' +
                '   TBV.IDVENDA, ' +
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
                '   TBV.VRTOTALDESCONTO, ' +
                '	TO_VARCHAR(TBV.DTHORAABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURA, ' +
                '	TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, '+
                '   TO_VARCHAR(TBV.TXTMOTIVOCANCELAMENTO) AS TXTMOTIVOCANCELAMENTO, ' +
                '   TBV.STATIVO,' +
                '   TBV.STCANCELADO,' +
                '   TO_VARCHAR(TBV.TXTMOTIVODESCONTO) AS TXTMOTIVODESCONTO,' +
                '   TBV.STCONTINGENCIA' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA ' +
                '   LEFT JOIN "VAR_DB_NAME".DETLANCCONVENIO TBLC ON TBV.IDVENDA = TBLC.IDRESUMOVENDAWEB ' +
                '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFC ON TBLC.IDCONVENIADO = TBFC.IDFUNCIONARIO ' +
                '   LEFT JOIN "VAR_DB_NAME".CONVENIO TBCON ON TBLC.IDCONVENIO = TBCON.IDCONVENIO ' +
                ' WHERE'+
                '	1 = ? and TBLC.IDRESUMOVENDALOCAL > 0';
    if(statusCancelado) {
        query = query + ' AND TBV.STCANCELADO = \'' + statusCancelado + '\' ';
    }
    
    if(idVenda) {
        query = query + ' AND TBV.IDVENDA = \'' + idVenda + '\' ';
    }
    
    if(idEmpresa>0) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\') AND TBV.VRRECCONVENIO>0';
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