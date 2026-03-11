let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

let conn;

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setBlobOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setBlob(fieldId, value);
}

function getField(parts, name) {
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].name === name) {
            return parts[i].body.asString();
        }
    }
    return null;
}

function getFile(parts, name) {
    for (var i = 0; i < parts.length; i++) {
        if (parts[i].name === name && parts[i].fileName) {
            return parts[i];
        }
    }
    return null;
}

function getListaArquivosAlvaras(idVinculo){
    let query = `
        SELECT 
            IDARQUIVOSALVARA,
            NOMEARQUIVOALVARA,
            TIPOARQUIVOALVARA,
            TO_VARCHAR(DTHORACRIACAO, 'DD/MM/YYYY HH24:MI:SS') AS DTHORACRIACAO,
            STATIVO
        FROM
            "VAR_DB_NAME".ARQUIVOSALVARA
        WHERE 
            STATIVO = 'True'
            AND IDVINCULOALVARAEMPRESA = ?
        ORDER BY 
            STATIVO DESC,
            NOMEARQUIVOALVARA,
            IDARQUIVOSALVARA,
            DTHORACRIACAO
    `;
    
    return api.sqlQuery(query, idVinculo);
}

function getListaIdsArquivosAlvaras(idVinculo){
    let query = `
        SELECT 
            IDARQUIVOSALVARA
        FROM
            "VAR_DB_NAME".ARQUIVOSALVARA
        WHERE 
            STATIVO = 'True'
            AND IDVINCULOALVARAEMPRESA = ?
    `;
    
    return api.sqlQuery(query, idVinculo);
}

function montarResponse(response){
    let newArrayData = [];
    let { data } = response || [];
    
    for(let registro of data){
        let { IDVINCULO } = registro;
        let ARQUIVOSALVARAS = getListaArquivosAlvaras(IDVINCULO);
        let newObj = Object.assign({}, registro, { ARQUIVOSALVARAS });
        
        newArrayData.push(newObj);
    }
    
    response.data = newArrayData;
    
    return response;
}

function validarSeJaExisteVinculo(idEmpresa, idAlvara, dtInicio, dtFim){
    let query = `
        SELECT
            TBV.IDVINCULO
        FROM
            "VAR_DB_NAME".VINCULOALVARAEMPRESA TBV
        RIGHT JOIN "VAR_DB_NAME".ALVARA TBA ON 
            TBV.IDALVARA = TBA.IDALVARA
        INNER JOIN "VAR_DB_NAME".STATUSANDAMENTOALVARA TBS ON 
            TBV.IDSTATUSANDAMENTO = TBS.IDSTATUS
        WHERE
            TBV.STATIVO = 'True'
            AND TBA.IDALVARA = '${idAlvara}'
            AND TBV.DTINICIOCOMPETENCIAALVARA = '${dtInicio}' 
            AND TBV.DTFIMCOMPETENCIAALVARA = '${dtFim}'
            AND TBV.IDEMPRESA = ?
    `;
    
    let reg = api.sqlQuery(query, idEmpresa) || [];
    
    return reg.length > 0
}

function fnHandleGet(byId) {
    
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let stAtivo = $.request.parameters.get("stAtivo");
    
    let query = `
        SELECT
            TBV.IDVINCULO,
            TBV.IDEMPRESA,
            TBA.IDALVARA,
            TBA.DESCRICAO AS DESCRICAOALVARA,
            TO_VARCHAR(TBV.DTINICIOCOMPETENCIAALVARA, 'YYYY-MM-DD') AS DTINICIOCOMPETENCIAALVARA,
            TO_VARCHAR(TBV.DTFIMCOMPETENCIAALVARA, 'YYYY-MM-DD') AS DTFIMCOMPETENCIAALVARA,
            TBS.IDSTATUS,
            TBS.DESCRICAO AS DESCRICAOSTATUS,
            TO_VARCHAR(TBV.DESCRICAODETALHEANDAMENTO) AS DESCRICAODETALHEANDAMENTO,
            TBV.METRAGEMEMPRESA,
            TBV.NUMEROPROJETOAPROVADO,
            TBV.STATIVO
        FROM
            "VAR_DB_NAME".VINCULOALVARAEMPRESA TBV
        RIGHT JOIN "VAR_DB_NAME".ALVARA TBA ON 
            TBV.IDALVARA = TBA.IDALVARA
        INNER JOIN "VAR_DB_NAME".STATUSANDAMENTOALVARA TBS ON 
            TBV.IDSTATUSANDAMENTO = TBS.IDSTATUS
        WHERE
            1 = ?
    `;
    
    if (byId) {
        query += `AND TBV.IDVINCULO = '${byId}' `;
    }
    
    if (idEmpresa) {
        query += `AND TBV.IDEMPRESA = '${idEmpresa}' `;
    }

    if(stAtivo){
        query += `AND TBV.STATIVO = '${stAtivo}' `;
    }
    
    query += `
        ORDER BY 
            TBA.IDALVARA,
            TBV.DTFIMCOMPETENCIAALVARA DESC,
            TBV.IDVINCULO DESC
    `;
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    /*api.responseWithQuery(query, request, 1);
    /**/
    let listaVinculos = api.sqlQueryPage(query, request, 1);
    
    let response = montarResponse(listaVinculos);
    
    return $.response.setBody(JSON.stringify(response));//*/
}

function atualizarStatusArquivosAlvaras(listaIdsArquivosParaInativar, idFuncionario){
    let query = `
        UPDATE
            "VAR_DB_NAME".ARQUIVOSALVARA
        SET
            STATIVO = 'False',
            DTHORAULTALTERACAO = CURRENT_TIMESTAMP,
            IDUSERULTALTERACAO = ?
        WHERE
            IDARQUIVOSALVARA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let { IDARQUIVOSALVARA } of listaIdsArquivosParaInativar){
        pStmt.setInt(1, Number(idFuncionario));
        pStmt.setInt(2, Number(IDARQUIVOSALVARA));
        
        pStmt.executeUpdate();
    }
    
    pStmt.close();
    
}

function inserirArquivosAlvaras(idVinculo, idFuncionario, listaAlvaras){
    let query = `
        INSERT INTO
            "VAR_DB_NAME".ARQUIVOSALVARA
        (
            IDVINCULOALVARAEMPRESA,
            ARQUIVOALVARA,
            NOMEARQUIVOALVARA,
            TIPOARQUIVOALVARA,
            IDUSERCRIACAO,
            IDUSERULTALTERACAO
        )
        VALUES(?, ?, ?, ?, ?, ?)
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let { ARQUIVOBASE64, NOMEARQUIVO, TIPOARQUIVO } of listaAlvaras){
        let binarioArquivo = $.util.codec.decodeBase64(ARQUIVOBASE64);
        
        pStmt.setInt(1, Number(idVinculo));
        pStmt.setBlob(2, binarioArquivo);
        pStmt.setString(3, NOMEARQUIVO);
        pStmt.setString(4, TIPOARQUIVO);
        pStmt.setInt(5, Number(idFuncionario));
        pStmt.setInt(6, Number(idFuncionario));
        
        pStmt.executeUpdate();
    }
    
    pStmt.close();
}

function fnHandlePut() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();
    
    let query = `
        UPDATE
            "VAR_DB_NAME".VINCULOALVARAEMPRESA
        SET
            "DTHORAULTALTERACAO" = CURRENT_TIMESTAMP,
            "IDSTATUSANDAMENTO" = ?,
            "DESCRICAODETALHEANDAMENTO" = ?,
            "METRAGEMEMPRESA" = ?,
            "NUMEROPROJETOAPROVADO" = ?,
            "STATIVO" = ?,
            "IDUSERULTALTERACAO" = ?,
            "DTINICIOCOMPETENCIAALVARA" = ?,
            "DTFIMCOMPETENCIAALVARA" = ?
        WHERE 
            "IDVINCULO" = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for (let registro of bodyJson) {
        let {
            IDSTATUSANDAMENTO,
            DTINICIOCOMPETENCIA,
            DTFIMCOMPETENCIA,
            DESCRICAODETALHEANDAMENTO,
            METRAGEMEMPRESA,
            NUMEROPROJETOAPROVADO,
            STATIVO,
            IDFUNCIONARIO,
            IDVINCULO,
            ARQUIVOSALVARA
        } = registro;
        
        pStmt.setInt(1, IDSTATUSANDAMENTO);
        pStmt.setString(2, DESCRICAODETALHEANDAMENTO);
        pStmt.setFloat(3, METRAGEMEMPRESA);
        setStringOrNull(pStmt, 4, NUMEROPROJETOAPROVADO);
        pStmt.setString(5, STATIVO);
        pStmt.setInt(6, IDFUNCIONARIO);
        pStmt.setDate(7, DTINICIOCOMPETENCIA);
        pStmt.setDate(8, DTFIMCOMPETENCIA);
        pStmt.setInt(9, IDVINCULO);
        
        pStmt.executeUpdate();
        
        if(ARQUIVOSALVARA.length) {
            let listaIdsArquivosParaInativar =  getListaIdsArquivosAlvaras(IDVINCULO);
            
            atualizarStatusArquivosAlvaras(listaIdsArquivosParaInativar, IDFUNCIONARIO)
            
            inserirArquivosAlvaras(IDVINCULO, IDFUNCIONARIO, ARQUIVOSALVARA);
        }
    }
    
    pStmt.close();

	conn.commit();
	
	return {
        success: true,
        msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    conn = $.db.getConnection();
    
    let query = `
        INSERT INTO
            "VAR_DB_NAME".VINCULOALVARAEMPRESA
        (
            IDVINCULO,
            IDEMPRESA,
            IDALVARA,
            STATIVO,
            DTINICIOCOMPETENCIAALVARA,
            DTFIMCOMPETENCIAALVARA,
            IDSTATUSANDAMENTO,
            DESCRICAODETALHEANDAMENTO,
            METRAGEMEMPRESA,
            NUMEROPROJETOAPROVADO,
            IDUSERCRIACAO,
            IDUSERULTALTERACAO
        )
        VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    for (let registro of bodyJson) {
        let idVinculo = Number(api.executeScalar('SELECT "VAR_DB_NAME".SEQ_VINCULOALVARAEMPRESA.NEXTVAL FROM DUMMY WHERE 1 = ?', 1));
        let {
            IDEMPRESA,
            IDALVARA,
            STATIVO,
            DTINICIOCOMPETENCIA,
            DTFIMCOMPETENCIA,
            IDSTATUSANDAMENTO,
            DESCRICAODETALHEANDAMENTO,
            METRAGEMEMPRESA,
            NUMEROPROJETOAPROVADO,
            IDFUNCIONARIO,
            ARQUIVOSALVARA
        } = registro;
        
        let stJaExisteVinculo = validarSeJaExisteVinculo(IDEMPRESA, IDALVARA, DTINICIOCOMPETENCIA, DTFIMCOMPETENCIA);
        
        if(stJaExisteVinculo){
            return {
                success: false,
                msg: 'Já existe um alvará cadastrado com mesma data de competência'
            }
        }
        
        pStmt.setInt(1, idVinculo);
        pStmt.setInt(2, IDEMPRESA);
        pStmt.setInt(3, IDALVARA);
        pStmt.setString(4, STATIVO);
        pStmt.setDate(5, DTINICIOCOMPETENCIA);
        pStmt.setDate(6, DTFIMCOMPETENCIA);
        pStmt.setInt(7, IDSTATUSANDAMENTO);
        pStmt.setString(8, DESCRICAODETALHEANDAMENTO);
        pStmt.setFloat(9, METRAGEMEMPRESA);
        setStringOrNull(pStmt, 10, NUMEROPROJETOAPROVADO);
        pStmt.setInt(11, IDFUNCIONARIO);
        pStmt.setInt(12, IDFUNCIONARIO);
        
        pStmt.executeUpdate();
        
        if(ARQUIVOSALVARA.length) {
            inserirArquivosAlvaras(idVinculo, IDFUNCIONARIO, ARQUIVOSALVARA);
        }
    }
    
	pStmt.close();

	conn.commit();
	
	return {
        success: true,
        msg : "Atualização realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            
            fnHandleGet(id);
            
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
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