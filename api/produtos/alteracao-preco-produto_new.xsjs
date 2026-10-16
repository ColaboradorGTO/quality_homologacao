var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

const TAMANHO_CHUNK_IN = 1000;      // parâmetros por SELECT
const MAX_ERROS_RETORNADOS = 200;
const PRECO_MINIMO = 0.01;          // ajustar: se preço 0 for permitido, use 0 e troque "<" por "<="
const PRECO_MAXIMO = 9999999.99;    // ajustar ao DECIMAL(p,s) da coluna PRECOVENDA
const CASAS_DECIMAIS = 2;           // ajustar ao "s" do DECIMAL
const TOLERANCIA_PASSADO_MS = 120 * 1000; // 2 minutos

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function agruparProdutosPorPreco (produtos) {
    // Agrupa os Produtos de Acordo com o Preco e retorna um array de arrays com cada lista tendo somente os produtos com o mesmo preco
    let mapaPreco = new Map();

    produtos.forEach((produto) => {
        let preco = produto.PRECOVENDA;
        
        if (!mapaPreco.has(preco)) {
            mapaPreco.set(preco, []);
        }
        
        mapaPreco.get(preco).push(produto);
    });

    return Array.from(mapaPreco.values());
};

/* =====================================================================================
 * Helper simples para comparar o tempo das duas abordagens no seu ambiente.
 * Troque o "return" por $.trace.debug(...) ou o log disponível no seu runtime, se quiser
 * ver o resultado direto no console/log do servidor.
 * ===================================================================================== */
function medirTempo(rotulo, fn){
    let inicio = new Date().getTime();
    fn();
    let duracaoMs = new Date().getTime() - inicio;
    return { rotulo: rotulo, duracaoMs: duracaoMs };
}
 
function buscarIdsExistentes(conn, sqlTemplate, ids, numerico){
    // sqlTemplate deve conter o marcador {IN}, ex.: "... WHERE IDPRODUTO IN ({IN}) AND STATIVO = 'True'"
    let encontrados = new Set();
    let lista = Array.from(ids);
 
    for(let i = 0; i < lista.length; i += TAMANHO_CHUNK_IN){
        let chunk = lista.slice(i, i + TAMANHO_CHUNK_IN);
        let marcadores = chunk.map(() => '?').join(',');
        let sql = sqlTemplate.replace('{IN}', marcadores);
 
        let pStmt = conn.prepareStatement(api.replaceDbName(sql));
        for(let k = 0; k < chunk.length; k++){
            if(numerico){
                pStmt.setInt(k + 1, chunk[k]);
            } else {
                pStmt.setString(k + 1, chunk[k]);
            }
        }
 
        let rs = pStmt.executeQuery();
        while(rs.next()){
            encontrados.add(String(rs.getString(1)));
        }
        rs.close();
        pStmt.close();
    }
 
    return encontrados;
}
 
function validarListaProdutos(detalhes, conn){
    let erros = [];
    let totalErros = 0;
 
    function addErro(idProduto, idResumoListaPreco, motivo){
        totalErros++;
        if(erros.length < MAX_ERROS_RETORNADOS){
            erros.push({ idProduto: idProduto, idResumoListaPreco: idResumoListaPreco, motivo: motivo });
        }
    }
 
    if(!Array.isArray(detalhes) || detalhes.length === 0){
        addErro(null, null, 'Lista de produtos vazia ou inválida');
        return { valido: false, totalErros: totalErros, erros: erros };
    }
 
    // ---------------------------------------------------------------------------------
    // Fase 1 - validações em memória
    // ---------------------------------------------------------------------------------
    let precosPorChave = new Map();   // "lista|produto" -> preço já visto
    let idsProdutos = new Set();
    let idsListas = new Set();
 
    for(let reg of detalhes){
        let idProduto = (reg.IDPRODUTO === null || reg.IDPRODUTO === undefined) ? '' : String(reg.IDPRODUTO).trim();
        let idLista = parseInt(reg.IDRESUMOLISTAPRECO, 10);
        let bruto = reg.PRECOVENDA;
        let preco = (bruto === null || bruto === undefined || String(bruto).trim() === '') ? NaN : Number(bruto);
 
        let registroOk = true;
 
        if(!idProduto){
            addErro(null, reg.IDRESUMOLISTAPRECO, 'IDPRODUTO não informado');
            registroOk = false;
        }
        if(isNaN(idLista)){
            addErro(idProduto, reg.IDRESUMOLISTAPRECO, 'IDRESUMOLISTAPRECO inválido');
            registroOk = false;
        }
        if(!isFinite(preco)){
            addErro(idProduto, idLista, 'Preço novo inválido: ' + bruto);
            registroOk = false;
        } else if(preco < PRECO_MINIMO){
            addErro(idProduto, idLista, 'Preço novo abaixo do mínimo permitido: ' + preco);
            registroOk = false;
        } else if(preco > PRECO_MAXIMO){
            addErro(idProduto, idLista, 'Preço novo acima do máximo permitido: ' + preco);
            registroOk = false;
        } else {
            let fator = Math.pow(10, CASAS_DECIMAIS);
            if(Math.abs(preco * fator - Math.round(preco * fator)) > 1e-6){
                addErro(idProduto, idLista, 'Preço com mais de ' + CASAS_DECIMAIS + ' casas decimais: ' + preco);
                registroOk = false;
            }
        }
 
        if(!registroOk){
            continue;
        }
 
        let chave = idLista + '|' + idProduto;
        if(precosPorChave.has(chave)){
            let mesmoPreco = precosPorChave.get(chave) === preco;
            addErro(idProduto, idLista, mesmoPreco ? 'Produto duplicado na lista' : 'Produto repetido com preços diferentes');
            continue;
        }
        precosPorChave.set(chave, preco);
 
        idsProdutos.add(idProduto);
        idsListas.add(idLista);
    }
 
    // ---------------------------------------------------------------------------------
    // Fase 2 - validações no banco (somente IDs distintos, em lotes)
    // ---------------------------------------------------------------------------------
    if(idsProdutos.size > 0){
        let produtosAtivos = buscarIdsExistentes(
            conn,
            `SELECT IDPRODUTO FROM "VAR_DB_NAME".PRODUTO WHERE IDPRODUTO IN ({IN}) AND STATIVO = 'True'`,
            idsProdutos,
            false
        );
 
        for(let chave of precosPorChave.keys()){
            let partes = chave.split('|');
            let idLista = partes[0];
            let idProduto = partes.slice(1).join('|'); // caso o ID do produto contenha "|"
 
            if(!produtosAtivos.has(idProduto)){
                addErro(idProduto, idLista, 'Produto não encontrado ou inativo');
            }
        }
    }
 
    if(idsListas.size > 0){
        // Ajuste o nome da coluna/tabela conforme o seu modelo (no código original aparece IDRESUMOLISTAPRECO e RESUMOLISTAPRECO)
        let listasAtivas = buscarIdsExistentes(
            conn,
            `SELECT IDRESUMOLISTAPRECO FROM "VAR_DB_NAME".RESUMOLISTAPRECO WHERE IDRESUMOLISTAPRECO IN ({IN}) AND STATIVO = 'True'`,
            idsListas,
            true
        );
 
        for(let idLista of idsListas){
            if(!listasAtivas.has(String(idLista))){
                addErro(null, idLista, 'Lista de preço não encontrada ou inativa');
            }
        }
    }
 
    return { valido: totalErros === 0, totalErros: totalErros, erros: erros };
}

// Persistencia - Insert

function criarResumoAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, dtAgendamentoAlteracao, txtObservacao, conn){
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."RESUMOALTERACAOPRECOPRODUTO"
        (
         	IDRESUMOALTERACAOPRECOPRODUTO,
         	IDUSUARIOCRIACAO,
         	TXTOBSERVACAO,
         	DATAHORAAGENDAMENTO,
         	IDUSUARIOATUALIZACAO
        )
		VALUES(?,?,?,?,?)
	`;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let idx = 0;
    
    pStmt.setInt(++idx, parseInt(idResumoAlteracaoPrecoProduto));
	pStmt.setInt(++idx, parseInt(idUsuario));
    setStringOrNull(pStmt, ++idx, txtObservacao);
	pStmt.setTimestamp(++idx, dtAgendamentoAlteracao);
	pStmt.setInt(++idx, parseInt(idUsuario));
 
    pStmt.execute();
    pStmt.close();
}
 
function criarDetalheAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, detalhes, conn){
    let query =`
        INSERT INTO 
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
        (
            IDRESUMOALTERACAOPRECOPRODUTO, 
            IDRESUMOLISTAPRECO, 
            IDPRODUTO, 
            PRECOVENDA,
            IDUSUARIOCRIACAO
        )
        VALUES(?,?,?,?,?)
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    let TAMANHO_LOTE = 1000;
    let pendentes = 0;
 
    for(let i = 0; i < detalhes.length; i++){
        let registro = detalhes[i];
        
        let idx = 0;
        
        pStmt.setInt(++idx, parseInt(idResumoAlteracaoPrecoProduto));
        pStmt.setInt(++idx, parseInt(registro.IDRESUMOLISTAPRECO));
        pStmt.setString(++idx, String(registro.IDPRODUTO).trim());
        pStmt.setDecimal(++idx, Number(registro.PRECOVENDA));
        pStmt.setInt(++idx, parseInt(idUsuario));
        
        pStmt.addBatch();
        
        if(++pendentes >= TAMANHO_LOTE || i === detalhes.length - 1){
            pStmt.executeBatch();
            pendentes = 0;
        }
    }
    
    pStmt.close();
}

function criarDetalheAlteracaoPrecoComSelect(idResumoAlteracaoPrecoProduto, idUsuario, detalhes, conn){
    let cabecalho = `
        INSERT 
            INTO 
                "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                    (
                        IDRESUMOALTERACAOPRECOPRODUTO, 
                        IDRESUMOLISTAPRECO, 
                        IDPRODUTO, 
                        PRECOVENDA,
                        IDUSUARIOCRIACAO
                    )
    `;
 
    let TAMANHO_LOTE = 1000;
    let partes = [];
 
    for(let i = 0; i < detalhes.length; i++){
        let registro = detalhes[i];
        let idProdutoSql = String(registro.IDPRODUTO).replace(/'/g, "''"); // evita quebrar a query se o ID tiver aspas
 
        partes.push(
            `SELECT ${idResumoAlteracaoPrecoProduto}, ${registro.IDRESUMOLISTAPRECO}, '${idProdutoSql}', ${Number(registro.PRECOVENDA)}, ${idUsuario} FROM DUMMY`
        );
 
        if(partes.length >= TAMANHO_LOTE || i === detalhes.length - 1){
            let sqlLote = cabecalho + partes.join(' UNION ALL ');
            let pStmt = conn.prepareStatement(api.replaceDbName(sqlLote));
            pStmt.execute();
            pStmt.close();
            partes = [];
        }
    }
}
 
function criarDetalheAlteracaoPrecoComSelectReutilizavel(idResumoAlteracaoPrecoProduto, idUsuario, detalhes, conn){
    let query = `
        INSERT INTO 
            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
        (
            IDRESUMOALTERACAOPRECOPRODUTO, 
            IDRESUMOLISTAPRECO, 
            IDPRODUTO, 
            PRECOVENDA,
            IDUSUARIOCRIACAO
        )
        ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
 
    let TAMANHO_LOTE = 1000;
    let partes = [];
 
    for(let i = 0; i < detalhes.length; i++){
        let registro = detalhes[i];
        let idProdutoSql = String(registro.IDPRODUTO).replace(/'/g, "''"); // evita quebrar a query se o ID tiver aspas
 
        partes.push(
            `SELECT ${idResumoAlteracaoPrecoProduto}, ${registro.IDRESUMOLISTAPRECO}, '${idProdutoSql}', ${Number(registro.PRECOVENDA)}, ${idUsuario} FROM DUMMY`
        );
 
        if(partes.length >= TAMANHO_LOTE || i === detalhes.length - 1){
            let sqlLote = partes.join(' UNION ALL ');
            
            pStmt.setString(1, sqlLote);
            
            pStmt.addBatch();
            partes = [];
        }
    }
    
    pStmt.executeBatch();
    pStmt.close();
}

function criarHistoricoAlteracaoPrecoProdutoListaPreco(idResumoAlteracaoPrecoProduto, conn){
    let query =`
        INSERT INTO
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO
        (
            IDRESUMOALTERACAOPRECOPRODUTO,
            IDRESUMOLISTAPRECO,
            IDDETALHEALTERACAOPRECOPRODUTO,
            IDPRODUTO,
            PRECOVENDAANTERIOR,
            PRECOVENDA
        )
        SELECT
            TBR.IDRESUMOALTERACAOPRECOPRODUTO, 
            TBD.IDRESUMOLISTAPRECO,
            TBD.IDDETALHEALTERACAOPRECOPRODUTO,
            TBD.IDPRODUTO,
            IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDAANTERIOR,
            TBD.PRECOVENDA
        FROM
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON 
            TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON 
            TBD.IDPRODUTO = TBP.IDPRODUTO AND TBD.STATIVO = 'True'
        LEFT JOIN "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP ON
            TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBD.IDRESUMOLISTAPRECO = TBHP.IDRESUMOLISTAPRECO AND TBHP.STATIVO = 'True'
        WHERE
            TBR.STATIVO = 'True'
            AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

function criarHistoricoAlteracaoPrecoProdutoEmpresa(idResumoAlteracaoPrecoProduto, conn){
    let query =`
        INSERT INTO
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA
        (
            IDRESUMOALTERACAOPRECOPRODUTO,
            IDDETALHEALTERACAOPRECOPRODUTO,
            IDEMPRESA,
            IDPRODUTO,
            PRECOVENDAANTERIOR,
            PRECOVENDA,
            PRICE_LIST_ID_SAP
        )
        SELECT
            TBR.IDRESUMOALTERACAOPRECOPRODUTO, 
            TBD.IDDETALHEALTERACAOPRECOPRODUTO,
            TBE.IDEMPRESA,
            TBP.IDPRODUTO,
            IFNULL(TBPP.PRECO_VENDA, TBP.PRECOVENDA) AS PRECOVENDAANTERIOR,
            TBD.PRECOVENDA,
            TBE.ID_LISTA_LOJA
        FROM
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON 
            TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO AND TBD.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBD.IDPRODUTO = TBP.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".RESUMOLISTAPRECO TBRL ON 
            TBD.IDRESUMOLISTAPRECO = TBRL.IDRESUMOLISTAPRECO AND TBRL.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDL ON 
            TBRL.IDRESUMOLISTAPRECO = TBDL.IDRESUMOLISTAPRECO AND TBDL.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBDL.IDEMPRESA = TBE.IDEMPRESA
        LEFT JOIN "VAR_DB_NAME".PRODUTO_PRECO TBPP ON
            TBE.IDEMPRESA = TBPP.IDEMPRESA AND TBP.IDPRODUTO = TBPP.IDPRODUTO
        WHERE
            TBR.STATIVO = 'True'
            AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

// Persistencia - Upsert

function alterarPrecosNaTabelaProdutoPreco(idResumoAlteracaoPrecoProduto, conn){
    let query = `
        UPSERT
            "VAR_DB_NAME"."PRODUTO_PRECO" 
        (
            "IDPRODUTO",
            "IDEMPRESA",
            "PRECO_VENDA",
            "PRICE_LIST_ID"
        )
        SELECT
            TBP.IDPRODUTO,
            TBE.IDEMPRESA,
            TBD.PRECOVENDA,
            TBE.ID_LISTA_LOJA AS PRICE_LIST_ID
        FROM
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON 
            TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO AND TBD.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
            TBD.IDPRODUTO = TBP.IDPRODUTO
        INNER JOIN "VAR_DB_NAME".RESUMOLISTAPRECO TBRL ON 
            TBD.IDRESUMOLISTAPRECO = TBRL.IDRESUMOLISTAPRECO AND TBRL.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".DETALHELISTAPRECO TBDL ON 
            TBRL.IDRESUMOLISTAPRECO = TBDL.IDRESUMOLISTAPRECO AND TBDL.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBDL.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            TBR.STATIVO = 'True'
            AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

// Persistencia - Update

function atualizarDataHoraAlteracaoNaTabelaProduto(idResumoAlteracaoPrecoProduto, conn){
    let query = `
        UPDATE
            "VAR_DB_NAME"."PRODUTO" TBP
        SET
            TBP.DTULTALTERACAO = TBR.DATAHORAAGENDAMENTO
        FROM
            "VAR_DB_NAME".PRODUTO TBP
        INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON 
            TBP.IDPRODUTO = TBD.IDPRODUTO AND TBD.STATIVO = 'True'
        INNER JOIN "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR ON
            TBD.IDRESUMOALTERACAOPRECOPRODUTO = TBR.IDRESUMOALTERACAOPRECOPRODUTO
        WHERE
            TBR.STATIVO = 'True'
            AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

function desativarHistoricoAnteriorListaPreco(idResumoAlteracaoPrecoProduto, conn) {
    let query = `
        UPDATE 
            "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
        SET 
            TBHP.STATIVO = 'False'
        WHERE
            TBHP.STATIVO = 'True'
            AND TBHP.IDRESUMOALTERACAOPRECOPRODUTO <> ?
            AND EXISTS (
                SELECT 
                    1
                FROM 
                    "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD
                WHERE
                    TBD.IDRESUMOALTERACAOPRECOPRODUTO = ?
                    AND TBD.STATIVO = 'True'
                    AND IFNULL(TBD.STEXCLUIDO, 'False') <> 'True'
                    AND TBD.IDPRODUTO = TBHP.IDPRODUTO
                    AND TBD.IDRESUMOLISTAPRECO = TBHP.IDRESUMOLISTAPRECO
            )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    pStmt.setInt(2, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

function desativarHistoricoAnteriorEmpresa(idResumoAlteracaoPrecoProduto, conn) {
    let query = `
        UPDATE "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA TBHP
        SET STATIVO = 'False'
        WHERE
            TBHP.STATIVO = 'True'
            AND TBHP.IDRESUMOALTERACAOPRECOPRODUTO <> ?
            AND EXISTS (
                SELECT 1
                FROM "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOEMPRESA TBN
                WHERE
                    TBN.IDRESUMOALTERACAOPRECOPRODUTO = ?
                    AND TBN.IDEMPRESA = TBHP.IDEMPRESA
                    AND TBN.IDPRODUTO = TBHP.IDPRODUTO
            )
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, idResumoAlteracaoPrecoProduto);
    pStmt.setInt(2, idResumoAlteracaoPrecoProduto);
    
    pStmt.execute();
    pStmt.close();
}

function marcarResumoAlteracaoPrecoComoExecutado(idResumo, idUsuario, conn) {
    let query = `
        UPDATE "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
        SET
            STEXECUTADO = 'True',
            DATAHORAEXECUTADO = CURRENT_TIMESTAMP,
            IDUSUARIOATUALIZACAO = ?,
            DATAHORAATUALIZACAO = CURRENT_TIMESTAMP
        WHERE 
            IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    pStmt.setInt(1, parseInt(idUsuario));
    pStmt.setInt(2, parseInt(idResumo));
    
    pStmt.execute();
    pStmt.close();
}

// Registrar Alteracao de Preco
function registrarAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, dtAgendamentoAlteracao, txtObservacao, detalhes, executarImediato, conn){
    criarResumoAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, dtAgendamentoAlteracao, txtObservacao, conn);
    
    criarDetalheAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, detalhes, conn);
    
    if(!executarImediato) {
        conn.commit();
    }
}

// Executar Alteracao de Preco
function executarAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, conn){
    criarHistoricoAlteracaoPrecoProdutoListaPreco(idResumoAlteracaoPrecoProduto, conn);
    
    desativarHistoricoAnteriorListaPreco(idResumoAlteracaoPrecoProduto, conn);
    
    criarHistoricoAlteracaoPrecoProdutoEmpresa(idResumoAlteracaoPrecoProduto, conn);
    
    desativarHistoricoAnteriorEmpresa(idResumoAlteracaoPrecoProduto, conn);
    
    alterarPrecosNaTabelaProdutoPreco(idResumoAlteracaoPrecoProduto, conn);
    
    atualizarDataHoraAlteracaoNaTabelaProduto(idResumoAlteracaoPrecoProduto, conn);
    
    marcarResumoAlteracaoPrecoComoExecutado(idResumoAlteracaoPrecoProduto, idUsuario, conn);
    
    conn.commit();
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    
    let conn = $.db.getConnection();
    let idResumoAlteracaoPrecoProduto;
    
    try {
        for(let registro of bodyJson){
            let idUsuario = registro.IDUSUARIO;
            let dtAgendamentoAlteracao = registro.DATAHORAAGENDAMENTO;
            let txtObservacao = registro.TXTOBSERVACAO;
            let detalhes = registro.DETALHES;
            
            // Sem data = imediato. Data inválida vira erro explícito (new Date(undefined) nunca executaria)
            let dtAgendamento = dtAgendamentoAlteracao ? new Date(dtAgendamentoAlteracao.concat('-03:00')) : null;
            
            if (!dtAgendamento) {
                return { type: 'warning', msg: 'DATAHORAAGENDAMENTO inválida: ' + dtAgendamentoAlteracao };
            }
            
            if (isNaN(dtAgendamento.getTime())) {
                return { type: 'warning', msg: 'DATAHORAAGENDAMENTO inválida: ' + dtAgendamentoAlteracao };
            }
            
            if (dtAgendamento.getTime() < Date.now() - TOLERANCIA_PASSADO_MS) {
                return { type: 'warning', msg: 'DATAHORAAGENDAMENTO não pode ser anterior ao horário atual (tolerância de 1 minuto).' };
            }
            
            let agendamentoVencido = !dtAgendamento || new Date() >= dtAgendamento;
            let executarImediato = registro.EXECUTAR == 'True' && agendamentoVencido;
            
            /*return {
                dateServer: new Date(),
                dtAgendamento,
                agendamentoVencido
            }*/
            
            let validacao = validarListaProdutos(detalhes, conn);
            /*
            return validacao
            */
            if (!validacao.valido) {
                // return (e não throw) para o front receber a lista de erros; o catch geral só devolve e.toString()
                return {
                    type: 'warning',
                    msg: 'Foram encontrados ' + validacao.totalErros + ' erro(s) na lista de produtos.',
                    erros: validacao.erros
                };
            }
            
            // Um ID por registro do body (fora do loop, o 2º registro violaria a PK)
            idResumoAlteracaoPrecoProduto = parseInt(api.executeScalar('SELECT "VAR_DB_NAME".SEQ_RESUMOALTERACAOPRECOPRODUTO.NEXTVAL FROM DUMMY WHERE 1 = ? ', 1));
            
            // registrar e executar já fazem commit internamente
            registrarAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, dtAgendamentoAlteracao, txtObservacao, detalhes, executarImediato, conn);
            
            if (executarImediato) {
                executarAlteracaoPreco(idResumoAlteracaoPrecoProduto, idUsuario, conn);
            }
        }
        
        return {
            type: 'success',
            msg : "Atualização realizada com sucesso!",
            "IDRESUMOALTERACAOPRECOPRODUTO": idResumoAlteracaoPrecoProduto
        };
     	
    } catch (error) {
        if (conn) { conn.rollback(); }
        throw error;
    } finally {
        if (conn) { conn.close(); }
    }
}

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var idGrpEstrutura = $.request.parameters.get("idGrpEstrutura");
    var idsSubgrpEstrutura = $.request.parameters.get("idsSubgrpEstrutura");
    var precoInicial = $.request.parameters.get("precoInicial");
    var precoFinal = $.request.parameters.get("precoFinal");
    var query;

    if(!idEmpresa){
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                (CASE 
                    WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                    ELSE TBP.IDGRUPOEMPRESARIAL 
                END) AS IDGRUPOEMPRESARIAL,
                (CASE 
                    WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                    ELSE  TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
            RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBP.IDPRODUTO = TBHP.IDPRODUTO  AND TBHP.IDRESUMOLISTAPRECO = ${idGrupoEmpresarial} AND TBHP.STATIVO =  'True'
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            WHERE 
                1 = ?
        `;
    } else{
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                (CASE 
                	WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                	ELSE TBP.IDGRUPOEMPRESARIAL 
                END) AS IDGRUPOEMPRESARIAL,
                (CASE 
                	WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                	ELSE  TBGE.DSGRUPOEMPRESARIAL
                END) AS GRUPOEMPRESARIAL,
                TBPP.IDEMPRESA,
                TBEMP.NOFANTASIA,
                TBP.DSNOME,
                TBP.STGRADE,
                TBP.UND,
                TBP.NUCODBARRAS,
                TBP.NUNCM,
                TBP.PRECOCUSTO,
                IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA ) AS PRECOVENDA,
                TBP.NUREFERENCIA,
                TBP.DTULTALTERACAO,
                TBP.GRP_MATERIAIS,
                TBP.STATIVO,
                TBP.IDSUBGRUPO,
                TBPEM.SUBGRUPO,
                TBES.DSESTILO,
                TBLE.DSLOCALEXPOSICAO,
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".PRODUTO_PRECO TBPP
            INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBPP.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            INNER JOIN "VAR_DB_NAME".EMPRESA TBEMP ON
                TBPP.IDEMPRESA = TBEMP.IDEMPRESA
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            WHERE 
                TBPP.IDEMPRESA = ${idEmpresa}
                AND 1 = ?
        `;
    }
    
    if ( byId ) {
        query += ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if(idGrupoEmpresarial || (idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='51' || idEmpresa ==='86')){
        idGrupoEmpresarial = idGrupoEmpresarial || null
        
        if(idEmpresa ==='31' || idEmpresa ==='109'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2)`;
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else if(idEmpresa ==='51'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else{
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL)`; 
        }
    }
    
    if ( codeBars ) {
        query += ` And  TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( descProd ) {
        descProd = descProd.split(' ').join('%');
        
        query += ` And  CONTAINS((tbp.DSNOME), '%${descProd}%')`;
    }
    
    if(idGrpEstrutura){
        query +=  ` AND TBGS.IDGRUPOESTRUTURA IN (${idGrpEstrutura}) `;
    }
    
    if(idsSubgrpEstrutura){
        //idsSubgrpEstrutura = idsSubgrpEstrutura.split(',').join(',');
        query +=  ` AND (TBSE.IDSUBGRUPOESTRUTURA IN (${idsSubgrpEstrutura}) OR TBPEM.IDSUBGRUPO IN (${idsSubgrpEstrutura})) `;
    }
    
    if(precoInicial && precoFinal){
        precoInicial = parseFloat(precoInicial);
        precoFinal = parseFloat(precoFinal);
        query += !idEmpresa ? ` AND LEAST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) >= ${precoInicial} AND GREATEST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) <= ${precoFinal} ` : ` AND LEAST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) >= ${precoInicial} AND GREATEST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) <= ${precoFinal} `
    }
    
    query += `ORDER BY ${idGrupoEmpresarial == 'TODAS_FILIAIS' ? ' TBP.DSNOME, TBEMP.IDEMPRESA' : idGrupoEmpresarial ? ' TBP.DSNOME, TBP.IDGRUPOEMPRESARIAL' : ' TBP.DSNOME,TBP.IDPRODUTO'}`;

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    
    let precoAntigo;
    let agendAlteracao;

    let prodsAgrupadosPorPreco;
    
    let idResumoAlteracaoPrecoProduto;
    let stAltValida = true;
    let prodListQuery = '';
    let listEmpresas = '';
    let prodListVerificar = [];
    let prodsEncontrados = [];
    let idsProdsNaoEncontrados = [];
    let validaProxPasso = true;
    let stExecutado = 'False';
    let stAtivo = 'True';
    let stCancelado = 'False';
    
    let dtHora = new Date();
    let dtHoraImediato;
    let dtHoraPadrao;
    
    dtHoraImediato = dtHora;
    dtHoraImediato = dtHoraImediato.toISOString().split('T')[0] + ' ' + dtHoraImediato.toLocaleTimeString('pt-BR')
    
    dtHoraPadrao = dtHora;
    dtHoraPadrao.setDate(dtHoraPadrao.getDate() + 1);
    dtHoraPadrao = dtHoraPadrao.toISOString().split('T')[0] + ' 05:00:00';
    
    try{
        if(bodyJson[0].STAGENDAMENTOPERSONALIZADO && !bodyJson[0].DTAGENDAMENTOPERSONALIZADO){
            return {
         	    type: 'warning',
         	    msg : "Data vazia!",
         	};
        }
        
        bodyJson.map((registro, indice) => {
            idResumoAlteracaoPrecoProduto = registro.IDRESUMOALTERACAOPRECO;
            let stCancelado = registro.STCANCELADO || 'False';
            let idFuncionario = registro.IDFUNCIONARIO;
            
            let queryDetResumoAlteracao = `
                SELECT
                    TBR.TPALTERACAO,
                    TBD.IDDETALHEALTERACAOPRECOPRODUTO,
                    TBD.IDGRUPOEMP,
                    TBD.IDPRODUTO,
                    TBD.PRECOVENDAANTERIOR,
                    TBD.PRECOVENDA, 
                    TBD.QTDESTOQUEAOCADASTRAR
                FROM
                    "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
                INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON
                    TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO 
                    AND TBD.STATIVO = 'True'
                WHERE 
                    TBR.STEXECUTADO <> 'True'
                    AND STCANCELADO <> 'True'
                    AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
            `;
            
            let regDetResumo = api.sqlQuery(queryDetResumoAlteracao, idResumoAlteracaoPrecoProduto);

            if(regDetResumo.length){
                let updateResumoAlteracao;
                
                if(stCancelado == 'True'){
                    let stAtivo = 'False';
                    
                    //Feito via TRIGGER
                    
                    /*regDetResumo.map((det, indice) => {
                        atualizarHistoricoProdutoEmpresa(idResumoAlteracaoPrecoProduto, det.IDPRODUTO, det.PRECOVENDA, 'False', stAtivo, conn);
                    })*/
                    
                    updateResumoAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
                        SET 
                            RESPATUALIZACAO = ${idFuncionario},
                            DATAATUALIZACAO = now(), 
                            STCANCELADO = '${stCancelado}'
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                    
                    let updateDetalheAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO
                        SET 
                            RESPATUALIZACAO = ${idFuncionario},
                            DATAATUALIZACAO = now(), 
                            STATIVO = '${stAtivo}'
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                    
                    let pStmtUpdateDetalhe = conn.prepareStatement(api.replaceDbName(updateDetalheAlteracao));
                    
                    pStmtUpdateDetalhe.setInt(1, idResumoAlteracaoPrecoProduto);
                    
                    pStmtUpdateDetalhe.execute();
                    pStmtUpdateDetalhe.close();
                    
                } else {
                    if(registro.STAGENDAMENTOIMEDIATO){
                        let idLista = regDetResumo[0].IDGRUPOEMP;
                        
                        if(regDetResumo[0].TPALTERACAO == 'GRUPO'){
                            listEmpresas = buscarEmpresasDaListaDePreco(`'${idLista}'`);
                        } else {
                            listEmpresas = `'${idLista}'`;
                        }
                        
                        let isLista = 'False';
                        
                        agendAlteracao = dtHoraImediato;
                        stExecutado = 'True';
                        
                        /*regDetResumo.map((det, indice) => {
                            if(regDetResumo[0].TPALTERACAO == 'GRUPO') {
                                isLista = 'True'
                                
                               atualizarHistoricoProdutoLista(idResumoAlteracaoPrecoProduto, det.IDGRUPOEMP, det.IDPRODUTO, conn);
                               criarHistoricoPrecoLista(idResumoAlteracaoPrecoProduto, det.IDGRUPOEMP, det.PRECOVENDA, det.IDPRODUTO, conn, det.QTDESTOQUEAOCADASTRAR);
                            }
                            
                            atualizarEstoqueDetalheAlteracao(isLista, det.IDGRUPOEMP, det.IDPRODUTO, det.IDDETALHEALTERACAOPRECOPRODUTO, conn)
                            
                            atualizarHistoricoProdutoEmpresa(idResumoAlteracaoPrecoProduto, det.IDPRODUTO, det.PRECOVENDA, stExecutado, stAtivo, conn);
                            
                            atualizarPrecoProdutosListaPrecoOuEmpresa(listEmpresas, det.PRECOVENDA, det.IDPRODUTO, conn);
                            atualizarDataHoraAlteracaoNaTabelaProduto(agendAlteracao, det.IDPRODUTO, conn);
                        })*/
                    }
                    
                    if(registro.STAGENDAMENTOPERSONALIZADO){
                        agendAlteracao = (registro.DTAGENDAMENTOPERSONALIZADO).replace('T', ' ') + ' 05:00:00';
                    }
                    
                   updateResumoAlteracao = `
                        UPDATE
                            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
                        SET 
                            AGENDAMENTOALTERACAO = '${agendAlteracao}',
                            STEXECUTADO = '${stExecutado}',
                            DATAEXECUTADO = now(),
                            RESPATUALIZACAO = ${registro.IDFUNCIONARIO},
                            DATAATUALIZACAO = now()
                        WHERE 
                            IDRESUMOALTERACAOPRECOPRODUTO = ?
                    `;
                }
                
                let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(updateResumoAlteracao));
                
                pStmtUpdateResumo.setInt(1, idResumoAlteracaoPrecoProduto);
                
                pStmtUpdateResumo.execute();
                pStmtUpdateResumo.close();
            } else {
                stAltValida = false;
            }
        })
        
        if(stAltValida){
            conn.commit()
            
            return {
                "type": 'success',
                "msg": "Update feito com sucesso!",
                "IDRESUMOALTERACAOPRECO": idResumoAlteracaoPrecoProduto
            };
        }
        
        return {
            "type": 'warning',
            "msg": "Está alteração já foi realizada ou cancelada, recarregue a página e tente novamente!"
        };
        
    } catch (error){
        conn.rollback();
        throw error
    } finally{
        conn.close();
    }
    
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
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
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
}/*catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}*/