let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";

let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer.devolucao`, "api");
let libValidaIE = $.import(`${filePath}.service-layer.libs`, "validador-inscricao-estadual");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");
let errorLib = $.import(`${filePath}.service-layer.common`, "error");

let conn;

function postSl(data, session, dadosCliente) {
    let { IDCLIENTE, NUCPFCNPJ } =  dadosCliente;
    let response = slApi.post('/BusinessPartners',data,session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar o clinte';
        errorLogIntegracaoCliente(IDCLIENTE, msgReturnError);
        
        return false;
    }
    
    return fnValidaIntegracao(IDCLIENTE, NUCPFCNPJ);
}

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

function fnValidaIntegracao(idCliente, cpfOrCnpjCliente){
    let queryVerificaIntegracao = `
        SELECT
            FIRST_VALUE(O."CardCode" ORDER BY O."CardCode" DESC) AS CARDCODESAP
        FROM
            ${dbNameSAP}.OCRD O
        INNER JOIN 
            ${dbNameSAP}.CRD7 C ON O."CardCode" = C."CardCode" 
        WHERE
            O."CardType" = 'C'
            AND (REPLACE_REGEXPR('[^[:alnum:]]' IN "TaxId4" WITH '') = '${cpfOrCnpjCliente}'
                OR
            REPLACE_REGEXPR('[^[:alnum:]]' IN "TaxId0" WITH '') = '${cpfOrCnpjCliente}')
            AND 1 = ?
    `;
    
    let regClienteSap = api.sqlQuery(queryVerificaIntegracao, 1);
    
    if(regClienteSap.length){
        successLogIntegracaoCliente(idCliente, regClienteSap[0].CARDCODESAP);
        
        return true;
    }
    
    return false;
}

function fnObterEnderecosCliente(registro){
    let { IDCLIENTE, IDINDICACAOIE, NUCPFCNPJ } = registro;
    
    if(NUCPFCNPJ.length == 11){
        IDINDICACAOIE = registro.SGUF == 'DF' ? 2 : 9;
    }
    
    let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE UPPER("Name") = ? AND UPPER("State") = '${registro.SGUF}' `, registro.ECIDADE);
    
    if(!regAbsId.length){
        errorLogIntegracaoCliente(IDCLIENTE, 'ID da Cidade Não Localizado, Verifique os Dados de Endereço e Tente Novamente');
        
        return null;
    }
    
    let enderecosCliente = [
        {
            "AddressName": "COBRANCA", // fixo
            "Street": (registro.EENDERECO || "NI"), // nome da rua
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
           "AddressName": "ENTREGA", // fixo
            "Street": (registro.EENDERECO || "NI"), // nome da rua
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

function executeIntegrarClienteDevolucao(connDB, session, idVoucher, stMsgRetorno) {
    let queryCliente = `
        SELECT TOP 200 DISTINCT
            TBR.IDVOUCHER,
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
            TRIM(UPPER(IFNULL(TBC.EENDERECO, 'NI'))) AS EENDERECO,
            TRIM(UPPER(IFNULL(TBC.EBAIRRO, 'NI'))) AS EBAIRRO,
            TRIM(UPPER(TBC.ECIDADE)) AS ECIDADE,
            TRIM(UPPER(TBC.SGUF)) AS SGUF,
            TRIM(UPPER(TBC.ECOMPLEMENTO)) AS ECOMPLEMENTO,
            TRIM(UPPER(IFNULL(TBC.NUENDERECO, 'SN'))) AS NUENDERECO
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        INNER JOIN "VAR_DB_NAME".CLIENTE TBC ON 
            TBR.IDCLIENTE = TBC.IDCLIENTE
        WHERE
            TBR.STTIPOTROCA <> 'TROCO'
            AND TBR.STCANCELADO = 'False'
            AND (TBR.STREFDEVOLUCAOSAP = 'False' OR TBR.STDEVOLUCAOSAP = 'False')
            AND IFNULL(TBC.IDCLIENTESAP, '') = ''
            AND LENGTH(TBC.NUCPFCNPJ) = 11
            AND UPPER(TBC.TPCLIENTE) = 'FISICA'
            AND 1 = ?
    `;
    
    if(idVoucher){
        queryCliente += ` AND TBR.IDVOUCHER = '${idVoucher}' `;
    } else {
        queryCliente += `
            AND TO_DATE(TBR.DTINVOUCHER) >= '2025-01-01'
            AND ABS(DAYS_BETWEEN(CURRENT_DATE, TO_DATE(TBR.DTINVOUCHER))) > 3
        `;
    }
    
    queryCliente += `
        ORDER BY
            TBR.IDVOUCHER 
    `;

    let regCliente = api.sqlQuery(queryCliente, 1);
    
    if(regCliente.length){
        conn = connDB;
        
        for (let i = 0; i < regCliente.length; i++) {
            let registro = regCliente[i];
            
            if(fnValidarDadosFiscaisCliente(registro) == true){
                
                if(registro.DSNOMERAZAOSOCIAL.length > 5){
                    
                    if(!fnValidaIntegracao(registro.IDCLIENTE, registro.NUCPFCNPJ)){
                        
                        let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE UPPER("Name") = ? AND "State" = '${registro.SGUF}'`, registro.ECIDADE);
                        
                        if(regAbsId.length > 0){
                            let telCliente = (registro.NUTELCOMERCIAL || registro.NUTELCELULAR)
                            
                            telCliente = (!telCliente || telCliente.length < 10) ? '0000000000' : telCliente
                            
                            let dadosCliente = {
                               "Series": 70, // fixo
                               "CardName": registro.DSNOMERAZAOSOCIAL, // razão social 
                               "CardForeignName": registro.DSAPELIDONOMEFANTASIA, // nome fantasia
                                "CardType": "cCustomer", // "cCustomer" para cliente e "cSupplier" para fornecedor
                                "Phone1": telCliente, //fone 1
                                //"Phone2": (registro.FONECONTATOCLIENTE01 || registro.NUTELCELULAR), // fone 2
                                "Cellular": (registro.NUTELCELULAR || ''), // celular
                                "EmailAddress": (registro.EEMAIL || '@'), // email
                                "BPAddresses": fnObterEnderecosCliente(registro),
                                "BPFiscalTaxIDCollection": [
                                    {
                                        "TaxId0": (registro.TPCLIENTE == 'JURIDICA' ? fnFormataCpfOrCnpj(registro.NUCPFCNPJ) : ''), // CNPJ caso PJ
                                        "TaxId1": (registro.NURGINSCESTADUAL || 'ISENTO'), // Inscrição estadual, caso tenha, se não escrever a palavra Isento 
                                        "TaxId4": (registro.TPCLIENTE == 'FISICA' ? fnFormataCpfOrCnpj(registro.NUCPFCNPJ) : ''), // CPF caso PF
                                    }
                                ]
                            }
                            
                            if(dadosCliente["BPAddresses"] == null){
                                continue;
                            }
                            
                            let respIntegracao = postSl(dadosCliente, session, registro);
                            
                            if(!respIntegracao){
                                if(stMsgRetorno){
                                    return {
                                        msg: "Cliente não integrado, erro ao tentar integrar o cliente, verifique o campo ERRORLOGSAP!"
                                    }
                                }
                            }
                        } else {
                            errorLogIntegracaoCliente(registro.IDCLIENTE, 'Erro na UF ou Cidade do Cliente, verifique e tente novamente');
                            
                            if(stMsgRetorno){
                                return {
                                    msg: "Cliente não integrado, erro ao tentar integrar o cliente, verifique o campo ERRORLOGSAP!"
                                }
                            }
                        }
                        
                    } else {
                        if(stMsgRetorno){
                            return {
                                msg: "Clientes já integrado!"
                            }
                        }
                    }
                } else {
                    errorLogIntegracaoCliente(registro.IDCLIENTE, 'Erro nome do cliente muito curto ou incompleto ou sem sobrenome, verifique e tente novamente');
                    
                    if(stMsgRetorno){
                        return {
                            msg: "Cliente não integrado, erro ao tentar integrar o cliente, verifique o campo ERRORLOGSAP!"
                        }
                    }
                }
                
            } else {
                if(stMsgRetorno){
                    return {
                        msg: "Cliente não integrado, dados fiscais inválidos, verifique o campo ERRORLOGSAP!"
                    }
                }
            }
        }
        
    }
    
    if(stMsgRetorno){
        return {
            msg: "Clientes integrados com sucesso!"
        }
    }
    
}