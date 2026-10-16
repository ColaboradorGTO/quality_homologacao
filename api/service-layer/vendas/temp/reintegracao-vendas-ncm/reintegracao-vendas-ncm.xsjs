let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.temp.reintegracao-vendas-ncm.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libDevolucao = $.import(filePathLibs, "devolucao-anulacao"); 
let libNotaSubstituta = $.import(filePathLibs, "venda-substituta-nfe"); 

function getListaVendas(idvenda) {
    let query = `
        SELECT
        	TOP 50
        	TBV.IDVENDA, 
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'YYYY-mm-DD') AS DTHORAFECHAMENTO, 
            TBV.IDEMPRESA,
            TBE.CODPARCEIRO,
            TBE.ESTOQUECODIGO,
            TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF,
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF,
            TBV.NFE_INFNFE_IDE_NNF,
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 0) AS NFE_INFNFE_TOTAL_ICMSTOT_VPROD, 
            TBV.IDCAIXAWEB,
            TBV.NFE_INFNFE_IDE_DHEMI,
            TBV.NFE_INFNFE_IDE_SERIE,
            TBV.PROTNFE_INFPROT_CHNFE,
            TBV.PROTNFE_INFPROT_NPROT,
            TBV.PROTNFE_INFPROT_CSTAT,
            TBV.PROTNFE_INFPROT_XMOTIVO,
            TBV.NFE_INFNFE_TRANSP_MODFRETE, 
            CURRENT_DATE AS DATA_ATUAL_DEVOLUCAO,
            tbvr.DOCENTRYVENDA65,
            ifnull(tbvr.DOCENTRYVENDA55, 0) AS DOCENTRYVENDA55,
            ifnull(tbvr.DOCENTRYDEV, 0) AS DOCENTRYDEV,
            TBVR.DOCENTRYVENDA65
        FROM
        	"VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDAS_REINTEGRACAO_TEMPORARIA TBVR ON 
        	TBV.IDVENDA = TBVR.IDVENDA
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
        	TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE 
        	1 = ?
        	AND TBVR.STPROCESSOFINALIZADO = 'False'
    `
    if(idvenda) {
        query += ` AND TBV.IDVENDA = '${idvenda}'`
    } else {
        query += ` AND TO_DATE(TBVR.DATAVENDA) BETWEEN '2026.05.01' AND '2026.05.31'`
    }
    
    let dadosVenda = api.sqlQuery(query, 1);
    return dadosVenda;
}

function executarIntegracao(idvenda){
    let listaVendas = getListaVendas(idvenda);
    
    if(listaVendas.length > 0){
        let session = slApi.loginServiceLayer(true);
        let conn = $.db.getConnection();
        
        for(let i = 0; i < listaVendas.length; i++) {
            let registro = listaVendas[i];
            let statusDev = registro.DOCENTRYDEV == 0 ? false : true;
            let statusNotaSubs = false;
            
            if(!statusDev) {
                statusDev = libDevolucao.gerarDevolucao(registro, session, conn);
            }
            
            //return statusDev;
            
            if(statusDev && registro.DOCENTRYVENDA55 == 0) {
                statusNotaSubs = libNotaSubstituta.gerarVendaSubstituta(registro.IDVENDA, session, conn)
            }
            
            //return statusNotaSubs;
        }
        
        return 'Todos os processos foram realizados, para validação, checar os campos de LOGS.';
    } else {
        return `Não foram encontradas vendas para reintegrar`;
    }
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                let idvenda = $.request.parameters.get("idvenda");
                let doc = executarIntegracao(idvenda);
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
}