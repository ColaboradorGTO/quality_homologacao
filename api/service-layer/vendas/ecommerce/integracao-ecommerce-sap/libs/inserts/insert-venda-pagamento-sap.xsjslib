let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce-sap.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");
let libMontarJsonPagamento = $.import(`${filePathLibs}.utils`, "montar-json-pagamento");

function getDadosPagamento(idvenda) {
    const query = `
        SELECT
            B.IDEMPRESA,
        	A.IDVENDA,
        	B.SAP_DOCENTRY_CORRETO,
        	A.TPAG,
        	A.DSTIPOPAGAMENTO,
        	SUM(A.VALORLIQUIDO) AS VALORTOTAL,
        	A.NPARCELAS,
        	A.NOCARTAO,
        	IFNULL(A.NUAUTORIZACAO, 'Cartão Genérico') AS NUAUTORIZACAO,
        	TO_VARCHAR(B.DTHORAFECHAMENTO, 'YYYY-mm-DD') AS DTHORAFECHAMENTO,
        	CASE
        		WHEN IFNULL(B.INFINTERMED_IDCADINTTRAN, '') <> '' THEN '1.01.01.02.0023'
        		WHEN A.TPAG = '025' THEN '1.01.01.02.0001'
        		WHEN C.MODALIDADE = 'C' THEN  '1.01.01.02.0003'
        		ELSE 'False'
        	END AS "CONTA",
        	D.IDCLIENTESAP,
        	B.INFINTERMED_IDCADINTTRAN
        FROM
        	"VAR_DB_NAME".VENDAPAGAMENTO A
        INNER JOIN "VAR_DB_NAME".VENDA B ON 
        	A.IDVENDA = B.IDVENDA 
        INNER JOIN "VAR_DB_NAME".FORMAPAGAMENTO C ON 
        	A.TPAG = C.CODIGO 
        INNER JOIN "VAR_DB_NAME".CLIENTE D ON 
        	B.IDCLIENTE = D.IDCLIENTE 
        WHERE
            1 = ?
        	AND IFNULL(A.STCANCELADO, 'False') = 'False'
        	AND A.IDVENDA = '${idvenda}'
        GROUP BY 
            B.IDEMPRESA,
        	A.IDVENDA,
        	A.TPAG,
        	A.DSTIPOPAGAMENTO,
        	A.NPARCELAS,
        	A.NOCARTAO,
        	A.NUAUTORIZACAO,
        	D.IDCLIENTESAP,
        	B.INFINTERMED_IDCADINTTRAN,
        	C.MODALIDADE,
        	B.DTHORAFECHAMENTO,
        	B.SAP_DOCENTRY_CORRETO
    `;
    
    const respQuery = api.sqlQuery(query, 1);
    
    if(!respQuery.length) return false;
    
    return respQuery;
}

function atualizarLogErrorSap(idvenda, message, conn) {
    let query = `
        UPDATE 
        	"VAR_DB_NAME".VENDA A
        SET 
        	A.ERRORLOGSAPPAGAMENTO = '${message}'
        WHERE 
        	A.IDVENDA = ? 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmtUpdate.setString(1, idvenda);
    	pStmtUpdate.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
       pStmtUpdate.close(); 
    }
}

function atualizarLogSucessoSap(idvenda, docentry, conn) {
    let query = `
        UPDATE 
        	"VAR_DB_NAME".VENDA A
        SET 
        	A.ERRORLOGSAPPAGAMENTO = null,
        	A.SAP_DOCENTRY_PAGAMENTO = ${docentry}
        WHERE 
        	A.IDVENDA = ? 
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmtUpdate.setString(1, idvenda);
    	pStmtUpdate.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
       pStmtUpdate.close(); 
    }
}

function validarMigracaoPagamento(idvenda) {
    const query = `
        SELECT
        	A."DocEntry" AS DOCENTRY
        FROM
        	${dbNameSAP}.ORCT A
        WHERE
            1 = ?
        	AND A.U_IS_ID_QUALITY = '${idvenda}'
        	AND A."Canceled" = 'N'
    `;
    
    const respQuery = api.sqlQuery(query, 1);
    
    if(!respQuery.length) return false;
    
    return respQuery[0].DOCENTRY;
}

function postSl(data, session, idvenda, conn) {
   let response = slApi.post('/IncomingPayments', data, session);
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        atualizarLogErrorSap(idvenda, (response.error.message.value || 'Erro ao tentar integrar o pagamento'), conn);
        return {
            status: false,
            message: (response.error.message.value || 'Erro ao tentar integrar o pagamento'),
            data: null
        }
   }
   
   const docentry = validarMigracaoPagamento(idvenda);
   
   if(!docentry) return {status: false, message: 'Pagamento não integrado.', data: null};
   
   atualizarLogSucessoSap(idvenda, docentry, conn);
   
   return {
       status: true, 
       message: 'Pagamento integrado', 
       data: null
   };
}

function integrarPagamento(idvenda, retornarJson, session, conn){
    let docentry = validarMigracaoPagamento(idvenda);
    
    if(docentry !== false) {
        atualizarLogSucessoSap(idvenda, docentry, conn);
        return {
            status: true,
            message: 'Pagamento já havia sido migrado para o SAP - Os dados foram atualizados no SoftQuality.',
            data: null
        }
    }
    
    const dadosPagamento = getDadosPagamento(idvenda);
    
    if(!dadosPagamento) return {status: false, message: `Não foi encontrado nenhum pagamento para a venda ${idvenda}`, data: null}
    
    const json = libMontarJsonPagamento.montarJsonPagamento(dadosPagamento);
    if(!json.status) return {status: false, message: json.message, data: null}
    
    if(retornarJson) return json.data;
    
    const respPost = postSl(json.data, session, idvenda, conn);
    if(!respPost.status) return {status: false, message: respPost.message, data: null};
    
    return {
        status: true,
        message: 'Pagamento migrado com sucesso.',
        data: null
    }
}