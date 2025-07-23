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
    
    var idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");
    var DescProdAv = $.request.parameters.get("DescProdAv");
    var BarrasProdAv = $.request.parameters.get("BarrasProdAv");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

    var query =  ' SELECT ' +
        '   tbdp.IDDETALHEPRODUTOPEDIDO, ' +
        '   SE.IDGRUPOESTRUTURA, ' +
        '   tbdp.IDSUBGRUPOESTRUTURA, ' +
        '   SE.DSSUBGRUPOESTRUTURA, ' +
        '   tbdp.IDCOR, ' +
        '   TRIM(CR.DSCOR) AS DSCOR, ' +
        '   tbdp.IDTAMANHO, ' +
        '   tbdp.DSTAMANHO, ' +
        '   tbdp.IDCATEGORIAPEDIDO, ' +
        '   CP.TIPOPEDIDO, ' +
        '   tbdp.IDTIPOTECIDO, ' +
        '   TBT.DSTIPOTECIDO, ' +
        '   tbdp.IDESTILO, ' +
        '   ES.DSESTILO, ' +
        '   tbdp.IDFABRICANTE, ' +
        '   FB.DSFABRICANTE, ' +
        '   tbdp.IDLOCALEXPOSICAO, ' +
        '   LE.DSLOCALEXPOSICAO, ' +
        '   CS.IDCATEGORIAS, ' +
        '   CS.DSCATEGORIAS, ' +
        '   CS.TPCATEGORIAS, ' +
        '   tbdp.IDNCM, ' +
        '   tbdp.NUNCM, ' +
        '   tbdp.IDCEST, ' +
        '   tbdp.NUCEST, ' +
        '   tbdp.IDTIPOPRODUTOFISCAL, ' +
        '   TF.CODTIPOFISCALPRODUTO, ' +
        '   TF.DSTIPOFISCALPRODUTO, ' +
        '   tbdp.IDFONTEPRODUTOFISAL, ' +
        '   TPF.CODTIPOPRODUTO, ' +
        '   TPF.DSTIPOPRODUTO, ' +
        '   tbdp.IDPRODCADASTRO, ' +
        '   tbdp.NUREF, ' +
        '   tbdp.CODBARRAS, ' +
        '   tbdp.DSPRODUTO, ' +
        '   tbdp.QTDPRODUTO, ' +
        '   TRIM(tbdp.UND) AS UND, ' +
        '   tbdp.VRCUSTO, ' +
        '   tbdp.VRVENDA, ' +
        '   tbdp.VRTOTALCUSTO, ' +
        '   tbdp.VRTOTALVENDA, ' +
        '   TO_VARCHAR( tbdp.DTCADASTRO, \'DD-MM-YYYY\') AS DTCADASTROFORMAT, ' +
        '   tbdp.DTCADASTRO, ' +
        '   tbdp.DTULTATUALIZACAO, ' +
        '   tbdp.STCADASTRADO, ' +
        '   tbdp.STRECEBIDO, ' +
        '   tbdp.OBSREF, ' +
        '   tbdp.IDDETALHEENTRADA, ' +
        '   tbdp.NUNF, ' +
        '   tbdp.QTDENTRADANF, ' +
        '   tbdp.DTENTRADANF, ' +
        '   tbdp.STECOMMERCE, ' +
        '   tbdp.STREDESOCIAL, ' +
        '   tbdp.STATIVO, ' +
        '   tbdp.STCANCELADO, ' +
        '   tbdp.STMIGRADOSAP, ' +
        '   tbdp.STAVULSO, ' +
        '   tbdp.IDGRUPOEMPRESARIAL,' +
        '   GE.DSGRUPOEMPRESARIAL,' +
        '   tbdp.IDFORNECEDOR, ' +
        '   FN.NORAZAOSOCIAL, ' +
        '   FN.NOFANTASIA,' +
        '   FN.NUCNPJ ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdp ' +
        '   LEFT JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAS CS ON tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.DSSIGLA  ' +
        '   LEFT JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   LEFT JOIN "VAR_DB_NAME".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  ' +
        '   LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON tbdp.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL GE ON tbdp.IDGRUPOEMPRESARIAL = GE.IDGRUPOEMPRESARIAL  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TF ON tbdp.IDTIPOPRODUTOFISCAL = TF.IDTIPOFISCALPRODUTO  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOPRODUTO TPF ON tbdp.IDFONTEPRODUTOFISAL = TPF.IDTIPOPRODUTO  ' +
        ' WHERE ' +
        '	1 = ?'+ 
        '   AND tbdp.STAVULSO = \'True\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + byId + '\' ';
    }
    if ( idDetPedidoProd ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + idDetPedidoProd + '\' ';
    }
    if ( DescProdAv ) {
         query = query + ' And  (tbdp.DSPRODUTO LIKE \'%'+DescProdAv+'%\' ) ';
    }
    if ( BarrasProdAv ) {
        query = query + ' And  tbdp.CODBARRAS = \'' + BarrasProdAv + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
    }
    
    query = query + ' ORDER BY tbdp.DTCADASTRO DESC';
     
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
            ' "IDCOR"=  ?, ' + 
            ' "IDTAMANHO"=  ?, ' + 
            ' "DSTAMANHO"=  ?, ' + 
            ' "IDCATEGORIAPEDIDO"=  ?, ' + 
            ' "IDTIPOTECIDO"=  ?, ' + 
            ' "IDLOCALEXPOSICAO"=  ?, ' + 
            ' "IDCATEGORIAS"=  ?, ' + 
            ' "NUNCM"=  ?, ' + 
            ' "IDTIPOPRODUTOFISCAL"=  ?, ' + 
            ' "IDFONTEPRODUTOFISAL"=  ?, ' + 
            ' "NUREF"=  ?, ' + 
            ' "DSPRODUTO"=  ?, ' + 
            ' "UND"=  ?, ' + 
            ' "QTDPRODUTO"=  ?, ' + 
            ' "VRCUSTO"=  ?, ' + 
            ' "VRVENDA"=  ?, ' + 
            ' "VRTOTALCUSTO"=  ?, ' + 
            ' "DTCADASTRO"=  ?, ' + 
            ' "DTULTATUALIZACAO"=  ?, ' + 
            ' "STECOMMERCE"=  ?, ' + 
            ' "STREDESOCIAL"=  ? ' + 
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
           
            pStmt.setInt(1, registro.IDCOR);
            pStmt.setInt(2, registro.IDTAMANHO);
            pStmt.setString(3, registro.DSTAMANHO);
            pStmt.setInt(4, registro.IDCATEGORIAPEDIDO);
            pStmt.setInt(5, registro.IDTIPOTECIDO);
            pStmt.setInt(6, registro.IDLOCALEXPOSICAO);
            pStmt.setInt(7, registro.IDCATEGORIAS);
            pStmt.setString(8, registro.NUNCM);
            pStmt.setInt(9, registro.IDTIPOPRODUTOFISCAL);
            pStmt.setInt(10, registro.IDFONTEPRODUTOFISAL);
            pStmt.setString(11, registro.NUREF);
            pStmt.setString(12, registro.DSPRODUTO);
            pStmt.setString(13, registro.UND);
            pStmt.setFloat(14, registro.QTDPRODUTO);
            pStmt.setFloat(15, registro.VRCUSTO);
            pStmt.setFloat(16, registro.VRVENDA);
            pStmt.setFloat(17, registro.VRTOTALCUSTO);
            pStmt.setDate(18, registro.DTCADASTRO);
            pStmt.setDate(19, registro.DTULTATUALIZACAO);
            pStmt.setString(20, registro.STECOMMERCE);
            pStmt.setString(21, registro.STREDESOCIAL);
            pStmt.setInt(22, registro.IDDETALHEPRODUTOPEDIDO);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    
    var conn = $.db.getConnection();
  
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" ' + 
		" ( " +
		    ' "IDDETALHEPRODUTOPEDIDO", ' +
            ' "IDGRUPOESTRUTURA", ' +
            ' "IDSUBGRUPOESTRUTURA", ' +
            ' "IDCOR", ' +
            ' "IDTAMANHO", ' +
            ' "DSTAMANHO", ' +
            ' "IDCATEGORIAPEDIDO", ' +
            ' "IDTIPOTECIDO", ' +
            ' "IDESTILO", ' +
            ' "IDFABRICANTE", ' +
            ' "IDLOCALEXPOSICAO", ' +
            ' "IDCATEGORIAS", ' +
            ' "IDNCM", ' +
            ' "NUNCM", ' +
            ' "IDTIPOPRODUTOFISCAL", ' +
            ' "IDFONTEPRODUTOFISAL", ' +
            ' "NUREF", ' +
            ' "CODBARRAS", ' +
            ' "DSPRODUTO", ' +
            ' "UND", ' +
            ' "QTDPRODUTO", ' +
            ' "VRCUSTO", ' +
            ' "VRVENDA", ' +
            ' "VRTOTALCUSTO", ' +
            ' "DTCADASTRO", ' +
            ' "DTULTATUALIZACAO", ' +
            ' "STECOMMERCE", ' +
            ' "STREDESOCIAL", ' +
            ' "STATIVO", ' +
            ' "STCANCELADO", ' +
            ' "QTDESTOQUEIDEAL", ' +
            ' "STMIGRADOSAP", ' +
            ' "STAVULSO", ' +
            ' "IDGRUPOEMPRESARIAL", ' +
            ' "IDFORNECEDOR" ' +
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
		
		
	for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
		var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEPRODUTOPEDIDO")),0) + 1 FROM "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" WHERE 1 = ? ', 1);
		var queryIdGrupoEst = api.executeScalar('SELECT IDGRUPOESTRUTURA FROM "VAR_DB_NAME"."SUBGRUPOESTRUTURA" WHERE IDSUBGRUPOESTRUTURA = ? ', registro.IDSUBGRUPOESTRUTURA);
		
		   var idDetalheProdPedido = queryId;
		   var idGrupoEstProdPedido = queryIdGrupoEst;
		   
            pStmt.setInt(1,idDetalheProdPedido);     
            pStmt.setInt(2, idGrupoEstProdPedido);
            pStmt.setInt(3, registro.IDSUBGRUPOESTRUTURA);
            pStmt.setInt(4, registro.IDCOR);
            pStmt.setInt(5, registro.IDTAMANHO);
            pStmt.setString(6, registro.DSTAMANHO);
            pStmt.setInt(7, registro.IDCATEGORIAPEDIDO);
            pStmt.setInt(8, registro.IDTIPOTECIDO);
            pStmt.setInt(9, registro.IDESTILO);
            pStmt.setInt(10, registro.IDFABRICANTE);
            pStmt.setInt(11, registro.IDLOCALEXPOSICAO);
            pStmt.setInt(12, registro.IDCATEGORIAS);
            pStmt.setInt(13, registro.IDNCM);
            pStmt.setString(14, registro.NUNCM);
            pStmt.setInt(15, registro.IDTIPOPRODUTOFISCAL);
            pStmt.setInt(16, registro.IDFONTEPRODUTOFISAL);
            pStmt.setString(17, registro.NUREF);
            pStmt.setString(18, registro.CODBARRAS);
            pStmt.setString(19, registro.DSPRODUTO);
            pStmt.setString(20, registro.UND);
            pStmt.setFloat(21, registro.QTDPRODUTO);
            pStmt.setFloat(22, registro.VRCUSTO);
            pStmt.setFloat(23, registro.VRVENDA);
            pStmt.setFloat(24, registro.VRTOTALCUSTO);
            pStmt.setDate(25, registro.DTCADASTRO);
            pStmt.setDate(26, registro.DTULTATUALIZACAO);
            pStmt.setString(27, registro.STECOMMERCE);
            pStmt.setString(28, registro.STREDESOCIAL);
            pStmt.setString(29, registro.STATIVO);
            pStmt.setString(30, registro.STCANCELADO);
            pStmt.setInt(31, registro.QTDESTOQUEIDEAL);
            pStmt.setString(32, registro.STMIGRADOSAP);
            pStmt.setString(33, registro.STAVULSO);
            setIntOrNull(pStmt,34, registro.IDGRUPOEMPRESARIAL);
            setIntOrNull(pStmt,35, registro.IDFORNECEDOR);
        	
            pStmt.execute();
	}

	pStmt.close();

	conn.commit();

    return {
	    "msg":"Cadastro realizada com sucesso!"
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