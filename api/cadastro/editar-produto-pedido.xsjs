var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var libEditProdutoPedido = $.import("quality.concentrador_homologacao.api.service-layer.pedido-compra.por-codigo.inativar-alterar-produto.libs.alterar", "libEditProdutoPedido");

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

function fnAtualizarProdSAP(idDetProdPedido, conn){
  //+  var conn = $.db.getConnection();
    var iDDetProdPedido = +idDetProdPedido;
    
    var queryProdutos =  'SELECT \
            	RESUMOPEDIDO.IDGRUPOEMPRESARIAL As IDGRUPOEMPRESARIAL, \
            	detprodped.NUNCM As NUNCM, \
            	\'\' As NUCEST, \
            	\'\' As NUCST_ICMS, \
            	\'\' As NUCFOP, \
            	\'\' As PERC_OUT, \
            	detprodped.CODBARRAS As NUCODBARRAS, \
            	detprodped.DSPRODUTO As DSNOME, \
            	detprodped.DSPRODUTO As DSNOME, \
            	1 As STGRADE, \
            	detprodped.UND As UND, \
            	detprodped.VRCUSTO As PRECOCUSTO, \
            	detprodped.VRVENDA As PRECOVENDA, \
            	0 As QTDENTRADA, \
            	0 As QTDCOMERCIALIZADA,	 \
            	0 As QTDPERDA, \
            	0 As QTDDISPONIVEL, \
            	0.0 As PERCICMS, \
            	0.0 As PERCISS, \
            	0.0 As PERCPIS, \
            	0.0 As PERCCOFINS, \
            	\'\' As COD_CSOSN, \
            	0.0 As PERCCSOSC, \
            	\'\' As NUCST_IPI, \
            	\'\' As NUCST_PIS, \
            	\'\' As NUCST_COFINS, \
            	0.0 As PERCIPI, \
            	detprodped.DTULTATUALIZACAO As DTULTALTERACAO, \
            	0 As STPESAVEL, \
            	1 As GRP_MATERIAIS, \
            	detprodped.IDSUBGRUPOESTRUTURA As IDSUBGRUPO, \
                detprodped.IDFABRICANTE As IDFABRICANTE, \
                RESUMOPEDIDO.IDFORNECEDOR As IDFORNECEDOR, \
                detprodped.NUREF As NUREFERENCIA, \
            	\'True\' As STATIVO, \
                detprodped.IDCOR As IDCOR, \
                detprodped.IDTAMANHO As IDTAMANHO, \
                detprodped.IDCATEGORIAPEDIDO As IDCATEGORIAPEDIDO, \
                detprodped.IDTIPOTECIDO As IDTIPOTECIDO, \
                detprodped.IDESTILO As IDESTILO, \
                detprodped.IDLOCALEXPOSICAO As IDLOCALEXPOSICAO, \
                detprodped.IDCATEGORIAS As IDCATEGORIAS, \
                detprodped.IDDETALHEPRODUTOPEDIDO As IDDETALHEPRODUTOPEDIDO, \
                detprodped.STCADASTRADO As STCADASTRADO, \
                detprodped.STREPOSICAO As STREPOSICAO, \
                detprodped.STECOMMERCE, \
                detprodped.IDPRODCADASTRO \
             FROM  \
            	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS detprodped  \
            	INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO ON detprodped.IDDETALHEPEDIDO = DETALHEPEDIDO.IDDETALHEPEDIDO  \
            	INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO ON DETALHEPEDIDO.IDRESUMOPEDIDO = RESUMOPEDIDO.IDRESUMOPEDIDO \
             WHERE \
            	detprodped.STCANCELADO = \'False\' and detprodped.IDDETALHEPRODUTOPEDIDO = ? ';

        	var lstDeProdutos = api.sqlQuery(queryProdutos,iDDetProdPedido);
        	for (var i = 0; i < lstDeProdutos.length; i++) {
        	    var registroProd = lstDeProdutos[i];
        	    
                        var query = 'UPDATE "VAR_DB_NAME"."PRODUTO" SET ' +
                            ' "NUNCM" = ?, ' +
                            ' "DSNOME" = ?, ' +
                            ' "UND" = ?, ' +
                            ' "PRECOCUSTO" = ?, ' +
                            ' "DTULTALTERACAO" = CURRENT_TIMESTAMP, ' +
                            ' "NUREFERENCIA" = ?, ' +
                            ' "STATIVO" = ?, ' +
                            ' "IDCOR" = ?, ' +
                            ' "IDTAMANHO" = ?, ' +
                            ' "IDTIPOTECIDO" = ?, ' +
                            ' "IDLOCALEXPOSICAO" = ?, ' +
                            ' "IDCATEGORIAS" = ?, ' +
                            ' "STECOMMERCE" = ?, ' +
                            ' "IDCATEGORIAPEDIDO" = ? ' +
                            ' WHERE "IDPRODUTO" =  ? ';
                    		
                        var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
                        pStmt.setInt(1, parseInt(registroProd.NUNCM));
                        pStmt.setString(2, registroProd.DSNOME);
                        pStmt.setString(3, registroProd.UND);
                        pStmt.setFloat(4, parseFloat(registroProd.PRECOCUSTO));
                        //pStmt.setDate(5, registroProd.DTULTALTERACAO);
                        pStmt.setString(5, registroProd.NUREFERENCIA);
                        pStmt.setString(6, registroProd.STATIVO);
                        pStmt.setInt(7, parseInt(registroProd.IDCOR) || 0);
                        pStmt.setInt(8, parseInt(registroProd.IDTAMANHO));
                        pStmt.setInt(9, parseInt(registroProd.IDTIPOTECIDO)||0);
                        pStmt.setInt(10, parseInt(registroProd.IDLOCALEXPOSICAO) || 0);
                        pStmt.setInt(11, parseInt(registroProd.IDCATEGORIAS) || 0);
                        pStmt.setString(12, (registroProd.STECOMMERCE || 'False'));
                        pStmt.setInt(13, parseInt(registroProd.IDCATEGORIAPEDIDO) || 0);
                        pStmt.setInt(14, parseInt(registroProd.IDPRODCADASTRO));
                    
                        pStmt.execute();
                        pStmt.close();
        	}
        	
            var retIntegracaoEditProdutoPedido = libEditProdutoPedido.executeProduto(iDDetProdPedido);
            
            conn.commit();
            
            if(retIntegracaoEditProdutoPedido === 'True'){
                 return {
        	        "msg": "Edição realizado com sucesso!"
        	    };
            }else{
                return {
        	        "msg": "Error Edição!"
        	    };
            }
        
}

function fnHandleGet(byId) {
    
    var idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");

    var query =  ' SELECT ' +
        '   DTP.IDRESUMOPEDIDO, ' +
        '   tbdp.IDDETALHEPRODUTOPEDIDO, ' +
        '   tbdp.IDDETALHEPEDIDO, ' +
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
        '   UN.IDUNIDADEMEDIDA, ' +
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
        '   LEFT JOIN "VAR_DB_NAME".DETALHEPEDIDO DTP ON tbdp.IDDETALHEPEDIDO = DTP.IDDETALHEPEDIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAS CS ON tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.DSSIGLA  ' +
        '   LEFT JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   LEFT JOIN "VAR_DB_NAME".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  ' +
        '   LEFT JOIN "VAR_DB_NAME".VINCFABRICANTEFORN VFN ON FB.IDFABRICANTE = VFN.IDFABRICANTE  ' +
        '   LEFT JOIN "VAR_DB_NAME".FORNECEDOR FN ON VFN.IDFORNECEDOR = FN.IDFORNECEDOR  ' +
        '   LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL GE ON tbdp.IDGRUPOEMPRESARIAL = GE.IDGRUPOEMPRESARIAL  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOFISCALPRODUTO TF ON tbdp.IDTIPOPRODUTOFISCAL = TF.IDTIPOFISCALPRODUTO  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOPRODUTO TPF ON tbdp.IDFONTEPRODUTOFISAL = TPF.IDTIPOPRODUTO  ' +
        ' WHERE ' +
        '	1 = ?';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + byId + '\' ';
    }
    if ( idDetPedidoProd ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + idDetPedidoProd + '\' ';
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
    var steditcomp = 'False';
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' +
            ' "IDCOR"=  ?, ' + 
            ' "IDTAMANHO"=  ?, ' + 
            ' "DSTAMANHO"=  ?, ' + 
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
            ' "VRTOTALCUSTO"=  ?, ' + 
            ' "DTULTATUALIZACAO"=  CURRENT_TIMESTAMP, ' + 
            ' "STECOMMERCE"=  ?, ' + 
            ' "STREDESOCIAL"=  ?, ' + 
            ' "STEDITADOCOMPRAS"=  ?, ' + 
            ' "IDCATEGORIAPEDIDO"=  ? ' + 
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
           
            pStmt.setInt(1, registro.IDCOR);
            pStmt.setInt(2, registro.IDTAMANHO);
            pStmt.setString(3, registro.DSTAMANHO);
            pStmt.setInt(4, registro.IDTIPOTECIDO);
            pStmt.setInt(5, registro.IDLOCALEXPOSICAO);
            pStmt.setInt(6, registro.IDCATEGORIAS);
            pStmt.setString(7, registro.NUNCM);
            pStmt.setInt(8, registro.IDTIPOPRODUTOFISCAL);
            pStmt.setInt(9, registro.IDFONTEPRODUTOFISAL);
            pStmt.setString(10, registro.NUREF);
            pStmt.setString(11, registro.DSPRODUTO);
            pStmt.setString(12, registro.UND);
            pStmt.setFloat(13, registro.QTDPRODUTO);
            pStmt.setFloat(14, registro.VRCUSTO);
            pStmt.setFloat(15, registro.VRTOTALCUSTO);
            pStmt.setString(16, registro.STECOMMERCE);
            pStmt.setString(17, registro.STREDESOCIAL);
            pStmt.setString(18, steditcomp);
            pStmt.setInt(19, registro.IDCATEGORIAPEDIDO);
            pStmt.setInt(20, registro.IDDETALHEPRODUTOPEDIDO);
        
    	    pStmt.execute();
    }
	pStmt.close();
    conn.commit();
     
	fnAtualizarProdSAP(registro.IDDETALHEPRODUTOPEDIDO, conn);
	
	//conn.commit();
	
    return {
        "msg": "Edição realizado com sucesso!"
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
    let detalheError = e.stack.split('\n');
        
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message,
        detalheError
    }));
    $.response.status = 400;
}