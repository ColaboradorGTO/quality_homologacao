let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idLista;

function fnHandleGet(byId) {
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let idLoja = $.request.parameters.get("idLoja");
    let idLista = $.request.parameters.get("idLista");
    let nomeLista = $.request.parameters.get("nomeLista");
    
    let query = `SELECT
                	"ListNum" as IDRESUMOLISTAPRECO,
                	"ListName" as NOMELISTA,
                	TO_VARCHAR("CreateDate", 'DD/MM/YYYY') AS DATACRIACAO,
                	TO_VARCHAR("UpdateDate", 'DD/MM/YYYY') AS DATAALTERACAO,
                	'True' as STATIVO
                FROM
                	SBO_GTO_PRD.OPLN
                WHERE
                    1 = ? `;
    
    if ( byId ) {
        query += ` AND TBR.IDRESUMOLISTAPRECO = ${byId}`;
    }
    
    if ( idLista ) {
        query += ` AND TBR.IDRESUMOLISTAPRECO = ${idLista}`;
    }
    
    if ( idLoja ) {
        query += ` AND TBD.IDEMPRESA = ${idLoja}`;
    }
    
    if ( nomeLista ) {
        query += ` AND CONTAINS((TBR.NOMELISTA, TBR.IDRESUMOLISTAPRECO), '%${nomeLista}%')`;
    } 
    
    if ( dtInicio && dtFim ) {
        query += ` AND (TBR.DATACRIACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59' OR TBR.DATAALTERACAO BETWEEN '${dtInicio} 00:00:00' AND '${dtFim} 23:59:59')`;
    }
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    query += ` ORDER BY "ListName", "ListNum" `;
    
    //api.responseWithQuery(query, request, 1);
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		let listaPreco = {
			"listaPreco": {
				"IDRESUMOLISTAPRECO": registro.IDRESUMOLISTAPRECO,
				"NOMELISTA": registro.NOMELISTA,
				"IDUSERCRIACAO": registro.IDUSERCRIACAO,
				"DATACRIACAO": registro.DATACRIACAO,
				"DTCREATE": registro.DTCREATE,
				"IDUSERALTERACAO": registro.IDUSERALTERACAO,
				"DATAALTERACAO": registro.DATAALTERACAO,
				"DTALTER": registro.DTALTER,
				"STATIVO": registro.STATIVO,
			},
		//	"detalheLista": obterLinhasDoDetalhe(registro.IDRESUMOLISTAPRECO)
		};

		data.push(listaPreco);
 
	}

	response.data = data;

	return response;
    
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
           $.response.setBody(JSON.stringify(fnHandleGet(id)));
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
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}