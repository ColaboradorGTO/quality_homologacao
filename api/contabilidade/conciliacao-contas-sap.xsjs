var api = $.import("quality.concentrador_homologacao.api", "apiResponse");

const DB_NAME_SAP = "SBO_GTO_PRD";

function fnHandleGet() {

    let dataInicio = $.request.parameters.get("dataInicio");
    let dataFim = $.request.parameters.get("dataFim");
    let conta = $.request.parameters.get("conta");
    
	let query = `
        SELECT
            T0."TransId"                             AS "LCM",
            T0."TransType"                           AS "TIPO_ORIGEM_CODIGO",
            CASE T0."TransType"
                WHEN 13  THEN 'NOTA FISCAL DE SAÍDA'
                WHEN 14  THEN 'DEVOLUÇÃO DE NOTA FISCAL DE SAÍDA'
                WHEN 15  THEN 'ENTREGA'
                WHEN 16  THEN 'DEVOLUÇÃO DE ENTREGA'
                WHEN 18  THEN 'NOTA FISCAL DE ENTRADA'
                WHEN 19  THEN 'DEVOLUÇÃO DE NOTA FISCAL DE ENTRADA'
                WHEN 20  THEN 'RECEBIMENTO DE MERCADORIA'
                WHEN 21  THEN 'DEVOLUÇÃO DE MERCADORIA'
                WHEN 24  THEN 'CONTAS A RECEBER / RECEBIMENTO'
                WHEN 30  THEN 'LANÇAMENTO CONTÁBIL MANUAL'
                WHEN 46  THEN 'CONTAS A PAGAR / PAGAMENTO EFETUADO'
                WHEN 59  THEN 'ENTRADA DE MERCADORIA'
                WHEN 60  THEN 'SAÍDA DE MERCADORIA'
                WHEN 67  THEN 'TRANSFERÊNCIA DE ESTOQUE'
                WHEN 69  THEN 'CUSTOS ADICIONAIS DE IMPORTAÇÃO'
                WHEN 162 THEN 'REAVALIAÇÃO DE ESTOQUE'
                WHEN 202 THEN 'ORDEM DE PRODUÇÃO'
                WHEN 203 THEN 'ADIANTAMENTO DE CLIENTE'
                WHEN 204 THEN 'ADIANTAMENTO DE FORNECEDOR'
                ELSE 'OUTRO TIPO - ' || IFNULL(TO_NVARCHAR(T0."TransType"), '')
            END                                      AS "TIPO_ORIGEM",
            T1."BPLId"                               AS "CODIGO_FILIAL",
            BPL."BPLName"                            AS "NOME_FILIAL",
            BPL."VATRegNum"                          AS "CNPJ_FILIAL",
            DM."TIPO_DOCUMENTO"                      AS "DOCUMENTO_ORIGEM",
            TO_NVARCHAR(DM."DOCENTRY")               AS "CHAVE_DOCUMENTO",
            DM."DOCNUM"                              AS "NUMERO_INTERNO_SAP",
            INV."DocEntry"                           AS "ABRIR_NF_SAIDA",
            RIN."DocEntry"                           AS "ABRIR_DEV_NF_SAIDA",
            DLN."DocEntry"                           AS "ABRIR_ENTREGA",
            RDN."DocEntry"                           AS "ABRIR_DEV_ENTREGA",
            PCH."DocEntry"                           AS "ABRIR_NF_ENTRADA",
            RPC."DocEntry"                           AS "ABRIR_DEV_NF_ENTRADA",
            PDN."DocEntry"                           AS "ABRIR_RECEBIMENTO_MERCADORIA",
            RPD."DocEntry"                           AS "ABRIR_DEVOLUCAO_MERCADORIA",
            DPI."DocEntry"                           AS "ABRIR_ADIANTAMENTO_CLIENTE",
            DPO."DocEntry"                           AS "ABRIR_ADIANTAMENTO_FORNECEDOR",
            RCT."DocEntry"                           AS "ABRIR_RECEBIMENTO",
            VPM."DocEntry"                           AS "ABRIR_PAGAMENTO_EFETUADO",
            DM."ID_MODELO"                           AS "ID_MODELO_NF",
            NFM."NfmCode"                            AS "MODELO_NF",
            NFM."NfmName"                            AS "NOME_MODELO_NF",
            DM."NUMERO_NF"                           AS "NUMERO_NF",
            DM."SERIE_NF"                            AS "SERIE_NF",
            DM."COD_PN"                              AS "CODIGO_PN",
            DM."NOME_PN"                             AS "NOME_PN",
            COALESCE(PN_FISCAL."CNPJ_CPF", PN."LicTradNum") AS "CNPJ_CPF_PN",
            T0."RefDate"                             AS "DATA_LANCAMENTO",
            T0."DueDate"                             AS "DATA_VENCIMENTO",
            T0."TaxDate"                             AS "DATA_DOCUMENTO",
            T0."Memo"                                AS "HISTORICO_LCM",
            T0."Ref1"                                AS "REFERENCIA_1_LCM",
            T0."Ref2"                                AS "REFERENCIA_2_LCM",
            T1."Line_ID"                             AS "LINHA_LCM",
            T1."LineMemo"                            AS "HISTORICO_LINHA",
            T1."Account"                             AS "CODIGO_INTERNO_CONTA",
            T2."FormatCode"                          AS "CONTA_CONTABIL",
            T2."AcctName"                            AS "NOME_CONTA",
            T1."Debit"                               AS "DEBITO",
            T1."Credit"                              AS "CREDITO",
            T1."Debit" - T1."Credit"                 AS "SALDO_MOVIMENTO"
        FROM 
            ${DB_NAME_SAP}."OJDT" T0
        INNER JOIN ${DB_NAME_SAP}."JDT1" T1 ON 
            T1."TransId" = T0."TransId"
        LEFT JOIN ${DB_NAME_SAP}."OACT" T2 ON 
            T2."AcctCode" = T1."Account"
        LEFT JOIN ${DB_NAME_SAP}."OBPL" BPL ON 
            BPL."BPLId" = T1."BPLId"
        LEFT JOIN ${DB_NAME_SAP}."OINV" INV ON 
            INV."TransId" = T0."TransId" AND T0."TransType" = 13
        LEFT JOIN ${DB_NAME_SAP}."ORIN" RIN ON 
            RIN."TransId" = T0."TransId" AND T0."TransType" = 14
        LEFT JOIN ${DB_NAME_SAP}."ODLN" DLN ON 
            DLN."TransId" = T0."TransId" AND T0."TransType" = 15
        LEFT JOIN ${DB_NAME_SAP}."ORDN" RDN ON 
            RDN."TransId" = T0."TransId" AND T0."TransType" = 16
        LEFT JOIN ${DB_NAME_SAP}."OPCH" PCH ON 
            PCH."TransId" = T0."TransId" AND T0."TransType" = 18
        LEFT JOIN ${DB_NAME_SAP}."ORPC" RPC ON 
            RPC."TransId" = T0."TransId" AND T0."TransType" = 19
        LEFT JOIN ${DB_NAME_SAP}."OPDN" PDN ON 
            PDN."TransId" = T0."TransId" AND T0."TransType" = 20
        LEFT JOIN ${DB_NAME_SAP}."ORPD" RPD ON 
            RPD."TransId" = T0."TransId" AND T0."TransType" = 21
        LEFT JOIN ${DB_NAME_SAP}."ODPI" DPI ON 
            DPI."TransId" = T0."TransId" AND T0."TransType" = 203
        LEFT JOIN ${DB_NAME_SAP}."ODPO" DPO ON 
            DPO."TransId" = T0."TransId" AND T0."TransType" = 204
        LEFT JOIN ${DB_NAME_SAP}."ORCT" RCT ON
            RCT."TransId" = T0."TransId" AND T0."TransType" = 24
        LEFT JOIN ${DB_NAME_SAP}."OVPM" VPM ON
            VPM."TransId" = T0."TransId" AND T0."TransType" = 46
        LEFT JOIN
        (
            --NOTA FISCAL DE SAÍDA
            SELECT
                13                                   AS "OBJTYPE",
                'NOTA FISCAL DE SAÍDA'               AS "TIPO_DOCUMENTO",
                D0."TransId"                         AS "TRANSID",
                D0."DocEntry"                        AS "DOCENTRY",
                D0."DocNum"                          AS "DOCNUM",
                D0."Model"                           AS "ID_MODELO",
                D0."Serial"                          AS "NUMERO_NF",
                D0."SeriesStr"                       AS "SERIE_NF",
                D0."CardCode"                        AS "COD_PN",
                D0."CardName"                        AS "NOME_PN"
            FROM 
            	${DB_NAME_SAP}."OINV" D0
            
            UNION ALL
            
            --DEVOLUÇÃO DE NOTA FISCAL DE SAÍDA
            SELECT
                14,
                'DEVOLUÇÃO DE NOTA FISCAL DE SAÍDA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ORIN" D0
            
            UNION ALL
            
            --ENTREGA
            SELECT
                15,
                'ENTREGA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ODLN" D0
            
            UNION ALL
            
            --DEVOLUÇÃO DE ENTREGA
            SELECT
                16,
                'DEVOLUÇÃO DE ENTREGA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ORDN" D0
            
            UNION ALL
            
            --NOTA FISCAL DE ENTRADA
            SELECT
                18,
                'NOTA FISCAL DE ENTRADA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."OPCH" D0
            
            UNION ALL
            
            --DEVOLUÇÃO DE NOTA FISCAL DE ENTRADA
            SELECT
                19,
                'DEVOLUÇÃO DE NOTA FISCAL DE ENTRADA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ORPC" D0
            
            UNION ALL
            
            --RECEBIMENTO DE MERCADORIA
            SELECT
                20,
                'RECEBIMENTO DE MERCADORIA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."OPDN" D0
            
            UNION ALL
            
            --DEVOLUÇÃO DE MERCADORIA
            SELECT
                21,
                'DEVOLUÇÃO DE MERCADORIA',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ORPD" D0
            
            UNION ALL
            
            --ADIANTAMENTO DE CLIENTE
            SELECT
                203,
                'ADIANTAMENTO DE CLIENTE',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ODPI" D0
            
            UNION ALL
            
            --ADIANTAMENTO DE FORNECEDOR
            SELECT
                204,
                'ADIANTAMENTO DE FORNECEDOR',
                D0."TransId",
                D0."DocEntry",
                D0."DocNum",
                D0."Model",
                D0."Serial",
                D0."SeriesStr",
                D0."CardCode",
                D0."CardName"
            FROM 
            	${DB_NAME_SAP}."ODPO" D0
        ) DM ON
            DM."TRANSID" = T0."TransId" AND DM."OBJTYPE" = T0."TransType"
        LEFT JOIN ${DB_NAME_SAP}."OCRD" PN ON
            PN."CardCode" = DM."COD_PN"
        LEFT JOIN
        (
            /* Consolida as identificacoes fiscais do PN para nao
               multiplicar as linhas do razao quando houver varios enderecos. */
            SELECT
                F0."CardCode",
                COALESCE
                (
                    MAX
                    (
                        CASE
                            WHEN IFNULL(F0."Address", '') = ''
                             AND F0."AddrType" = 'S'
                             AND IFNULL(F0."TaxId0", '') <> ''
                            THEN F0."TaxId0"
                        END
                    ),
                    MAX
                    (
                        CASE
                            WHEN IFNULL(F0."Address", '') = ''
                             AND F0."AddrType" = 'S'
                             AND IFNULL(F0."TaxId4", '') <> ''
                            THEN F0."TaxId4"
                        END
                    ),
                    MAX
                    (
                        CASE
                            WHEN IFNULL(F0."TaxId0", '') <> ''
                            THEN F0."TaxId0"
                        END
                    ),
                    MAX
                    (
                        CASE
                            WHEN IFNULL(F0."TaxId4", '') <> ''
                            THEN F0."TaxId4"
                        END
                    )
                ) AS "CNPJ_CPF"
            FROM 
                ${DB_NAME_SAP}."CRD7" F0
            GROUP BY 
                F0."CardCode"
        ) PN_FISCAL ON 
            PN_FISCAL."CardCode" = DM."COD_PN"
        LEFT JOIN ${DB_NAME_SAP}."ONFM" NFM ON 
            NFM."AbsEntry" = DM."ID_MODELO"
        WHERE
            T0."RefDate" BETWEEN '${dataInicio}' AND '${dataFim}'
            AND
            (
                T1."Account" = '${conta}'
                OR T2."FormatCode" = '${conta}'
            )
            AND 1 = ?
        ORDER BY
            T1."BPLId",
            T2."FormatCode",
            T0."RefDate",
            T0."TransId",
            T1."Line_ID"
    `;
 
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            fnHandleGet();
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}