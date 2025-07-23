let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let filePathLibs = `${filePath}.service-layer.devolucao.devolucao-produtos-voucher.libs`;

let api = $.import(`${filePath}.apiResponse`, "int_api");
let libGeraNotaSaidaTransferenciaProduto = $.import(filePathLibs, "nfe-saida-transferencia"); 

let conn;

function errorLogTransferenciaProdutoVoucher(idVoucher, msg_Error){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(msg_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return false;
}

function fnValidaDevolucaoSAP(idVoucher, docEntryDev){
    let msgRetorno =  '';
    
    let query = `
        SELECT 
            T1."DocEntry",
            T2."U_cdErro" AS NUMSTATE,
            T2."U_msgSEFAZ" AS MSGRETORNO
        FROM
            ${dbNameSAP}.ORIN T1
        LEFT JOIN ${dbNameSAP}."@SKL25NFE" T2 ON 
            TO_VARCHAR(T1."DocEntry") = T2."U_DocEntry" AND T2."U_tipoDocumento" = 'DN'
        WHERE
             T1."CANCELED" = 'N'
            AND T1."DocEntry" = ${docEntryDev}
            AND T1."U_ID_VENDA_PDV" = '${idVoucher}'
            AND 1 = ?
        ORDER BY 
            T2."Code" DESC
    `;
	
	let regDocEntry = api.sqlQuery(query, 1);

    if(regDocEntry.length > 0){
        let statusDev = regDocEntry[0].NUMSTATE || false;
        
        if(statusDev !== 100){
            msgRetorno = regDocEntry[0].MSGRETORNO ? ('Nota de Devolucao Nao Autorizada, ' + regDocEntry[0].MSGRETORNO) : 'Transferencia Nao Realizada, Nota de Devolucao Sem Retorno ou Nao Enviada Para Sefaz';
        }
        
    } else {
        msgRetorno = 'Transferencia Nao Realizada, Nota de Devolucao Nao Gerada';
    }
    
    if(msgRetorno.length > 0){
        if(regDocEntry.length > 0 && regDocEntry[0].NUMSTATE > 108){
            errorLogTransferenciaProdutoVoucher(idVoucher, msgRetorno);
        }
        
        return false;
    }
    
    return true;
}

function executeGerarNotaSaidaTransferencia(connDB, session, idVoucher, stMsgRetorno){
    let queryVoucher = `
        SELECT TOP 100 DISTINCT
            TBR.IDVOUCHER,
            ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE, 
            TBV.IDVENDA,
            TBR.STDEVOLUCAO,
            TBR.STREFDEVOLUCAOSAP,
            TBR.IDCLIENTE,
            TBC.NUCPFCNPJ,
            TBR.DOCENTRYDEVSAP,
            STDEVOLUCAOSAP
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA AND TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
            TBR.IDCLIENTE = TBC.IDCLIENTE 
        WHERE
            TBR.STTIPOTROCA <> 'TROCO'
            AND TBR.STCANCELADO = 'False'
            AND TBR.STDEVOLUCAOSAP = 'True'
            AND TBR.STREFDEVOLUCAOSAP = 'True'
            AND IFNULL(TBR.STNOTASAIDATRANSFERENCIASAP, 'False') <> 'True'
            AND IFNULL(TBR.DOCENTRYNOTASAIDATRANSFERENCIASAP, 0) = 0
            AND 1 = ?
    `;

    if(idVoucher){
        queryVoucher += ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    } else {
        queryVoucher += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
        `;
    }
    
    queryVoucher += ` ORDER BY TBR.IDVOUCHER `;
    
    let regVoucher = api.sqlQuery(queryVoucher, 1);

    if(regVoucher.length){
        conn = connDB;
        
        for(let j = 0; j < regVoucher.length; j++){
            let dados = regVoucher[j];
            let idVenda = dados.IDVENDA;
            let idCliente = dados.IDCLIENTE;
            let nuCpfOrCnpjCliente = dados.NUCPFCNPJ;
            let idVoucher = dados.IDVOUCHER;
            let docEntryDev = dados.DOCENTRYDEVSAP;
            
            if(fnValidaDevolucaoSAP(idVoucher, docEntryDev)){
                libGeraNotaSaidaTransferenciaProduto.executeNfeSaida(idVoucher, conn, session);
            } else {
                
                if(stMsgRetorno){
                    return {
                        msg:'Nota de Saida da Transferencia não realizada, Devolucao não realizada ou não autorizada da venda de origem!'
                    }
                }
            }
            
        }
        
    } else{
        return {
            msg: 'Dados da Nota de Saida da Transferencia não Encontrados, Nota de Devolucao Não Realizada ou Cancelada ou Notas de Saida de Transferencia Já Realizadas!'
        };
        
    }
    
    return {
        msg: 'Notas da Saida das Transferencias Realizadas Com Sucesso!'
    };
    
}