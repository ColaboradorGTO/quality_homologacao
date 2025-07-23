var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnAtualizaQtdImpressaoVoucher(IDVOUCHER, IDFUNCIONARIO){
    let conn = $.db.getConnection();
    
    let queryUpdateVoucher = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOVOUCHER" 
        SET
            QTDIMPRESSAO = (QTDIMPRESSAO + 1),
            USRULTIMPRESSAO = ?
        WHERE 
            "IDVOUCHER" =  ?
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateVoucher));
    
    pStmtUpdate.setInt(1, Number(IDFUNCIONARIO));
    pStmtUpdate.setInt(2, Number(IDVOUCHER));
    
    pStmtUpdate.execute();
    pStmtUpdate.close();

    conn.commit();
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    let { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVOUCHER } = bodyJson || false;
    let diferencaEmDias;
    
    let funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasUpdateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasUpdateAte60Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
    ];
    
    let funcAutorizadasUpdateAte180Dias = [
        'TI',
        'SUPERVISOR',
    ];
    
    let stStatusNãoAutorizadosImprimir = [
        'EM ANALISE',
        'NEGADO',
        'CANCELADO',
    ];
    
    if(!MATRICULA){
        throw {
            message: 'A MATRICULA é uma informação obrigatória'
        }
    }
    
    if(!SENHA) {
        throw {
            message: 'A SENHA é uma informação obrigatória'
        }
    }
    
    if(!IDGRUPOEMPRESARIAL){
        throw {
            message: 'A identificação do Grupo Empresarial é uma informação obrigatória'
        }
    }
    
    if(!IDEMPRESALOGADA) {
        throw {
            message: 'A identificação de Empresa Logada é uma informação obrigatória'
        }
    }
    
    if(!IDVOUCHER) {
        throw {
            message: 'Usuário não encontrado!'
        }
    }
    
    let queryFunc = `
        SELECT
            tbf.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            tbf.IDEMPRESA,
            tbf.NOFUNCIONARIO,
            tbf.IDPERFIL,
            tbf.NUCPF,
            UPPER(tbf.DSFUNCAO) as DSFUNCAO,
            tbf.STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO tbf
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBF.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            tbf.NOLOGIN = '${MATRICULA}'
            AND tbf.PWSENHA = ?
            AND tbf.STATIVO = 'True' 
    `;
    
    let queryVoucher = `
        SELECT
            (SELECT DTHORAFECHAMENTO FROM "VAR_DB_NAME".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.*
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, SENHA);
    let DadosVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
    
    if(!dataFunc.length){
        throw {
            message: 'Usuário inválido!'
        }
    }
    
    if(!DadosVoucher.length){
        throw {
            message: 'Voucher Não Localizado'
        }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    let dataHoraVenda = new Date(DadosVoucher[0].DTHORAFECHAMENTO);
    let dataHoraAtual = new Date();
    
    dataHoraVenda.setUTCHours(0, 0, 0, 0);
    dataHoraAtual.setUTCHours(0, 0, 0, 0);
    
    diferencaEmDias = Math.ceil(Math.abs(dataHoraAtual - dataHoraVenda) / (1000 * 60 * 60 * 24));

    if(dataFunc[0].DSFUNCAO !== 'TI'){
        if(dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR'){
            if(IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
            
            if(IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
            
            if(DadosVoucher[0].IDEMPRESAORIGEM !== IDEMPRESALOGADA){
                throw {
                    message: 'ACESSO NEGADO! Este Voucher só Pode Ser Impresso Na Loja de Criação!'
                }
            }
        }
        
        if(DadosVoucher[0].QTDIMPRESSAO >= 1 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.trim())){
            throw {
                message: 'ACESSO NEGADO! Somente o Gerente, Subgerente ou Líder de Loja Podem Imprimir a 2ª Via do Voucher!'
            }
        }
         
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(diferencaEmDias <= 32 && !funcAutorizadasUpdateAte32Dias.includes(dataFunc[0].DSFUNCAO.trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja !'
            }
        }
        
        if(stStatusNãoAutorizadosImprimir.includes(DadosVoucher[0].STSTATUS) || DadosVoucher[0].STCANCELADO == 'True'){
            let stStatus = DadosVoucher[0].STCANCELADO == 'True' && (DadosVoucher[0].STSTATUS !== 'NEGADO' ||  DadosVoucher[0].STSTATUS !== 'CANCELADO') ? 'CANCELADO' : DadosVoucher[0].STSTATUS;
            throw {
                message: `ACESSO NEGADO! Não é Permitida a Impressão De Voucher Com Status: ${stStatus}!`
            }
        }
    }
    
    fnAtualizaQtdImpressaoVoucher(IDVOUCHER, dataFunc[0].IDFUNCIONARIO);
    
    return {
        data: dataFunc
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ error : e.message }));
    $.response.status = 400;
}