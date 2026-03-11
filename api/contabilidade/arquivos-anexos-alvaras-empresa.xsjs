let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

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

function validarSeJaExisteArquivo(idVinculo, nomeArquivo, tipoArquivo){
    let query = `
        SELECT
            IDARQUIVOSALVARA
        FROM
            "VAR_DB_NAME".ARQUIVOSALVARA
        WHERE
            STATIVO = 'True'
            AND NOMEARQUIVOALVARA = '${nomeArquivo}'
            AND TIPOARQUIVOALVARA = '${tipoArquivo}'
            AND IDVINCULOALVARAEMPRESA = '${idVinculo}'
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return reg.length > 0
}

function fnHandleGet(idArquivo) {
    if (!idArquivo) {
        $.response.status = $.net.http.BAD_REQUEST;
        $.response.setBody("idArquivo é obrigatório");
        return;
    }
    
    let conn = $.db.getConnection();
    
    let query = `
        SELECT
            ARQUIVOALVARA,
            TO_VARCHAR(NOMEARQUIVOALVARA) AS NOME,
            TIPOARQUIVOALVARA AS TIPO
        FROM 
            "VAR_DB_NAME".ARQUIVOSALVARA
        WHERE 
            IDARQUIVOSALVARA = ?
    `;
    
    let pstmt = conn.prepareStatement(api.replaceDbName(query));

    pstmt.setInt(1, Number(idArquivo));

    let regs = pstmt.executeQuery();

    if (!regs.next()) {
        $.response.status = $.net.http.NOT_FOUND;
        $.response.setBody("Arquivo não encontrado");
        return;
    }

    let blob = regs.getBlob(1) || '<h1 style="color: red">Nenhum arquivo de alvará registrado</h1>';
    let nameFile = decodeURIComponent(escape(regs.getString(2))) || "";
    let contentType = regs.getString(3) || ""

    $.response.contentType = contentType;
    $.response.headers.set(
        "Content-Disposition",
        `inline; filename="${nameFile}"`
    );

    $.response.setBody(blob);

    regs.close();
    
    pstmt.close();
    
    conn.close();
}

function inativarArquivoAlvara(dados, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME".ARQUIVOSALVARA
        SET
            DTHORAULTALTERACAO = CURRENT_TIMESTAMP,
            STATIVO = ?,
            IDUSERULTALTERACAO = ?
        WHERE
            IDARQUIVOSALVARA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let { IDARQUIVOSALVARA, STATIVO, IDFUNCIONARIO } of dados){
        pStmt.setString(1, STATIVO);
        pStmt.setInt(2, Number(IDFUNCIONARIO));
        pStmt.setInt(3, Number(IDARQUIVOSALVARA));
        
        pStmt.executeUpdate();
    }
    
    pStmt.close();
}

function atualizarArquivoAlvara(dados, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME".ARQUIVOSALVARA
        SET
            DTHORAULTALTERACAO = CURRENT_TIMESTAMP,
            ARQUIVOALVARA = ?,
            NOMEARQUIVOALVARA = ?,
            TIPOARQUIVOALVARA = ?,
            IDUSERULTALTERACAO = ?
        WHERE
            IDARQUIVOSALVARA = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    for(let { IDVINCULOALVARAEMPRESA, IDARQUIVOSALVARA, IDFUNCIONARIO, ARQUIVOSALVARA } of dados){
        
        for(let { ARQUIVOBASE64, NOMEARQUIVO, TIPOARQUIVO } of ARQUIVOSALVARA){
            let stJaExisteArquivo = validarSeJaExisteArquivo(IDVINCULOALVARAEMPRESA, NOMEARQUIVO, TIPOARQUIVO);
            
            if(stJaExisteArquivo){
                return {
                    success: false,
                    msg: 'Já existe um arquivo cadastrado com as mesmas caracteristicas'
                }
            }
            
            let binarioArquivo = $.util.codec.decodeBase64(ARQUIVOBASE64);
            
            pStmt.setBlob(1, binarioArquivo);
            pStmt.setString(2, NOMEARQUIVO);
            pStmt.setString(3, TIPOARQUIVO);
            pStmt.setInt(4, Number(IDFUNCIONARIO));
            pStmt.setInt(5, Number(IDARQUIVOSALVARA));
            
            pStmt.executeUpdate();
        }
    }
    
    pStmt.close();
    
    return {
        success: true,
    }
}

function fnHandlePut() {
    let cancelar = $.request.parameters.get("cancelar");
    let bodyJson = JSON.parse($.request.body.asString());
    let conn = $.db.getConnection();
    let respAtualizacao = {
        success: true,
    }
    
    if(cancelar == 'True'){
        inativarArquivoAlvara(bodyJson, conn);
    } else {
        respAtualizacao = atualizarArquivoAlvara(bodyJson, conn);
    }
    
    if(!respAtualizacao.success){
        return respAtualizacao;
    }
    
	conn.commit();
	
	return {
        success: true,
        msg: "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    let bodyJson = JSON.parse($.request.body.asString());
    let conn = $.db.getConnection();
    
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
    
    for(let { IDVINCULOALVARAEMPRESA, IDFUNCIONARIO, ARQUIVOSALVARA } of bodyJson){
        
        for(let { ARQUIVOBASE64, NOMEARQUIVO, TIPOARQUIVO } of ARQUIVOSALVARA){
            let stJaExisteArquivo = validarSeJaExisteArquivo(IDVINCULOALVARAEMPRESA, NOMEARQUIVO, TIPOARQUIVO);
            
            if(stJaExisteArquivo){
                return {
                    success: false,
                    msg: 'Já existe um arquivo cadastrado com as mesmas caracteristicas'
                }
            }
            
            let binarioArquivo = $.util.codec.decodeBase64(ARQUIVOBASE64);
            
            pStmt.setInt(1, Number(IDVINCULOALVARAEMPRESA));
            pStmt.setBlob(2, binarioArquivo);
            pStmt.setString(3, NOMEARQUIVO);
            pStmt.setString(4, TIPOARQUIVO);
            pStmt.setInt(5, Number(IDFUNCIONARIO));
            pStmt.setInt(6, Number(IDFUNCIONARIO));
            
            pStmt.executeUpdate();
        }
    }
    
    pStmt.close();
    
    conn.commit();
    
    return {
        success: true,
        msg: "Inclusão realizada com sucesso!"
	};
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your POST calls here
        case $.net.http.POST:
            var docReturn = fnHandlePost();
            
            $.response.setBody(JSON.stringify(docReturn));
            
            break;
        
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            
            $.response.setBody(JSON.stringify(docReturn));
            
            break;
        
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            
            fnHandleGet(id);
            
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