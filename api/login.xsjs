var hdb = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var auth = $.import("quality.concentrador_homologacao.api.auth", "auth");
var common = $.import("quality.concentrador_homologacao.api.common", "common");

//Implementation of GET call
function fnHandleGet() {
    // var res = hdb.sqlQuery("SELECT COUNT(*) AS QTD FROM FUNCIONARIO WHERE 1 = ?", 1);
    
    var currentUser = auth.user();
    
	return currentUser;
}

//Implementation of PUT call
function fnHandlePut() {
    return {"myStatus":"success"};
}

function obterCodigoDeRetorno(modulo, user) {
    let arrayIdsEtiquetagem = [
        1457,
        1586
    ]
    
    let arrayDsFuncVouchers = [
        'TI',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ]
    
    switch(modulo.toUpperCase()) {
        case 'INFORMATICA' :
            
            if (user['DSFUNCAO'].substring(0,2) == 'TI' || user['DSFUNCAO'].substring(0,22) == 'Tecnico De Informatica') {
                return 100;
            }
            break;
             
        case 'GERENCIA' :
            
            if(user['DSFUNCAO'].substring(0,7) == 'Gerente' || user['DSFUNCAO'].substring(0,6) == 'Fiscal' || user['DSFUNCAO'].substring(0,11) == 'Sub Gerente' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 200;
            }
                
            break;
            
        case 'FINANCEIRO' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 300;
            }
            
            break;
            
        case 'ADMINISTRATIVO' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,9) == 'Prevencao' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,2)  == 'TI'|| user['DSFUNCAO'].substring(0,23)  == 'Coordenador Dept Fiscal'|| user['DSFUNCAO'].substring(0,22)  == 'Assistente Dept Fiscal' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras')
            {
                return 500;
            }
            
            break;
            
        case 'CONTABILIDADE' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 400;
            }
            
            break;
        
        case 'MARKETING' :
            
            if(user['DSFUNCAO'].substring(0,9) == 'Prevencao' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,9)  == 'Marketing')
            {
                return 600;
            }
            
            break;
            
        case 'COMERCIAL' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,9)  == 'Marketing' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras')
            {
                return 700;
            }
            
            break;
        
        case 'COMPRAS' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras')
            {
                return 800;
            }
            
            break;
        
        case 'CADASTROS' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,23)  == 'Pedido Compras')
            {
                return 900;
            }
            
            break;
            
        case 'EXPEDICAO' :
            return 1000;// DEFINICAO DE DSFUNCAO PARA BLOQUEIO 
           /* if(user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 1000;
            }*/
            
            //break;

        case 'COMPRASADM' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,23)  == 'Pedido Compras')
            {
                return 1100;
            }
            
            break;
            
        case 'ETIQUETAGEM' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || arrayIdsEtiquetagem.includes(user.id))
            {
                return 1200;
            }
            
            break;
        
        case 'CONFERENCIACEGA' :
            
            if(true || user['DSFUNCAO'].substring(0,2)  == 'TI' || user['IDEMPRESA'] == '101')
            {
                return 1300;
            }
            
            break;
            
        case 'VOUCHERS' :
            
           if(user['DSFUNCAO'].substring(0,7) == 'Gerente' || user['DSFUNCAO'].substring(0,6) == 'Fiscal' || user['DSFUNCAO'].substring(0,11) == 'Sub Gerente' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 1400;
            }
            
            break; 
            
        case 'ETIQUETAGEMFORNECEDOR' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 1500;
            }
            
            break;
        
        case 'RECEPCAOMALOTES' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return 1600;
            }
            
            break;
    }
    
    return 1;
    
}

function fnHandlePost() {
    
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(!bodyJson.usuario) {
        throw 'Usuario é uma informação obrigatório';
    }
    
    if(!bodyJson.senha) {
        throw 'Senha é uma informação obrigatório';
    }
    
    var user = auth.authenticate(bodyJson.role, bodyJson.usuario, bodyJson.senha);
    
    if(user.error) {
        $.response.status = $.net.http.UNAUTHORIZED;
        return { msg: "Usuário ou senha inválido." };
    }
    
    var codigoDeRetorno = obterCodigoDeRetorno(bodyJson.modulo, user);
    
    return {
        "code": codigoDeRetorno,
        // "body" : bodyJson,
        "user": user
    };
}

try {
    $.response.contentType = "application/json";
    $.response.status = $.net.http.OK;

    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            auth.check();
            $.response.setBody(JSON.stringify(fnHandleGet()));
            break;
        //Handle your PUT calls here
        case $.net.http.PUT:
            auth.check();
            $.response.setBody(JSON.stringify(fnHandlePut()));
            break;     
        //Handle your PUT calls here
        case $.net.http.POST:
            $.response.setBody(JSON.stringify(fnHandlePost()));
            break;     
        default:
            break;
    }
} catch (err) {
    common.setResponseError(err);
}