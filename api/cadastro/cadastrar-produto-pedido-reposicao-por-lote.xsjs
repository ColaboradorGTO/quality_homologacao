var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var grCodBars= $.import("quality.concentrador_homologacao.api.cadastro.libs.gerar-cod-barras", "gerarCodigoBarras");
var conn;

function atualizarStTransformadoDetPedido(idResumoPedido){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        SET 
            TBD."STTRANSFORMADO" =  'True'
        FROM 
            "VAR_DB_NAME"."DETALHEPEDIDO" TBD
        INNER JOIN "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" TBDPP ON 
            TBD."IDDETALHEPEDIDO" = TBDPP."IDDETALHEPEDIDO"
        INNER JOIN "VAR_DB_NAME"."RESUMOPEDIDO" TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        WHERE 
            TBR.IDRESUMOPEDIDO = ? OR TBR.IDPEDIDOPRIMARIO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idResumoPedido));
    pStmt.setInt(2, parseInt(idResumoPedido));
    
    pStmt.execute();
    pStmt.close();
}

function getIdResumoSecundario(idResumoPedido){
    let query = `
        SELECT 
            IDRESUMOPEDIDO
        FROM
            "VAR_DB_NAME"."RESUMOPEDIDO"
        WHERE 
            1 = ?
            AND IDPEDIDOPRIMARIO = '${idResumoPedido}'
    `;
    
    let reg = api.sqlQuery(query, 1);
    
    return reg.length > 0 ? Number(reg[0].IDRESUMOPEDIDO) : 0; 
    
}

function fnCriarDetalheProdutoPedido(idResumoPedido, idFuncionario){
    let query = `
        INSERT INTO
            "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO"  
        (
            "IDRESUMOPEDIDO",
            "IDDETALHEPEDIDO",
            "IDSUBGRUPOESTRUTURA",
            "IDCOR",
            "IDTAMANHO",
            "DSTAMANHO",
            "IDCATEGORIAPEDIDO",
            "IDTIPOTECIDO",
            "IDESTILO",
            "IDFABRICANTE",
            "IDLOCALEXPOSICAO",
            "IDCATEGORIAS",
            "IDNCM",
            "NUNCM",
            "IDTIPOPRODUTOFISCAL",
            "IDFONTEPRODUTOFISAL",
            "IDPRODCADASTRO",
            "NUREF",
            "CODBARRAS",
            "DSPRODUTO",
            "UND",
            "QTDPRODUTO",
            "VRCUSTO",
            "VRVENDA",
            "VRTOTALCUSTO",
            "DTCADASTRO",
            "DTULTATUALIZACAO",
            "STECOMMERCE",
            "STREDESOCIAL",
            "STATIVO",
            "STCANCELADO",
            "QTDESTOQUEIDEAL",
            "STMIGRADOSAP",
            "STREPOSICAO",
            "IDRESPCADASTRO",
            "IDRESPAUTORIZAEDITCAD",
            "IDFORNECEDOR",
            "STCADASTRADO",
            "IDDETALHEPRODUTOPEDIDOPRIMARIO"
        )
        SELECT
            TBD.IDRESUMOPEDIDO,
            TBD.IDDETALHEPEDIDO,
            TBD.IDSUBGRUPOESTRUTURA,
            TBD.IDCOR,
            TBT.IDTAMANHO,
            TBT.DSTAMANHO,
            TBD.IDCATEGORIAPEDIDO,
            TBD.IDTIPOTECIDO,
            TBE.IDESTILO,
            TBFB.IDFABRICANTE,
            TBL.IDLOCALEXPOSICAO,
            TBD.IDCATEGORIAS,
            0 AS IDNCM,
            TBP.NUNCM,
            TBP.IDTIPOPRODUTOFISCAL,
            TBP.IDFONTEPRODUTOFISCAL,
            CASE 
                WHEN TBR.STPEDIDOPRIMARIO = 'True' 
                    THEN ( REPLACE( TBP.IDPRODUTO, '_RN', '' ) || '_RN' )
                ELSE TBP.IDPRODUTO
            END IDPRODCADASTRO,
            TBD.NUREF,
            CASE 
                WHEN TBR.STPEDIDOPRIMARIO = 'True'
                    THEN 'SEM GTIN'
                ELSE TBP.NUCODBARRAS
            END CODBARRAS,
            TBP.DSNOME AS DSPRODUTO,
            TBU.DSSIGLA AS UND,
            TBD.QTDTOTAL AS QTDPRODUTO,
            TBD.VRUNITLIQUIDO AS VRCUSTO,
            TBD.VRVENDA AS VRVENDA,
            TBD.VRTOTAL AS VRTOTALCUSTO,
            CURRENT_TIMESTAMP AS DTCADASTRO,
            CURRENT_TIMESTAMP AS DTULTATUALIZACAO,
            TBD.STECOMMERCE,
            TBD.STREDESOCIAL,
            'True' AS STATIVO,
            TBD.STCANCELADO,
            0 AS QTDESTOQUEIDEAL,
            'False' AS STMIGRADOSAP,
            'True' AS STREPOSICAO,
            ? AS IDRESPCADASTRO,
            NULL AS IDRESPAUTORIZAEDITCAD,
            TBR.IDFORNECEDOR,
            'True' AS STCADASTRADO,
            TBDPP_PRIMARIO.IDDETALHEPRODUTOPEDIDO
        FROM
            "VAR_DB_NAME".DETALHEPEDIDO TBD
        INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO TBR ON
            TBD.IDRESUMOPEDIDO = TBR.IDRESUMOPEDIDO
        INNER JOIN "VAR_DB_NAME".COR TBCOR ON
            TBD.IDCOR = TBCOR.IDCOR
        INNER JOIN "VAR_DB_NAME".TIPOTECIDOS TBTT ON
            TBD.IDTIPOTECIDO = TBTT.IDTPTECIDO
        INNER JOIN "VAR_DB_NAME".CATEGORIAPEDIDO TBCP ON
            TBD.IDCATEGORIAPEDIDO = TBCP.IDCATEGORIAPEDIDO
        INNER JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON
            TBD.UND = TBU.IDUNIDADEMEDIDA
        INNER JOIN "VAR_DB_NAME".ESTILOS TBE ON
            TBD.IDESTILO = TBE.IDESTILO
        INNER JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBL ON
            TBD.IDLOCALEXPOSICAO = TBL.IDLOCALEXPOSICAO
        INNER JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
            TBD.IDSUBGRUPOESTRUTURA = TBSE.IDSUBGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBG ON
            TBSE.IDGRUPOESTRUTURA = TBG.IDGRUPOESTRUTURA
        INNER JOIN "VAR_DB_NAME".FORNECEDOR TBF ON
            TBR.IDFORNECEDOR = TBF.IDFORNECEDOR
        INNER JOIN "VAR_DB_NAME".FABRICANTE TBFB ON
            TBD.IDFABRICANTE = TBFB.IDFABRICANTE
        INNER JOIN "VAR_DB_NAME".CATEGORIAS TBC ON
            TBD.IDCATEGORIAS = TBC.IDCATEGORIAS
        INNER JOIN "VAR_DB_NAME".DETALHEPEDIDOGRADE AS TBDPG ON
            TBD.IDDETALHEPEDIDO = TBDPG.IDDETALHEPEDIDO AND TBDPG.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".TAMANHO AS TBT ON
            TBDPG.IDTAMANHO = TBT.IDTAMANHO
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBD.IDPRODUTO = TBP.IDPRODUTO
        LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP ON 
            TBD.IDDETALHEPEDIDO = TBDPP.IDDETALHEPEDIDO
        LEFT JOIN "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDPP_PRIMARIO ON 
            TBDPP_PRIMARIO.IDDETALHEPEDIDO = TBD.IDDETALHEPEDIDOPRIMARIO
        WHERE
            TBR.STCANCELADO = 'False'
            AND TBD.STCANCELADO = 'False'
            AND TBD.STTRANSFORMADO = 'False'
            AND TBD.STREPOSICAO = 'True'
            AND TBP.NUNCM IS NOT NULL
            AND TBP.IDTIPOPRODUTOFISCAL IS NOT NULL
            AND TBP.IDFONTEPRODUTOFISCAL IS NOT NULL
            AND TBDPP.IDDETALHEPEDIDO IS NULL
            AND TBR.IDRESUMOPEDIDO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.setInt(1, idFuncionario);   
    pStmt.setInt(2, idResumoPedido);
    
    pStmt.execute();
    pStmt.close();
    
    conn.commit();
}

function fnHandlePost(){
	let bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();
	
    for (let registro of bodyJson) {
        let idResumoPedidoSecundario = getIdResumoSecundario(registro.IDRESUMOPEDIDO);
        
        fnCriarDetalheProdutoPedido(registro.IDRESUMOPEDIDO, registro.IDFUNCIONARIO);
        
        if(idResumoPedidoSecundario > 0){
            fnCriarDetalheProdutoPedido(idResumoPedidoSecundario, registro.IDFUNCIONARIO);
        }
        
        atualizarStTransformadoDetPedido(registro.IDRESUMOPEDIDO)
    }
    
    conn.commit();
    
    return {
        "msg": 'Produto Criado com sucesso!'
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
    
} catch (e) {
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