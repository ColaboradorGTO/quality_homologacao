var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var common = $.import("quality.concentrador_homologacao.api.common", "common");

let msg = '';
let stWarning = false;
let authAdmVoucher = false;
let authAlter = false;
let authPrint = false;
let authView = false;
let stUserLojaDiferente = false;
let tpFuncoesAutorizadas = ["TI", "GERENTE", "SUB GERENTE"];
let tpFuncoesAdmin = ["TI"];
let stStatusAutorizadoAlter  = ["EM ANALISE", "NOVO", "LIBERADO PARA O CLIENTE"];
let stStatusAutorizadoPrint  = ["NOVO", "LIBERADO PARA O CLIENTE"];

function authManipulacaoVoucher(idVoucher, funcEmpresa, funcFuncao, funcGrupoEmpresa, action){
    let query = `SELECT
                    TBR.IDEMPRESAORIGEM,
                    TBE.IDGRUPOEMPRESARIAL,
                    TBR.STATIVO,
                    *
                FROM
                	"VAR_DB_NAME".RESUMOVOUCHER TBR
                INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
                    TBR.IDEMPRESAORIGEM = TBE.IDEMPRESA
                WHERE
                	TBR.IDVOUCHER = '${idVoucher}'
                	AND 1 = ? `;
    
    let data = api.sqlQuery(query,  1);
    
    if (data.length){
        let statusVoucher = data[0].STSTATUS ? data[0].STSTATUS.toUpperCase() : '';
        
        if(tpFuncoesAdmin.includes(funcFuncao)){
            return authAdmVoucher = true;
            
        } else {
            if(action == 'VIEW'){
                if(data[0].IDGRUPOEMPRESARIAL == funcGrupoEmpresa || data[0].IDEMPRESAORIGEM == funcEmpresa || data[0].IDEMPRESADESTINO == funcEmpresa){
                    return authView = true;
                }
            }
            
            if(action == 'ALTER'){
                if(data[0].IDEMPRESAORIGEM == funcEmpresa && tpFuncoesAutorizadas.includes(funcFuncao) && stStatusAutorizadoAlter.includes(statusVoucher)){
                   return authAlter = true;
                } else if(data[0].IDEMPRESAORIGEM != funcEmpresa){
                    stWarning = true;
                    return msg = "Usuário sem permissão! Usuário cadastrado em loja diferente da atual";
                }
            }
            
            if(action == 'PRINT'){
                if(data[0].IDGRUPOEMPRESARIAL == funcGrupoEmpresa && (stStatusAutorizadoPrint.includes(statusVoucher) || data[0].STATIVO == 'True')){
                    return authPrint = true;
                } else if(data[0].IDGRUPOEMPRESARIAL == funcGrupoEmpresa && (!stStatusAutorizadoPrint.includes(statusVoucher) || data[0].STATIVO != 'True')){
                    stWarning = true;
                    return msg = `Impressão não permitida! Voucher está com STATUS: ${statusVoucher}`
                }
            }
            
            stWarning = true;
            return msg = "Usuário sem permissão!"
        }
    }
    
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
       let idVoucher = bodyJson.IDVOUCHER;
       let action = bodyJson.ACTION;
      
        authManipulacaoVoucher(idVoucher, funcEmpresa, funcFuncao, funcGrupoEmpresa, action);
        
        data = Object.assign({}, data[0]);
        
        data.AUTHVIEW = authView;
        data.AUTHSTATUS = authAlter;
        data.AUTHPRINT = authPrint
        data.AUTHADMVOUCHER = authAdmVoucher
        data.USERLOJADIFERENTE = action;
        
        if(stWarning){
           return {
                type: 'warning',
                msg
            };
        }
        
        return {
            type: 'success',
            data 
        };
        
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