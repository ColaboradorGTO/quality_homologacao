var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var grCodBars= $.import("quality.concentrador_homologacao.api.cadastro.libs.gerar-cod-barras", "gerarCodigoBarras");
var conn;

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

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function atualizaDetalhePedido(dadosDetPedido, conn){
    let queryUpdateDetPedido = `
        UPDATE
            "VAR_DB_NAME".DETALHEPEDIDO
        SET 
            IDCOR = ${dadosDetPedido.IDCOR},
            IDTIPOTECIDO = ${dadosDetPedido.IDTIPOTECIDO},
            IDESTILO = ${dadosDetPedido.IDESTILO},
            UND = ${dadosDetPedido.IDUND},
            DTATUALIZACAO = now(),
            IDRESPATUALIZACAO = ${dadosDetPedido.IDRESPCADASTRO},
            IDRESPAUTORIZAEDITCAD = ${dadosDetPedido.IDRESPAUTORIZAEDITCAD}
        WHERE
            IDDETALHEPEDIDO = ?
    `;
    
    let pStmtUpdateDetPedido = conn.prepareStatement(api.replaceDbName(queryUpdateDetPedido));
    
    pStmtUpdateDetPedido.setInt(1, parseInt(dadosDetPedido.IDDETALHEPEDIDO));
    
    pStmtUpdateDetPedido.execute();
    pStmtUpdateDetPedido.close();
}

function atualizarStTransformadoDetPedido(idDetalhePedido, conn){
    let queryUpdateDetPedido = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" 
        SET 
            "STTRANSFORMADO" =  'True'
        WHERE 
            "IDDETALHEPEDIDO" =  ? 
    `;
    
    let pStmtUpdateDetPedido = conn.prepareStatement(api.replaceDbName(queryUpdateDetPedido));
    
    pStmtUpdateDetPedido.setInt(1, parseInt(idDetalhePedido));
    
    pStmtUpdateDetPedido.execute();
    pStmtUpdateDetPedido.close();
    
    //conn.commit();
}

function fnHandleGet(byId) {
    
    var idDetPedidoProd = $.request.parameters.get("idDetPedidoProd");
    var iResPedido = $.request.parameters.get("iResPedido");
    var idetPedido = $.request.parameters.get("idetPedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");
    var IdFabricante = $.request.parameters.get("idFabPesquisa");

    var query =  ' SELECT ' +
        '   RP.IDRESUMOPEDIDO, ' +
        '   tbdp.IDDETALHEPRODUTOPEDIDO, ' +
        '   tbdp.IDDETALHEPEDIDO, ' +
        '   tbdp.IDGRUPOESTRUTURA, ' +
        '   tbdp.IDSUBGRUPOESTRUTURA, ' +
        '   SE.DSSUBGRUPOESTRUTURA, ' +
        '   tbdp.IDCOR, ' +
        '   TRIM(CR.DSCOR) AS DSCOR, ' +
        '   tbdp.IDTAMANHO, ' +
        '   tbdp.DSTAMANHO, ' +
        '   tbdp.IDCATEGORIAPEDIDO, ' +
        '   tbdp.IDTIPOTECIDO, ' +
        '   tbdp.IDESTILO, ' +
        '   ES.DSESTILO, ' +
        '   tbdp.IDFABRICANTE, ' +
        '   tbdp.IDLOCALEXPOSICAO, ' +
        '   LE.DSLOCALEXPOSICAO, ' +
        '   CS.IDCATEGORIAS, ' +
        '   CS.DSCATEGORIAS, ' +
        '   tbdp.IDNCM, ' +
        '   tbdp.NUNCM, ' +
        '   tbdp.IDCEST, ' +
        '   tbdp.NUCEST, ' +
        '   tbdp.IDTIPOPRODUTOFISCAL, ' +
        '   tbdp.IDFONTEPRODUTOFISAL, ' +
        '   tbdp.IDPRODCADASTRO, ' +
        '   tbdp.NUREF, ' +
        '   tbdp.CODBARRAS, ' +
        '   tbdp.DSPRODUTO, ' +
        '   tbdp.QTDPRODUTO, ' +
        '   tbdp.UND, ' +
        '   tbdp.VRCUSTO, ' +
        '   tbdp.VRVENDA, ' +
        '   tbdp.VRTOTALCUSTO, ' +
        '   tbdp.VRTOTALVENDA, ' +
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
        '   tbdp.STREPOSICAO, ' +
        '   tbdp.QTDESTOQUEIDEAL, ' +
        '   IFNULL( tbdp.STEDITADOCOMPRAS,\'False\') AS STEDITADOCOMPRAS ' +
        ' FROM ' +
        '	"VAR_DB_NAME".DETALHEPRODUTOPEDIDO tbdp ' +
        '   INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO DP ON tbdp.IDDETALHEPEDIDO = DP.IDDETALHEPEDIDO  ' +
        '   INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO RP ON DP.IDRESUMOPEDIDO = RP.IDRESUMOPEDIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".COR CR ON tbdp.IDCOR = CR.IDCOR  ' +
        '   LEFT JOIN "VAR_DB_NAME".TIPOTECIDOS TBT ON tbdp.IDTIPOTECIDO = TBT.IDTPTECIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAS CS ON tbdp.IDCATEGORIAS = CS.IDCATEGORIAS  ' +
        '   LEFT JOIN "VAR_DB_NAME".CATEGORIAPEDIDO CP ON tbdp.IDCATEGORIAPEDIDO = CP.IDCATEGORIAPEDIDO  ' +
        '   LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA UN ON tbdp.UND = UN.DSSIGLA  ' +
        '   LEFT JOIN "VAR_DB_NAME".ESTILOS ES ON tbdp.IDESTILO = ES.IDESTILO  ' +
        '   LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO LE ON tbdp.IDLOCALEXPOSICAO = LE.IDLOCALEXPOSICAO  ' +
        '   LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA SE ON tbdp.IDSUBGRUPOESTRUTURA = SE.IDSUBGRUPOESTRUTURA  ' +
        '   LEFT JOIN "VAR_DB_NAME".FABRICANTE FB ON tbdp.IDFABRICANTE = FB.IDFABRICANTE  ' +
        ' WHERE ' +
        '	1 = ?'+
        '   AND tbdp.STCANCELADO = \'False\' ';
    if ( byId ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + byId + '\' ';
    }
    if ( idDetPedidoProd ) {
        query = query + ' And  tbdp.IDDETALHEPRODUTOPEDIDO = \'' + idDetPedidoProd + '\' ';
    }
    if ( iResPedido ) {
        query = query + ' And  RP.IDRESUMOPEDIDO = \'' + iResPedido + '\' ';
    }
    if ( idetPedido ) {
        query = query + ' And  tbdp.IDDETALHEPEDIDO = \'' + idetPedido + '\' ';
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + '  AND (tbdp.DTCADASTRO BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\') ';
    }
    if ( IdMarca ) {
        query += ` And  RP.IDSUBGRUPOEMPRESARIAL = '${IdMarca}' `;
    }
    if ( IdFornecedor ) {
        query += ` And  RP.IDFORNECEDOR = '${IdFornecedor}' `;
    }
    if ( IdFabricante ) {
        query += ` And  tbdp.IDFABRICANTE = '${IdFabricante}' `;
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    conn = $.db.getConnection();
    
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
            ' "IDSUBGRUPOESTRUTURA"=  ?, ' + 
            ' "IDCOR"=  ?, ' + 
            ' "IDTAMANHO"=  ?, ' + 
            ' "DSTAMANHO"=  ?, ' + 
            ' "IDCATEGORIAPEDIDO"=  ?, ' + 
            ' "IDTIPOTECIDO"=  ?, ' + 
            ' "IDESTILO"=  ?, ' + 
            ' "IDFABRICANTE"=  ?, ' + 
            ' "IDLOCALEXPOSICAO"=  ?, ' + 
            ' "IDCATEGORIAS"=  ?, ' + 
            ' "IDNCM"=  ?, ' + 
            ' "NUNCM"=  ?, ' + 
            ' "IDTIPOPRODUTOFISCAL"=  ?, ' + 
            ' "IDFONTEPRODUTOFISAL"=  ?, ' + 
            ' "NUREF"=  ?, ' + 
            ' "CODBARRAS"=  ?, ' + 
            ' "DSPRODUTO"=  ?, ' + 
            ' "UND"=  ?, ' + 
            ' "QTDPRODUTO"=  ?, ' + 
            ' "VRCUSTO"=  ?, ' + 
            ' "VRVENDA"=  ?, ' + 
            ' "VRTOTALCUSTO"=  ?, ' + 
            ' "DTCADASTRO"=  ?, ' + 
            ' "DTULTATUALIZACAO"=  ?, ' + 
            ' "STECOMMERCE"=  ?, ' + 
            ' "STREDESOCIAL"=  ?, ' + 
            ' "STATIVO"=  ?, ' + 
            ' "STCANCELADO" =  ?, ' + 
            ' "QTDESTOQUEIDEAL" =  ? ' + 
        ' WHERE "IDDETALHEPRODUTOPEDIDO" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];
           
            pStmt.setInt(1, registro.IDSUBGRUPOESTRUTURA);
            pStmt.setInt(2, registro.IDCOR);
            pStmt.setInt(3, registro.IDTAMANHO);
            pStmt.setString(4, registro.DSTAMANHO);
            pStmt.setInt(5, registro.IDCATEGORIAPEDIDO);
            pStmt.setInt(6, registro.IDTIPOTECIDO);
            pStmt.setInt(7, registro.IDESTILO);
            pStmt.setInt(8, registro.IDFABRICANTE);
            pStmt.setInt(9, registro.IDLOCALEXPOSICAO);
            pStmt.setInt(10, registro.IDCATEGORIAS);
            pStmt.setInt(11, registro.IDNCM);
            pStmt.setString(12, registro.NUNCM);
            pStmt.setInt(13, registro.IDTIPOPRODUTOFISCAL);
            pStmt.setInt(14, registro.IDFONTEPRODUTOFISAL);
            pStmt.setString(15, registro.NUREF);
            pStmt.setString(16, registro.CODBARRAS);
            pStmt.setString(17, registro.DSPRODUTO);
            pStmt.setString(18, registro.UND);
            pStmt.setFloat(19, registro.QTDPRODUTO);
            pStmt.setFloat(20, registro.VRCUSTO);
            pStmt.setFloat(21, registro.VRVENDA);
            pStmt.setFloat(22, registro.VRTOTALCUSTO);
            pStmt.setDate(23, registro.DTCADASTRO);
            pStmt.setDate(24, registro.DTULTATUALIZACAO);
            pStmt.setString(25, registro.STECOMMERCE);
            pStmt.setString(26, registro.STREDESOCIAL);
            pStmt.setString(27, registro.STATIVO);
            pStmt.setString(28, registro.STCANCELADO);
            pStmt.setInt(29, registro.QTDESTOQUEIDEAL);
            pStmt.setInt(30, registro.IDDETALHEPRODUTOPEDIDO);
        
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    conn = $.db.getConnection();
    
    let idSubgrupo;
    let idFornecedor;
  
    var query = 'INSERT INTO "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" ' + 
		" ( " +
            ' "IDDETALHEPEDIDO", ' +
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
            ' "IDPRODCADASTRO", ' +
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
            ' "STCADASTRADO", ' +
            ' "STECOMMERCE", ' +
            ' "STREDESOCIAL", ' +
            ' "STATIVO", ' +
            ' "STCANCELADO", ' +
            ' "QTDESTOQUEIDEAL", ' +
            ' "IDRESUMOPEDIDO", ' +
            ' "STMIGRADOSAP", ' +
            ' "STREPOSICAO", ' +
            ' "IDRESPCADASTRO", ' +
            ' "IDRESPAUTORIZAEDITCAD", ' +
            ' "IDFORNECEDOR" '+
    	' ) ' +
		' VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, now() , now() ,\'False\',?,?,?,?,?,?,?,?,?,?,?); ';

  
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
	
	if(bodyJson.length){
		
        bodyJson.map((registro) => {
           // var registro = bodyJson[i];
            
            if(registro.PRODUTOSDETALHE.length){
                let detalhesProdutos = registro.PRODUTOSDETALHE;
                
                let queryDetPedido = `
                    SELECT
                        TBR.IDRESUMOPEDIDO,
                        TBD.IDDETALHEPEDIDO,
                        TBR.IDFORNECEDOR,
                        TBD.IDSUBGRUPOESTRUTURA
                    FROM
                        "VAR_DB_NAME".DETALHEPEDIDO TBD
                    INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON 
                        TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
                    WHERE
                        TBD.STCANCELADO <> 'True' 
                        AND TBR.STCANCELADO <> 'True'
                        AND TBD.IDRESUMOPEDIDO = ${registro.IDRESUMOPEDIDO}
                        AND TBD.IDDETALHEPEDIDO = ?
                `;
                
                let dadosDetPedido = api.sqlQuery(queryDetPedido, registro.IDDETALHEPEDIDO);
                
                if(!dadosDetPedido.length){
                    throw { message: `Detalhe do pedido não encontrado ou cancelado| IDDETALHEPEDIDO: ${registro.IDDETALHEPEDIDO}`};
                }
                
                idSubgrupo = dadosDetPedido[0]["IDSUBGRUPOESTRUTURA"];
                idFornecedor = dadosDetPedido[0]["IDFORNECEDOR"];
                	
                let queryVerificaDetPedido = `
                    SELECT
                        *
                    FROM
                        "VAR_DB_NAME".DETALHEPEDIDO
                    WHERE 
                        IDCOR = ${registro.IDCOR}
                        AND IDTIPOTECIDO = ${registro.IDTIPOTECIDO}
                        AND IDESTILO = ${registro.IDESTILO}
                        AND UND = ${registro.IDUND}
                        AND IDDETALHEPEDIDO = ?
                `;
                
                let respQueryVerificaDetPedido = api.sqlQuery(queryVerificaDetPedido, registro.IDDETALHEPEDIDO);
                
                if(!respQueryVerificaDetPedido.length){
                    atualizaDetalhePedido(registro, conn);
                }
                
                detalhesProdutos.map((detProd) => {
                    let codBarras = detProd.reposicao == 'True' ? detProd.codbarra : null; //grCodBars.gerarCodigoBarras(idSubgrupo, idFornecedor, conn);
                 
                 // pStmt.setInt(1,idDetalheProdPedido);    
                    pStmt.setInt(1, registro.IDDETALHEPEDIDO);   
                    pStmt.setInt(2, registro.IDSUBGRUPOESTRUTURA);
                    pStmt.setInt(3, registro.IDCOR);
                    pStmt.setInt(4, Number(detProd.idtamanho));
                    pStmt.setString(5, detProd.tamanho);
                    pStmt.setInt(6, registro.IDCATEGORIAPEDIDO);
                    pStmt.setInt(7, registro.IDTIPOTECIDO);
                    pStmt.setInt(8, registro.IDESTILO);
                    pStmt.setInt(9, registro.IDFABRICANTE);
                    pStmt.setInt(10, registro.IDLOCALEXPOSICAO);
                    pStmt.setInt(11, registro.IDCATEGORIAS);
                    pStmt.setInt(12, registro.IDNCM);
                    pStmt.setString(13, registro.NUNCM);
                    pStmt.setInt(14, registro.IDTIPOPRODUTOFISCAL);
                    pStmt.setInt(15, registro.IDFONTEPRODUTOFISAL);
                    pStmt.setString(16, detProd.idproduto);
                    pStmt.setString(17, registro.NUREF);
                    setStringOrNull(pStmt, 18, codBarras);
                    pStmt.setString(19, detProd.dsproduto);
                    pStmt.setString(20, detProd.unidade);
                    pStmt.setFloat(21, detProd.quantidade);
                    pStmt.setFloat(22, detProd.vrunitario);
                    pStmt.setFloat(23, detProd.vrvendas);
                    pStmt.setFloat(24, detProd.vrtotal);
                    //pStmt.setDate(25, registro.DTCADASTRO);
                    //pStmt.setDate(26, registro.DTULTATUALIZACAO);
                    pStmt.setString(25, registro.STECOMMERCE);
                    pStmt.setString(26, registro.STREDESOCIAL);
                    pStmt.setString(27, registro.STATIVO);
                    pStmt.setString(28, registro.STCANCELADO);
                    pStmt.setInt(29, registro.QTDESTOQUEIDEAL);
                    pStmt.setInt(30, registro.IDRESUMOPEDIDO);
                    pStmt.setString(31, registro.STMIGRADOSAP);
                    pStmt.setString(32, detProd.reposicao);
                    pStmt.setInt(33, registro.IDRESPCADASTRO);
                    setIntOrNull(pStmt, 34, registro.IDRESPAUTORIZAEDITCAD);
                    pStmt.setInt(35, Number(idFornecedor));
                    
                    pStmt.execute();
                })
                
                atualizarStTransformadoDetPedido(registro.IDDETALHEPEDIDO, conn);
            } else {
                throw { message: `O objeto que contem os detalhes dos produtos está vazios!`};
            }
        })
        
        pStmt.close();
        
        conn.commit();
        
        return {
            "type": "success",
            "msg": 'Produto Criado com sucesso!'
        };
        
    } else {
        throw { message: `O objeto enviado está vazio, verifique e tente novamante!`};    
    }
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
    conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}