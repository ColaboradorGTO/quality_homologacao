var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = ' SELECT ' + 
    '   tbrnd.IDNFDEVOLUCAOWEB,' +
    '   tbrnd.IDNFDEVOLUCAO,' +
    '   tbrnd.IDGRUPOEMPRESARIAL,' +
    '   tbrnd.IDEMPRESA,' +
    '   tbrnd.IDSESSAOCAIXA,' +
    '   tbrnd.IDCAIXA,' +
    '   tbrnd.IDOPERADOR,' +
    '   tbrnd.IDSUPERVISOR,' +
    '   tbrnd.NUNFE,' +
    '   tbrnd.NUSERIE,' +
    '   tbrnd.NUCFOP,' +
    '   tbrnd.NORAZAOSOCIAL,' +
    '   tbrnd.NUCNPJ,' +
    '   tbrnd.EENDERECO,' +
    '   tbrnd.ENUMERO,' +
    '   tbrnd.ECOMPLEMENTO,' +
    '   tbrnd.EBAIRRO,' +
    '   tbrnd.ECIDADE,' +
    '   tbrnd.SGUF,' +
    '   tbrnd.NUCEP,' +
    '   tbrnd.NUIBGE,' +
    '   tbrnd.VRTOTALNF,' +
    '   tbrnd.VRTOTALICMS,' +
    '   tbrnd.VRTOTALPIS,' +
    '   tbrnd.VRTOTALCOFINS,' +
    '   tbrnd.VRTOTALISS,' +
    '   tbrnd.VRTOTALIPI,' +
    '   tbrnd.IDCLIENTE,' +
    '   tbrnd.IDFORNECEDOR,' +
    '   tbrnd.DTEMISSAO,' +
    '   tbrnd.NURECIBONFE,' +
    '   tbrnd.NUCHAVENFCE,' +
    '   tbrnd.EEMAILFISCAL,' +
    '   tbrnd.STCONCLUIDA,' +
    '   tbrnd.STCANCELADA,' +
    '   tbrnd.DSMOTIVOCANCELAMENTO,' +
    '   tbrnd.STMIGRADA,' +
    '   tbrnd.IDRESUMODEVOLUCAOWEB,' +
    '   tbrnd.DTMIGRACAO,' +
    '   tbrnd.STGERACREDITO,' +
    '   tbrnd.IDVOUCHER,' +
    '   tbrnd.VERSAO' +
    ' FROM ' + 
    '   "VAR_DB_NAME".RESUMONFDEVOLUCAO tbrnd' +
    ' WHERE ' +
        '	1 = ?';
    
    if ( byId ) {
        query = query + ' And  tbrnd.IDNFDEVOLUCAOWEB = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."RESUMONFDEVOLUCAO" SET ' + 
        ' "IDNFDEVOLUCAO" = ?, ' + 
        ' "IDGRUPOEMPRESARIAL" = ?, ' + 
        ' "IDEMPRESA" = ?, ' + 
        ' "IDSESSAOCAIXA" = ?, ' + 
        ' "IDCAIXA" = ?, ' + 
        ' "IDOPERADOR" = ?, ' + 
        ' "IDSUPERVISOR" = ?, ' + 
        ' "NUNFE" = ?, ' + 
        ' "NUSERIE" = ?, ' + 
        ' "NUCFOP" = ?, ' + 
        ' "NORAZAOSOCIAL" = ?, ' + 
        ' "NUCNPJ" = ?, ' + 
        ' "EENDERECO" = ?, ' + 
        ' "ENUMERO" = ?, ' + 
        ' "ECOMPLEMENTO" = ?, ' + 
        ' "EBAIRRO" = ?, ' + 
        ' "ECIDADE" = ?, ' + 
        ' "SGUF" = ?, ' + 
        ' "NUCEP" = ?, ' + 
        ' "NUIBGE" = ?, ' + 
        ' "VRTOTALNF" = ?, ' + 
        ' "VRTOTALICMS" = ?, ' + 
        ' "VRTOTALPIS" = ?, ' + 
        ' "VRTOTALCOFINS" = ?, ' + 
        ' "VRTOTALISS" = ?, ' + 
        ' "VRTOTALIPI" = ?, ' + 
        ' "IDCLIENTE" = ?, ' + 
        ' "IDFORNECEDOR" = ?, ' + 
        ' "DTEMISSAO" = ?, ' + 
        ' "NURECIBONFE" = ?, ' + 
        ' "NUCHAVENFCE" = ?, ' + 
        ' "EEMAILFISCAL" = ?, ' + 
        ' "STCONCLUIDA" = ?, ' + 
        ' "STCANCELADA" = ?, ' + 
        ' "DSMOTIVOCANCELAMENTO" = ?, ' + 
        ' "STMIGRADA" = ?, ' + 
        ' "IDRESUMODEVOLUCAOWEB" = ?, ' + 
        ' "DTMIGRACAO" = ?, ' + 
        ' "STGERACREDITO" = ?, ' + 
        ' "IDVOUCHER" = ?, ' + 
        ' "VERSAO" = ? ' + 
    	' WHERE "IDNFDEVOLUCAOWEB" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.IDNFDEVOLUCAO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDSESSAOCAIXA);
        pStmt.setInt(5, registro.IDCAIXA);
        pStmt.setInt(6, registro.IDOPERADOR);
        pStmt.setInt(7, registro.IDSUPERVISOR);
        pStmt.setInt(8, registro.NUNFE);
        pStmt.setInt(9, registro.NUSERIE);
        pStmt.setInt(10, registro.NUCFOP);
        pStmt.setString(11, registro.NORAZAOSOCIAL);
        pStmt.setString(12, registro.NUCNPJ);
        pStmt.setString(13, registro.EENDERECO);
        pStmt.setString(14, registro.ENUMERO);
        pStmt.setString(15, registro.ECOMPLEMENTO);
        pStmt.setString(16, registro.EBAIRRO);
        pStmt.setString(17, registro.ECIDADE);
        pStmt.setString(18, registro.SGUF);
        pStmt.setString(19, registro.NUCEP);
        pStmt.setInt(20, registro.NUIBGE);
        pStmt.setFloat(21, registro.VRTOTALNF);
        pStmt.setFloat(22, registro.VRTOTALICMS);
        pStmt.setFloat(23, registro.VRTOTALPIS);
        pStmt.setFloat(24, registro.VRTOTALCOFINS);
        pStmt.setFloat(25, registro.VRTOTALISS);
        pStmt.setFloat(26, registro.VRTOTALIPI);
        pStmt.setInt(27, registro.IDCLIENTE);
        pStmt.setInt(28, registro.IDFORNECEDOR);
        pStmt.setDate(29, registro.DTEMISSAO);
        pStmt.setString(30, registro.NURECIBONFE);
        pStmt.setString(31, registro.NUCHAVENFCE);
        pStmt.setString(32, registro.EEMAILFISCAL);
        pStmt.setString(33, registro.STCONCLUIDA);
        pStmt.setString(34, registro.STCANCELADA);
        pStmt.setString(35, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setString(36, registro.STMIGRADA);
        pStmt.setInt(37, registro.IDRESUMODEVOLUCAOWEB);
        pStmt.setDate(38, registro.DTMIGRACAO);
        pStmt.setString(39, registro.STGERACREDITO);
        pStmt.setInt(40, registro.IDVOUCHER);
        pStmt.setString(41, registro.VERSAO);
    	pStmt.setInt(42, registro.IDNFDEVOLUCAOWEB);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."RESUMONFDEVOLUCAO" ' +
		" ( " +
		' "IDNFDEVOLUCAOWEB", ' +
        ' "IDNFDEVOLUCAO", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDEMPRESA", ' +
        ' "IDSESSAOCAIXA", ' +
        ' "IDCAIXA", ' +
        ' "IDOPERADOR", ' +
        ' "IDSUPERVISOR", ' +
        ' "NUNFE", ' +
        ' "NUSERIE", ' +
        ' "NUCFOP", ' +
        ' "NORAZAOSOCIAL", ' +
        ' "NUCNPJ", ' +
        ' "EENDERECO", ' +
        ' "ENUMERO", ' +
        ' "ECOMPLEMENTO", ' +
        ' "EBAIRRO", ' +
        ' "ECIDADE", ' +
        ' "SGUF", ' +
        ' "NUCEP", ' +
        ' "NUIBGE", ' +
        ' "VRTOTALNF", ' +
        ' "VRTOTALICMS", ' +
        ' "VRTOTALPIS", ' +
        ' "VRTOTALCOFINS", ' +
        ' "VRTOTALISS", ' +
        ' "VRTOTALIPI", ' +
        ' "IDCLIENTE", ' +
        ' "IDFORNECEDOR", ' +
        ' "DTEMISSAO", ' +
        ' "NURECIBONFE", ' +
        ' "NUCHAVENFCE", ' +
        ' "EEMAILFISCAL", ' +
        ' "STCONCLUIDA", ' +
        ' "STCANCELADA", ' +
        ' "DSMOTIVOCANCELAMENTO", ' +
        ' "STMIGRADA", ' +
        ' "IDRESUMODEVOLUCAOWEB", ' +
        ' "DTMIGRACAO", ' +
        ' "STGERACREDITO", ' +
        ' "IDVOUCHER", ' +
        ' "VERSAO" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_RESUMONFDEVOLUCAO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.IDNFDEVOLUCAO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDEMPRESA);
        pStmt.setInt(4, registro.IDSESSAOCAIXA);
        pStmt.setInt(5, registro.IDCAIXA);
        pStmt.setInt(6, registro.IDOPERADOR);
        pStmt.setInt(7, registro.IDSUPERVISOR);
        pStmt.setInt(8, registro.NUNFE);
        pStmt.setInt(9, registro.NUSERIE);
        pStmt.setInt(10, registro.NUCFOP);
        pStmt.setString(11, registro.NORAZAOSOCIAL);
        pStmt.setString(12, registro.NUCNPJ);
        pStmt.setString(13, registro.EENDERECO);
        pStmt.setString(14, registro.ENUMERO);
        pStmt.setString(15, registro.ECOMPLEMENTO);
        pStmt.setString(16, registro.EBAIRRO);
        pStmt.setString(17, registro.ECIDADE);
        pStmt.setString(18, registro.SGUF);
        pStmt.setString(19, registro.NUCEP);
        pStmt.setInt(20, registro.NUIBGE);
        pStmt.setFloat(21, registro.VRTOTALNF);
        pStmt.setFloat(22, registro.VRTOTALICMS);
        pStmt.setFloat(23, registro.VRTOTALPIS);
        pStmt.setFloat(24, registro.VRTOTALCOFINS);
        pStmt.setFloat(25, registro.VRTOTALISS);
        pStmt.setFloat(26, registro.VRTOTALIPI);
        pStmt.setInt(27, registro.IDCLIENTE);
        pStmt.setInt(28, registro.IDFORNECEDOR);
        pStmt.setDate(29, registro.DTEMISSAO);
        pStmt.setString(30, registro.NURECIBONFE);
        pStmt.setString(31, registro.NUCHAVENFCE);
        pStmt.setString(32, registro.EEMAILFISCAL);
        pStmt.setString(33, registro.STCONCLUIDA);
        pStmt.setString(34, registro.STCANCELADA);
        pStmt.setString(35, registro.DSMOTIVOCANCELAMENTO);
        pStmt.setString(36, registro.STMIGRADA);
        pStmt.setInt(37, registro.IDRESUMODEVOLUCAOWEB);
        pStmt.setDate(38, registro.DTMIGRACAO);
        pStmt.setString(39, registro.STGERACREDITO);
        pStmt.setInt(40, registro.IDVOUCHER);
        pStmt.setString(41, registro.VERSAO);
    	
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