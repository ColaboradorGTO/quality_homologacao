var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idSubGrupoEmpresarial = $.request.parameters.get("idMarca");
    let dataFechamento = $.request.parameters.get("dataFechamento");
    let dataFechamentoFim = $.request.parameters.get("dataFechamentoFim");
    let statusCancelado = $.request.parameters.get("status");
    let statusContingencia = $.request.parameters.get("statusContingencia");
    let cpfCliente = $.request.parameters.get("cpfCliente");
    let statusCanceladoWeb = $.request.parameters.get("stCanceladoWeb");
    let stCanceladoPDVEmitida = $.request.parameters.get("stCanceladoPDVEmitida");
    let stCanceladoPDVEmTela = $.request.parameters.get("stCanceladoPDVEmTela");
    let statusCanceladoDepois30Minutos = $.request.parameters.get("stCanceladoApos30Min");
    let ufVenda = $.request.parameters.get("ufVenda");
    
    let query = 'SELECT '+  
                '   TEMP.NOFANTASIA, ' +
                '   TBC.IDCAIXAWEB, ' +
                '   TBC.DSCAIXA, ' +
                '   TBF.NOFUNCIONARIO, ' +
                '   TBFC.NOFUNCIONARIO AS NOFUNCIOCANCEL, ' +
                '   TBFC.DSFUNCAO AS NOFUNCAOCANCEL, ' +
                '   TBV.IDVENDA, ' +
                '   TBV.IDEMPRESA, ' +
                '   TBV.VRRECDINHEIRO, ' +
                '   TBV.VRRECCARTAO, ' +
                '   TBV.VRRECCONVENIO, ' +
                '   TBV.VRRECPOS, ' +
                '   TBV.VRRECVOUCHER, ' +
                '   TBV.NFE_INFNFE_IDE_SERIE, ' +
                '   TBV.NFE_INFNFE_IDE_NNF, ' +
                '	TO_VARCHAR(TBV.DTHORAFECHAMENTO,\'DD-MM-YYYY HH24:MI:SS\') AS DTHORAFECHAMENTO, ' +
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VRTOTALPAGO, '+
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD AS VRTOTALVENDA, '+
                '   TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC AS VRTOTALDESCONTO, '+
                '   (SELECT IFNULL (SUM(tbvp.VRTOTALLIQUIDO),0) FROM "VAR_DB_NAME".VENDADETALHE tbvp WHERE tbvp.IDVENDA = TBV.IDVENDA AND (tbvp.STCANCELADO =  \'' + statusCancelado + '\' ) ) AS TOTALVENDAPROD, '+
                '   TBV.TXTMOTIVOCANCELAMENTO, ' +
                '   TBV.STCONTINGENCIA,' +
                '   MOVC.STCONFERIDO,' +
                '   TBV.PROTNFE_INFPROT_CSTAT, ' +
                '   TBV.PROTNFE_INFPROT_XMOTIVO, ' +
                '   TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF AS UF'+
                ' FROM '+
                '	"VAR_DB_NAME".VENDA TBV ' +
                '	INNER JOIN "VAR_DB_NAME".CAIXA TBC ON TBV.IDCAIXAWEB = TBC.IDCAIXAWEB ' +
                '   INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBF ON TBV.IDOPERADOR = TBF.IDFUNCIONARIO ' +
                '   LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFC ON TBV.IDUSUARIOCANCELAMENTO = TBFC.IDFUNCIONARIO ' +
                '   LEFT JOIN "VAR_DB_NAME".EMPRESA TEMP ON TBV.IDEMPRESA = TEMP.IDEMPRESA ' +
                '   LEFT JOIN "VAR_DB_NAME".MOVIMENTOCAIXA MOVC ON TBV.IDMOVIMENTOCAIXAWEB = MOVC.ID ' +
                ' WHERE '+
                '	1 = ?';
    if(statusCancelado) {
        query = query + ' AND TBV.STCANCELADO = \'' + statusCancelado + '\' '; 
    }
    
    if(statusContingencia) {
        query = query + ' AND TBV.STCONTINGENCIA = \'' + statusContingencia + '\' '; 
    }
    
    if(statusCanceladoWeb) {
        query += ` AND TBV.STCANCELADOWEB = '${statusCanceladoWeb}' `; 
    }
    
    if(stCanceladoPDVEmitida) {
        query += ` AND TBV.STCANCELADO = '${stCanceladoPDVEmitida}' AND TBV.STCANCELADOWEB is null AND TBV.VRTOTALVENDA > 0`; 
    }
    
    if(stCanceladoPDVEmTela) {
        query += ` AND TBV.STCANCELADO = '${stCanceladoPDVEmTela}' AND TBV.STCANCELADOWEB is null AND TBV.VRTOTALVENDA = 0`; 
    }
    
    if(statusCanceladoDepois30Minutos){
        query += ` AND TBV.STCANCELADO = '${statusCanceladoDepois30Minutos}' AND SECONDS_BETWEEN(TBV.DTHORAFECHAMENTO, TBV.DTULTALTERACAO) > 1800 `;
    }
    
    if(cpfCliente) {
        query = query + ' AND TBV.DEST_CPF = \'' + cpfCliente + '\' ';
    }
    
    if(idEmpresa > 0) {
        query = query + ' AND TBV.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(idSubGrupoEmpresarial > 0) {
        query = query + ' AND TEMP.IDGRUPOEMPRESARIAL = \'' + idSubGrupoEmpresarial + '\' ';
    }
    
    if(dataFechamento) {
        query = query + ' AND (TBV.DTHORAFECHAMENTO  BETWEEN \'' + dataFechamento + ' 00:00:00\' AND \'' + dataFechamentoFim + ' 23:59:59\')';
    }
    
    if(ufVenda) {
        query += ` AND CONTAINS(TBV.NFE_INFNFE_EMIT_ENDEREMIT_UF, '${ufVenda}') `;
    }
    
    query = query + 'ORDER BY DTHORAFECHAMENTO, TBV.IDEMPRESA ASC';
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
    

} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}