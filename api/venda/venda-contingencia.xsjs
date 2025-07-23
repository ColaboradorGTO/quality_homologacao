var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataFechamento = $.request.parameters.get("dataFechamento");
    var dataLimite = $.request.parameters.get("dataLimite");    
    
    var chaveNfe = $.request.parameters.get("chaveNfe");

    var query = ' SELECT ' +
		'   tbv.IDVENDA,' +
		'   tbv.IDCAIXAWEB,' +
		'   tbv.IDOPERADOR,' +
		'   tbv.IDEMPRESA,' +
		'   TO_VARCHAR(tbv.DTHORAABERTURA,\'YYYY-MM-DD HH24:MI:SS\') AS DTHORAABERTURA, ' +
		'   tbv.VRRECDINHEIRO,' +
		'   tbv.VRRECCARTAO,' +
		'   tbv.VRRECCONVENIO,' +
		'   tbv.VRRECCHEQUE,' +
		'   tbv.VRRECPOS,' +
		'   tbv.VRRECVOUCHER,' +
		'   tbv.VRTOTALPAGO,' +
		'   tbv.VRTROCO,' +
		'   TO_VARCHAR(tbv.DTHORAFECHAMENTO,\'YYYY-mm-DD HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
		'   tbv.STATIVO,' +
		'   tbv.STCANCELADO,' +
		'   tbv.STCONTINGENCIA,' +
		'   tbv.DTENVIOONTINGENCIA,' +
		'   tbv.NFE_INFNFE_IDE_SERIE,'+
		'   tbv.NFE_INFNFE_IDE_NNF,'+
		'   tbv.PROTNFE_INFPROT_CHNFE '+
		' FROM ' +
		'   "VAR_DB_NAME".VENDA tbv' +
		' WHERE ' +
		'	1 = ? ';
    
	if (byId) {
		query = query + ' And  tbv.IDVENDA = \'' + byId + '\' ';
	}
	
	 if(idEmpresa) {
        query = query + 'and tbv.STCANCELADO=\'False\' and tbv.STCONTINGENCIA=\'True\' AND tbv.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(chaveNfe) {
        query = query + ' AND tbv.PROTNFE_INFPROT_CHNFE = \'' + chaveNfe + '\' ';
    }
    
    if(dataFechamento) {
        //query = query + ' AND tbv.DTHORAFECHAMENTO >= \'' + dataFechamento + '\' and tbv.DTHORAFECHAMENTO < \''+dataLimite+'\' ';
        query = query + ' AND tbv.DTHORAFECHAMENTO BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataLimite +' 23:59:59\' ';
    }

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var venda = {
				"IDVENDA": registro.IDVENDA,
				"IDCAIXAWEB": registro.IDCAIXAWEB,
				"IDOPERADOR": registro.IDOPERADOR,
				"IDEMPRESA": registro.IDEMPRESA,
				"DTHORAABERTURA": registro.DTHORAABERTURA,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
				"VRRECCARTAO": registro.VRRECCARTAO,
				"VRRECCONVENIO": registro.VRRECCONVENIO,
				"VRRECCHEQUE": registro.VRRECCHEQUE,
				"VRRECPOS": registro.VRRECPOS,
				"VRRECVOUCHER": registro.VRRECVOUCHER,
				"VRTOTALPAGO": registro.VRTOTALPAGO,
				"VRTROCO": registro.VRTROCO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"STATIVO": registro.STATIVO,
				"STCANCELADO": registro.STCANCELADO,
				"STCONTINGENCIA": registro.STCONTINGENCIA,
				"DTENVIOONTINGENCIA": registro.DTENVIOONTINGENCIA,
				"SERIE": registro.NFE_INFNFE_IDE_SERIE,
				"NNF": registro.NFE_INFNFE_IDE_NNF,
		        "PROTNFE_INFPROT_CHNFE": registro.PROTNFE_INFPROT_CHNFE
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}

function fnHandlePut(){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."VENDA" SET ' + 
        
		' "STCONTINGENCIA" = \'False\', ' +
		' "DTENVIOONTINGENCIA" = now(), ' +
		' "DTULTALTERACAO" = now(), ' +
		
		' "NFE_INFNFESUPL_QRCODE" = ?, ' +
		' "NFE_INFNFESUPL_URLCHAVE" = ?, ' +
		' "PROTNFE_VERSAO" = ?, ' +
		' "PROTNFE_INFPROT_ID" = ?, ' +
		
		' "PROTNFE_INFPROT_TPAMB" = ?, ' +
		' "PROTNFE_INFPROT_VERAPLIC" = ?, ' +
		' "PROTNFE_INFPROT_CHNFE" = ?, ' +
		
		' "PROTNFE_INFPROT_DHRECBTO" = ?, ' +
		' "PROTNFE_INFPROT_NPROT" = ?, ' +
		
		' "PROTNFE_INFPROT_DIGVAL" = ?, ' +
		' "PROTNFE_INFPROT_CSTAT" = ?, ' +
		' "PROTNFE_INFPROT_XMOTIVO" = ?, ' +
		' "NFE_INFNFE_IDE_MOD" = 55, ' +
		' "NFE_INFNFE_TOTAL_ICMSTOT_VBC" = ?, ' +
		' "NFE_INFNFE_TOTAL_ICMSTOT_VICMS" = ? ' +
		
		' WHERE "IDVENDA" =  ? ';
    	
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
        
			pStmt.setString(1, registro.NFE_INFNFESUPL_QRCODE);
			pStmt.setString(2, registro.NFE_INFNFESUPL_URLCHAVE);

			pStmt.setString(3, registro.PROTNFE_VERSAO);
			pStmt.setString(4, registro.PROTNFE_INFPROT_ID);
			pStmt.setString(5, registro.PROTNFE_INFPROT_TPAMB);
			pStmt.setString(6, registro.PROTNFE_INFPROT_VERAPLIC);
			pStmt.setString(7, registro.PROTNFE_INFPROT_CHNFE);
			pStmt.setString(8, registro.PROTNFE_INFPROT_DHRECBTO);
			pStmt.setString(9, registro.PROTNFE_INFPROT_NPROT);
			pStmt.setString(10, registro.PROTNFE_INFPROT_DIGVAL);
			pStmt.setString(11, registro.PROTNFE_INFPROT_CSTAT);
			pStmt.setString(12, registro.PROTNFE_INFPROT_XMOTIVO);
			pStmt.setFloat(13, registro.NFE_INFNFE_TOTAL_ICMSTOT_VBC);
			pStmt.setFloat(14, registro.NFE_INFNFE_TOTAL_ICMSTOT_VICMS);
			
			
			
			pStmt.setString(15, registro.IDVENDA);
                    
    	pStmt.execute();
    	
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização contingência realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
	    
	    //Handle your GET calls here
	    //Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;


		//Handle your PUt calls here
	    case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}