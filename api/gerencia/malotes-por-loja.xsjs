let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let conn;

function fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn, STATUSMALOTE) {
    let queryInsertHistorico = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOMALOTECAIXALOJA 
        (
            IDMALOTE,
            IDEMPRESA,
            DATAMOVIMENTOCAIXA,
            VRDINHEIRO,
            VRCARTAO,
            VRPOS,
            VRPIX,
            VRCONVENIO,
            VRVOUCHER,
            VRFATURA,
            VRFATURAPIX,
            VRDESPESA,
            VRTOTALRECEBIDO,
            VRDISPONIVEL,
            STSTATUS,
            IDUSERCRIACAO,
            DATAHORACRIACAO,
            IDUSERENVIO,
            DATAHORAENVIO,
            IDUSERRECEPCAO,
            DATAHORARECEPCAO,
            IDUSERCONFERENCIA,
            DATAHORACONFERENCIA,
            IDUSERDEVOLUCAO,
            DATAHORADEVOLUCAO,
            IDUSERREENVIO,
            DATAHORAREENVIO,
            IDVINCULOPENDENCIA,
            OBSERVACAOLOJA,
            OBSERVACAOADMINISTRATIVO,
            STATIVO,
            IDUSERULTIMAALTERACAO,
            DATAHORAULTIMAALTERACAO
        ) 
        SELECT 
            TBM.IDMALOTE,
            TBM.IDEMPRESA,
            TBM.DATAMOVIMENTOCAIXA,
            TBM.VRDINHEIRO,
            TBM.VRCARTAO,
            TBM.VRPOS,
            TBM.VRPIX,
            TBM.VRCONVENIO,
            TBM.VRVOUCHER,
            TBM.VRFATURA,
            TBM.VRFATURAPIX,
            TBM.VRDESPESA,
            TBM.VRTOTALRECEBIDO,
            TBM.VRDISPONIVEL,
            ${!STATUSMALOTE ? 'TBM.STSTATUS' : `'${STATUSMALOTE}'`} AS STSTATUS,
            TBM.IDUSERCRIACAO,
            TBM.DATAHORACRIACAO, 
            TBM.IDUSERENVIO,
            TBM.DATAHORAENVIO,
            TBM.IDUSERRECEPCAO,
            TBM.DATAHORARECEPCAO,
            TBM.IDUSERCONFERENCIA,
            TBM.DATAHORACONFERENCIA,
            TBM.IDUSERDEVOLUCAO,
            TBM.DATAHORADEVOLUCAO,
            TBM.IDUSERREENVIO,
            TBM.DATAHORAREENVIO,
            TBM.IDVINCULOPENDENCIA,
            TBM.OBSERVACAOLOJA,
            TBM.OBSERVACAOADMINISTRATIVO,
            TBM.STATIVO,
            TBM.IDUSERULTIMAALTERACAO,
            TBM.DATAHORAULTIMAALTERACAO
        FROM 
            "VAR_DB_NAME".MALOTECAIXALOJA  TBM
        WHERE 
            TBM.IDMALOTE = ?
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsertHistorico));
    
    pStmtInsert.setInt(1, IDMALOTE);
    pStmtInsert.execute();
    pStmtInsert.close();
    
    conn.commit();
    
    return true;
}

function fnAtualizarPendenciasMalote(IDMALOTE, IDUSER, conn){

    let idHistoricoMalote = api.executeScalar(`SELECT MAX(IDHISTORICO) AS IDHISTORICOMALOTE  FROM "VAR_DB_NAME".HISTORICOMALOTECAIXALOJA WHERE IDMALOTE = ? `, IDMALOTE);
    
    let queryInsertHistPendencias = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOVINCULOPENDENCIAMALOTECAIXALOJA
        (
            IDHISTORICOMALOTE,
            IDMALOTE,
            IDPENDENCIA,
            OBSERVACAO,
            STRESOLVIDO,
            STATIVO,
            DATAHORACRIACAO 
        )
        SELECT
            ${idHistoricoMalote} AS IDHISTORICOMALOTE,
            ${IDMALOTE} AS IDMALOTE,
            IDPENDENCIA,
            OBSERVACAO,
            STRESOLVIDO,
            STATIVO,
            DATAHORACRIACAO
        FROM
            "VAR_DB_NAME".VINCULOPENDENCIAMALOTECAIXALOJA TBV
        WHERE 
            TBV.IDMALOTE = ?
    `;
    
    let pStmtInsertHistPendencia = conn.prepareStatement(api.replaceDbName(queryInsertHistPendencias));
    
    pStmtInsertHistPendencia.setInt(1, Number(IDMALOTE));
    
    pStmtInsertHistPendencia.execute();
    pStmtInsertHistPendencia.close();
    
    conn.commit();
}

function fnHandleGet(byId) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let idMalote = $.request.parameters.get("idMalote");
    let statusMalote = $.request.parameters.get("statusMalote");
    let pendenciaMalote = $.request.parameters.get("pendenciaMalote");
    
    if(!idMalote && (!dataPesquisaInicio || !dataPesquisaFim)) {
        throw 'Especifique uma data inicio e uma data fim para a consulta!';
    }

	let query = `
        WITH MOVIMENTO_CAIXA_DADOS AS (
            SELECT DISTINCT 
                NULL AS IDMALOTE,
                TBE.IDEMPRESA,
                TBE.NOFANTASIA,
                TO_DATE(TBV.DTHORAFECHAMENTO) AS DTHORAFECHAMENTO,
                TO_VARCHAR(TO_DATE(TBV.DTHORAFECHAMENTO), 'DD/mm/YYYY') AS DTHORAFECHAMENTOFORMATADA,
                IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, 
                IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, 
                IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO!='PIX')) AS VALORTOTALPOS, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'PIX' AND (tbvp.DSTIPOPAGAMENTO ='PIX')) AS VALORTOTALPIX, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO ='MoovPay')) AS VALORTOTALMOOVPAY, 
                IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, 
                (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbdf.IDEMPRESA = tbv.IDEMPRESA AND tbdf.STCANCELADO = 'False' AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL)) AS VALORTOTALFATURA, 
                (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbdf.IDEMPRESA = tbv.IDEMPRESA AND tbdf.STCANCELADO = 'False' AND tbdf.STPIX = 'True') AS VALORTOTALFATURAPIX, 
                (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.DTDESPESA = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbd.IDEMPRESA = tbv.IDEMPRESA AND tbd.STCANCELADO = 'False') AS VALORTOTALDESPESA, 
                (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.DTLANCAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbas.IDEMPRESA = tbv.IDEMPRESA AND tbas.STATIVO = 'True') AS VALORTOTALADIANTAMENTOSALARIAL, 
                (SELECT IFNULL (SUM(dl.VRFISICODINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRFISICODINHEIRO, 
                (SELECT IFNULL (SUM(dl.VRAJUSTDINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRAJUSTEDINHEIRO, 
                (SELECT IFNULL (SUM(CASE WHEN IFNULL(dl.VRAJUSTDINHEIRO, 0) <> 0 THEN dl.VRAJUSTDINHEIRO ELSE dl.VRRECDINHEIRO  END ), 0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRRECDINHEIRO,
                0 AS VRTOTALRECEBIDO,
                0 AS VRDISPONIVEL,
                'Pendente de Envio' AS STATUSMALOTE,
                '' AS OBSERVACAOADMINISTRATIVOMALOTE,
                '' AS OBSERVACAOLOJAMALOTE,
                '' AS STATIVOMALOTE,
                '' AS DATAHORACRIACAOMALOTE
            FROM
                "VAR_DB_NAME".VENDA TBV
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                TBE.IDEMPRESA = TBV.IDEMPRESA
            WHERE
                TBV.STCANCELADO='False'
                ${ dataPesquisaInicio ? ` AND (TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}' )` : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
            GROUP BY 
                TBE.IDEMPRESA,
                TBV.IDEMPRESA,
                TBE.NOFANTASIA,
                TO_DATE(TBV.DTHORAFECHAMENTO)
        ),
        
        MALOTE_DADOS AS (
            SELECT 
                TBM.IDMALOTE,
                TBE.IDEMPRESA,
                TBE.NOFANTASIA,
                TBM.DATAMOVIMENTOCAIXA AS DTHORAFECHAMENTO,
                TO_VARCHAR(TO_DATE(TBM.DATAMOVIMENTOCAIXA), 'DD/mm/YYYY') AS DTHORAFECHAMENTOFORMATADA,
                TBM.VRDINHEIRO AS VALORTOTALDINHEIRO, 
                TBM.VRCARTAO AS VALORTOTALCARTAO, 
                TBM.VRCONVENIO AS VALORTOTALCONVENIO, 
                TBM.VRPOS AS VALORTOTALPOS, 
                TBM.VRPIX AS VALORTOTALPIX, 
                0 AS VALORTOTALMOOVPAY, 
                TBM.VRVOUCHER AS VALORTOTALVOUCHER, 
                TBM.VRFATURA AS VALORTOTALFATURA, 
                TBM.VRFATURAPIX AS VALORTOTALFATURAPIX, 
                TBM.VRDESPESA AS VALORTOTALDESPESA, 
                0 AS VALORTOTALADIANTAMENTOSALARIAL, 
                0 AS VRFISICODINHEIRO, 
                0 AS VRAJUSTEDINHEIRO, 
                0 AS VRRECDINHEIRO,
                TBM.VRTOTALRECEBIDO,
                TBM.VRDISPONIVEL,
                TBM.STSTATUS AS STATUSMALOTE,
                TO_VARCHAR(TBM.OBSERVACAOADMINISTRATIVO) AS OBSERVACAOADMINISTRATIVOMALOTE,
                TO_VARCHAR(TBM.OBSERVACAOLOJA) AS OBSERVACAOLOJAMALOTE,
                TBM.STATIVO AS STATIVOMAOTE,
                IFNULL(TO_VARCHAR(TO_DATE(TBM.DATAHORACRIACAO), 'DD/mm/YYYY'), '') AS DATAHORACRIACAOMALOTE
            FROM 
                "VAR_DB_NAME".MALOTECAIXALOJA TBM
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
                TBM.IDEMPRESA = TBE.IDEMPRESA 
            WHERE
                TBM.STATIVO ='True'
                ${ idMalote ? ' AND TBM.IDMALOTE = ' + idMalote : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
                ${ statusMalote ? ` AND CONTAINS(TBM.STSTATUS, '${statusMalote}}')` : ''}
                ${ dataPesquisaInicio ? ` AND (TO_DATE(TBM.DATAMOVIMENTOCAIXA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')` : ''}
        )
        SELECT 
            * 
        FROM 
            MALOTE_DADOS
            
        UNION ALL
            
        SELECT 
            * 
        FROM 
            MOVIMENTO_CAIXA_DADOS TBMC 
        WHERE 
            NOT EXISTS (
                SELECT 
                    1 
                FROM 
                    MALOTE_DADOS TBMD 
                WHERE 
                    TBMD.IDEMPRESA = TBMC.IDEMPRESA 
                    AND TBMD.DTHORAFECHAMENTO = TBMC.DTHORAFECHAMENTO
                    AND 1 = ?
        )
        ORDER BY DTHORAFECHAMENTO
	`;
	
	if(idMalote || (statusMalote && statusMalote !== 'Pendente de Envio')){
        query = `
            SELECT 
                TBM.IDMALOTE,
                TBE.IDEMPRESA,
                TBE.NOFANTASIA,
                TBM.DATAMOVIMENTOCAIXA AS DTHORAFECHAMENTO,
                TO_VARCHAR(TO_DATE(TBM.DATAMOVIMENTOCAIXA), 'DD/mm/YYYY') AS DTHORAFECHAMENTOFORMATADA,
                TBM.VRDINHEIRO AS VALORTOTALDINHEIRO, 
                TBM.VRCARTAO AS VALORTOTALCARTAO, 
                TBM.VRCONVENIO AS VALORTOTALCONVENIO, 
                TBM.VRPOS AS VALORTOTALPOS, 
                TBM.VRPIX AS VALORTOTALPIX, 
                0 AS VALORTOTALMOOVPAY, 
                TBM.VRVOUCHER AS VALORTOTALVOUCHER, 
                TBM.VRFATURA AS VALORTOTALFATURA, 
                TBM.VRFATURAPIX AS VALORTOTALFATURAPIX, 
                TBM.VRDESPESA AS VALORTOTALDESPESA, 
                0 AS VALORTOTALADIANTAMENTOSALARIAL, 
                0 AS VRFISICODINHEIRO, 
                0 AS VRAJUSTEDINHEIRO, 
                0 AS VRRECDINHEIRO,
                TBM.VRTOTALRECEBIDO,
                TBM.VRDISPONIVEL,
                TBM.STSTATUS AS STATUSMALOTE,
                TO_VARCHAR(TBM.OBSERVACAOADMINISTRATIVO) AS OBSERVACAOADMINISTRATIVOMALOTE,
                TO_VARCHAR(TBM.OBSERVACAOLOJA) AS OBSERVACAOLOJAMALOTE,
                TBM.STATIVO AS STATIVOMAOTE,
                IFNULL(TO_VARCHAR(TO_DATE(TBM.DATAHORACRIACAO), 'DD/mm/YYYY'), '') AS DATAHORACRIACAOMALOTE
            FROM 
                "VAR_DB_NAME".MALOTECAIXALOJA TBM
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
                TBM.IDEMPRESA = TBE.IDEMPRESA 
            WHERE
                TBM.STATIVO ='True'
                ${ idMalote ? ' AND TBM.IDMALOTE = ' + idMalote : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
                ${ statusMalote ? ` AND CONTAINS(TBM.STSTATUS, '${statusMalote}')` : ''}
                ${ dataPesquisaInicio ? ` AND (TO_DATE(TBM.DATAMOVIMENTOCAIXA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')` : ''}
                AND 1 = ? 
            ORDER BY 
                TBM.DATAMOVIMENTOCAIXA
        `;
	} else if(statusMalote == 'Pendente de Envio'){
        query = `
            SELECT DISTINCT 
                NULL AS IDMALOTE,
                TBE.IDEMPRESA,
                TBE.NOFANTASIA,
                TO_DATE(TBV.DTHORAFECHAMENTO) AS DTHORAFECHAMENTO,
                TO_VARCHAR(TO_DATE(TBV.DTHORAFECHAMENTO), 'DD/mm/YYYY') AS DTHORAFECHAMENTOFORMATADA,
                IFNULL (SUM(tbv.VRRECDINHEIRO),0) AS VALORTOTALDINHEIRO, 
                IFNULL (SUM(tbv. VRRECCARTAO),0) AS VALORTOTALCARTAO, 
                IFNULL (SUM(tbv.VRRECCONVENIO),0) AS VALORTOTALCONVENIO, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO!='PIX')) AS VALORTOTALPOS, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'PIX' AND (tbvp.DSTIPOPAGAMENTO ='PIX')) AS VALORTOTALPIX, 
                (SELECT IFNULL (SUM(tbvp.VALORRECEBIDO),0) FROM "VAR_DB_NAME".VENDAPAGAMENTO tbvp INNER JOIN "VAR_DB_NAME".VENDA tbv1 ON tbvp.IDVENDA=tbv1.IDVENDA WHERE TO_DATE(tbv1.DTHORAFECHAMENTO) = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbv1.IDEMPRESA = tbv.IDEMPRESA AND tbv1.STCANCELADO = 'False' AND (tbvp.STCANCELADO = 'False' OR tbvp.STCANCELADO IS NULL) AND tbvp.NOTEF = 'POS' AND (tbvp.DSTIPOPAGAMENTO ='MoovPay')) AS VALORTOTALMOOVPAY, 
                IFNULL (SUM(tbv.VRRECVOUCHER),0) AS VALORTOTALVOUCHER, 
                (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbdf.IDEMPRESA = tbv.IDEMPRESA AND tbdf.STCANCELADO = 'False' AND (tbdf.STPIX = 'False' OR tbdf.STPIX IS NULL)) AS VALORTOTALFATURA, 
                (SELECT IFNULL (SUM(tbdf.VRRECEBIDO),0) FROM "VAR_DB_NAME".DETALHEFATURA tbdf WHERE tbdf.DTPROCESSAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbdf.IDEMPRESA = tbv.IDEMPRESA AND tbdf.STCANCELADO = 'False' AND tbdf.STPIX = 'True') AS VALORTOTALFATURAPIX, 
                (SELECT IFNULL (SUM(tbd.VRDESPESA),0) FROM "VAR_DB_NAME".DESPESALOJA tbd WHERE tbd.DTDESPESA = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbd.IDEMPRESA = tbv.IDEMPRESA AND tbd.STCANCELADO = 'False') AS VALORTOTALDESPESA, 
                (SELECT IFNULL (SUM(tbas.VRVALORDESCONTO),0) FROM "VAR_DB_NAME".ADIANTAMENTOSALARIAL tbas WHERE tbas.DTLANCAMENTO = TO_DATE(tbv.DTHORAFECHAMENTO) AND tbas.IDEMPRESA = tbv.IDEMPRESA AND tbas.STATIVO = 'True') AS VALORTOTALADIANTAMENTOSALARIAL, 
                (SELECT IFNULL (SUM(dl.VRFISICODINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRFISICODINHEIRO, 
                (SELECT IFNULL (SUM(dl.VRAJUSTDINHEIRO),0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRAJUSTEDINHEIRO, 
                (SELECT IFNULL (SUM(CASE WHEN IFNULL(dl.VRAJUSTDINHEIRO, 0) <> 0 THEN dl.VRAJUSTDINHEIRO ELSE dl.VRRECDINHEIRO  END ), 0) FROM "VAR_DB_NAME".MOVIMENTOCAIXA dl WHERE TO_DATE(dl.DTABERTURA) = TO_DATE(tbv.DTHORAFECHAMENTO) AND dl.IDEMPRESA = tbv.IDEMPRESA AND dl.STCANCELADO = 'False' AND dl.STFECHADO = 'True') AS VRRECDINHEIRO,
                0 AS VRTOTALRECEBIDO,
                0 AS VRDISPONIVEL,
                'Pendente de Envio' AS STATUSMALOTE,
                '' AS OBSERVACAOADMINISTRATIVOMALOTE,
                '' AS OBSERVACAOLOJAMALOTE,
                '' AS STATIVOMALOTE,
                '' AS DATAHORACRIACAOMALOTE
            FROM
                "VAR_DB_NAME".VENDA TBV
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                TBE.IDEMPRESA = TBV.IDEMPRESA
            WHERE
                TBV.STCANCELADO='False'
                ${ dataPesquisaInicio ? ` AND (TO_DATE(TBV.DTHORAFECHAMENTO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}' )` : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
                AND NOT EXISTS (
                    SELECT 
                        1 
                    FROM 
                        "VAR_DB_NAME".MALOTECAIXALOJA TBM
                    WHERE 
                        TBM.IDEMPRESA = TBV.IDEMPRESA 
                        AND TBM.DATAMOVIMENTOCAIXA = TO_DATE(TBV.DTHORAFECHAMENTO)
                    )
                    AND 1 = ?
            GROUP BY 
                TBE.IDEMPRESA,
                TBV.IDEMPRESA,
                TBE.NOFANTASIA,
                TO_DATE(TBV.DTHORAFECHAMENTO)
            ORDER BY 
                TO_DATE(TBV.DTHORAFECHAMENTO)
        `;
	}
	
	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();
    
    for (let i = 0; i < bodyJson.length; i++) {
        let {
            IDMALOTE,
            IDEMPRESA,
            DATAMOVIMENTOCAIXA,
            VRDINHEIRO,
            VRCARTAO,
            VRPOS,
            VRPIX,
            VRCONVENIO,
            VRVOUCHER,
            VRFATURA,
            VRFATURAPIX,
            VRDESPESA,
            VRTOTALRECEBIDO,
            VRDISPONIVEL,
            STATUS,
            DATAHORAREENVIO,
            DATAHORAENVIADO,
            DATAHORARECEBIDO,
            OBSERVACAOLOJA,
            OBSERVACAOADMINISTRATIVO,
            IDUSERULTIMAALTERACAO
        } = bodyJson[i] || '';
        
        if(!IDMALOTE || !IDUSERULTIMAALTERACAO){
            throw new Error('Os parametros de IDMALOTE e IDUSERULTIMAALTERACAO são obrigatorios!');
        }
        
        let queryUpdateMalote = `
            UPDATE 
                "VAR_DB_NAME".MALOTECAIXALOJA
            SET
                ${ IDEMPRESA ? 'IDEMPRESA = ' + IDEMPRESA + ',' : ''}
                ${ DATAMOVIMENTOCAIXA ? ` DATAMOVIMENTOCAIXA = '${DATAMOVIMENTOCAIXA}', `: ''}
                ${ VRDINHEIRO ? 'VRDINHEIRO =' + VRDINHEIRO + ',' : ''}
                ${ VRCARTAO ? 'VRCARTAO =' + VRCARTAO + ',' : ''}
                ${ VRPOS ? 'VRPOS =' + VRPOS + ',' : ''}
                ${ VRPIX ? 'VRPIX =' + VRPIX + ',' : ''}
                ${ VRCONVENIO ? 'VRCONVENIO ='+ VRCONVENIO + ',' : ''}
                ${ VRVOUCHER ? 'VRVOUCHER =' + VRVOUCHER + ',' : ''}
                ${ VRFATURA ? 'VRFATURA =' + VRFATURA + ',' : ''}
                ${ VRFATURAPIX ? 'VRFATURAPIX =' + VRFATURAPIX + ',' : ''}
                ${ VRDESPESA ? 'VRDESPESA =' + VRDESPESA + ',' : ''}
                ${ VRTOTALRECEBIDO ? 'VRTOTALRECEBIDO =' + VRTOTALRECEBIDO + ',' : ''}
                ${ VRDISPONIVEL ? 'VRDISPONIVEL =' + VRDISPONIVEL + ',' : ''}
                ${ STATUS ? `STSTATUS = '${STATUS}', ` : ''}
                ${ (STATUS == 'Recepcionado' && IDUSERULTIMAALTERACAO) ? ` IDUSERRECEPCAO = ${IDUSERULTIMAALTERACAO}, `: ''}
                ${ (STATUS == 'Recepcionado' || DATAHORARECEBIDO) ? ' DATAHORARECEPCAO = CURRENT_TIMESTAMP, ': ''}
                ${ (STATUS == 'Reenviado' && IDUSERULTIMAALTERACAO) ? ` IDUSERREENVIO = ${IDUSERULTIMAALTERACAO}, `: ''}
                ${ (STATUS == 'Reenviado' || DATAHORAREENVIO) ? ' DATAHORAREENVIO = CURRENT_TIMESTAMP, ' : ''}
                ${ OBSERVACAOLOJA ? ` OBSERVACAOLOJA = '${OBSERVACAOLOJA}', `: ''}
                ${ OBSERVACAOADMINISTRATIVO ? ` OBSERVACAOADMINISTRATIVO = '${OBSERVACAOADMINISTRATIVO}', `: ''}
                IDUSERULTIMAALTERACAO = ?,
                DATAHORAULTIMAALTERACAO = CURRENT_TIMESTAMP
            WHERE 
                "IDMALOTE" =  ?
        `;
        
        var pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateMalote));
        
        if(fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn) == true){
            fnAtualizarPendenciasMalote(IDMALOTE, IDUSERULTIMAALTERACAO, conn);
            
            pStmtUpdate.setInt(1, IDUSERULTIMAALTERACAO);
            pStmtUpdate.setInt(2, IDMALOTE)
            pStmtUpdate.execute();
            
        } else {
            throw new Error('Erro ao tentar atualizar os dados do Malote!');
        }
        
    }
    
    pStmtUpdate.close();

    conn.commit();

    return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();
    
    let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME".MALOTECAIXALOJA
		(
            IDMALOTE,
            IDEMPRESA,
            DATAMOVIMENTOCAIXA,
            VRDINHEIRO,
            VRCARTAO,
            VRPOS,
            VRPIX,
            VRCONVENIO,
            VRVOUCHER,
            VRFATURA,
            VRFATURAPIX,
            VRDESPESA,
            VRTOTALRECEBIDO,
            VRDISPONIVEL,
            IDUSERCRIACAO,
            IDUSERENVIO,
            DATAHORAENVIO,
            OBSERVACAOLOJA,
            IDUSERULTIMAALTERACAO,
            STSTATUS
        )
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'Enviado')
	`;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));

	for (var i = 0; i < bodyJson.length; i++) {
        let queryId = api.executeScalar('SELECT "VAR_DB_NAME"."SEQ_MALOTECAIXALOJA_ID".NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
        
		let {
            IDMALOTE,
            IDEMPRESA,
            DATAMOVIMENTOCAIXA,
            VRDINHEIRO,
            VRCARTAO,
            VRPOS,
            VRPIX,
            VRCONVENIO,
            VRVOUCHER,
            VRFATURA,
            VRFATURAPIX,
            VRDESPESA,
            VRTOTALRECEBIDO,
            VRDISPONIVEL,
            IDUSERCRIACAO,
            OBSERVACAOLOJA
        } = bodyJson[i];
        
        pStmt.setInt(1, queryId);
        pStmt.setInt(2, IDEMPRESA);
		pStmt.setDate(3, DATAMOVIMENTOCAIXA);
        pStmt.setFloat(4, VRDINHEIRO);
        pStmt.setFloat(5, VRCARTAO);
        pStmt.setFloat(6, VRPOS);
        pStmt.setFloat(7, VRPIX);
        pStmt.setFloat(8, VRCONVENIO);
        pStmt.setFloat(9, VRVOUCHER);
        pStmt.setFloat(10, VRFATURA);
        pStmt.setFloat(11, VRFATURAPIX);
        pStmt.setFloat(12, VRDESPESA);
        pStmt.setFloat(13, VRTOTALRECEBIDO);
        pStmt.setFloat(14, VRDISPONIVEL);
        pStmt.setInt(15, IDUSERCRIACAO);
        pStmt.setInt(16, IDUSERCRIACAO);
        pStmt.setString(17, OBSERVACAOLOJA);
        pStmt.setInt(18, IDUSERCRIACAO);
        
        pStmt.execute();
        
        conn.commit();
        
        fnInsereHistorico(queryId, IDUSERCRIACAO, conn, 'Criacao');
	}
	
	pStmt.close();
	
	return {
	    "msg": 'Malote Enviado Com Sucesso!'
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
	switch ($.request.method) {
        
		//Handle your GET calls here
		case $.net.http.GET:
			let id = $.request.parameters.get("id");
		    fnHandleGet(id);
			break;
		
		case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
			
		case $.net.http.POST:
			var docReturn = fnHandlePost();
            $.response.setBody(JSON.stringify(docReturn));
			break;
        
        
	}

 } catch (e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    conn && conn.rollback();
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}