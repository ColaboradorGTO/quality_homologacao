var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterProduto(idVoucher) {

	var query = ' SELECT ' +
		'   tbdv.IDPRODUTO ' +
    	' FROM ' +
        '	"VAR_DB_NAME".DETALHEVOUCHER tbdv' +
        ' WHERE ' +
        '	tbdv.IDVOUCHER = ?';
        
        

	var linhas = api.sqlQuery(query, idVoucher);
	var lines = [];
	for (var i = 0; i < linhas.length; i++) {
		var registro = linhas[i];

		var docLine = {
			"IDPRODUTO": registro.IDPRODUTO
		};

		lines.push(docLine);
	}

	return lines;
}

function fnHandleGet(byId) {
    
    var quantidadeProduto = $.request.parameters.get("quantidade");
    var query = 'SELECT '+
    '   TO_VARCHAR(vw1.DTINVOUCHER,\'YYYY-MM-DD\') AS DTHORAINVOUCHER, ' +
    '   vw1.IDVOUCHER, '+
    '   vw1.IDEMPRESAORIGEM, '+
    '   vw1.TOTALPRODUTOVOUCHER, '+
    '   vw1.IDPRODUTO, '+
    
	'   trv.IDCAIXAORIGEM, '+
	'   trv.IDNFEDEVOLUCAO, '+
	'   trv.IDUSRINVOUCHER, '+
	'   trv.IDVENDEDOR, '+
	'   trv.IDCLIENTE, '+
	'   trv.VRVOUCHER, '+
	'   trv.IDEMPRESADESTINO, '+
	'   trv.IDCAIXADESTINO, '+
	'   trv.IDNFESAIDA, '+
	'   trv.DTOUTVOUCHER, '+
	'   trv.NUVOUCHER, '+
	'   trv.IDUSROUTVOUCHER, '+
	'   trv.STATIVO, '+
	'   trv.STCANCELADO, '+
	'   trv.IDUSRCANCELAMENTO, '+
	'   trv.IDRESUMOVENDAWEB, '+
	'   trv.SAP_MIGRADO, '+
	'   trv.SAP_DOCENTRY, '+
	'   trv.SAP_DOCENTRY_TRANS, '+
	'   trv.NUNFE, '+
	'   trv.NUSERIE, '+
	'   trv.IDEMPRESANFVINCULADA, '+
	'   trv.IDRESUMOVENDAWEBDESTINO, '+
	
	'   tdv.IDDETALHEVOUCHER, '+
	'   tdv.QTD, '+
	'   tdv.VRUNIT, '+
	'   tdv.VRTOTALBRUTO, '+
	'   tdv.VRDESCONTO, '+
	'   tdv.VRTOTALLIQUIDO '+
	
	
    ' FROM "QUALITY_CONC_HML"."VW_VOUCHER_PRODUTOS_EMPRESA_QTD" vw1 '+
    ' inner join QUALITY_CONC_HML.resumovoucher trv on vw1.idvoucher = trv.idvoucher '+
    ' inner join QUALITY_CONC_HML.detalhevoucher tdv on vw1.idvoucher = tdv.idvoucher and vw1.idproduto = tdv.idproduto '+
    ' WHERE '+
    ' 1 = ?';
    
    if(quantidadeProduto){
         query = query + ' And  vw1.TOTALPRODUTOVOUCHER = \'' + quantidadeProduto + '\' ';
    }
     query = query + ' order by  vw1.IDVOUCHER';
	
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		var voucher = {
			 
				"DTHORAINVOUCHER": registro.DTHORAINVOUCHER,
				"IDVOUCHER": registro.IDVOUCHER,
				"IDEMPRESAORIGEM": registro.IDEMPRESAORIGEM,
				"TOTALPRODUTOVOUCHER": quantidadeProduto,
				"IDPRODUTO": registro.IDPRODUTO,
				//"PRODUTOS": obterProduto(registro.IDVOUCHER)
				"IDCAIXAORIGEM": registro.IDCAIXAORIGEM,
            	"IDNFEDEVOLUCAO": registro.IDNFEDEVOLUCAO,
            	
            	"IDUSRINVOUCHER": registro.IDUSRINVOUCHER,
            	"IDVENDEDOR": registro.IDVENDEDOR,
            	"IDCLIENTE": registro.IDCLIENTE,
            	"VRVOUCHER": registro.VRVOUCHER,
            	"IDEMPRESADESTINO": registro.IDEMPRESADESTINO,
            	"IDCAIXADESTINO": registro.IDCAIXADESTINO,
            	"IDNFESAIDA": registro.IDNFESAIDA,
            	"DTOUTVOUCHER": registro.DTOUTVOUCHER,
            	"NUVOUCHER": registro.NUVOUCHER,
            	"IDUSROUTVOUCHER": registro.IDUSROUTVOUCHER,
            	"STATIVO": registro.STATIVO,
            	"STCANCELADO": registro.STCANCELADO,
            	"IDUSRCANCELAMENTO": registro.IDUSRCANCELAMENTO,
            	"IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
            	"SAP_MIGRADO": registro.SAP_MIGRADO,
            	"SAP_DOCENTRY": registro.SAP_DOCENTRY,
            	"SAP_DOCENTRY_TRANS": registro.SAP_DOCENTRY_TRANS,
            	"NUNFE": registro.NUNFE,
            	"NUSERIE": registro.NUSERIE,
            	"IDEMPRESANFVINCULADA": registro.IDEMPRESANFVINCULADA,
            	"IDRESUMOVENDAWEBDESTINO": registro.IDRESUMOVENDAWEBDESTINO,
            	"IDDETALHEVOUCHER": registro.IDDETALHEVOUCHER,
            	"QTD": registro.QTD,
            	"VRUNIT": registro.VRUNIT,
            	"VRTOTALBRUTO": registro.VRTOTALBRUTO,
            	"VRDESCONTO": registro.VRDESCONTO,
            	"VRTOTALLIQUIDO": registro.VRTOTALLIQUIDO
            	
			
		};

		data.push(voucher);

	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOVOUCHER" SET ' + 
        ' "IDRESUMOVENDAWEB" = ? ' +
        ' WHERE "IDVOUCHER" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDVENDA);
        pStmt.setInt(2, registro.IDVOUCHER);
        pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}






























