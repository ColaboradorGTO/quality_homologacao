var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");
var vendaJson = $.import("quality.concentrador_homologacao.api.service-layer.vendas.venda", "vendaJson");

function errorLogVenda(idVenda, p_Error){

    var conn = $.db.getConnection();

    var query = 'UPDATE "QUALITY_CONC_HML"."VENDA" SET ERRORLOGSAP = ? WHERE IDVENDA = ?';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setInt(2, idVenda);
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function atualizaMigracaoVenda(idVenda, idSap){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."VENDA" SET' +
		'  SAP_DOCENTRY = ? '+
		' WHERE IDVENDA = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(1, parseInt(idSap));
	pStmt.setInt(2, idVenda);
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function postSl(data, session) {
    
   var response = slApi.post('/Invoices',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
   }else{
        return 'True';
   }
    
}

function excuteVendaNaoIntegrada(){
    
    var query = ' SELECT ' + 
    '   A.idvenda,  ' + 
    '   cast(A.dthorafechamento as date) as "DATA",  ' + 
    '   A.IDEMPRESA, ' + 
    '   A.NFE_INFNFE_EMIT_FANT, ' + 
    '   A.PROTNFE_INFPROT_CHNFE, ' + 
    '   A.NFE_INFNFE_IDE_NNF, ' + 
    '   A.NFE_INFNFE_IDE_SERIE, ' + 
    '   A.protnfe_infprot_cstat, ' + 
    '   A.protnfe_infprot_nprot, ' + 
    '   A.NFE_INFNFE_EMIT_ENDEREMIT_UF ' + 
    ' FROM "QUALITY_CONC_HML".venda A ' + 
    ' WHERE 1=? and' + 
    '   A.protnfe_infprot_cstat = 100  ' + 
    '   and ifnull(A.protnfe_infprot_nprot,\'\') <> \'\' ' + 
    '   and IFNULL(A.PROTNFE_INFPROT_CHNFE,\'\') <> \'\' ' + 
    '   and A.stcancelado = \'False\' ' + 
    '   and a.stcontingencia = \'False\' ' + 
    '   and a.NFE_INFNFE_IDE_TPAMB = 1 ' + 
    '   AND A.NFE_INFNFE_IDE_MOD = 65 ' + 
    '   AND NOT EXISTS (SELECT 1 ' + 
    ' FROM SBO_GTO_TESTE1.OINV XA WHERE  ' + 
    '   XA.CANCELED = \'N\' AND ' + 
    '   XA."BPLId" = A.IDEmpresa and  ' + 
    '   XA."Serial" = A.NFE_INFNFE_IDE_NNF and ' + 
    '   XA."SeriesStr" = cast(A.NFE_INFNFE_IDE_SERIE as varchar(10)) ' + 
    '   ) ' ; 
   
	
            query = query + ' AND (A.DTHORAFECHAMENTO BETWEEN \'2022-01-05 00:00:00\' AND \'2022-01-30 23:59:00\')';
    
    
    query = query +  '   ORDER BY A.idvenda ';
   

	var response = api.sqlQuery(query, 1);
	var data = [];
	var session = '';
	for (var i = 0; i < response.length; i++) {
        var det = response[i];
        //return 'aqui';
	    var retJson = vendaJson.obterJsonVenda(det.IDVENDA);
       
      
        if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		} 
	
		var retSl = postSl(retJson,session);
		if(retSl !== 'True'){
		    errorLogVenda(det.IDVENDA, retSl.error.message.value);
		    return retSl;
		}
	
		var resultMigracao = api.sqlQuery('select "DocNum" as IDSAP from "SBO_GTO_TESTE1".OINV where 1=? AND "U_ID_VENDA_PDV" = \''+ det.IDVENDA+'\'', 1);
	   if(resultMigracao.length > 0)
	   {
	       //return resultMigracao[0].MARCACOD;
	       atualizaMigracaoVenda(det.IDVENDA, resultMigracao[0].IDSAP);
	   }

	}
	return 'Migração Nota-saida realizada com sucesso!';

	//response.data = transferenciaSaida;

	//return postSl(transferenciaSaida,'true');
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = excuteVendaNaoIntegrada();
                 $.response.setBody(JSON.stringify({ result : doc }));
                break;
                
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}