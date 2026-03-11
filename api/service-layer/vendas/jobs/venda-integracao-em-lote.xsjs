let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let slApi = $.import("quality.concentrador_homologacao.api.service-layer", "api");

let conn;
let client;
let session;
let dbNameSAP = 'SBO_GTO_TESTE4';
let quebraLinha = String.fromCharCode(13) + String.fromCharCode(10);
let linhaEmBranco = quebraLinha + quebraLinha;

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function truncateIfMoreThan2Decimals(num) {
    let str = String(num);

    if (str.includes(".")) {
        let decimals = str.split(".")[1];
        
        if (decimals.length > 2) {
            return Math.floor(num * 100) / 100;
        }
    }

    return num;
}

function valorComDescontoAplicado(valor, desconto){
    let vrDesconto = ((desconto * valor) / 100).toFixed(2);
    let vrDescontoConvertido = Number(vrDesconto.replace('.', ''))
    let valorComDescontoAplicado = valor - vrDescontoConvertido;
    
    return valorComDescontoAplicado;
}

// INICIO Atualização de Status/Dados //

function registrarErrorAoMigrarVenda(idVenda, p_Error){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDVENDA = ? 
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setString(2, idVenda);
	
	pStmt.execute();
	pStmt.close();
	
	return false;
}

function registrarSucessoAoMigrarVenda(idVenda, idSapDocNum, idSapDocEntry){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            ERRORLOGSAP = NULL,
            SAP_DOCENTRY = ?,
            SAP_DOCENTRY_CORRETO = ?
        WHERE 
            IDVENDA = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	setIntOrNull(pStmt, 1, parseInt(idSapDocNum));
	pStmt.setInt(2, parseInt(idSapDocEntry));
	pStmt.setString(3, idVenda);
	
	pStmt.execute();
	pStmt.close();
	
	return true;
}

// FIM Atualização de Status/Dados //

// INICIO Validação de Dados //

function validarMigracaoVenda(idVenda){
    let queryValidaMigracao = `
        SELECT
            TBV.IDVENDA,
            TBO."DocEntry" AS IDSAP_DOCENTRY, 
            TBO."DocNum" AS IDSAP_DOCNUM
        FROM 
            ${dbNameSAP}.OINV TBO
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
			TBO."BPLId" = TBV.IDEMPRESA   
			AND TBO."Serial" = TBV.NFE_INFNFE_IDE_NNF  
			AND TBO."SeriesStr" = CAST(TBV.NFE_INFNFE_IDE_SERIE AS VARCHAR(10)) 
			AND TBO."U_ID_VENDA_PDV" = TBV.IDVENDA
			AND TBO.CANCELED = 'N' 
        WHERE 
            1 = ? 
            AND TBV.STCANCELADO = 'False'
            AND TBV.IDVENDA = '${idVenda}'
    `;
    
    let reg = api.sqlQuery(queryValidaMigracao, 1);
    //return reg
    if(reg.length > 0){
       return registrarSucessoAoMigrarVenda(reg[0].IDVENDA, reg[0].IDSAP_DOCNUM, reg[0].IDSAP_DOCENTRY);
    }
    
    return false;
}

function validarMigracaoVendasEmLote(response, arrayIdsVendas){
   let { body, status } = response || '';
   
   if(status !== 502){
        
       for (let  {IDVENDA, DocEntry, DocNum, error } of body){
           
            if (status == 202) {
                if(error.length > 0){
                    registrarErrorAoMigrarVenda(IDVENDA, (error || 'Erro ao tentar integrar o Pagamento'));
                } else{
                    registrarSucessoAoMigrarVenda(IDVENDA, Number(DocNum), Number(DocEntry));
                }
            } else {
                if(error.contains('Invoice is already closed or blocked')){
                    validarMigracaoVenda(IDVENDA);
                } else {
                    registrarErrorAoMigrarVenda(IDVENDA, (error || 'Erro ao tentar integrar o Pagamento'));
                }
           }
        }
    } else {
        for (let { IDVENDA } of arrayIdsVendas){
            validarMigracaoVenda(IDVENDA);
        }
    }
}

function validarJsonVenda(jsonVenda){
    let {
        DocTotal,
        DocumentLines
    } = jsonVenda;
    
    let arrayMsg = [
        'Valor do documento( DocTotal ) esta zerado ou negativo',
        'Detalhes do documento ( DocumentLines ) esta vazio, verifique o codigo de imposto, o VENDADETALHE e se os produtos estao cadastrados e ativos no SAP e no Quality',
        'Valor total do documento( DocTotal ) esta divergente do valor total dos produtos( DocumentLines )'
    ];
    
    let vrTotalVenda = DocTotal;
    let vrTotalDocLines = 0;
    let stValida = false;
    let msgError = '';
    
    for(let { Quantity, UnitPrice, DiscountPercent } of DocumentLines){
        let percDesconto = Number(DiscountPercent.toFixed(2)) / 100;
        let vrProduto = Number(String(UnitPrice).replace('.', ''));
        let qtdProduto = Number(Quantity);
        let vrProdutoSemDesconto = vrProduto * qtdProduto;
        let vrLine = percDesconto > 0 ? valorComDescontoAplicado(vrProdutoSemDesconto, percDesconto) : vrProdutoSemDesconto;
       
        vrTotalDocLines += vrLine;
    }
    
    vrTotalDocLines /= 100;
    
    vrTotalDocLines = truncateIfMoreThan2Decimals(vrTotalDocLines);
    
    if(vrTotalVenda <= 0){
        msgError = arrayMsg[0];
    } else if(DocumentLines.length == 0){
        msgError = arrayMsg[1];
    } else if(vrTotalVenda !== vrTotalDocLines){
        msgError = arrayMsg[2];
    } else {
        stValida = true;
    }
    
    return {
        stValida,
        msgError,
        vrTotalDocLines
    }
} 

// FIM Validação de Dados //

// INICIO Get Dados //

function getCodImposto(dadosImpostoVenda){
    let {
        ICMS_PICMS,
        IPI_PIPI,
        PIS_PPIS,
        COFINS_PCOFINS,
        ICMS_CST,
        IPI_CST,
        PIS_CST,
        COFINS_CST,
        CFOP,
    } = dadosImpostoVenda;
    
    let query = `
        SELECT
            "U_IS_COD_IMPOSTO" 
        FROM 
            "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" 
        WHERE 
            "U_IS_ICMS" = ? 
            AND "U_IS_IPI" = ${IPI_PIPI}
            AND "U_IS_PIS" = ${PIS_PPIS}
            AND "U_IS_COFINS" = ${COFINS_PCOFINS}
            AND IFNULL("U_IS_ICMS_CST", '') = '${ICMS_CST}'
            AND IFNULL("U_IS_IPI_CST", '') = '${IPI_CST}'
            AND IFNULL("U_U_PIS_CST", '') = '${PIS_CST}'
            AND IFNULL("U_U_COFINS_CST", '') = '${COFINS_CST}'
            AND "U_IS_CFOP" = ${CFOP} 
    `;
   return {query}
   let reg = api.sqlQuery(query,ICMS_PICMS);
   
   return reg.length > 0 ? reg[0].U_IS_COD_IMPOSTO : '';
}

function getDetalheVenda(idVenda){
    let query = `
		SELECT 
			TBVD.IDVENDADETALHE, 
			TBVD.CPROD, 
			TBVD.QTD, 
			TBVD.VPROD, 
			TBP.NUCODBARRAS, 
			TBVD.VUNCOM, 
			TBVD.VDESC, 
			TBVD.CFOP, 
			ROUND(TBVD.ICMS_PICMS, 2) AS ICMS_PICMS, 
			ROUND(IFNULL(TBVD.IPI_PIPI, 0), 2) AS IPI_PIPI, 
			ROUND(TBVD.PIS_PPIS, 2) AS PIS_PPIS, 
			ROUND(TBVD.COFINS_PCOFINS, 2) AS COFINS_PCOFINS, 
			IFNULL(TBVD.ICMS_CST, '') AS ICMS_CST, 
			IFNULL(TBVD.IPI_CST, '') AS IPI_CST, 
			IFNULL(TBVD.PIS_CST, '') AS PIS_CST, 
			IFNULL(TBVD.COFINS_CST, '') AS COFINS_CST,
			TBI.U_IS_COD_IMPOSTO AS COD_IMPOSTO
		FROM  
            "VAR_DB_NAME".VENDADETALHE TBVD  
		INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
			TBP.IDPRODUTO = TBVD.CPROD
		INNER JOIN "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" TBI ON 
			TBI."U_IS_ICMS" = ROUND(TBVD.ICMS_PICMS, 2) 
            AND TBI."U_IS_IPI" = ROUND(IFNULL(TBVD.IPI_PIPI, 0), 2)
            AND TBI."U_IS_PIS" = ROUND(TBVD.PIS_PPIS, 2)
            AND TBI."U_IS_COFINS" = ROUND(TBVD.COFINS_PCOFINS, 2)
            AND IFNULL(TBI."U_IS_ICMS_CST", '') = IFNULL(TBVD.ICMS_CST, '')
            AND IFNULL(TBI."U_IS_IPI_CST", '') = IFNULL(TBVD.IPI_CST, '')
            AND IFNULL(TBI."U_U_PIS_CST", '') = IFNULL(TBVD.PIS_CST, '')
            AND IFNULL(TBI."U_U_COFINS_CST", '') = IFNULL(TBVD.COFINS_CST, '')
            AND TBI."U_IS_CFOP" = TBVD.CFOP
		WHERE 
            TBI.U_IS_COD_IMPOSTO IS NOT NULL
			AND TBVD.IDVENDA = ?
    `;

	return api.sqlQuery(query, idVenda);
}

function getListaVendas(byId, dataInicioVenda, dataFimVenda, numTop){
    let query = `
        SELECT TOP ${numTop}
			TBV.IDVENDA, 
			TBV.IDEMPRESA,
			TBE.CODPARCEIRO,
			TBE.ESTOQUECODIGO,
			TBV.IDCAIXAWEB,
			TO_VARCHAR(TBV.DTHORAFECHAMENTO,'DD/mm/YYYY') AS DTHORAFECHAMENTO, 
			TBV.NFE_INFNFE_IDE_DHEMI AS DT_HORA_EMISSAO,
			TBV.NFE_INFNFE_IDE_NNF AS NUMERO_NFCE,
			TBV.NFE_INFNFE_IDE_SERIE AS SERIE_NFCE,
			TBV.PROTNFE_INFPROT_CHNFE AS CHAVE_NFCE,
			TBV.PROTNFE_INFPROT_NPROT AS PROTOCOLO_NFCE,
			TBV.PROTNFE_INFPROT_CSTAT AS COD_SITUACAO_NFCE,
			TBV.PROTNFE_INFPROT_XMOTIVO AS DESC_SITUACAO_NFCE,
			IFNULL(TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC, 0) AS VR_TOTAL_DESCONTO, 
			TBV.NFE_INFNFE_TOTAL_ICMSTOT_VNF AS VR_TOTAL_NFCE,
			TBV.NFE_INFNFE_TRANSP_MODFRETE AS MOD_FRETE
		FROM 
			"VAR_DB_NAME".VENDA TBV
		INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
			TBV.IDEMPRESA = TBE.IDEMPRESA
		LEFT JOIN ${dbNameSAP}.OINV TBO ON 
            TBO."BPLId" = TBV.IDEMPRESA   
			AND TBO."Serial" = TBV.NFE_INFNFE_IDE_NNF  
			AND TBO."SeriesStr" = CAST(TBV.NFE_INFNFE_IDE_SERIE AS VARCHAR(10)) 
			AND TBO."U_ID_VENDA_PDV" = TBV.IDVENDA
			AND TBO.CANCELED = 'N'
		WHERE 
            1 = ?
			AND TBV.PROTNFE_INFPROT_CSTAT = 100   
			AND IFNULL(TBV.PROTNFE_INFPROT_NPROT,'') <> ''  
			AND IFNULL(TBV.PROTNFE_INFPROT_CHNFE,'') <> ''  
			AND TBV.STCANCELADO = 'False'  
			AND TBV.STCONTINGENCIA = 'False'  
			AND TBV.NFE_INFNFE_IDE_TPAMB = 1  
			AND TBV.NFE_INFNFE_IDE_MOD = 65
			AND (TBV.SAP_DOCENTRY IS NULL OR TBV.SAP_DOCENTRY_CORRETO IS NULL)
			AND IFNULL(TBV.ERRORLOGSAP, '') = ''
			--AND TBO."DocEntry" IS NULL
			/*AND NOT EXISTS (
				SELECT 
					1  
				FROM 
					${dbNameSAP}.OINV XA 
				WHERE   
					XA.CANCELED = 'N'  
					AND XA."BPLId" = TBV.IDEMPRESA   
					AND XA."Serial" = TBV.NFE_INFNFE_IDE_NNF  
					AND XA."SeriesStr" = CAST(TBV.NFE_INFNFE_IDE_SERIE AS VARCHAR(10))  
            )*/
            AND TBV.VRTOTALVENDA = (
                SELECT
                    SUM(XV.VRTOTALLIQUIDO)
                FROM 
                    "VAR_DB_NAME".VENDADETALHE XV
                INNER JOIN "VAR_DB_NAME".PRODUTO XP ON
                    XV.CPROD = XP.IDPRODUTO
                INNER JOIN "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" TBI ON 
                    TBI."U_IS_ICMS" = ROUND(XV.ICMS_PICMS, 2) 
                    AND TBI."U_IS_IPI" = ROUND(IFNULL(XV.IPI_PIPI, 0), 2)
                    AND TBI."U_IS_PIS" = ROUND(XV.PIS_PPIS, 2)
                    AND TBI."U_IS_COFINS" = ROUND(XV.COFINS_PCOFINS, 2)
                    AND IFNULL(TBI."U_IS_ICMS_CST", '') = IFNULL(XV.ICMS_CST, '')
                    AND IFNULL(TBI."U_IS_IPI_CST", '') = IFNULL(XV.IPI_CST, '')
                    AND IFNULL(TBI."U_U_PIS_CST", '') = IFNULL(XV.PIS_CST, '')
                    AND IFNULL(TBI."U_U_COFINS_CST", '') = IFNULL(XV.COFINS_CST, '')
                    AND TBI."U_IS_CFOP" = XV.CFOP
                WHERE
                    XV.IDVENDA = TBV.IDVENDA
                    AND XV.STCANCELADO = 'False'
                    AND TBI.U_IS_COD_IMPOSTO IS NOT NULL
            )
            AND ( TO_DATE(TBV."DTHORAFECHAMENTO") BETWEEN '${dataInicioVenda}' AND '${dataFimVenda}' )
            AND TBV.IDVENDA IN (
'2-2-30842',
'2-2-30895',
'2-6-60223',
'2-8-31838',
'2-8-31893',
'21-3-53388',
'25-2-60584',
'25-4-50643',
'25-4-50644',
'26-2-47031',
'28-3-58323',
'28-5-77926',
'29-2-51210',
'33-4-64138',
'34-3-36632',
'35-2-27551',
'38-3-53935',
'38-3-53961',
'38-5-731659',
'38-5-731660',
'38-5-731665',
'38-5-731670',
'39-3-92580',
'39-3-92584',
'4-3-59762',
'40-1-34087',
'40-1-34106',
'40-1-34111',
'41-2-57427',
'41-3-55685',
'42-2-49251',
'42-5-17460',
'44-3-33662',
'44-3-33664',
'44-3-33679',
'44-3-33721',
'45-1-22168',
'5-3-66989',
'5-4-75253',
'5-5-57959',
'57-3-52196',
'6-2-68937',
'6-2-68938',
'6-3-65498',
'6-4-64181',
'6-4-64183',
'6-4-64184',
'6-4-64185',
'6-4-64192',
'62-5-1403',
'66-2-47695',
'68-1-24801',
'68-2-28554',
'68-2-28555',
'68-2-28556',
'69-3-55712',
'7-2-46361',
'7-2-46397',
'7-4-56629',
'70-3-67801',
'72-2-61446',
'73-2-67358',
'73-2-67362',
'73-3-65828',
'75-2-41914',
'76-3-58175',
'78-2-53114',
'78-3-44963',
'78-3-44975',
'78-3-44977',
'8-1-44035',
'81-1-67559',
'82-2-49318',
'83-3-104158',
'83-3-104203',
'84-2-55852',
'85-1-23714',
'88-3-71054',
'88-4-35875',
'9-4-57941',
'93-3-32915',
'95-2-28866',
'1-2-59294',
'1-5-88240',
'100-3-68172',
'15-4-65627',
'28-3-58433',
'62-3-71394',
'1-5-88295',
'118-1-10306',
'12-3-61041',
'12-4-66044',
'13-3-56222',
'17-3-624867',
'2-2-30963',
'3-2-20688',
'3-2-20697',
'44-2-76284',
'44-4-37318',
'45-3-69159',
'5-5-57991',
'63-3-50364',
'7-3-39742',
'110-2-29016',
'118-2-10255',
'118-2-10256',
'12-3-61066',
'12-4-66080',
'16-2-60346',
'16-2-60348',
'16-2-60349',
'16-2-60369',
'17-2-837995',
'19-2-43318',
'2-8-32012',
'23-2-42663',
'26-2-47117',
'30-1-10722',
'30-1-10725',
'30-1-10727',
'30-1-10732',
'32-3-41819',
'32-3-41825',
'35-3-41531',
'35-3-41541',
'35-3-41544',
'35-3-41549',
'35-3-41557',
'35-5-59142',
'35-5-59151',
'35-5-59157',
'35-5-59158',
'35-5-59171',
'35-5-59177',
'41-2-57552',
'42-6-33218',
'43-2-47165',
'43-2-47167',
'43-2-47168',
'43-2-47171',
'43-3-917',
'43-3-923',
'43-3-925',
'44-4-37362',
'45-2-77172',
'6-3-65618',
'6-5-60719',
'63-3-50380',
'85-3-42335',
'1-4-108530',
'1-4-108569',
'1-5-88356',
'1-5-88372',
'1-5-88377',
'1-5-88379',
'10-2-60577',
'10-2-60588',
'10-2-60592',
'10-3-62820',
'100-2-19151',
'100-2-19163',
'100-3-68305',
'100-3-68321',
'100-3-68348',
'102-2-33376',
'102-3-32653',
'102-3-32657',
'102-3-32660',
'102-3-32666',
'102-3-32667',
'103-2-20523',
'103-2-20541',
'103-3-30077',
'103-3-30078',
'103-3-30093',
'103-3-30124',
'103-3-30125',
'103-4-26656',
'103-4-26676',
'103-4-26688',
'103-4-26689',
'104-2-21212',
'104-2-21223',
'104-2-21228',
'104-2-21232',
'104-2-21234',
'104-2-21246',
'11-3-60011',
'11-3-60016',
'11-3-60025',
'11-3-60029',
'11-3-60036',
'11-5-50279',
'11-5-50281',
'11-5-50285',
'11-5-50297',
'11-5-50302',
'11-6-67317',
'11-6-67330',
'110-2-29038',
'110-2-29045',
'111-3-22605',
'111-4-14725',
'111-4-14729',
'114-3-9822',
'114-3-9824',
'114-3-9826',
'114-4-24513',
'114-4-24515',
'115-2-5103',
'115-2-5105',
'115-2-5114',
'115-2-5115',
'116-2-1988',
'117-3-16409',
'117-3-16435',
'117-3-16455',
'117-4-1673',
'12-4-66115',
'12-6-39433',
'12-6-39438',
'12-6-39453',
'12-6-39474',
'12-6-39490',
'120-4-5010',
'13-3-56297',
'13-3-56317',
'14-3-60573',
'14-5-14521',
'14-5-14522',
'15-4-65771',
'15-4-65784',
'15-4-65796',
'15-4-65800',
'15-4-65803',
'15-4-65812',
'15-4-65830',
'15-4-65831',
'15-4-65836',
'15-4-65837',
'15-5-44666',
'15-5-44678',
'15-5-44682',
'16-1-60189',
'16-1-60204',
'16-2-60384',
'16-2-60390',
'17-3-624870',
'17-4-3002',
'17-4-3004',
'18-3-61731',
'18-3-61742',
'18-3-61751',
'18-3-61752',
'18-3-61753',
'18-4-31685',
'19-3-44218',
'19-4-11225',
'2-2-31026',
'2-2-31040',
'2-2-31060',
'2-6-60415',
'2-6-60417',
'2-6-60420',
'2-6-60427',
'2-6-60428',
'2-6-60459',
'21-2-56310',
'23-2-42679',
'23-2-42691',
'23-2-42697',
'25-2-60819',
'25-2-60834',
'25-2-60856',
'25-2-60858',
'25-2-60860',
'25-2-60861',
'25-2-60862',
'25-2-60864',
'25-2-60865',
'25-2-60872',
'25-5-77083',
'25-5-77091',
'25-5-77093',
'25-5-77105',
'25-5-77110',
'25-5-77116',
'25-5-77122',
'25-5-77125',
'25-5-77126',
'26-2-47136',
'26-2-47145',
'26-3-41665',
'26-3-41667',
'26-3-41687',
'28-4-86492',
'28-4-86520',
'28-5-78052',
'28-5-78067',
'29-2-51283',
'29-3-38517',
'29-3-38526',
'29-3-38529',
'29-4-53545',
'3-3-31366',
'3-3-31375',
'3-3-31381',
'3-6-14409',
'30-1-10751',
'30-2-45331',
'30-2-45337',
'32-4-54831',
'32-4-54837',
'32-4-54849',
'32-4-54851',
'33-3-61442',
'33-3-61449',
'33-3-61454',
'33-3-61475',
'34-2-34544',
'34-2-34548',
'35-3-41572',
'35-3-41584',
'35-3-41593',
'35-3-41610',
'35-4-57716',
'35-4-57728',
'35-4-57732',
'35-5-59180',
'35-6-55763',
'35-6-55768',
'36-2-49466',
'36-4-52903',
'36-4-52909',
'36-4-52921',
'36-4-52922',
'36-4-52930',
'37-2-49368',
'37-2-49391',
'37-3-45469',
'37-3-45475',
'37-4-59587',
'37-4-59596',
'38-3-54177',
'38-3-54181',
'38-3-54185',
'38-3-54186',
'38-3-54193',
'39-3-92829',
'39-3-92830',
'39-3-92832',
'39-3-92868',
'39-4-84331',
'39-4-84365',
'39-4-84366',
'4-2-42731',
'4-2-42762',
'4-2-42764',
'4-4-37720',
'40-1-34234',
'40-1-34237',
'40-1-34239',
'40-2-49492',
'40-3-60944',
'40-3-60968',
'40-4-49047',
'41-2-57607',
'41-3-55812',
'42-2-49371',
'42-2-49384',
'42-2-49391',
'42-3-31659',
'42-3-31660',
'42-5-17552',
'42-5-17561',
'42-6-33231',
'42-6-33235',
'42-6-33238',
'42-6-33248',
'42-6-33249',
'42-6-33251',
'42-6-33255',
'42-6-33259',
'43-2-47175',
'43-2-47178',
'43-3-935',
'45-2-77188',
'45-2-77189',
'45-2-77194',
'45-2-77196',
'45-3-69194',
'45-3-69195',
'45-3-69209',
'5-5-58048',
'5-5-58080',
'57-2-14842',
'57-2-14853',
'57-3-52279',
'57-3-52313',
'57-5-39671'
	)
    `;
    
    if (byId) {
		query += ` AND TBV.IDVENDA = '${byId}' `;
	}
    
    query += ' ORDER BY TO_DATE(TBV."DTHORAFECHAMENTO"), TBV.IDVENDA ';

	return api.sqlQuery(query, 1);
}

// FIM Get Dados //

// INICIO Manipulação de Resposta da SL //

function extractJsonFromResponseBatch(raw) {
    if (!raw) return null;

    let jsonRegex = /({[\s\S]*})/m;
    let jsonMatch = raw.match(jsonRegex);
    
    let jsonString = jsonMatch[1] || null;
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return { 
            error: "Falha ao fazer parse do JSON", 
            raw: jsonString 
        };
    }
}

function extractContentIdResponseBatch(raw) {
    if (!raw) return null;
    
    let idRegex = /Content-ID:\s*([^\r\n]+)/i;
    let idMatch = raw.match(idRegex);
    
    return idMatch ? idMatch[1] : null;
}

function extractDocEntryResponseBatch(raw) {
    if (!raw) return null;

    let match = raw.match(/Invoices\((\d+)\)/);

    return match ? match[1] : null;
}

function deepDumpOnlyBody(obj, visited) {
    visited = visited || new WeakSet();

    // valores primitivos
    if (obj === null || typeof obj !== "object") {
        return null;
    }

    if (visited.has(obj)) return null;
    visited.add(obj);

    let props = [];
    let current = obj;

    // pegar enumeráveis + não enumeráveis + herdadas
    while (current !== null) {
        try {
            props = props.concat(Object.getOwnPropertyNames(current));
        } catch (e) {}
        current = Object.getPrototypeOf(current);
    }

    // remover duplicados
    props = props.filter((v, i, a) => a.indexOf(v) === i);

    for (let p of props) {
        try {
            let val = obj[p];

            // ENCONTROU BODY?
            if (p === "body") {

                // Caso XSJS nativo
                if (val && typeof val.asString === "function") {
                    return val.asString();
                }

                // Caso seja string (batch / conversion)
                if (typeof val === "string") {
                    return val;
                }
            }

            // Recursão — procurar o body dentro de objetos internos
            if (val && typeof val === "object") {
                let found = deepDumpOnlyBody(val, visited);
                if (found !== null) return found;
            }

        } catch (e) {
            // ignora erros e continua
        }
    }

    return null; // não achou body
}

function padStartString(string){
    let lengthString = string.length;
    
    string = lengthString < 2 ? ('0' + string) : string;
    
    return string;
}

function getDateTimeFormatted() {
    const now = new Date();

    const dd = padStartString(String(now.getDate()));
    const mm = padStartString(String(now.getMonth() + 1)); // meses começam em 0
    const yyyy = now.getFullYear();

    const hh = padStartString(String(now.getHours()));
    const min = padStartString(String(now.getMinutes()));
    const ss = padStartString(String(now.getSeconds()));
    const ms = padStartString(String(now.getMilliseconds()));

    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}:${ms}`;
}

function parseBatchResponse(response) {
    let { entities } = response || {};
    let body = [];
    let dtHoraInicioResponse = getDateTimeFormatted();
    if (entities && entities.length) {
        
        for (var i = 0; i < entities.length; i++) {
            
            let item = entities[i];
            let raw = deepDumpOnlyBody(item) || null;
            
            try {
                
                let data = extractJsonFromResponseBatch(raw);
                let DocEntry = data.DocEntry;//extractDocEntryResponseBatch(raw);
                let IDVENDA = extractContentIdResponseBatch(raw);
                let DocNum = data.DocNum;
                let error = '';
                
                if (data.error) {
                    error = data.error.message.value || 'Erro ao tentar integrar o Pagamento';
                }
                
                body.push(
                    {
                       IDVENDA,
                       DocEntry,
                       DocNum,
                       error
                    }
                );
                
            } catch (e) {
                error = e.toString();
            }
            
        }
        
    }
    
    let dtHoraFimResponse = getDateTimeFormatted();

    return {
        status: response.status,
        dtHoraInicioResponse,
        dtHoraFimResponse,
        body
    };
}

// FIM Manipulação de Resposta da SL //

// INICIO Montagem de Objetos Para Integração //

function templateBatch(boundary, changeSetResponse, json) {
    let contentId = json.U_ID_VENDA_PDV;
    let jsonString = JSON.stringify(json);
    
    return (
        `--${boundary}` + quebraLinha +
        `Content-Type: multipart/mixed; boundary=${changeSetResponse}` +
        linhaEmBranco +
        `--${changeSetResponse}`+ quebraLinha +
        "Content-Type: application/http" + quebraLinha +
        "Content-Transfer-Encoding: binary" + quebraLinha +
        `Content-ID: ${contentId}` +
        linhaEmBranco +
        `POST Invoices HTTP/1.1` + quebraLinha +
        "Content-Type: application/json; charset=utf-8" + quebraLinha +
        "Prefer: return=minimal" + quebraLinha +
        linhaEmBranco +
        jsonString + 
        linhaEmBranco +
        `--${changeSetResponse}--`+
        linhaEmBranco
    );
}

function criarBatch(data) {
    let changeSet = "changesetresponse_" + session;
    let boundary = "batch_" + Date.now() + "_" + session;
    let contador = 1;
    let body = "";

    for (let json of data) {
        
        let currentChangeSet = (changeSet + "_" + contador);
        
        body += templateBatch(boundary, currentChangeSet, json);
        
        contador++;
    }

    body += (
        `--${boundary}--` +
        linhaEmBranco    
    );

    return { boundary, body };
}

function montarJsonDocLines(idVenda, codEstoqueEmpresa, vrTotalDesconto) {
    let detalhesVenda = getDetalheVenda(idVenda);
	let lines = [];
	let lineNum = 1

	for (let det of detalhesVenda) {
		let percDesconto = vrTotalDesconto > 0 ? ( ( parseFloat(det.VDESC) / parseInt(det.QTD) ) / parseFloat(det.VUNCOM) ) * 100 : 0;
		
		let jsonDocLine = {
            "LineNum": lineNum,
            "TaxCode": det.COD_IMPOSTO,
            "ItemCode": det.CPROD,
            "Quantity": parseInt(det.QTD),
            "UnitPrice":parseFloat(det.VUNCOM),
            "WarehouseCode": codEstoqueEmpresa.toString(),
            "CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "BarCode": det.NUCODBARRAS,
            "Usage": 38,
            "DiscountPercent": percDesconto
        };
		
		lines.push(jsonDocLine);
		
		lineNum++;
	}

	return lines;
}

function montarJsonVenda(registro) {
    let docLines = montarJsonDocLines(registro.IDVENDA, registro.ESTOQUECODIGO, parseFloat(registro.VR_TOTAL_DESCONTO))
    
	return {
		"DocType": "dDocument_Items",
		"U_ID_VENDA_PDV": registro.IDVENDA,
		"DocDate": registro.DT_HORA_EMISSAO,
		"DocDueDate": registro.DT_HORA_EMISSAO,
		"CardCode": registro.CODPARCEIRO,
		"DocTotal": parseFloat(registro.VR_TOTAL_NFCE),
		"Comments": "Integração PDV Quality",
		"JournalMemo": "Cupom Fiscal de Saída - " + registro.NUMERO_NFCE + " - " + registro.IDCAIXAWEB,
		"PaymentGroupCode": 93,
		"SalesPersonCode": 8, 
		"TaxDate": registro.DT_HORA_EMISSAO,
		"Project": "PDV_SOFTQUALITY",
		"BPL_IDAssignedToInvoice": registro.IDEMPRESA,
		"SequenceCode": -1, 
		"SequenceSerial": registro.NUMERO_NFCE,
		"SeriesString": registro.SERIE_NFCE.toString(),
        "SequenceModel": "54", 
        "OpeningRemarks": "Número: " + registro.NUMERO_NFCE + "\rChave de acesso: " + registro.CHAVE_NFCE + "\rData/Hora: " + registro.DTHORAFECHAMENTO,
        "U_ChaveAcesso": registro.CHAVE_NFCE,
        "U_SituacaoDocumento": "00",
        "U_PDV_NFCE_CH_ACESSO": registro.CHAVE_NFCE,
        "U_PDV_NFCE_NUMERO": registro.NUMERO_NFCE,
        "U_PDV_NFCE_SERIE": registro.SERIE_NFCE,
        "U_PDV_NFCE_PROTOCOLO": registro.PROTOCOLO_NFCE,
        "U_PDV_NFCE_COD_SIT": registro.COD_SITUACAO_NFCE,
        "U_PDV_NFCE_DESC_SIT": registro.DESC_SITUACAO_NFCE,
        "DocumentLines": docLines,
        "TaxExtension": {
            "Incoterms": registro.MOD_FRETE,
            "MainUsage": 38
        }
	}
}

// FIM Montagem de Objetos Para Integração //

function postBatch(data, arrayIdsVendas) {
    if(!client){
        client = new $.net.http.Client();
    }
    
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let dataBatch = criarBatch(data);
    let response = slApi.postBatch(client, dataBatch, session);
    let respostaFormatada = parseBatchResponse(response);
    
    validarMigracaoVendasEmLote(respostaFormatada, arrayIdsVendas);
    
    return respostaFormatada;
}

function excuteVendaNaoIntegrada(byId, dataInicioVenda = '01.01.2024', dataFimVenda = '30.11.2025', numTop = 60){
	let dadosVenda = getListaVendas(byId, dataInicioVenda, dataFimVenda, numTop);
	let data = [];
	let arrayIdsVendas = [];
	let count = 0;
	let retorno = [];
	
	conn = $.db.getConnection();
	let dtHoraInicioIntegracao = getDateTimeFormatted();
	for (let i = 0; i < dadosVenda.length; i++) {
        let registro = dadosVenda[i];
        let stIntegrada = validarMigracaoVenda(registro.IDVENDA);
        
        if(!stIntegrada){
            let jsonVenda = montarJsonVenda(registro);
            let { stValida, msgError } = validarJsonVenda(jsonVenda);
            
            if(!stValida){
                registrarErrorAoMigrarVenda(registro.IDVENDA, msgError);
                
                continue;
            }
            
            arrayIdsVendas.push({ IDVENDA: registro.IDVENDA });
            data.push(jsonVenda);
            
            count++;
            
            if(count == 20 || i == dadosVenda.length - 1){
                let resp = postBatch(data, arrayIdsVendas);
                
                retorno.push({resp, jsonVenda, respBodyLength: resp.body.length, data, datalength: data.length});
                
                data = [];
                arrayIdsVendas = [];
                count = 0;
                
                conn.commit();
            }
            
        }
	}
	
	conn.commit();
	
	client && client.close();
	
	let dtHoraFimIntegracao = getDateTimeFormatted();
	
	retorno.push({ dtHoraInicioIntegracao, dtHoraFimIntegracao });
	
	return {retorno}
	return 'Migração Nota-saida de venda realizada com sucesso!';
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your POST calls here
            case $.net.http.POST:
                let byId = $.request.parameters.get("id");
                let dataInicioVenda = $.request.parameters.get("dataInicioVenda");
                let dataFimVenda = $.request.parameters.get("dataFimVenda");
                let numTop = $.request.parameters.get("numTop");
                
                let doc = excuteVendaNaoIntegrada(byId, dataInicioVenda, dataFimVenda, numTop);
                
                $.response.setBody(JSON.stringify({ result : doc }));
                
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
}