var hdb = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var aStore = new $.security.Store("localStore.xssecurestore");

function bufferToString(buffer) {
    return String.fromCharCode.apply(null, Array.from(new Uint16Array(buffer)));
}

function stringToBuffer(value) {
    let buffer = new ArrayBuffer(value.length * 2); // 2 bytes per char
    let view = new Uint16Array(buffer);
    for (let i = 0, length = value.length; i < length; i++) {
        view[i] = value.charCodeAt(i);
    }
    return buffer;
}

function authenticate(role, userName, password) {
    
    var query = "SELECT tbf.IDFUNCIONARIO, tbe.IDGRUPOEMPRESARIAL, tbe.IDSUBGRUPOEMPRESARIAL, tbf.IDEMPRESA, tbf.NOFUNCIONARIO, tbf.IDPERFIL, tbf.STFATURAOT, tbf.DSFUNCAO, tbe.NOFANTASIA, tbe.ID_LISTA_LOJA, TO_NVARCHAR(ADD_SECONDS(CURRENT_UTCTIMESTAMP, -3 * 3600), 'DD/MM/YYYY HH24:MI:SS') AS DATAHORASESSAO FROM QUALITY_CONC_HML.FUNCIONARIO tbf INNER JOIN EMPRESA tbe ON tbf.IDEMPRESA = tbe.IDEMPRESA WHERE tbf.NOLOGIN = ? and tbf.PWSENHA = ? AND tbf.STATIVO=\'True\'";
    
    var data = hdb.sqlQueryTst(query, [userName, password]);
    
    if(!data.length)
    {
        return {
            error : true,
            msg : "Usuario ou Senha não são validos"
        };
    }
    
    let dataAtual = new Date();
    let dia = dataAtual.getDate();
    let mes = dataAtual.getMonth() + 1;
    let ano = dataAtual.getFullYear();

    // Formatar o dia e o mês para sempre ter dois dígitos
    if (dia < 10) {
      dia = '0' + dia;
    }
    if (mes < 10) {
      mes = '0' + mes;
    }

    let dataSessao = dia + '/' + mes + '/' + ano;

    var usuario = data[0];
    
    var token = $.util.createUuid() + '.' + $.util.createUuid();
    
    var userToken = {
        token : token,
        id : usuario.IDFUNCIONARIO,
        IDGRUPOEMPRESARIAL : usuario.IDGRUPOEMPRESARIAL,
        IDSUBGRUPOEMPRESARIAL: usuario.IDSUBGRUPOEMPRESARIAL,
        IDEMPRESA: usuario.IDEMPRESA,
        NOFUNCIONARIO: usuario.NOFUNCIONARIO,
        IDPERFIL: usuario.IDPERFIL,
        DSFUNCAO: usuario.DSFUNCAO,
        NOFANTASIA: usuario.NOFANTASIA,
        ID_LISTA_LOJA: usuario.ID_LISTA_LOJA,
        DATA_HORA_SESSAO: dataSessao,
        STFATURAOT: usuario.STFATURAOT
    };
    
    aStore.store({ name: token, value: JSON.stringify(userToken) });
    
    return userToken;
}

function get(token) {
    
    if(!token) {
        $.response.status = $.net.http.UNAUTHORIZED;
        throw "Usuário ou Token é requerido para conexão.";
    }
    
     var value = aStore.read({ name : token });
    
    return value;
}

function user() {
    
    var token = $.request.headers.get('api_token');
    
     var value = get(token);
    
    return value;
}

function check() {
    
    var token = $.request.headers.get('api_token');
    
    var value = get(token);
    
    if(!value) {
        $.response.status = $.net.http.UNAUTHORIZED;
        throw "Usuário ou Token e inválido.";
    }
    
    return value;
}
