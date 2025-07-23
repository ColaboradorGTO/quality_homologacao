let dbNameSAP = "SBO_GTO_PRD";
let filePath = "quality.concentrador.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libValidaIE = $.import(`${filePath}.service-layer.libs`, "validador-inscricao-estadual");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

let conn;

function successLogIntegracaoCliente(idCliente, cardCode){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME".CLIENTE
        SET 
            ERRORLOGSAP = null,
            STATUALIZARCADASTROSAP = 'False',
            IDCLIENTESAP = ?
        WHERE 
            IDCLIENTE = ?
    `;

	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, cardCode);
	pStmtUpdate.setInt(2, Number(idCliente));
	pStmtUpdate.execute();
	pStmtUpdate.close();
	
	conn.commit();
	
	return true;
}

function errorLogIntegracaoCliente(idCliente, msgError){
    let queryUpdate = `
        UPDATE
            "VAR_DB_NAME".CLIENTE
        SET 
            ERRORLOGSAP = ?
        WHERE 
            IDCLIENTE = ?
    `;

	let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));

	pStmtUpdate.setString(1, String(msgError));
	pStmtUpdate.setInt(2, Number(idCliente));
	pStmtUpdate.execute();
	pStmtUpdate.close();
	
	conn.commit();
}

function PatchSl(data, session, dadosCliente) {
    let { IDCLIENTE, IDCLIENTESAP, NUCPFCNPJ } =  dadosCliente;
    let response = slApi.patch(`/BusinessPartners('${IDCLIENTESAP}')`, data, session);
    
    //let response = slApi.testget(`/BusinessPartners('${IDCLIENTESAP}')`, session);
    //return {response: JSON.parse(response.body.asString())}
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        if(response.error){
            let msgReturnError = translate.traduzirTexto(response.error.message.value);
            errorLogIntegracaoCliente(IDCLIENTE, msgReturnError);
            
        }
        
        return false;
    }
    
    if(fnValidaIntegracao(dadosCliente)){
        return successLogIntegracaoCliente(IDCLIENTE, IDCLIENTESAP);
    }
}

function fnValidarCPF(cpf) {
    cpf = String(cpf).replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }

    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }

    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.charAt(10))) return false;

    return true;
}

function fnValidarCNPJ(cnpj) {
    cnpj = String(cnpj).replace(/\D/g, '');

    if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
        return false;
    }

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
}

function fnValidarDadosFiscaisCliente(dadosCliente){
    let {IDCLIENTE, NUCPFCNPJ, NURGINSCESTADUAL, IDINDICACAOIE, TPCLIENTE, SGUF} = dadosCliente || false;
    let msgError = '';
    
    if(NUCPFCNPJ){
        if(TPCLIENTE){
            if(Number(IDINDICACAOIE)){
                if(TPCLIENTE !== 'FISICA' && TPCLIENTE !== 'FISÍCA'){
                    if(!fnValidarCNPJ(NUCPFCNPJ)){
                        msgError += 'CNPJ INVALIDO ';
                    }
                    
                    if(NURGINSCESTADUAL){
                        if(IDINDICACAOIE !== 2){
                            if(NURGINSCESTADUAL !== 'ISENTO'){
                                if(!libValidaIE.validarInscricaoEstadual(NURGINSCESTADUAL, SGUF)){
                                    msgError += 'INSCRIÇÃO ESTADUAL INVALIDA ';
                                }
                            } else {
                                msgError += 'IDINDICACAOIE NÃO CONDIZ COM A INSCRIÇÃO ESTADUAL';
                            }
                        }
                    } else {
                        msgError += 'CAMPO NURGINSCESTADUAL NÃO DEFINIDO ';
                    }
                } else{
                    if(!fnValidarCPF(NUCPFCNPJ)){
                        msgError = 'CPF INVALIDO';
                    }
                }
            } else {
                msgError = 'CAMPO IDINDICACAOIE NÃO DEFINIDO';
            }
        } else {
            msgError = 'CAMPO TPCLIENTE NÃO DEFINIDO';
        }
    } else {
        msgError += 'CAMPO NUCPFCNPJ NÃO PREENCHIDO';
    }
    
    if(msgError){
        errorLogIntegracaoCliente(IDCLIENTE, msgError);
        
        return false;
    }
    
    return true;
}

function fnFormataCpfOrCnpj(cpfOrCnpj){
    cpfOrCnpj = String(cpfOrCnpj).replace(/\D/g, '');

    if (cpfOrCnpj.length > 11) {
        cpfOrCnpj = cpfOrCnpj.replace(/^(\d{2})(\d)/, "$1.$2");
        cpfOrCnpj = cpfOrCnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        cpfOrCnpj = cpfOrCnpj.replace(/\.(\d{3})(\d)/, ".$1/$2");
        cpfOrCnpj = cpfOrCnpj.replace(/(\d{4})(\d)/, "$1-$2");
    } else{
        cpfOrCnpj = cpfOrCnpj.replace(/(\d{3})(\d)/, "$1.$2");
        cpfOrCnpj = cpfOrCnpj.replace(/(\d{3})(\d)/, "$1.$2");
        cpfOrCnpj = cpfOrCnpj.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    return cpfOrCnpj;
}

function fnValidaIntegracao(dadosCliente){
    let { IDCLIENTESAP, NUCPFCNPJ } = dadosCliente || false; 
    
    let queryVerificaIntegracao = `
        SELECT
            FIRST_VALUE(O."CardCode" ORDER BY O."CardCode" DESC) AS CARDCODESAP
        FROM
            ${dbNameSAP}.OCRD O
        INNER JOIN 
            ${dbNameSAP}.CRD7 C ON O."CardCode" = C."CardCode" 
        WHERE
            O."CardType" = 'C'
            AND O."CardCode" = '${IDCLIENTESAP}'
            AND (REPLACE_REGEXPR('[^[:alnum:]]' IN "TaxId4" WITH '') = '${NUCPFCNPJ}'
                OR
            REPLACE_REGEXPR('[^[:alnum:]]' IN "TaxId0" WITH '') = '${NUCPFCNPJ}')
            AND 1 = ?
    `;
    
    if(!IDCLIENTESAP || !NUCPFCNPJ){
        return false;
    }
    
    let regClienteSap = api.sqlQuery(queryVerificaIntegracao, 1);
    
    if(regClienteSap.length > 0){
        return true;
    }
    
    return false;
}

function fnObterEnderecosCliente(objCliente, idEmpresa){
    let registro = objCliente;
    let { IDCLIENTESAP, IDINDICACAOIE, NUCPFCNPJ } = registro;
    
    if(idEmpresa){
        let queryEnderecoLoja = `
            SELECT
                TRIM(NUCEP) AS NUCEP,
                TRIM(UPPER(EENDERECO)) AS EENDERECO,
                TRIM(UPPER(EBAIRRO)) AS EBAIRRO,
                TRIM(UPPER(ECIDADE)) AS ECIDADE,
                TRIM(UPPER(SGUF)) AS SGUF,
                TRIM(UPPER(ECOMPLEMENTO)) AS ECOMPLEMENTO,
                'SN' AS NUENDERECO
            FROM 
                "VAR_DB_NAME".EMPRESA
            WHERE 
                IDEMPRESA = ?
        `;
        
        let regEnderecoLoja = api.sqlQuery(queryEnderecoLoja, idEmpresa);
        
        if(regEnderecoLoja.length){
            registro = regEnderecoLoja[0];
        }
    }
    
    if(NUCPFCNPJ.length == 11){
        IDINDICACAOIE = registro.SGUF == 'DF' ? 2 : 9;
    }
    
    let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE UPPER("Name") = '${registro.ECIDADE}' AND "State" = ?`, registro.SGUF);
    
    let enderecosCliente = [
        {
            "BPCode": IDCLIENTESAP,
            "RowNum": 0,
            "AddressName": "COBRANCA", // fixo
            "Street": registro.EENDERECO, // nome da rua
            "Block": (registro.EBAIRRO || "NI"), // bairro
            "ZipCode": registro.NUCEP, // CEP
            "City": registro.ECIDADE, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": registro.SGUF, // preencher conforme estado
            "BuildingFloorRoom": (registro.ECOMPLEMENTO || "SN"), // complemento do endereço
            "AddressType": "bo_BillTo", // fixo
            "StreetNo": (registro.NUENDERECO || "SN"), // numero da casa
            "U_SKILL_indIEDest": IDINDICACAOIE  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        },
        {
            "BPCode": IDCLIENTESAP,
            "RowNum": 1,
           "AddressName": "ENTREGA", // fixo
            "Street": registro.EENDERECO, // nome da rua
            "Block": (registro.EBAIRRO || "NI"), // bairro
            "ZipCode": registro.NUCEP, // CEP
            "City": registro.ECIDADE, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": registro.SGUF, // preencher conforme estado
            "BuildingFloorRoom": (registro.ECOMPLEMENTO || "SN"), // complemento do endereço
            "AddressType": "bo_ShipTo", // fixo
            "StreetNo": (registro.NUENDERECO || "SN"), // numero da casa
            "U_SKILL_indIEDest": IDINDICACAOIE  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        }
    ];
    
    return enderecosCliente;
}

function executeAtualizarDadosClienteIntegrado(idCliente, idEmpresa) {
    let stMsgRetorno = $.request.parameters.get("stMsgRetorno");
    
    let queryCliente = `
        SELECT
            TBC.IDCLIENTE,
            TBC.IDCLIENTESAP,
            TBC.TPCLIENTE,
            TBC.NUCPFCNPJ,
            TBC.DSNOMERAZAOSOCIAL,
            IFNULL(TBC.DSAPELIDONOMEFANTASIA, TBC.DSNOMERAZAOSOCIAL) AS DSAPELIDONOMEFANTASIA,
            IFNULL(TBC.NUTELCOMERCIAL, TBC.NUTELCELULAR) AS NUTELCOMERCIAL,
            IFNULL(TBC.NUTELCELULAR, '') AS NUTELCELULAR,
            IFNULL(TBC.FONECONTATOCLIENTE01, TBC.NUTELCELULAR) AS FONECONTATOCLIENTE01,
            IFNULL(TBC.FONECONTATOCLIENTE01, TBC.NUTELCELULAR) AS FONECONTATOCLIENTE01,
            IFNULL(TBC.EEMAIL, '@') AS EEMAIL,
            IFNULL(TBC.NURGINSCESTADUAL,'') AS NURGINSCESTADUAL, 
            TBC.IDINDICACAOIE,
            TBC.DSINDICACAOIE,
            TBC.NUCEP,
            TRIM(UPPER(IFNULL(TBC.EENDERECO, 'SEM ENDERECO'))) AS EENDERECO,
            TRIM(UPPER(IFNULL(TBC.EBAIRRO, 'NI'))) AS EBAIRRO,
            TRIM(UPPER(TBC.ECIDADE)) AS ECIDADE,
            TRIM(UPPER(TBC.SGUF)) AS SGUF,
            TRIM(UPPER(TBC.ECOMPLEMENTO)) AS ECOMPLEMENTO,
            TRIM(UPPER(IFNULL(TBC.NUENDERECO, 'SN'))) AS NUENDERECO
        FROM
            "VAR_DB_NAME".CLIENTE TBC
        WHERE
            TBC.IDCLIENTE = ?
    `;

    let regCliente = api.sqlQuery(queryCliente, idCliente);
    
    if(regCliente.length){
        let session;
        let registro = regCliente[0];
        
        conn = $.db.getConnection();
        
        if(fnValidarDadosFiscaisCliente(registro) == true){
            
            if(fnValidaIntegracao(registro) == true){
                session = slApi.loginServiceLayer(true);
                
                slApi.loginServiceLayer(true);
                
                let dadosCliente = {
                   "Series": 70, // fixo
                   "CardName": registro.DSNOMERAZAOSOCIAL, // razão social 
                   "CardForeignName": registro.DSAPELIDONOMEFANTASIA, // nome fantasia
                    "CardType": "cCustomer", // "cCustomer" para cliente e "cSupplier" para fornecedor
                    "Phone1": (registro.NUTELCOMERCIAL || registro.NUTELCELULAR), //fone 1
                    //"Phone2": (registro.FONECONTATOCLIENTE01 || registro.NUTELCELULAR), // fone 2
                    "Cellular": registro.NUTELCELULAR, // celular
                    "EmailAddress": (registro.EEMAIL || '@'), // email
                    "BPAddresses": fnObterEnderecosCliente(registro, idEmpresa),
                    "BPFiscalTaxIDCollection": [
                        {
                            "BPCode": registro.IDCLIENTESAP,
                            "TaxId0": (registro.TPCLIENTE == 'JURIDICA' ? fnFormataCpfOrCnpj(registro.NUCPFCNPJ) : ''), // CNPJ caso PJ
                            "TaxId1": (registro.NURGINSCESTADUAL || 'ISENTO'), // Inscrição estadual, caso tenha, se não escrever a palavra Isento 
                            "TaxId4": (registro.TPCLIENTE == 'FISICA' ? fnFormataCpfOrCnpj(registro.NUCPFCNPJ) : ''), // CPF caso PF
                        }
                    ]
                }
                
                let respIntegracao = PatchSl(dadosCliente, session, registro);
                //return respIntegracao
                
                if(!respIntegracao){
                    if(stMsgRetorno){
                        return {
                            msg: "Cliente não atualizado, erro ao tentar atualizar, verifique o campo ERRORLOGSAP!"
                        }
                    }
                }
                
            } else {
                if(stMsgRetorno){
                    return {
                        msg: "Clientes não atualizado, integre o cliente primeiro e tente novamente!"
                    }
                }
            }
        } else {
            if(stMsgRetorno){
                return {
                    msg: "Cliente não atualizado, dados fiscais inválidos, verifique o campo ERRORLOGSAP!"
                }
            }
        }
     
        conn.close();
       
    }
    
    if(stMsgRetorno){
        return {
            msg: "Clientes atualizado com sucesso!"
        }
    }
    
    return true;
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ($.request.method) {
            
            //Handle your POST calls here
            case $.net.http.POST:
            var id = $.request.parameters.get("idCliente");
            var idEmpresa = $.request.parameters.get("idEmpresa");
            var docReturn = executeAtualizarDadosClienteIntegrado(id, idEmpresa);
            
            $.response.setBody(JSON.stringify(docReturn));
            break;
        }
        
    } catch (e) {
        var detalheError = e.stack.split('\n');
        
        detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
        
        if(detalheError){
            detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
        }
        
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({
            message: e.message,
            detalheError
        }));
        $.response.status = 400;
    }
}