var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    var query = ' SELECT ' + 
    '   tbrv.IDVOUCHER,' +
    '   tbrv.IDEMPRESAORIGEM,' +
    '   tbrv.IDCAIXAORIGEM,' +
    '   tbrv.IDNFEDEVOLUCAO,' +
    '   tbrv.DTINVOUCHER,' +
    '   tbrv.IDUSRINVOUCHER,' +
    '   tbrv.IDVENDEDOR,' +
    '   tbrv.IDCLIENTE,' +
    '   tbrv.VRVOUCHER,' +
    '   tbrv.IDEMPRESADESTINO,' +
    '   tbrv.IDCAIXADESTINO,' +
    '   tbrv.IDNFESAIDA,' +
    '   tbrv.DTOUTVOUCHER,' +
    '   tbrv.NUVOUCHER,' +
    '   tbrv.IDUSROUTVOUCHER,' +
    '   tbrv.STATIVO,' +
    '   tbrv.STCANCELADO,' +
    '   tbrv.DSMOTIVOCANCELAMENTO,' +
    '   tbrv.IDUSRCANCELAMENTO,' +
    '   tbrv.IDRESUMOVENDAWEB,' +
    '   tbc.NUCPFCNPJ AS NUCPFCNPJ_CLIENTE,' +
    '   tbc.DSNOMERAZAOSOCIAL AS DSNOMERAZAOSOCIAL_CLIENTE' +
    ' FROM ' + 
    '   "VAR_DB_NAME".RESUMOVOUCHER tbrv' +
    '   INNER JOIN "VAR_DB_NAME".CLIENTE tbc on tbc.IDCLIENTE = tbrv.IDCLIENTE ' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbrv.IDVOUCHER = \'' + byId + '\' ';
    }
    if(numeroVoucher){
        query = query + ' And  tbrv.NUVOUCHER = \'' + numeroVoucher + '\' ';
    }
    
    query = query + 'AND tbrv.STATIVO = \'True\'';
 
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMOVOUCHER" SET ' + 
        ' "IDEMPRESAORIGEM" = ?, ' +
        ' "IDCAIXAORIGEM" = ?, ' +
        ' "IDNFEDEVOLUCAO" = ?, ' +
        ' "DTINVOUCHER" = ?, ' +
        ' "IDUSRINVOUCHER" = ?, ' +
        ' "IDVENDEDOR" = ?, ' +
        ' "IDCLIENTE" = ?, ' +
        ' "VRVOUCHER" = ?, ' +
        ' "IDEMPRESADESTINO" = ?, ' +
        ' "IDCAIXADESTINO" = ?, ' +
        ' "IDNFESAIDA" = ?, ' +
        ' "DTOUTVOUCHER" = ?, ' +
        ' "NUVOUCHER" = ?, ' +
        ' "IDUSROUTVOUCHER" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "STCANCELADO" = ?, ' +
        ' "DSMOTIVOCANCELAMENTO" = ?, ' +
        ' "IDUSRCANCELAMENTO" = ?, ' +
        ' "IDRESUMOVENDAWEB" = ? ' +
    	' WHERE "IDVOUCHER" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDEMPRESAORIGEM);
        pStmt.setInt(2, registro.IDCAIXAORIGEM);
        pStmt.setInt(3, registro.IDNFEDEVOLUCAO);
        pStmt.setDate(4, registro.DTINVOUCHER);
        pStmt.setInt(5, registro.IDUSRINVOUCHER);
        pStmt.setInt(6, registro.IDVENDEDOR);
        pStmt.setInt(7, registro.IDCLIENTE);
        pStmt.setFloat(8, registro.VRVOUCHER);
        pStmt.setInt(9, registro.IDEMPRESADESTINO);
        pStmt.setInt(10, registro.IDCAIXADESTINO);
        pStmt.setString(11, registro.IDNFESAIDA);
        pStmt.setDate(12, registro.DTOUTVOUCHER);
        pStmt.setString(13, registro.NUVOUCHER);
        pStmt.setInt(14, registro.IDUSROUTVOUCHER);
        pStmt.setString(15, registro.STATIVO);
        pStmt.setString(16, registro.STCANCELADO);
        pStmt.setString(17, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setInt(18, registro.IDUSRCANCELAMENTO);
        pStmt.setString(19, registro.IDRESUMOVENDAWEB);
    	pStmt.setInt(20, registro.IDVOUCHER);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMOVOUCHER" ' +
		" ( " +
		' "IDVOUCHER", ' +
        ' "IDEMPRESAORIGEM", ' +
        ' "IDCAIXAORIGEM", ' +
        ' "IDNFEDEVOLUCAO", ' +
        ' "DTINVOUCHER", ' +
        ' "IDUSRINVOUCHER", ' +
        ' "IDVENDEDOR", ' +
        ' "IDCLIENTE", ' +
        ' "VRVOUCHER", ' +
        ' "IDEMPRESADESTINO", ' +
        ' "IDCAIXADESTINO", ' +
        ' "IDNFESAIDA", ' +
        ' "DTOUTVOUCHER", ' +
        ' "NUVOUCHER", ' +
        ' "IDUSROUTVOUCHER", ' +
        ' "STATIVO", ' +
        ' "STCANCELADO", ' +
        ' "DSMOTIVOCANCELAMENTO", ' +
        ' "IDUSRCANCELAMENTO", ' +
        ' "IDRESUMOVENDAWEB" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_RESUMOVOUCHER.NEXTVAL,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDEMPRESAORIGEM);
        pStmt.setInt(2, registro.IDCAIXAORIGEM);
        pStmt.setInt(3, registro.IDNFEDEVOLUCAO);
        pStmt.setDate(4, registro.DTINVOUCHER);
        pStmt.setInt(5, registro.IDUSRINVOUCHER);
        pStmt.setInt(6, registro.IDVENDEDOR);
        pStmt.setInt(7, registro.IDCLIENTE);
        pStmt.setFloat(8, registro.VRVOUCHER);
        pStmt.setInt(9, registro.IDEMPRESADESTINO);
        pStmt.setInt(10, registro.IDCAIXADESTINO);
        pStmt.setString(11, registro.IDNFESAIDA);
        pStmt.setDate(12, registro.DTOUTVOUCHER);
        pStmt.setString(13, registro.NUVOUCHER);
        pStmt.setInt(14, registro.IDUSROUTVOUCHER);
        pStmt.setString(15, registro.STATIVO);
        pStmt.setString(16, registro.STCANCELADO);
        pStmt.setString(17, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setInt(18, registro.IDUSRCANCELAMENTO);
        pStmt.setString(19, registro.IDRESUMOVENDAWEB);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}