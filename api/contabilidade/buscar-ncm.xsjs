
var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function fnHandleGet() {
    
    var idNcmExcecao       = $.request.parameters.get("idNcmExcecao");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim    = $.request.parameters.get("dataPesquisaFim");
    
    var query = `
    SELECT
        IDNCMEXCECAO,
        NUNCM,
        EX,
        TIPO,            
        TO_NVARCHAR(DSNCM) AS DSNCM,
        IMPNACIONAL,
        IMPIMPORTACAOFEDERAL,
        IMPESTADUAL,
        IMPMUNICIPAL,
        DTINICIOVIGENCIA,
        DTFIMVIGENCIA,
        PWCHAVE,
        NUVERSAO,
        FONTE,
        SGUF,
        PERCIBPT,
        DTULTALTERACAO,
        DTCRIACAO
    FROM "VAR_DB_NAME".NCMEXCECAO
    WHERE 1 = ?
    `;

    if (idNcmExcecao) {
        query += " AND IDNCMEXCECAO = '" + idNcmExcecao + "'";
    }

    if (dataPesquisaInicio && dataPesquisaFim) {
        query += " AND DTINICIOVIGENCIA <= TO_TIMESTAMP('" + dataPesquisaFim   + " 23:59:59', 'YYYY-MM-DD HH24:MI:SS')"
               + " AND DTFIMVIGENCIA   >= TO_TIMESTAMP('" + dataPesquisaInicio + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS')";
    }

    query += " ORDER BY IDNCMEXCECAO";

    var request = { 
        page:     $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = ` UPDATE "VAR_DB_NAME"."NCMEXCECAO" 
    SET 
        NUNCM= ?,
        EX= ?,          
        TIPO=?,
        DSNCM= ?,
        IMPNACIONAL= ?,             
        IMPIMPORTACAOFEDERAL=?,              
        IMPESTADUAL=?,               
        IMPMUNICIPAL=?,
        DTINICIOVIGENCIA= ?,
        DTFIMVIGENCIA= ?,
        PWCHAVE= ?,
        NUVERSAO= ?,
        FONTE= ?,
        SGUF= ?,                      
        PERCIBPT=?,
        DTULTALTERACAO= NOW()
        
        WHERE IDNCMEXCECAO=?;
    `;
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

		pStmt.setInt(1, registro.NUNCM);
        pStmt.setString(2, registro.EX);
        pStmt.setInt(3, registro.TIPO);
        pStmt.setString(4, registro.DSNCM);
        pStmt.setFloat(5, registro.IMPNACIONAL);
        pStmt.setFloat(6, registro.IMPIMPORTACAOFEDERAL);
        pStmt.setFloat(7, registro.IMPESTADUAL);
        pStmt.setFloat(8, registro.IMPMUNICIPAL);
        pStmt.setString(9, registro.DTINICIOVIGENCIA);
        pStmt.setString(10, registro.DTFIMVIGENCIA);
        pStmt.setString(11, registro.PWCHAVE);
        pStmt.setString(12, registro.NUVERSAO);
        pStmt.setString(13, registro.FONTE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setFloat(15, registro.PERCIBPT);
        
        pStmt.setInt(16, registro.IDNCMEXCECAO);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}


function fnHandlePost() 
{
    var conn = $.db.getConnection();
    
    var query = ` INSERT INTO "VAR_DB_NAME".NCMEXCECAO
        (
        IDNCMEXCECAO,
        NUNCM,
        EX,
        TIPO,
        DSNCM,
        IMPNACIONAL,
        IMPIMPORTACAOFEDERAL,
        IMPESTADUAL,
        IMPMUNICIPAL,
        DTINICIOVIGENCIA,
        DTFIMVIGENCIA,
        PWCHAVE,
        NUVERSAO,
        FONTE,
        SGUF,
        PERCIBPT,
        DTULTALTERACAO,
        DTCRIACAO
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW());
    `;
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());
    var proximoId = api.executeScalar(
            'SELECT IFNULL(MAX(TO_INT("IDNCMEXCECAO")), 0) + 1 FROM "VAR_DB_NAME"."NCMEXCECAO" WHERE 1 = ?', 1
        );

	for (var i = 0; i < bodyJson.length; i++) {
		var registro = bodyJson[i];
		
		pStmt.setInt(1, proximoId);
		pStmt.setInt(2, registro.NUNCM);
		pStmt.setString(3, registro.EX);
		pStmt.setInt(4, registro.TIPO);
		pStmt.setString(5, registro.DSNCM);
		pStmt.setFloat(6, registro.IMPNACIONAL);
		pStmt.setFloat(7, registro.IMPIMPORTACAOFEDERAL);
		pStmt.setFloat(8, registro.IMPESTADUAL);
		pStmt.setFloat(9, registro.IMPMUNICIPAL);
		pStmt.setString(10, registro.DTINICIOVIGENCIA);
		pStmt.setString(11, registro.DTFIMVIGENCIA);
		pStmt.setString(12, registro.PWCHAVE);
		pStmt.setString(13, registro.NUVERSAO);
		pStmt.setString(14, registro.FONTE);
		pStmt.setString(15, registro.SGUF);
		pStmt.setFloat(16, registro.PERCIBPT);
		pStmt.setString(17, registro.DTULTALTERACAO);
    	
        pStmt.execute();
        
         proximoId++;
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet();
            break;

             //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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