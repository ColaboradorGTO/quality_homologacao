let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let filePathLibs = `${filePath}.service-layer.devolucao.devolucao-produtos-voucher-nova.libs`;

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libGeraNotaSaidaTransferenciaProduto = $.import(filePathLibs, "nfe-saida-transferencia"); 

let conn;
let session;

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

function validarDevolucaoSapAutorizada(idVoucher){
    let msgRetorno =  '';
    
    let query = `
        SELECT 
            T1."DocEntry",
            T2."U_cdErro" AS NUMSTATE,
            T2."U_msgSEFAZ" AS MSGRETORNO
        FROM
            ${dbNameSAP}.ORIN T1
        INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER TBR ON 
            T1."DocEntry" = TBR.DOCENTRYDEVSAP AND T1."U_ID_VENDA_PDV" = TO_VARCHAR(TBR.IDVOUCHER)
        LEFT JOIN ${dbNameSAP}."@SKL25NFE" T2 ON 
            TO_VARCHAR(T1."DocEntry") = T2."U_DocEntry" AND T2."U_tipoDocumento" = 'DN'
        WHERE
            T1."CANCELED" = 'N'
            AND TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
        ORDER BY 
            T2."Code" DESC
    `;
	
	let regDocEntry = api.sqlQuery(query, 1);

    if(regDocEntry.length > 0){
        let statusDev = regDocEntry[0].NUMSTATE || false;
        
        if(statusDev !== 100 && statusDev !== 150){
            msgRetorno = regDocEntry[0].MSGRETORNO ? ('Nota de Devolucao Nao Autorizada, ' + regDocEntry[0].MSGRETORNO) : 'Transferencia Nao Realizada, Nota de Devolucao Sem Retorno ou Nao Enviada Para Sefaz';
        }
        
    } else {
        msgRetorno = 'Transferencia Nao Realizada, Nota de Devolucao Nao Gerada';
    }
    
    if(msgRetorno.length > 0){
        if(regDocEntry.length > 0 && regDocEntry[0].NUMSTATE > 108 || msgRetorno){
            errorLogTransferenciaProdutoVoucher(idVoucher, msgRetorno);
        }
        
        return false;
    }
    
    return true;
}

function executeGerarNotaSaidaTransferencia(idVoucher, stMsgRetorno){
    let query = `
        SELECT TOP 50 DISTINCT
            TBR.IDVOUCHER
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
        query += ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    } else {
        query += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2025-10-01'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
            --AND TBR.ERRORLOGSAP IS NULL
            /*--AND TO_DATE(TBR.DTINVOUCHER) <= '2025-05-31' */
        `;
    }
    
    query += ` ORDER BY TBR.IDVOUCHER `;
    
    let regVoucher = api.sqlQuery(query, 1);
    
    if(regVoucher.length > 0){
        conn = $.db.getConnection();
        session = slApi.loginServiceLayer(true);
        
        slApi.loginServiceLayer(true);
        
        for(let { IDVOUCHER } of regVoucher){
            let stGerarNfeSaidaTransferencia = validarDevolucaoSapAutorizada(IDVOUCHER);
            
            if(stGerarNfeSaidaTransferencia){
                libGeraNotaSaidaTransferenciaProduto.executeNfeSaida(IDVOUCHER, conn, session);
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

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
            var id = $.request.parameters.get("id");
            var stMsgRetorno = $.request.parameters.get("stMsgRetorno");
            var docReturn = executeGerarNotaSaidaTransferencia(id, stMsgRetorno);
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
        }
        
    } catch (e) {
        var detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }
}