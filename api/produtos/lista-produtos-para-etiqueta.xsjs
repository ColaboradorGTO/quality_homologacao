var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idLista = $.request.parameters.get("idLista");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var query;
    
  /*  query = `
        SELECT
            XA."ItemCode" AS IDPRODUTO,
            XA."CodeBars" AS NUCODBARRAS,
            XA."ItemName" AS DSNOME,
            XA."Price" as PRECOVENDA,
            XA."Tamanho" AS TAMANHO,
            XA."Grupo" AS GRUPO,
            XA."Estilo" AS DSESTILO,
            XA."local" AS DSLOCALEXPOSICAO,
            XA."ListName" AS DSLISTAPRECO,
            XA."FirmName" AS MARCA
        FROM
            (
                SELECT
                A."ItemCode",
                A."U_IS_EAN_GTO" AS "CodeBars",
                A."ItemName",
                CAST(B."Price" AS decimal) AS "Price",
                K."ListName",
                CASE
                	WHEN IFNULL(H."DSTAMANHO", '') <> '' THEN H."DSTAMANHO"
                	WHEN IFNULL(H."DSTAMANHO", '') = '' AND IFNULL(A."U_TAM", '') <> '' THEN A."U_TAM"
                	ELSE (
                		SELECT
                			"Name"
                		FROM
                			SBO_GTO_PRD."@OTB_ESCALA_TAMANHO" XA
                		WHERE
                			TO_CHAR(XA."Code") = TO_CHAR(A."U_CodigoDoTamanho")
                	)
                END AS "Tamanho",
                1 AS "Quantity",
                CASE
                	WHEN A."U_GRP_EMP" = 1 THEN 'Tesoura'
                	WHEN A."U_GRP_EMP" = 2 THEN 'Magazine'
                	WHEN A."U_GRP_EMP" = 3 THEN 'Yorus'
                	WHEN A."U_GRP_EMP" = 4 THEN 'Free Center'
                END AS "Grupo",
                CASE
                    WHEN IFNULL(F."DSESTILO", '') <> '' AND IFNULL(C."Estilo", '') = '' THEN J."U_Desc" || '-' || F."DSESTILO"
                    WHEN IFNULL(C."Estilo", '') <> '' AND IFNULL(F."DSESTILO", '') = '' THEN C."Estilo"
                    WHEN TBG.IDGRUPOESTRUTURA = 9 THEN 'Intimo' || '-' || D."U_Desc" || '-' || F."DSESTILO"
                    WHEN IFNULL(F."DSESTILO", '') <> '' AND IFNULL(C."Estilo", '') <> '' THEN J."U_Desc" || '-' || F."DSESTILO"
                ELSE D."U_Desc"
                END "Estilo",
                IFNULL(A."U_LOCAL", G."DSLOCALEXPOSICAO") AS "local",
                L."FirmName"
                FROM
                    SBO_GTO_PRD.OITM A
                LEFT JOIN SBO_GTO_PRD.ITM1 B ON
                    B."ItemCode" = A."ItemCode"
                LEFT JOIN SBO_GTO_PRD."VW_ESTILO_ETIQUETA" C ON
                    C."ItemCode" = A."ItemCode"
                LEFT JOIN SBO_GTO_PRD.OITB D ON
                    A."ItmsGrpCod" = D."ItmsGrpCod"
                LEFT JOIN "VAR_DB_NAME"."PRODUTO" E ON
                    A."ItemCode" = E."IDPRODUTO"
                LEFT JOIN "VAR_DB_NAME"."ESTILOS" F ON
                    E."IDESTILO" = F."IDESTILO"
                LEFT JOIN "VAR_DB_NAME"."LOCALEXPOSICAO" G ON
                    E."IDLOCALEXPOSICAO" = G."IDLOCALEXPOSICAO"
                LEFT JOIN "VAR_DB_NAME"."TAMANHO" H ON
                    E."IDTAMANHO" = H."IDTAMANHO"
                LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA I ON
                    E.IDSUBGRUPO = I.IDSUBGRUPOESTRUTURA
                LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBG ON
                    I.IDGRUPOESTRUTURA = TBG.IDGRUPOESTRUTURA
                LEFT JOIN SBO_GTO_PRD.OITB J ON
                    I.IDSAP = J."ItmsGrpCod"
                INNER JOIN SBO_GTO_PRD.OPLN K ON 
                    B."PriceList" = K."ListNum"
                INNER JOIN SBO_GTO_PRD.OMRC L ON
                    A."FirmCode" = L."FirmCode"
                WHERE
                    A."U_IS_EAN_GTO" IS NOT NULL
                    AND A."ItmsGrpCod" NOT IN (100, 134)
                    AND A."FirmCode" NOT IN (1583)
                    AND 1 = ? 
    `;

    if(byId){
        query += ` AND A."ItemCode" = '${byId}' `;
    }
    
    if(idLista){
        query += ` AND B."PriceList" = '${idLista}' `;
    }
    
    if(descProd){
        descProd = descProd.trim().toUpperCase();
        descProd = descProd.split(' ').join('%');
        query += ` AND UPPER(A."ItemName") LIKE '%${descProd}%' `;
    }
    
    if(codeBars){
        codeBars = codeBars.trim();
        query += ` AND A."CodeBars" = '${codeBars}' `;
    }*/
    
     if(!idEmpresa){
        query = `
            SELECT
                DISTINCT TBP.IDPRODUTO,
                TO_VARCHAR(IFNULL(TBP.DTCADASTRO, (SELECT "CreateDate" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = TBP.IDPRODUTO)), 'DD/MM/YYYY HH24:MI:SS') AS DTCADASTRO,
                (CASE
                	WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0
                	ELSE TBP.IDGRUPOEMPRESARIAL
                END) AS IDGRUPOEMPRESARIAL,
                (CASE
                	WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                	ELSE TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                CASE
                	WHEN IFNULL(TBT.DSTAMANHO, '') <> '' THEN TBT.DSTAMANHO
                	WHEN IFNULL(TBT.DSTAMANHO, '') = ''
                	AND IFNULL(SPOITM.U_TAM, '') <> '' THEN SPOITM.U_TAM
                	ELSE (
                	SELECT
                		"Name"
                	FROM
                		SBO_GTO_PRD."@OTB_ESCALA_TAMANHO" XA
                	WHERE
                		TO_CHAR(XA."Code") = TO_CHAR(SPOITM."U_CodigoDoTamanho") )
                END AS TAMANHO,
                CASE
                    WHEN IFNULL(DSESTILO, '') <> '' AND IFNULL(C."Estilo", '') = '' THEN D."U_Desc" || '-' || TBES. DSESTILO
                    WHEN IFNULL(C."Estilo" , '') <> '' AND IFNULL(TBES.DSESTILO, '') = '' THEN C."Estilo"
                    WHEN TBGS.IDGRUPOESTRUTURA = 9 THEN 'Intimo' || '-' || D."U_Desc" || '-' || TBES. DSESTILO
                    WHEN IFNULL(TBES. DSESTILO, '') <> '' AND IFNULL(UPPER(TBES. DSESTILO), '') <> 'NENHUM' AND IFNULL(C."Estilo" , '') <> '' THEN D."U_Desc"  || '-' || TBES. DSESTILO
                    ELSE D."U_Desc"
                END AS DSESTILO,
                --TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA,
                (SELECT NOMELISTA FROM "VAR_DB_NAME".RESUMOLISTAPRECO WHERE IDRESUMOLISTAPRECO = TBHP.IDRESUMOLISTAPRECO OR IDRESUMOLISTAPRECO = ${idLista}) AS DSLISTAPRECO
            FROM
                "VAR_DB_NAME".PRODUTO TBP
            LEFT JOIN "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP ON
            	TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBP.STATIVO = 'True' AND TBHP.STATIVO = 'True' 
            	AND TBHP.IDRESUMOLISTAPRECO = ${idLista}
            LEFT JOIN SBO_GTO_PRD.OITM SPOITM ON
            	TBP.IDPRODUTO = SPOITM."ItemCode" 
            LEFT JOIN SBO_GTO_PRD.OITB D ON
            	SPOITM."ItmsGrpCod" = D."ItmsGrpCod" 
            LEFT JOIN "VAR_DB_NAME".TAMANHO TBT ON
            	TBP. IDTAMANHO = TBT. IDTAMANHO
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
            	TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
            	TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
            	(TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
            	TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
            	TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
            	TBES.IDESTILO = TBP.IDESTILO
            LEFT JOIN SBO_GTO_PRD. VW_ESTILO_ETIQUETA C ON
            	TBP.IDPRODUTO = C."ItemCode" 
            WHERE 
                1 = ?
        `;
    } else{
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                TO_VARCHAR(IFNULL(TBP.DTCADASTRO, (SELECT "CreateDate" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = TBP.IDPRODUTO)), 'DD/MM/YYYY HH24:MI:SS') AS DTCADASTRO,
                (CASE 
                	WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                	ELSE TBP.IDGRUPOEMPRESARIAL 
                END) AS IDGRUPOEMPRESARIAL,
                (CASE 
                	WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                	ELSE  TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBPP.IDEMPRESA,
                TBEMP.NOFANTASIA AS DSLISTAPRECO,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA ) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                CASE
                	WHEN IFNULL(TBT.DSTAMANHO, '') <> '' THEN TBT.DSTAMANHO
                	WHEN IFNULL(TBT.DSTAMANHO, '') = ''
                	AND IFNULL(SPOITM.U_TAM, '') <> '' THEN SPOITM.U_TAM
                	ELSE (
                	SELECT
                		"Name"
                	FROM
                		SBO_GTO_PRD."@OTB_ESCALA_TAMANHO" XA
                	WHERE
                		TO_CHAR(XA."Code") = TO_CHAR(SPOITM."U_CodigoDoTamanho") ) 
                END AS TAMANHO,
                CASE
                    WHEN IFNULL(DSESTILO, '') <> '' AND IFNULL(C."Estilo", '') = '' THEN D."U_Desc" || '-' || TBES. DSESTILO
                    WHEN IFNULL(C."Estilo" , '') <> '' AND IFNULL(TBES.DSESTILO, '') = '' THEN C."Estilo"
                    WHEN TBGS.IDGRUPOESTRUTURA = 9 THEN 'Intimo' || '-' || D."U_Desc" || '-' || TBES. DSESTILO
                    WHEN IFNULL(TBES. DSESTILO, '') <> '' AND IFNULL(UPPER(TBES. DSESTILO), '') <> 'NENHUM' AND IFNULL(C."Estilo" , '') <> '' THEN D."U_Desc"  || '-' || TBES. DSESTILO
                    ELSE D."U_Desc"
                END AS DSESTILO,
                --TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".PRODUTO_PRECO TBPP
            INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBPP.IDPRODUTO = TBP.IDPRODUTO AND TBP.STATIVO =  'True'
            LEFT JOIN SBO_GTO_PRD.OITM SPOITM ON
            	TBP.IDPRODUTO = SPOITM."ItemCode" 
            LEFT JOIN SBO_GTO_PRD.OITB D ON
            	SPOITM."ItmsGrpCod" = D."ItmsGrpCod" 
            LEFT JOIN "VAR_DB_NAME".TAMANHO TBT ON
            	TBP. IDTAMANHO = TBT. IDTAMANHO
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            INNER JOIN "VAR_DB_NAME".EMPRESA TBEMP ON
                TBPP.IDEMPRESA = TBEMP.IDEMPRESA
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            LEFT JOIN SBO_GTO_PRD. VW_ESTILO_ETIQUETA C ON
            	TBP.IDPRODUTO = C."ItemCode" 
            WHERE 
                TBPP.IDEMPRESA = ${idEmpresa}
                AND 1 = ?
        `;
    }
    
    if ( byId ) {
        query += ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if(idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='51' || idEmpresa ==='86'){
        
        if(idEmpresa ==='31' || idEmpresa ==='109'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2)`;
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else if(idEmpresa ==='51'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else{
            query += `AND (TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL)`; 
        }
    }
    
    if ( codeBars ) {
        query += ` And  TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( descProd ) {
       // descProd = descProd.split(' ').join('%');
        
        query += ` And  CONTAINS((tbp.DSNOME), '%${descProd}%')`;
    }
    
    if(idLista){
       // query +=  ` AND TBHP.IDRESUMOLISTAPRECO = ${idLista} `;
    }
    
    query += ` ORDER BY TBP.DSNOME , TBP.IDPRODUTO `;
    //return { query }
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
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
           //$.response.setBody(JSON.stringify(fnHandleGet(id)));
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