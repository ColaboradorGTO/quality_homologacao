var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString());
    let diferencaEmDias;
    let { MATRICULA, SENHA, IDGRUPOEMPRESARIAL, IDEMPRESALOGADA, IDVENDA, STTIPOTROCA } = bodyJson || false;
    
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
    
    let funcAutorizadasCreateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasCreate60Ate180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
    ];
    
    let funcAutorizadasCreateNaFCAte180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
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
    
    if(!IDEMPRESALOGADA) {
        throw {
            message: 'A identificação de Empresa Logada é uma informação obrigatória'
        }
    }
    
    if(!IDGRUPOEMPRESARIAL) {
        throw {
            message: 'A identificação do Grupo Empresarial é uma informação obrigatória'
        }
    }
    
    if(!IDVENDA) {
        throw {
            message: 'A identificação da Venda é uma informação obrigatória'
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
    
    let queryVenda = `
        SELECT
            TBV.DTHORAFECHAMENTO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDEMPRESA
        FROM
            "VAR_DB_NAME".VENDA TBV
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            TBV.IDVENDA = ?
            AND TBV.STCANCELADO = 'False'
    `;
    
    let queryEmpresaLogada = `
        SELECT
            TBE.IDEMPRESA,
            TBE.IDGRUPOEMPRESARIAL
        FROM
            "VAR_DB_NAME".EMPRESA TBE
        WHERE
            TBE.IDEMPRESA = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, SENHA);
    let dataVenda = api.sqlQuery(queryVenda, IDVENDA);
    let dataEmpresaLogada = api.sqlQuery(queryEmpresaLogada, IDEMPRESALOGADA);
    
    if(!dataEmpresaLogada.length){
        throw {
            message: 'Empresa do Usuario Não Encontrada!'
        }
    }
    
    if(!dataVenda.length){
        throw {
            message: 'Venda Não Localizada'
        }
    }
    
    if(!dataFunc.length){
       throw {
            message: 'Matricula ou senha inválidos!'
       }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    if(IDGRUPOEMPRESARIAL !== dataVenda[0].IDGRUPOEMPRESARIAL){
        throw {
            message: 'ACESSO NEGADO! Esta Venda Não Pertence a Nenhuma Loja do Grupo!'
        }
    }
    
    if(IDGRUPOEMPRESARIAL !== dataEmpresaLogada[0].IDGRUPOEMPRESARIAL){
        throw {
            message: 'ACESSO NEGADO! Grupo Empresarial da Loja Divergente, Entre Em Contato Com o Suporte!'
        }
    }
    
    let dataHoraVenda = new Date(dataVenda[0].DTHORAFECHAMENTO);
    let dataHoraAtual = new Date();
    
    dataHoraVenda.setUTCHours(0, 0, 0, 0);
    dataHoraAtual.setUTCHours(0, 0, 0, 0);
    
    diferencaEmDias = Math.ceil(Math.abs(dataHoraAtual - dataHoraVenda) / (1000 * 60 * 60 * 24));

    if(diferencaEmDias > 180){
        throw {
            message: `ACESSO NEGADO! Venda fora do Prazo de Troca! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
        }
    }
    
    if(STTIPOTROCA == 'DEFEITO' && diferencaEmDias > 90){
        throw {
            message: `ACESSO NEGADO! Venda fora do Prazo de Troca do Tipo Defeito! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
        }
    }

    if(dataFunc[0].DSFUNCAO.trim() !== 'TI'){
        
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
        
        if(diferencaEmDias <= 32 && !funcAutorizadasCreateAte32Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
            throw {
                message: `Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
            }
        }
        
        if(STTIPOTROCA !== 'DEFEITO'){
            
            if(diferencaEmDias > 32 && !funcAutorizadasCreate60Ate180Dias.includes(dataFunc[0].DSFUNCAO.trim())){
                throw {
                    message: `Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
                }
            }
        }
        
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasCreateNaFCAte180Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
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