let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnObterPendencias(IDHISTORICOMALOTE){
    let query = `
        SELECT 
            *
        FROM 
            "VAR_DB_NAME".HISTORICOVINCULOPENDENCIAMALOTECAIXALOJA 
        WHERE
            STATIVO = 'True'
            AND STRESOLVIDO = 'False'
            AND IDHISTORICOMALOTE = ?
    `;
    
    return api.sqlQuery(query, IDHISTORICOMALOTE)
}

function fnHandleGet(byId) {
    let idHistoricoMalote = $.request.parameters.get("idHistoricoMalote");
    let idMalote = $.request.parameters.get("idMalote");
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    let dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");

	let query = `
        SELECT
            TBH.IDHISTORICO AS IDHISTORICOMALOTE,
            TBH.IDMALOTE,
            TBH.IDEMPRESA,
            TBE.NOFANTASIA,
            TO_VARCHAR(TBH.DATAMOVIMENTOCAIXA, 'DD/MM/YYYY' ) AS DATAMOVIMENTOCAIXA,
            TBH.VRDINHEIRO,
            TBH.VRCARTAO,
            TBH.VRPOS,
            TBH.VRPIX,
            TBH.VRCONVENIO,
            TBH.VRVOUCHER,
            TBH.VRFATURA,
            TBH.VRFATURAPIX,
            TBH.VRDESPESA,
            TBH.VRTOTALRECEBIDO,
            TBH.VRDISPONIVEL,
            TBH.STSTATUS AS STATUSMALOTE,
            TBH.OBSERVACAOADMINISTRATIVO AS OBSERVACAOADMINISTRATIVOMALOTE,
            TBH.OBSERVACAOLOJA AS OBSERVACAOLOJAMALOTE,
            TBFCRIACAO.NOFUNCIONARIO AS NOFUNCIONARIOCRIACAO,
            TO_VARCHAR(TBH.DATAHORACRIACAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORACRIACAO,
            TBFENVIO.NOFUNCIONARIO AS NOFUNCIONARIOENVIO,
            TO_VARCHAR(TBH.DATAHORAENVIO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORAENVIADO,
            TBFRECEPCAO.NOFUNCIONARIO AS NOFUNCIONARIORECEPCAO,
            TO_VARCHAR(TBH.DATAHORARECEPCAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORARECEBIDO,
            TBFCONFERENCIA.NOFUNCIONARIO AS NOFUNCIONARIOCONFERENCIA,
            TO_VARCHAR(TBH.DATAHORACONFERENCIA, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORACONFERIDO,
            TBFDEVOLUCAO.NOFUNCIONARIO AS NOFUNCIONARIODEVOLUCAO,
            TO_VARCHAR(TBH.DATAHORADEVOLUCAO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORADEVOLVIDO,
            TBFREENVIO.NOFUNCIONARIO AS NOFUNCIONARIOREENVIO,
            TO_VARCHAR(TBH.DATAHORAREENVIO, 'DD/MM/YYYY HH24:MI:SS') AS DATAHORAREENVIADO,
            TBH.IDVINCULOPENDENCIA,
            TBH.STATIVO,
            TBH.IDUSERULTIMAALTERACAO,
            TO_VARCHAR(TBH.DATAHORAULTIMAALTERACAO, 'DD/MM/YYYY HH24:MI:SS' ) AS DATAHOTAALTERACAO
        FROM
            "VAR_DB_NAME".HISTORICOMALOTECAIXALOJA TBH
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
            TBH.IDEMPRESA = TBE.IDEMPRESA 
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFCRIACAO ON
            TBH.IDUSERCRIACAO = TBFCRIACAO.IDFUNCIONARIO
        INNER JOIN "VAR_DB_NAME".FUNCIONARIO TBFENVIO ON
            TBH.IDUSERENVIO = TBFENVIO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFRECEPCAO ON
            TBH.IDUSERRECEPCAO = TBFRECEPCAO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFCONFERENCIA ON
            TBH.IDUSERCONFERENCIA = TBFCONFERENCIA.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFDEVOLUCAO ON
            TBH.IDUSERDEVOLUCAO = TBFDEVOLUCAO.IDFUNCIONARIO
        LEFT JOIN "VAR_DB_NAME".FUNCIONARIO TBFREENVIO ON
            TBH.IDUSERREENVIO = TBFREENVIO.IDFUNCIONARIO
        WHERE 
            1 = ?
    `;
    
    if(idHistoricoMalote){
        query += ` AND TBH.IDHISTORICO = '${idHistoricoMalote}' `;
    }
    
    if(idMalote){
        query += ` AND TBH.IDMALOTE = '${idMalote}' `;
    }
    
    if(idEmpresa){
        query += ` AND TBH.IDEMPRESA = ${idEmpresa} `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim){
        query += ` AND TO_DATE(TBH.DATAHOTAALTERACAO) BETWEEN '${dataPesquisaInicio}' AND '${dataPesquisaFim}' `;
    }
    
    query += ' ORDER BY TBH.IDMALOTE, TBH.IDHISTORICO ';
	
	let request = {
		page: $.request.parameters.get("page"),
		pageSize: $.request.parameters.get("pageSize")
	};

//	api.responseWithQuery(query, request, 1);
	
	
	let response = api.sqlQueryPage(query, request, 1);
	let data = [];

	for (var i = 0; i < response.data.length; i++) {
        
        let registro = response.data[i];
        
        let malote = {
            "IDHISTORICOMALOTE": registro.IDHISTORICOMALOTE,
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
            "DATAHOTAALTERACAO": registro.DATAHOTAALTERACAO,
            "IDUSERULTIMAALTERACAO": registro.IDUSERULTIMAALTERACAO,
            "PENDENCIAS": fnObterPendencias(registro.IDHISTORICOMALOTE),
        };
        
        data.push(malote);

	}

	response.data = data;

	return response;
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
            OBSERVACAOFINANCEIRO,
            PENDENCIAS,
            IDUSERULTIMAALTERACAO,
        } = bodyJson[i];
        
        if(!IDMALOTE || !IDUSERULTIMAALTERACAO){
            throw 'Os parametros de IDMALOTE e IDUSERULTIMAALTERACAO são obrigatorios!';
        }
        
        let queryUpdateMalote = `
            UPDATE 
                "VAR_DB_NAME"."MALOTEFECHAMENTOCAIXASCONFERENCIALOJA" 
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
                ${ STATUS ? `STATUS = '${STATUS}', ` : ''}
                ${ DATAHORAENVIADO ? ` DATAHORAENVIADO = '${DATAHORAENVIADO}', `: ''}
                ${ (STATUS == 'Recebido' || DATAHORARECEBIDO) ? ` DATAHORARECEBIDO = ${STATUS == 'Recebido' ? 'CURRENT_TIMESTAMP' : '${DATAHORARECEBIDO}'}, `: ''}
                ${ (STATUS == 'Devolvido' || DATAHORADEVOLVIDO) ? ` DATAHORADEVOLVIDO = ${STATUS == 'Devolvido' ? 'CURRENT_TIMESTAMP' : '${DATAHORADEVOLVIDO}'}, `: ''}
                ${ (STATUS == 'Conferido' || STATUS == 'Devolvido' || DATAHORACONFERIDO) ? ` DATAHORACONFERIDO = ${(STATUS == 'Conferido' || STATUS == 'Devolvido') ? 'CURRENT_TIMESTAMP' : '${DATAHORACONFERIDO}'}, `: ''}
                ${ OBSERVACAOLOJA ? ` OBSERVACAOLOJA = '${OBSERVACAOLOJA}', `: ''}
                ${ OBSERVACAOFINANCEIRO ? ` OBSERVACAOFINANCEIRO = '${OBSERVACAOFINANCEIRO}', `: ''}
                IDUSERULTIMAALTERACAO = ?,
                DATAHORAULTIMAALTERACAO = CURRENT_TIMESTAMP
            WHERE 
                "IDMALOTE" =  ?
        `;
        
        
        var pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateMalote));
        
        if(fnInsereHistorico(IDMALOTE, IDUSERULTIMAALTERACAO, conn) == true){
            if(PENDENCIAS.length > 0 ){
                fnAtualizarPendenciasMalote(IDMALOTE, IDUSERULTIMAALTERACAO, PENDENCIAS, conn);
            }
            
            pStmtUpdate.setInt(1, IDUSERULTIMAALTERACAO);
            pStmtUpdate.setInt(2, IDMALOTE);
            
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
            OBSERVACAOFINANCEIRO,
            STATUS,
            DATAHORAENVIADO
        )
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Enviado', CURRENT_TIMESTAMP)
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
            OBSERVACAOFINANCEIRO,
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
        pStmt.setString(14, OBSERVACAOFINANCEIRO);
        pStmt.setInt(15, IDUSERCRIACAO);
        
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