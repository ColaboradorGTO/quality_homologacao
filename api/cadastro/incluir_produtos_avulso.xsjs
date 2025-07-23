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

function atualizaDetalheProdutoPedido(idDetProdPedido){
    
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
        ' DETALHEPRODUTOPEDIDO.STCADASTRADO = \'True\' ' + 
        ' FROM "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" ' + 
        ' WHERE DETALHEPRODUTOPEDIDO.IDDETALHEPRODUTOPEDIDO =  \'' + idDetProdPedido + '\' ';
    
    var atualizadorDeStatus = conn.prepareStatement(api.replaceDbName(query));
    atualizadorDeStatus.execute();
    
    atualizadorDeStatus.close();
	conn.commit();
} 
 
function execute () {
    
    var conn = $.db.getConnection();
    
    var queryProdutos =  'SELECT \
            	detprodped.IDGRUPOEMPRESARIAL As IDGRUPOEMPRESARIAL, \
            	detprodped.NUNCM As NUNCM, \
            	\'\' As NUCEST, \
            	\'\' As NUCST_ICMS, \
            	\'\' As NUCFOP, \
            	\'\' As PERC_OUT, \
            	detprodped.CODBARRAS As NUCODBARRAS, \
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
                detprodped.IDFORNECEDOR As IDFORNECEDOR, \
                detprodped.NUREF As NUREFERENCIA, \
            	\'True\' As STATIVO, \
                detprodped.IDCOR As IDCOR, \
                detprodped.IDTAMANHO As IDTAMANHO, \
                detprodped.IDCATEGORIAPEDIDO As IDCATEGORIAPEDIDO, \
                detprodped.IDTIPOTECIDO As IDTIPOTECIDO, \
                detprodped.IDESTILO As IDESTILO, \
                detprodped.IDLOCALEXPOSICAO As IDLOCALEXPOSICAO, \
                detprodped.IDCATEGORIAS As IDCATEGORIAS, \
                detprodped.IDDETALHEPRODUTOPEDIDO As IDDETALHEPRODUTOPEDIDO \
             FROM  \
            	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS detprodped  \
             WHERE \
            	detprodped.STCANCELADO = \'False\' and detprodped.IDDETALHEPRODUTOPEDIDO = ? ';

    var bodyJson = JSON.parse($.request.body.asString()); 
    if(bodyJson.length > 0){
        
        	var registro = bodyJson[0];
        	var lstDeProdutos = api.sqlQuery(queryProdutos,registro.IDDETALHEPRODUTOPEDIDO);
        	
        	for (var i = 0; i < lstDeProdutos.length; i++) {
        	    var registroProd = lstDeProdutos[i];
        	    
        	    var queryIdProduto = 'SELECT QUALITY_CONC.SEQ_PRODUTOPEDIDO.NEXTVAL FROM DUMMY WHERE 1=?';
                var idProduto = api.executeScalar(queryIdProduto,1);
                
                    var query = 'INSERT INTO "VAR_DB_NAME"."PRODUTO" ' +
                		" ( " +
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
                        ' "GRP_MATERIAIS", ' +
                        ' "IDSUBGRUPO", ' +
                        ' "IDFABRICANTE", ' +
                        ' "IDFORNECEDOR", ' +
                        ' "NUREFERENCIA", ' +
                        ' "STATIVO", ' +
                        ' "IDCOR", ' +
                        ' "IDTAMANHO", ' +
                        ' "IDCATEGORIAPEDIDO", ' +
                        ' "IDTIPOTECIDO", ' +
                        ' "IDESTILO", ' +
                        ' "IDLOCALEXPOSICAO", ' +
                        ' "IDCATEGORIAS", ' +
                        ' "IDDETALHEPRODUTOPEDIDO" ' +
                    	' ) ' +
                		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
                		
                    var pStmt = conn.prepareStatement(api.replaceDbName(query));

            		pStmt.setString(1, idProduto.toString());
            		
                    //pStmt.setInt(2, registroProd.IDGRUPOEMPRESARIAL);
                    setIntOrNull(pStmt, 2, registroProd.IDGRUPOEMPRESARIAL);
                    
                    pStmt.setInt(3, parseInt(registroProd.NUNCM));
                    pStmt.setString(4, registroProd.NUCEST);
                    pStmt.setString(5, registroProd.NUCST_ICMS);
                    
                    pStmt.setString(6, registroProd.NUCFOP);
                    pStmt.setString(7, registroProd.PERC_OUT);
                    pStmt.setString(8, registroProd.NUCODBARRAS);
                    pStmt.setString(9, registroProd.DSNOME);
                    pStmt.setInt(10, registroProd.STGRADE);
                    pStmt.setString(11, registroProd.UND);
                   
                    pStmt.setFloat(12, parseFloat(registroProd.PRECOCUSTO));
                    pStmt.setFloat(13, parseFloat(registroProd.PRECOVENDA));
                    pStmt.setFloat(14, parseFloat(registroProd.QTDENTRADA));
                    pStmt.setFloat(15, parseFloat(registroProd.QTDCOMERCIALIZADA));
                    pStmt.setFloat(16, parseFloat(registroProd.QTDPERDA));
                    pStmt.setFloat(17, parseFloat(registroProd.QTDDISPONIVEL));
                    pStmt.setFloat(18, parseFloat(registroProd.PERCICMS));
                    pStmt.setFloat(19, parseFloat(registroProd.PERCISS));
                     
                    pStmt.setFloat(20, parseFloat(registroProd.PERCPIS));
                    pStmt.setFloat(21, parseFloat(registroProd.PERCCOFINS));
                    pStmt.setString(22, registroProd.COD_CSOSN);
                    pStmt.setFloat(23, parseFloat(registroProd.PERCCSOSC));
                    pStmt.setString(24, registroProd.NUCST_IPI);
                    pStmt.setString(25, registroProd.NUCST_PIS);
                    pStmt.setString(26, registroProd.NUCST_COFINS);
                    pStmt.setFloat(27, parseFloat(registroProd.PERCIPI));
                    
                    pStmt.setDate(28, registroProd.DTULTALTERACAO);
                    pStmt.setInt(29, parseInt(registroProd.STPESAVEL) || 0);
                    pStmt.setInt(30, parseInt(registroProd.GRP_MATERIAIS) || 0);
                    pStmt.setInt(31, parseInt(registroProd.IDSUBGRUPO) || 0);
                    pStmt.setInt(32, parseInt(registroProd.IDFABRICANTE) || 0);
                    pStmt.setString(33, registroProd.IDFORNECEDOR.toString());
                    
                    pStmt.setString(34, registroProd.NUREFERENCIA);
                    pStmt.setString(35, registroProd.STATIVO);
                    pStmt.setInt(36, parseInt(registroProd.IDCOR) || 0);
                    pStmt.setInt(37, parseInt(registroProd.IDTAMANHO) || 0);
                    pStmt.setInt(38, parseInt(registroProd.IDCATEGORIAPEDIDO) || 0);
                    pStmt.setInt(39, parseInt(registroProd.IDTIPOTECIDO)||0);
                    pStmt.setInt(40, parseInt(registroProd.IDESTILO) || 0);
                    pStmt.setInt(41, parseInt(registroProd.IDLOCALEXPOSICAO) || 0);
                    pStmt.setInt(42, parseInt(registroProd.IDCATEGORIAS) || 0);
                    pStmt.setInt(43, parseInt(registroProd.IDDETALHEPRODUTOPEDIDO) || 0);
                
                    pStmt.execute();
                    
                    //////////INSERIR PREÇO DO PRODUTO NA PRODUTO_PREÇO//////////////////////

                        var queryInsertPrecoProduto = 'INSERT INTO "VAR_DB_NAME"."PRODUTO_PRECO" ' +
                    		" ( " +
                    		' "IDPRODUTO", ' +
                    		' "IDEMPRESA", ' +
                    		' "PRICE_LIST_ID", ' +
                            ' "PRECO_VENDA" ' +
                        	' ) ' +
                    		' VALUES(?,101,0,?) ';
                        
                        var pStmtGravaProd = conn.prepareStatement(api.replaceDbName(queryInsertPrecoProduto));
                        
                        pStmtGravaProd.setString(1, idProduto.toString());
                        pStmtGravaProd.setFloat(2, parseFloat(registroProd.PRECOVENDA));
                        pStmtGravaProd.execute();
                        pStmtGravaProd.close();
                        
                    //////////ATUALIZA ID DO PRODUTO NA DETALHE PRODUTO PEDITO//////////////////////
                     var queryAtualizaIdProduto = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
                        ' "IDPRODCADASTRO" =  ? ' +
                		' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
                        
                    var pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaIdProduto));
                	
                	pStmt2.setString(1, idProduto.toString());
                    pStmt2.setInt(2, parseInt(registroProd.IDDETALHEPRODUTOPEDIDO));
                    pStmt2.execute();
                    pStmt2.close();
                    
                    conn.commit();
                
            }
        	
        	pStmt.close();
            atualizaDetalheProdutoPedido(registro.IDDETALHEPRODUTOPEDIDO);
    }

    conn.commit();
    
    return true;
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.PUT:
                var doc = execute();
                 $.response.setBody(JSON.stringify({ result : doc }));
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