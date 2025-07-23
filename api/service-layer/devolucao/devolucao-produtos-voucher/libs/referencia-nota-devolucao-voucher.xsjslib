let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

function postSl(data, session, idVoucher) {
    if(data) {
        let resultDevolucao;
        let conn = $.db.getConnection();
        
        let response = slApi.post('/U_SKL40DCREF',data,session);
        
        if(response.status != 204){
            response = JSON.parse(response.body.asString());
            
            let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a referencia da devolução';
            errorLogRefDevolucao(idVoucher, msgReturnError, conn);
            
            return false;
        }
        
        successLogRefDevolucao(idVoucher, conn);
        
        return true;
        
    } else {
        errorLogRefDevolucao(idVoucher, 'Erro ao integrar a referencia da devolução', conn);
        
        return false;
    }
    
}

function successLogRefDevolucao(idVoucher, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = null,
            ERRORLOGQUALITY = null,
            STREFDEVOLUCAOSAP  = 'True'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorLogRefDevolucao(idVoucher, p_Error, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?,
            STREFDEVOLUCAOSAP = 'False'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(p_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function getDocEntry(idVoucher){
    let query = `
        SELECT 
            T1."DocEntry"
        FROM
            ${dbNameSAP}.ORIN T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVoucher);

    return Number(regDocEntry[0].DocEntry);
}

function referenciarDevolucao(idVoucher, session) {
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBR.NUVOUCHER,
            TBV.IDVENDA,  
            TO_DATE(TBV.DTHORAFECHAMENTO) AS DATA_VENDA,  
            TBV.IDEMPRESA, 
            TBE.CODPARCEIRO, 
            TBE.ESTOQUECODIGO, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF, 
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC,  
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD,  
            TBV.IDCAIXAWEB, 
            TBV.NFE_INFNFE_IDE_DHEMI,
            TBV.NFE_INFNFE_IDE_MOD AS MODELONFE,
            TBV.NFE_INFNFE_IDE_SERIE AS SERIE,
            TBV.NFE_INFNFE_IDE_NNF AS NNF,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE, 
            TBV.PROTNFE_INFPROT_NPROT, 
            TBV.PROTNFE_INFPROT_CSTAT, 
            TBV.PROTNFE_INFPROT_XMOTIVO, 
            TBV.NFE_INFNFE_TRANSP_MODFRETE,  
            TO_DATE(TBR.DTINVOUCHER) AS DATA_VOUCHER  
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

    for (let i = 0; i < response.length; i++) {
        
        let registro = response[i];
        let retCardCode = api.sqlQuery('SELECT "U_IS_PN_SAIDA" FROM "SBO_GTO_PRD".OBPL WHERE "BPLId" = ?', registro.IDEMPRESA); 
        
        let dadosReferenciaNota = {
            "Code": String(getDocEntry(registro.IDVOUCHER)),
            "Name": String(getDocEntry(registro.IDVOUCHER)),
            "U_TpDocRef": "133",
            "U_DocEntry": String(getDocEntry(registro.IDVOUCHER)),
            "U_FormType": "179",
            "U_DocExt": registro.CHAVENFE,
            "U_tpRef": 1,
            "U_Mod": Number(registro.MODELONFE),
            "U_Serie": Number(registro.SERIE),
            "U_nNF": Number(registro.NNF),
            "U_CODPART": retCardCode[0].U_IS_PN_SAIDA,
            "U_SUB": 0,
            "U_DTDOC": registro.DATA_VENDA,
            "U_INDEMIT": 0, 
            "U_ZERA_NUM": "N"
        }
        
        return postSl(dadosReferenciaNota, session, registro.IDVOUCHER);
    }
    
}