let { sqlQuery, replaceDbName } = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let { loginServiceLayer, post } = $.import("quality.concentrador_homologacao.api.service-layer", "api");
let { getJsonVenda } = $.import("quality.concentrador_homologacao.api.service-layer.vendas.libs", "json-venda-65-externa");
let dbNameSAP = 'SBO_GTO_TESTE4'

let conn;

function ajustarDataVenda(uf, data) {
    let [ano, mes, dia] = data.split("-").map(Number);
    //return `${ano}-${mes}-${dia}`;
    
    let dataHora = new Date(ano, mes - 1, dia); 
    let agora = new Date();
    let limite = new Date();
    let novaData = '';
    let diasSubtracao;
    
    dataHora.setHours(0, 0, 0, 0);
    agora.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    
    if(uf == 'GO') {
        limite.setDate(agora.getDate() - 15)
        diasSubtracao = 14;
    } else {
        limite.setDate(agora.getDate() - 30)
        diasSubtracao = 29;
    }
    
    if(dataHora <= limite){
        novaData = new Date();
        novaData.setDate(agora.getDate() - diasSubtracao);
        
        dataHora = novaData;
    }
    
    ano = dataHora.getFullYear();
    mes = String(dataHora.getMonth() + 1);
    dia = String(dataHora.getDate());
    
    mes = mes.length < 2 ? ('0' + mes) : mes;
    dia = dia.length < 2 ? ('0' + dia) : dia;
    
    return `${ano}-${mes}-${dia}`;
}

function registrarErrorLogVenda(idVenda, p_Error){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDVENDA = ? 
    `;

	let pStmtUpdate = conn.prepareStatement(replaceDbName(query));

	pStmtUpdate.setString(1, p_Error);
	pStmtUpdate.setString(2, idVenda);
	
	pStmtUpdate.executeUpdate();
	pStmtUpdate.close();
	
	conn.commit();
}

function registrarSucessoIntegracao(idVenda, docNum, docEntry){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            SAP_DOCENTRY = ?,
            SAP_DOCENTRY_CORRETO = ?
		WHERE 
		    IDVENDA = ?
    `;
	
	let pStmtUpdate = conn.prepareStatement(replaceDbName(query));

	pStmtUpdate.setInt(1, parseInt(docNum));
	pStmtUpdate.setInt(2, parseInt(docEntry));
	pStmtUpdate.setString(3, idVenda);
	
	pStmtUpdate.executeUpdate();
	pStmtUpdate.close();

	conn.commit();
}

function getDadosVendaSAP(idVenda){
    let query = `
        SELECT 
            "DocEntry", 
            "DocNum" 
        FROM 
            ${dbNameSAP}.OINV 
        WHERE 
            1 = ? 
            AND "U_ID_VENDA_PDV" = '${idVenda}'
            AND "CANCELED" = 'N'
            AND "Model" = 54
    `;
    
    return sqlQuery(query, 1);
}

function getListaVendaParaIntegrar(idVenda){
    let query = ` 
        SELECT TOP 50
            TBV.IDVENDA
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE 
            1 = ? 
            /*AND TBE.SGUF = 'MG'*/
            AND TBV.PROTNFE_INFPROT_CSTAT = 100   
			AND IFNULL(TBV.PROTNFE_INFPROT_NPROT,'') <> ''  
			AND IFNULL(TBV.PROTNFE_INFPROT_CHNFE,'') <> ''  
			AND TBV.STCANCELADO = 'False'  
			AND TBV.STCONTINGENCIA = 'False'  
			AND TBV.NFE_INFNFE_IDE_TPAMB = 1  
			AND TBV.NFE_INFNFE_IDE_MOD = 65
			AND (TBV.SAP_DOCENTRY IS NULL OR TBV.SAP_DOCENTRY_CORRETO IS NULL)
			AND IFNULL(TBV.ERRORLOGSAP, '') = ''
			AND NOT EXISTS (
				SELECT 
					1  
				FROM 
					${dbNameSAP}.OINV XA 
				WHERE   
					XA.CANCELED = 'N'  
					AND XA."BPLId" = TBV.IDEMPRESA
					AND XA."Serial" = TBV.NFE_INFNFE_IDE_NNF  
					AND XA."SeriesStr" = CAST(TBV.NFE_INFNFE_IDE_SERIE AS VARCHAR(10))  
            )
            /*AND NOT  EXISTS (
                SELECT 
                xa."DocEntry" 
                FROM 
                SBO_GTO_PRD.OINV XA 
                WHERE   
                    XA.CANCELED = 'N'  
                AND XA."BPLId" = TBV.IDEMPRESA
                AND XA."DocEntry" = TBV.SAP_DOCENTRY_CORRETO 
            )*/
            AND TBV.IDVENDA IN(${idVenda})
        ORDER BY 
            TBV.DTHORAFECHAMENTO
    `; 
    
	return sqlQuery(query, 1);
}

function postSl(data, session) {
   let response = post('/Invoices', data, session);
   let msg = 'Erro ao integrar a venda'
   
    if (response.status !== 204) {
        response =  JSON.parse(response.body.asString());
        
        msg += response.error.message.value || '';
        
    } else {
       let regSAP = getDadosVendaSAP(data.U_ID_VENDA_PDV);
       
       if(regSAP.length > 0){
           let { DocEntry, DocNum } = regSAP[0];
           
           return {
                success: true,
                DocEntry, 
                DocNum
           }
       }
   }
   
   return {
        success: false,
        msg
    }
}

function executeIntegraVendaComoExternaNoSAP(byId){
	let listaVendas = getListaVendaParaIntegrar(`'${byId}'`);
	
	if(listaVendas.length > 0){
        let session = loginServiceLayer(true);
        
        conn = $.db.getConnection();
        
        for (let registro of listaVendas) {
            let regSAP = getDadosVendaSAP(registro.IDVENDA);
            //return {regSAP}
            if(regSAP.length > 0){
                let { DocEntry, DocNum } = regSAP[0];
                
                registrarSucessoIntegracao(registro.IDVENDA, DocNum, DocEntry);
                
                continue;
            }
            
            let jsonVenda = getJsonVenda(registro.IDVENDA);
            return {jsonVenda}
            let respIntegracao = postSl(jsonVenda, session);
            
            if(!respIntegracao.success){
                registrarErrorLogVenda(registro.IDVENDA, respIntegracao.msg);
                
                continue;
            }
            
            registrarSucessoIntegracao(registro.IDVENDA, respIntegracao.DocNum, respIntegracao.DocEntry);
        }
    }
	
	return 'Migração Venda Realizada Com Sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let id = $.request.parameters.get("id");
                let docReturn = executeIntegraVendaComoExternaNoSAP(id);
                
                $.response.setBody(JSON.stringify(docReturn));
                break;
                
            default:
                break;
        }
    } catch (e) {
        let detalheError = e.stack.split('\n');
        
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