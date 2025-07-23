var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet() {
    
    var cpfParam = $.request.parameters.get("cpf");
    
    if(!cpfParam) {
        throw "CPF é um parametro obrigatório"
    }

	var query = ' SELECT \
        	a.*,\
        	 "LimiteCredito" - a."ComprasNoPeriodo" + a."Bonus" AS "Disponivel"  \
        FROM (\
        	SELECT \
        	    o."empID",\
        		TRIM(REPLACE(REPLACE(REPLACE(o.CPF,\'.\',\'\'),\'-\',\'\'),\'/\',\'\')) AS CPF,\
        		(Replace(IFNULL("firstName",\'\') || \' \' || IFNULL("middleName",\'\') || \' \' || IFNULL("lastName",\'\'), \'  \', \' \')) AS "Nome",\
        		"salary" * ("U_Perc_Limite_Credito"/100) AS "LimiteCredito",\
        		"U_Perc_Desconto" AS "PercDesconto",			\
        			(\
        				SELECT IFNULL( SUM(v.VALORRECEBIDO),0)\
        				FROM \
        					QUALITY_CONC_HML.VENDAPAGAMENTO v \
        					INNER JOIN QUALITY_CONC_HML.VENDA v2 ON v.IDVENDA = v2.IDVENDA \
        				WHERE \
        					TRIM(REPLACE(REPLACE(REPLACE(v.cpf,\'.\',\'\'),\'-\',\'\'),\'/\',\'\')) = \
        					TRIM(REPLACE(REPLACE(REPLACE(o.CPF,\'.\',\'\'),\'-\',\'\'),\'/\',\'\'))\
        					AND v2.STCANCELADO = \'False\' \
        					AND v2.NFE_INFNFE_IDE_DHEMI BETWEEN\
        						TO_DATE(YEAR (CURRENT_DATE) || \'-\' ||  MONTH (CURRENT_DATE) || \'-\' || \'01\')\
        						and \
        						LAST_DAY (TO_DATE(v2.NFE_INFNFE_IDE_DHEMI))  \
        			) AS "ComprasNoPeriodo", \
        			(\
                		SELECT \
                			IFNULL(SUM(cfd."U_Tx_Valor_Bonus"),0.0) \
                		FROM \
                			SBO_GTO_PRD."@COL_FUN_DETALHE" CFD\
                			INNER JOIN SBO_GTO_PRD."@COL_BONUS" cb ON cfd."Code" = cb."Code" \
                		WHERE \
                			CFD."Code"  = o."empID" \
                	) AS "Bonus"\
        	FROM \
        		SBO_GTO_PRD.OHEM o \
        	WHERE\
        		o."U_Tx_Parceiro" = \'S\' \
        ) AS a\
        WHERE \
        	a.CPF = ?';
        	
    //return query;

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, cpfParam);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
		    fnHandleGet();
		  //  $.response.setBody(JSON.stringify(fnHandleGet()));
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.toString()
	}));
	$.response.status = 400;
}