var api = $.import("quality.concentrador.api.apiResponse", "int_api");
    
function execute () {
    
    var conn = $.db.getConnection();
   
    // conn.setAutoCommit(false);

   /*var deleterProdutos = conn.prepareStatement(api.replaceDbName('DELETE FROM "VAR_DB_NAME".PRODUTO'));
    deleterProdutos.execute();*/
    var deleterPrecos = conn.prepareStatement(api.replaceDbName('DELETE FROM "VAR_DB_NAME".PRODUTO_PRECO'));
    deleterPrecos.execute();
   

   
    
   /*var queryProdutos = 
        'INSERT INTO "VAR_DB_NAME".PRODUTO ( \
            	IDPRODUTO,  IDGRUPOEMPRESARIAL, NUNCM, NUCEST, NUCST_ICMS, NUCFOP, PERC_OUT, NUCODBARRAS, \
            	DSNOME, STGRADE, UND,PRECOCUSTO, PRECOVENDA, QTDENTRADA, QTDCOMERCIALIZADA, QTDPERDA, \
            	QTDDISPONIVEL, PERCICMS, PERCISS, PERCPIS, PERCCOFINS, COD_CSOSN, PERCCSOSC, NUCST_IPI, \
            	NUCST_PIS, NUCST_COFINS, PERCIPI, DTULTALTERACAO, STPESAVEL, GRP_MATERIAIS, STATIVO, SKUVTEX, IDFORNECEDORSAP \
            ) \
            SELECT \
            	itm."ItemCode" As IDPRODUTO, \
            	itm."U_GRP_EMP" As IDGRUPOEMPRESARIAL, \
            	Replace(Replace(ncm."NcmCode",\'.\',\'\'),\'-\',\'\') As NUNCM, \
            	\'\' As NUCEST, \
            	\'\' As NUCST_ICMS, \
            	\'\' As NUCFOP, \
            	\'\' As PERC_OUT, \
            	itm."CodeBars" As NUCODBARRAS, \
            	itm."ItemName" As DSNOME, \
            	1 As STGRADE, \
            	itm."SalUnitMsr" As UND, \
            	CASE \
            		WHEN itw."AvgPrice" <> 0 THEN itw."AvgPrice" \
            		ELSE (SELECT B."Price" FROM SBO_GTO_PRD.ITM1 B WHERE B."ItemCode" = itw."ItemCode" AND  B."PriceList" = \'3\') \
            	END AS PRECOCUSTO, \
            	itm1."Price" As PRECOVENDA, \
            	itw."OnHand" As QTDENTRADA, \
            	itw."IsCommited" As QTDCOMERCIALIZADA,	 \
            	0 As QTDPERDA, \
            	itw."OnHand" - itw."IsCommited" As QTDDISPONIVEL, \
            	0.0 As PERCICMS, \
            	0.0 As PERCISS, \
            	0.0 As PERCPIS, \
            	0.0 As PERCCOFINS, \
            	\'\' As COD_CSOSN, \
            	0.0 As PERCCSOSC, \
            	\'\' As NUCST_IPI, \
            	\'\' As NUCST_PIS, \
            	\'\' As NUCST_COFINS, \
            	0.0 As PERCIPI, \
            	TO_VARCHAR((IFNULL(itm."UpdateDate",itm."CreateDate")),\'YYYY-MM-DD HH24:MI:SS\') As DTULTALTERACAO, \
            	0 As STPESAVEL, \
            	itm."MatGrp" As GRP_MATERIAIS, \
            	CASE itm."validFor" WHEN \'Y\' THEN \'True\' ELSE \'False\' end As STATIVO, \
            	itm."U_AS_SKUVTEX" As SKUVTEX, \
            	itm."CardCode" As IDFORNECEDORSAP \
             FROM  \
            	SBO_GTO_PRD.OITM itm  \
            	INNER JOIN SBO_GTO_PRD.ITM1 itm1 ON itm1."ItemCode" = ITM."ItemCode"  \
            	LEFT JOIN SBO_GTO_PRD.ONCM ncm ON ncm."AbsEntry" = itm."NCMCode"  \
            	LEFT JOIN SBO_GTO_PRD.OITW itw ON itw."ItemCode" = itm."ItemCode"  \
             WHERE  \
            	itm1."PriceList" = 1 AND ITW."WhsCode" = \'001\' and itm."SellItem" = \'Y\' \
        ';*/
    
    /*var atualizadorDeProdutos = conn.prepareStatement(api.replaceDbName(queryProdutos));
    atualizadorDeProdutos.execute();*/

    // var queryDePreco = 
    //     'UPSERT "VAR_DB_NAME".PRODUTO_PRECO ( \
    //     	IDPRODUTO, IDEMPRESA, PRICE_LIST_ID, PRECO_VENDA \
    //     ) \
    //     SELECT \
    //     	i."ItemCode" as IDPRODUTO, \
    //     	o."BPLId" AS IDEMPRESA, \
    //     	i."PriceList" AS PRICE_LIST_ID, \
    //     	IFNULL(i."Price",0.0) AS PRECO_VENDA  \
    //     FROM  \
    //     	SBO_GTO_PRD.ITM1 i \
    //     	INNER JOIN SBO_GTO_PRD.OBPL o ON o."U_PriceList" = i."PriceList" ';

    /*var queryDePreco = 
        'INSERT INTO "VAR_DB_NAME".PRODUTO_PRECO ( \
        	IDPRODUTO, IDEMPRESA, PRICE_LIST_ID, PRECO_VENDA \
        ) \
        SELECT \
        	i."ItemCode" as IDPRODUTO, \
        	o."BPLId" AS IDEMPRESA, \
        	i."PriceList" AS PRICE_LIST_ID, \
        	IFNULL(i."Price",0.0) AS PRECO_VENDA  \
        FROM  \
        	SBO_GTO_PRD.ITM1 i \
        	INNER JOIN SBO_GTO_PRD.OBPL o ON o."U_PriceList" = i."PriceList" ';*/
    
    var queryDePreco =     	
        ' INSERT INTO "VAR_DB_NAME".PRODUTO_PRECO ( \
        	IDPRODUTO, IDEMPRESA, PRICE_LIST_ID, PRECO_VENDA \
        ) \
        SELECT \
        	i."ItemCode" as IDPRODUTO, \
        	o."BPLId" AS IDEMPRESA, \
        	i."PriceList" AS PRICE_LIST_ID, \
        	IFNULL(i."Price",0.0) AS PRECO_VENDA  \
        FROM  \
        	SBO_GTO_PRD.ITM1 i \
        	INNER JOIN SBO_GTO_PRD.OBPL o ON o."U_PriceList" = i."PriceList" ';
        	
    var atualizadorDePreco = conn.prepareStatement(api.replaceDbName(queryDePreco));
    atualizadorDePreco.execute();
    
    conn.commit();
    
    return true;
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.GET:
                var doc = execute();
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