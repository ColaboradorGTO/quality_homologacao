var api = $.import("quality.concentrador.api.apiResponse", "int_api");
let dbNameSAP = "SBO_GTO_TESTE4";

function fnHandleGet(chave) {

    var doctEntry = $.request.parameters.get("docEntry");
    var chave = $.request.parameters.get("chave");
    var idEmpresa = $.request.parameters.get("idEmpresa");
   
    var query = `
       SELECT
	A."U_ChaveAcesso" AS "Chave55",
	A."DocEntry", 
	A."Serial" AS "nNF",
	1 AS "indFinal",
	B."TaxIdNum",
	'GTO COMERCIO ATACADISTA DE CONFECCOES E CALCADOS LTDA' AS "xNome",
	B."State",
	D."AddrType" AS "xLgr",
	D."City" AS "xMun",
	K."IbgeCode" AS "municipioEmitente",
	D."ZipCode" AS "CEP",
	C."Phone1" AS "fone",
	F."State" AS "UF Dest",
	F."U_SKILL_indIEDest" AS "indIEDest",
	E."CardName" AS "xNomeDestinatario",
	CASE 
		WHEN IFNULL(G."TaxId0", '') <> '' AND IFNULL(G."TaxId4", '') = '' THEN G."TaxId0" 
		WHEN IFNULL(G."TaxId4", '') <> '' AND IFNULL(G."TaxId0", '') = '' THEN G."TaxId4" 
		ELSE 'N/A'
	END AS "CPF/CNPJ Dest",
	F."City" AS "xMun Dest",
	L."IbgeCode" AS "municipioDestinatario",
	A."DocTotal" AS "vNF",
	J."ItemCode" AS "CodItem",
	J."Dscription" AS "Descricao",
	J."PriceBefDi" AS "vProd"
FROM
	${dbNameSAP}.OINV A
INNER JOIN ${dbNameSAP}.OBPL B ON 
	A."BPLId" = B."BPLId"
INNER JOIN ${dbNameSAP}.OCRD C ON -- Informações emitente
	B.U_IS_PN_SAIDA = C."CardCode" 
INNER JOIN ${dbNameSAP}.CRD1 D ON -- Informações emitente
	C."CardCode" = D."CardCode" 
	AND D."LineNum" = 0
INNER JOIN ${dbNameSAP}.OCRD E ON -- Informações destinatário
	A."CardCode" = E."CardCode" 
INNER JOIN ${dbNameSAP}.CRD1 F ON -- Informações destinatário
	E."CardCode" = F."CardCode" 
	AND F."LineNum" = 0
INNER JOIN ${dbNameSAP}.CRD7 G ON 
	F."CardCode" = G."CardCode" 
	AND IFNULL(G."Address", '') = ''
INNER JOIN ${dbNameSAP}.INV12 H ON 
	A."DocEntry" = H."DocEntry" 
	AND H."MainUsage" = 57
INNER JOIN (
	SELECT
		A."U_DocEntry"
	FROM
		${dbNameSAP}."@SKL25NFE" A
	WHERE
		A."Code" = (SELECT MAX(XA."Code") FROM ${dbNameSAP}."@SKL25NFE" XA WHERE XA."U_DocEntry" = A."U_DocEntry")
		AND A."U_cdErro" = 100
) I ON A."DocEntry" = I."U_DocEntry"
INNER JOIN ${dbNameSAP}.INV1 J ON 
	A."DocEntry" = J."DocEntry" 
INNER JOIN ${dbNameSAP}.OCNT K ON 
	UPPER(B."State") = UPPER(K."State")
	AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    UPPER(TRIM(D."City")),
    'Á','A'),'À','A'),'Ã','A'),'Â','A'),'É','E'),
    'Ê','E'),'Í','I'),'Ó','O'),'Õ','O'),'Ú','U')
	= REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    UPPER(TRIM(K."Name")),
    'Á','A'),'À','A'),'Ã','A'),'Â','A'),'É','E'),
    'Ê','E'),'Í','I'),'Ó','O'),'Õ','O'),'Ú','U')
INNER JOIN ${dbNameSAP}.OCNT L ON 
	UPPER(F."State") = UPPER(L."State")
	AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    UPPER(TRIM(F."City")),
    'Á','A'),'À','A'),'Ã','A'),'Â','A'),'É','E'),
    'Ê','E'),'Í','I'),'Ó','O'),'Õ','O'),'Ú','U')
	= REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    UPPER(TRIM(L."Name")),
    'Á','A'),'À','A'),'Ã','A'),'Â','A'),'É','E'),
    'Ê','E'),'Í','I'),'Ó','O'),'Õ','O'),'Ú','U')
WHERE 1 = ?
	AND A."CANCELED" = 'N'
	AND A."Model" = 39
	AND B."State" <> F."State"
       
`;

    

    if (chave) {
        query = query + ' AND A."U_ChaveAcesso" = \'' + chave + '\' ';
    }
    
    if (doctEntry) {
        query = query + ' AND A."DocEntry" = ' + doctEntry + ' ';
    }
    
    query = query + ' ORDER BY A."DocEntry" DESC ';
    
    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };

    var response = api.sqlQueryPage(query, request, 1);
    var data = [];

    for (var i = 0; i < response.data.length; i++) {

        var registro = response.data[i];

        var venda = {
            "venda": {
                "chave": registro.Chave55,
                "nnf": registro.nNF,
                "docEntry": registro.DocEntry,
                "indFinal": registro.indFinal,
                "emitente": {
                    "CNPJ": registro.TaxIdNum,
                    "xNome": registro.xNome,
                    "state": registro.State,
                    "xLgr": registro.xLgr,
                    "xMun": registro.xMun,
                    "CEP": registro.CEP,
                    "fone": registro.fone,
                    "municipioEmitente": registro.municipioEmitente
                },
                "destinatario": {
                    "CNPJ": registro["CPF/CNPJ Dest"],
                    "xMun": registro["xMun Dest"],
                    "UF": registro["UF Dest"],
                    "indIEDest": registro.indIEDest,
                    "xNome": registro.CardName,
                    "Address": registro.Address,
                    "municipioDestinatario": registro.municipioDestinatario,
                    "CodItem": registro.CodItem,
                    "Descricao": registro.Descricao,
                    "xNomeDestinatario": registro.xNomeDestinatario,
                    "vProd": registro.vProd
                },
                "valorNota": registro.vNF
            },
        };

        data.push(venda);

    }

    response.data = data;

    return response;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var chave = $.request.parameters.get("chave");
			$.response.setBody(JSON.stringify(fnHandleGet(chave)));
			break;
        default:
            break;
	
	}

} catch (e) {
$.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}