let api = $.import("quality.concentrador_homologacao.api", "apiResponse");

function setNClobOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	
	stmt.setNClob(fieldId, value);
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	
	stmt.setString(fieldId, value);
}

function getNextIdResumoOTB(){
    let query = `
        SELECT 
            "VAR_DB_NAME".SEQ_RESUMOINTEGRACAOOTB.NEXTVAL
        FROM
            DUMMY
        WHERE
            1 = ?
    `;
    
    return api.executeScalar(query, 1);
}

function criarResumoIntegracaoOTB(dadosResumo, conn){
    let idx = 0;
    
    let {
        nomeAPI, 
        totalRegistros, 
        totalLotes,
        //dtDados
    } = dadosResumo;
    
    let query = `
        INSERT INTO
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB
        (
            NOMEAPI,
            TOTALREGISTROS,
            TOTALLOTES,
            IDRESUMOINTEGRACAOOTB
        )
        VALUES(
            ?,
            ?,
            ?,
            ?
        );
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(++idx, nomeAPI);
	pStmt.setInt(++idx, Number(totalRegistros));
	pStmt.setInt(++idx, Number(totalLotes));
	//pStmt.setDate(++idx, dtDados);
	
	let idResumoIntegracaoOTB = getNextIdResumoOTB();
	
	pStmt.setInt(++idx, Number(idResumoIntegracaoOTB));
	
	pStmt.executeUpdate();
	pStmt.close();
	
	return { idResumoIntegracaoOTB };
}

function criarDetalheIntegracaoOTB(dadosDetalhe, conn){
    let idx = 0;
    let {
        idResumoIntegracaoOTB, 
        numeroLote, 
        numRegistroInicio, 
        numRegistroFim, 
        totalRegistros, 
        dtHorainicio,
        statusDetalhe,
        msgError,
        payload
    } =  dadosDetalhe;
    
    let query = `
        INSERT INTO
            "VAR_DB_NAME".DETALHEINTEGRACAOOTB
        (
            IDRESUMOINTEGRACAOOTB,
            NUMEROLOTE,
            REGISTROINICIAL,
            REGISTROFINAL,
            TOTALREGISTROS,
            DTHORAINICIO,
            STATUS,
            MSGERROR,
            PAYLOAD,
            DTHORAFIM,
            TENTATIVAS
        )
        VALUES(
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            CURRENT_TIMESTAMP,
            1
        )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setInt(++idx, Number(idResumoIntegracaoOTB));
	pStmt.setInt(++idx, Number(numeroLote));
	pStmt.setInt(++idx, Number(numRegistroInicio));
	pStmt.setInt(++idx, Number(numRegistroFim));
	pStmt.setInt(++idx, Number(totalRegistros));
	pStmt.setTimestamp(++idx, dtHorainicio);
	pStmt.setString(++idx, statusDetalhe);
	pStmt.setString(++idx, msgError);
	setNClobOrNull(pStmt, ++idx, payload);
	
	pStmt.executeUpdate();
	pStmt.close();
}

function atualizarResumoIntegracaoOTB(dadosUpdateResumo, conn){
    let idx = 0;
    let {
        idResumoIntegracaoOTB, 
        statusResumo, 
        contadorLotesSucesso, 
        contadorLotesErro, 
        dtHoraFim
    } = dadosUpdateResumo;
    
    let query = `
        UPDATE
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB
        SET
            STATUS = ?,
            TOTALLOTESSUCESSO = ?,
            TOTALLOTESERRO = ?,
            DTHORAFIM = ?
        WHERE 
            IDRESUMOINTEGRACAOOTB = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(++idx, statusResumo);
	pStmt.setInt(++idx, Number(contadorLotesSucesso));
	pStmt.setInt(++idx, Number(contadorLotesErro));
	pStmt.setTimestamp(++idx, dtHoraFim);
	pStmt.setInt(++idx, Number(idResumoIntegracaoOTB));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function atualizarDetalheIntegracaoOTB(dadosUpdateDetalhe, conn){
    let {
        idResumoIntegracaoOTB,
        idDetalheIntegracaoOTB,
        dtHoraInicio,
        statusDetalhe, 
        msgError, 
        numTentativas,
        payload
    } = dadosUpdateDetalhe;
    
    let query = `
        UPDATE
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB
        SET
            DTHORAINICIO = ?,
            STATUS = ?,
            MSGERROR = ?
            TENTATIVAS = ?,
            PAYLOAD = ?
            DTHORAFIM = CURRENT_TIMESTAMP,
        WHERE 
            IDDETALHEINTEGRACAOOTB = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setTimestamp(1, dtHoraInicio);
	pStmt.setString(2, statusDetalhe);
	pStmt.setString(3, msgError);
	pStmt.setInt(4, Number(numTentativas));
	setNClobOrNull(pStmt, 5, payload);
	pStmt.setString(6, Number(idDetalheIntegracaoOTB));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function atualizarResumoIntegracaoOTBRepescagem(dadosUpdateResumo, conn){
    let idx = 0;
    let {
        idResumoIntegracaoOTB, 
        statusResumo, 
        contadorLotesSucesso, 
        contadorLotesErro, 
    } = dadosUpdateResumo;
    
    let query = `
        UPDATE
            "VAR_DB_NAME".RESUMOINTEGRACAOOTB
        SET
            STATUS = ?,
            TOTALLOTESSUCESSO = (TOTALLOTESSUCESSO + ?),
            TOTALLOTESERRO = ?
        WHERE 
            IDRESUMOINTEGRACAOOTB = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(++idx, statusResumo);
	pStmt.setInt(++idx, Number(contadorLotesSucesso));
	pStmt.setInt(++idx, Number(contadorLotesErro));
	pStmt.setInt(++idx, Number(idResumoIntegracaoOTB));
	
	pStmt.executeUpdate();
	pStmt.close();
}

function atualizarDetalheIntegracaoOTBRepescagem(dadosUpdateDetalhe, conn){
    let idx = 0;
    let {
        idDetalheIntegracaoOTB,
        dtHoraInicio,
        statusDetalhe, 
        msgError, 
        numTentativas,
        payload
    } = dadosUpdateDetalhe;
    
    let query = `
        UPDATE
            "VAR_DB_NAME".DETALHEINTEGRACAOOTB
        SET
            DTHORAINICIO = ?,
            STATUS = ?,
            MSGERROR = ?,
            PAYLOAD = ?,
            TENTATIVAS = ( TENTATIVAS + 1),
            DTHORAFIM = CURRENT_TIMESTAMP
        WHERE 
            IDDETALHEINTEGRACAOOTB = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setTimestamp(++idx, dtHoraInicio);
	pStmt.setString(++idx, statusDetalhe);
	setStringOrNull(pStmt, ++idx, msgError);
	setNClobOrNull(pStmt, ++idx, payload);
	pStmt.setInt(++idx, Number(idDetalheIntegracaoOTB));
	
	pStmt.executeUpdate();
	pStmt.close();
}