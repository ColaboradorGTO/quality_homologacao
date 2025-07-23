let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn) {
    try{
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
                TBM.STSTATUS,
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
    } catch(error){
        throw error;
    }
}

function fnAtualizarPendenciasMalote(IDMALOTE, IDUSER, PENDENCIAS, conn){
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
    
    if(PENDENCIAS.length > 0){
        let queryUpdate = `
            DELETE FROM
                "VAR_DB_NAME"."VINCULOPENDENCIAMALOTECAIXALOJA"
            WHERE
                IDMALOTE = ?
        `;
        
        let pStmtDelete = conn.prepareStatement(api.replaceDbName(queryUpdate));
        
        pStmtDelete.setInt(1, IDMALOTE);
        
        pStmtDelete.execute();
        pStmtDelete.close();
        
        conn.commit();
    }
    
    for(let {IDPENDENCIA, STRESOLVIDO, STATIVO} of PENDENCIAS){
        
        let queryInsertVincPendencia = `
            INSERT INTO 
                "VAR_DB_NAME"."VINCULOPENDENCIAMALOTECAIXALOJA"
            (
                IDPENDENCIA,
                IDMALOTE
            )
            VALUES(?, ?)
        `;
        
        var pStmtInserVincPendencia = conn.prepareStatement(api.replaceDbName(queryInsertVincPendencia));
        
        pStmtInserVincPendencia.setInt(1, IDPENDENCIA);
        pStmtInserVincPendencia.setInt(2, IDMALOTE);
        
        pStmtInserVincPendencia.execute();
        pStmtInserVincPendencia.close();
    }
    
    
    conn.commit();
}

function fnHandleGet(byId) {
    let idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let dataConferenciaInicio = $.request.parameters.get("dataConferenciaInicio");
    let dataConferenciaFim = $.request.parameters.get("dataConferenciaFim");
    let idMalote = $.request.parameters.get("idMalote");
    let statusMalote = $.request.parameters.get("statusMalote");
    let idPendenciaMalote = $.request.parameters.get("idPendenciaMalote");
    
    if(!idMalote && (!dataPesquisaInicio || !dataPesquisaFim) && (!dataConferenciaInicio || !dataConferenciaFim )) {
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
                ${ idGrupoEmpresarial ? ' AND TBE.IDGRUPOEMPRESARIAL = ' + idGrupoEmpresarial : ''}
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
                ${ idGrupoEmpresarial ? ' AND TBE.IDGRUPOEMPRESARIAL = ' + idGrupoEmpresarial : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
                ${ statusMalote ? ` AND CONTAINS(TBM.STSTATUS, '%${statusMalote}%}')` : ''}
                ${ !dataConferenciaInicio && dataPesquisaInicio ? ` AND (TO_DATE(TBM.DATAMOVIMENTOCAIXA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')` : ''}
                ${ dataConferenciaInicio ? ` AND (TO_DATE(TBM.DATAHORACONFERENCIA ) BETWEEN '${dataConferenciaInicio}' AND '${dataConferenciaFim}')` : ''}
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
	
	if(idMalote || idPendenciaMalote || (statusMalote && statusMalote !== 'Pendente de Envio') || dataConferenciaInicio){
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
                IFNULL(TO_VARCHAR(TO_DATE(TBM.DATAHORACRIACAO), 'DD/mm/YYYY'), '') AS DATAHORACRIACAOMALOTE,
                TBF_CONF.NOFUNCIONARIO AS NOFUNCIONARIOCONFERENCIA
            FROM 
                "VAR_DB_NAME".MALOTECAIXALOJA TBM
            INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
                TBM.IDEMPRESA = TBE.IDEMPRESA
            LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBF_CONF ON 
                TBM.IDUSERCONFERENCIA = TBF_CONF.IDFUNCIONARIO
            WHERE
                TBM.STATIVO ='True'
                ${ idMalote ? ' AND TBM.IDMALOTE = ' + idMalote : ''}
                ${ idGrupoEmpresarial ? ' AND TBE.IDGRUPOEMPRESARIAL = ' + idGrupoEmpresarial : ''}
                ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
                ${ statusMalote ? ` AND CONTAINS(TBM.STSTATUS, '${statusMalote}')` : ''}
                ${ !dataConferenciaInicio && dataPesquisaInicio ? ` AND (TO_DATE(TBM.DATAMOVIMENTOCAIXA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')` : ''}
                ${ dataConferenciaInicio ? ` AND (TO_DATE(TBM.DATAHORACONFERENCIA ) BETWEEN '${dataConferenciaInicio}' AND '${dataConferenciaFim}')` : ''}
                ${ idPendenciaMalote ? ` 
                    AND TBM.IDMALOTE IN(
                        SELECT 
                            IDMALOTE
                        FROM 
                            "VAR_DB_NAME".VINCULOPENDENCIASMALOTELOJA
                        WHERE 
                            IDPENDENCIA = ${idPendenciaMalote}
                    )` : ''}
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
                ${ idGrupoEmpresarial ? ' AND TBE.IDGRUPOEMPRESARIAL = ' + idGrupoEmpresarial : ''}
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
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
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
            DATAHORAENVIADO,
            DATAHORARECEBIDO,
            DATAHORADEVOLVIDO,
            DATAHORACONFERIDO,
            OBSERVACAOLOJA,
            OBSERVACAOADMINISTRATIVO,
            PENDENCIAS,
            IDUSERULTIMAALTERACAO,
        } = bodyJson[i];
        
        if(!IDMALOTE || !IDUSERULTIMAALTERACAO){
            throw 'Os parametros de IDMALOTE e IDUSERULTIMAALTERACAO são obrigatorios!';
        }
        
        let queryUpdateMalote = `
            UPDATE 
                "VAR_DB_NAME"."MALOTECAIXALOJA" 
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
                ${ DATAHORAENVIADO ? ` DATAHORAENVIO = '${DATAHORAENVIADO}', `: ''}
                ${ (STATUS == 'Devolvido' && IDUSERULTIMAALTERACAO) ? ` IDUSERDEVOLUCAO = ${IDUSERULTIMAALTERACAO}, `: ''}
                ${ (STATUS == 'Devolvido' || DATAHORADEVOLVIDO) ? ` DATAHORADEVOLUCAO = ${STATUS == 'Devolvido' ? 'CURRENT_TIMESTAMP' : '${DATAHORADEVOLVIDO}'}, `: ''}
                ${ (STATUS == 'Devolvido' || STATUS == 'Conferido' && IDUSERULTIMAALTERACAO) ? ` IDUSERCONFERENCIA = ${IDUSERULTIMAALTERACAO}, `: ''}
                ${ (STATUS == 'Conferido' || STATUS == 'Devolvido' || DATAHORACONFERIDO) ? ` DATAHORACONFERENCIA = ${(STATUS == 'Conferido' || STATUS == 'Devolvido') ? 'CURRENT_TIMESTAMP' : '${DATAHORACONFERIDO}'}, `: ''}
                ${ OBSERVACAOLOJA ? ` OBSERVACAOLOJA = '${OBSERVACAOLOJA}', `: ''}
                ${ OBSERVACAOADMINISTRATIVO ? ` OBSERVACAOADMINISTRATIVO = '${OBSERVACAOADMINISTRATIVO}', `: ''}
                IDUSERULTIMAALTERACAO = ?,
                DATAHORAULTIMAALTERACAO = CURRENT_TIMESTAMP
            WHERE 
                "IDMALOTE" =  ?
        `;
        
        
        var pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateMalote));
        
        if(fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn) == true){
            fnAtualizarPendenciasMalote(IDMALOTE, IDUSERULTIMAALTERACAO, PENDENCIAS, conn);
            
            pStmtUpdate.setInt(1, IDUSERULTIMAALTERACAO);
            pStmtUpdate.setInt(2, IDMALOTE);
            
            pStmtUpdate.execute();
            
        } else {
           throw 'Erro ao tentar atualizar o malote!'
        }
        
    }
    
    pStmtUpdate.close();

    conn.commit();
     
    return {
	    msg : "Atualização realizada com sucesso!"
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
	}

 } catch (e) {
    var detalheError = e.stack ? e.stack.split('\n') : '';
    
    detalheError = detalheError ? detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim() : '';
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message || e,
        detalheError
    }));
    $.response.status = 400;
}