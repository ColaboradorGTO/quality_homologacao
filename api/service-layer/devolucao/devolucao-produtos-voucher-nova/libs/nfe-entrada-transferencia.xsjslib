let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

let conn;

function updateSuccessNotaEntrada(idVoucher, docEntryNotaEntradaTransf){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGQUALITY = null,
            ERRORLOGSAP = null,
            DTHORANOTAENTRADATRANSFERENCIASAP = now(),
            STNOTAENTRADATRANSFERENCIASAP = 'True',
            STTRANSFERENCIACOMPLETASAP = 'True',
            DOCENTRYNOTAENTRADATRANSFERENCIASAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(docEntryNotaEntradaTransf));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return true;
}

function updateErrorNotaEntrada(idVoucher, p_Error){
    let query = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?,
            DTHORANOTAENTRADATRANSFERENCIASAP = now(),
            STNOTAENTRADATRANSFERENCIASAP = 'False'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, String(p_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return false;
}

function validaIntegracaoExistenciaNotaEntradaSap(idVoucher, stValidaPrimeiraInstancia = false, chaveNotaSaida){
    
    let queryValidaMigracao = `
        SELECT
            C."DocEntry" AS IDSAP
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER A
        INNER JOIN SBO_GTO_PRD.OINV B ON 
            A.DOCENTRYNOTASAIDATRANSFERENCIASAP = B."DocEntry" 
            AND CAST(A.IDVOUCHER AS VARCHAR) = B.U_ID_VENDA_PDV
        INNER JOIN SBO_GTO_PRD.OPCH C ON 
            B."U_ChaveAcesso" = C."U_ChaveAcesso" 
            AND B."Serial" = C."Serial" 
        INNER JOIN SBO_GTO_PRD.INV12 D ON 
            B."DocEntry" = D."DocEntry" 
        WHERE
            A.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;
    
    
    let resultMigracao = api.sqlQuery(queryValidaMigracao, 1);
    
    if(resultMigracao.length > 0){
        let docEntryNotaEntradaTransf = Number(resultMigracao[0].IDSAP);
        
        return updateSuccessNotaEntrada(idVoucher, docEntryNotaEntradaTransf);
    }
    
    !stValidaPrimeiraInstancia && updateErrorNotaEntrada(idVoucher, 'Nota de Entrada da Transferencia Não Integrada');
    
    return false;
}

function executeNfeEntrada(idVoucher, connDB, session){
    let query = `
        SELECT
            C."DocEntry" AS IDSAP
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER A
        INNER JOIN ${dbNameSAP}.OINV B ON 
            A.DOCENTRYNOTASAIDATRANSFERENCIASAP = B."DocEntry"  AND TO_VARCHAR(A.IDVOUCHER) = B.U_ID_VENDA_PDV
        INNER JOIN ${dbNameSAP}.OPCH C ON 
            B."U_ChaveAcesso" = C."U_ChaveAcesso"  AND B."Serial" = C."Serial" 
        WHERE
            A.IDVOUCHER = '${idVoucher}'
            AND B.CANCELED = 'N'
            AND C.CANCELED = 'N'
            AND 1 = ?
    `;

	let response = api.sqlQuery(query, 1);

    conn = connDB;
    
    if(response.length > 0){
        updateSuccessNotaEntrada(idVoucher, Number(response[0].IDSAP));
        
    } else {
        return updateErrorNotaEntrada(idVoucher, 'Nota não integrada pelo Add-on');
    }
    
    return true;

}

