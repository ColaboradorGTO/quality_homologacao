var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idVenda = $.request.parameters.get("idVenda");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idFuncPN = $.request.parameters.get("idFuncPN");
    var dataInicio = $.request.parameters.get("dataInicio");
    var dataFechamento = $.request.parameters.get("dataFechamento");
    var statusCancelado = $.request.parameters.get("status");
    
    var query = 'SELECT '+   
                '   TBE.NOFANTASIA, ' +
                '   TBC.IDCAIXAWEB, ' +
                '   TBC.DSCAIXA, ' +
                '   TBV.IDVENDA, ' +
                '   TBF.NOFUNCIONARIO, ' +
                '   TBFC.NOFUNCIONARIO AS NOCONVENIADO, ' +
                '   TBFC.NUCPF AS CPFCONVENIADO,' +
                '   TBV.DEST_CPF, ' +
                '   TBV.IDMOVIMENTOCAIXAWEB, ' +
                '   TBV.NFE_INFNFE_IDE_SERIE, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTOPAGO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRDESPAGO,' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRLIQPAGO,' +
                '   TBV.PROTNFE_INFPROT_CHNFE, ' +
                '   TBV.PROTNFE_INFPROT_NPROT, ' +
                '   TBV.NFE_INFNFE_IDE_NNF,  ' +
                '   TO_VARCHAR(TBV.DTHORAABERTURA,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAABERTURA, ' +
                '   TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.STATIVO,' +
                '   TBV.STCANCELADO,' +
                '   TO_VARCHAR(TBV.TXTMOTIVODESCONTO) AS TXTMOTIVODESCONTO' +
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON TBV.IDEMPRESA = TBE.IDEMPRESA ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFC ON TBV.DEST_CPF = TBFC.NUCPF ' +
                ' WHERE'+
                '	1 = ?';
    if(statusCancelado) {
        query = query + ' AND TBV.STCANCELADO = \'' + statusCancelado + '\' ';
    }
    
    if(idVenda) {
        query = query + ' AND TBV.IDVENDA = \'' + idVenda + '\' ';
    }
    
    if(idEmpresa>0) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(idFuncPN) {
        query = query + ' AND TBFC.IDFUNCIONARIO = \'' + idFuncPN + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFechamento + ' 23:59:59\') AND TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC >0 AND TBV.DEST_CPF != \'\' ';
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