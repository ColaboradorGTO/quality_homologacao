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
    
   var response = slApi.post('/Items',transferencia,session);
    return transferencia;
}

function fnIncluirProduto(idResumoPedido){
   
    var query = 'SELECT "IDDETALHEPRODUTOPEDIDO", '+
	                'T1."IDDETALHEPEDIDO", '+
	                'T1."IDGRUPOESTRUTURA", '+
	                'T1."IDSUBGRUPOESTRUTURA", '+
	                'T1."IDCOR", '+
	                'T1."IDTAMANHO", '+
	                'CASE T1."DSTAMANHO" WHEN \'Diversos\' THEN \'tNO\' ELSE \'tYES\' END AS DSTAMANHO, '+
	                'T1."IDCATEGORIAPEDIDO", '+
	                'T1."IDTIPOTECIDO", '+
	                'T1."IDESTILO", '+
	                'T1."IDFABRICANTE", '+
	                'T1."IDLOCALEXPOSICAO", '+
	                'T1."IDCATEGORIAS", '+
	                'T1."IDNCM", '+
	                'T1."NUNCM", '+
	                'T1."IDCEST", '+
	                'T1."NUCEST", '+
	                'T1."IDTIPOPRODUTOFISCAL", '+
	                'T1."IDFONTEPRODUTOFISAL", '+
	                'T1."IDPRODCADASTRO", '+
	                'T1."NUREF", '+
	                'T1."CODBARRAS", '+
	                'T1."DSPRODUTO", '+
	                'T1."QTDPRODUTO", '+
	                'T1."UND", '+
	                'T1."VRCUSTO", '+
	                'T1."VRVENDA", '+
	                'T1."VRTOTALCUSTO", '+
	                'T1."VRTOTALVENDA", '+
	                'T1."DTCADASTRO", '+
	                'T1."DTULTATUALIZACAO", '+
	                'T1."STCADASTRADO", '+
	                'T1."STRECEBIDO", '+
	                'T1."OBSREF", '+
	                'T1."IDDETALHEENTRADA", '+
	                'T1."NUNF", '+
	                'T1."QTDENTRADANF", '+
	                'T1."DTENTRADANF", '+
	                'T1."STECOMMERCE", '+
	                'T1."STREDESOCIAL", '+
	                'T1."STATIVO", '+
	                'T1."STCANCELADO", '+
	                'T1."QTDESTOQUEIDEAL", '+
	                'T1."IDRESUMOPEDIDO", '+
	                'T3."IDFORNECEDOR", '+
	                'CASE T2."TIPOPEDIDO" WHEN \'VESTUARIO\' THEN 1 ELSE 8 END AS TIPOPEDIDO '+
                'FROM "QUALITY_CONC_HML"."DETALHEPRODUTOPEDIDO" T1 '+
                'INNER JOIN "QUALITY_CONC_HML"."CATEGORIAPEDIDO" T2 ON T2.IDCATEGORIAPEDIDO = T1.IDCATEGORIAPEDIDO '+
                'INNER JOIN "QUALITY_CONC_HML"."RESUMOPEDIDO" T3 ON T3.IDRESUMOPEDIDO = T1.IDRESUMOPEDIDO '+
                'WHERE  ' +
        		' T1."IDRESUMOPEDIDO" = ?  ';
	//return query;
	var linhas = api.sqlQuery(query, idResumoPedido);
	//return 'aqui';
	var lines = [];
	
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		
		var retNcm = api.sqlQuery('select top 1 "AbsEntry" AS NCM from "SBO_GTO_PRD".ONCM where replace("NcmCode",\'.\',\'\') = ? order by "AbsEntry" desc',det.NUNCM);
		
		var Str_Json = '{'+
		    '"ItemCode":"'+ det.IDPRODCADASTRO+'"'+
            ',"ItemName":"'+ det.DSPRODUTO+'"'+
            ',"ItemsGroupCode": 100'+
            ',"VatLiable": "tYES"'+
            ',"PurchaseItem": "tYES"' +
            ',"SalesItem": "tYES"' +
            ',"InventoryItem":"'+ det.DSTAMANHO +'"'+ /*passar "tYES" para produtos normais e "tNO" para produto de saldo ou serviços*/
            ',"Valid": "tYES"'+
            ',"SalesUnit":"'+ det.UND+'"'+
            ',"PurchaseUnit":"'+ det.UND+'"'+
            ',"InventoryUOM":"'+ det.UND+'"'+
            ',"ItemType": "itItems"'+
            ',"ItemClass": "itcMaterial"'+ /*passar "itcMaterial" para produto e "itcService" para serviço*/
            ',"NCMCode": '+ retNcm[0].NCM +
            ',"MaterialType": "mt_GoodsForReseller"'+
            ',"MaterialGroup": ' + det.TIPOPEDIDO + /*para roupas ou 8 para calçados ou artigo*/
            ',"ProductSource": "0"' +
            ',"Manufacturer": ' + det.IDFABRICANTE +
            ',"ItemsGroupCode": ' + det.IDSUBGRUPOESTRUTURA +
            ',"Mainsupplier": ' + det.IDFORNECEDOR +
            ',"BarCode":"'+ det.CODBARRAS+'"'+
            ',"Series": 3 ' +
            ',"ItemPrices": [ ' +
            '     { ' +
            '         "PriceList": 1 ' +
            '         ,"Price": ' + det.VRVENDA  +
            '         ,"Currency": "R$" ' +
            '         ,"BasePriceList": 1 ' +
            '         ,"Factor": 1.0 ' +
            '     }, ' +
            '     { ' +
            '         "PriceList": 121 ' +
            '         ,"Price": ' + det.VRVENDA  +
            '         ,"Currency": "R$" ' +
            '         ,"BasePriceList": 121 ' +
            '         ,"Factor": 1.0 ' +
            '     }, ' +
            '     { ' +
            '         "PriceList": 122 ' +
            '         ,"Price": ' + det.VRVENDA  +
            '         ,"Currency": "R$" ' +
            '         ,"BasePriceList": 122 ' +
            '         ,"Factor": 1.0 ' +
            '     }, ' +
            '     { ' +
            '         "PriceList": 125 ' +
            '         ,"Price": ' + det.VRVENDA  +
            '         ,"Currency": "R$" ' +
            '         ,"BasePriceList": 125 ' +
            '         ,"Factor": 1.0 ' +
            '     }, ' +
            '     { ' +
            '         "PriceList": 3 ' +
            '         ,"Price": '+ det.VRCUSTO +
            '         ,"Currency": "R$" ' +
            '         ,"BasePriceList": 3 ' +
            '         ,"Factor": 1.0 ' +
            '     } ' +
            ' ]} ' ;
            
       
		//lines.push(JSON.parse(Str_Json));
		postSl(JSON.parse(Str_Json),'true');
		//lines.push(Str_Json);
		//return JSON.parse(Str_Json);
	}

	return 'realizado';
}

