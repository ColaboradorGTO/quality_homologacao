var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {

	var query = ' SELECT distinct * FROM ( ' +
	' 	SELECT  ' +
	' 		vc.IDEMPRESA, ' +
	' 		vc.IDCAIXA , ' +
	' 		vc.IDVENDA, ' +
	' 		vc.STCANCELADO, ' +
	' 		TO_NVARCHAR(vc.DTHORAFECHAMENTO,\'YYYY-MM-DD\') AS DTHORAFECHAMENTO, ' +
	' 		vc.NFE_INFNFE_TOTAL_ICMSTOT_VNF, ' +
	' 		SUm(vc.VALORPAGO) AS ValorPagamento, ' +
	' 		vc.VALORCONVENIO, ' +
	' 		vc.VRRECCONVENIO, ' +
	'		vc.VRRECDINHEIRO, ' +
	'	    vc.VRRECCARTAO, ' +
	'	    vc.VRRECPOS ' +
	' 	FROM QUALITY_CONC_HML.VW_VENDAS vc ' +
	' 	WHERE ' +
	' 		vc.DTHORAFECHAMENTO  >= \'2021-01-01\' ' +
	' 	GROUP BY  ' +
	' 		vc.IDEMPRESA, ' +
	' 		vc.IDCAIXA , ' +
	' 		vc.STCANCELADO, ' +
	' 		TO_NVARCHAR(vc.DTHORAFECHAMENTO,\'YYYY-MM-DD\') , ' +
	' 		vc.IDVENDA , ' +
	' 		vc.NFE_INFNFE_TOTAL_ICMSTOT_VNF, ' +
	' 		vc.VALORCONVENIO, ' +
	' 		vc.VRRECCONVENIO, ' +
    '       vc.VRRECDINHEIRO, ' +
    '       vc.VRRECCARTAO, ' +
    '       vc.VRRECPOS ' +
	' 	ORDER BY  ' +
	' 		vc.IDVENDA   ' +
	' ) AS a ' +
	' WHERE ' +
	'	1 = ? and 	Round(Abs(ValorPagamento - NFE_INFNFE_TOTAL_ICMSTOT_VNF), 2) > 0.01 and STCANCELADO = \'False\' and (nfe_infnfe_total_icmstot_vnf = vrrecconvenio) and VALORCONVENIO=0 ' ;

	var query2 = 'SELECT   ' + 
                '    IDVENDA,   ' +
                '    VRRECCONVENIO '+
                'FROM   ' + 
                '    QUALITY_CONC_HML.VW_VENDAS   ' + 
                'WHERE   ' + 
                '    1 = ? and VALORPAGO = 0   ' + 
                '    AND VRRECCONVENIO > 0   ' +
                '    AND DTHORAFECHAMENTO BETWEEN \'2021-01-01 00:00:00\' AND \'2021-05-05 23:59:00\'  AND STCANCELADO = \'False\'   ' +
                '    GROUP BY IDVENDA,VRRECCONVENIO    ' +
                '    ORDER BY IDVENDA';

	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	var response = api.sqlQueryPage(query2, request, 1);
	var data = [];

	for (var i = 0; i < response.data.length; i++) {

		var registro = response.data[i];

		/*var venda = {
			
				"IDVENDA": registro.IDVENDA,
				"IDCAIXAWEB": registro.IDCAIXA,
				"IDEMPRESA": registro.IDEMPRESA,
				"STCANCELADO": registro.STCANCELADO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"NFE_INFNFE_TOTAL_ICMSTOT_VNF": registro.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
				"VRPAGAMENTO": registro.ValorPagamento,
				"VALORCONVENIO": registro.VALORCONVENIO,
				"VRRECCONVENIO": registro.VRRECCONVENIO,
				"VRRECDINHEIRO": registro.VRRECDINHEIRO,
	            "VRRECCARTAO": registro.VRRECCARTAO,
	            "VRRECPOS": registro.VRRECPOS
			
		};*/
		
		var venda = {
			
				"IDVENDA": registro.IDVENDA,
				"VRRECCONVENIO": registro.VRRECCONVENIO
			
			
		};

		data.push(venda);

	}

	response.data = data;

	return response;
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."VENDAPAGAMENTO" ' +
		" ( " +
		' "IDVENDAPAGAMENTO", ' +
		' "IDVENDA", ' +
		' "NITEM", ' +
		' "TPAG", ' +
		' "DSTIPOPAGAMENTO", ' +
		' "VALORRECEBIDO", ' +
		' "VALORDEDUZIDO", ' +
		' "VALORLIQUIDO", ' +
		' "DTPROCESSAMENTO", ' +
		' "DTVENCIMENTO", ' +
		' "NPARCELAS", ' +
		' "NOTEF", ' +
		' "NOAUTORIZADOR", ' +
		' "NOCARTAO", ' +
		' "NUOPERACAO", ' +
		' "NSUTEF", ' +
		' "NSUAUTORIZADORA", ' +
		' "NUAUTORIZACAO", ' +
		' "STCANCELADO" ' +
		' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	
        
		var registro = bodyJson;
		
		pStmt.setString(1, registro.IDVENDAPAGAMENTO);
		pStmt.setString(2, registro.IDVENDA);
		pStmt.setInt(3, registro.NITEM);
		pStmt.setString(4, registro.TPAG);
		pStmt.setString(5, registro.DSTIPOPAGAMENTO);
		pStmt.setString(6, registro.VALORRECEBIDO);
		
		pStmt.setFloat(7, registro.VALORDEDUZIDO||0.0);
		pStmt.setFloat(8, registro.VALORLIQUIDO||0.0);
		setTimestampOrNull(pStmt, 9, registro.DTPROCESSAMENTO);
		setTimestampOrNull(pStmt, 10, registro.DTVENCIMENTO);
		setIntOrNull(pStmt, 11, registro.NPARCELAS);
		pStmt.setString(12, registro.NOTEF);
		pStmt.setString(13, registro.NOAUTORIZADOR);
		pStmt.setString(14, registro.NOCARTAO);
		pStmt.setString(15, registro.NUOPERACAO);
		pStmt.setString(16, registro.NSUTEF);
		pStmt.setString(17, registro.NSUAUTORIZADORA);
		pStmt.setString(18, registro.NUAUTORIZACAO);
		pStmt.setString(19, registro.STCANCELADO);
    	
        pStmt.execute();
	

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}
$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
		
			
	
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}