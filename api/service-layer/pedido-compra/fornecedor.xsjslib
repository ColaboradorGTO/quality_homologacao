var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(transferencia, force) {
    var session = '';    
   if ( force === 'true' ) 
    {
        session = slApi.loginServiceLayer(true);
    }

    if ( force === 'true' ) 
    {
         slApi.loginServiceLayer(true);
    }
    
   var response = slApi.post('/BusinessPartners',transferencia,session);
    return 'True';
}

function fornecedor(idFornecedor){
    
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
               	'WHERE  ' +
        		' T1."IDFORNECEDOR" = ?  ';
	
	var linhas = api.sqlQuery(query, idFornecedor);
	var lines = [];
	
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
        
        //return Str_Json;
       
		lines.push(JSON.parse(Str_Json));
		//lines.push(Str_Json);
	}

	return postSl(lines,'true');
}

