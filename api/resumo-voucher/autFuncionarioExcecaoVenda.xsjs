var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var common = $.import("quality.concentrador_homologacao.api.common", "common");

function fnHandlePost() {
    
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(!bodyJson.MATRICULA) {
        throw 'Usuario é uma informação obrigatório';
    }
    
    if(!bodyJson.SENHA) {
        throw 'Senha é uma informação obrigatório';
    }
    
    var query = `SELECT
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
                	AND tbf.STATIVO = 'True'`;
    
    var data = api.sqlQuery(query, String(bodyJson.SENHA));
    
    if(data.length){
        if(data[0]["DSFUNCAO"].toUpperCase() == "TI"){
            return {
                data
            }
        } else {
            //$.response.status = $.net.http.UNAUTHORIZED;
            return { msg: "Usuário não Autorizado."};
        }
    } else{
        return { msg: "Usuário ou senha inválido." };
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