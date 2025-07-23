var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnAtualizaCamposNota(idSapOrigem, data){

    var conn = $.db.getConnection();
    
    var query = 'UPDATE "QUALITY_CONC_HML"."RESUMOORDEMTRANSFERENCIA" '+
    'SET IDSTATUSSEFAZ = ?, '+
    'CODIGORETORNOSEFAZ = ?, '+
    'CHAVESEFAZ = ?, '+
    'PROTOCOLOSEFAZ = ?, '+
    'MSGSEFAZ = ?,'+
    'DATAEMISSAOSEFAZ = ?,'+
    'NUMERONOTASEFAZ = ?,'+
    'IDSTATUSOT = ?'+
    'WHERE IDSAPORIGEM = ?';

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, data.IDSTATUSSEFAZ.toString());
	pStmt.setString(2, data.CODIGOERRO.toString());
	pStmt.setString(3, data.CHAVE);
	pStmt.setString(4, data.PROTOCOLO);
	pStmt.setString(5, data.MSGSEFAZ);
	pStmt.setString(6, data.DATAEMISSAO);
	pStmt.setString(7, data.NUMERONOTA);
	pStmt.setInt(8, parseInt(data.IDSTATUS));
	pStmt.setInt(9, parseInt(idSapOrigem));
	pStmt.execute();
	
	pStmt.close();
	conn.commit();

	return 'True';
}

function fnHandleGet(byId){
    
    var idSapOrigem = byId;
    var query = ' select top 1'+
                '     a."U_inStatus" as "IDSTATUS", '+
                '     a."U_cdErro" AS "CODIGOERRO", '+
                '     a."U_ChaveAcesso" AS "CHAVE", '+
               // '     a."U_ProtAut" AS "PROTOCOLO", '+
                '    coalesce(a."U_ProtAut",\'0\') AS "PROTOCOLO", '+
                '     a."U_msgSEFAZ" AS "MSGSEFAZ", '+
                '   TO_VARCHAR(a."U_CreateDate",\'YYYY-MM-DD HH24:MI:SS\') AS DATAEMISSAO, ' +
                '     substring(a."U_ChaveAcesso", 26,9) as "NUMERONOTA" '+
                ' from "SBO_GTO_TESTE1"."@SKL25NFE" a '+
                ' inner join "SBO_GTO_TESTE1"."OINV" b on b."DocEntry" = a."U_DocEntry" '+
                ' where 1=? and a."U_tipoDocumento" = \'NS\' '+
                '     AND b."DocNum" = '+idSapOrigem + ' order by a."Code" desc';
                
    
    var response = api.sqlQuery(query,1);
    var data = [];
    
    for(var i = 0; i < response.length; i++) {
        var registro = response[i];

		var nfeSaida = {
				"IDSTATUSSEFAZ": registro.IDSTATUS,
				"CODIGOERRO": registro.CODIGOERRO,
				"CHAVE": registro.CHAVE,
				"PROTOCOLO": registro.PROTOCOLO,
				"MSGSEFAZ": registro.MSGSEFAZ,
				"DATAEMISSAO": registro.DATAEMISSAO,
				"NUMERONOTA": registro.NUMERONOTA,
				"IDSTATUS": 8
			
		};
		data.push(nfeSaida);
        fnAtualizaCamposNota(byId,data[0]);
		

	}



	return data;
}


if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            	case $.net.http.GET:
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
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