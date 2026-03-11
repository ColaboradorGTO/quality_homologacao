var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(idvenda) {
    let query = `
        SELECT TOP 150
        	TBV.IDVENDA,
        	TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
        	TBV.NFE_INFNFE_IDE_MOD,
        	TBV.NFE_INFNFE_IDE_TPAMB,
        	SUBSTRING(TBV.NFE_INFNFE_ID, 4, 50) as "CHAVE"
        FROM 
        	"VAR_DB_NAME".VENDA TBV
        WHERE 
        	1 = ?
        	AND TBV.PROTNFE_INFPROT_CSTAT <> 100 
        	AND TBV."STVALIDACONTINGENCIA" = 'False'
        	and TBV.STCANCELADO = 'False'
        	and TBV.NFE_INFNFE_IDE_TPAMB = 2
        	AND TBV.NFE_INFNFE_IDE_MOD = 65
        	AND TBV.TXTOBSCORRECAOCONTINGENCIA IS NULL
        	AND TBV.SAP_DOCENTRY IS NULL
        	AND TBV.SAP_DOCENTRY_CORRETO IS NULL
        	AND TBV.IDVENDA IN ('42-0-54')
        	AND TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '2022.11.01' AND '2025.11.30'
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
    
    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    // api.sqlQuery(query, request, 1);
    api.responseWithQuery(query, request, 1);
    
    
};
// function fnHandleGet(idvenda) {
//     let query = `
//         SELECT TOP 20
//         	TBV.IDVENDA,
//         	TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
//         	NFE_INFNFE_EMIT_CNPJ,
//         	SUBSTRING(TBV.NFE_INFNFE_ID, 4, 50) as "CHAVE",
//         FROM 
//         	"VAR_DB_NAME".VENDA TBV
//         WHERE 
//         	1 = ?
//         	AND TBV.PROTNFE_INFPROT_CSTAT <> 100 
//         	AND TBV."STVALIDACONTINGENCIA" = 'False'
//         	and TBV.STCANCELADO = 'False'
//         	and TBV.NFE_INFNFE_IDE_TPAMB = 1
//         	AND TBV.NFE_INFNFE_IDE_MOD = 65
//         	AND TBV.TXTOBSCORRECAOCONTINGENCIA IS NULL
//         	AND TBV.SAP_DOCENTRY IS NULL
//         	AND TBV.SAP_DOCENTRY_CORRETO IS NULL
//         	AND TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '2024.01.01' AND '2025.10.16'
//         	AND NOT EXISTS (
//         		SELECT 
//         			1
//         		FROM 
//         			SBO_GTO_PRD.OINV XA 
//         		WHERE 
//         	        XA.CANCELED = 'N' 
//         	        AND XA.U_ID_VENDA_PDV = TBV.IDVENDA
//         					)
//     `;
    
//     if(idvenda) {
//         query += ` AND TBV.IDVENDA = '${idvenda}'`;
//     }
    
//     var request = {
//         page: $.request.parameters.get("page"),
//         pageSize: $.request.parameters.get("pageSize")
//     };
    
//     // api.sqlQuery(query, request, 1);
//     api.responseWithQuery(query, request, 1);
// };

function fnHandleGetSefaz(idvenda) {
    let query = `
        SELECT TOP 100
        	TBV.IDVENDA,
        	TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
        	NFE_INFNFE_EMIT_CNPJ,
        	SUBSTRING(TBV.NFE_INFNFE_ID, 4, 50) as "CHAVE",
            TBV."NFE_INFNFE_IDE_SERIE" AS "SERIE",
            TBV."NFE_INFNFE_IDE_NNF" AS "NF",
            TBV."PROTNFE_INFPROT_CHNFE" AS "CHAVENFE",
            TBV."NFE_INFNFE_IDE_MOD",
            TBV."NFE_INFNFE_EMIT_NOME",
            TBV."NFE_INFNFE_EMIT_FANT",
            TBV."NFE_INFNFE_EMIT_ENDEREMIT_XLGR",
            TBV."NFE_INFNFE_EMIT_ENDEREMIT_NRO",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_XBAIRRO",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_CMUN",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_XMUN",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_UF",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_CEP",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_CPAIS",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_XPAIS",
		    TBV."NFE_INFNFE_EMIT_ENDEREMIT_FONE",
		    TBV."NFE_INFNFE_EMIT_IE",
		    TBV."NFE_INFNFE_EMIT_CRT",
            TBV."STCONTINGENCIA",
            TBV."STCANCELADO",
            TBV."TXTMOTIVOCANCELAMENTO",
            TBV."VRTOTALPAGO",
            TBV."PROTNFE_INFPROT_CSTAT",
            TBV."PROTNFE_INFPROT_XMOTIVO",
            TBV."DTHORAFECHAMENTO"
        FROM 
        	"VAR_DB_NAME".VENDA TBV
        WHERE 
        	1 = ?
        	AND TBV.PROTNFE_INFPROT_CSTAT <> 100 
        	AND TBV."STVALIDACONTINGENCIA" = 'False'
        	and TBV.STCANCELADO = 'False'
        	and TBV.NFE_INFNFE_IDE_TPAMB = 1
        	AND TBV.NFE_INFNFE_IDE_MOD = 65
        	AND TBV.TXTOBSCORRECAOCONTINGENCIA IS NULL
        	AND TBV.SAP_DOCENTRY IS NULL
        	AND TBV.SAP_DOCENTRY_CORRETO IS NULL
        	AND TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '2024.01.01' AND '2025.10.16'
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
    
    var request = {
        page: $.request.parameters.get("page"),
        pageSize: $.request.parameters.get("pageSize")
    };
    
    // api.sqlQuery(query, request, 1);
    api.responseWithQuery(query, request, 1);
    
    
};

function fnHandlePut() {
    let conn = $.db.getConnection();
    var bodyJson;
    let query = `
        UPDATE
            "VAR_DB_NAME"."VENDA" TBV
        SET
        	TBV."STVALIDACONTINGENCIA" = 'True',
        	TBV."STCONTINGENCIA" = 'True'
        WHERE
            TBV."STVALIDACONTINGENCIA" = 'False'
        	AND TBV."IDVENDA" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    bodyJson = JSON.parse($.request.body.asString());
    if (!Array.isArray(bodyJson)) bodyJson = [bodyJson];
    for(var i = 0; i < bodyJson.length; i++) {
        var registro = bodyJson[i];
        pStmt.setString(1, registro.IDVENDA);
        pStmt.execute();
    }
    
    pStmt.close();
	conn.commit();
    
    return {
	    msg : "Atualização realizada com sucesso!",
	    data: bodyJson
	};
};

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
    		let idvenda = $.request.parameters.get("idvenda");
    		fnHandleGet(idvenda);
		break;
		
		//Handle your GET calls here
        case $.net.http.PUT:
            let doc = fnHandlePut();
            $.response.setBody(JSON.stringify(doc));
        break;
        default:
            break;
	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}