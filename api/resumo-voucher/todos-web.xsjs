var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

// CONSTANTS
var FUNCOES = {
    ACESSO: [
        'TI',
        'SUPERVISOR',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE LOJA',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ],

    CREATE_ATE_32_DIAS: [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE LOJA',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ],

    CREATE_33_A_180_DIAS: [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE LOJA',
        'FISCAL DE CAIXA'
    ],

    UPDATE_ATE_32_DIAS: [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE LOJA',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ],

    UPDATE_33_A_60_DIAS: [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE LOJA',
        'FISCAL DE CAIXA'
    ],

    UPDATE_61_A_180_DIAS: [
        'TI',
        'SUPERVISOR'
    ],
};

var TIPO_TROCA = [
    'CORTESIA',
    'DEFEITO'
];

var STATUS_VOUCHER_BLOQUEADOS_USUARIO_COMUM = [
    'NOVO',
    'LIBERADO PARA O CLIENTE',
    'FINALIZADO',
    'NEGADO',
    'CANCELADO'
];

const GRUPO_EMPRESARIAL_REGRA_ESPECIAL = 4;
const PRAZO_CREATE = 180;
const PRAZO_CORTESIA = 32;
const PRAZO_DEFEITO = 90;
const PRAZO_UPDATE = 180;
const PRAZO_CANCELAMENTO_VOUCHER = 3;

// Inicio Funcoes Get Dados
function getVendaOrigemVoucherCreate(idVenda) {

    var query = `
        SELECT
            TBE.IDEMPRESA,
            TBE.IDGRUPOEMPRESARIAL,
            TBV.DTHORAFECHAMENTO,
            DAYS_BETWEEN(
                TO_DATE(TBV.DTHORAFECHAMENTO),
                CURRENT_DATE
            ) AS DIAS_APOS_VENDA
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE
            ON TBE.IDEMPRESA = TBV.IDEMPRESA
        WHERE
            TBV.STCANCELADO = 'False'
            AND TBV.IDVENDA = ?
    `;

    return api.sqlQuery(
        query,
        idVenda
    );
}

function getDadosEmpresa(idEmpresa) {

    var query = `
        SELECT
            TBE.IDEMPRESA,
            TBE.IDGRUPOEMPRESARIAL
        FROM
            "VAR_DB_NAME".EMPRESA TBE
        WHERE
            TBE.IDEMPRESA = ?
    `;

    return api.sqlQuery(
        query,
        idEmpresa
    );
}

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

function getDadosFuncionarioUpdate(idFuncionario) {

    return getDadosFuncionario(
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
            TBV.IDVENDA = TBR.IDRESUMOVENDAWEB AND TBV.STCANCELADO = 'False'
        WHERE
            TBR.IDVOUCHER = ?
    `;

    return api.sqlQuery(
        query,
        idVoucher
    );
}

function getItensVenda(idVenda){
    let query = `
        SELECT
            TBV.IDVENDA,
            TBV.NFE_INFNFE_IDE_NNF AS NUM_NFCE,
            TBVD.IDVENDADETALHE,
            TBVD.CPROD AS IDPRODUTO,
            TBVD.QTD - COALESCE(TBDV.QTDUTILIZADA, 0) AS QTDDISPONIVELPRODUTO,
            TBVD.VUNCOM - (COALESCE(TBVD.VDESC, 0) / TBVD.QTD) AS VRUNITARIOPRODUTO
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".VENDADETALHE TBVD ON 
            TBV.IDVENDA = TBVD.IDVENDA
        LEFT JOIN (
            SELECT
                TBD.IDVENDADETALHE,
                SUM(TBD.QTD) AS QTDUTILIZADA
            FROM
                "VAR_DB_NAME".DETALHEVOUCHER TBD
            INNER JOIN "VAR_DB_NAME".RESUMOVOUCHER TBR ON 
           		TBR.IDVOUCHER = TBD.IDVOUCHER AND TBR.STCANCELADO = 'False'
            WHERE
                TBD.STCANCELADO = 'False'
            GROUP BY
                TBD.IDVENDADETALHE
        ) TBDV ON 
        	TBVD.IDVENDADETALHE = TBDV.IDVENDADETALHE
        WHERE
            TBV.STCANCELADO = 'False'
            AND TBVD.STCANCELADO = 'False'
            AND TBV.IDVENDA = ?
    `;
    
    return api.sqlQuery(query, idVenda);
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

function calcularDiferencaDias(data) {

    var dataReferencia = new Date(data);
    var hoje = new Date();

    dataReferencia.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    return Math.ceil(
        Math.abs(
            hoje.getTime() -
            dataReferencia.getTime()
        ) /
        (1000 * 60 * 60 * 24)
    );
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

function isFuncaoTI(funcao) {
    return normalizarString(funcao) === 'TI';
}

function isFuncaoSupervisor(funcao) {
    return normalizarString(funcao) === 'SUPERVISOR';
}

function isFuncaoOperador(funcao) {
    return normalizarString(funcao).indexOf('OPERADOR') !== -1;
}

function erro(message) {
    throw new Error( message );
}

function calcularValorVoucher(detalheVoucher){
    let vrVoucher = 0;
    
    for(let registro of detalheVoucher){
       let { QTD, VRUNIT } = registro || 0;
       let qtdProduto = Number(QTD);
       let vrProduto = Number(VRUNIT);
       
       vrVoucher += ( qtdProduto * vrProduto );
    }
    
    return vrVoucher;
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

function validarProdutosVoucher(produtosRequisicao, produtosVenda){
    return produtosRequisicao.every(itemFrontend => {
        
        let itemBanco = produtosVenda.find(
            itemBanco => itemBanco.IDVENDADETALHE == itemFrontend.IDVENDADETALHE && itemBanco.IDPRODUTO == itemFrontend.IDPRODUTO
        );
        
        if (!itemBanco) {
            return false;
        }
        
        return itemFrontend.QTD > 0 && numero(itemBanco.QTDDISPONIVELPRODUTO) > 0 && itemFrontend.QTD <= numero(itemBanco.QTDDISPONIVELPRODUTO) && itemFrontend.VRUNIT == numero(itemBanco.VRUNITARIOPRODUTO);
    });
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

function validarEmpresaGrupo(funcionario, dadosEmpresa, idEmpresaLogada, idGrupoEmpresarialLogada) {
    if (!dadosEmpresa || !dadosEmpresa.length) {
        erro('Empresa do Usuário Não Encontrada!');
    }
    
    let empresa = dadosEmpresa[0];
    
    if (!isValoresIguais(idGrupoEmpresarialLogada, empresa.IDGRUPOEMPRESARIAL)) {
        erro(
            'ACESSO NEGADO! Grupo Empresarial da Loja Divergente, Entre Em Contato Com o Suporte!'
        );
    }
    
    /*
    * TI e SUPERVISOR podem atuar fora da empresa de origem,
    * conforme as regras atuais.
    */
    if (!isFuncaoTI(funcionario.DSFUNCAO) && !isFuncaoSupervisor(funcionario.DSFUNCAO)) {
        if (!isValoresIguais(idGrupoEmpresarialLogada, funcionario.IDGRUPOEMPRESARIAL)) {
            erro(
                'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, ' +
                'Fale Com o Gerente, Subgerente ou Líder de Loja!'
            );
        }
        
        if (!isValoresIguais(idEmpresaLogada, funcionario.IDEMPRESA)) {
            erro(
                'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, ' +
                'Fale Com o Gerente, Subgerente ou Líder de Loja!'
            );
        }
        
    }
}

function validarVenda(dadosVenda, idGrupoEmpresarialLogada) {

    if (!dadosVenda || !dadosVenda.length) {
        erro('Venda Não Localizada');
    }

    if (!isValoresIguais(idGrupoEmpresarialLogada, dadosVenda[0].IDGRUPOEMPRESARIAL)) {
        erro( 'ACESSO NEGADO! Esta Venda Não Pertence a Nenhuma Loja do Grupo!' );
    }
}

function validarVoucher(dadosVoucher) {

    if (!dadosVoucher || !dadosVoucher.length) {
        erro('Voucher Não Localizada');
    }
    
    let voucher = dadosVoucher[0];
    
    validarValorObrigatorio(voucher.STSTATUS, 'Voucher sem STSTATUS registrado na base');
    
    validarValorObrigatorio(voucher.STTIPOTROCA, 'Voucher sem STTIPOTROCA registrado na base');
    
    return voucher;
}

function validarDadosAuthCreate(dadosAuth) {

    if (!dadosAuth) {
        erro('Dados de autorização não informados');
    }

    let idUsuario = dadosAuth.IDUSRLIBERACAOCRIACAO;
    let idGrupo = dadosAuth.IDGRUPOEMPRESARIAL;
    let idEmpresa = dadosAuth.IDEMPRESAORIGEM;
    let idVenda = dadosAuth.IDRESUMOVENDAWEB;
    let cpf = dadosAuth.NUCPF;
    let tipoTroca = normalizarString(dadosAuth.STTIPOTROCA);

    validarValorObrigatorio(idEmpresa, 'A identificação de Empresa Logada é uma informação obrigatória');

    validarValorObrigatorio(idGrupo, 'A identificação do Grupo Empresarial é uma informação obrigatória');

    validarValorObrigatorio(idVenda, 'A identificação da Venda é uma informação obrigatória');

    validarValorObrigatorio(idUsuario, 'A identificação do Funcionário é uma informação obrigatória');

    validarValorObrigatorio(cpf, 'A identificação do CPF/CNPJ do Cliente é uma informação obrigatória');

    if (!TIPO_TROCA.includes(tipoTroca)) {
        erro('Tipo de troca inválida');
    }
}

function validarPrazoCreate( funcionario, dadosVenda, tipoTroca, idGrupoEmpresarialLogada ) {

    var diasAposVenda = numero(dadosVenda[0].DIAS_APOS_VENDA);

    var funcao = normalizarString(funcionario.DSFUNCAO);

    // --------------------------------------------------------
    // Regra geral: máximo 180 dias
    // --------------------------------------------------------

    if (diasAposVenda > PRAZO_CREATE) {
        erro(
            'ACESSO NEGADO! Venda fora do Prazo de Troca! ' +
            'DIAS PASSADOS APÓS A VENDA: ' +
            diasAposVenda +
            ' Dias'
        );
    }

    // --------------------------------------------------------
    // DEFEITO: máximo 90 dias
    // --------------------------------------------------------

    if (tipoTroca === 'DEFEITO' && diasAposVenda > PRAZO_DEFEITO) {
        
        erro(
            'ACESSO NEGADO! Venda fora do Prazo de Troca do Tipo DEFEITO! ' +
            'DIAS PASSADOS APÓS A VENDA: ' +
            diasAposVenda +
            '. Fale Com o Suporte'
        );
    }

    // --------------------------------------------------------
    // TI possui acesso irrestrito às regras de função
    // --------------------------------------------------------

    if (isFuncaoTI(funcao)) {
        return;
    }

    // --------------------------------------------------------
    // Grupo 4 possui regra especial
    // --------------------------------------------------------

    if (isValoresIguais(funcionario.IDGRUPOEMPRESARIAL, GRUPO_EMPRESARIAL_REGRA_ESPECIAL) || isValoresIguais(idGrupoEmpresarialLogada, GRUPO_EMPRESARIAL_REGRA_ESPECIAL)) {
        
        if (!possuiFuncao(funcao, FUNCOES.CREATE_33_A_180_DIAS)) {
            erro(
                'ACESSO NEGADO! Usuário Sem Permissão, ' +
                'Fale Com o Gerente, Subgerente ou Líder de Loja!'
            );
        }
        
        return;
    }

    // --------------------------------------------------------
    // Até 32 dias
    // --------------------------------------------------------

    if (diasAposVenda <= 32) {
        
        if (!possuiFuncao(funcao, FUNCOES.CREATE_ATE_32_DIAS)) {
            erro(
                'ACESSO NEGADO! Usuário Sem Permissão, ' +
                'Fale Com o Gerente, Subgerente ou Líder de Loja!'
            );
        }
        
        return;
    }

    // --------------------------------------------------------
    // Acima de 32 dias
    // --------------------------------------------------------

    if (!possuiFuncao(funcao, FUNCOES.CREATE_33_A_180_DIAS)) {
        erro(
            'ACESSO NEGADO! Usuário Sem Permissão, ' +
            'Fale Com o Gerente, Subgerente ou Líder de Loja!'
        );
    }
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

    // --------------------------------------------------------
    // TI possui acesso irrestrito às regras de função
    // --------------------------------------------------------

    if (isFuncaoTI(funcao)) {
        return;
    }
    
    // --------------------------------------------------------
    // Usuario com funcoes que nao sejam de Supervisao ou TI não podem alterar o status do voucher se ele não estiver: EM ANALISE
    // --------------------------------------------------------
    
    if(STATUS_VOUCHER_BLOQUEADOS_USUARIO_COMUM.includes(stStatusVoucherAtualizar)){
        erro(`ACESSO NEGADO! Usuário Sem Permissão Para Alterar o Status do Voucher`)
    }
    
    if(diasAposVenda > 32 && diasAposVenda <= 60 && !!possuiFuncao(funcao, FUNCOES.UPDATE_33_A_60_DIAS)){
        erro('ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!');
    }
    
    if(tipoTroca !== 'DEFEITO') {
        
        if(diasAposVenda > 60 && !!possuiFuncao(funcao, FUNCOES.UPDATE_61_A_180_DIAS)) {
            erro('ACESSO NEGADO! Usuário Sem Permissão, Fale Com a Supervisão Para Autorizar!');
        }
    } 

    // --------------------------------------------------------
    // Grupo 4 possui regra especial
    // --------------------------------------------------------

    if (isValoresIguais(funcionario.IDGRUPOEMPRESARIAL, GRUPO_EMPRESARIAL_REGRA_ESPECIAL) || isValoresIguais(idGrupoEmpresarialLogada, GRUPO_EMPRESARIAL_REGRA_ESPECIAL)) {
        
        if (!possuiFuncao(funcao, FUNCOES.UPDATE_33_A_60_DIAS)) {
            erro(
                'ACESSO NEGADO! Usuário Sem Permissão, ' +
                'Fale Com o Gerente, Subgerente ou Líder de Loja!'
            );
        }
        
        return;
    }
}

// Verificacao antes da criacao do voucher
function fnAuthUserCreate(dadosAuth){
    
    validarDadosAuthCreate(dadosAuth);

    var idFuncionario = dadosAuth.IDUSRLIBERACAOCRIACAO;
    var idEmpresaLogada = dadosAuth.IDEMPRESAORIGEM;
    var idGrupoEmpresarialLogada = dadosAuth.IDGRUPOEMPRESARIAL;
    var idVenda = dadosAuth.IDRESUMOVENDAWEB;
    var tipoTroca = String(dadosAuth.STTIPOTROCA || '').trim().toUpperCase();
    
    // Busca dados necessários
    var dadosFuncionario = getDadosFuncionario(idFuncionario);
    var dadosVenda = getVendaOrigemVoucherCreate(idVenda);
    var dadosEmpresaLogada = getDadosEmpresa(idEmpresaLogada);
    
    // Validações básicas
    var funcionario = validarFuncionario(dadosFuncionario);
    
    validarVenda(dadosVenda, idGrupoEmpresarialLogada);
    
    validarEmpresaGrupo( funcionario, dadosEmpresaLogada, idEmpresaLogada, idGrupoEmpresarialLogada );

    // Validação do prazo
    validarPrazoCreate( funcionario, dadosVenda, tipoTroca, idGrupoEmpresarialLogada );
    
    // --------------------------------------------------------
    // Regra: operador não pode criar voucher para si mesmo
    // --------------------------------------------------------

    if (isFuncaoOperador(funcionario.DSFUNCAO) && String(funcionario.NUCPF) === String(dadosAuth.NUCPF)) {
        erro(
            'ACESSO NEGADO! Não é Permitida Criação de Voucher Para Você Mesmo, ' +
            'Fale Com o Gerente, Subgerente ou Líder de Loja!'
        );
    }
    
    return true;
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
    var dadosEmpresaLogada = getDadosEmpresa(idEmpresaLogada);

    // Validações básicas
    var funcionario = validarFuncionario(dadosFuncionario);
    var voucher = validarVoucher(dadosVoucher);
    
    validarEmpresaGrupo(funcionario, dadosEmpresaLogada, idEmpresaLogada, idGrupoEmpresarialLogada );

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

function atualizaStatusProdutosOrigemVoucher(idVoucher, stAtivo, stCancelado, stStatus, conn){
    let stTroca = 'False';
    
    let queryProdVoucher = `
        SELECT
            TBRV."IDEMPRESAORIGEM",
            TBDV."IDVOUCHER",
            TBDV."IDPRODUTO",
            TBDV."QTD",
            TBRV."STATIVO",
            TBRV."STCANCELADO",
            TBRV."STSTATUS"
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBRV
        INNER JOIN "VAR_DB_NAME".DETALHEVOUCHER TBDV ON
            TBRV."IDVOUCHER" = TBDV."IDVOUCHER"
        WHERE
            TBDV."IDVOUCHER" = ?
        ORDER BY
            IDVOUCHER
    `;

    let detalheProdVoucher = api.sqlQuery(queryProdVoucher, idVoucher);
    let lstProd = [];
    
    if (stCancelado  == 'False'){
        stTroca = 'True';
        
        if((stStatus == 'NOVO' || stStatus == 'EM ANALISE' || stStatus == 'LIBERADO PARA O CLIENTE' || stStatus == 'FINALIZADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'CANCELADO' || detalheProdVoucher[0]['STSTATUS'] == 'NEGADO')) {
           movimentarInventarioMovimento(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn, "ENTRADA_VOUCHER");
        }
        
    } else {
        
        if((stStatus == 'CANCELADO' || stStatus == 'NEGADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'NOVO' || detalheProdVoucher[0]['STSTATUS'] == 'EM ANALISE' || detalheProdVoucher[0]['STSTATUS'] == 'LIBERADO PARA O CLIENTE' || detalheProdVoucher[0]['STSTATUS'] == 'FINALIZADO')) {
            movimentarInventarioMovimento(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn, "ESTORNO_VOUCHER");
        }
        
    }
    
    var queryUpdateDetalheVenda = `
        UPDATE 
            "VAR_DB_NAME"."VENDADETALHE" 
        SET
            STTROCA = ? 
        WHERE 
            "IDVOUCHER" = ? 
    `;
    
    var queryUpdateDetalheVoucher = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEVOUCHER" 
        SET
            "STATIVO" = ?, 
            "STCANCELADO" = ?
        WHERE 
            "IDVOUCHER" = ? 
    `;
    
    var pStmtUpdateDetalheVenda = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVenda));
    var pStmtUpdateDetalheVoucher = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVoucher));
	
    pStmtUpdateDetalheVenda.setString(1, stTroca);
    pStmtUpdateDetalheVenda.setInt(2, parseInt(idVoucher));
	
    pStmtUpdateDetalheVoucher.setString(1, stTroca);
    pStmtUpdateDetalheVoucher.setString(2, stCancelado);
    pStmtUpdateDetalheVoucher.setInt(3, parseInt(idVoucher));
    
    pStmtUpdateDetalheVenda.execute();
    pStmtUpdateDetalheVoucher.execute();
    
	conn.commit();
	
	pStmtUpdateDetalheVenda.close();
	pStmtUpdateDetalheVoucher.close();
    
    return {
	   msg : "Atualização realizada com sucesso!"
	};
}

function criarResumoVoucher(idVoucher, dadosVoucher, conn){
    let idx = 0;
    let vrVoucher = calcularValorVoucher(dadosVoucher.DETALHEVOUCHER);
    
    let {
        IDGRUPOEMPRESARIAL,
        IDEMPRESAORIGEM,
        IDCAIXAORIGEM,
        IDNFEDEVOLUCAO,
        IDUSRINVOUCHER,
        IDVENDEDOR,
        IDCLIENTE,
        VRVOUCHER,
        IDRESUMOVENDAWEB,
        STTIPOTROCA,
        MOTIVOTROCA,
        IDUSRLIBERACAOCRIACAO,
        DETALHEVOUCHER
    } = dadosVoucher;
    
	let numVoucher = padLeft(IDGRUPOEMPRESARIAL, 2) + padLeft(IDEMPRESAORIGEM, 3) + padLeft(IDCAIXAORIGEM, 5) + padLeft(IDUSRLIBERACAOCRIACAO, 5) + idVoucher;
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."RESUMOVOUCHER"
		(
            "IDVOUCHER", 
            "IDEMPRESAORIGEM", 
            "IDCAIXAORIGEM", 
            "IDNFEDEVOLUCAO", 
            "IDUSRINVOUCHER", 
            "IDVENDEDOR", 
            "IDCLIENTE", 
            "VRVOUCHER", 
            "NUVOUCHER", 
            "IDRESUMOVENDAWEB" ,
            "STTIPOTROCA",
            "MOTIVOTROCA",
            "IDUSRLIBERACAOCRIACAO",
            "DTINVOUCHER", 
            "STATIVO", 
            "STCANCELADO", 
            "STSTATUS"
        )
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, now(), 'False', 'False', 'EM ANALISE') 
	`;

    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setInt(++idx, idVoucher);
	pStmt.setInt(++idx, IDEMPRESAORIGEM);
    pStmt.setInt(++idx, IDCAIXAORIGEM);
    pStmt.setInt(++idx, IDNFEDEVOLUCAO);
    pStmt.setInt(++idx, IDUSRINVOUCHER);
    setIntOrNull(pStmt, ++idx, IDVENDEDOR);
    pStmt.setInt(++idx, IDCLIENTE);
    pStmt.setFloat(++idx, vrVoucher);
    pStmt.setString(++idx, numVoucher);
    pStmt.setString(++idx, IDRESUMOVENDAWEB);
    pStmt.setString(++idx, STTIPOTROCA);
    pStmt.setString(++idx, MOTIVOTROCA);
    pStmt.setInt(++idx, IDUSRLIBERACAOCRIACAO);
    
    pStmt.execute();

	pStmt.close();
}

function criarDetalheVoucher(idVoucher, detalheVoucher, conn){
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEVOUCHER"  
        (
            "IDDETALHEVOUCHER",
            "IDVOUCHER",
            "IDPRODUTO",
            "QTD",
            "VRUNIT",
            "VRTOTALBRUTO",
            "VRDESCONTO",
            "VRTOTALLIQUIDO",
            "IDVENDADETALHE",
            "IDVENDEDOR",
            "STATIVO",
            "STCANCELADO"
        )
        SELECT
            ? AS "IDDETALHEVOUCHER",
            ? AS "IDVOUCHER",
            TBVD.CPROD AS "IDPRODUTO",
            ? AS "QTD",
            ROUND( TBVD.VUNCOM, 2 ) AS "VRUNIT",
            ROUND( ( TBVD.VUNCOM * ? ), 2) AS "VRTOTALBRUTO",
            ROUND( ( ( COALESCE( TBVD.VDESC, 0 ) / TBVD.QTD ) * ? ), 2 ) AS "VRDESCONTO",
            ROUND( ( ( TBVD.VUNCOM - ( COALESCE( TBVD.VDESC, 0 ) / TBVD.QTD ) ) * ? ), 2 ) AS "VRTOTALLIQUIDO",
            TBVD."IDVENDADETALHE",
            (	
                SELECT 
                    FIRST_VALUE(TBF."IDFUNCIONARIO" ORDER BY TBF."IDFUNCIONARIO") 
                FROM 
                    "VAR_DB_NAME".FUNCIONARIO TBF 
                WHERE
                    REPLACE_REGEXPR('[^0-9]' IN TBVD.VENDEDOR_CPF WITH '') = REPLACE_REGEXPR('[^0-9]' IN TBF.NUCPF WITH '')
                    AND REPLACE_REGEXPR('[^0-9]' IN TBVD.VENDEDOR_CPF WITH '') <> '00000000000'
                    AND TBF.STATIVO = 'True'
            )  AS "IDVENDEDOR",
            'True' AS "STATIVO",
            'False' AS "STCANCELADO"
        FROM 
            "VAR_DB_NAME".VENDADETALHE TBVD
        WHERE
            TBVD.STCANCELADO = 'False'
            AND TBVD.IDVENDADETALHE = ?
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (let registro of detalheVoucher) {
        let idx = 0;
        let idDetalheVoucher = api.executeScalar('SELECT "VAR_DB_NAME".SEQ_DETALHEVOUCHER.NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
        
        pStmt.setInt(++idx, parseInt(idDetalheVoucher));
        pStmt.setInt(++idx, idVoucher);
        pStmt.setFloat(++idx, parseFloat(registro.QTD));
        pStmt.setFloat(++idx, parseFloat(registro.QTD));
        pStmt.setFloat(++idx, parseFloat(registro.QTD));
        pStmt.setFloat(++idx, parseFloat(registro.QTD));
        pStmt.setString(++idx, registro.IDVENDADETALHE);
        
        pStmt.execute();
	}

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

// Get Voucher
function fnHandleGet(byId) {
    
    let numeroVoucher = $.request.parameters.get("numeroVoucher");
    
    let query = `
        SELECT
            TBRV.IDVOUCHER,
            TBRV.IDEMPRESAORIGEM,
            TBRV.IDCAIXAORIGEM,
            TBRV.IDNFEDEVOLUCAO,
            TBRV.DTINVOUCHER,
            TBRV.IDUSRINVOUCHER,
            TBRV.IDVENDEDOR,
            TBRV.IDCLIENTE,
            TBRV.VRVOUCHER,
            TBRV.IDEMPRESADESTINO,
            TBRV.IDCAIXADESTINO,
            TBRV.IDNFESAIDA,
            TBRV.DTOUTVOUCHER,
            TBRV.NUVOUCHER,
            TBRV.IDUSROUTVOUCHER,
            TBRV.STATIVO,
            TBRV.STCANCELADO,
            TBRV.DSMOTIVOCANCELAMENTO,
            TBRV.IDUSRCANCELAMENTO,
            TBRV.IDRESUMOVENDAWEB,
            TBC.NUCPFCNPJ AS NUCPFCNPJ_CLIENTE,
            TBC.DSNOMERAZAOSOCIAL AS DSNOMERAZAOSOCIAL_CLIENTE
        FROM  
            "VAR_DB_NAME".RESUMOVOUCHER TBRV
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON
            TBC.IDCLIENTE = TBRV.IDCLIENTE 
        WHERE 
            1 = ? 
    `;
    
    if ( byId ) {
        query += ` AND TBRV.IDVOUCHER = '${byId}' `;
    }
    
    if(numeroVoucher){
        query += ` AND TBRV.NUVOUCHER = '${numeroVoucher}' `;
    }
    
    query += ' AND TBRV.STATIVO = \'True\'';
 
    let request = { 
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
        
        conn.commit();
        
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

// Gerar Voucher e Atualizar Estoque
function fnHandlePost() {
    try { 
        var conn = $.db.getConnection();
        let bodyJson = JSON.parse($.request.body.asString());
        
        for (let dadosVoucher of bodyJson) {
            
            fnAuthUserCreate(dadosVoucher);
            
            let {
                IDEMPRESAORIGEM,
                IDRESUMOVENDAWEB,
                STTIPOTROCA,
                IDUSRLIBERACAOCRIACAO,
                MOTIVOTROCA,
                DETALHEVOUCHER,
            } = dadosVoucher;
            
            let listaItensVenda = getItensVenda(IDRESUMOVENDAWEB);
            
            if(listaItensVenda.length == 0){
                erro('Nenhum produto encontrado');
            }
            
            if(DETALHEVOUCHER.length > listaItensVenda.length){
                erro('Divergencia no produto/quantidade disponivel e requisitada');
            }
            
            let stProdutosValidos = validarProdutosVoucher(DETALHEVOUCHER, listaItensVenda);
            
            if(!stProdutosValidos){
                erro('Divergencia no produto/quantidade disponivel e requisitada');
            }
            
            dadosVoucher.IDNFEDEVOLUCAO = parseInt(listaItensVenda[0].NUM_NFCE || 0)
            
            var idVoucher = api.executeScalar('SELECT "VAR_DB_NAME".SEQ_RESUMOVOUCHER.NEXTVAL FROM DUMMY WHERE 1 = ? ', 1);
            
            let dadosHistVoucher = {
                STTIPOTROCA, 
                "IDVOUCHER": idVoucher,
                "STSTATUS": 'EM ANALISE', 
                "IDFUNCIONARIO": IDUSRLIBERACAOCRIACAO, 
                "DSMOTIVOTROCASTATUS": MOTIVOTROCA
            }
            
            criarResumoVoucher(idVoucher, dadosVoucher, conn);
            criarDetalheVoucher(idVoucher, DETALHEVOUCHER, conn);
            movimentarInventarioMovimento(IDEMPRESAORIGEM, DETALHEVOUCHER, conn, "ENTRADA_VOUCHER");
            inserirHistoricoVoucher(dadosHistVoucher, conn);
        }
        
        conn.commit();
        
    } catch(e){
        conn.rollback();
        
        throw e;
        
    } finally{
        conn.close();
    }
    
    return {
        "msg": "Voucher criado com sucesso!",
        "IDVOUCHER": idVoucher
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
            
        //Handle your PUT calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
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