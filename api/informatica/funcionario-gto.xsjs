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

function fnHandleGet(byId) {

    var nuCPF = $.request.parameters.get("nuCPF");
  
    var query = `
      SELECT DISTINCT
        T5.PFUDTINICIOCONTRATO,
        T5.PFUDTTERMINOCONTRATO,
        T3."FILNOMEFILIAL" AS "LOJA",
        T1."PESCODPESSOA" AS "MATRICULA",
        T4."PFICPFNUMERODIGITO" AS CPF,
        T1."PESNOMEEXTENSO" AS "NOME",
        T1."PESEMAIL" AS "EMAIL",
        TO_VARCHAR(T4."PFIDATANASCIM",'DD-MM-YYYY') AS "DTNASCIMENTO",
        T2."DENOMINACAO" AS "CARGO",
        CASE
          WHEN MAX(T0."FIHDTFIMVIGENCIA") < CURRENT_DATE THEN 'SIM'
          ELSE 'NAO'
        END "ÄTINGIU_FIM",
        CASE
          WHEN ADD_MONTHS (MAX(T0."FIHDTFIMVIGENCIA"), 11) < CURRENT_DATE THEN 'SIM'
          ELSE 'NAO'
        END "ÄTINGIU_LIMITE"
      FROM
        "HUMANUS_PROD"."FICHAFINANC_HEADER" AS T0
        INNER JOIN "HUMANUS_PROD"."PESSOA_PESS" AS T1 ON T0."FIHCODPESSOA" = T1."PESCODPESSOA"
        INNER JOIN "HUMANUS_PROD"."CES_CARGO" AS T2 ON T0."FIHCODCARGO" = T2."CODCARGO"
        INNER JOIN "HUMANUS_PROD"."FILIAL" AS T3 ON T0."FIHNROFILIAL" = T3."FILNROFILIAL" AND T0."FIHCODEMPRESA" = T3."FILCODEMPRESA"
        INNER JOIN "HUMANUS_PROD".PESSOA_FISICA AS T4 ON T1.PESCODPESSOA = T4.PFICODPESSOA
      WHERE
        1 = ?
        AND T0."FIHDATACOMPET" = (
          SELECT MAX(T00."FIHDATACOMPET")
          FROM "HUMANUS_PROD"."FICHAFINANC_HEADER" AS T00
          WHERE T00."FIHCODPESSOA" = T0."FIHCODPESSOA"
        )
        AND T0."FIHULTSITUACAO" = 1
    `;

    
    
    if(byId){
      query = query + ' AND t4."PFICPFNUMERODIGITO" = \''+byId+'\'';
    }
    
    query = query + `  
      GROUP BY 
        T5.PFUDTINICIOCONTRATO, 
        T5.PFUDTTERMINOCONTRATO, 
        T4."PFIDATANASCIM", 
        T3."FILNOMEFILIAL", 
        T1."PESCODPESSOA", 
        T1."PESNOMEEXTENSO",
        T1."PESEMAIL", 
        T2."DENOMINACAO",
        T0."FIHDATAINICIOATS",
        T0."FIHULTSITUACAO",
        T3."FILNROFILIAL",
	      T4."PFICPFNUMERODIGITO"
    `
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

        case $.net.http.GET:
            var cpf = $.request.parameters.get("cpf");
            fnHandleGet(cpf);
            break;
                 
        default:
            break;    
       
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}