let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePath}.service-layer.devolucao.devolucao-produtos-voucher-nova.libs`;

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libAtualizacaoCliente = $.import(filePathLibs, "atualizacao-cliente-devolucao-integrado");
let libDevolucao = $.import(filePathLibs, "devolucao-produtos-detalhe-voucher");
let libRefDevolucao = $.import(filePathLibs, "referencia-nota-devolucao-voucher");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");

let conn;

function ajustarDataDentroDos30Dias(dataOriginal) {
    let [ano, mes, dia] = dataOriginal.split("-").map(Number);
    
    let dataHora = new Date(ano, mes - 1, dia); 
    let agora = new Date();
    let limite = new Date();
    let novaData = '';
    
    dataHora.setHours(0, 0, 0, 0);
    agora.setHours(0, 0, 0, 0);
    limite.setHours(0, 0, 0, 0);
    limite.setDate(agora.getDate() - 30);
    
    if(dataHora < limite){
        novaData = new Date();
        novaData.setDate(agora.getDate() - 29);
        
        dataHora = novaData;
    }
    
    ano = dataHora.getFullYear();
    mes = String(dataHora.getMonth() + 1);
    dia = String(dataHora.getDate());
    
    mes = mes.length < 2 ? ('0' + mes) : mes;
    dia = dia.length < 2 ? ('0' + dia) : dia;
    
    return `${ano}-${mes}-${dia}`;
}

function montarAddressExtensionDevolucao(dados){
    let {
        UFLOJAVENDA,
        EENDERECOLOJAVENDA,
        NUENDERECOLOJAVENDA,
        EBAIRROLOJAVENDA,
        NUCEPLOJAVENDA,
        ECIDADELOJAVENDA,
        ECOMPLEMENTOLOJAVENDA,
        IDINDICACAOIE,
        AbsId
    } =  dados;
    let addressExtension = {};
    
    return {
        "PayToStreet": EENDERECOLOJAVENDA,
        "PayToStreetNo": (NUENDERECOLOJAVENDA || "SN"),
        "PayToBlock": (EBAIRROLOJAVENDA || "NI"),
        "PayToZipCode": NUCEPLOJAVENDA,
        "PayToCity": ECIDADELOJAVENDA,
        "PayToCounty": String(AbsId),
        "PayToCountry": "BR",
        "PayToState": UFLOJAVENDA,
        "PayToBuildingFloorRoom": (ECOMPLEMENTOLOJAVENDA || "SN"),
        
        "ShipToStreet": EENDERECOLOJAVENDA,
        "ShipToStreetNo": (NUENDERECOLOJAVENDA || "SN"),
        "ShipToBlock": (EBAIRROLOJAVENDA || "NI"),
        "ShipToZipCode": NUCEPLOJAVENDA,
        "ShipToCity": ECIDADELOJAVENDA,
        "ShipToCounty": String(AbsId),
        "ShipToCountry": "BR",
        "ShipToState": UFLOJAVENDA,
        "ShipToBuildingFloorRoom": (ECOMPLEMENTOLOJAVENDA || "SN"),
        
        "ShipToStreetForReturn": EENDERECOLOJAVENDA,
        "ShipToStreetNoForReturn": (NUENDERECOLOJAVENDA || "SN"),
        "ShipToBlockForReturn": (EBAIRROLOJAVENDA || "NI"),
        "ShipToZipCodeForReturn": NUCEPLOJAVENDA,
        "ShipToCityForReturn": ECIDADELOJAVENDA,
        "ShipToCountyForReturn": String(AbsId),
        "ShipToCountryForReturn": "BR",
        "ShipToStateForReturn": UFLOJAVENDA,
        "ShipToBuildingFloorRoomForReturn": (ECOMPLEMENTOLOJAVENDA || "SN"),
        
        "U_SKILL_indIEDest": IDINDICACAOIE
    }
}

function montarJsonDevolucao_new(dados, stAjustarData = 'False'){
    let dataDevolucao = stAjustarData != 'False' ? ajustarDataDentroDos30Dias(dados.DATA_VOUCHER) : dados.DATA_VOUCHER;
    let mainUsage = 38;// VENDA QUALITY => 38 | VENDA ECOMMERCE => 25
    let stTrocarEndereco = dados.STTROCARENDERECO == 'TRUE';
    let addressExtension = stTrocarEndereco ? montarAddressExtensionDevolucao(dados) : {};
    
    return {
        "DocType": "dDocument_Items",
        "U_ID_VENDA_PDV": dados.IDVOUCHER,
        "DocDate": dataDevolucao,
        "DocDueDate": dataDevolucao,
        "CardCode": dados.IDCLIENTESAP,
        "AddressExtension": addressExtension,
        "Comments": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
        "JournalMemo": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
        "OpeningRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,
        "ClosingRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,     
        "TaxDate": dataDevolucao,
        "Project": "PDV_SOFTQUALITY",
        "BPL_IDAssignedToInvoice": dados.IDEMPRESA,
        "SequenceCode": getSeqCode(dados.IDEMPRESA),
        "SequenceModel": "39",
        "GroupNum": 93,
        "U_IS_NATOPNFE": "Devolução de venda de mercadoria adquirida ou recebida de terceiros",
        "U_finNfe": 4,
        "U_SKILL_FormaPagto": 90,
        "PeyMethod": null,
        "ControlAccount": "2.01.01.02.0006",  
        "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
        "DocumentLines": montarDocumentLinesDevolucao(dados.IDVOUCHER, dados.ESTOQUECODIGO),
        "TaxExtension": {
            "Incoterms": dados.NFE_INFNFE_TRANSP_MODFRETE,
            "MainUsage": mainUsage
        }
    };
}

function montarJsonDevolucao(dados, stAjustarData = 'False'){
    let dataDevolucao = stAjustarData != 'False' ? ajustarDataDentroDos30Dias(dados.DATA_VOUCHER) : dados.DATA_VOUCHER;
    let mainUsage = 38;// VENDA QUALITY => 38 | VENDA ECOMMERCE => 25
    
    return {
        "DocType": "dDocument_Items",
        "U_ID_VENDA_PDV": dados.IDVOUCHER,
        "DocDate": dataDevolucao,
        "DocDueDate": dataDevolucao,
        "CardCode": dados.IDCLIENTESAP,
        "Comments": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
        "JournalMemo": `Ref a Dev Mercadoria Voucher n. ${dados.NUVOUCHER}  IDVENDA ${dados.IDVENDA}`,
        "OpeningRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,
        "ClosingRemarks": `Devolucao NF ${dados.NNF} Serie: ${dados.SERIE} Chave: ${dados.CHAVENFE}`,     
        "TaxDate": dataDevolucao,
        "Project": "PDV_SOFTQUALITY",
        "BPL_IDAssignedToInvoice": dados.IDEMPRESA,
        "SequenceCode": getSeqCode(dados.IDEMPRESA),
        "SequenceModel": "39",
        "GroupNum": 93,
        "U_IS_NATOPNFE": "Devolução de venda de mercadoria adquirida ou recebida de terceiros",
        "U_finNfe": 4,
        "U_SKILL_FormaPagto": 90,
        "PeyMethod": null,
        "ControlAccount": "2.01.01.02.0006",  
        "U_Classification": 999, //Parametro para não duplicar a entrada no estoque(999)
        "DocumentLines": montarDocumentLinesDevolucao(dados.IDVOUCHER, dados.ESTOQUECODIGO),
        "TaxExtension": {
            "Incoterms": dados.NFE_INFNFE_TRANSP_MODFRETE,
            "MainUsage": mainUsage
        }
    };
}

function montarDocumentLinesDevolucao(idVoucher) {
    let listaProdutosVoucher = getDadosProdutosDoVoucher(idVoucher);
    let usage = 38;// VENDA QUALITY => 38 | VENDA ECOMMERCE => 25
    let docLines = [];
    
    for (let i = 0; i < listaProdutosVoucher.length; i++) {
        let registro = listaProdutosVoucher[i];
        
        docLines.push({
            "LineNum": i++,
            "TaxCode": registro.U_IS_COD_IMPOSTO,
            "ItemCode": registro.IDPRODUTO,
            "Quantity": parseInt(registro.QTD),
            "UnitPrice": parseFloat(registro.VRPRODUTOBRUTO),
            "LineTotal": parseFloat(registro.VRTOTALLIQUIDO),
            "WarehouseCode": registro.ESTOQUECODIGO,
            "CostingCode": "ALOCREC",
            "ProjectCode": "PDV_SOFTQUALITY",
            "BarCode": registro.NUCODBARRAS,
            "Usage": usage,
        });
    }
    
    return docLines;
}

// GET DADOS
function getListaVouchers_new(idVoucher){
    let clausula = `
        AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
        AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3 
    `;

    if(idVoucher){
        clausula = ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    }
    
    let queryVoucher = `
        SELECT 
            *
        FROM (
            SELECT TOP 100 DISTINCT
                CASE
                    WHEN TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA THEN 'TRUE'
                    ELSE 'FALSE'
                END AS ST_TRANSFERE,
                TBR.IDVOUCHER,
                TBR.NUVOUCHER,
                TO_VARCHAR(TBR.DTINVOUCHER, 'YYYY-MM-DD') AS DATA_VOUCHER,
                ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
                TBV.PROTNFE_INFPROT_CSTAT AS CSTATSEFAZ,
                TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE,
                TBV.NFE_INFNFE_TRANSP_MODFRETE,
                TBV.IDVENDA,
                TBV.NFE_INFNFE_IDE_SERIE AS SERIE,
                TBV.NFE_INFNFE_IDE_NNF AS NNF,
                TBV.IDEMPRESA,
                TBE.CODPARCEIRO, 
                TBE.ESTOQUECODIGO,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
                TBV.SAP_DOCENTRY_CORRETO,
                TBR.STDEVOLUCAO,
                TBR.STREFDEVOLUCAOSAP,
                TBR.IDCLIENTE,
                TBC.IDCLIENTESAP,
                TRIM(UPPER(TBC.DSNOMERAZAOSOCIAL)) AS DSNOMERAZAOSOCIAL,
                TBC.NUCPFCNPJ,
                CASE
                    WHEN LENGTH(REPLACE_REGEXPR('[^[:alnum:]]' IN TBC.NUCPFCNPJ WITH '')) = 11 THEN 9 
                    ELSE TBC.IDINDICACAOIE
                END AS IDINDICACAOIE,
                TBC.STATUALIZARCADASTROSAP,
                TRIM(TBC.NUCEP) AS NUCEP,
                TRIM(UPPER(IFNULL(TBC.EENDERECO, 'SEM ENDERECO'))) AS EENDERECO,
                TRIM(UPPER(IFNULL(TBC.EBAIRRO, 'NI'))) AS EBAIRRO,
                TRIM(UPPER(TBC.ECIDADE)) AS ECIDADE,
                TRIM(UPPER(TBC.SGUF)) AS UFCLIENTE,
                TRIM(UPPER(TBE.SGUF)) AS UFLOJAVENDA,
                TBE.IDEMPRESA AS IDLOJAVENDA,
                TRIM(UPPER(TBE.SGUF)) AS UFLOJAVENDA,
                TRIM(TBE.NUCEP) AS NUCEPLOJAVENDA,
                TRIM(UPPER(TBE.EENDERECO)) AS EENDERECOLOJAVENDA,
                TRIM(UPPER(TBE.EBAIRRO)) AS EBAIRROLOJAVENDA,
                TRIM(UPPER(TBE.ECIDADE)) AS ECIDADELOJAVENDA,
                TRIM(UPPER(TBE.SGUF)) AS SGUFLOJAVENDA,
                TRIM(UPPER(IFNULL(TBE.ECOMPLEMENTO, 'SN'))) AS ECOMPLEMENTOLOJAVENDA,
                'SN' AS NUENDERECOLOJAVENDA,
                SBO_OCNT."AbsId",
                CASE
                    WHEN ( 
                        TRIM(UPPER(TBC.SGUF)) <> TRIM(UPPER(TBE.SGUF)) 
                        OR 
                        TRIM(UPPER(SBO_CLIENTE.UFCLIENTESAP)) <> TRIM(UPPER(TBE.SGUF))
                    ) THEN 'TRUE'
                    ELSE 'FALSE'
                END AS STTROCARENDERECO
            FROM
                "VAR_DB_NAME".RESUMOVOUCHER TBR
            INNER JOIN "VAR_DB_NAME".VENDA TBV ON
                TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
            INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
                TBR.IDCLIENTE = TBC.IDCLIENTE
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                TBV.IDEMPRESA = TBE.IDEMPRESA
            INNER JOIN ${dbNameSAP}.OINV SBO_OINV ON
                TBV.SAP_DOCENTRY_CORRETO = SBO_OINV."DocEntry"
            LEFT JOIN ${dbNameSAP}.OCNT SBO_OCNT ON
                UPPER(SBO_OCNT."State") = UPPER(TBE.SGUF) AND UPPER(SBO_OCNT."Name") = UPPER(TBE.ECIDADE)
            INNER JOIN (
                SELECT DISTINCT
                    TBO."CardCode",
                    TRIM(UPPER(TBO."CardName")) AS NOMECLIENTESAP,
                    TRIM(UPPER(TBC1."Street")) AS ENDERECOCLIENTESAP, 
                    TRIM(UPPER(TBC1."Block")) AS BAIRROCLIENTESAP, 
                    TRIM(UPPER(TBC1."State")) AS UFCLIENTESAP,
                    TRIM(UPPER(TBC1."U_SKILL_indIEDest")) AS INDICACAOIESAP,
                    TRIM(TBC1."ZipCode") AS NUCEPSAP,
                    TBC7."TaxId4",
                    TBC7."TaxId0"
                FROM
                    ${dbNameSAP}.OCRD TBO
                INNER JOIN ${dbNameSAP}.CRD1 AS TBC1 ON
                    TBO."CardCode" = TBC1."CardCode" 
                INNER JOIN ${dbNameSAP}.CRD7 AS TBC7 ON
                    TBC1."CardCode" = TBC7."CardCode"
                WHERE
                    TBO."CardType" = 'C'
                ) SBO_CLIENTE ON
                    SBO_CLIENTE."CardCode" = TBC.IDCLIENTESAP AND 
                    (
                        REPLACE_REGEXPR('[^[:alnum:]]' IN SBO_CLIENTE."TaxId4" WITH '') = TBC.NUCPFCNPJ
                        OR
                        REPLACE_REGEXPR('[^[:alnum:]]' IN SBO_CLIENTE."TaxId0" WITH '') = TBC.NUCPFCNPJ
                    )
            WHERE
                TBR.STTIPOTROCA <> 'TROCO'
                AND TBR.STCANCELADO = 'False'
                AND TBV.STCANCELADO = 'False'
                AND TBV.PROTNFE_INFPROT_CSTAT = 100
                AND IFNULL(TBV.SAP_DOCENTRY_CORRETO, 0) <> 0
                --AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
                AND (
                    (LENGTH(TBC.NUCPFCNPJ) = 11 AND UPPER(TBC.TPCLIENTE) = 'FISICA') 
                    OR 
                    (LENGTH(TBC.NUCPFCNPJ) = 14 AND UPPER(TBC.TPCLIENTE) <> 'FISICA' AND SBO_OINV."Model" = 39 )
                )
                AND IFNULL(TBC.IDCLIENTESAP, '') <> ''
                /*AND NOT EXISTS (
                    SELECT
                        1
                    FROM
                        ${dbNameSAP}.ORIN SBO_ORIN
                    WHERE
                        SBO_ORIN."U_ID_VENDA_PDV" AND TBR.IDVOUCHER AND SBO_ORIN."CANCELED" = 'N'
                )*/
                AND 1 = ?
                ${clausula}
            ORDER BY 
                TBR.IDVOUCHER
        ) A
        ORDER BY
            A.ST_TRANSFERE DESC,
            A.IDVOUCHER
    `;
    
    return api.sqlQuery(queryVoucher, 1);
}

function getListaVouchers(idVoucher){
    let clausula = `
        AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
        AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3 
    `;

    if(idVoucher){
        clausula = ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    }
    
    let queryVoucher = `
        SELECT 
            *
        FROM (
            SELECT TOP 100 DISTINCT
                CASE
                    WHEN TBR.IDEMPRESAORIGEM <> TBV.IDEMPRESA THEN 'TRUE'
                    ELSE 'FALSE'
                END AS ST_TRANSFERE,
                TBR.IDVOUCHER,
                TBR.NUVOUCHER,
                TO_VARCHAR(TBR.DTINVOUCHER, 'YYYY-MM-DD') AS DATA_VOUCHER,
                ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) AS DIFTEMPOEMDIAS,
                TBV.PROTNFE_INFPROT_CSTAT AS CSTATSEFAZ,
                TBV.PROTNFE_INFPROT_CHNFE AS CHAVENFE,
                TBV.NFE_INFNFE_TRANSP_MODFRETE,
                TBV.IDVENDA,
                TBV.NFE_INFNFE_IDE_SERIE AS SERIE,
                TBV.NFE_INFNFE_IDE_NNF AS NNF,
                TBV.IDEMPRESA,
                TBE.CODPARCEIRO, 
                TBE.ESTOQUECODIGO,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VDESC,
                TBV.NFE_INFNFE_TOTAL_ICMSTOT_VPROD,
                TBV.SAP_DOCENTRY_CORRETO,
                TBR.STDEVOLUCAO,
                TBR.STREFDEVOLUCAOSAP,
                TBR.IDCLIENTE,
                TBC.IDCLIENTESAP,
                TRIM(UPPER(TBC.DSNOMERAZAOSOCIAL)) AS DSNOMERAZAOSOCIAL,
                TBC.NUCPFCNPJ,
                CASE
                    WHEN LENGTH(REPLACE_REGEXPR('[^[:alnum:]]' IN TBC.NUCPFCNPJ WITH '')) = 11 THEN 9 
                    ELSE TBC.IDINDICACAOIE
                END AS IDINDICACAOIE,
                TBC.STATUALIZARCADASTROSAP,
                TRIM(TBC.NUCEP) AS NUCEP,
                TRIM(UPPER(IFNULL(TBC.EENDERECO, 'SEM ENDERECO'))) AS EENDERECO,
                TRIM(UPPER(IFNULL(TBC.EBAIRRO, 'NI'))) AS EBAIRRO,
                TRIM(UPPER(TBC.ECIDADE)) AS ECIDADE,
                TRIM(UPPER(TBC.SGUF)) AS UFCLIENTE,
                TRIM(UPPER(TBE.SGUF)) AS UFLOJAVENDA,
                TBE.IDEMPRESA AS IDLOJAVENDA
            FROM
                "VAR_DB_NAME".RESUMOVOUCHER TBR
            INNER JOIN "VAR_DB_NAME".VENDA TBV ON
                TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
            INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
                TBR.IDCLIENTE = TBC.IDCLIENTE
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                TBV.IDEMPRESA = TBE.IDEMPRESA
            INNER JOIN ${dbNameSAP}.OINV SBO_OINV ON
                TBV.SAP_DOCENTRY_CORRETO = SBO_OINV."DocEntry"
            WHERE
                TBR.STTIPOTROCA <> 'TROCO'
                AND TBR.STCANCELADO = 'False'
                AND TBV.STCANCELADO = 'False'
                AND TBV.PROTNFE_INFPROT_CSTAT = 100
                AND IFNULL(TBV.SAP_DOCENTRY_CORRETO, 0) <> 0
                --AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
                AND (
                    (LENGTH(TBC.NUCPFCNPJ) = 11 AND UPPER(TBC.TPCLIENTE) = 'FISICA') 
                    OR 
                    (LENGTH(TBC.NUCPFCNPJ) = 14 AND UPPER(TBC.TPCLIENTE) <> 'FISICA' AND SBO_OINV."Model" = 39 )
                )
                AND IFNULL(TBC.IDCLIENTESAP, '') <> ''
                /*AND NOT EXISTS (
                    SELECT
                        1
                    FROM
                        ${dbNameSAP}.ORIN SBO_ORIN
                    WHERE
                        SBO_ORIN."U_ID_VENDA_PDV" AND TBR.IDVOUCHER AND SBO_ORIN."CANCELED" = 'N'
                )*/
                AND 1 = ?
                ${clausula}
            ORDER BY 
                TBR.IDVOUCHER
        ) A
        ORDER BY
            A.ST_TRANSFERE DESC,
            A.IDVOUCHER
    `;
    
    return api.sqlQuery(queryVoucher, 1);
}

function getDadosProdutosDoVoucher(idVoucher){
    let query = `
        SELECT  
            TBVD.IDVENDADETALHE,  
            TBP.IDPRODUTO,  
            TBDV.QTD,  
            TBDV.VRTOTALLIQUIDO,  
            TBDV.VRUNIT AS VRPRODUTOBRUTO,  
            TBP.NUCODBARRAS,  
            TBE.ESTOQUECODIGO,
            CASE 
                WHEN CAST(TO_VARCHAR(TBV.DTHORAFECHAMENTO, 'YYYY-MM-DD') AS DATE) < '01.06.2023' THEN "U_IS_COD_IMPOSTO"
                ELSE "U_IS_COD_IMPOSTO_NOVO" 
            END AS  U_IS_COD_IMPOSTO
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBR.IDRESUMOVENDAWEB  = TBV.IDVENDA AND TBV.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA AND TBVD.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".DETALHEVOUCHER TBDV ON 
            TBR.IDVOUCHER = TBDV.IDVOUCHER AND TBVD.IDVENDADETALHE = TBDV.IDVENDADETALHE AND TBDV.STCANCELADO = 'False'
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBP.IDPRODUTO = TBVD.CPROD
        LEFT JOIN "SBO_GTO_PRD"."@IS_IMPOSTO_PDV" SBO_IMP ON 
            SBO_IMP."U_IS_ICMS" = ROUND(TBVD.ICMS_PICMS,2)
            AND SBO_IMP."U_IS_IPI" = ROUND(IFNULL(TBVD.IPI_PIPI,0),2)
            AND SBO_IMP."U_IS_PIS" = ROUND(TBVD.PIS_PPIS,2)
            AND SBO_IMP."U_IS_COFINS" = ROUND(TBVD.COFINS_PCOFINS,2)
            AND IFNULL(SBO_IMP."U_IS_ICMS_CST", '') = IFNULL(TBVD.ICMS_CST, '')
            AND IFNULL(SBO_IMP."U_IS_IPI_CST", '') =  IFNULL(TBVD.IPI_CST, '')
            AND IFNULL(SBO_IMP."U_U_PIS_CST", '') =  IFNULL(TBVD.PIS_CST, '')
            AND IFNULL(SBO_IMP."U_U_COFINS_CST", '') =  IFNULL(TBVD.COFINS_CST, '')
            AND SBO_IMP."U_IS_CFOP" = TBVD.CFOP
        WHERE 
            TBR.IDVOUCHER = '${idVoucher}'
            AND 1 = ?
    `;
    
    return api.sqlQuery(query, 1);
}

function getCodigoImposto(detalheVenda){
    let queryImposto = `
        SELECT 
            CASE 
                WHEN CAST('${detalheVenda.DTHORAFECHAMENTO}' AS DATE) < '01.06.2023' THEN "U_IS_COD_IMPOSTO"
                ELSE "U_IS_COD_IMPOSTO_NOVO" 
            END AS  U_IS_COD_IMPOSTO
        FROM 
            "SBO_GTO_PRD"."@IS_IMPOSTO_PDV"
        WHERE 
            "U_IS_ICMS" = ?
            AND "U_IS_IPI" = ${detalheVenda.IPI_PIPI}
            AND "U_IS_PIS" = ${detalheVenda.PIS_PPIS}
            AND "U_IS_COFINS" = ${detalheVenda.COFINS_PCOFINS}
            AND IFNULL("U_IS_ICMS_CST", '') = '${detalheVenda.ICMS_CST}'
            AND IFNULL("U_IS_IPI_CST", '') =  '${detalheVenda.IPI_CST}'
            AND IFNULL("U_U_PIS_CST", '') =  '${detalheVenda.PIS_CST}'
            AND IFNULL("U_U_COFINS_CST", '') =  '${detalheVenda.COFINS_CST}'
            AND "U_IS_CFOP" = ${detalheVenda.CFOP} 
    `;
    
    return api.sqlQuery(queryImposto, detalheVenda.ICMS_PICMS)
}

function getDocEntryDevolucaoSAP(idVoucher){
    let query = `
        SELECT 
            T1."DocEntry"
        FROM
            ${dbNameSAP}.ORIN T1
        WHERE
            T1."CANCELED" = 'N' AND 
            T1."U_ID_VENDA_PDV" = ?
    `;
	
	let regDocEntry = api.sqlQuery(query, idVoucher);

    if(regDocEntry.length){
        return Number(regDocEntry[0].DocEntry || 0);
    }
    
    return false;
}

function getDocEntryRefDevolucaoSAP(docEntryDevolucao, chaveNota){
    let queryValidaRefDevolucao = `
        SELECT
            "U_DocEntry"  as DOC_ENTRY_DEV
        FROM 
            ${dbNameSAP}."@SKL40DCREF"
        WHERE
            "U_DocExt" = '${chaveNota}'
            AND "U_DocEntry" = ?
    `;
    
    let resultRefDevolucao = api.sqlQuery(queryValidaRefDevolucao, docEntryDevolucao);
    
    if(resultRefDevolucao.length){
        return Number(resultRefDevolucao[0].DocEntry);
    }
    
    return false;
}

function getSeqCode(idEmpresa){
    let query = `
        SELECT 
            "SeqCode" 
        FROM
            ${dbNameSAP}.NFN1
        WHERE
            "Locked" = 'N' AND
            "BPLId" = ?
    `;
	
	let regSeqCode = api.sqlQuery(query, idEmpresa);

    return Number(regSeqCode[0].SeqCode);
}

function getDadosClienteNoSAP(idClienteSap, numCpfCnpj){
    let query = `
        SELECT DISTINCT
            TRIM(UPPER(TBO."CardName")) AS NOMECLIENTESAP,
            TRIM(UPPER(TBC1."Street")) AS ENDERECOCLIENTESAP, 
            TRIM(UPPER(TBC1."Block")) AS BAIRROCLIENTESAP, 
            TRIM(UPPER(TBC1."State")) AS UFCLIENTESAP,
            TRIM(UPPER(TBC1."U_SKILL_indIEDest")) AS INDICACAOIESAP,
            TRIM(TBC1."ZipCode") AS NUCEPSAP
        FROM
            ${dbNameSAP}.OCRD TBO
        INNER JOIN ${dbNameSAP}.CRD1 AS TBC1 ON
            TBO."CardCode" = TBC1."CardCode" 
        INNER JOIN ${dbNameSAP}.CRD7 AS TBC7 ON
            TBC1."CardCode" = TBC7."CardCode"
        WHERE
            TBO."CardType" = 'C'
            AND (REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId4" WITH '') = '${numCpfCnpj}'
                    OR
                REPLACE_REGEXPR('[^[:alnum:]]' IN TBC7."TaxId0" WITH '') = '${numCpfCnpj}')
            AND TBO."CardCode" = ?
    `;
    
    return api.sqlQuery(query, idClienteSap);
}

// UPDATE DADOS
function registrarErroLogDevolucao(idVoucher, msg_Error){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setString(1, String(msg_Error));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return false;
} 

function atualizarDadosClienteIntegradoNoSap(dadosCliente, session){
    let idEmpresa = false;
    let stAtualizar = false;
    let {
        IDCLIENTE,
        IDCLIENTESAP,
        DSNOMERAZAOSOCIAL,
        NUCPFCNPJ, 
        EENDERECO, 
        EBAIRRO,
        ECIDADE,
        UFCLIENTE, 
        UFLOJAVENDA,
        IDLOJAVENDA,
        INDICACAOIESAP,
        IDINDICACAOIE,
        NUCEP
    } = dadosCliente || '';
    
    if(!IDCLIENTESAP){
        return false;
    }
    
    let regClienteSap = getDadosClienteNoSAP(IDCLIENTESAP, NUCPFCNPJ);
    
    if(regClienteSap.length){
        let {
            NOMECLIENTESAP,
            ENDERECOCLIENTESAP,
            UFCLIENTESAP, 
            INDICACAOIESAP,
            NUCEPSAP,
            BAIRROCLIENTESAP
        } = regClienteSap[0] || null;
        
        let stAtualizarNome = NOMECLIENTESAP != DSNOMERAZAOSOCIAL || NOMECLIENTESAP.length < 5 || NOMECLIENTESAP.includes('  ');
        let stAtualizarBairro = EBAIRRO.length > 0 && !/^[A-Za-zÀ-ÖØ-öø-ÿ-(-)\s]+$/.test(EBAIRRO) || BAIRROCLIENTESAP.length > 0 && !/^[A-Za-zÀ-ÖØ-öø-ÿ-(-)\s]+$/.test(BAIRROCLIENTESAP)
        let stAtualizarCep = NUCEP.length != 8 || NUCEPSAP.length != 8;
        let stAtualizarIndicacaoIE = !INDICACAOIESAP || INDICACAOIESAP != IDINDICACAOIE;
        let stAtualizarEnderecoParaODaLojaVenda = UFCLIENTE !== UFLOJAVENDA || UFCLIENTESAP !== UFLOJAVENDA;
        let stAtualizarEnderecoParaOCadastradoQuality = UFCLIENTE == UFLOJAVENDA && (UFCLIENTESAP !== UFCLIENTE || ENDERECOCLIENTESAP !== EENDERECO)
        
        if(stAtualizarNome || stAtualizarCep || stAtualizarBairro || stAtualizarIndicacaoIE || stAtualizarEnderecoParaODaLojaVenda || stAtualizarEnderecoParaOCadastradoQuality){
            stAtualizar = true;
        }
        
        if(stAtualizarEnderecoParaODaLojaVenda){
            idEmpresa = IDLOJAVENDA;
        } 
        
       if(stAtualizarEnderecoParaOCadastradoQuality){
            idEmpresa = false;
        }
        
        /*return {
            idEmpresa, stAtualizar, stAtualizarNome, stAtualizarCep, stAtualizarBairro, stAtualizarIndicacaoIE, stAtualizarEnderecoParaODaLojaVenda, stAtualizarEnderecoParaOCadastradoQuality, INDICACAOIESAP, IDINDICACAOIE
        }*/
        
        if(stAtualizar){
            return libAtualizacaoCliente.executeAtualizarCliente(IDCLIENTE, session, idEmpresa, conn);
        }
        
        return true;
        
    }
    
    return false;
}

function atualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDev){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = null,
            STDEVOLUCAO = 'True',
            DTHORADEVOLUCAO  = now(),
            STDEVOLUCAOSAP = 'True',
            DOCENTRYDEVSAP = ?
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(docEntryDev));
	pStmt.setInt(2, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return true;
}

function atualizarStatusDevolucaoReferenciadaResumoVoucher(idVoucher){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME"."RESUMOVOUCHER"
        SET 
            ERRORLOGSAP = null,
            ERRORLOGQUALITY = null,
            STREFDEVOLUCAOSAP  = 'True'
        WHERE 
            IDVOUCHER = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmt.setInt(1, Number(idVoucher));
	pStmt.execute();
	pStmt.close();
	
	conn.commit();
	
	return true;
}

// SERVICE LAYER SAP
function gerarDevolucaoNoSAP(idVoucher, dadosDevolucao, session){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);

    if(!docEntryDevolucao){
        return postSl(dadosDevolucao, session, idVoucher)
    }
    
    return atualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDevolucao);
}

function postSl(data, session, idVoucher) {
    let response = slApi.post('/CreditNotes',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar a devolução';
        
        return registrarErroLogDevolucao(idVoucher, msgReturnError, conn);
    }
    
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);
    
    if(docEntryDevolucao > 0){
        return atualizarStatusDevolucaoResumoVoucher(idVoucher, docEntryDevolucao);
    }
    
    return registrarErroLogDevolucao(idVoucher, 'Erro ao tentar integrar a devolução', conn);
}

function referenciarDevolucaoGeradaNaTabelaSkill(idVoucher, chaveNota, session){
    let docEntryDevolucao = getDocEntryDevolucaoSAP(idVoucher);
    let regReferenciaGerada = getDocEntryRefDevolucaoSAP(docEntryDevolucao, chaveNota);
    
    if(!regReferenciaGerada.length){
        return libRefDevolucao.referenciarDevolucao(idVoucher, session);
    }
    
    return atualizarStatusDevolucaoReferenciadaResumoVoucher(idVoucher)
}

// START
function executeGerarDevolucao(connDB, session, idVoucher, stMsgRetorno, stAjustarData = 'False'){
    let listaVouchers = getListaVouchers_new(idVoucher);//getListaVouchers(idVoucher);
    let idClienteAnterior = '';
    let ufClienteAnterior = '';
    let ufLojaAnterior = '';
    //return {listaVouchers}
    if(listaVouchers.length == 0){
        
        if(stMsgRetorno) {
            return {
                msg: 'Dados não Encontrados, venda ou voucher cancelado ou já feito o processo de devolucao!'
            };
        }
        
    }
    
    conn = connDB
    
    for(let dados of listaVouchers){
        
        if(!idClienteAnterior || !ufClienteAnterior || !ufLojaAnterior){
            idClienteAnterior = dados.IDCLIENTE;
            ufClienteAnterior = dados.UFCLIENTE;
            ufLojaAnterior = dados.UFLOJAVENDA;
            
        } else {
            
            if(idClienteAnterior == dados.IDCLIENTE && ufClienteAnterior == dados.UFCLIENTE && ufLojaAnterior !== dados.UFLOJAVENDA){
                continue; 
            }
            
            idClienteAnterior = dados.IDCLIENTE;
            ufClienteAnterior = dados.UFCLIENTE;
            ufLojaAnterior = dados.UFLOJAVENDA;
            
        }
        let dadosClienteSapAntesAtualizar = getDadosClienteNoSAP(dados.IDCLIENTESAP, dados.NUCPFCNPJ);
        let isDadosClienteAtualizado = atualizarDadosClienteIntegradoNoSap(dados, session);
        let dadosClienteSapDepoisAtualizar = getDadosClienteNoSAP(dados.IDCLIENTESAP, dados.NUCPFCNPJ); 
        
        //return {isDadosClienteAtualizado, dadosAntesAtualizacao, dadosDepoisAtualizacao}
        
        if(!isDadosClienteAtualizado){
            
            registrarErroLogDevolucao(dados.IDVOUCHER, 'Devolucao não realizada, cliente não integrado/atualizado, verifique o campo ERRORLOGSAP!');
         
            if(stMsgRetorno) {
                return {
                    msg: 'Devolucao não realizada, cliente não integrado/atualizado, verifique o campo ERRORLOGSAP!'
                } 
            }
            
            continue;
            
        }
        
        let jsonNotaDevolucao = montarJsonDevolucao_new(dados, stAjustarData);
        /*return {
            dadosClienteSapAntesAtualizar,
            dadosClienteSapDepoisAtualizar,
            jsonNotaDevolucao
        }*/
        if(jsonNotaDevolucao["DocumentLines"].length == 0){
            registrarErroLogDevolucao(dados.IDVOUCHER, 'Devolucao não realizada, voucher sem produtos!');
            
            if(stMsgRetorno) {
                return {
                    msg: 'Devolucao não realizada, voucher sem produtos!'
                }
            }
            
            continue;
            
        }
        
        let isDevolucaoGeradaNoSAP = gerarDevolucaoNoSAP(dados.IDVOUCHER, jsonNotaDevolucao, session);
        
        if(!isDevolucaoGeradaNoSAP){
            
            if(stMsgRetorno) {
                return {
                    msg: 'Devolucao não realizada, não foi possivel gerar a devolução da venda no SAP, verifique o campo ERRORLOGSAP!'
                } 
            }
            
            continue;
            
        }
        
        let isDevolucaoReferenciadaNaTabelaSkill = referenciarDevolucaoGeradaNaTabelaSkill(dados.IDVOUCHER, dados.CHAVENFE, session);
        
        if(!isDevolucaoReferenciadaNaTabelaSkill){
            
            if(stMsgRetorno){
                return {
                    msg: 'Devolucao não referenciada no SAP, não foi possivel gerar a devolução da venda no SAP, verifique o campo ERRORLOGSAP!'
                }
            }
        }
        
    }
    
    return {
        msg: 'Devoluções Realizadas Com Sucesso!'
    };
    
}


