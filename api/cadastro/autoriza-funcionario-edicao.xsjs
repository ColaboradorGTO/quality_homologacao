var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandlePost() {
    let bodyJson = JSON.parse($.request.body.asString()); 
    let matricula = bodyJson.MATRICULA;
    let senha = bodyJson.SENHA;
    
    if(!matricula) {
        throw 'Usuario é uma informação obrigatório';
    }
    
    if(!senha) {
        throw 'Senha é uma informação obrigatório';
    }
    
    var query = `
        SELECT
            tbf.IDFUNCIONARIO
            ,tbf.IDGRUPOEMPRESARIAL
            ,tbf.IDSUBGRUPOEMPRESARIAL
            ,tbf.IDEMPRESA
            ,tbf.NOFUNCIONARIO
            ,tbf.IDPERFIL
            ,tbf.DSFUNCAO
            ,tbf.STATIVO
            ,tbe.NOFANTASIA
            ,tbe.ID_LISTA_LOJA
            ,tbf.STEDITCADPRODUTO
        FROM
            "VAR_DB_NAME".FUNCIONARIO tbf
        INNER JOIN "VAR_DB_NAME".EMPRESA tbe ON
            tbf.IDEMPRESA = tbe.IDEMPRESA
        WHERE
            tbf.NOLOGIN = '${matricula}'
            AND tbf.PWSENHA = ?
            AND tbf.STATIVO = 'True' 
    `;
    
    var data = api.sqlQuery(query, senha);
    
    if(data.length){
        if(data[0].STEDITCADPRODUTO == 'True'){
            return {
                "type": 'success',
                data
            }
        } else {
            return {
            "type": 'warning',
            "msg": "Usuário sem permissão!"
        } 
        }
    } else {
        
        return {
            "type": 'warning',
            "msg": "Usuário não encontrado!"
        }
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
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ data : '', err }));
}