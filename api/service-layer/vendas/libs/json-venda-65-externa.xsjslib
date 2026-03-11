let { sqlQuery } = $.import("quality.concentrador_homologacao.api", "apiResponse");

function calcularDesconto(det) {
    return det.VDESC_VENDA > 0  ? (((parseFloat(det.VDESC) / parseInt(det.QTD)) / parseFloat(det.VUNCOM)) * 100)  : 0;
}

function extrairDadosChaveNfce(chave) {
    let chaveLimpa = chave.replace(/\D/g, '');
    
    if (chaveLimpa.length !== 44) {
        throw new Error('Chave NFCE de acesso inválida');
    }
    
    let cnpjChave = chaveLimpa.substring(6, 20);
    let serieChave = chaveLimpa.substring(22, 25);
    let numeroChave = chaveLimpa.substring(25, 34);
    
    return { cnpjChave, serieChave, numeroChave };
}

function verificarDadosVenda(dadosVenda) {
    let campos = [
        { campo: "IDVENDA",             label: "ID da Venda" },
        { campo: "DATA_EMISSAO_NF",     label: "Data de Emissão da NF" },
        { campo: "CODPARCEIRO",         label: "Código do Parceiro" },
        { campo: "VALOR_NF",            label: "Valor da NF" },
        { campo: "NUMERO_NF",           label: "Número da NF" },
        { campo: "IDCAIXAWEB",          label: "ID do Caixa Web" },
        { campo: "IDEMPRESA",           label: "ID da Empresa" },
        { campo: "SERIE_NF",            label: "Série da NF" },
        { campo: "CHAVE_NF",            label: "Chave de Acesso NF" },
        { campo: "NUMERO_PROTOCOLO_NF", label: "Número do Protocolo NF" },
        { campo: "CODIGO_SITUACAO_NF",  label: "Código de Situação NF" },
        { campo: "SITUACAO_NF",         label: "Situação NF" },
        { campo: "MODELO_FRETE_NF",     label: "Modelo de Frete NF" },
    ];
    
    if(dadosVenda.length <= 0){
        throw new Error('Dados da Venda não encontrados, verifique a tabela VENDA')
    }

    let camposInvalidos = campos.filter(({ campo }) => {
        let valor = dadosVenda[campo];
        return valor === null || valor === undefined || valor === '';
    });

    if (camposInvalidos.length > 0) {
        let msgCamposInvalidos = 'Campos não preenchidos: ';
        
        for(let { campo } of camposInvalidos){
            if(msgCamposInvalidos.length == 220 || (msgCamposInvalidos + campo + ',').length > 220){
                break
            }
            
            msgCamposInvalidos += campo + ',';
        }
        
        throw new Error(msgCamposInvalidos + ' verifique a tabela VENDA');
    }
    
    let { CHAVE_NF, CNPJ_LOJA, NUMERO_NF, SERIE_NF, VALOR_NF } = dadosVenda || '';
    let { cnpjChave, serieChave, numeroChave } = extrairDadosChaveNfce(CHAVE_NF);
    
    if(CNPJ_LOJA != cnpjChave || NUMERO_NF != Number(numeroChave) || SERIE_NF != Number(serieChave) ){
        let motivo = CNPJ_LOJA != cnpjChave ? 'CNPJ' : NUMERO_NF != Number(numeroChave) ? 'Número NFE' : 'Série NFE';
        
        throw new Error(motivo + ' da venda diferente do registrado na Chave NFCE');
    }
	
}

function verificarDadosProdutosVenda(listaProdutosVenda, vrTotalPago) {
    let vrTotalProds = 0;
    let campos = [
        { campo: "DTHORAFECHAMENTO",    label: "DTHORAFECHAMENTO" },
        { campo: "IDPRODUTO",           label: "IDPRODUTO" },
        { campo: "VUNCOM",              label: "VUNCOM" },
        { campo: "VDESC",               label: "VDESC" },
        { campo: "VRTOTALLIQUIDO",      label: "Valor Liquido do Produto" },
        { campo: "ESTOQUECODIGO",       label: "Código do Estoque" },
        { campo: "U_IS_COD_IMPOSTO",    label: "Código de Imposto" },
    ];
    
    if(listaProdutosVenda.length <= 0){
        throw new Error('Detalhes da Venda não encontrados, possiveis problemas( vendaDetalhe, produto ou imposto não encontrado ), verifique a tabela VENDADETALHE em conjunto com a PRODUTO e a "@IS_IMPOSTO_PDV" do SAP')
    }
    
    for(let i = 0; i < listaProdutosVenda.length; i++){
        let linhaProduto = listaProdutosVenda[i];
        let { VRTOTALLIQUIDO } = linhaProduto;
        
        let camposInvalidos = campos.filter(({ campo }) => {
            let valor = linhaProduto[campo];
            
            if(campo == 'VUNCOM' || campo == 'VRTOTALLIQUIDO'){
                return Number(valor) <= 0;
            }
            
            return valor === null || valor === undefined || valor === '';
        });
        
        if (camposInvalidos.length > 0) {
            let msgCamposInvalidos = `Campos da linha nº${i+1} de produtos da venda não encontrados ou nulos: `;
            
            for(let { label } of camposInvalidos){
                if(msgCamposInvalidos.length == 169 || (msgCamposInvalidos + label + ',').length > 169){
                    break
                }
                
                msgCamposInvalidos += label + ',';
            }
            
            throw new Error(msgCamposInvalidos + 'verifique a tabela VENDADETALHE em conjunto com a PRODUTO e a "@IS_IMPOSTO_PDV" do SAP');
        }
        
        vrTotalProds += parseFloat(VRTOTALLIQUIDO);
    }
    
    if(Number(vrTotalPago) != Number(vrTotalProds.toFixed(2))){
        throw new Error('Valor da Venda divergente do valor da soma dos produtos, verifique a tabela VENDADETALHE em conjunto com a PRODUTO e a "@IS_IMPOSTO_PDV" do SAP')
    }
}

function getProdutosVenda(idVenda){
    let query = `
        SELECT
            TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'YYYY-mm-DD') AS DTHORAFECHAMENTO,
            IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS VDESC_VENDA, 
            TBP.IDPRODUTO,
            TBVD.QTD,
            TBP.NUCODBARRAS,
            TBVD.VUNCOM,
            TBVD.VDESC,
            TBVD.VRTOTALLIQUIDO,
            TBE.ESTOQUECODIGO,
            CASE
                WHEN CAST(TBV.DTHORAFECHAMENTO AS DATE) < '01.06.2023' THEN XA."U_IS_COD_IMPOSTO"
                ELSE XA."U_IS_COD_IMPOSTO_NOVO"
            END AS U_IS_COD_IMPOSTO
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA
        LEFT JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBP.IDPRODUTO = TBVD.CPROD
        LEFT JOIN "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" XA ON
            XA."U_IS_ICMS" = ROUND(TBVD.ICMS_PICMS, 2)
            AND XA."U_IS_IPI" = ROUND(IFNULL(TBVD.IPI_PIPI, 0), 2)
            AND XA."U_IS_PIS" = ROUND(TBVD.PIS_PPIS, 2)
            AND XA."U_IS_COFINS" = ROUND(TBVD.COFINS_PCOFINS, 2)
            AND IFNULL(XA."U_IS_ICMS_CST", '') = IFNULL(TBVD.ICMS_CST, '')
            AND IFNULL(XA."U_IS_IPI_CST", '') = IFNULL(TBVD.IPI_CST, '')
            AND IFNULL(XA."U_U_PIS_CST", '') =  IFNULL(TBVD.PIS_CST, '')
            AND IFNULL(XA."U_U_COFINS_CST", '') = IFNULL(TBVD.COFINS_CST, '')
            AND XA."U_IS_CFOP" = TBVD.CFOP
        WHERE
            TBVD.STCANCELADO = 'False'
            AND TBVD.IDVENDA = ?
    `;
    		
	return sqlQuery(query, idVenda);
}

function getDadosVenda(idVenda){
    let query = ` 
        SELECT
            TBV.IDVENDA, 
            TBV.IDEMPRESA,
            TBE.NUCNPJ AS CNPJ_LOJA,
            TBE.CODPARCEIRO,
            TBV.IDCAIXAWEB,
            TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD/MM/YYYY') AS DTHORAFECHAMENTO, 
            TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VALOR_NF,
            TBV.NFE_INFNFE_IDE_DHEMI AS DATA_EMISSAO_NF,
            TBV.NFE_INFNFE_IDE_NNF AS NUMERO_NF,
            TBV.NFE_INFNFE_IDE_SERIE AS SERIE_NF,
            TBV.PROTNFE_INFPROT_CHNFE AS CHAVE_NF,
            TBV.PROTNFE_INFPROT_NPROT AS NUMERO_PROTOCOLO_NF,
            TBV.PROTNFE_INFPROT_CSTAT AS CODIGO_SITUACAO_NF,
            TBV.PROTNFE_INFPROT_XMOTIVO AS SITUACAO_NF,
            TBV.NFE_INFNFE_TRANSP_MODFRETE AS MODELO_FRETE_NF
        FROM 
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE 
            TBV.PROTNFE_INFPROT_CSTAT = 100   
			AND IFNULL(TBV.PROTNFE_INFPROT_NPROT,'') <> ''  
			AND IFNULL(TBV.PROTNFE_INFPROT_CHNFE,'') <> ''  
			AND TBV.STCANCELADO = 'False'  
			AND TBV.STCONTINGENCIA = 'False'
			AND TBV.NFE_INFNFE_IDE_TPAMB = 1  
			AND TBV.NFE_INFNFE_IDE_MOD = 65
            AND TBV.IDVENDA = ?
        ORDER BY 
            TBV.DTHORAFECHAMENTO
    `; 
    
	return sqlQuery(query, idVenda);
}

function montarDocLines(listaProdutosVenda) {
    let docLines = [];
    
	for (let i = 0; i < listaProdutosVenda.length; i++) {
		let det = listaProdutosVenda[i];
		let discountPercent = calcularDesconto(det);
		
        docLines.push(
            {
                "LineNum": i + 1,
                "TaxCode": det.U_IS_COD_IMPOSTO,
                "ItemCode": det.IDPRODUTO,
                "Quantity": parseInt(det.QTD),
                "UnitPrice": parseFloat(det.VUNCOM),
                "DiscountPercent": discountPercent,
                "WarehouseCode": det.ESTOQUECODIGO.toString(),
                "BarCode": det.NUCODBARRAS,
                "CostingCode": "ALOCREC",
                "ProjectCode": "PDV_SOFTQUALITY",
                "Usage": 38
            }
        );
	}

	return docLines;
}

function montarJsonVenda(dadosVenda, listaProdutosVenda){
    return {
        "DocType": "dDocument_Items",
        "U_ID_VENDA_PDV": dadosVenda.IDVENDA,
        "DocDate": dadosVenda.DATA_EMISSAO_NF,
        "DocDueDate": dadosVenda.DATA_EMISSAO_NF,
        "CardCode": dadosVenda.CODPARCEIRO, // regra vai ser alterada
        "DocTotal": parseFloat(dadosVenda.VALOR_NF),
        "Comments": "Integração PDV Quality",
        "JournalMemo": "Cupom Fiscal de Saída - " + dadosVenda.NUMERO_NF + " - " + dadosVenda.IDCAIXAWEB,
        "PaymentGroupCode": 93,
        "SalesPersonCode": 8, 
        "TaxDate": dadosVenda.DATA_EMISSAO_NF,
        "Project": "PDV_SOFTQUALITY",
        "BPL_IDAssignedToInvoice": dadosVenda.IDEMPRESA,
        "SequenceCode": -2, //-1 => Manual -2 => Externa
        "SequenceSerial": dadosVenda.NUMERO_NF, // tirar
        "SeriesString": String(dadosVenda.SERIE_NF),//tirar
        "SequenceModel": "54", // tirar
        "OpeningRemarks": "Número: " + dadosVenda.NUMERO_NF + "\rChave de acesso: " + dadosVenda.CHAVE_NF + "\rData/Hora: " + dadosVenda.DTHORAFECHAMENTO,
        "U_ChaveAcesso": dadosVenda.CHAVE_NF,
        "U_SituacaoDocumento": "00",
        "U_PDV_NFCE_CH_ACESSO": dadosVenda.CHAVE_NF,
        "U_PDV_NFCE_NUMERO": dadosVenda.NUMERO_NF,
        "U_PDV_NFCE_SERIE": dadosVenda.SERIE_NF,
        "U_PDV_NFCE_PROTOCOLO": dadosVenda.NUMERO_PROTOCOLO_NF,
        "U_PDV_NFCE_COD_SIT": dadosVenda.CODIGO_SITUACAO_NF,
        "U_PDV_NFCE_DESC_SIT": dadosVenda.SITUACAO_NF,
        "DocumentLines": montarDocLines(listaProdutosVenda),
        "TaxExtension": {
            "Incoterms": dadosVenda.MODELO_FRETE_NF,
            "MainUsage": 38
        }
    };
}

function getJsonVenda(idVenda){
    let dadosVenda = getDadosVenda(idVenda);
    let listaProdutosVenda = getProdutosVenda(idVenda);
    
    verificarDadosVenda(dadosVenda[0]);
    verificarDadosProdutosVenda(listaProdutosVenda, dadosVenda[0].VALOR_NF)
	
    return montarJsonVenda(dadosVenda[0], listaProdutosVenda)
}