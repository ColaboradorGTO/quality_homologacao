var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
var traducao = $.import("quality.concentrador_homologacao.api.service-layer.traducao-texto", "traducao"); 

function logNotaEntrada(p_IdResumoEntrada, p_msgStatus){
    let conn = $.db.getConnection();

    let query = `UPDATE
                	"VAR_DB_NAME".RESUMOENTRADANFEPEDIDO
                SET
                	LOGSAP = ?
                WHERE
                	IDRESUMOENTRADA = ?`;
                	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_msgStatus);
	pStmt.setInt(2, parseInt(p_IdResumoEntrada));
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function postSl(DocEntry, session, idResumoEntrada) {
    let response = slApi.post(`/PurchaseInvoices(${DocEntry})/Cancel`, '', session);
    
    if (response.status !== 204) {
        let obj = JSON.parse(response.body.asString());
        let msg = obj.error.message.value;
        
        obj = traducao.traduzirTexto(msg);
        
        return obj ;
   }else{
       logNotaEntrada(idResumoEntrada, 'Nota Cancelada no SAP com Sucesso');
        return 'True';
   }
}

function executeCancelarNfe(idResumoEntrada){
    
    let query = `SELECT
                    * 
                FROM 
                    "SBO_GTO_TESTE1".opch 
                WHERE
                    "U_ID_VENDA_PDV" = ?
                ORDER BY "DocEntry" DESC LIMIT 1`;
	
	let retNfeSap = api.sqlQuery(query, idResumoEntrada);
    let DocEntry = retNfeSap.length > 0 ? retNfeSap[0]['DocEntry'] : null ;
    let statusDoc = retNfeSap.length > 0 ? retNfeSap[0]['CANCELED'] : null ;
    
    if(DocEntry){
        
        if(statusDoc == 'N'){
            let session = slApi.loginServiceLayer(true);
            
            slApi.loginServiceLayer(true);
            
            return postSl(DocEntry,session, idResumoEntrada);
        } else {
            logNotaEntrada(idResumoEntrada, 'Nota já Cancelada no SAP');
            
            return 'Nota já Cancelada no SAP!';
        }
    
    } else {
        logNotaEntrada(idResumoEntrada, 'Nota nao encontrada no SAP');
        
        return 'False';
    }
}

