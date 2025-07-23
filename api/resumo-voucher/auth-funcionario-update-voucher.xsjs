var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    let { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVOUCHER, STSTATUS } = bodyJson || false;
    let diferencaEmDias = 0;
    
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
    
    let statusVoucherNaoAutorizados = [
        'NOVO',
        'LIBERADO PARA O CLIENTE',
        'FINALIZADO',
        'NEGADO',
        'CANCELADO',
    ]
    
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
            TBR.IDRESUMOVENDAWEB,
            (SELECT DTHORAFECHAMENTO FROM "VAR_DB_NAME".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.STSTATUS
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, SENHA);
    let DadosVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
    
    if(!DadosVoucher.length){
        throw {
            message: 'Venda Não Localizada'
        }
    }

    if(!dataFunc.length){
        throw {
            message: 'Usuário inválido!'
        }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    let dataHoraVenda = DadosVoucher[0].DTHORAFECHAMENTO ? new Date(DadosVoucher[0].DTHORAFECHAMENTO) : new Date();
    let dataHoraAtual = new Date();
    
    dataHoraVenda.setUTCHours(0, 0, 0, 0);
    dataHoraAtual.setUTCHours(0, 0, 0, 0);
    
    diferencaEmDias = Math.ceil(Math.abs(dataHoraAtual - dataHoraVenda) / (1000 * 60 * 60 * 24));
    
    if(diferencaEmDias > 180){
        throw {
            message: `ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}`
        }
    }
    
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
        }

        if(diferencaEmDias <= 32 && !funcAutorizadasUpdateAte32Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja !'
            }
        }
        
        if(diferencaEmDias > 32 && diferencaEmDias <= 60 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
            }
        }
        
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(diferencaEmDias > 60 && !funcAutorizadasUpdateAte180Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com a Supervisão!'
            }
        }
    }
    
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