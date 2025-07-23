var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var common = $.import("quality.concentrador_homologacao.api.common", "common");

let tpFuncoesAutorizadas = ["TI", "GERENTE", "SUB GERENTE"];
let tpFuncoesAdmin = ["TI"];

function verificaVoucherAlteraStatus(idVoucher, funcEmpresa, funcFuncao){
    let query = `SELECT
                    *
                FROM
                	"VAR_DB_NAME".RESUMOVOUCHER
                WHERE
                	IDVOUCHER = '${idVoucher}'
                	AND 1 = ? `;
    
    let data = api.sqlQuery(query,  1);
    
    if(data[0].IDEMPRESAORIGEM == funcEmpresa || tpFuncoesAdmin.includes(funcFuncao)){
        return true;
    }
    
    return false;
}

function verificaVoucherImpressao(idVoucher, funcGrupoEmpresa, funcFuncao){
    let query = `SELECT
                    *
                FROM
                	"VAR_DB_NAME".RESUMOVOUCHER
                WHERE
                	IDVOUCHER = '${idVoucher}'
                	AND 1 = ? `;
    
    let data = api.sqlQuery(query, 1);
    
    if(data[0].IDGRUPOEMPRESARIAL == funcGrupoEmpresa || tpFuncoesAdmin.includes(funcFuncao)){
        return true;
    }
    
    return false;
}

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    if(!bodyJson.MATRICULA) {
        throw 'Usuario é uma informação obrigatório';
    }
    
    if(!bodyJson.SENHA) {
        throw 'Senha é uma informação obrigatório';
    }
    
    let query = `SELECT
                	tbf.IDFUNCIONARIO,
                	tbf.IDGRUPOEMPRESARIAL,
                	tbf.IDSUBGRUPOEMPRESARIAL,
                	tbf.IDEMPRESA,
                	tbf.NOFUNCIONARIO,
                	tbf.IDPERFIL,
                	tbf.DSFUNCAO,
                	tbf.STATIVO,
                	tbe.NOFANTASIA,
                	tbe.ID_LISTA_LOJA
                FROM
                	FUNCIONARIO tbf
                INNER JOIN EMPRESA tbe ON
                	tbf.IDEMPRESA = tbe.IDEMPRESA
                WHERE
                	tbf.NOLOGIN = '${bodyJson.MATRICULA}'
                	AND tbf.PWSENHA = ?
                	AND tbf.STATIVO = 'True' `;
    
    let data = api.sqlQuery(query, bodyJson.SENHA);
    
   if (data.length){
       let funcGrupoEmpresa = data[0].IDGRUPOEMPRESARIAL;
       let funcEmpresa = data[0].IDEMPRESA;
       let funcFuncao = data[0].DSFUNCAO.toUpperCase();
       let stPrint = bodyJson.STPRINT;
       let stAlterStatus = autAlterStatus(bodyJson.IDVOUCHER, funcEmpresa, funcFuncao);
       let stPrintVoucher = autPrintVoucher(bodyJson.IDVOUCHER, funcGrupoEmpresa, funcFuncao);
       
       data = Object.assign({}, data[0]);
       
        if(!stAlterStatus){
            return {
                type: 'warning',
                msg: "Usuário não Autorizado, este usuário não pertence a esta loja"
            };
        } else if(tpFuncoesAutorizadas.includes(funcFuncao)){
            data.AUTH = true;
            data.AUTHADMINVOUCHER = tpFuncoesAdmin.includes(funcFuncao);
            
            return {
                type: 'success',
                data
            }
        } else {
            return { 
                type: 'warning',
                msg: "Usuário não Autorizado, Solicite ao Gerente ou Lider de Loja"
            };
        }
    } else{
        return {
            type: 'warning',
            msg: "Matricula ou senha inválido" 
        };
    }
}

try {
    $.response.contentType = "application/json";
    $.response.status = $.net.http.OK;

    switch ( $.request.method ) {

        case $.net.http.POST:
            $.response.setBody(JSON.stringify(fnHandlePost()));
            break;     
        default:
            break;
    }
} catch (err) {
    common.setResponseError(err);
}