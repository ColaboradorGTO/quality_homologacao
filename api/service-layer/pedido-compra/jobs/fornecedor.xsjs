var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(data, session) {
    
    slApi.post('/BusinessPartners',data,session);
    return 'True';
}

function atualizaMigracaoFornecedor(idFornecedor){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."FORNECEDOR" SET' +
		'  IDFORNECEDORSAP = ?, '+
		'  STMIGRADOSAP = \'True\''+
		' WHERE IDFORNECEDOR = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idFornecedor);
	pStmt.setString(2, idFornecedor);
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function executeFornecedor(){
   
    var query = 'SELECT '+
            	'T1."IDFORNECEDOR", '+
            	'T1."IDFORNECEDORSAP", '+
            	'T1."IDGRUPOEMPRESARIAL", '+
            	'T1."IDSUBGRUPOEMPRESARIAL", '+
            	'T1."MODPEDIDO", '+
            	'T1."NORAZAOSOCIAL", '+
            	'T1."NOFANTASIA", '+
            	'T1."NUCNPJ", '+
            	'T1."NUINSCESTADUAL", '+
            	'T1."NUINSCMUNICIPAL", '+
            	'T1."NUIBGE", '+
            	'T1."EENDERECO", '+
            	'T1."ENUMERO", '+
            	'T1."ECOMPLEMENTO", '+
            	'T1."EBAIRRO", '+
            	'T1."ECIDADE", '+
            	'T1."SGUF", '+
            	'T1."NUCEP", '+
            	'T1."EEMAIL", '+
            	'T1."NUTELEFONE1", '+
            	'T1."NUTELEFONE2", '+
            	'T1."NUTELEFONE3", '+
            	'T1."NOREPRESENTANTE", '+
            	'T1."DTCADASTRO", '+
            	'T1."DTULTATUALIZACAO", '+
            	'T1."STATIVO", '+
            	'T1."IDCONDPAGPADRAO", '+
            	'T1."IDTRANSPORTADORAPADRAO", '+
            	'T1."TPPEDIDOPADRAO", '+
            	'T1."NOVENDEDORPADRAO", '+
            	'T1."TPFRETEPADRAO", '+
            	'T1."TPARQUIVOPADRAO", '+
            	'T1."TPFISCALPADRAO", '+
            	'T1."EMAILVENDEDORPADRAO" '+
            ' FROM "QUALITY_CONC_HML"."FORNECEDOR" T1 '+
               	'WHERE  1=? AND' +
        		' T1."IDFORNECEDORSAP" is NULL  ';
	
	var linhas = api.sqlQuery(query, 1);
	var lines = [];
	var session = '';
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
	
		var Str_Json = '{"CardCode": "'+ det.IDFORNECEDOR+'"'+
		    ',"CardName":"'+ det.NORAZAOSOCIAL+'"'+
            ',"CardForeignName":"'+ det.NOFANTASIA+'"'+
            ',"CardType": "cSupplier" '+
            ',"GroupCode": 101'+
            ',"FederalTaxID": "'+ det.NUCNPJ +'"'+
            ',"Valid": "tYES"'+
            ',"Series": 2' +
            ',"Cellular": "'+ det.NUTELEFONE1 +'"'+
            ',"Phone1": "'+ det.NUTELEFONE2 +'"'+
            ',"BPAddresses": [ ';
            
        var IdCidade = api.sqlQuery('select a."AbsId" from "SBO_GTO_PRD".OCNT a where a."IbgeCode" = ?',det.NUIBGE);
            
        for(var j = 0; j < 2; j++){
            if(j === 0 ){ Str_Json = Str_Json +'{"AddressName": "COBRANCA", "AddressType": "bo_BillTo"';}else{Str_Json = Str_Json +',{"AddressName": "ENTREGA","AddressType": "bo_ShipTo"';}
            
                Str_Json = Str_Json + ',"Street":" '+ det.EENDERECO + '"'+
				' ,"Block": "'+ det.EBAIRRO +'"'+
				' ,"ZipCode": "'+ det.NUCEP +'"'+
				' ,"City": "'+ det.ECIDADE +'"'+
				' ,"County": "'+IdCidade[0].AbsId +'"'+
				' ,"Country": "BR" '+
				' ,"State": "'+ det.SGUF +'"'+ 
				' ,"BuildingFloorRoom": "'+ det.ECOMPLEMENTO +'"'+ 
				' ,"StreetNo": "'+ det.ENUMERO +'"}'; 
		}
        
        Str_Json = Str_Json + '],'+
        '"BPFiscalTaxIDCollection": [{ '+
        ' "TaxId0":"'+ det.NUCNPJ +'"'+ 
		',"TaxId1": "'+ det.NUINSCESTADUAL +'"'+ 
        '}]';
        
        Str_Json = Str_Json + ',"BPPaymentMethods": [ '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Bol_Arrec" '+ 
                '     ,"RowNumber": 0 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Boleto" '+ 
                '     ,"RowNumber": 1 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Cheque" '+ 
                '     ,"RowNumber": 2 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_DARF" '+ 
                '     ,"RowNumber": 3 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_DebConta" '+ 
                '     ,"RowNumber": 4 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Dinheiro" '+ 
                '     ,"RowNumber": 5 '+  
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Transf" '+ 
                '     ,"RowNumber": 6 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG_Transf_CC" '+  
                '     ,"RowNumber": 7 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' }, '+ 
                ' { '+ 
                '     "PaymentMethodCode": "PG VIA PIX" '+  
                '     ,"RowNumber": 8 '+ 
                '     ,"BPCode": "'+ det.IDFORNECEDOR+'"'+
                ' } '+ 
            ']} ';
        
       // return Str_Json;
       	if(i === 0){
		    session = slApi.loginServiceLayer(true);
		    slApi.loginServiceLayer(true);
		} 
       postSl(JSON.parse(Str_Json),session);
       var resultMigracao = api.sqlQuery('select "CardCode" from "SBO_GTO_TESTE1".OCRD where 1=? AND "CardCode" = \''+ det.IDFORNECEDOR.toString()+'\'', 1);
	   if(resultMigracao.length > 0)
	   {
	       atualizaMigracaoFornecedor(det.IDFORNECEDOR);
	   }
	   
		//lines.push(JSON.parse(Str_Json));
		//lines.push(Str_Json);
	}
    return 'Migração Fornecedor realizada com sucesso!';
	//return postSl(lines,'true');
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executeFornecedor();
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

