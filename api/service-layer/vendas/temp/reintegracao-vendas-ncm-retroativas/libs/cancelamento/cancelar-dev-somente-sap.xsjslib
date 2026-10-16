let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm-retroativas.libs`;
let dbNameSAP = 'SBO_GTO_TESTE4';

function validarCancelamentoDevSap(docentry){
    let query = `
        SELECT
            "DocEntry" AS DOCENTRY
        FROM 
            ${dbNameSAP}.ORIN
        WHERE
            "DocEntry" = ?
            AND "CANCELED" = 'Y'
            AND "U_SKILL_CODSIT" = '08'
            AND "U_finNfe" = '4'
	        AND "U_finNf3" = '3'
            AND "U_SKILL_IND_PGTO" = '9'
    `;
    
    let respValidacaoCancelamento = api.sqlQuery(query, docentry);
    
    if(respValidacaoCancelamento.length) return true;
    
    return false;
}

function postSlCancelamentoDev(docentry, session) {
    let response = slApi.post(`/CreditNotes(${docentry})/Cancel`, {}, session);
    let msg = 'Erro ao cancelar a devolução no SAP.';

    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        msg = response.error.message.value || msg;
        
        return msg;
    }
    
    let retornoDevSap = validarCancelamentoDevSap(docentry);
    
    if(retornoDevSap == true) return true;
    
    return false;
}

function validarAutorizacaoSefaz(docentry) {
    let query = `
        SELECT
        	A."U_DocEntry"
        FROM
        	${dbNameSAP}."@SKL25NFE" A
        WHERE
        	1 = ?
        	AND A."U_cdErro" = 100
        	AND A."U_DocEntry" = '${docentry}'
    `; 
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) return true;
    
    return false;
}

function efetuarUpdateDev(docentry, conn) {
    let queryUpdate = `
        UPDATE
        	${dbNameSAP}.ORIN A
        SET
        	A."Model" = 0,
        	A."U_ChaveAcesso" = ''
        WHERE 
        	A."DocEntry" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

    try {
    	pStmt.setInt(1, Number(docentry));
    	pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function efetuarUpdateDadosQuality (numeronota, chave, idvenda, conn){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."VENDAS_REINTEGRACAO_TEMPORARIA"
        SET 
            NUMERONOTADEV = '${numeronota}',
            CHAVEDEV = '${chave}'
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

    try {
    	pStmt.setString(1, idvenda);
    	pStmt.execute();
    	conn.commit();
    	return true;
    } catch(error) {
        return error;
    } finally {
	    pStmt.close();
    }
}

function atualizarDadosQuality(idvenda, docentry, conn) {
    let query = `
        SELECT
        	A."Serial" AS NUMERONOTA,
        	A."U_ChaveAcesso" AS CHAVE
        FROM
        	${dbNameSAP}.ORIN A
        WHERE
        	1 = ?
        	AND A."DocEntry" = '${docentry}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(respQuery.length) {
        let respUpdate = efetuarUpdateDadosQuality(respQuery[0].NUMERONOTA, respQuery[0].CHAVE, idvenda, conn);
        
        if(respUpdate == true) return true;
        
        return respUpdate;
    }
    
    return false;
}

function validarUpdate(docentry) {
    let query = `
        SELECT
            "DocEntry" AS DOCENTRY
        FROM 
            ${dbNameSAP}.ORIN
        WHERE
            "DocEntry" = ?
            AND IFNULL("U_ChaveAcesso", '') = ''
    `;
    
    let respValidacaoUpdate = api.sqlQuery(query, docentry);
    
    if(respValidacaoUpdate.length) return true;
    
    return false;
}

function cancelarDevolucao(idvenda, session, conn) {
    let query = `
        SELECT
	        A.DOCENTRYDEV
        FROM
        	"VAR_DB_NAME".VENDAS_REINTEGRACAO_TEMPORARIA A
        WHERE
        	1 = ?
        	AND A.IDVENDA = '${idvenda}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    let validarCancelamento = validarCancelamentoDevSap(respQuery[0].DOCENTRYDEV);
    
    if(validarCancelamento) {
        let respValidarUpdate = validarUpdate(respQuery[0].DOCENTRYDEV);
        
        if(!respValidarUpdate){
            let respAtualizacaoDadosQuality = atualizarDadosQuality(idvenda, respQuery[0].DOCENTRYDEV, conn)
            
            if(respAtualizacaoDadosQuality == true) {
                // realizar update modelo e chave para nulos
                let respUpdateDevSap = efetuarUpdateDev(respQuery[0].DOCENTRYDEV, conn);
                
                if(respUpdateDevSap == true) return true;
                
                return respUpdateDevSap;
            }
            
            return respAtualizacaoDadosQuality;
        }
        
        return true;
    };
    
    let respValidacaoSefaz = validarAutorizacaoSefaz(respQuery[0].DOCENTRYDEV);
    
    if(respValidacaoSefaz == true) {
        let respAtualizacaoDadosQuality = atualizarDadosQuality(idvenda, respQuery[0].DOCENTRYDEV, conn)
        
        if(respAtualizacaoDadosQuality == true) {
            let respPostCancelamento = postSlCancelamentoDev(respQuery[0].DOCENTRYDEV, session);
        
            if(respPostCancelamento == true) {
                // realizar update modelo e chave para nulos
                let respUpdateDevSap = efetuarUpdateDev(respQuery[0].DOCENTRYDEV, conn);
                
                if(respUpdateDevSap == true) return true;
                
                return respUpdateDevSap;
            }
            
            return respPostCancelamento;
        }
        
        return respAtualizacaoDadosQuality;
    }
    
    return 'A nota não está autorizada na SEFAZ.';
}

function efetuarCancelamento (idvenda, session, conn) {
    let respCancelamentoDev = cancelarDevolucao(idvenda, session, conn);
    
    if(respCancelamentoDev == true) return true;
    
    return respCancelamentoDev;
}