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
                STATUS,
                OBSERVACAO,
                DATAHORAENVIO,
                DATAHORARECEBIDO,
                DATAHORACONFERIDO,
                DATAHORADEVOLVIDO,
                STATIVO,
                IDUSERALTERACAO
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
                TBM.OBSERVACAO,
                TBM.DATAHORAENVIO,
                TBM.DATAHORARECEPCAO,
                TBM.DATAHORACONFERENCIA,
                TBM.DATAHORADEVOLUCAO,
                TBM.STATIVO,
                ${IDUSERULTIMAALTERACAO} AS IDUSERALTERACAO
            FROM 
                "VAR_DB_NAME".MALOTECAIXALOJA TBM
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
        throw 'Erro ao tentar atualizar os dados do Malote';
    }
}

function fnObterPendencias(IDMALOTE){
    let query = `
        SELECT 
            IDPENDENCIA
        FROM 
            "VAR_DB_NAME".VINCULOPENDENCIAMALOTECAIXALOJA
        WHERE
            STATIVO = 'True'
            AND STRESOLVIDO = 'False'
            AND IDMALOTE = ?
    `;
    
    return api.sqlQuery(query, IDMALOTE)
}

function fnHandleGet(byId) {
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    let idMalote = $.request.parameters.get("idMalote");
    let statusMalote = $.request.parameters.get("statusMalote");
    
    if(!idMalote && (!dataPesquisaInicio || !dataPesquisaFim)) {
        throw 'Especifique uma data inicio e uma data fim para a consulta!';
    }

	let query = `
        SELECT 
            TBM.IDMALOTE,
            TBE.IDEMPRESA,
            TBE.NOFANTASIA,
            TBM.DATAMOVIMENTOCAIXA AS DTHORAFECHAMENTO,
            TO_VARCHAR(TO_DATE(TBM.DATAMOVIMENTOCAIXA), 'DD/MM/YYYY') AS DATAMOVIMENTOCAIXA,
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
            TBFCRIACAO.NOFUNCIONARIO AS NOFUNCIONARIOCRIACAO,
            TO_VARCHAR(TBM.DATAHORACRIACAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORACRIACAO,
            TBFENVIO.NOFUNCIONARIO AS NOFUNCIONARIOENVIO,
            TO_VARCHAR(TBM.DATAHORAENVIO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORAENVIADO,
            TBFRECEPCAO.NOFUNCIONARIO AS NOFUNCIONARIORECEPCAO,
            TO_VARCHAR(TBM.DATAHORARECEPCAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORARECEBIDO,
            TBFCONFERENCIA.NOFUNCIONARIO AS NOFUNCIONARIOCONFERENCIA,
            TO_VARCHAR(TBM.DATAHORACONFERENCIA, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORACONFERIDO,
            TBFDEVOLUCAO.NOFUNCIONARIO AS NOFUNCIONARIODEVOLUCAO,
            TO_VARCHAR(TBM.DATAHORADEVOLUCAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORADEVOLVIDO,
            TBFREENVIO.NOFUNCIONARIO AS NOFUNCIONARIOREENVIO,
            TO_VARCHAR(TBM.DATAHORAREENVIO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORAREENVIADO
        FROM 
            "VAR_DB_NAME".MALOTECAIXALOJA TBM
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBM.IDEMPRESA = TBE.IDEMPRESA
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFCRIACAO ON
            TBM.IDUSERCRIACAO = TBFCRIACAO.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFENVIO ON
            TBM.IDUSERENVIO = TBFENVIO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFRECEPCAO ON
            TBM.IDUSERRECEPCAO = TBFRECEPCAO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFCONFERENCIA ON
            TBM.IDUSERCONFERENCIA = TBFCONFERENCIA.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFDEVOLUCAO ON
            TBM.IDUSERDEVOLUCAO = TBFDEVOLUCAO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFREENVIO ON
            TBM.IDUSERREENVIO = TBFREENVIO.IDFUNCIONARIO
        WHERE
            TBM.STATIVO ='True'
            ${ idMalote ? ' AND TBM.IDMALOTE = ' + idMalote : ''}
            ${ idEmpresa ? ' AND TBE.IDEMPRESA = ' + idEmpresa : ''}
            ${ statusMalote ? ' AND TBM.STATUS = ' + statusMalote : ''}
            ${ dataPesquisaInicio ? ` AND (TO_DATE(TBM.DATAMOVIMENTOCAIXA) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}')` : ''}
            AND 1 = ?
	`;
	
	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

	//api.responseWithQuery(query, request, 1);
	
	let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (var i = 0; i < response.data.length; i++) {
        
        let registro = response.data[i];
        
        let malote = {
            "IDMALOTE": registro.IDMALOTE,
            "IDEMPRESA": registro.IDEMPRESA,
            "NOFANTASIA": registro.NOFANTASIA,
            "DTHORAFECHAMENTO": registro.DTHORAFECHAMENTO,
            "DATAMOVIMENTOCAIXA": registro.DATAMOVIMENTOCAIXA,
            "VALORTOTALDINHEIRO": registro.VALORTOTALDINHEIRO,
            "VALORTOTALCARTAO": registro.VALORTOTALCARTAO,
            "VALORTOTALCONVENIO": registro.VALORTOTALCONVENIO,
            "VALORTOTALPOS": registro.VALORTOTALPOS,
            "VALORTOTALPIX": registro.VALORTOTALPIX,
            "VALORTOTALMOOVPAY": registro.VALORTOTALMOOVPAY,
            "VALORTOTALVOUCHER": registro.VALORTOTALVOUCHER,
            "VALORTOTALFATURA": registro.VALORTOTALFATURA,
            "VALORTOTALFATURAPIX": registro.VALORTOTALFATURAPIX,
            "VALORTOTALDESPESA": registro.VALORTOTALDESPESA,
            "VALORTOTALADIANTAMENTOSALARIAL": registro.VALORTOTALADIANTAMENTOSALARIAL,
            "VRFISICODINHEIRO": registro.VRFISICODINHEIRO,
            "VRAJUSTEDINHEIRO": registro.VRAJUSTEDINHEIRO,
            "VRRECDINHEIRO": registro.VRRECDINHEIRO,
            "VRTOTALRECEBIDO": registro.VRTOTALRECEBIDO,
            "VRDISPONIVEL": registro.VRDISPONIVEL,
            "STATUSMALOTE": registro.STATUSMALOTE,
            "OBSERVACAOADMINISTRATIVO": registro.OBSERVACAOADMINISTRATIVOMALOTE,
            "OBSERVACAOLOJA": registro.OBSERVACAOLOJAMALOTE,
            "STATIVOMAOTE": registro.STATIVOMAOTE,
            "NOFUNCIONARIOCRIACAO": registro.NOFUNCIONARIOCRIACAO,
            "DATAHORACRIACAO": registro.DATAHORACRIACAO,
            "NOFUNCIONARIOENVIO": registro.NOFUNCIONARIOENVIO,
            "DATAHORAENVIADO": registro.DATAHORAENVIADO,
            "NOFUNCIONARIORECEPCAO": registro.NOFUNCIONARIORECEPCAO,
            "DATAHORARECEBIDO": registro.DATAHORARECEBIDO,
            "NOFUNCIONARIOCONFERENCIA": registro.NOFUNCIONARIOCONFERENCIA,
            "DATAHORACONFERIDO": registro.DATAHORACONFERIDO,
            "NOFUNCIONARIODEVOLUCAO": registro.NOFUNCIONARIODEVOLUCAO,
            "DATAHORADEVOLVIDO": registro.DATAHORADEVOLVIDO,
            "NOFUNCIONARIOREENVIO": registro.NOFUNCIONARIOREENVIO,
            "DATAHORAREENVIADO": registro.DATAHORAREENVIADO,
            "IDVINCULOMOTIVODEVOLUCAO": registro.IDVINCULOMOTIVODEVOLUCAO,
            "STATIVO": registro.STATIVO,
            "DATAHORAULTIMAALTERACAO": registro.DATAHORAULTIMAALTERACAO,
            "IDUSERULTIMAALTERACAO": registro.IDUSERULTIMAALTERACAO,
            "PENDENCIAS": fnObterPendencias(registro.IDMALOTE),
        };
        
        data.push(malote);

	}

	response.data = data;

	return response;
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
    let queryUpdateMalote = `
        UPDATE 
            "VAR_DB_NAME"."MALOTECAIXALOJA" 
        SET
            IDEMPRESA = ?,
            DATAMOVIMENTOCAIXA = ?,
            VRDINHEIRO = ?,
            VRCARTAO = ?,
            VRPOS = ?,
            VRPIX = ?,
            VRCONVENIO = ?,
            VRVOUCHER = ?,
            VRFATURA = ?,
            VRFATURAPIX = ?,
            VRDESPESA = ?,
            VRTOTALRECEBIDO = ?,
            VRDISPONIVEL = ?,
            STSTATUS = ?,
            DATAHORAENVIO = ?,
            IDUSERULTIMAALTERACAO = ?,
            DATAHORAULTIMAALTERACAO = CURRENT_TIMESTAMP
        WHERE 
            "IDMALOTE" =  ?
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateMalote));
    
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
            DATAHORAENVIO,
            IDUSERULTIMAALTERACAO
        } = bodyJson[i];
        
        if(fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn) == true){
            pStmtUpdate.setInt(1, IDEMPRESA);
            pStmtUpdate.setDate(2, DATAMOVIMENTOCAIXA);
            pStmtUpdate.setFloat(3, VRDINHEIRO);
            pStmtUpdate.setFloat(4, VRCARTAO);
            pStmtUpdate.setFloat(5, VRPOS);
            pStmtUpdate.setFloat(6, VRPIX);
            pStmtUpdate.setFloat(7, VRCONVENIO);
            pStmtUpdate.setFloat(8, VRVOUCHER);
            pStmtUpdate.setFloat(9, VRFATURA);
            pStmtUpdate.setFloat(10, VRFATURAPIX);
            pStmtUpdate.setFloat(11, VRDESPESA);
            pStmtUpdate.setFloat(12, VRTOTALRECEBIDO);
            pStmtUpdate.setFloat(13, VRDISPONIVEL);
            pStmtUpdate.setString(14, STATUS);
            pStmtUpdate.setDate(15, DATAHORAENVIO);
            pStmtUpdate.setInt(16, IDUSERULTIMAALTERACAO);
            pStmtUpdate.setInt(17, IDMALOTE);
            
            pStmtUpdate.execute();
            
        } else {
            throw 'Erro ao tentar atualizar os dados do Malote!';
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
    let conn = $.db.getConnection();
    
    let queryInsert = `
        INSERT INTO 
            "VAR_DB_NAME"."MALOTEFECHAMENTOCAIXASCONFERENCIALOJA"
		(
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
            STATUS,
            DATAHORAENVIO
        )
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Enviado', CURRENT_TIMESTAMP)
	`;

    var pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));

	for (var i = 0; i < bodyJson.length; i++) {
		let {
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
            OBSERVACAO,
            IDUSERCRIACAO
        } = bodyJson[i];
        
        pStmt.setInt(1, IDEMPRESA);
		pStmt.setDate(2, DATAMOVIMENTOCAIXA);
        pStmt.setFloat(3, VRDINHEIRO);
        pStmt.setFloat(4, VRCARTAO);
        pStmt.setFloat(5, VRPOS);
        pStmt.setFloat(6, VRPIX);
        pStmt.setFloat(7, VRCONVENIO);
        pStmt.setFloat(8, VRVOUCHER);
        pStmt.setFloat(9, VRFATURA);
        pStmt.setFloat(10, VRFATURAPIX);
        pStmt.setFloat(11, VRDESPESA);
        pStmt.setFloat(12, VRTOTALRECEBIDO);
        pStmt.setFloat(13, VRDISPONIVEL);
        //pStmt.setString(14, OBSERVACAO);
        pStmt.setInt(14, IDUSERCRIACAO);
        
        pStmt.execute();
        
	}

	pStmt.close();

	conn.commit();
	
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
				$.response.setBody(JSON.stringify(fnHandleGet(id)));
		    //fnHandleGet(id);
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
    var detalheError = e.stack.split('\n');
    
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