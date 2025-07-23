var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
var traducao = $.import("quality.concentrador_homologacao.api.service-layer.traducao-texto", "traducao"); 

function logNotaEntrada(p_IdResumoEntrada, p_msgStatus, p_IdStatus){
    let conn = $.db.getConnection();

    let query = `UPDATE
                	"VAR_DB_NAME".RESUMOENTRADANFEPEDIDO
                SET
                	LOGSAP = ?,
                	STMIGRADOSAP = '${p_IdStatus}'
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

function postSl(data, session) {
    let response = slApi.post('/PurchaseInvoices',data,session);

    if (response.status !== 204) {
        let respObj = JSON.parse(response.body.asString());
        let msg = respObj.error.message.value;
        
        respObj = traducao.traduzirTexto(msg);
        
        return respObj;
   } else {
        return 'True';
   }
   
}

function obterLinhasDoDetalhe(idResumoEntrada, codigoDeposito) {
    var query = `SELECT 
                    tbde.IDPRODUTO,
                    tbde.VUNCOM,
                    tbde.QCOM,
                    tbde.CEAN,
                    tbre.IDUSOPRINCIPAL,
                    tbre.MODFRETE
                FROM
                    "VAR_DB_NAME".RESUMOENTRADANFEPEDIDO tbre
                INNER JOIN 
                    "VAR_DB_NAME".DETALHEENTRADANFEPEDIDO tbde ON tbre.IDRESUMOENTRADA = tbde.IDRESUMOENTRADA
                WHERE
                    tbre.IDRESUMOENTRADA = ?`;
                    
    		
	var linhas = api.sqlQuery(query, idResumoEntrada);

	var lines = [];
    var det;
    
	for (var i = 0; i < linhas.length; i++) {
		det = linhas[i];
		var docLine = {
    			"LineNum": i + 1,
    			"ItemCode": det.IDPRODUTO,
    			"Quantity": parseInt(det.QCOM),
    			"UnitPrice":parseFloat(det.VUNCOM),
    			"WarehouseCode": codigoDeposito.toString(),
    			"CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "BarCode": det.CEAN,
                "Usage": det.IDUSOPRINCIPAL
    		};
        
		lines.push(docLine);
	}

	return lines;
}

function executeEntradaNfe(idResumoEntrada){
    var queryVerificaNota = `
        SELECT 
            "DocEntry" as IDSAP,
            *
        FROM 
            "SBO_GTO_TESTE1".OPCH 
        WHERE 
            1 = ? 
            AND CANCELED = 'N' 
            AND "U_ID_VENDA_PDV" = ${idResumoEntrada}
    `;

    var verificaCadNota = api.sqlQuery(queryVerificaNota, 1);
    
    if(verificaCadNota.length > 0){
       // logNotaEntrada(det.IDRESUMOENTRADA, 'Migrado Com Sucesso', 'True');
        return 'Migração Não Realizada, Nota de entrada já cadastrada no SAP!';
    } else {
    
        var query = `
            SELECT 
                tbre.IDRESUMOENTRADA,
                tbre.DTCADASTRO,
                tbre.DEMI,
                tbf.IDFORNECEDORSAP,
                tbre.IDRESUMOPEDIDO,
                tbre.VNF,
                tbre.IDCONDPAGAMENTO,
                tbre.IDEMPRESA,
                tbre.IDGRUPOEMPRESARIAL,
                tbre.NNF,
                tbre.CHNFE,
                tbre.SERIE,
                tbre.MODFRETE,
                tbre.IDUSOPRINCIPAL,
                tbre.IDCOMPRADOR,
                tbre.IDMARCA,
                TO_VARCHAR(tbre.OBSERVACOES) AS OBSERVACOES
            FROM 
                "VAR_DB_NAME".RESUMOENTRADANFEPEDIDO tbre
            INNER JOIN 
                "VAR_DB_NAME".FORNECEDOR tbf ON tbre.IDFORNECEDOR = tbf.IDFORNECEDOR
            WHERE 
                tbre.STCANCELADO = 'False' AND
                tbre.IDRESUMOENTRADA = ?
        `;
    
    	var response = api.sqlQuery(query, idResumoEntrada);
		var det = response.length ? response[0] : null;
        
        if(det){
            var retCodigoComprador = api.sqlQuery('select "SlpCode" AS IDCOMPRADOR from "SBO_GTO_PRD".OSLP where "U_Matricula" = ?',det.IDCOMPRADOR);
            var cdComprador =  retCodigoComprador.length > 0 ? retCodigoComprador[0].IDCOMPRADOR : null;
            var retUsoPrincipal = api.sqlQuery('SELECT  "FreeChrgBP" AS GRATUITO  FROM "SBO_GTO_PRD"."OUSG" WHERE "ID" = ?',det.IDUSOPRINCIPAL);
            var vrNfe = retUsoPrincipal.length ? retUsoPrincipal[0].GRATUITO == 'Y' ? null : det.VNF : null;
            var retMarca = api.sqlQuery('SELECT * FROM "VAR_DB_NAME".FABRICANTE WHERE IDFABRICANTE = ?', det.IDMARCA);
            var marca = retMarca.length > 0 ? retMarca[0].DSFABRICANTE : null;
            
            if(!retUsoPrincipal.length){
                logNotaEntrada(det.IDRESUMOENTRADA, 'Nota não possui Uso Principal!', 'False');
                return 'Nota não possui Uso Principal!';
            }
            
            var notaEntrada = {
                "DocType": "dDocument_Items",
                "U_ID_VENDA_PDV": det.IDRESUMOENTRADA,
                "DocDate": det.DTCADASTRO,
                "DocDueDate": det.DTCADASTRO,
                "CardCode": det.IDFORNECEDORSAP,
                "NumAtCard": (det.IDRESUMOPEDIDO || null),
                "DocTotal": vrNfe,
                "Comments": ` Integração Quality ${det.OBSERVACOES ? ('-- ' + det.OBSERVACOES + ' --') : ''}`,
                "JournalMemo": "NFe de Entrada",
                "TaxDate": det.DEMI,
                "Project": "PDV_SOFTQUALITY",
                // Aguardando confirmação do Alberto de como será gravado a Condição de Pagamento
                "PaymentGroupCode": det.IDCONDPAGAMENTO,
                "GroupNum": det.IDCONDPAGAMENTO,
                "SalesPersonCode": cdComprador,
                "BPL_IDAssignedToInvoice": det.IDEMPRESA,
                "U_GrupoEmpresarial": det.IDGRUPOEMPRESARIAL,
                "SequenceCode": -2, 
                "SequenceModel": "39", 
                "SequenceSerial": det.NNF,
                "U_ChaveAcesso": det.CHNFE,
                "SeriesString": det.SERIE,
                "DocumentLines": obterLinhasDoDetalhe(det.IDRESUMOENTRADA, det.IDEMPRESA),
                "TaxExtension": {
                    "Brand": marca,
                    "Incoterms": det.MODFRETE,
                    "MainUsage": det.IDUSOPRINCIPAL
                }
            };
            
            var session = slApi.loginServiceLayer(true);
            slApi.loginServiceLayer(true);
            
            var rsSl = postSl(notaEntrada,session);
            
            if(rsSl !== 'True'){
                logNotaEntrada(det.IDRESUMOENTRADA, rsSl, 'False');
                return rsSl;
                
            } else {
                logNotaEntrada(det.IDRESUMOENTRADA, 'Migrado Com Sucesso', 'True');
                return 'True';//'Migração Nota de entrada realizada com sucesso!';
            }
        } else {
            return 'Nota não Encontrada ou Cancelada!'
        }   
    }
}