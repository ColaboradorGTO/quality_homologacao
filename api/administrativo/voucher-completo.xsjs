let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let DB_SAP = 'SBO_GTO_TESTE4';

function padLeft(number, length, character) {
	if(character == null) {
		character = '0';
    }
	var result = String(number);
	for(var i = result.length; i < length; ++i) {
		result = character + result;
	}
	return result;
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function fnHandleGet(byId) {

    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    var subgrupoEmpresa = $.request.parameters.get("subgrupoEmpresa");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dadosVoucher = $.request.parameters.get("dadosVoucher");
    var stStatus = $.request.parameters.get("stStatus");
    
    let query =`
        WITH CTE_VOUCHER AS (
            SELECT 
                IDVOUCHER,
                DIAS_PASSADOS,
                TPCLIENTE,
                NOMECLIENTE, 
                STSTATUS,  
                STTIPOTROCA,  
                MOTIVOTROCA,  
                NOFUNCIONARIOLIBERACAOCRIACAO, 
                NOFUNCIONARIOLIBERACAOCONSUMO,
                DTINVOUCHER,
                DTINVOUCHERFORMATADO,  
                DTOUTVOUCHER,
                DTOUTVOUCHERFORMATADO,  
                IDCAIXAORIGEM, 
                DSCAIXAORIGEM,  
                NUVOUCHER,
                VRVOUCHER,  
                STATIVO,  
                STCANCELADO,  
                DSMOTIVOCANCELAMENTO,
                NOMEFANTASIAEMPRESAORIGEM, 
                NOMEFANTASIAEMPRESADESTINO,
                DSCAIXADESTINO,
                CSTAT_VENDA,
               	IDSAP_VENDA,
                IDSAP_CLIENTE, 
                STDEVOLUCAOSAP,
                IDSAP_DEVOLUCAO,
                STREFDEVOLUCAOSAP,
                ID_STATE_DEVOLUCAO,
                NUMSTATESEFAZNOTADEVOLUCAO,
                MSGRETORNOSEFAZNOTADEVOLUCAO,
                STTRANSFERIRPRODUTO,
                STNOTASAIDATRANSFERENCIASAP,
                IDSAPNOTASAIDATRANSFERENCIA,
                ID_STATE_TRANSFERENCIA,
                NUMSTATESEFAZNOTASAIDATRANSFERENCIA,
                MSGRETORNOSEFAZNOTASAIDATRANSFERENCIA,
                STNOTAENTRADATRANSFERENCIASAP,
                IDSAPNOTAENTRADATRANSFERENCIA,
                STTRANSFERENCIACOMPLETASAP,
                LOGERRORVENDA,
                LOGERRORCLIENTE,
                LOGERRORVOUCHER,
                ROW_NUMBER() OVER (PARTITION BY IDVOUCHER ORDER BY ID_STATE_DEVOLUCAO DESC, ID_STATE_TRANSFERENCIA DESC) AS RN
            FROM (
                SELECT DISTINCT
                    TBR.IDVOUCHER,
                    ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIAS_PASSADOS,
                    TBC.DSNOMERAZAOSOCIAL AS NOMECLIENTE, 
                    TBR.STSTATUS,  
                    TBR.STTIPOTROCA,  
                    TBR.MOTIVOTROCA,  
                    TBFUNCIONARIO.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
                    TBFUNCLIBERACONSUMO.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCONSUMO,
                    TBR.DTINVOUCHER,
                    TO_VARCHAR(TBR.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
                    TBR.DTOUTVOUCHER,
                    TO_VARCHAR(TBR.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
                    TBR.IDCAIXAORIGEM, 
                    TBCORIGEM.DSCAIXA AS DSCAIXAORIGEM,  
                    TBR.NUVOUCHER,
                    TBR.VRVOUCHER,  
                    TBR.STATIVO,  
                    TBR.STCANCELADO,  
                    TO_VARCHAR(TBR.DSMOTIVOCANCELAMENTO) AS DSMOTIVOCANCELAMENTO,
                    TBEMPORIGEM.NOFANTASIA AS NOMEFANTASIAEMPRESAORIGEM, 
                    TBEMPDESTINO.NOFANTASIA AS NOMEFANTASIAEMPRESADESTINO,
                    TBCDESTINO.DSCAIXA AS DSCAIXADESTINO,
                    TBV.PROTNFE_INFPROT_CSTAT AS CSTAT_VENDA,
                    TBV.SAP_DOCENTRY AS IDSAP_VENDA,
                    TBC.IDCLIENTESAP AS IDSAP_CLIENTE, 
                    IFNULL(TBR.DOCENTRYDEVSAP, SBO_ORIN."DocEntry") AS IDSAP_DEVOLUCAO,
                    IFNULL(TBR.DOCENTRYNOTASAIDATRANSFERENCIASAP, SBO_OINV."DocEntry") AS IDSAPNOTASAIDATRANSFERENCIA,
                    TBR.DOCENTRYNOTAENTRADATRANSFERENCIASAP AS IDSAPNOTAENTRADATRANSFERENCIA,
                    TBR.STDEVOLUCAOSAP,
                    TBR.DOCENTRYDEVSAP,
                    TBR.STREFDEVOLUCAOSAP,
                    SBO_SKL25DEV."Code" AS ID_STATE_DEVOLUCAO,
                    SBO_SKL25DEV."U_cdErro" AS NUMSTATESEFAZNOTADEVOLUCAO,
                    SBO_SKL25DEV."U_msgSEFAZ" AS MSGRETORNOSEFAZNOTADEVOLUCAO,
                    CASE
                    WHEN (TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA AND TO_VARCHAR(TBR.IDVOUCHER)  = SBO_ORIN."U_ID_VENDA_PDV") THEN 'True'
                    ELSE 'False'
                    END AS STTRANSFERIRPRODUTO,
                    IFNULL(TBR.STNOTASAIDATRANSFERENCIASAP, 'False') AS STNOTASAIDATRANSFERENCIASAP,
                    TBR.DOCENTRYNOTASAIDATRANSFERENCIASAP,
                    SBO_SKL25TRANSF."Code"  AS ID_STATE_TRANSFERENCIA,
                    SBO_SKL25TRANSF."U_cdErro"  AS NUMSTATESEFAZNOTASAIDATRANSFERENCIA,
                    SBO_SKL25TRANSF."U_msgSEFAZ" AS MSGRETORNOSEFAZNOTASAIDATRANSFERENCIA,
                    TBR.STNOTAENTRADATRANSFERENCIASAP,
                    TBR.DTHORANOTAENTRADATRANSFERENCIASAP,
                    TBR.DOCENTRYNOTAENTRADATRANSFERENCIASAP,
                    TBR.STTRANSFERENCIACOMPLETASAP,
                    CASE 
                        WHEN UPPER(TBC.TPCLIENTE) LIKE '%JUR%' OR LENGTH(TBC.NUCPFCNPJ) > 11 THEN 'JURIDICA'
                        ELSE TBC.TPCLIENTE
                    END AS TPCLIENTE,
                    IFNULL(TBC.ERRORLOGSAP, '') AS LOGERRORCLIENTE,
                    CASE 
                        WHEN (IFNULL(TBV.SAP_DOCENTRY, 0) = 0 AND TBV.PROTNFE_INFPROT_CSTAT = 100) THEN 'VENDA NÃO MIGRADA'
                        WHEN (IFNULL(TBV.SAP_DOCENTRY, 0) = 0 AND TBV.PROTNFE_INFPROT_CSTAT <> 100) THEN 'VENDA EM CONTINGÊNCIA'
                        WHEN TBR.DOCENTRYDEVSAP IS NULL AND SBO_ORIN."DocEntry" IS NULL AND (IFNULL(TBV.SAP_DOCENTRY, 0) <> 0 AND TBV.PROTNFE_INFPROT_CSTAT <> 100) THEN 'AGUARDANDO GERAÇÃO MANUAL DA DEVOLUÇÃO(VENDA NFCE(65) PARA NFE(55))'
                        WHEN TBV.SAP_DOCENTRY IS NOT NULL THEN ''
                        ELSE IFNULL(TBV.ERRORLOGSAP, '')
                    END AS LOGERRORVENDA,
                    CASE 
                        WHEN TBR.DOCENTRYDEVSAP IS NULL AND SBO_ORIN."DocEntry" IS NULL AND TBC.TPCLIENTE <> 'FISICA' THEN 'AGUARDANDO GERAÇÃO MANUAL DA DEVOLUÇÃO(PESSOA JURÍDICA)'
                        ELSE IFNULL(TO_VARCHAR(TBR.ERRORLOGSAP), '')
                    END AS LOGERRORVOUCHER
                FROM 
                    "VAR_DB_NAME".RESUMOVOUCHER AS TBR 
                INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
                    TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
                INNER JOIN "VAR_DB_NAME".CLIENTE AS TBC ON 
                    TBR.IDCLIENTE = TBC.IDCLIENTE
                INNER JOIN "VAR_DB_NAME".EMPRESA AS TBEMPORIGEM ON 
                    TBR.IDEMPRESAORIGEM = TBEMPORIGEM.IDEMPRESA
                INNER JOIN "VAR_DB_NAME".EMPRESA AS TBEMPVENDA ON 
                    TBV.IDEMPRESA = TBEMPVENDA.IDEMPRESA
                LEFT JOIN "VAR_DB_NAME".CAIXA AS TBCORIGEM ON 
                    TBR.IDCAIXAORIGEM = TBCORIGEM.IDCAIXAWEB
                LEFT JOIN "VAR_DB_NAME".CAIXA AS TBCDESTINO ON 
                    TBR.IDCAIXADESTINO = TBCDESTINO.IDCAIXAWEB
                LEFT JOIN "VAR_DB_NAME".EMPRESA AS TBEMPDESTINO ON 
                    TBR.IDEMPRESADESTINO = TBEMPDESTINO.IDEMPRESA  
                LEFT JOIN "VAR_DB_NAME".FUNCIONARIO AS TBFUNCIONARIO ON 
                    TBR.IDUSRLIBERACAOCRIACAO = TBFUNCIONARIO.IDFUNCIONARIO
                LEFT JOIN "VAR_DB_NAME".FUNCIONARIO AS TBFUNCLIBERACONSUMO ON 
                	TBR.IDUSRLIBERACAOCONSUMO = TBFUNCLIBERACONSUMO.IDFUNCIONARIO
                LEFT JOIN ${DB_SAP}.ORIN AS SBO_ORIN ON 
                    (TBR.DOCENTRYDEVSAP = SBO_ORIN."DocEntry" OR TBR.NUVOUCHER = SBO_ORIN."U_ID_VENDA_PDV") AND SBO_ORIN."CANCELED" = 'N'
                LEFT JOIN ${DB_SAP}."@SKL25NFE" AS SBO_SKL25DEV ON
                    TO_VARCHAR(SBO_ORIN."DocEntry") = SBO_SKL25DEV."U_DocEntry" AND SBO_SKL25DEV."U_tipoDocumento" = 'DN'
                LEFT JOIN ${DB_SAP}.OINV AS SBO_OINV ON
                    TBR.DOCENTRYNOTASAIDATRANSFERENCIASAP = SBO_OINV."DocEntry" AND SBO_OINV."CANCELED" = 'N'
                LEFT JOIN ${DB_SAP}."@SKL25NFE" SBO_SKL25TRANSF ON 
                    TO_VARCHAR(SBO_OINV."DocEntry") = SBO_SKL25TRANSF."U_DocEntry" AND SBO_SKL25TRANSF."U_tipoDocumento" = 'NS'
                WHERE 
                    1 = ?
                    --AND TBV.STCANCELADO = 'False'
    `;
    
    if(byId) {
        query += `AND TBR.IDVOUCHER = '${byId}' `;
    }
    
    if(stStatus){
        query += ` AND TBR.STTIPOTROCA = 'DEFEITO' AND TBR.STSTATUS = 'EM ANALISE' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBR.DTINVOUCHER) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    if(subgrupoEmpresa){
        query += ` AND tbemporigem.IDSUBGRUPOEMPRESARIAL = '${subgrupoEmpresa}' `;
    }
    
    if(idEmpresa){
        query += `AND CONTAINS((TBR.IDEMPRESAORIGEM, TBR.IDEMPRESADESTINO), '${idEmpresa}')`;
    }
    
    if(dadosVoucher){
        query += subgrupoEmpresa ? ` AND CONTAINS((TBR.IDVOUCHER, TBC.NUCPFCNPJ, TBR.NUVOUCHER, TBR.IDRESUMOVENDAWEBDESTINO, TBR.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${subgrupoEmpresa}` : ` AND CONTAINS((TBR.IDVOUCHER, TBC.NUCPFCNPJ, TBR.NUVOUCHER, TBR.IDRESUMOVENDAWEBDESTINO, TBR.IDRESUMOVENDAWEB), '${dadosVoucher}')`;
    }
    
    if(numeroVoucher){
        query += ` And  TBR.NUVOUCHER = '${numeroVoucher}' AND STATIVO = 'True' `;
    }
    
    query += `
            ) AS SUBQUERY
        )
        SELECT
            * 
        FROM CTE_VOUCHER
            WHERE 
        RN = 1
    `;
    
   query += ' ORDER BY DTINVOUCHER ';
 
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}