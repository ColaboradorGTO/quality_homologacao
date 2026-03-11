var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupo = $.request.parameters.get("idMarca");
    var dataInicioPesq = $.request.parameters.get("dataInicial");
    var dataFinalPesq = $.request.parameters.get("dataFinal");
    var dsMotdesc = $.request.parameters.get("dsmotdesc");

    var query = ` 
        SELECT
            V.IDVENDA as "NumeroVenda",
            V.IDEMPRESA,
            E.NOFANTASIA,
            E.IDSUBGRUPOEMPRESARIAL,
            V.DTHORAFECHAMENTO,
            TO_VARCHAR( V.DTHORAFECHAMENTO,'DD/MM/YYYY HH24:MI:SS') AS DTLANCAMENTO,
            (select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM QUALITY_CONC.FUNCIONARIO T1 WHERE T1.NUCPF = V.DEST_CPF) AS NOFUNCIONARIO, 
            IFNULL (F.NUCPF,V.DEST_CPF) AS NUCPF,
            V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD,
            V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC,
            V.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF,
            V.VRRECDINHEIRO,
            V.VRRECCARTAO,
            V.VRRECPOS,
            V.VRRECCHEQUE,
            V.VRRECVOUCHER,
            V.VRRECCONVENIO,
            V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTO,
            V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRDESCONTO,
            V.VRTOTALPAGO AS VRLIQUIDO,
            V.DEST_CPF
        FROM
        	"VAR_DB_NAME"."VENDA" V 
    `;
    
    if( dsMotdesc == 'Convenio'){
        query = `
            SELECT DISTINCT 
                V.IDVENDA as "NumeroVenda",
                V.IDEMPRESA, 
                tbe.NOFANTASIA, 
                tbe.IDSUBGRUPOEMPRESARIAL, 
                V.DTHORAFECHAMENTO,
                TO_VARCHAR( V.DTHORAFECHAMENTO,'DD/MM/YYYY HH24:MI:SS') AS DTLANCAMENTO,
                (select FIRST_VALUE(T1.NOFUNCIONARIO ORDER BY T1.NOFUNCIONARIO) FROM "VAR_DB_NAME".FUNCIONARIO T1 WHERE T1.NUCPF = TBDET.NRCPF) AS NOFUNCIONARIO,  
                IFNULL (tbf.NUCPF,tbdet.NRCPF) AS NUCPF, 
                tbdet.IDLOJA,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VPROD,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VDESC,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VNF,
                V.VRRECDINHEIRO,
                V.VRRECCARTAO,
                V.VRRECPOS,
                V.VRRECCHEQUE,
                V.VRRECVOUCHER,
                V.VRRECCONVENIO,
                V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRBRUTO,
                Round(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,2) AS VRDESCONTO,
                (select LAST_VALUE(T1.VRLIQUIDO ORDER BY T1.VRLIQUIDO) FROM  "VAR_DB_NAME".DETLANCCONVENIO T1 WHERE T1.IDRESUMOVENDAWEB = V.IDVENDA) AS VRLIQUIDO 
            FROM
            	(SELECT IDRESUMOVENDAWEB, NRCPF, VRLIQUIDO, IDLOJA, VRBRUTO FROM  "VAR_DB_NAME".DETLANCCONVENIO WHERE STCANCELADO = 'False' GROUP BY IDRESUMOVENDAWEB, NRCPF, VRLIQUIDO, IDLOJA, VRBRUTO) tbdet
            	INNER JOIN (SELECT NUCPF FROM  "VAR_DB_NAME".FUNCIONARIO GROUP BY NUCPF) tbf ON tbdet.NRCPF = tbf.NUCPF
            	INNER JOIN  "VAR_DB_NAME".VENDA V  ON tbdet.IDRESUMOVENDAWEB =  V.IDVENDA
            	INNER JOIN  "VAR_DB_NAME".EMPRESA tbe ON V.IDEMPRESA =  tbe.IDEMPRESA  
        `;
    }
    
    if(dsMotdesc == 'Desconto Funcionario') {
        query += `  LEFT JOIN (SELECT * FROM "VAR_DB_NAME".FUNCIONARIO LIMIT 1 ) F ON V.DEST_CPF IN (F.NUCPF) `;
    }
    
    query += `   
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON 
            V.IDOPERADOR = FC.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".EMPRESA E ON 
            E.IDEMPRESA = V.IDEMPRESA  
    `;
    
    query += `
        WHERE 
            1 = ?
           AND V."STCANCELADO"='False' 
    `;
    
    if(idDaEmpresa > 0) {
        query = query + ' AND V.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(idGrupo > 0) {
        query = query + ' AND E.IDGRUPOEMPRESARIAL = \'' + idGrupo + '\' ';
    }
    if(dataInicioPesq && dataFinalPesq) {
        query += ` AND (TO_DATE(V.DTHORAFECHAMENTO) BETWEEN '${dataInicioPesq}' AND '${dataFinalPesq}') `;
    }

    if(dsMotdesc == 'Desconto Funcionario') {
        query += ` 
            AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC" > 0
            AND IFNULL(V.VRRECCONVENIO, 0) = 0
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
        `;
    } else {
        query += ` AND IFNULL(V.VRRECCONVENIO, 0) > 0 `;
    }
    
    query += ' ORDER BY  V.IDEMPRESA, V.DTHORAFECHAMENTO ';
    
    
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