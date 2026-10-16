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
            TBO."DocEntry" AS IDSAP
        FROM
            ${dbNameSAP}.OPCH TBO
        WHERE
            TBO."CANCELED" = 'N' AND
            (TBO."U_ID_VENDA_PDV" = '${idVoucher}' 
            OR TBO."U_ChaveAcesso" = '${chaveNotaSaida}')
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

function postSl(data, session, idVoucher) {
    let response = slApi.post('/PurchaseInvoices',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a nota de entrada da transferencia';
        
        return updateErrorNotaEntrada(idVoucher, msgReturnError);
    }
    
    return validaIntegracaoExistenciaNotaEntradaSap(idVoucher);

}

function obterLinhasDoDetalhe(idVoucher) {
    
    let query = `
        SELECT  
            TBP.IDPRODUTO,
            TBP.NUCODBARRAS,
            IFNULL(A."Price", 0) AS PRECO_CUSTO,
            A."Quantity" AS QTD,
            TBE.ESTOQUECODIGO AS ESTOQUE_CODIGO
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBR.IDEMPRESAORIGEM = TBE.IDEMPRESA 
        INNER JOIN ${dbNameSAP}.INV1 A ON
            TBR.DOCENTRYNOTASAIDATRANSFERENCIASAP = A."DocEntry"
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBP.IDPRODUTO = A."ItemCode"
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;
    
	let linhas = api.sqlQuery(query, 1);

	let lines = [];
    let produtosPrecoZerados = [];
    
	for (let i = 0; i < linhas.length; i++) {
		let det = linhas[i];
		
		if(det.PRECO_CUSTO <= 0){
		    produtosPrecoZerados.push(det.IDPRODUTO);
		}
		
        let docLine = {
            "LineNum": i + 1,
            "ItemCode": det.IDPRODUTO,
            "Quantity": parseInt(det.QTD),
            "UnitPrice": parseFloat(det.PRECO_CUSTO),
            "WarehouseCode": (det.ESTOQUE_CODIGO).toString(),
            "CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "BarCode": det.NUCODBARRAS,
            "Usage": 5
		};
        
		lines.push(docLine);
	}
	
	if(produtosPrecoZerados.length > 0){
        updateErrorNotaEntrada(idVoucher, `Erro ao tentar gerar a Nota de Entrada, Erro no Preço de Custo do(s) Produtos_ID(${produtosPrecoZerados.join(', ')})`);
        
        lines = [];
	}

	return lines;
}

function executeNfeEntrada(idVoucher, connDB, session){
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBV.IDEMPRESA AS IDEMPRESAORIGEMTRANSFERENCIA, 
            TO_DATE(TBR.DTINVOUCHER) AS DATA_VOUCHER,
            TBR.IDEMPRESAORIGEM AS IDEMPRESADESTINOTRANSFERENCIA
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;

	let response = api.sqlQuery(query, 1);

    conn = connDB;
    
    if(response.length > 0){
        
        for (let i = 0; i < response.length; i++) {
            let det = response[i];
            
            let queryCardCode = `
                SELECT 
                    "U_IS_PN_ENTRADA" 
                FROM
                    ${dbNameSAP}.OBPL 
                WHERE 
                    "BPLId" = ?
            `;
            
            let querySerialNotaSaida = `
                SELECT 
                    A."Serial" AS "NOTA", 
                    A."SeriesStr" AS "SERIE",
                    A."U_ChaveAcesso" AS "CHAVENFE"
                FROM 
                    ${dbNameSAP}.OINV A
                WHERE 
                    A."CANCELED" = 'N'
                    AND A."U_ID_VENDA_PDV" = ?
            `;
            
            let retCardCode = api.sqlQuery(queryCardCode, det.IDEMPRESAORIGEMTRANSFERENCIA);
            let retNotaSaida = api.sqlQuery(querySerialNotaSaida, det.IDVOUCHER);
            
            let dadosNfeEntrada = {
                "DocType": "dDocument_Items",
                "U_ID_VENDA_PDV": det.IDVOUCHER,
                "DocDate": det.DATA_VOUCHER,
                "DocDueDate": det.DATA_VOUCHER,
                "CardCode": retCardCode[0].U_IS_PN_ENTRADA,
                "Comments": "IDVOUCHER: " + det.IDVOUCHER,
                "JournalMemo": "NFe de transf. entre filiais",
                "TaxDate": det.DATA_VOUCHER,
                "Project": "PDV_SOFTQUALITY",
                "BPL_IDAssignedToInvoice": det.IDEMPRESADESTINOTRANSFERENCIA,
                "SequenceCode": -2, // FIXO
                "SequenceModel": "39",
                "SequenceSerial": retNotaSaida[0].NOTA,
                "SeriesString": retNotaSaida[0].SERIE,
                "U_ChaveAcesso": retNotaSaida[0].CHAVENFE,
                "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
                "DocumentLines": obterLinhasDoDetalhe(det.IDVOUCHER),
                "TaxExtension": {
                    "Incoterms": 9,
                    "MainUsage": 5
                }
            };
            
            if(dadosNfeEntrada["DocumentLines"].length > 0){
                
                if(validaIntegracaoExistenciaNotaEntradaSap(idVoucher, true, retNotaSaida[0].CHAVENFE)){
                    return true;
                }
                
                return postSl(dadosNfeEntrada, session, det.IDVOUCHER);
            }
            
            return false;
            
        }
    } else {
        return updateErrorNotaEntrada(idVoucher, 'Nota De Entrada Já Realizada, Dados Não Encontrados')
    }

}

