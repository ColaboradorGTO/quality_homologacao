let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let clusulaPrincipal = '';
    let clusulaSubquery = ''
    
    if(!idEmpresa && !(dtInicio && dtFim)){
        return {
            "msg": 'Forneça o idEmpresa ou o dtInicio e dtFim e tente novamente!'
        }
    }
    
    let query = `
        SELECT
            TBDF.IDEMPRESA,
            TBE.NOFANTASIA,
            TO_VARCHAR(TBDF.DTPROCESSAMENTO, 'YYYY-MM-DD') AS DTPROCESSAMENTO,
            SUM(TBDF.VRRECEBIDO) AS VRTOTALRECEBIDO,
            (
                SELECT 
                    COUNT(A.IDDETALHEFATURA) 
                FROM 
                    "VAR_DB_NAME".DETALHEFATURA A
                WHERE
                    A.STCANCELADO = 'False'
                    AND A.IDCONSOLIDACAOFATURA IS NULL
                    AND A.IDEMPRESA = TBDF.IDEMPRESA
                    AND TO_DATE(A.DTPROCESSAMENTO) =  TO_DATE(TBDF.DTPROCESSAMENTO)
            ) AS QTDFATURAS,
            COUNT(IDDETALHEFATURA) AS QTDFATURASCONFERIDAS
        FROM  
            "VAR_DB_NAME".DETALHEFATURA TBDF
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBDF.IDEMPRESA = TBE.IDEMPRESA
        WHERE 
            1 = ?
            AND TBDF.STCONFERIDO = 'True'
            AND TBDF.STCANCELADO = 'False'
            AND TBDF.IDCONSOLIDACAOFATURA IS NULL
    `;
    
    if(idEmpresa > 0) {
        query += ` AND TBDF.IDEMPRESA = ${idEmpresa} `;
    }
    
    if(dtInicio && dtFim) {
        query += ` AND (TO_DATE(TBDF.DTPROCESSAMENTO) BETWEEN '${dtInicio}' AND '${dtFim}') `;
    }
    
    query += `
        GROUP BY 
            TBDF.IDEMPRESA,
            TBE.NOFANTASIA,
            TBDF.DTPROCESSAMENTO
        ORDER BY 
            TBDF.DTPROCESSAMENTO,
            TBDF.IDEMPRESA 
    `;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    return api.sqlQueryPage(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            //fnHandleGet();
            $.response.setBody(JSON.stringify(fnHandleGet()));
            break;
           
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}