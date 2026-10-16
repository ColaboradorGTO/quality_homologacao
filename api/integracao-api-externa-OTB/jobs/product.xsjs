let path = "quality.concentrador_homologacao.api";

let api = $.import(path, "apiResponse");
let integracaoOTBService  = $.import(path + ".integracao-api-externa-OTB.libs.services", "integracaoOTBService");

let dbNameSAP = 'SBO_GTO_PRD';
let VAR_DB_NAME = 'QUALITY_CONC';

function getDados(){
    let dataInicial = '11.06.2026';
    
    let query = `
        SELECT
            'N' AS "IsProccessed",
            A.IDPRODUTO AS "ProductCode",
            A.DSNOME AS "BriefDescription",
            A.DSNOME AS "Description",
            A.IDFORNECEDORSAP AS "SupplierCode",
            A.NUREFERENCIA AS "SupplierProductReference",
            A.IDCOR AS "ColorCode",
            B.DSCOR AS "ColorDescription",
            A.IDTAMANHO AS "SizeCode",
            E.IDGRUPOESTRUTURA AS "LevelCode1",
            IFNULL(D.TPSECAO, '') AS "LevelDescription1",
            D.IDSUBGRUPOESTRUTURA AS "LevelCode2",
            D.DSSUBGRUPOESTRUTURA AS "LevelDescription2",
            F.IDCATEGORIAS AS "LevelCode3",
            F.DSCATEGORIAS AS "LevelDescription3",
            G.IDESTILO AS "AttributeCode1",
            G.DSESTILO AS "AttributeDesc1",
            C.IDCATEGORIAPEDIDO AS "AttributeCode2",
            C.TIPOPEDIDO AS "AttributeDesc2",
            E.IDGRUPOESTRUTURA AS "AttributeCode3",
            E.DSGRUPOESTRUTURA AS "AttributeDesc3"
            --TO_VARCHAR(A.DTULTALTERACAO, 'YYYY-MM-DD') AS DATA_DADOS,
            --TO_VARCHAR(CURRENT_DATE, 'YYYY-MM-DD') AS DATA_DADOS
        FROM
            "${VAR_DB_NAME}".PRODUTO A
        LEFT JOIN "${VAR_DB_NAME}".COR B ON 
            A.IDCOR = B.IDCOR
        INNER JOIN "${VAR_DB_NAME}".CATEGORIAPEDIDO C ON 
            A.IDCATEGORIAPEDIDO = C.IDCATEGORIAPEDIDO
        INNER JOIN "${VAR_DB_NAME}".SUBGRUPOESTRUTURA D ON 
            A.IDSUBGRUPO = D.IDSUBGRUPOESTRUTURA
        INNER JOIN "${VAR_DB_NAME}".GRUPOESTRUTURA E ON 
            D.IDGRUPOESTRUTURA = E.IDGRUPOESTRUTURA
        INNER JOIN "${VAR_DB_NAME}".CATEGORIAS F ON 
            A.IDCATEGORIAS = F.IDCATEGORIAS
        LEFT JOIN "${VAR_DB_NAME}".ESTILOS G ON 
            A.IDESTILO = G.IDESTILO
       -- LEFT JOIN "VAR_DB_NAME".RESUMOINTEGRACAOOTB H ON 
            --TO_VARCHAR(DTULTALTERACAO, 'YYYY-MM-DD') = TO_VARCHAR(H.DTDADOSINTEGRACAOOTB, 'YYYY-MM-DD')
        WHERE 
            1 = ?
            AND IFNULL(A.IDFORNECEDORSAP, '') <> ''
            AND A.IDFORNECEDORSAP IN (
                SELECT DISTINCT 
                    A."CardCode"
                FROM
                    ${dbNameSAP}.OCRD A
                INNER JOIN ${dbNameSAP}.CRD7 B ON 
                    A."CardCode" = B."CardCode"
                INNER JOIN ${dbNameSAP}.OPOR C ON 
                    A."CardCode" = C."CardCode"
                WHERE 
                    A."CardType" = 'S'
                    AND IFNULL(B."TaxId0", '') <> ''
            )
            AND TO_DATE(A.DTULTALTERACAO) = ADD_DAYS(CURRENT_DATE, -1)
            --AND TO_DATE(A.DTULTALTERACAO) BETWEEN '${dataInicial}' AND ADD_DAYS(CURRENT_DATE, -1)
            --AND H.IDRESUMOINTEGRACAOOTB IS NULL
            AND IFNULL(D.TPSECAO, '') <> ''
    `;

    return api.sqlQuery(query, 1);
}

function getDadoQueDeramErroParaIntegrarNovamente(idResumoIntegracaoOTB){
    let query = `
        SELECT
            TBR.IDRESUMOINTEGRACAOOTB,
            TBD.IDDETALHEINTEGRACAOOTB,
            TBD.PAYLOAD
        FROM
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB TBR
        INNER JOIN "VAR_DB_NAME".DETALHEINTEGRACAOOTB TBD ON 
            TBR.IDRESUMOINTEGRACAOOTB = TBD.IDRESUMOINTEGRACAOOTB
        WHERE 
            TBR.NOMEAPI = 'Product'
            AND TBD.STATUS = 'ERROR'
            AND TBD.TENTATIVAS < 3
            AND LENGTH(TBD.PAYLOAD) > 0
            AND 1 = ?
    `;
    
    if(idResumoIntegracaoOTB){
        query += ` AND IDRESUMOINTEGRACAOOTB = ${idResumoIntegracaoOTB} `;
    }

    return api.sqlQuery(query, 1);
}

function integrarDadosProdutosOTB(){
    let config = {
        nomeAPI: "Product",
        endpoint: "/StageContent/api/Product",
        tamanhoLote: 5000,
        arrayDados: getDados()
    };
    //return config
    integracaoOTBService.executarIntegracao(config);
    
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

function integrarDadosProdutosOTBQueDeramErro(){
    let { token} = auth.getAcessToken()
    return token
    let urlAPI = "/StageContent/api/Product";
    let dadosRepescagem = getDadoQueDeramErroParaIntegrarNovamente();
    //return dadosRepescagem
    integracaoOTBService.executarRepescagemIntegracao(urlAPI, dadosRepescagem);
    
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

try {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var docReturn = fnHandleGet();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        
        //Handle your POST calls here
        case $.net.http.POST:
            var docReturn = integrarDadosProdutosOTB();
            $.response.setBody(JSON.stringify(docReturn));
            break;
        
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = integrarDadosProdutosOTBQueDeramErro();
            $.response.setBody(JSON.stringify(docReturn));
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