let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {

    let nnf = $.request.parameters.get("nnf");
    let serie = $.request.parameters.get("serie");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idLojaUser = $.request.parameters.get("idLojaUser");
    let idSubgrupoEmpresarial = $.request.parameters.get("idSubgrupoEmpresarial");
    let cpfouIdVenda = $.request.parameters.get("cpfouIdVenda");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    
	let query = `
        SELECT
            TBV.IDVENDA,
            TBV.NFE_INFNFE_IDE_NNF,
            TBV.IDCAIXAWEB,
            TBC.DSCAIXA,
            TBV.IDOPERADOR,
            TBF.NOFUNCIONARIO,
            TBV.IDEMPRESA,
            TBE.NOFANTASIA,
            TO_VARCHAR(TBV.DTHORAABERTURA, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAABERTURA,
            TBV.VRRECDINHEIRO,
            TBV.VRRECCARTAO,
            TBV.VRRECCONVENIO,
            TBV.VRRECCHEQUE,
            TBV.VRRECPOS,
            TBV.VRRECVOUCHER,
            TBV.VRTOTALPAGO,
            TBV.VRTROCO,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'DD/MM/YYYY HH24:MI:SS') AS DTHORAFECHAMENTO,
            TBV.DTHORAFECHAMENTO AS DTHORAFECHAMENTOFORMATEUA,
            TBV.STATIVO,
            TBV.STCANCELADO,
            TBV.IDUSUARIOCANCELAMENTO,
            TBV.TXTMOTIVOCANCELAMENTO,
            TBV.STCONTINGENCIA,
            TBV.DTENVIOONTINGENCIA,
            TBV.DEST_CPF,
            TBV.DEST_CNPJ,
            TBCC.DSNOMERAZAOSOCIAL,
            TBCC.DSAPELIDONOMEFANTASIA
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".CAIXA TBC ON 
            TBC.IDCAIXAWEB = TBV.IDCAIXAWEB
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON 
            TBF.IDFUNCIONARIO = TBV.IDOPERADOR
        LEFT JOIN (
            SELECT
                NUCPFCNPJ,
                FIRST_VALUE(DSNOMERAZAOSOCIAL ORDER BY IDCLIENTE) AS DSNOMERAZAOSOCIAL,
                FIRST_VALUE(DSAPELIDONOMEFANTASIA ORDER BY IDCLIENTE) AS DSAPELIDONOMEFANTASIA
            FROM 
            	"VAR_DB_NAME".CLIENTE
            GROUP BY 
            	NUCPFCNPJ
        ) TBCC ON
            TBCC.NUCPFCNPJ = IFNULL(TBV.DEST_CPF, TBV.DEST_CNPJ)
        LEFT JOIN "VAR_DB_NAME".DETLANCCONVENIO TBD ON 
            TBV.IDVENDA = TBD.IDRESUMOVENDAWEB
        WHERE 
            1 = ?
            AND TBV.STCANCELADO = 'False'
            AND ( 
                ( TBC.IDCAIXAWEB IS NOT NULL AND TBF.IDFUNCIONARIO IS NOT NULL ) OR TBE.IDEMPRESA = 31
            )
	`;

	if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	}
    
    if (cpfouIdVenda){
	    query += ` AND CONTAINS((TBV.DEST_CPF, TBV.DEST_CNPJ, tbd.NRCPF, TBV.IDVENDA), '${cpfouIdVenda}') `;
	}
	
	if(idEmpresa){
        query += ` AND TBV.IDEMPRESA = '${idEmpresa}' `;	
	}
    
   if(idSubgrupoEmpresarial){
        query += ` AND TBE.IDSUBGRUPOEMPRESARIAL = '${idSubgrupoEmpresarial}' `;
    }
    
    if(nnf && serie){
	      query += ` AND TBV.NFE_INFNFE_IDE_SERIE = '${serie}' AND TBV.NFE_INFNFE_IDE_NNF = '${nnf}' `;
	}
	
	if(dtInicio && dtFim && !cpfouIdVenda && !nnf && !serie){
        query += ` AND ( TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '${dtInicio}' AND '${dtFim}' )`;
    }
	
   query += ' ORDER BY TBV.DTHORAFECHAMENTO ASC ';
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};
//return query
	api.responseWithQuery(query, request, 1);
	
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {

		//Handle your GET calls here
		case $.net.http.GET:
			var id = $.request.parameters.get("id");
			//$.response.setBody(JSON.stringify(fnHandleGet(id)));
			fnHandleGet(id);
			break;
        default:
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