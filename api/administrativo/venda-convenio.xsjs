
var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesqInicio = $.request.parameters.get("dataInicial");
    var dataPesqFim = $.request.parameters.get("dataFinal");
    var idMarca = $.request.parameters.get("idMarca");
    var descFuncionario = $.request.parameters.get("descFuncionario");
    var query;
    
    query = ' SELECT DISTINCT (tbdet.IDRESUMOVENDAWEB) as "NumeroVenda", ' +
        '   tbv.IDEMPRESA, '+
        '   tbe.NOFANTASIA, '+
        '   tbe.IDSUBGRUPOEMPRESARIAL, '+
        '   TO_VARCHAR( tbv.DTHORAFECHAMENTO,\'YYYY-MM-DD HH24:MI:SS\') AS DTLANCAMENTO, ' +
        '   ifnull(tbf.NOFUNCIONARIO,(select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM QUALITY_CONC.FUNCIONARIO T1 WHERE T1.NUCPF = TBDET.NRCPF)) AS NOFUNCIONARIO,  '+
        '   IFNULL (tbf.NUCPF,tbdet.NRCPF) AS NUCPF, '+
        '   tbdet.IDLOJA, ' +
        '   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD, ' +
        '   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC, ' +
        '   tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF, ' +
        '   tbv.VRRECDINHEIRO, ' +
        '   tbv.VRRECCARTAO, ' +
        '   tbv.VRRECPOS, ' +
        '   tbv.VRRECCHEQUE, ' +
        '   tbv.VRRECVOUCHER, ' +
        '   tbv.VRRECCONVENIO, ' +
        '   tbdet.VRBRUTO, ' +
        '   Round(tbdet.VRDESCONTO,2) AS VRDESCONTO, ' +
        '   tbdet.VRLIQUIDO ' + 
        ' FROM ' +
        '	"VAR_DB_NAME".DETLANCCONVENIO tbdet ' +
        '	LEFT JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbdet.IDCONVENIADO = tbf.IDFUNCIONARIO ' +
        '   INNER JOIN "VAR_DB_NAME".VENDA tbv ON tbdet.IDRESUMOVENDAWEB =  tbv.IDVENDA ' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbv.IDEMPRESA =  tbe.IDEMPRESA ' +
        ' WHERE ' +
        '	1 = ? and tbdet.IDRESUMOVENDALOCAL > 0 and tbv.STCANCELADO = \'False\' and  tbdet.DTLANCAMENTO>=\'2020-01-01 00:00:00\'';
        
    if(descFuncionario){
        query = `
            SELECT DISTINCT (tbV.IDVENDA) as "NumeroVenda",
    	        tbv.IDEMPRESA,
                tbe.NOFANTASIA,
                tbe.IDSUBGRUPOEMPRESARIAL,
                TO_VARCHAR( tbv.DTHORAFECHAMENTO,'YYYY-MM-DD HH24:MI:SS') AS DTLANCAMENTO,
                ifnull(tbf.NOFUNCIONARIO,(select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM QUALITY_CONC.FUNCIONARIO T1 WHERE T1.NUCPF = tbv.DEST_CPF)) AS NOFUNCIONARIO, 
                IFNULL (tbf.NUCPF,tbv.DEST_CPF) AS NUCPF,
                tbv.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD,
                tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC,
                tbv.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF,
                tbv.VRRECDINHEIRO,
                tbv.VRRECCARTAO,
                tbv.VRRECPOS,
                tbv.VRRECCHEQUE,
                tbv.VRRECVOUCHER,
                tbv.VRRECCONVENIO,
                tbv.VRTOTALVENDA AS VRBRUTO,
                CASE
                    WHEN (VRTOTALDESCONTO IS NULL) THEN Round(tbv.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 2)
                    ELSE VRTOTALDESCONTO
                END AS VRDESCONTO,
                tbv.VRTOTALPAGO AS VRLIQUIDO,
                tbv.DEST_CPF
            FROM
    	        "VAR_DB_NAME".VENDA tbv
                INNER JOIN "VAR_DB_NAME".FUNCIONARIO tbf ON tbf.NUCPF = tbv.DEST_CPF
                INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbv.IDEMPRESA =  tbe.IDEMPRESA
            WHERE 
                1 = ? AND tbv.STCANCELADO = 'False' AND tbv.DEST_CPF <> ''`;
    }
    
    if(idMarca>0) {
        query = query + ' AND tbe.IDGRUPOEMPRESARIAL = \'' + idMarca + '\' ';
    }
    
    if(idDaEmpresa>0) {
        query = query + ' AND tbv.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    
    if(dataPesqInicio && dataPesqFim) {
       if(!descFuncionario){
           query = query + ' AND tbdet.DTLANCAMENTO BETWEEN \'' + dataPesqInicio + ' 00:00:00\' AND \'' + dataPesqFim +' 23:59:59\' ';
       }else{
           query = query + ' AND tbv.DTHORAFECHAMENTO BETWEEN \'' + dataPesqInicio + ' 00:00:00\' AND \'' + dataPesqFim +' 23:59:59\' ';
       }
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