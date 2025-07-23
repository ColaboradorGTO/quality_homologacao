var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function atualizarDetalheProdutoPedido(lstProduto, conn){
    let updateQueryProduto = `
        UPDATE 
            "VAR_DB_NAME.DETALHEPRODUTOPEDIDO
        SET 
            NUREF = ? ,
            DSNOME = ? ,
            IDCATEGORIAPEDIDO = ? ,
            IDFORNECEDOR = ? ,
            IDFABRICANTE = ? ,
            UND = ? ,
            IDCOR = ? ,
            IDTIPOTECIDO = ? ,
            IDSUBGRUPO = ? ,
            IDESTILO = ? ,
            IDCATEGORIAS = ? ,
            IDLOCALEXPOSICAO = ? ,
            STECOMMERCE = ? ,
            STREDESOCIAL = ? ,
            IDTIPOPRODUTOFISCAL = ? ,
            IDFONTEPRODUTOFISCAL = ?,
            NUNCM = ? , 
            IDRESPATUALIZACAO = ?,
            DTULTATUALIZACAO = CURRENT_TIMESTAMP
        WHERE 
            NUREF = ?
            AND CONTAINS(DSPRODUTO, '?%');
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (let i = 0; i < bodyJson.length; i++) {
		let registro = bodyJson[i];
        
        pStmt.setString(1, registro.NUREF_NOVO);
        pStmt.setString(2, registro.DSNOME_NOVO);
        pStmt.setInt(3, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(4, registro.IDFORNECEDOR);
        pStmt.setInt(5, registro.IDFABRICANTE);
        pStmt.setString(6, registro.UND);
        pStmt.setInt(7, registro.IDCOR);
        pStmt.setInt(8, registro.IDTIPOTECIDO);
        pStmt.setInt(9, registro.IDSUBGRUPO);
        pStmt.setInt(10, registro.IDESTILO);
        pStmt.setInt(11, registro.IDCATEGORIAS);
        pStmt.setInt(12, registro.IDLOCALEXPOSICAO);
        pStmt.setString(13, registro.STECOMMERCE);
        pStmt.setString(14, registro.STREDESOCIAL);
        pStmt.setInt(15, registro.IDTIPOPRODUTOFISCAL);
        pStmt.setInt(16, registro.IDFONTEPRODUTOFISCAL);
        pStmt.setInt(17, registro.NUNCM);
        pStmt.setString(18, registro.NUREF_ANTERIOR);
        pStmt.setString(19, registro.DSNOME_ANTERIOR);
        
        pStmt.execute();
    }
    
    pStmt.close()
    
    return updateQueryProduto;
}

function fnHandleGet(byId) {
    
    let dataInicio = $.request.parameters.get("dataInicio");
    let dataFim = $.request.parameters.get("dataFim");
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let codeBars = $.request.parameters.get("codeBars");
    let nuRef = $.request.parameters.get("nuRef");
    let descProd = $.request.parameters.get("descProd");
    
    let query = `
        SELECT
            DISTINCT 
                SUBSTRING(TRIM(TBP.DSNOME), 0, LOCATE(TRIM(TBP.DSNOME), ' ', -1)) AS DSNOME,
                TBP.NUNCM,
                TBP.STGRADE,
                TBU.IDUNIDADEMEDIDA AS UND,
                TBP.UND AS DSUND,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBP.IDFABRICANTE,
                TBP.IDFORNECEDOR,
                TBP.NUREFERENCIA,
                TBP.IDCOR,
                TBP.IDCATEGORIAPEDIDO,
                TBP.IDTIPOTECIDO,
                TBP.IDESTILO,
                TBP.IDLOCALEXPOSICAO,
                TBP.IDCATEGORIAS,
                TBP.STMIGRADOSAP,
                TBP.IDTIPOPRODUTOFISCAL,
                TBP.IDFONTEPRODUTOFISCAL,
                TBF.NOFANTASIA AS FORNECEDOR,
                TBFAB.DSFABRICANTE AS FABRICANTE,
                IFNULL(TBG.DSGRUPOEMPRESARIAL, 'TODOS') AS GRUPO,
                TBS.IDGRUPOESTRUTURA,
                TBS.IDSUBGRUPOESTRUTURA,
                (TBS.IDGRUPOESTRUTURA || ':' || TBS.IDSUBGRUPOESTRUTURA) as ESTRUTURA,
                TBS.DSSUBGRUPOESTRUTURA,
                IFNULL(TBE.DSESTILO, 'SEM ESTILO') AS DSESTILO
        FROM
            "VAR_DB_NAME".PRODUTO TBP
        LEFT JOIN "VAR_DB_NAME".FORNECEDOR TBF ON 
            TBP.IDFORNECEDOR = TBF.IDFORNECEDOR 
        LEFT JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            TBP.IDFABRICANTE = TBFAB.IDFABRICANTE 
        LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBS ON 
            TBP.IDSUBGRUPO = TBS.IDSUBGRUPOESTRUTURA
        LEFT JOIN "VAR_DB_NAME".ESTILOS TBE ON
            TBP.IDESTILO = TBE.IDESTILO
        LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBG ON
            TBP.IDGRUPOEMPRESARIAL = TBG.IDGRUPOEMPRESARIAL 
        LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON UPPER(TBP.UND) = UPPER(TBU.DSSIGLA)
        WHERE
            1 = ?
            AND TBP.STATIVO = 'True'
    `;
    
    
    /*if ( byId ) {
        query += ` AND TBP.IDPRODUTO = '${byId}' `;
    }*/
    
    if ( dataInicio && dataFim ) {
        query += ` AND (TBP.DTULTALTERACAO BETWEEN '${dataInicio} 00:00:00' AND '${dataFim} 23:59:59' OR TBP.DTCADASTRO BETWEEN '${dataInicio} 00:00:00' AND '${dataFim} 23:59:59') `;
    }
    
    if ( codeBars ) {
        query += ` AND TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( nuRef ){
        query += ` AND  CONTAINS(TBP.NUREFERENCIA, '%${nuRef}%')`;
    }
    
    if ( descProd ) {
        query += ` AND  CONTAINS(TBP.DSNOME, '%${descProd}%')`;
    }
    
    query += ` ORDER BY TBP.DSNOME `;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    
    let updateQueryProduto = `
        UPDATE 
            "VAR_DB_NAME.PRODUTO
        SET 
            NUREF = ? ,
            DSNOME = ? ,
            IDCATEGORIAPEDIDO = ? ,
            IDFORNECEDOR = ? ,
            IDFABRICANTE = ? ,
            UND = ? ,
            IDCOR = ? ,
            IDTIPOTECIDO = ? ,
            IDSUBGRUPO = ? ,
            IDESTILO = ? ,
            IDCATEGORIAS = ? ,
            IDLOCALEXPOSICAO = ? ,
            STECOMMERCE = ? ,
            STREDESOCIAL = ? ,
            IDTIPOPRODUTOFISCAL = ? ,
            IDFONTEPRODUTOFISCAL = ?,
            NUNCM = ?,
            DTULTALTERACAO = CURRENT_TIMESTAMP
        WHERE 
            NUREF = ?
            AND CONTAINS(DSNOME, '?%');
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString());

    for (let i = 0; i < bodyJson.length; i++) {
		let registro = bodyJson[i];
        
        pStmt.setString(1, registro.NUREF_NOVO);
        pStmt.setString(2, registro.DSNOME_NOVO);
        pStmt.setInt(3, registro.IDCATEGORIAPEDIDO);
        pStmt.setInt(4, registro.IDFORNECEDOR);
        pStmt.setInt(5, registro.IDFABRICANTE);
        pStmt.setString(6, registro.UND);
        pStmt.setInt(7, registro.IDCOR);
        pStmt.setInt(8, registro.IDTIPOTECIDO);
        pStmt.setInt(9, registro.IDSUBGRUPO);
        pStmt.setInt(10, registro.IDESTILO);
        pStmt.setInt(11, registro.IDCATEGORIAS);
        pStmt.setInt(12, registro.IDLOCALEXPOSICAO);
        pStmt.setString(13, registro.STECOMMERCE);
        pStmt.setString(14, registro.STREDESOCIAL);
        pStmt.setInt(15, registro.IDTIPOPRODUTOFISCAL);
        pStmt.setInt(16, registro.IDFONTEPRODUTOFISCAL);
        pStmt.setInt(17, registro.NUNCM);
        pStmt.setString(18, registro.NUREF_ANTERIOR);
        pStmt.setString(19, registro.DSNOME_ANTERIOR);
        
        pStmt.execute();
    }
    
    pStmt.close()
    
    return updateQueryProduto;
}
$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
         case $.net.http.PUT:
            var id = $.request.parameters.get("id");
            $.response.setBody(JSON.stringify(fnHandlePut()));
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}