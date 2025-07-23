let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";

let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer.devolucao`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

let conn;

function postSl(data, session, idVenda, CHAVENFE) {
    if(data) {
        let resultDevolucao;
        let conn = $.db.getConnection();
        
        let response = slApi.post('/U_SKL40DCREF',data,session);
        
        if(response.status != 204){
            response = JSON.parse(response.body.asString());
            
            let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao integrar a referencia da devolução';
            errorLogRefDevolucao(idVenda, msgReturnError);
            
            return false;
        }
        
        successLogRefDevolucao(idVenda, CHAVENFE);
        
        return true;
        
    } else {

        return false;
    }
    
}

function successLogRefDevolucao(idVenda, CHAVENFE){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = null,
            SAP_DOCENTRY_CORRETO = null,
            SAP_DOCENTRY = null,
            TXTDEVOLUCAO = 'DEVOLUCAO E REFERENCIACAO GERADA NO SAP, MOTIVO NO CAMPO: TXTOBSCORRECAOCONTINGENCIA',
            TXTOBSCORRECAOCONTINGENCIA = (
                SELECT 
                    ('Devolucao e Referenciacao de Nota NFE(55) gerada em duplicidade no SAP. Gerou uma NFE(55) porem já existia uma NFCE(65) gerada, Chave_NFE(55): ' || '${CHAVENFE}' || ' , DATA_HORA: ' || CURRENT_TIMESTAMP) 
                FROM 
                    DUMMY
            )
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(idVenda));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function errorLogRefDevolucao(idVenda, p_Error){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(p_Error));
	pStmt.setString(2, String(idVenda));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
}

function getDocEntry(idVenda){
    let query = `
        SELECT 
            T1."DocEntry"
        FROM
            ${dbNameSAP}.ORIN T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVenda);

    return Number(regDocEntry[0].DocEntry);
}

function referenciarDevolucao(idVenda, session, connDB) {
    let query = `
        SELECT
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
            55 AS MODELONFE,
            TBO."SeriesStr" AS SERIE,
            TBO."Serial" AS NNF,
            TBO."U_ChaveAcesso" AS CHAVENFE, 
            TBV.PROTNFE_INFPROT_NPROT, 
            TBV.PROTNFE_INFPROT_CSTAT, 
            TBV.PROTNFE_INFPROT_XMOTIVO, 
            TBV.NFE_INFNFE_TRANSP_MODFRETE,
            TBV.SAP_DOCENTRY_CORRETO
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN ${dbNameSAP}.OINV TBO ON 
            TBV.IDVENDA = TBO."U_ID_VENDA_PDV" AND TBV.SAP_DOCENTRY_CORRETO = TBO."DocEntry"
        WHERE 
            TBV.IDVENDA = '${idVenda}'
            AND TBO."CANCELED" = 'N'
            AND TBO."Model" = '39'
            AND 1 = ?
    `;

    let response = api.sqlQuery(query, 1);
   // let session;
    conn = connDB;
    
    if(response.length > 0){
        
        for (let i = 0; i < response.length; i++) {
        
            let registro = response[i];
            let retCardCode = api.sqlQuery('select "U_IS_PN_SAIDA" from "SBO_GTO_PRD".OBPL WHERE "BPLId" = ?', registro.IDEMPRESA); 
            
            let dadosReferenciaNota = {
                "Code": String(getDocEntry(registro.IDVENDA)),
                "Name": String(getDocEntry(registro.IDVENDA)),
                "U_TpDocRef": "133",
                "U_DocEntry": String(getDocEntry(registro.IDVENDA)),
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
            
            /*if(i === 0){
                session = slApi.loginServiceLayer(true);
                slApi.loginServiceLayer(true);
            }*/
            
            return postSl(dadosReferenciaNota, session, registro.IDVENDA, registro.CHAVENFE);
        }
    } else {
        errorLogRefDevolucao(idVenda, 'Dados não encontrados para referenciar');
        
        return false;
    }
}