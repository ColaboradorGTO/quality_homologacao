var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var idDaEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupo = $.request.parameters.get("idMarca");
    var dataInicioPesq = $.request.parameters.get("dataInicial");
    var dataFinalPesq = $.request.parameters.get("dataFinal");
    var dsMotdesc = $.request.parameters.get("dsmotdesc");

    var query = ` 
        SELECT
           FC.NOLOGIN AS MATOPERADORFECHAMENTO,
           FC.NOFUNCIONARIO AS OPERADORFECHAMENTO, 
           E.NOFANTASIA, 
           V.IDVENDA,
           V.VRRECCONVENIO,
           IFNULL(F.NUCPF, null) as NUCPF,
           V.DEST_CPF,
           V.IDEMPRESA, 
           CASE
                WHEN VRRECCONVENIO > 0 THEN 'Convenio Funcionario'
                ELSE TO_VARCHAR(V.TXTMOTIVODESCONTO) 
            END AS TXTMOTIVODESCONTO, 
           TO_DECIMAL(V.VRTOTALPAGO,12,2) as VRTOTALPAGO, 
           TO_VARCHAR(V.DTHORAFECHAMENTO, 'DD-MM-YYYY HH24:MI:SS') AS DTHORAFECHAMENTO, 
           TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,12,2) as ValorTotalProdutoBruto,
           TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,12,2) as VrDesconto, 
           TO_DECIMAL(V.NFE_INFNFE_TOTAL_ICMSTOT_VNF,12,2) as TotalLiquido 
        FROM
        	"VAR_DB_NAME"."VENDA" V 
    `;
 
    if(dsMotdesc == 'Desconto efetuado por Colaborador CPF' ||!dsMotdesc || (dsMotdesc != 'Desconto Funcionario' && dsMotdesc != 'Convenio')){
        query += `   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO F ON V.DEST_CPF = F.NUCPF`;
    }
    
    if(dsMotdesc == 'Desconto Funcionario' || dsMotdesc == 'Convenio') {
        query += `   LEFT JOIN (SELECT * FROM "VAR_DB_NAME".FUNCIONARIO LIMIT 1 ) F ON V.DEST_CPF IN (F.NUCPF)`;
    }
    
    query += `   
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO FC ON 
            V.IDOPERADOR = FC.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".EMPRESA E ON 
            E.IDEMPRESA = V.IDEMPRESA  
        WHERE 
            1 = ?
           AND V."NFE_INFNFE_TOTAL_ICMSTOT_VDESC">0 
           AND V."STCANCELADO"='False' 
    `;
    
    if(idDaEmpresa > 0) {
        query = query + ' AND V.IDEMPRESA = \'' + idDaEmpresa + '\' ';
    }
    if(idGrupo > 0) {
        query = query + ' AND E.IDGRUPOEMPRESARIAL = \'' + idGrupo + '\' ';
    }
    if(dataInicioPesq && dataFinalPesq) {
        query = query + ' AND (V.DTHORAFECHAMENTO BETWEEN \'' + dataInicioPesq + ' 00:00:00\' AND \'' + dataFinalPesq + ' 23:59:59\')';
    }
    if(dsMotdesc !== '' && dsMotdesc !== 'Outros' && dsMotdesc !== 'Convenio' && dsMotdesc !== 'Desconto Funcionario' && dsMotdesc !== 'Desconto efetuado por Colaborador CPF') {
        query += ` AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE '${dsMotdesc}' AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)`;
    }
    
    if(dsMotdesc == 'Desconto efetuado por Colaborador CPF'){
        query += `  
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
            AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)
            AND F.NUCPF IS NULL
        `;
    }
    
    if(dsMotdesc == 'Convenio') {
        query += ` AND (V.VRRECCONVENIO > 0 OR V.VRRECCONVENIO IS NULL)`;
    }
    
    if(dsMotdesc == 'Desconto Funcionario') {
        query += ` 
            AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0) 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) LIKE 'Desconto efetuado por Colaborador%'
        `;
    }
    
    if(dsMotdesc == 'Outros') {
        query += ` 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Ação Comercial' 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Alçada Gerente' 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Cartão PL - Ativação Novos' 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Produtos - Defeitos' 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Produtos - Divergência de Preço' 
            AND  TO_VARCHAR(V.TXTMOTIVODESCONTO) NOT LIKE 'Desconto efetuado por Colaborador%'
            AND (V.VRRECCONVENIO IS NULL OR V.VRRECCONVENIO = 0)
        `;
    }
    
    query += ' ORDER BY  V.IDEMPRESA, V.DTHORAFECHAMENTO ';
    
    
   var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    //api.responseWithQuery(query, request, 1);
    let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (let i = 0; i < response.data.length; i++) {

		let registro = response.data[i];
	//	return response.data
		let tipoDesconto = ''
		
		if(Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Desconto Convenio Por Colaborador'
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Desconto efetuado por Colaborador') && !Number(registro.VRRECCONVENIO) && !registro.NUCPF){
		    tipoDesconto = 'Desconto efetuado por Colaborador';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Desconto efetuado por Colaborador') && !Number(registro.VRRECCONVENIO) && registro.NUCPF){
		    tipoDesconto = 'Desconto Funcionario';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Ação Comercial') && !Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Ação Comercial';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Alçada Gerente') && !Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Alçada Gerente';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Cartão PL - Ativação Novos') && !Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Cartão PL - Ativação Novos';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Produtos - Defeitos') && !Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Produtos - Defeitos';
		}else
		if(registro.TXTMOTIVODESCONTO.includes('Produtos - Divergência de Preço') && !Number(registro.VRRECCONVENIO)){
		    tipoDesconto = 'Produtos - Divergência de Preço';
		} else {
		    tipoDesconto = 'Outros'
		}
		
		let listaVendas = {
                "IDVENDA": registro.IDVENDA,
				"MATOPERADORFECHAMENTO": registro.MATOPERADORFECHAMENTO,
				"OPERADORFECHAMENTO": registro.OPERADORFECHAMENTO,
				"NOFANTASIA": registro.NOFANTASIA,
				"IDEMPRESA": registro.IDEMPRESA,
				"TIPODESCONTO": tipoDesconto,
				"TXTMOTIVODESCONTO": registro.TXTMOTIVODESCONTO,
				"VRTOTALPAGO": registro.VRTOTALPAGO,
				"DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
				"VALORTOTALPRODUTOBRUTO": registro.VALORTOTALPRODUTOBRUTO,
				"VRDESCONTO": registro.VRDESCONTO,
				"TOTALLIQUIDO": registro.TOTALLIQUIDO
		};

		data.push(listaVendas);
 
	}

	response.data = data;
	
    return response
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
           // fnHandleGet(id)
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
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}