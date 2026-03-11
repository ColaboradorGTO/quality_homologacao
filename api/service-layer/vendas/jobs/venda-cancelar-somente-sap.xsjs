var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");
var dbNameSAP = "SBO_GTO_TESTE4";

let conn;
let msg;

function getDocEntryCancelamentoSAP(docEntry){
    let query = `
        SELECT
            "DocEntry" AS DOCENTRY
        FROM 
            ${dbNameSAP}.OINV
        WHERE
            "CANCELED" = 'Y'
            AND "DocEntry" = ?
    `;
    
    return api.sqlQuery(query, Number(docEntry)) || [];
}

function registrarErrorLog(idVenda, p_Error = 'Erro ao tentar cancelar a venda no SAP'){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setString(2, idVenda);
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

function registrarSuccessLog(idVenda, msg){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            TXTMOTIVOCANCELAMENTO = ?
        WHERE 
            IDVENDA = ?
    `;
 	
 	let pStmt = conn.prepareStatement(api.replaceDbName(query));
 
 	pStmt.setString(1, msg);
 	pStmt.setString(2, idVenda);
 	
 	pStmt.executeUpdate();
 	pStmt.close();
 
 	conn.commit();
}

function atualizarDadosDevolucaoVendaSapNoQualityQuandoDadosRegistradosSomenteNoSAP(dadosSAP){
    let query = `
        UPDATE
            "VAR_DB_NAME"."VENDA"
        SET 
            ERRORLOGSAP = '',
            STDEVOLUCAO = 'True',
            DTDEVOLUCAO = '${dadosSAP.DATAHORAINTEGRACAO}',
            DOCENTRYDEVSAP = ?
        WHERE 
            IDVENDA = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, parseInt(dadosSAP.DOCENTRY));
	pStmt.setString(2, dadosSAP.IDVENDA);
	
	pStmt.executeUpdate();
	pStmt.close();
	
	conn.commit();
}

function postSl(docEntry, session) {
   var response = slApi.post(`/Invoices(${docEntry})/Cancel`, {}, session);
   let msg = 'Erro ao tentar cancelar a venda no SAP. ';
   
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        msg += response.error.message.value || '';
        
        return { 
            success: false,
            msg
        }
    }
    
    let regDocEntryCancel = getDocEntryCancelamentoSAP(docEntry);
    
    if(regDocEntryCancel.length > 0){
        let { DOCENTRY } = regDocEntryCancel[0];
        let docEntry = DOCENTRY;
        
        return {
            success: true,
            docEntry
        }
    }
    
    return { 
        success: false,
        msg
    }
    
}

function cancelarVendasNoSAP(){
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
       let session = slApi.loginServiceLayer(true);
       conn = $.db.getConnection();
       
        for(let dadosVenda of bodyJson){
            if(!dadosVenda.DOCENTRY || !dadosVenda.IDVENDA.length){
                $.response.status = 400;
                return {
                    msg: 'Campos DOCENTRY e IDVENDA são obrigatórios, tente novamente!'
                };
            }
            
            let regCancelamentoIntegrado = getDocEntryCancelamentoSAP(dadosVenda.DOCENTRY);
            //return {regCancelamentoIntegrado}
            if(regCancelamentoIntegrado.length > 0){
                let { DOCENTRY } = regCancelamentoIntegrado[0];
                
                registrarSuccessLog(dadosVenda.IDVENDA, `Venda com DocEntry(${DOCENTRY}) cancelada somente no SAP porque a serie da chave estava diferente da serie registra, feita a correção e reintegrada como Externa`);
                continue;
            }
            
            let { success, docEntry, msg } = postSl(dadosVenda.DOCENTRY, session);
            
            if(!success){
                registrarErrorLog(dadosVenda.IDVENDA, msg);
                continue;
            }
            
            registrarSuccessLog(dadosVenda.IDVENDA, `Venda com DocEntry(${docEntry}) cancelada somente no SAP porque a serie da chave estava diferente da serie registra, feita a correção e reintegrada como Externa`);
        }
        
        conn.commit();
        
        return {
            msg: 'Vendas Canceladas No SAP Com Sucesso!'
        }
    } else {
       $.response.status = 400;
        return {
            msg: 'Body vazio, tente novamente!'
        };
    }
    
}

$.response.status = $.net.http.OK;
$.response.contentType = 'application/json';

try {
	switch ($.request.method) {
        
		//Handle your PUt calls here
        case $.net.http.POST:
            
            var docReturn = cancelarVendasNoSAP();
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
    
    conn.rollback();
    
    var detalheErro = e.stack.split('\n');
    
    detalheErro = detalheErro.length > 3 ? detalheErro[1].trim() : detalheErro[ detalheErro.length - 3].trim()
    
    if(detalheErro){
       detalheErro = `Linha: ${detalheErro.split(':')[1]} da Funcao ${detalheErro.split('@').shift()}()`;
    }
    
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message,
		detalheErro
	}));
	$.response.status = 400;
}