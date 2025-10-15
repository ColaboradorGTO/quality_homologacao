var api = $.import("quality.concentrador.api.apiResponse", "int_api");

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
    
    var idPedido = $.request.parameters.get("idpedido");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var IdMarca = $.request.parameters.get("idMarcaPesquisa");
    var IdFornecedor = $.request.parameters.get("idFornPesquisa");

    var query =  `
        SELECT
            TBRP.IDRESUMOPEDIDO AS IDPEDIDO,
            TBSE.DSSUBGRUPOEMPRESARIAL AS NOFANTASIAGRUPO,
            TBFR.IDFORNECEDOR, 
            TBFR.NORAZAOSOCIAL, 
            TBFR.NOFANTASIA AS NOFANTASIAFORN, 
            TBFC.NOFUNCIONARIO AS NOMECOMPRADOR,
            TBA.DSANDAMENTO,
            TBA.DSSETOR,
            TBDP.QTDPRODTOTAL,
            TBDP.VRTOTALCUSTO,
            TBDP.VRTOTALVENDA,
            TBDP.VRTOTALLUCRO,
            TO_VARCHAR( TBRP.DTPEDIDO, 'DD-MM-YYYY HH24:MI:SS') AS DTPEDIDO,
            TO_VARCHAR( TBRP.DTPREVENTREGA , 'DD-MM-YYYY HH24:MI:SS') AS DTENTREGA,
            (SELECT FIRST_VALUE(DSFABRICANTE ORDER BY IDFABRICANTE) FROM "VAR_DB_NAME".FABRICANTE WHERE IDFABRICANTE = TBDP.IDFABRICANTE) AS DSFABRICANTE,
            CASE 
                WHEN TBDP.STFOTO IS NOT NULL THEN 'True'
                ELSE 'False'
            END STFOTO
        FROM
            "VAR_DB_NAME".RESUMOPEDIDO TBRP
        INNER JOIN (
            SELECT DISTINCT 
                X1.IDRESUMOPEDIDO,
                X1.IDFABRICANTE,
                X2.STFOTO,
                SUM(X1.QTDTOTAL) AS QTDPRODTOTAL,
                SUM(X1.VRTOTAL) AS VRTOTALCUSTO,
                SUM(X1.VRVENDA * X1.QTDTOTAL) AS VRTOTALVENDA,
                SUM((X1.VRVENDA * X1.QTDTOTAL) - X1.VRTOTAL) AS VRTOTALLUCRO
            FROM
                "VAR_DB_NAME".DETALHEPEDIDO X1
            LEFT JOIN (
                SELECT DISTINCT 
                    XS1.IDRESUMOPEDIDO,
                    CASE
                        WHEN XS1.IDRESUMOPEDIDO IS NOT NULL THEN 'True'
                        ELSE 'False'
                    END STFOTO
                FROM
                    "VAR_DB_NAME".DETALHEPEDIDO XS1
                WHERE
                    EXISTS (
                        SELECT 1 FROM "VAR_DB_NAME".TBIMAGEMPRODUTO XS2 WHERE XS1.IDPRODUTO = XS2.IDPRODUTO 
                    ) 
            ) AS X2 ON 
                X1.IDRESUMOPEDIDO = X2.IDRESUMOPEDIDO
            WHERE
                X1.STCANCELADO = 'False'
            GROUP BY
                X1.IDRESUMOPEDIDO,
                X2.STFOTO,
                X1.IDFABRICANTE 
        ) TBDP ON
            TBRP.IDRESUMOPEDIDO = TBDP.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".SUBGRUPOEMPRESARIAL TBSE ON 
            TBRP.IDSUBGRUPOEMPRESARIAL = TBSE.IDSUBGRUPOEMPRESARIAL
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBFR ON 
            TBRP.IDFORNECEDOR = TBFR.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFC ON
            TBRP.IDCOMPRADOR = TBFC.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".ANDAMENTOS TBA ON 
            TBRP.IDANDAMENTO = TBA.IDANDAMENTO
        WHERE
            1 = ?
            AND TBRP.STCANCELADO = 'False'
    `;
    
    if ( byId ) {
        query += ` AND TBDP.IDDETALHEPEDIDO = '${byId}' `;
    }
    if ( idPedido ) {
        query += ` AND TBRP.IDRESUMOPEDIDO = '${idPedido}' `;
    }
    if ( IdMarca ) {
        query += ` AND TBRP.IDSUBGRUPOEMPRESARIAL = '${IdMarca}' `;
    }
    if ( IdFornecedor ) {
        query += ` AND TBRP.IDFORNECEDOR = '${IdFornecedor}' `;
    }
    if(dataPesquisaInicio && dataPesquisaFim) {
        query += ` AND (TO_DATE(TBRP.DTPEDIDO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}') `;
    }
    
    query += ' ORDER BY TBRP.IDRESUMOPEDIDO ';
	
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    //$.response.setBody(JSON.stringify({query}))
    
    api.responseWithQuery(query, request, 1);
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;           
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}