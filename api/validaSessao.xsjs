var hdb = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var common = $.import("quality.concentrador_homologacao.api.common", "common");

function obterCodigoDeRetorno(modulo, user) {
    let arrayIdsEtiquetagem = [
        1457,
        1586,
        30440,
        30073,
        32686
    ];
    
    let arrayIdsComprasADM = [
        632,
        1459,
        22076,
        23065,
        2002,
        22894,
        2006,
        1492,
        30142,
        30514,
        1537
    ];
    
    let arrayDsFuncVouchers = [
        'TI',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ]
    
    let dsFuncao = user['DSFUNCAO'];
    
    if(dsFuncao.substring(0,20) == 'Analista De Rh Pleno' || dsFuncao.substring(0,16) == 'Assistente De Rh' || dsFuncao.substring(0,14) == 'Analista De Rh') {
        dsFuncao = 'RH';
    }
    
    switch(modulo.toUpperCase()) {
        case 'INFORMATICA' :
            
            if (user['DSFUNCAO'].substring(0,2) == 'TI' || user['DSFUNCAO'].substring(0,22) == 'Tecnico De Informatica') {
                return true;
            }
            break;
            
        case 'GERENCIA' :
            
            if(user['DSFUNCAO'].substring(0,7) == 'Gerente' || user['DSFUNCAO'].substring(0,6) == 'Fiscal' || user['DSFUNCAO'].substring(0,11) == 'Sub Gerente' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return true;
            }
                
            break;
            
        case 'FINANCEIRO' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI' || dsFuncao.substring(0,2)  == 'RH')
            {
                return true;
            }
            
            break;
            
        case 'ADMINISTRATIVO' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,9) == 'Prevencao' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,2)  == 'TI'|| user['DSFUNCAO'].substring(0,23)  == 'Coordenador Dept Fiscal'|| user['DSFUNCAO'].substring(0,22)  == 'Assistente Dept Fiscal' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras' || dsFuncao.substring(0,2)  == 'RH')
            {
                return true;
            }
            
            break;
            
        case 'CONTABILIDADE' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return true;
            }
            
            break;

        case 'MARKETING' :
            
            if(user['DSFUNCAO'].substring(0,9) == 'Prevencao' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,9)  == 'Marketing')
            {
                return true;
            }
            
            break;
            
        case 'COMERCIAL' :
            
            if(user['DSFUNCAO'].substring(0,10) == 'Financeiro' || user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,9)  == 'Marketing' || user['DSFUNCAO'].substring(0,10)  == 'Supervisor' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras')
            {
                return true;
            }
            
            break;

        case 'COMPRAS' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,14)  == 'Pedido Compras')
            {
                return true;
            }
            
            break;

        case 'CADASTROS' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].substring(0,23)  == 'Pedido Compras')
            {
                return true;
            }
            
            break;
            
        case 'EXPEDICAO' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI')
            {
                return true;
            }
            
            break;

        case 'COMPRASADM' :
            
            //if(user['DSFUNCAO'].substring(0,2)  == 'TI' ||(user['DSFUNCAO'].substring(0,23)  == 'Pedido Compras' && user['id'] == 632))
            if(arrayIdsComprasADM.includes(user['IDFUNCIONARIO']))
            {
                return true;
            }
            
            break;
        
        case 'CONFERENCIACEGA' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['IDEMPRESA'] == '101')
            {
                return true;
            }
            
            break;
     
        case 'ETIQUETAGEM' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || arrayIdsEtiquetagem.includes(user['IDFUNCIONARIO']))
            {
                return true;
            }
            
            break;
            
        case 'VOUCHERS' :
            
           if(arrayDsFuncVouchers.includes(user.DSFUNCAO.toUpperCase().trim()))
            {
                return true;
            }
            
            break; 
        
         case 'RECEPCAOMALOTES' :
            
            if(user['DSFUNCAO'].substring(0,2)  == 'TI' || user['DSFUNCAO'].trim()  == 'FINANCEIRO')
            {
                return true;
            }
            
            break;
    }
    
    return false;
    
}

function validaUsuario(modulo, user){
    let query = "SELECT tbf.IDSUBGRUPOEMPRESARIAL, tbf.DSFUNCAO, tbf.IDFUNCIONARIO FROM FUNCIONARIO tbf WHERE tbf.STATIVO=\'True\' AND tbf.IDFUNCIONARIO = ?";
    let dadosFunc = hdb.sqlQuery(query, user.id);
    
    if(dadosFunc.length > 0) {
        return obterCodigoDeRetorno(modulo, dadosFunc[0]);
    }
    return false;
    
}

function fnHandlePost() {
    
    var bodyJson = JSON.parse($.request.body.asString()); 
    var user = bodyJson.user;
    var codigoDeRetorno = validaUsuario(bodyJson.modulo, user);
    
    return {
        "auth": codigoDeRetorno,
        "obj": bodyJson
    };
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