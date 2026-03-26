let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function getVendasDigitais (){
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    
    if(!idEmpresa || !dataPesquisaInicio || !dataPesquisaFim) return false;
    
    let query = `
        SELECT
        	C.NOFANTASIA AS "filial",
        	A.IDVENDA AS "idVenda",
        	TO_VARCHAR(A.DTHORAFECHAMENTO, 'DD/mm/YYYY HH24:MI:SS') AS "dataVenda",
        	CAST(SUM(B.QTD) AS INT) AS "totalQuantidadeDigital",
        	SUM(B.VRTOTALLIQUIDO) AS "totalVenda",
        	TRIM(D.NOFUNCIONARIO) AS "nomeVendedor"
        FROM
        	"VAR_DB_NAME".VENDA A
        INNER JOIN "VAR_DB_NAME".VENDADETALHE B ON 
        	A.IDVENDA = B.IDVENDA 
        	AND B.STCANCELADO = 'False'
        	AND B.STVENDIGITAL = 'True'
        INNER JOIN "VAR_DB_NAME".EMPRESA C ON 
        	A.IDEMPRESA = C.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO D ON 
        	B.VENDEDOR_MATRICULA = D.IDFUNCIONARIO 
        WHERE
        	1 = ?
        	AND A.STCANCELADO = 'False'
        	AND TO_DATE(A.DTHORAFECHAMENTO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}'
        	AND A.IDEMPRESA = ${idEmpresa}
        GROUP BY 
        	C.NOFANTASIA,
        	A.DTHORAFECHAMENTO,
        	A.IDVENDA,
        	D.NOFUNCIONARIO
        ORDER BY 
        	A.DTHORAFECHAMENTO
    `;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    try {
        let respVendas = api.responseWithQuery(query, request, 1);
        return respVendas;
    } catch (error) {
        return error;
    }
};

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            getVendasDigitais();
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}