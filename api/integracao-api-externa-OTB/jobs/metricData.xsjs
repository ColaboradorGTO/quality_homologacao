let path = "quality.concentrador_homologacao.api";

let api = $.import(path, "apiResponse");
let integracaoOTBService  = $.import(path + ".integracao-api-externa-OTB.libs.services", "integracaoOTBService");

let dbNameSAP = 'SBO_GTO_PRD';
let VAR_DB_NAME = 'QUALITY_CONC';

function getDados(){
    let dataInicial = 'ADD_DAYS( ADD_DAYS(CURRENT_DATE, -1), 1 - DAYOFMONTH(ADD_DAYS(CURRENT_DATE, -1)) )';
    let dataFinal = 'ADD_DAYS( CURRENT_DATE, -1 )'
    
    let query = `
        WITH
            -- 1) Último movimento por dia
            UltimoMovimentoPorDia AS (
                SELECT
                    IDEMPRESA,
                    IDPRODUTO,
                    TO_DATE(DTMOVIMENTO) AS DATA_MOV,
                    MAX(IDINVMOVIMENTO) AS IDINVMOVIMENTO
                FROM
                    "${VAR_DB_NAME}".INVENTARIOMOVIMENTO
                WHERE
                    TO_DATE(DTMOVIMENTO) BETWEEN ${dataInicial} AND ${dataFinal}
                GROUP BY
                    IDEMPRESA,
                    IDPRODUTO,
                    TO_DATE(DTMOVIMENTO)
            ),
            -- 2) Entradas agrupadas por dia
            EntradasPorDia AS (
                SELECT
                    A."BPLId" AS IDEMPRESA,
                    B."ItemCode" AS IDPRODUTO,
                    TO_DATE(A."DocDate") AS DocDate,
                    SUM(B."Quantity" * C.PRECOVENDA) AS TotalValorEntradaPV,
                    SUM(B."Quantity" * C.PRECOCUSTO) AS TotalValorEntradaPC,
                    SUM(B."Quantity") AS QuantidadeEntrada
                FROM
                    "${dbNameSAP}".OPCH A
                JOIN "${dbNameSAP}".PCH1 B ON
                    A."DocEntry" = B."DocEntry"
                    AND B."Usage" IN (10, 21)
                JOIN "${VAR_DB_NAME}".PRODUTO C ON
                    B."ItemCode" = C.IDPRODUTO
                INNER JOIN "${VAR_DB_NAME}".INVENTARIOMOVIMENTO D ON 
                    B."ItemCode" = D.IDPRODUTO
                    AND A."BPLId" = D.IDEMPRESA
                    AND TO_DATE(A."DocDate") = TO_DATE(D.DTMOVIMENTO)
                WHERE
                    A."CANCELED" = 'N'
                    AND A."BPLId" = 101
                    AND TO_DATE(A."DocDate") BETWEEN ${dataInicial} AND ${dataFinal}
                GROUP BY
                    A."BPLId",
                    B."ItemCode",
                    TO_DATE(A."DocDate")
            ),
            -- 3) Vendas agrupadas por dia
            VendasPorDia AS (
                SELECT
                    A.IDEMPRESA,
                    B.CPROD,
                    TO_DATE(A.DTHORAFECHAMENTO) AS DataVenda,
                    SUM(
                        CASE
                            WHEN IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0) < 0
                            THEN ABS(IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0))
                            ELSE IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0)
                        END
                    ) AS TotalVenda,
                    SUM(IFNULL(B.ICMS_VICMS, 0)) AS TotalImposto,
                    SUM(IFNULL(B.QTD, 0) - IFNULL(D.QTD, 0)) AS TotalQtdVendas,
                    SUM(IFNULL(C.PRECOCUSTO, 0)) AS Custo
                FROM
                    "${VAR_DB_NAME}".VENDA A
                INNER JOIN "${VAR_DB_NAME}".VENDADETALHE B ON
                    A.IDVENDA = B.IDVENDA
                INNER JOIN "${VAR_DB_NAME}".PRODUTO C ON
                    B.CPROD = C.IDPRODUTO
                LEFT JOIN "${VAR_DB_NAME}".DETALHEVOUCHER D ON
                    B.IDVOUCHER = D.IDVOUCHER
                    AND C.IDPRODUTO = D.IDPRODUTO
                    AND D.STCANCELADO = 'False'
                LEFT JOIN "${VAR_DB_NAME}".RESUMOVOUCHER E ON
                    D.IDVOUCHER = E.IDVOUCHER
                    AND E.STCANCELADO = 'False'
                    AND A.IDEMPRESA = E.IDEMPRESAORIGEM
                    AND TO_DATE(E.DTINVOUCHER) BETWEEN ${dataInicial} AND ${dataFinal}
                WHERE
                    A.STCANCELADO = 'False'
                    AND B.STCANCELADO = 'False'
                    AND TO_DATE(A.DTHORAFECHAMENTO) BETWEEN ${dataInicial} AND ${dataFinal}
                    AND IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0) <> 0
                GROUP BY
                    A.IDEMPRESA,
                    B.CPROD,
                    TO_DATE(A.DTHORAFECHAMENTO)
            ),
            -- 4) Ultimo movimeto do Periodo 
            UltimoMovimentoPeriodo AS (
                SELECT
                    IDEMPRESA,
                    IDPRODUTO,
                    MAX(IDINVMOVIMENTO) AS IDINVMOVIMENTO
                FROM
                    "${VAR_DB_NAME}".INVENTARIOMOVIMENTO
                WHERE
                    TO_DATE(DTMOVIMENTO) BETWEEN ${dataInicial} AND ${dataFinal}
                GROUP BY
                    IDEMPRESA,
                    IDPRODUTO
            ),
            -- 5) Estoque Final de Acordo com a ultima movimentacao 
            EstoqueFinal AS (
                SELECT
                    A.IDEMPRESA,
                    A.IDPRODUTO,
                    SUM(A.QTDFINAL * B.PRECOVENDA) AS "ValueStockTotal",
                    SUM(A.QTDFINAL * B.PRECOCUSTO) AS "CostStockTotal",
                    SUM(A.QTDFINAL) AS "AmountStockTotal"
                FROM 
                    "${VAR_DB_NAME}".INVENTARIOMOVIMENTO A
                INNER JOIN UltimoMovimentoPeriodo U ON 
                    U.IDEMPRESA = A.IDEMPRESA
                    AND U.IDPRODUTO = A.IDPRODUTO
                    AND U.IDINVMOVIMENTO = A.IDINVMOVIMENTO
                INNER JOIN "${VAR_DB_NAME}".PRODUTO B ON 
                    B.IDPRODUTO = A.IDPRODUTO
               	GROUP BY 
                    A.IDEMPRESA,
                    A.IDPRODUTO
            )
        SELECT
            Z."IsProccessed",
            Z."LocalCode",
            Z."ProductCode",
            Z."DateMoviment",
            SUM(Z."TotalSaleValue")    AS "TotalSaleValue",
            SUM(Z."TotalSaleAmount")   AS "TotalSaleAmount",
            SUM(Z."ValueCMV")          AS "ValueCMV",
            CASE
                WHEN TO_DATE(Z."DateMoviment") = LAST_DAY(TO_DATE(Z."DateMoviment"))
                THEN SUM(Z."ValueStockTotal")
                ELSE 0
            END AS "ValueStockTotal",
            CASE
                WHEN TO_DATE(Z."DateMoviment") = LAST_DAY(TO_DATE(Z."DateMoviment"))
                THEN SUM(Z."CostStockTotal")
                ELSE 0
            END AS "CostStockTotal",
            CASE
                WHEN TO_DATE(Z."DateMoviment") = LAST_DAY(TO_DATE(Z."DateMoviment"))
                THEN SUM(Z."AmountStockTotal")
                ELSE 0
            END AS "AmountStockTotal",
            SUM(Z."ValueReceiveTotal")	AS "ValueReceiveTotal",
            SUM(Z."CostReceiveTotal")   AS "CostReceiveTotal",
            SUM(Z."AmountReceiveTotal") AS "AmountReceiveTotal",
            SUM(Z."ValueMKDTotal")      AS "ValueMKDTotal"
        FROM (
            SELECT
                X."IsProccessed",
                X."LocalCode",
                X."ProductCode",
                X."DateMoviment",
                SUM(X."TotalSaleValue") AS "TotalSaleValue",
                SUM( X."TotalSaleAmount") AS "TotalSaleAmount",
                SUM(X."ValueCMV") AS "ValueCMV",
                SUM(X."ValueStockTotal") AS "ValueStockTotal",
                SUM(X."CostStockTotal") AS "CostStockTotal",
                SUM(X."AmountStockTotal") AS "AmountStockTotal",
                X."ValueReceiveTotal",
                X."CostReceiveTotal",
                X."AmountReceiveTotal",
                SUM(X."ValueMKDTotal") AS "ValueMKDTotal"
            FROM (
                SELECT 
                    'N' AS "IsProccessed",
                    A.IDEMPRESA AS "LocalCode",
                    B.IDPRODUTO AS "ProductCode",
                    CASE
                        WHEN IFNULL(C.CPROD, '') <> '' THEN TO_VARCHAR(C.DataVenda, 'YYYY-MM-DD')
                        ELSE TO_VARCHAR(TO_DATE(A.DTMOVIMENTO), 'YYYY-MM-DD')
                    END AS "DateMoviment",
                    IFNULL(C.TotalVenda, 0) AS "TotalSaleValue",
                    IFNULL(C.TotalQtdVendas, 0) AS "TotalSaleAmount",
                    CASE
                        WHEN IFNULL(C.TotalQtdVendas, 0) = 0 THEN 0
                        ELSE IFNULL(C.Custo, 0)
                    END AS "ValueCMV",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(E.TotalValorEntradaPV, 0)
                        ELSE 0
                    END AS "ValueReceiveTotal",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(E.TotalValorEntradaPC, 0)
                        ELSE 0
                    END AS "CostReceiveTotal",
                    0 AS "ValueStockTotal",
                    0 AS "CostStockTotal",
                    0 AS "AmountStockTotal",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(E.QuantidadeEntrada, 0)
                        ELSE 0
                    END AS "AmountReceiveTotal",
                    ((B.PRECOVENDA - F."Price") * IFNULL(C.TotalQtdVendas, 0)) AS "ValueMKDTotal"
                FROM
                    "${VAR_DB_NAME}".INVENTARIOMOVIMENTO A
                INNER JOIN "${VAR_DB_NAME}".PRODUTO B ON
                    A.IDPRODUTO = B.IDPRODUTO
                INNER JOIN UltimoMovimentoPorDia U ON
                    A.IDEMPRESA = U.IDEMPRESA
                    AND B.IDPRODUTO = U.IDPRODUTO
                    AND TO_DATE(A.DTMOVIMENTO) = U.DATA_MOV
                    AND A.IDINVMOVIMENTO = U.IDINVMOVIMENTO
                LEFT JOIN VendasPorDia C ON
                    A.IDEMPRESA = C.IDEMPRESA
                    AND B.IDPRODUTO = C.CPROD
                    AND TO_DATE(A.DTMOVIMENTO) = C.DataVenda
                LEFT JOIN EntradasPorDia E ON
                    A.IDEMPRESA = E.IDEMPRESA
                    AND B.IDPRODUTO = E.IDPRODUTO
                    AND TO_DATE(A.DTMOVIMENTO) = E.DocDate
                INNER JOIN "${dbNameSAP}".ITM1 F ON
                    B.IDPRODUTO = F."ItemCode"
                    AND F."PriceList" = 3
                WHERE
                    TO_DATE(A.DTMOVIMENTO) BETWEEN ${dataInicial} AND ${dataFinal}
            ) X
            GROUP BY
                X."IsProccessed",
                X."LocalCode",
                X."ProductCode",
                X."DateMoviment",
                X."ValueReceiveTotal",
                X."CostReceiveTotal",
                X."AmountReceiveTotal"
            	    
            UNION ALL
            
            SELECT
                'N' AS "IsProccessed",
                EF.IDEMPRESA AS "LocalCode",
                EF.IDPRODUTO AS "ProductCode",
                TO_VARCHAR(${dataFinal},'YYYY-MM-DD') AS "DateMoviment",
                0 AS "TotalSaleValue",
                0 AS "TotalSaleAmount",
                0 AS "ValueCMV",
                EF."ValueStockTotal" AS "ValueStockTotal",
                EF."CostStockTotal" AS "CostStockTotal",
                EF."AmountStockTotal" AS "AmountStockTotal",
                0 AS "ValueReceiveTotal",
                0 AS "CostReceiveTotal",
                0 AS "AmountReceiveTotal",
                0 AS "ValueMKDTotal"
            FROM 
                EstoqueFinal EF
        ) Z
        WHERE
            1 = ?
        GROUP BY
            Z."IsProccessed",
            Z."LocalCode",
            Z."ProductCode",
            Z."DateMoviment"
        ORDER BY
            Z."DateMoviment",
            Z."LocalCode",
            Z."ProductCode"
    `;
    //return query
    return api.sqlQuery(query, 1);
}

function getDados_old(){
    let dataInicial = '01.05.2026';
    
    let query = `
        SELECT
            Z."IsProccessed",
            Z."LocalCode",
            Z."ProductCode",
            Z."DateMoviment",
            Z."TotalSaleValue" AS "TotalSaleValue",
            Z."TotalSaleAmount",
            Z."ValueCMV" AS "ValueCMV",
            Z."ValueStockTotal" AS "ValueStockTotal",
            Z."CostStockTotal" AS "CostStockTotal",
            Z."AmountStockTotal",
            Z."ValueReceiveTotal" AS "ValueReceiveTotal",
            Z."CostReceiveTotal" AS "CostReceiveTotal",
            Z."AmountReceiveTotal",
            Z."ValueMKDTotal" AS "ValueMKDTotal"
        FROM (
            SELECT
                X."IsProccessed",
                X."LocalCode",
                X."ProductCode",
                X."DateMoviment",
                SUM(X."TotalSaleValue") AS "TotalSaleValue",
                SUM( X."TotalSaleAmount") AS "TotalSaleAmount",
                SUM(X."ValueCMV") AS "ValueCMV",
                SUM(X."ValueStockTotal") AS "ValueStockTotal",
                SUM(X."CostStockTotal") AS "CostStockTotal",
                SUM(X."AmountStockTotal") AS "AmountStockTotal",
                X."ValueReceiveTotal",
                X."CostReceiveTotal",
                X."AmountReceiveTotal",
                SUM(X."ValueMKDTotal") AS "ValueMKDTotal"
            FROM (
                SELECT
                    'N' AS "IsProccessed",
                    A.IDEMPRESA AS "LocalCode",
                    B.IDPRODUTO AS "ProductCode",
                    CASE
                        WHEN IFNULL(C.CPROD, '') <> '' THEN TO_VARCHAR(C.DataVenda, ' YYYY-MM-DD')
                        ELSE TO_VARCHAR(TO_DATE(A.DTMOVIMENTO), ' YYYY-MM-DD')
                    END AS "DateMoviment",
                    IFNULL(C.TotalVenda, 0) AS "TotalSaleValue",
                    IFNULL(C.TotalQtdVendas, 0) AS "TotalSaleAmount",
                    CASE
                        WHEN IFNULL(C.TotalQtdVendas, 0) = 0 THEN 0
                        ELSE IFNULL(C.Custo, 0) / C.TotalQtdVendas * C.TotalQtdVendas
                    END AS "ValueCMV",
                    CASE
                        WHEN ROW_NUMBER() OVER (
                            PARTITION BY A.IDEMPRESA, B.IDPRODUTO
                            ORDER BY C.DataVenda DESC
                        ) = 1
                        AND TO_DATE(A.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                        THEN (A.QTDFINAL * B.PRECOVENDA)
                        ELSE 0
                    END AS "ValueStockTotal",
                    CASE
                        WHEN ROW_NUMBER() OVER (
                            PARTITION BY A.IDEMPRESA, B.IDPRODUTO
                            ORDER BY C.DataVenda DESC
                        ) = 1
                        AND TO_DATE(A.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                        THEN (A.QTDFINAL * B.PRECOCUSTO)
                        ELSE 0
                    END AS "CostStockTotal",
                    CASE
                        WHEN ROW_NUMBER() OVER (
                            PARTITION BY A.IDEMPRESA, B.IDPRODUTO
                            ORDER BY C.DataVenda DESC
                        ) = 1
                        AND TO_DATE(A.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                        THEN A.QTDFINAL
                        ELSE 0
                    END AS "AmountStockTotal",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(E.TotalValorEntradaPV, 0)
                        ELSE 0
                    END AS "ValueReceiveTotal",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(ROUND(E.TotalValorEntradaPC, 2), 0)
                        ELSE 0
                    END AS "CostReceiveTotal",
                    CASE
                        WHEN A.IDEMPRESA = 101 THEN IFNULL(E.QuantidadeEntrada, 0)
                        ELSE 0
                    END AS "AmountReceiveTotal",
                    ((B.PRECOVENDA - F."Price") * IFNULL(TotalQtdVendas, 0)) AS "ValueMKDTotal"
                FROM 
                    "${VAR_DB_NAME}".INVENTARIOMOVIMENTO A
                INNER JOIN "${VAR_DB_NAME}".PRODUTO B
                    ON A.IDPRODUTO = B.IDPRODUTO
                LEFT JOIN (
                    SELECT
                        A.IDEMPRESA,
                        B.CPROD,
                        TO_DATE(A.DTHORAFECHAMENTO) AS DataVenda,
                        SUM(
                            CASE
                                WHEN IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0) < 0
                                THEN ABS(IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0))
                                ELSE IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0)
                            END
                        ) AS TotalVenda,
                        SUM(IFNULL(B.ICMS_VICMS, 0)) AS TotalImposto,
                        SUM(IFNULL(B.QTD, 0) - IFNULL(D.QTD, 0)) AS TotalQtdVendas,
                        SUM(IFNULL(C.PRECOCUSTO, 0)) AS Custo
                    FROM 
                        "${VAR_DB_NAME}".VENDA A
                    INNER JOIN "${VAR_DB_NAME}".VENDADETALHE B
                        ON A.IDVENDA = B.IDVENDA
                    INNER JOIN "${VAR_DB_NAME}".PRODUTO C
                        ON B.CPROD = C.IDPRODUTO
                    LEFT JOIN "${VAR_DB_NAME}".DETALHEVOUCHER D
                        ON B.IDVOUCHER = D.IDVOUCHER
                        AND C.IDPRODUTO = D.IDPRODUTO
                        AND D.STCANCELADO = 'False'
                    LEFT JOIN "${VAR_DB_NAME}".RESUMOVOUCHER E
                        ON D.IDVOUCHER = E.IDVOUCHER
                        AND E.STCANCELADO = 'False'
                        AND A.IDEMPRESA = E.IDEMPRESAORIGEM
                        AND TO_DATE(E.DTINVOUCHER) = ADD_DAYS(CURRENT_DATE, -1)
                    WHERE
                        A.STCANCELADO = 'False'
                        AND B.STCANCELADO = 'False'
                        AND TO_DATE(A.DTHORAFECHAMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                        AND IFNULL(B.VRTOTALLIQUIDO, 0) - IFNULL(D.VRUNIT, 0) <> 0
                    GROUP BY
                        A.IDEMPRESA,
                        B.CPROD,
                        TO_DATE(A.DTHORAFECHAMENTO)
                ) C
                    ON A.IDEMPRESA = C.IDEMPRESA
                    AND B.IDPRODUTO = C.CPROD
                LEFT JOIN (
                    SELECT
                        A."BPLId" AS IDEMPRESA,
                        B."ItemCode" AS IDPRODUTO,
                        SUM(B."StockPrice") AS CustoEntrada,
                        SUM(B."Quantity") AS QuantidadeEntrada,
                        SUM(B."Quantity" * C.PRECOVENDA) AS TotalValorEntradaPV,
                        SUM(B."Quantity" * C.PRECOCUSTO) AS TotalValorEntradaPC
                    FROM 
                        "${dbNameSAP}".OPCH A
                    INNER JOIN "${dbNameSAP}".PCH1 B
                        ON A."DocEntry" = B."DocEntry"
                        AND B."Usage" IN (10, 21)
                    INNER JOIN "${VAR_DB_NAME}".PRODUTO C
                        ON B."ItemCode" = C.IDPRODUTO
                    WHERE
                        A."CANCELED" = 'N'
                        AND A."BPLId" = 101
                        AND TO_DATE(A."DocDate") = ADD_DAYS(CURRENT_DATE, -1)
                    GROUP BY
                        A."BPLId",
                        B."ItemCode"
                ) E
                    ON B.IDPRODUTO = E.IDPRODUTO
                INNER JOIN "${dbNameSAP}".ITM1 F
                    ON B.IDPRODUTO = F."ItemCode"
                    AND F."PriceList" = 3
                WHERE
                    TO_DATE(A.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                    AND A.IDINVMOVIMENTO = (
                        SELECT 
                            MAX(XA.IDINVMOVIMENTO)
                        FROM 
                            "${VAR_DB_NAME}".INVENTARIOMOVIMENTO XA
                        WHERE
                            XA.IDEMPRESA = A.IDEMPRESA
                            AND XA.IDPRODUTO = A.IDPRODUTO
                            AND TO_DATE(XA.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                    )
            ) X
            GROUP BY
                X."IsProccessed",
                X."LocalCode",
                X."ProductCode",
                X."DateMoviment",
                X."ValueReceiveTotal",
                X."CostReceiveTotal",
                X."AmountReceiveTotal"
        UNION ALL
            SELECT
                'N' AS "IsProccessed",
                A.IDEMPRESA AS "LocalCode",
                A.IDPRODUTO AS "ProductCode",
                TO_VARCHAR(ADD_DAYS(CURRENT_DATE, -1), ' YYYY-MM-DD') AS "DateMoviment",
                0 AS "TotalSaleValue",
                0 AS "TotalSaleAmount",
                0 AS "ValueCMV",
                (A.QTDFINAL * B.PRECOVENDA) AS "ValueStockTotal",
                (A.QTDFINAL * B.PRECOCUSTO) AS "CostStockTotal",
                A.QTDFINAL AS "AmountStockTotal",
                0 AS "ValueReceiveTotal",
                0 AS "CostReceiveTotal",
                0 AS "AmountReceiveTotal",
                0 AS "ValueMKDTotal"
            FROM 
                "${VAR_DB_NAME}".INVENTARIOMOVIMENTO A
            INNER JOIN "${VAR_DB_NAME}".PRODUTO B
                ON A.IDPRODUTO = B.IDPRODUTO
            WHERE
                A.IDINVMOVIMENTO = (
                    SELECT 
                        MAX(XA.IDINVMOVIMENTO)
                    FROM 
                        "${VAR_DB_NAME}".INVENTARIOMOVIMENTO XA
                    WHERE
                        XA.IDEMPRESA = A.IDEMPRESA
                        AND XA.IDPRODUTO = A.IDPRODUTO
                        AND TO_DATE(XA.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                )
                AND NOT EXISTS (
                    SELECT 
                        1
                    FROM 
                        "${VAR_DB_NAME}".INVENTARIOMOVIMENTO XA
                    WHERE
                        XA.IDEMPRESA = A.IDEMPRESA
                        AND XA.IDPRODUTO = A.IDPRODUTO
                        AND TO_DATE(XA.DTMOVIMENTO) = ADD_DAYS(CURRENT_DATE, -1)
                )
                AND A.QTDFINAL <> 0
        ) Z
        WHERE
            1 = ?
        ORDER BY
            Z."DateMoviment",
            Z."LocalCode",
            Z."ProductCode"
    `;
    //return query
    return api.sqlQuery(query, 1);
}

function integrarDadosMetricDataOTB(){
    let config = {
        nomeAPI: "Metric",
        endpoint: "/StageMetrics/api/Metric/Post",
        tamanhoLote: 5000,
        arrayDados: getDados()
    };
    //return config
    integracaoOTBService.executarIntegracao(config);
    
    return {
        msg: "Dados Migrados Com Sucesso!"
    }
}

try {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var docReturn = fnHandleGet();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var docReturn = integrarDadosMetricDataOTB();
            $.response.setBody(JSON.stringify(docReturn));
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