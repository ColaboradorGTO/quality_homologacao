var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


// CONSTANTS
var FUNCOES = {
    ACESSO: [
        'TI',
        'SUPERVISOR',
    ]
};

var TIPO_TROCA = [
    'CORTESIA',
    'DEFEITO'
];

const GRUPO_EMPRESARIAL_REGRA_ESPECIAL = 4;
const PRAZO_CREATE = 180;
const PRAZO_CORTESIA = 32;
const PRAZO_DEFEITO = 90;
const PRAZO_UPDATE = 180;
const PRAZO_CANCELAMENTO_VOUCHER = 3;

// Inicio Funcoes Get Dados

function getDadosFuncionario(idFuncionario) {

    var query = `
        SELECT
            TBF.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            TBF.IDEMPRESA,
            TBF.NOFUNCIONARIO,
            TBF.IDPERFIL,
            TBF.NUCPF,
            UPPER(TRIM(TBF.DSFUNCAO)) AS DSFUNCAO,
            TBF.STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO TBF
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE
            ON TBE.IDEMPRESA = TBF.IDEMPRESA
        WHERE
            TBF.STATIVO = 'True'
            AND TBF.IDFUNCIONARIO = ?
    `;

    return api.sqlQuery(
        query,
        idFuncionario
    );
}

function getDadosVoucher(idVoucher) {

    var query = `
        SELECT
            TBR.IDRESUMOVENDAWEB,
            TRIM(UPPER(TBR.STSTATUS)) AS STSTATUS,
            TRIM(UPPER(TBR.STTIPOTROCA)) AS STTIPOTROCA,
            TRIM(UPPER(TBR.STDEVOLUCAOSAP)) AS STDEVOLUCAOSAP,
            TO_DATE(TBR.DTINVOUCHER) AS DTINVOUCHER,
            DAYS_BETWEEN(TO_DATE(TBR.DTINVOUCHER), CURRENT_DATE) AS DIAS_APOS_CRIACAO_VOUCHER,
            DAYS_BETWEEN(TO_DATE(TBV.DTHORAFECHAMENTO), CURRENT_DATE) AS DIAS_APOS_VENDA
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBV.IDVENDA = TBR.IDRESUMOVENDAWEB
        WHERE
            TBR.IDVOUCHER = ?
    `;

    return api.sqlQuery(
        query,
        idVoucher
    );
}

function getVendaOrigemAtiva(idVoucher){
    let query = `
        SELECT
            TBV.IDVENDA,
            TBV.STCANCELADO
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBR.IDRESUMOVENDAWEB = TBV.IDVENDA
        WHERE
            TBR.IDVOUCHER = ?
    `;
    
    return api.sqlQuery(query, idVoucher);
}

function getVendaDestinoAtiva(idVoucher){
    let query = `
        SELECT
            TBV.IDVENDA,
            TBV.STCANCELADO
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".VENDA TBV ON 
            TBR.IDRESUMOVENDAWEBDESTINO = TBV.IDVENDA
        WHERE
            TBR.IDVOUCHER = ?
    `;
    
    return api.sqlQuery(query, idVoucher);
}

function getDadosStatusResumoVoucher(idVoucher){
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBR.STATIVO AS STATIVO_ORIGINAL,
            TBR.STCANCELADO AS STCANCELADO_ORIGINAL,
            TBR.STSTATUS AS STSTATUS_ORIGINAL
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        WHERE
            TBR.IDVOUCHER = ?
    `;
    
    let reg = api.sqlQuery(query, idVoucher);
    
    return reg.length > 0 ? reg[0] : [];
}

function getListaProdutosVoucher(idVoucher){
    let query = `
        SELECT
            TBR.IDVOUCHER,
            TBR.IDEMPRESAORIGEM AS IDEMPRESA,
            TBDV.IDPRODUTO,
            TBDV.QTD
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".DETALHEVOUCHER TBDV ON 
            TBR.IDVOUCHER = TBDV.IDVOUCHER
        WHERE
            TBR.IDVOUCHER = ?
    `;
    
    return api.sqlQuery(query, idVoucher);
}

function getInventarioMovimentoAtivo(idEmpresa, idProduto, dtMovimento){
    let query = `
        SELECT 
            IDINVMOVIMENTO,
            TO_VARCHAR(DTMOVIMENTO, 'YYYY-MM-DD') AS DTMOVIMENTO,
            QTDINICIO,
            QTDENTRADAVOUCHER,
            QTDENTRADA,
            QTDSAIDA,
            QTDSAIDATRANSFERENCIA,
            QTDRETORNOAJUSTEPEDIDO,
            QTDAJUSTEBALANCO,
            QTDFINAL
        FROM 
            "VAR_DB_NAME"."INVENTARIOMOVIMENTO" 
        WHERE
            STATIVO = 'True'
            AND IDPRODUTO= '${idProduto}'
            AND IDEMPRESA = '${idEmpresa}'
            AND 1 = ?
    `;
    
    if(dtMovimento){
        query += ` AND TO_DATE(DTMOVIMENTO) = '${dtMovimento}' `;
    }
    
    return api.sqlQuery(query, 1);
}
// Fim Funcoes Get Dados

// HELPERS
function getDataHoje() {

    var date = new Date();

    var dd = ('0' + date.getDate()).slice(-2);
    var mm = ('0' + (date.getMonth() + 1)).slice(-2);
    var yyyy = date.getFullYear();

    return yyyy + '-' + mm + '-' + dd;
}

function padLeft(number, length, character) {
	if(character == null) {
		character = '0';
    }
	var result = String(number);
	for(var i = result.length; i < length; ++i) {
		result = character + result;
	}
	return result;
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setTimestampOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function normalizarString(funcao) {
    return String(funcao || '')
        .trim()
        .toUpperCase();
}

function numero(valor) {
    return Number(valor || 0);
}

function isValoresIguais(valor1, valor2) {
    return numero(valor1) === numero(valor2);
}

function possuiFuncao(funcao, listaFuncoes) {
    return listaFuncoes.indexOf(normalizarString(funcao)) !== -1;
}

function erro(message) {
    throw new Error( message );
}

function formatarListaProdutosEmAgrupamento(listaProdutos){
    let produtosAgrupados = listaProdutos.reduce((acc, item) => {
        let produtoExistente = acc.find(
            produto => produto.IDPRODUTO === item.IDPRODUTO
        );
        
        if (produtoExistente) {
            produtoExistente.QTD += Number(item.QTD);
        } else {
            acc.push({
                IDPRODUTO: item.IDPRODUTO,
                QTD: Number(item.QTD)
            });
        }
        
        return acc;
    }, []);

    return produtosAgrupados;
}

// VALIDACAO DE DADOS
function validarValorObrigatorio(valor, mensagem) {
    if (valor === undefined || valor === null || valor === '') {
        erro(mensagem);
    }
}

function validarSePrecisaMovimentarIrnventario(statusOriginal, statusAtualizar){
    let statusNaoMovimentaInventario = [
        'EM ANALISE',
        'NOVO',
        'LIBERADO PARA O CLIENTE',
        'FINALIZADO'
    ];
    
    if(statusOriginal == statusAtualizar){
        return false;
    }
    
    if(statusNaoMovimentaInventario.includes(statusOriginal) && statusNaoMovimentaInventario.includes(statusAtualizar)){
        return false;
    }
    
    if(statusNaoMovimentaInventario.includes(statusOriginal) && !statusNaoMovimentaInventario.includes(statusAtualizar)){
        return true;
    }
    
    if(!statusNaoMovimentaInventario.includes(statusOriginal) && statusNaoMovimentaInventario.includes(statusAtualizar)){
        return true;
    }
}

function validarFuncionario(dadosFuncionario) {
    if (!dadosFuncionario || !dadosFuncionario.length) {
        erro('Usuário inválido!');
    }

    var funcionario = dadosFuncionario[0];
    var funcao = normalizarString(funcionario.DSFUNCAO);
    
    if (!possuiFuncao(funcao, FUNCOES.ACESSO)) {
        erro('ACESSO NEGADO! Usuário Sem Permissão!');
    }
    
    return funcionario;
}

function validarVoucher(dadosVoucher) {

    if (!dadosVoucher || !dadosVoucher.length) {
        erro('Voucher Não Localizado');
    }
    
    let voucher = dadosVoucher[0];
    
    validarValorObrigatorio(voucher.STSTATUS, 'Voucher sem STSTATUS registrado na base');
    
    validarValorObrigatorio(voucher.STTIPOTROCA, 'Voucher sem STTIPOTROCA registrado na base');
    
    return voucher;
}

function validarDadosAuthUpdate(dadosAuth) {
    if (!dadosAuth) {
        erro('Dados de autorização não informados');
    }

    var idFuncionario = dadosAuth.IDFUNCIONARIO;
    var idEmpresaLogada = dadosAuth.IDEMPRESALOGADA;
    var idGrupoEmpresarial = dadosAuth.IDGRUPOEMPRESARIAL;
    var idVoucher = dadosAuth.IDVOUCHER;
    var novoStatus = String(dadosAuth.STSTATUS || '').trim().toUpperCase();

    validarValorObrigatorio(idEmpresaLogada, 'A identificação de Empresa Logada é uma informação obrigatória');

    validarValorObrigatorio(idGrupoEmpresarial, 'A identificação do Grupo Empresarial é uma informação obrigatória');

    validarValorObrigatorio(idFuncionario, 'Usuário não encontrado!');

    validarValorObrigatorio(idVoucher, 'Voucher não informado!');

    validarValorObrigatorio(novoStatus, 'Novo status não informado!');
}

function validarPrazoUpdate( funcionario, dadosVoucher, stStatusVoucherAtualizar, idGrupoEmpresarialLogada ) {
    var diasAposVenda = numero(dadosVoucher.DIAS_APOS_VENDA);
    var diasAposCriacaoVoucher = numero(dadosVoucher.DIAS_APOS_CRIACAO_VOUCHER);
    var stDevolucaoSap = dadosVoucher.STDEVOLUCAOSAP;
    var stStatusVoucherAtualizar = dadosVoucher.STSTATUS;
    var tipoTroca = dadosVoucher.STTIPOTROCA;

    var funcao = normalizarString(funcionario.DSFUNCAO);

    // --------------------------------------------------------
    // Regra geral: máximo 180 dias
    // --------------------------------------------------------

    if (diasAposVenda > PRAZO_UPDATE) {
        erro(
            'ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! ' +
            'DIAS PASSADOS APÓS A VENDA: ' +
            diasAposCriacaoVoucher +
            ' Dias'
        );
    }
    
    if(stStatusVoucherAtualizar == 'NEGADO' || stStatusVoucherAtualizar == 'CANCELADO'){
        if(diasAposCriacaoVoucher > PRAZO_CANCELAMENTO_VOUCHER || stDevolucaoSap == 'True'){
            erro(`ACESSO NEGADO! Voucher não pode ser ${stStatusVoucherAtualizar} porque está fora do Prazo de Cancelamento/Negação! `);
        }
    }
}

// Verificacao antes da atualizacao do voucher
function fnAuthUserUpdate(dadosAuth) {
    validarDadosAuthUpdate(dadosAuth);
    
    var idFuncionario = dadosAuth.IDFUNCIONARIO;
    var idVoucher = dadosAuth.IDVOUCHER;
    var idEmpresaLogada = dadosAuth.IDEMPRESALOGADA;
    var idGrupoEmpresarialLogada = dadosAuth.IDGRUPOEMPRESARIAL;
    var stStatusVoucherAtualizar = dadosAuth.STSTATUS;
    
    // Busca dados necessários
    var dadosFuncionario = getDadosFuncionario(idFuncionario);
    var dadosVoucher = getDadosVoucher(idVoucher);

    // Validações básicas
    var funcionario = validarFuncionario(dadosFuncionario);
    var voucher = validarVoucher(dadosVoucher);
    

    // Validação do prazo
    validarPrazoUpdate( funcionario, voucher, stStatusVoucherAtualizar, idGrupoEmpresarialLogada );

    return true;
}

// Inicio Persistencia
// UPDATE
function inativarInventarioMovimento(idInventarioMovimento, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."INVENTARIOMOVIMENTO" 
        SET 
            "STATIVO" = 'False'
        WHERE 
            "IDINVMOVIMENTO" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(1, parseInt(idInventarioMovimento));
    
    pStmt.execute();
    pStmt.close();
}

function atualizarInventarioMovimentoAtivoComQuantidadeEntradaVoucher(idInventarioMovimento, qtdEntradaVoucher, conn){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."INVENTARIOMOVIMENTO"
        SET
            "QTDENTRADAVOUCHER" = (QTDENTRADAVOUCHER + ?),
            "QTDFINAL" = ((QTDINICIO + QTDENTRADA + QTDENTRADAVOUCHER + ?) - (QTDSAIDA + QTDSAIDATRANSFERENCIA))
        WHERE 
            "IDINVMOVIMENTO" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
	pStmt.setInt(1, qtdEntradaVoucher);
	pStmt.setInt(2, qtdEntradaVoucher);
    pStmt.setInt(3, parseInt(idInventarioMovimento));
    
    pStmt.execute();
    pStmt.close();
}

function atualizarResumoVoucher(dadosVoucher, conn){
    let idx = 0;
    let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS, STATIVO, STCANCELADO } = dadosVoucher;

    let query = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOVOUCHER" 
        SET
            "DTULTALTERACAO" = CURRENT_TIMESTAMP,
            "STATIVO" = ?,
            "STCANCELADO" = ?,
            "DSMOTIVOCANCELAMENTO" = ?,
            "IDUSRCANCELAMENTO" = ?,
            "STSTATUS" = ?,
            "STTIPOTROCA" = ?,
            "IDUSRULTALTERACAO" = ?
        WHERE 
            "IDVOUCHER" =  ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(++idx, STATIVO);
    pStmt.setString(++idx, STCANCELADO);
    setStringOrNull(pStmt, ++idx, (STCANCELADO == 'True' ? DSMOTIVOTROCASTATUS : null));
    setIntOrNull(pStmt, ++idx, (STCANCELADO == 'True' ? IDFUNCIONARIO : null));
    pStmt.setString(++idx, STSTATUS);
    pStmt.setString(++idx, STTIPOTROCA);
    pStmt.setInt(++idx, IDFUNCIONARIO);
    pStmt.setInt(++idx, IDVOUCHER);
    
    pStmt.execute();
    pStmt.close();
}

function atualizarStatusDetalheVoucher(idVoucher, stCancelado, conn){
    let stAtivo = stCancelado == 'False' ? 'True' : 'False';
    
    let query = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEVOUCHER" 
        SET
            "STATIVO" = ?, 
            "STCANCELADO" = ?
        WHERE 
            "IDVOUCHER" = ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	
    pStmt.setString(1, stAtivo);
    pStmt.setString(2, stCancelado);
    pStmt.setInt(3, parseInt(idVoucher));
    
    pStmt.execute();
	pStmt.close();
}

// INSERT
function inserirInventarioMovimentoEntrada(dadosInventarioMovimento, conn){
    let idx = 0;
    let {
        idEmpresa,
        idProduto,
        qtdInicio,
        qtdEntradaVoucher,
        qtdEntrada,
        qtdSaida,
        qtdSaidaTransferencia,
        qtdRetornoAjustePedido,
        qtdFinal,
        qtdAjusteBalanco
    } = dadosInventarioMovimento;
    
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."INVENTARIOMOVIMENTO"
        (
            "IDINVMOVIMENTO",
            "DTMOVIMENTO",
            "STATIVO",
            "IDEMPRESA",
            "IDPRODUTO",
            "QTDINICIO",
            "QTDENTRADAVOUCHER",
            "QTDENTRADA",
            "QTDSAIDA",
            "QTDSAIDATRANSFERENCIA",
            "QTDRETORNOAJUSTEPEDIDO",
            "QTDAJUSTEBALANCO",
            "QTDFINAL"
        )
        VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL, now(), 'True', ?,?,?,?,?,?,?,?,?,?) 
    `;
    
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(++idx, parseInt(idEmpresa));
    pStmt.setString(++idx, idProduto);
    pStmt.setInt(++idx, qtdInicio);
    pStmt.setInt(++idx, qtdEntradaVoucher);
    pStmt.setInt(++idx, qtdEntrada);
    pStmt.setInt(++idx, qtdSaida);
    pStmt.setInt(++idx, qtdSaidaTransferencia);
    pStmt.setInt(++idx, qtdRetornoAjustePedido);
    pStmt.setInt(++idx, qtdAjusteBalanco);
    pStmt.setInt(++idx, qtdFinal);
    
    pStmt.execute();
    pStmt.close();
}

function movimentarInventarioMovimento(idEmpresa, listaProdutosParaMovimentar, conn, tpOperacao = "ENTRADA_VOUCHER"){
    let listaProdutosParaMovimentarFormatada = formatarListaProdutosEmAgrupamento(listaProdutosParaMovimentar);
    let dataMovimentoHoje = getDataHoje();

    for (let registro of listaProdutosParaMovimentarFormatada) {
        let qtdInicio = 0;
        let qtdEntrada = 0;
        let qtdEntradaVoucher = 0;
        let qtdSaida = 0;
        let qtdSaidaTransferencia = 0;
        let qtdRetornoAjustePedido = 0;
        let qtdAjusteBalanco = 0;
        let qtdFinal = 0;
        
        if(registro.QTD <= 0){
            erro('Quantidade a ser movimentada não pode ser menor que 1');
        }
        
        let regInventarioMovimentoAtivo = getInventarioMovimentoAtivo(parseInt(idEmpresa), registro.IDPRODUTO);
        let stExisteMovimentoAtivo = regInventarioMovimentoAtivo.length > 0;
        let stCriarNovoMovimento = !stExisteMovimentoAtivo || (stExisteMovimentoAtivo && regInventarioMovimentoAtivo[0].DTMOVIMENTO != dataMovimentoHoje.trim());
        
        //Negativa a quantidade do voucher em caso de cancelamento;
        qtdEntradaVoucher = tpOperacao == "ENTRADA_VOUCHER" ? parseInt(registro.QTD) : -parseInt(registro.QTD);
       
        if(stCriarNovoMovimento){
            
            if(stExisteMovimentoAtivo){
               let idInventarioMovimento = parseInt(regInventarioMovimentoAtivo[0].IDINVMOVIMENTO);
               
               qtdInicio =  parseInt(regInventarioMovimentoAtivo[0].QTDFINAL);
               
               inativarInventarioMovimento(idInventarioMovimento, conn);
               
            }
            
            qtdFinal = qtdInicio + qtdEntradaVoucher;
            
            let dadosInventarioMovimento = {
                idEmpresa,
                qtdInicio,
                qtdEntradaVoucher,
                qtdEntrada,
                qtdSaida,
                qtdSaidaTransferencia,
                qtdRetornoAjustePedido,
                qtdAjusteBalanco,
                qtdFinal,
                idProduto: registro.IDPRODUTO,
            };
            
            inserirInventarioMovimentoEntrada(dadosInventarioMovimento, conn);
            
        } else {
            let idInventarioMovimento = parseInt(regInventarioMovimentoAtivo[0].IDINVMOVIMENTO);
            
            atualizarInventarioMovimentoAtivoComQuantidadeEntradaVoucher(idInventarioMovimento, qtdEntradaVoucher, conn);
        }
        
    }
   
}

function inserirHistoricoVoucher(dadosVoucher, conn){
    let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = dadosVoucher;
    
    let queryInsertHistorico = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOVOUCHER
        (
            IDRESUMOVOUCHER,
            STTIPOVOUCHER, 
            STATUSVOUCHER, 
            MOTIVOTROCASTATUS,
            IDUSERALTERACAO
        ) 
        VALUES(?, ?, ?, ?, ?)
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsertHistorico));
    
    pStmtInsert.setInt(1, IDVOUCHER);
    pStmtInsert.setString(2, STTIPOTROCA);
    pStmtInsert.setString(3, STSTATUS);
    pStmtInsert.setString(4, DSMOTIVOTROCASTATUS);
    pStmtInsert.setInt(5, IDFUNCIONARIO);
    
    pStmtInsert.execute();
    
    pStmtInsert.close();
}
// Fim Persistencia

function fnHandleGet(byId) {

    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    var subgrupoEmpresa = $.request.parameters.get("subgrupoEmpresa");
    var id = $.request.parameters.get("id");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dadosVoucher = $.request.parameters.get("dadosVoucher");
    var stStatus = $.request.parameters.get("stStatus");
    
	let query =`
	    SELECT 
       	  tbrv.IDVOUCHER,  
       	  tbrv.IDEMPRESAORIGEM,  
       	  tbrv.IDCAIXAORIGEM,  
       	  tbrv.IDVENDEDOR,  
       	  tbrv.IDNFEDEVOLUCAO,  
       	  tbrv.IDRESUMOVENDAWEB,  
       	  tbcliente.IDCLIENTE,  
       	  tbcliente.DSNOMERAZAOSOCIAL, 
       	  tbcliente.DSAPELIDONOMEFANTASIA,  
       	  tbcliente.NUCPFCNPJ,  
       	  tbrv.IDRESUMOVENDAWEBDESTINO,  
       	  tbrv.STSTATUS,  
       	  tbrv.STTIPOTROCA,  
       	  tbrv.MOTIVOTROCA,  
       	  tbrv.IDUSRLIBERACAOCRIACAO,
       	  tbrv.IDUSRINVOUCHER,
          tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
       	  tbrv.IDUSRLIBERACAOCONSUMO, 
       	  (SELECT NOFUNCIONARIO FROM  "VAR_DB_NAME".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO,
       	  tbrv.DTINVOUCHER,
	      TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
	      tbrv.DTOUTVOUCHER,
	      TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
    	  tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
    	  LEFT(tbrv.NUVOUCHER, 5) || LPAD('', LENGTH(tbrv.NUVOUCHER) - 8, '*') || RIGHT(tbrv.NUVOUCHER, 4) AS NUVOUCHERFORMATOCULTO,
    	  tbrv.NUVOUCHER,
    	  tbrv.VRVOUCHER,  
    	  tbrv.STATIVO,  
    	  tbrv.STCANCELADO,  
    	  CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
    	  tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
    	  tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
	      tbemporigem.NOFANTASIA AS EMPORIGEM, 
	      tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
	      tbemporigem.EENDERECO AS ENDEMPORIGEM, 
	      tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
	      tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
	      tbemporigem.SGUF AS SGUFEMPORIGEM, 
	      tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
	      tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
	      tbempdestino.NOFANTASIA AS EMPDESTINO,
	      tbcdestino.DSCAIXA AS DSCAIXADESTINO,
	      tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOVENDAORIGEM
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER as tbrv 
        LEFT JOIN "VAR_DB_NAME".VENDA tbv ON tbrv.IDRESUMOVENDAWEB = tbv.IDVENDA
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcdestino ON tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".CLIENTE as tbcliente ON tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
	    LEFT JOIN "VAR_DB_NAME".FUNCIONARIO as tbfuncionario ON tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
        WHERE 1 = ?
	`;
     
    if(id) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + id + '\' ';
    }
    
    if(byId) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + byId + '\' ';
    }
    
    if(stStatus){
        query += ` AND tbrv.STTIPOTROCA = 'DEFEITO' AND tbrv.STSTATUS = 'EM ANALISE' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + 'AND (tbrv.DTINVOUCHER BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(subgrupoEmpresa){
        query = query + ' AND tbemporigem.IDSUBGRUPOEMPRESARIAL = \'' + subgrupoEmpresa + '\' ';
    }
    
    if(idEmpresa){
        query = query + `AND CONTAINS((tbrv.IDEMPRESAORIGEM, tbrv.IDEMPRESADESTINO), '${idEmpresa}')`;
    }
    
    if(dadosVoucher){
        query += subgrupoEmpresa ? ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${subgrupoEmpresa}` : ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}')`;
    }
    
    if(numeroVoucher){
        query += ` And  tbrv.NUVOUCHER = '${numeroVoucher}' AND STATIVO = 'True' `;
    }
    
   query = query + ' ORDER BY tbrv.DTINVOUCHER ';
 
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

// Atualizar Status Voucher e Estoque se necessario
function fnHandlePut() {
    let idVoucher;
   try {
        var conn = $.db.getConnection();
        let bodyJson = JSON.parse($.request.body.asString());
        
        for (let registro of bodyJson) {
            
            fnAuthUserUpdate(registro);
            
            let stAtivo;
            let stCancelado;
            
            let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = registro;
            let { IDEMPRESA, STATIVO_ORIGINAL, STCANCELADO_ORIGINAL, STSTATUS_ORIGINAL } = getDadosStatusResumoVoucher(IDVOUCHER);
            let dadosVendaOrigemAtiva = getVendaOrigemAtiva(IDVOUCHER);
            let dadosVendaDestinoAtiva = getVendaDestinoAtiva(IDVOUCHER);
            let stVendaOrigemAtiva = dadosVendaOrigemAtiva.length > 0 && dadosVendaOrigemAtiva[0].STCANCELADO == 'False';
            let stVendaDestinoAtiva = dadosVendaDestinoAtiva.length > 0 && dadosVendaDestinoAtiva[0].STCANCELADO == 'False';
            
            idVoucher = !idVoucher ? IDVOUCHER :    idVoucher
            
            if(!stVendaOrigemAtiva){
                erro('Venda Origem Cancelada');
            }
            
            if(stVendaDestinoAtiva && STSTATUS != 'FINALIZADO'){
                erro('Venda Destino Ativa');
            }
            
            let stMovimentarInventario = validarSePrecisaMovimentarIrnventario(STSTATUS_ORIGINAL, STSTATUS);
            
            if (STSTATUS == 'NOVO' || STSTATUS == 'LIBERADO PARA O CLIENTE') {
                stAtivo = 'True';
                stCancelado = 'False';
            } else if (STSTATUS == 'CANCELADO' || STSTATUS == 'NEGADO') {
                stAtivo = 'False';
                stCancelado = 'True';
            } else if (STSTATUS == 'EM ANALISE' || STSTATUS == 'FINALIZADO') {
                stAtivo = 'False';
                stCancelado = 'False';
            } else {
                erro('Status Invalido');
            }
            
            registro.STATIVO = stAtivo;
            registro.STCANCELADO = stCancelado;
            
            atualizarResumoVoucher(registro, conn)
            atualizarStatusDetalheVoucher(IDVOUCHER, stCancelado, conn);
            
            if(stMovimentarInventario){
                let listaProdutosVoucherParaMovimentar = getListaProdutosVoucher(IDVOUCHER);
                let tpOperacao = stCancelado == 'False' ? "ENTRADA_VOUCHER" : "ESTORNO_VOUCHER";
                
                if(listaProdutosVoucherParaMovimentar.length > 0){
                    let idEmpresa = listaProdutosVoucherParaMovimentar[0].IDEMPRESA;
                    
                    movimentarInventarioMovimento(idEmpresa, listaProdutosVoucherParaMovimentar, conn, tpOperacao);
                    
                } else {
                    erro('Nao há produtos vinculados a este voucher');
                }
            }
            
            inserirHistoricoVoucher(registro, conn);
        }
        
        //conn.commit();
        
    } catch(e){
        conn.rollback();
        
        throw e;
        
    } finally{
        conn.close();
    }
    
    return {
        "msg": "Voucher atualizado com sucesso!",
        "IDVOUCHER": idVoucher
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}