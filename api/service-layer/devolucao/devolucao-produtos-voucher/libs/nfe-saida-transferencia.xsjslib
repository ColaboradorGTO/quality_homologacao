let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

let conn;

function successNotaSaida(idVoucher, docEntryTransferencia){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGQUALITY = null,
            ERRORLOGSAP = null,
            STNOTASAIDATRANSFERENCIASAP = 'True',
            DTHORANOTASAIDATRANSFERENCIASAP = now(),
            DOCENTRYNOTASAIDATRANSFERENCIASAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(docEntryTransferencia));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorNotaSaida(idVoucher, p_Error){
    let query = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?,
            STNOTASAIDATRANSFERENCIASAP = 'False',
            DTHORANOTASAIDATRANSFERENCIASAP  = now()
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, String(p_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function fnValidaExistenciaTransferenciaSAP(idVoucher, stValidaPrimeiraInstancia = false){
    
    let queryValidaMigracao = `
        SELECT
            TBO."DocEntry" AS IDSAP,
            TBI."MainUsage"
        FROM
            ${dbNameSAP}.OINV TBO
        INNER JOIN ${dbNameSAP}.INV12 TBI ON
            TBO."DocEntry" = TBI."DocEntry"
        WHERE
            TBO."CANCELED" = 'N' AND
            TBI."MainUsage" = 5 AND
            TBO."U_ID_VENDA_PDV" = '${idVoucher}'
            AND 1 = ?
    `;
    
    
    let resultMigracao = api.sqlQuery(queryValidaMigracao, 1);
    
    if(resultMigracao.length > 0){
        let docEntryTransf = Number(resultMigracao[0].IDSAP);
        
        successNotaSaida(idVoucher, docEntryTransf);
        
        return true;
    }
    
    !stValidaPrimeiraInstancia && errorNotaSaida(idVoucher, 'Transferencia não realizada')
    
    return false;
}

function postSl(data, session, idVoucher) {
    let response = slApi.post('/Invoices',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a nota de transferencia';
        errorNotaSaida(idVoucher, msgReturnError);
        
        return false;
    }
    
    return fnValidaExistenciaTransferenciaSAP(idVoucher);

}

function obterLinhasDoDetalhe(idVoucher, codigoDeposito) {
    
    let query = `
        SELECT  
            TBP.IDPRODUTO,
            TBP.NUCODBARRAS,
            TBP.PRECOCUSTO,
            TBVD.QTD
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBR.IDRESUMOVENDAWEB  = TBV.IDVENDA 
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA AND TBR.IDVOUCHER = TBVD.IDVOUCHER 
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBP.IDPRODUTO = TBVD.CPROD    
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;
    
	let linhas = api.sqlQuery(query, 1);

	let lines = [];

	for (let i = 0; i < linhas.length; i++) {
		let det = linhas[i];
        let docLine = {
            "LineNum": i + 1,
            "ItemCode": det.IDPRODUTO,
            "Quantity": parseInt(det.QTD),
            "UnitPrice":parseFloat(det.PRECOCUSTO),
            "WarehouseCode": codigoDeposito.toString(),
            "CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "BarCode": det.NUCODBARRAS,
            "Usage": 5
		};
        
		lines.push(docLine);
	}

	return lines;
}

function executeNfeSaida(idVoucher, connDB, session){
    
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBR.NUVOUCHER,
            TBV.IDVENDA,  
            TO_DATE(TBV.DTHORAFECHAMENTO) AS DTHORAFECHAMENTO,  
            TBV.IDEMPRESA AS IDEMPRESAORIGEMTRANSFERENCIA, 
            TBE.CODPARCEIRO, 
            TBE.ESTOQUECODIGO, 
            TO_DATE(TBR.DTINVOUCHER) AS DATA_VOUCHER,
            TBR.MOTIVOTROCA,
            TBR.IDCLIENTE,
            TBR.IDEMPRESAORIGEM AS IDEMPRESADESTINOTRANSFERENCIA,
            TBR.IDEMPRESADESTINO
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;

	let response = api.sqlQuery(query, 1);
	let data = [];
    
    conn = connDB;

	for (let i = 0; i < response.length; i++) {
        
		let det = response[i];
		
		let retCardCode = api.sqlQuery(`select "U_IS_PN_SAIDA" from ${dbNameSAP}.OBPL WHERE "BPLId" = ?`,det.IDEMPRESADESTINOTRANSFERENCIA); 
        let retSequenceCode = api.sqlQuery(`select "SeqCode" as SEQCOD from ${dbNameSAP}.NFN1 where "Model" = 39 and "Locked" = 'N' and "BPLId" = ?`, det.IDEMPRESAORIGEMTRANSFERENCIA); 
		let transferenciaSaida = {
			"DocType": "dDocument_Items",
			"U_ID_VENDA_PDV": det.IDVOUCHER,
			"DocDate": det.DATA_VOUCHER,
			"DocDueDate": det.DATA_VOUCHER,
			"CardCode": retCardCode[0].U_IS_PN_SAIDA,
			"Comments": "IDVOUCHER: " + det.IDVOUCHER,
			"JournalMemo": "NFe de transf. entre filiais",
			"TaxDate": det.DATA_VOUCHER,
			"Project": "PDV_SOFTQUALITY",
			"BPL_IDAssignedToInvoice": det.IDEMPRESAORIGEMTRANSFERENCIA,
			"SequenceCode": retSequenceCode[0].SEQCOD, 
            "SequenceModel": "39",
            "U_IS_NATOPNFE": "Transferência para comercialização",
            "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
           // "NumAtCard": det.IDVOUCHER,
            "DocumentLines": obterLinhasDoDetalhe(det.IDVOUCHER, det.ESTOQUECODIGO),
            "TaxExtension": {
                "Incoterms": 9,
                "MainUsage": 5
            }
        };
        //debugar para retornar o json para poder validar a criação da tabela ORDR
        //return transferenciaSaida;
        
        if(fnValidaExistenciaTransferenciaSAP(idVoucher, true)){
            return true;
        }
        
		return postSl(transferenciaSaida, session, det.IDVOUCHER);
        
	}

}

