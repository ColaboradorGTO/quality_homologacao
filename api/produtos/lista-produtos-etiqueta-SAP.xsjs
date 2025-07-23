var api = $.import("quality.concentrador.api.apiResponse", "int_api");

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
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var query;
    
    query = `
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
                    WHEN IFNULL(F.DSESTILO, '') <> '' AND IFNULL(C."Estilo", '') = '' THEN D."U_Desc" || '-' || F.DSESTILO
                    WHEN IFNULL(C."Estilo" , '') <> '' AND IFNULL(F.DSESTILO, '') = '' THEN C."Estilo"
                    WHEN TBG.IDGRUPOESTRUTURA = 9 THEN 'Intimo' || '-' || D."U_Desc" || '-' || F.DSESTILO
                    WHEN IFNULL(F. DSESTILO, '') <> '' AND IFNULL(UPPER(F.DSESTILO), '') <> 'NENHUM' AND IFNULL(C."Estilo" , '') <> '' THEN D."U_Desc"  || '-' || F.DSESTILO
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
    }
    
    query += ` ORDER BY "ItemName" ASC ) XA `;
    
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