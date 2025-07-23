var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idDoresumo = $.request.parameters.get("idresumo");
    var Coletor = $.request.parameters.get("coletor");
    var IdFilial = $.request.parameters.get("idfilial");

    var query = ' SELECT ' +
        ' tbdetb.IDRESUMOBALANCO, '+
        ' tbe.NOFANTASIA, '+
        ' tbe.WAREHOUSECODE,'+
        ' tbdetb.IDPRODUTO, '+
        ' tbdetb.CODIGODEBARRAS AS NUCODBARRAS, '+
        ' tbdetb.DSPRODUTO AS DSNOME, '+
        ' IFNULL (SUM(tbdetb.TOTALCONTAGEMGERAL),0) AS TOTALCONTAGEMGERAL, '+
        ' tbdetb.IDDETALHEBALANCO, tbdetb.NUMEROCOLETOR, tbdetb.DSCOLETOR,'+
        ' tbres.STCONSOLIDADO ' +
        ' ,IFNULL(tbdetb.PRECOVENDA, 0) As PRECOVENDA ' +
        ' ,IFNULL(tbdetb.PRECOCUSTO, 0) As PRECOCUSTO ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEBALANCO tbdetb ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOBALANCO tbres ON tbdetb.IDRESUMOBALANCO = tbres.IDRESUMOBALANCO' +
        '   INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON tbe.IDEMPRESA = tbres.IDEMPRESA' +
        ' WHERE ' +
        '	1 = ?';

    if(idDoresumo) {
        query = query + ' AND tbdetb.IDRESUMOBALANCO = \'' + idDoresumo + '\' ';
    }
    if(Coletor) {
        query = query + ' AND tbdetb.NUMEROCOLETOR = \'' + Coletor + '\' ';
    }
    if(IdFilial) {
        query = query + ' AND tbe.IDEMPRESA = \'' + IdFilial + '\' AND STCONCLUIDO = \'False\' ';
    }
    query = query + ' AND tbdetb.STCANCELADO = \'False\' ';
    query = query + ' GROUP BY tbdetb.IDPRODUTO, tbdetb.CODIGODEBARRAS, tbdetb.DSPRODUTO, tbe.WAREHOUSECODE, tbe.NOFANTASIA, tbdetb.IDRESUMOBALANCO, tbdetb.IDDETALHEBALANCO, tbdetb.NUMEROCOLETOR, tbdetb.DSCOLETOR, tbres.STCONSOLIDADO, tbdetb.PRECOVENDA, tbdetb.PRECOCUSTO ';
    //throw query;
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {

    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEBALANCO" SET "TOTALCONTAGEMGERAL" = ? ' + 
    	' WHERE "IDDETALHEBALANCO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.TOTALCONTAGEMGERAL);
        pStmt.setInt(2, registro.IDDETALHEBALANCO);
                    
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
        /*case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;*/            

        default:
            break;
    }
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}