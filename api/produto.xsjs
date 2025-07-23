var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    
    if(!idEmpresa) {
        throw "O parametro IdEmpresa é um valor obrigatório.";
    }
    
    var query = ' SELECT DISTINCT' + 
    '   tbp.IDPRODUTO,' +
    '   tbp.IDGRUPOEMPRESARIAL,' +
    '   tbp.NUNCM,' +
    '   tbp.NUCEST,' +
    '   tbp.NUCST_ICMS,' +
    '   tbp.NUCFOP,' +
    '   tbp.PERC_OUT,' +
    '   tbp.NUCODBARRAS,' +
    '   tbp.DSNOME,' +
    '   tbp.STGRADE,' +
    '   tbp.UND,' +
    '   tbp.PRECOCUSTO,' +
    ///'   IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA) As PRECOVENDA,' +
    '   ( CASE WHEN IFNULL(tbpp.PRECO_VENDA, 0) = 0 THEN tbp.PRECOVENDA ELSE tbpp.PRECO_VENDA END ) As PRECOVENDA,' +
    '   tbp.QTDENTRADA,' +
    '   tbp.QTDCOMERCIALIZADA,' +
    '   tbp.QTDPERDA,' +
    '   tbp.QTDDISPONIVEL,' +
    '   (tbn.ImpEstadual * 10) AS PERCICMS, '+
    '   tbp.PERCISS,' +
    '   tbp.PERCPIS,' +
    '   tbp.PERCCOFINS,' +
    '   tbp.COD_CSOSN,' +
    '   tbp.PERCCSOSC,' +
    '   tbp.NUCST_IPI,' +
    '   tbp.NUCST_PIS,' +
    '   tbp.NUCST_COFINS,' +
    '   tbp.PERCIPI,' +
    '   TO_VARCHAR(tbp.DTULTALTERACAO,\'YYYY-MM-DD HH24:MI:SS\') AS DTULTALTERACAO, ' +
    '   tbp.STPESAVEL,' +
    '   tbp.GRP_MATERIAIS,' +
    '   (tbn.ImpEstadual * 10) AS PerICMS, '+
    '   TBPEM."GRUPO", '+
	'   TBPEM."IDSUBGRUPO", '+
	'   TBPEM."SUBGRUPO", '+
	'   TBPEM."IDMARCA", '+
	'   TBPEM."MARCA", '+
	'   TBPEM."IDRAZAO_SOCIAL_FORNECEDOR", '+
	'   TBPEM."RAZAO_SOCIAL_FORNECEDOR" '+
    ' FROM ' + 
    '   "VAR_DB_NAME".EMPRESA tbe' ;
    if(idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='51' || idEmpresa ==='86'){
        if(idEmpresa ==='31' || idEmpresa ==='109'){
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 2 ';
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 4 ';
        }else if(idEmpresa ==='51') {    
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 OR tbp.IDGRUPOEMPRESARIAL = 4 OR tbp.IDGRUPOEMPRESARIAL = 2';
        }else{
            query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 OR tbp.IDGRUPOEMPRESARIAL = 1 ';
        }
    }else{
        query = query + '   INNER JOIN "VAR_DB_NAME".PRODUTO tbp on tbe.IDGRUPOEMPRESARIAL = tbp.IDGRUPOEMPRESARIAL OR tbp.IDGRUPOEMPRESARIAL IS NULL OR tbp.IDGRUPOEMPRESARIAL = 0 ';
    }
    query = query  +
    '   INNER JOIN "VAR_DB_NAME".NCM tbn on tbp.NUNCM = tbn.NUNCM AND tbe.SGUF = tbn.SGUF ' +
    '   LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO tbpp on tbpp.IDPRODUTO = tbp.IDPRODUTO AND tbpp.IDEMPRESA =\''+idEmpresa+ '\' '+
    '   INNER JOIN "QUALITY_CONC_HML".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM on TBPEM.IDPRODUTO = tbp.IDPRODUTO ' +
    ' WHERE ' +
        '	1 = ?'+
        ' And  tbe.IDEMPRESA = \'' + idEmpresa + '\' And tbp.STATIVO = \'True\' ';
    
    if ( byId ) {
        query = query + ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if ( codeBars ) {
        query = query + ' And  tbp.NUCODBARRAS = \'' + codeBars + '\' ';
    }
    
    if ( descProd ) {
        query = query + ` And  CONTAINS((tbp.DSNOME, tbp.NUCODBARRAS), '%${descProd}%') `;
    }
    
    query = query + ' ORDER BY  tbp.IDPRODUTO ';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    
    var conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."PRODUTO" SET ' + 
        ' "IDPRODUTO" = ?, ' +
        ' "IDGRUPOEMPRESARIAL" = ?, ' +
        ' "NUNCM" = ?, ' +
        ' "NUCEST" = ?, ' +
        ' "NUCST_ICMS" = ?, ' +
        ' "NUCFOP" = ?, ' +
        ' "PERC_OUT" = ?, ' +
        ' "NUCODBARRAS" = ?, ' +
        ' "DSNOME" = ?, ' +
        ' "STGRADE" = ?, ' +
        ' "UND" = ?, ' +
        ' "PRECOCUSTO" = ?, ' +
        ' "PRECOVENDA" = ?, ' +
        ' "QTDENTRADA" = ?, ' +
        ' "QTDCOMERCIALIZADA" = ?, ' +
        ' "QTDPERDA" = ?, ' +
        ' "QTDDISPONIVEL" = ?, ' +
        ' "PERCICMS" = ?, ' +
        ' "PERCISS" = ?, ' +
        ' "PERCPIS" = ?, ' +
        ' "PERCCOFINS" = ?, ' +
        ' "COD_CSOSN" = ?, ' +
        ' "PERCCSOSC" = ?, ' +
        ' "NUCST_IPI" = ?, ' +
        ' "NUCST_PIS" = ?, ' +
        ' "NUCST_COFINS" = ?, ' +
        ' "PERCIPI" = ?, ' +
        ' "DTULTALTERACAO" = ?, ' +
        ' "STPESAVEL" = ?, ' +
        ' "GRP_MATERIAIS" = ? ' + 
    	' WHERE "ID" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.NUNCM);
        pStmt.setString(4, registro.NUCEST);
        pStmt.setString(5, registro.NUCST_ICMS);
        pStmt.setString(6, registro.NUCFOP);
        pStmt.setString(7, registro.PERC_OUT);
        pStmt.setString(8, registro.NUCODBARRAS);
        pStmt.setString(9, registro.DSNOME);
        pStmt.setInt(10, registro.STGRADE);
        pStmt.setString(11, registro.UND);
        pStmt.setFloat(12, registro.PRECOCUSTO);
        pStmt.setFloat(13, registro.PRECOVENDA);
        pStmt.setFloat(14, registro.QTDENTRADA);
        pStmt.setFloat(15, registro.QTDCOMERCIALIZADA);
        pStmt.setFloat(16, registro.QTDPERDA);
        pStmt.setFloat(17, registro.QTDDISPONIVEL);
        pStmt.setFloat(18, registro.PERCICMS);
        pStmt.setFloat(19, registro.PERCISS);
        pStmt.setFloat(20, registro.PERCPIS);
        pStmt.setFloat(21, registro.PERCCOFINS);
        pStmt.setString(22, registro.COD_CSOSN);
        pStmt.setFloat(23, registro.PERCCSOSC);
        pStmt.setString(24, registro.NUCST_IPI);
        pStmt.setString(25, registro.NUCST_PIS);
        pStmt.setString(26, registro.NUCST_COFINS);
        pStmt.setFloat(27, registro.PERCIPI);
        pStmt.setDate(28, registro.DTULTALTERACAO);
        pStmt.setString(29, registro.STPESAVEL);
        pStmt.setInt(30, registro.GRP_MATERIAIS);
    	pStmt.setInt(31, registro.ID);
                    
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
    
    var query = 'INSERT INTO "VAR_DB_NAME"."PRODUTO" ' +
		" ( " +
		' "ID", ' +
        ' "IDPRODUTO", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "NUNCM", ' +
        ' "NUCEST", ' +
        ' "NUCST_ICMS", ' +
        ' "NUCFOP", ' +
        ' "PERC_OUT", ' +
        ' "NUCODBARRAS", ' +
        ' "DSNOME", ' +
        ' "STGRADE", ' +
        ' "UND", ' +
        ' "PRECOCUSTO", ' +
        ' "PRECOVENDA", ' +
        ' "QTDENTRADA", ' +
        ' "QTDCOMERCIALIZADA", ' +
        ' "QTDPERDA", ' +
        ' "QTDDISPONIVEL", ' +
        ' "PERCICMS", ' +
        ' "PERCISS", ' +
        ' "PERCPIS", ' +
        ' "PERCCOFINS", ' +
        ' "COD_CSOSN", ' +
        ' "PERCCSOSC", ' +
        ' "NUCST_IPI", ' +
        ' "NUCST_PIS", ' +
        ' "NUCST_COFINS", ' +
        ' "PERCIPI", ' +
        ' "DTULTALTERACAO", ' +
        ' "STPESAVEL", ' +
        ' "GRP_MATERIAIS" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC.SEQ_PRODUTO.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setString(1, registro.IDPRODUTO);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.NUNCM);
        pStmt.setString(4, registro.NUCEST);
        pStmt.setString(5, registro.NUCST_ICMS);
        pStmt.setString(6, registro.NUCFOP);
        pStmt.setString(7, registro.PERC_OUT);
        pStmt.setString(8, registro.NUCODBARRAS);
        pStmt.setString(9, registro.DSNOME);
        pStmt.setInt(10, registro.STGRADE);
        pStmt.setString(11, registro.UND);
        pStmt.setFloat(12, registro.PRECOCUSTO);
        pStmt.setFloat(13, registro.PRECOVENDA);
        pStmt.setFloat(14, registro.QTDENTRADA);
        pStmt.setFloat(15, registro.QTDCOMERCIALIZADA);
        pStmt.setFloat(16, registro.QTDPERDA);
        pStmt.setFloat(17, registro.QTDDISPONIVEL);
        pStmt.setFloat(18, registro.PERCICMS);
        pStmt.setFloat(19, registro.PERCISS);
        pStmt.setFloat(20, registro.PERCPIS);
        pStmt.setFloat(21, registro.PERCCOFINS);
        pStmt.setString(22, registro.COD_CSOSN);
        pStmt.setFloat(23, registro.PERCCSOSC);
        pStmt.setString(24, registro.NUCST_IPI);
        pStmt.setString(25, registro.NUCST_PIS);
        pStmt.setString(26, registro.NUCST_COFINS);
        pStmt.setFloat(27, registro.PERCIPI);
        pStmt.setDate(28, registro.DTULTALTERACAO);
        pStmt.setString(29, registro.STPESAVEL);
        pStmt.setInt(30, registro.GRP_MATERIAIS);
    	
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}