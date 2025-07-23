var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function postSl(data, session) {
    var response = slApi.post('/Items',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
    //slApi.post('/Items',data,session);
    //return true;
}

function atualizaMigracaoFornecedor(idProduto){
    var conn = $.db.getConnection();
    var query = 'UPDATE "QUALITY_CONC_HML"."DETALHEPRODUTOPEDIDO" SET' +
		'  STMIGRADOSAP = \'True\''+
		' WHERE IDPRODCADASTRO = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function executeProduto(){
   var codProdAvulso = $.request.parameters.get("codProdAvulso");
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
	                'T1."IDFORNECEDOR", '+
	                'T4."IDFORNECEDORSAP", '+
	                'T5."IDSAP", '+
	                'T6."CODTIPOFISCALPRODUTO", '+
	                'CASE T2."TIPOPEDIDO" WHEN \'VESTUARIO\' THEN 1 ELSE 8 END AS TIPOPEDIDO '+
                'FROM "QUALITY_CONC_HML"."DETALHEPRODUTOPEDIDO" T1 '+
                'INNER JOIN "QUALITY_CONC_HML"."CATEGORIAPEDIDO" T2 ON T2.IDCATEGORIAPEDIDO = T1.IDCATEGORIAPEDIDO '+
                'INNER JOIN "QUALITY_CONC_HML"."FORNECEDOR" T4 ON T4.IDFORNECEDOR = T1.IDFORNECEDOR '+
                'INNER JOIN "QUALITY_CONC_HML"."FABRICANTE" T5 ON T5.IDFABRICANTE = T1.IDFABRICANTE '+
                'INNER JOIN "QUALITY_CONC_HML"."TIPOFISCALPRODUTO" T6 ON T6.IDTIPOFISCALPRODUTO = T1.IDFONTEPRODUTOFISAL '+
                'WHERE  1=? AND' +
        		 '(T1.STMIGRADOSAP IS NULL OR T1.STMIGRADOSAP = \'False\') AND T1.STAVULSO = \'True\'  AND T1.IDDETALHEPRODUTOPEDIDO = '+parseInt(codProdAvulso);
	//return query;
	var linhas = api.sqlQuery(query,1);
	//return 'aqui';
	var lines = [];
	var session = '';
	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];
		
		var retNcm = api.sqlQuery('select top 1 "AbsEntry" AS NCM from "SBO_GTO_TESTE1".ONCM where replace("NcmCode",\'.\',\'\') = ? order by "AbsEntry" desc',det.NUNCM);
		
		var Str_Json = '{'+
		    '"ItemCode":"'+ det.IDPRODCADASTRO+'"'+
            ',"ItemName":"'+ det.DSPRODUTO+'"'+
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
            ',"ProductSource": "'+ det.CODTIPOFISCALPRODUTO+'"'+
            ',"Manufacturer": ' + det.IDSAP +
            ',"ItemsGroupCode": ' + det.IDSUBGRUPOESTRUTURA +
            ',"Mainsupplier":" ' + det.IDFORNECEDORSAP +'"'+
            ',"U_IS_EAN_GTO":"'+ det.CODBARRAS+'"'+
            ',"BarCode":"'+ det.CODBARRAS+'"'+
            ',"Series": 3 '+
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
            
       
		if(i === 0){
	    session = slApi.loginServiceLayer(true);
	    slApi.loginServiceLayer(true);
		} 
	//	return Str_Json;
       postSl(JSON.parse(Str_Json),session);
       var resultMigracao = api.sqlQuery('select "ItemCode" from "SBO_GTO_TESTE1".OITM where 1=? AND "ItemCode" = \''+ det.IDPRODCADASTRO.toString()+'\'', 1);
	   if(resultMigracao.length > 0)
	   {
	       atualizaMigracaoFornecedor(det.IDPRODCADASTRO);
	   }
	}

    return 'Migração Produto realizada com sucesso!';
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executeProduto();
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

