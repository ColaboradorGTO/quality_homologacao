var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(idvenda) {
    let query = `
        SELECT TOP 100
        	TBV.IDVENDA,
        	TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
        	SUBSTRING(TBV.NFE_INFNFE_ID, 4, 50) as "CHAVE" 
        FROM 
        	"VAR_DB_NAME".VENDA TBV
        WHERE 
        	1 = ?
        	AND TBV.PROTNFE_INFPROT_CSTAT <> 100 
        	and TBV.STCANCELADO = 'False'
        	and TBV.STVALIDACONTINGENCIA = 'False'
        	and TBV.NFE_INFNFE_IDE_TPAMB = 1
        	AND TBV.NFE_INFNFE_IDE_MOD = 65
        	AND TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '2024.01.01' AND '2025.10.14'
        	AND NOT EXISTS (
        		SELECT 
        			1
        		FROM 
        			SBO_GTO_PRD.OINV XA 
        		WHERE 
        	        XA.CANCELED = 'N' 
        	        AND XA.U_ID_VENDA_PDV = TBV.IDVENDA
        					)
    `;
    
    if(idvenda) {
        query += ` AND TBV.IDVENDA = '${idvenda}'`;
    }
    
    let response = api.sqlQuery(query, 1);
    
    return response;
};

function fnHandlePut(bodyJson) {
    let conn = $.db.getConnection();
    
    let query = `
        UPDATE
            "VAR_DB_NAME".VENDA TBV
        SET
        	TBV.STVALIDACONTINGENCIA = 'True'
        WHERE
            TBV.STVALIDACONTINGENCIA = 'False'
        	AND TBV.IDVENDA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let registro of bodyJson) {
        pStmt.setString(1, registro.IDVENDA);
        pStmt.execute();
    }
    
    pStmt.close();
	conn.commit();
    
    return {
	    msg : "Atualização realizada com sucesso!"
	};
};

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
    		let idvenda = $.request.parameters.get("idvenda");
    		$.response.setBody(JSON.stringify(fnHandleGet(idvenda)));
		break;
		
		//Handle your GET calls here
        case $.net.http.PUT:
            let bodyJson = JSON.parse($.request.body.asString());
            let docReturn = fnHandlePut(bodyJson);
            $.response.setBody(JSON.stringify(docReturn));
        break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}