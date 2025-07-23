let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function obterLinhasDoDetalhe(idVoucher) {

	var query = ' SELECT ' + 
    '   tbdv.IDVOUCHER,' +
    '   tbdv.IDDETALHEVOUCHER, ' +
	'   tbdv.IDPRODUTO, ' +
	'   tbp.DSNOME AS DSPRODUTO, ' +
	'   tbp.NUCODBARRAS, ' +
	'   tbdv.QTD, ' +
	'   tbdv.VRUNIT, ' +
	'   tbdv.VRTOTALBRUTO, ' +
	'   tbdv.VRDESCONTO, ' +
	'   tbdv.VRTOTALLIQUIDO, ' +
	'   tbdv.STATIVO, ' +
	'   tbdv.STCANCELADO ' +
    ' FROM ' + 
    '   "VAR_DB_NAME".DETALHEVOUCHER tbdv' +
    '	INNER JOIN "VAR_DB_NAME".PRODUTO tbp ON tbp.IDPRODUTO = tbdv.IDPRODUTO ' +
    ' WHERE ' +
        '	tbdv.IDVOUCHER = ?';

	var linhas = api.sqlQuery(query, idVoucher);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"det": {
				"IDDETALHEVOUCHER": det.IDDETALHEVOUCHER,
            	"IDVOUCHER": det.IDVOUCHER,
            	"IDPRODUTO": det.IDPRODUTO,
            	"DSPRODUTO": det.DSPRODUTO,
            	"NUCODBARRAS": det.NUCODBARRAS,
            	"QTD": det.QTD,
            	"VRUNIT": det.VRUNIT,
            	"VRTOTALBRUTO": det.VRTOTALBRUTO,
            	"VRDESCONTO": det.VRDESCONTO,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            	"STATIVO": det.STATIVO,
            	"STCANCELADO": det.STCANCELADO
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterLinhasDoDetalheResumoVenda(idresumovendadestino) {

    var query = ` SELECT
                    	tbvd.IDVENDADETALHE,
                    	tbvd.IDVENDA,
                    	tbvd.CPROD,
                    	tbvd.CEAN,
                    	tbpd.NUCODBARRAS,
                    	tbvd.XPROD AS DSPRODUTO,
                    	tbvd.QTD,
                        tbvd.VUNCOM,
                    	tbvd.VPROD,
                    	tbvd.VDESC,
                    	tbvd.VRTOTALLIQUIDO,
                    	tbvd.VENDEDOR_NOME
                    FROM
                    	"VAR_DB_NAME".VENDADETALHE tbvd
                    LEFT JOIN 
                        "VAR_DB_NAME".PRODUTO tbpd ON
                    	tbvd.CPROD = tbpd.IDPRODUTO
                    WHERE
                    	tbvd.IDVENDA = ?;`
    
	var linhas = api.sqlQuery(query, idresumovendadestino);
	var lines = [];

	for (var i = 0; i < linhas.length; i++) {
		var det = linhas[i];

		var docLine = {
			"@nItem": i + 1,
			"vendadetdestino": {
				"IDVENDADETALHE": det.IDVENDADETALHE,
            	"IDVENDA": det.IDVENDA,
            	"CPROD": det.CPROD,
            	"CEAN": det.CEAN,
            	"NUCODBARRAS": det.NUCODBARRAS,
            	"DSPRODUTO": det.DSPRODUTO,
            	"QTD": det.QTD,
            	"VUNCOM": det.VUNCOM,
            	"VPROD": det.VPROD,
            	"VDESC": det.VDESC,
            	"VRTOTALLIQUIDO": det.VRTOTALLIQUIDO,
            	"VENDEDOR_NOME": det.VENDEDOR_NOME
			}
		};

		lines.push(docLine);
	}

	return lines;
}

function obterVoucherDeOrigem(idVoucher){
    if(!idVoucher){
        return [];
    }
    
    let query =`
        SELECT 
            tbrv.IDVOUCHER,  
            tbrv.IDEMPRESAORIGEM,  
            tbrv.IDCAIXAORIGEM,  
            tbrv.IDVENDEDOR,  
            tbrv.IDNFEDEVOLUCAO,  
            tbrv.IDRESUMOVENDAWEB,  
            tbcliente.IDCLIENTE,  
            tbcliente.DSNOMERAZAOSOCIAL, 
            tbcliente.DSAPELIDONOMEFANTASIA,  
            tbcliente.NUCPFCNPJ,  
            tbrv.IDRESUMOVENDAWEBDESTINO,  
            tbrv.STSTATUS,  
            tbrv.STTIPOTROCA,  
            tbrv.MOTIVOTROCA,  
            tbrv.IDUSRLIBERACAOCRIACAO,
            tbrv.IDUSRINVOUCHER,
            tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
            tbrv.IDUSRLIBERACAOCONSUMO, 
            (SELECT NOFUNCIONARIO FROM  "VAR_DB_NAME".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO,
            tbrv.DTINVOUCHER,
            TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
            tbrv.DTOUTVOUCHER,
            TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
            tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
            tbcdestino.DSCAIXA AS DSCAIXADESTINO,  
            tbrv.NUVOUCHER,  
            tbrv.VRVOUCHER,  
            tbrv.STATIVO,  
            tbrv.STCANCELADO,
            tbrv.IDRESUMOVENDAWEBORIGEMTROCO,
            CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
            tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
            tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
            tbemporigem.NOFANTASIA AS EMPORIGEM, 
            tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
            tbemporigem.EENDERECO AS ENDEMPORIGEM, 
            tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
            tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
            tbemporigem.SGUF AS SGUFEMPORIGEM, 
            tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
            tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
            tbempdestino.NOFANTASIA AS EMPDESTINO,
            tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOVENDAORIGEM
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER as tbrv 
        LEFT JOIN "VAR_DB_NAME".VENDA tbv ON tbrv.IDRESUMOVENDAWEB = tbv.IDVENDA
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcdestino ON tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".EMPRESA as tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
        LEFT JOIN "VAR_DB_NAME".EMPRESA as tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
        LEFT JOIN "VAR_DB_NAME".CLIENTE as tbcliente ON tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO as tbfuncionario ON tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
        WHERE
            tbrv.IDVOUCHER = ?
	`;
    
    let response = api.sqlQuery(query, idVoucher);
	let data = [];

	for (var i = 0; i < response.length; i++) {
		let registro = response[i];
        
        let voucherOrigem = {
            "IDVOUCHER": registro.IDVOUCHER,
            "IDEMPRESAORIGEM": registro.IDEMPRESAORIGEM,
            "IDSUBGRUPOEMPRESARIAL": registro.SUBGRUPOEMPORIGEM,
            "IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
            "NUCPFCNPJ": registro.NUCPFCNPJ,
            "DSNOMERAZAOSOCIAL": registro.DSNOMERAZAOSOCIAL,
            "DSAPELIDONOMEFANTASIA": registro.DSAPELIDONOMEFANTASIA,
            "IDRESUMOVENDAWEBDESTINO": registro.IDRESUMOVENDAWEBDESTINO,
            "DTINVOUCHER": registro.DTINVOUCHER,
            "DTINVOUCHERFORMATADO": registro.DTINVOUCHERFORMATADO,
            "DTOUTVOUCHER": registro.DTOUTVOUCHER,
            "DTOUTVOUCHERFORMATADO": registro.DTOUTVOUCHERFORMATADO,
            "DSCAIXAORIGEM": registro.DSCAIXAORIGEM,
            "DSCAIXADESTINO": registro.DSCAIXADESTINO,
            "NUVOUCHER": registro.NUVOUCHER,
            "VRVOUCHER": registro.VRVOUCHER,
            "STATIVO": registro.STATIVO,
            "STCANCELADO": registro.STCANCELADO,
            "RAZAOEMPORIGEM": registro.RAZAOEMPORIGEM,
            "EMPORIGEM": registro.EMPORIGEM,
            "CNPJEMPORIGEM": registro.CNPJEMPORIGEM,
            "ENDEMPORIGEM": registro.ENDEMPORIGEM,
            "BAIRROEMPORIGEM": registro.BAIRROEMPORIGEM,
            "CIDADEEMPORIGEM": registro.CIDADEEMPORIGEM,
            "SGUFEMPORIGEM": registro.SGUFEMPORIGEM,
            "NUTELEMPORIGEM": registro.NUTELEMPORIGEM,
            "EMAILEMPORIGEM": registro.EMAILEMPORIGEM,
            "EMPDESTINO": registro.EMPDESTINO,
            "IDCAIXAORIGEM": registro.IDCAIXAORIGEM,
            "IDVENDEDOR": registro.IDVENDEDOR,
            "IDNFEDEVOLUCAO": registro.IDNFEDEVOLUCAO,
            "STSTATUS": registro.STSTATUS,
            "STTIPOTROCA": registro.STTIPOTROCA,
            "MOTIVOTROCA": registro.MOTIVOTROCA,
            "DSMOTIVOCANCELAMENTO": registro.DSMOTIVOCANCELAMENTO,
            "IDUSRLIBERACAOCRIACAO": registro.IDUSRLIBERACAOCRIACAO,
            "NOFUNCIONARIOLIBERACAOCRIACAO": registro.NOFUNCIONARIOLIBERACAOCRIACAO,
            "IDUSRLIBERACAOCONSUMO": registro.IDUSRLIBERACAOCONSUMO,
            "NOFUNCIONARIOLIBERACAOCONSUMO": registro.NOFUNCIONARIOLIBERACAOCONSUMO,
            "DTHORAFECHAMENTOVENDAORIGEM": registro.DTHORAFECHAMENTOVENDAORIGEM
        };
        
		data.push(voucherOrigem);
        
	}
	
	return data;
} 

function fnHandleGet(byId) {

    let subgrupoEmpresa = $.request.parameters.get("subgrupoEmpresa");
    let id = $.request.parameters.get("id");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let dadosVoucher = $.request.parameters.get("dadosVoucher");
    let stStatus = $.request.parameters.get("stStatus");
    
	let query =`
        SELECT 
            tbrv.IDVOUCHER,  
            tbrv.IDEMPRESAORIGEM,  
            tbrv.IDCAIXAORIGEM,  
            tbrv.IDVENDEDOR,  
            tbrv.IDNFEDEVOLUCAO,  
            tbrv.IDRESUMOVENDAWEB,  
            tbcliente.IDCLIENTE,  
            tbcliente.DSNOMERAZAOSOCIAL, 
            tbcliente.DSAPELIDONOMEFANTASIA,  
            tbcliente.NUCPFCNPJ,  
            tbrv.IDRESUMOVENDAWEBDESTINO,  
            tbrv.STSTATUS,  
            tbrv.STTIPOTROCA,  
            tbrv.MOTIVOTROCA,  
            tbrv.IDUSRLIBERACAOCRIACAO,
            tbrv.IDUSRINVOUCHER,
            tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
            tbrv.IDUSRLIBERACAOCONSUMO, 
            (SELECT NOFUNCIONARIO FROM  "VAR_DB_NAME".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO,
            tbrv.DTINVOUCHER,
            TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
            tbrv.DTOUTVOUCHER,
            TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
            tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
            tbcdestino.DSCAIXA AS DSCAIXADESTINO,  
            tbrv.NUVOUCHER,  
            tbrv.VRVOUCHER,  
            tbrv.STATIVO,  
            tbrv.STCANCELADO,
            tbrv.IDRESUMOVENDAWEBORIGEMTROCO,
            CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
            tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
            tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
            tbemporigem.NOFANTASIA AS EMPORIGEM, 
            tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
            tbemporigem.EENDERECO AS ENDEMPORIGEM, 
            tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
            tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
            tbemporigem.SGUF AS SGUFEMPORIGEM, 
            tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
            tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
            tbempdestino.NOFANTASIA AS EMPDESTINO,
            tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOVENDAORIGEM,
            tbrv.IDVOUCHERORIGEMTROCO
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER as tbrv 
        LEFT JOIN "VAR_DB_NAME".VENDA tbv ON 
            tbrv.IDRESUMOVENDAWEB = tbv.IDVENDA
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcorigem ON 
            tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcdestino ON 
            tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".EMPRESA as tbemporigem ON 
            tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
        LEFT JOIN "VAR_DB_NAME".EMPRESA as tbempdestino ON 
            tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
        LEFT JOIN "VAR_DB_NAME".CLIENTE as tbcliente ON 
            tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO as tbfuncionario ON 
            tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
        WHERE 
            1 = ?
	`;
     
    if(id) {
        query += ' AND tbrv.IDVOUCHER = \'' + id + '\' ';
    }
    
    if(byId) {
        query += ' AND tbrv.IDVOUCHER = \'' + byId + '\' ';
    }
    
    if(stStatus){
        query += ` AND tbrv.STTIPOTROCA = 'DEFEITO' AND tbrv.STSTATUS = 'EM ANALISE' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query += ` AND (tbrv.DTINVOUCHER BETWEEN '${dataPesquisaInicio} 00:00:00' AND '${dataPesquisaFim} 23:59:59') `;
    }
    
    if(subgrupoEmpresa){
        query += ` AND tbemporigem.IDSUBGRUPOEMPRESARIAL = '${subgrupoEmpresa}' `;
    }
    
    if(idEmpresa){
        query += ` AND CONTAINS((tbrv.IDEMPRESAORIGEM, tbrv.IDEMPRESADESTINO), '${idEmpresa}')`;
    }
    
    if(dadosVoucher){
        query += subgrupoEmpresa ? ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${subgrupoEmpresa}` : ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}')`;
    }
    
   query += ' ORDER BY tbrv.DTINVOUCHER ';
    
	var request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (var i = 0; i < response.data.length; i++) {

		let registro = response.data[i];

		var voucher = {
			"voucher": {
                "IDVOUCHER": registro.IDVOUCHER,
                "IDEMPRESAORIGEM": registro.IDEMPRESAORIGEM,
                "IDSUBGRUPOEMPRESARIAL": registro.SUBGRUPOEMPORIGEM,
                "IDRESUMOVENDAWEB": registro.IDRESUMOVENDAWEB,
                "NUCPFCNPJ": registro.NUCPFCNPJ,
                "DSNOMERAZAOSOCIAL": registro.DSNOMERAZAOSOCIAL,
                "DSAPELIDONOMEFANTASIA": registro.DSAPELIDONOMEFANTASIA,
                "IDRESUMOVENDAWEBDESTINO": registro.IDRESUMOVENDAWEBDESTINO,
                "DTINVOUCHER": registro.DTINVOUCHER,
                "DTINVOUCHERFORMATADO": registro.DTINVOUCHERFORMATADO,
                "DTOUTVOUCHER": registro.DTOUTVOUCHER,
                "DTOUTVOUCHERFORMATADO": registro.DTOUTVOUCHERFORMATADO,
                "DSCAIXAORIGEM": registro.DSCAIXAORIGEM,
                "DSCAIXADESTINO": registro.DSCAIXADESTINO,
                "NUVOUCHER": registro.NUVOUCHER,
                "VRVOUCHER": registro.VRVOUCHER,
                "STATIVO": registro.STATIVO,
                "STCANCELADO": registro.STCANCELADO,
                "RAZAOEMPORIGEM": registro.RAZAOEMPORIGEM,
                "EMPORIGEM": registro.EMPORIGEM,
                "CNPJEMPORIGEM": registro.CNPJEMPORIGEM,
                "ENDEMPORIGEM": registro.ENDEMPORIGEM,
                "BAIRROEMPORIGEM": registro.BAIRROEMPORIGEM,
                "CIDADEEMPORIGEM": registro.CIDADEEMPORIGEM,
                "SGUFEMPORIGEM": registro.SGUFEMPORIGEM,
                "NUTELEMPORIGEM": registro.NUTELEMPORIGEM,
                "EMAILEMPORIGEM": registro.EMAILEMPORIGEM,
                "EMPDESTINO": registro.EMPDESTINO,
                "IDCAIXAORIGEM": registro.IDCAIXAORIGEM,
                "IDVENDEDOR": registro.IDVENDEDOR,
                "IDNFEDEVOLUCAO": registro.IDNFEDEVOLUCAO,
                "STSTATUS": registro.STSTATUS,
                "STTIPOTROCA": registro.STTIPOTROCA,
                "MOTIVOTROCA": registro.MOTIVOTROCA,
                "DSMOTIVOCANCELAMENTO": registro.DSMOTIVOCANCELAMENTO,
                "IDUSRLIBERACAOCRIACAO": registro.IDUSRLIBERACAOCRIACAO,
                "NOFUNCIONARIOLIBERACAOCRIACAO": registro.NOFUNCIONARIOLIBERACAOCRIACAO,
                "IDUSRLIBERACAOCONSUMO": registro.IDUSRLIBERACAOCONSUMO,
                "NOFUNCIONARIOLIBERACAOCONSUMO": registro.NOFUNCIONARIOLIBERACAOCONSUMO,
                "DTHORAFECHAMENTOVENDAORIGEM": registro.DTHORAFECHAMENTOVENDAORIGEM
			},
			"detalhedestino": obterLinhasDoDetalheResumoVenda(registro.IDRESUMOVENDAWEBDESTINO),
			"detalhevoucher": obterLinhasDoDetalhe(registro.IDVOUCHER),
			"detalhevoucherorigem": obterVoucherDeOrigem(registro.IDVOUCHERORIGEMTROCO)
		};

		data.push(voucher);

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
			var id = $.request.parameters.get("id");
			$.response.setBody(JSON.stringify(fnHandleGet(id)));
			break;

	}

} catch (e) {
	$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify({
		message: e.message
	}));
	$.response.status = 400;
}