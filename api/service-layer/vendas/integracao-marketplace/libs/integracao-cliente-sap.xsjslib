let dbNameSAP = "SBO_GTO_TESTE4";
let filePath = "quality.concentrador_homologacao.api";
let api = $.import(`${filePath}.apiResponse`, "int_api");
let slApi = $.import(`${filePath}.service-layer`, "api");
let translate = $.import(`${filePath}.service-layer`, "traducao-texto");

function postSl(data, session) {
    let response = slApi.post('/BusinessPartners', data, session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar o cliente';
        
        return msgReturnError;
    }
    
    return true;
}

function ObterEnderecoCliente(dest, entrega){
    let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE 1 = ? and "IbgeCode" = '${entrega.cMun}' AND UPPER("State") = '${entrega.UF}'`, 1);
    
    if(!regAbsId.length){
        return false;
    }
    
    let enderecosCliente = [
        {
            "AddressName": "COBRANCA", // fixo
            "Street": (entrega.xLgr || "NI"), // nome da rua
            "Block": (entrega.xBairro || "NI"), // bairro
            "ZipCode": entrega.CEP, // CEP
            "City": entrega.xMun, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": entrega.UF, // preencher conforme estado
            "BuildingFloorRoom": (entrega.xCpl || "SN"), // complemento do endereço
            "AddressType": "bo_BillTo", // fixo
            "StreetNo": (entrega.nro || "SN"), // numero da casa
            "U_SKILL_indIEDest": dest.indIEDest  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        },
        {
            "AddressName": "ENTREGA", // fixo
            "Street": (entrega.xLgr || "NI"), // nome da rua
            "Block": (entrega.xBairro || "NI"), // bairro
            "ZipCode": entrega.CEP, // CEP
            "City": entrega.xMun, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": entrega.UF, // preencher conforme estado
            "BuildingFloorRoom": (entrega.xCpl || "SN"), // complemento do endereço
            "AddressType": "bo_ShipTo", // fixo
            "StreetNo": (entrega.nro || "SN"), // numero da casa
            "U_SKILL_indIEDest": dest.indIEDest  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        }
    ];
    
    return enderecosCliente;
}

function montarJsonCliente(dest, entrega) {
    let endereco = ObterEnderecoCliente(dest, entrega)
    if(!endereco) {
        return {
            ok: false,
            message: `ID da Cidade Não Localizado, Verifique os Dados de Endereço e Tente Novamente`
        };
    }
    
    let dadosCliente = {
        "Series": 70, // fixo
        "CardName": dest.xNome, // razão social 
        "CardForeignName": dest.xNome, // nome fantasia
        "CardType": "cCustomer", // "cCustomer" para cliente e "cSupplier" para fornecedor
        "Phone1": '99999999999', //fone 1
        //"Phone2": (registro.FONECONTATOCLIENTE01 || registro.NUTELCELULAR), // fone 2
        "Cellular": '', // celular
        "EmailAddress": '@', // email
        "BPAddresses": endereco,
        "BPFiscalTaxIDCollection": [
            {
                "TaxId0": (dest.CNPJ || ''), // CNPJ caso PJ
                "TaxId1": (dest.IE || 'ISENTO'), // Inscrição estadual, caso tenha, se não escrever a palavra Isento 
                "TaxId4": (dest.CPF || ''), // CPF caso PF
            }
        ]
    }
    
    return dadosCliente;
}

function integrarClienteSap (session, dest, entrega) {
    let dadosCliente = montarJsonCliente(dest, entrega);
    let respIntegracao = postSl(dadosCliente, session);
    
    if(respIntegracao == true) {
        let respValidarCliente = verificarClienteSap(dest);
        
        if(respValidarCliente.length) {
            return {
                ok: true,
                message: respValidarCliente
            };
        } else {
            return {
                ok: false,
                message: `Erro ao integrar o cliente!`
            };
        }
    } else { 
        return {
            ok: false,
            message: respIntegracao
        };
    }
}

function verificarClienteSap(dest){
    if(!dest.CPF && !dest.CNPJ) {
       return {
           ok: false,
           message: `Falta um CPF ou CNPJ`
       };
    }
    
    let query = `
        SELECT
        	A."CardCode"
        FROM
        	${dbNameSAP}.OCRD A
        INNER JOIN ${dbNameSAP}.CRD7 B ON
        	A."CardCode" = B."CardCode"  
        WHERE 
            1 = ?
    `;
    
    if(dest.CPF) {
        query += ` AND REPLACE(REPLACE(REPLACE(REPLACE(B."TaxId4", '.', ''), '/', ''), '-', ''), ' ', '') = '${dest.CPF}'`;
    } else {
        query += ` AND REPLACE(REPLACE(REPLACE(REPLACE(B."TaxId0", '.', ''), '/', ''), '-', ''), ' ', '') = '${dest.CNPJ}'`;
    }
    
    let respValidarCliente = api.sqlQuery(query, 1);
    return respValidarCliente;
}

function validarIntegracaoCliente(session, dest, entrega) {
    
    let respValidarCliente = verificarClienteSap(dest); 
    
    if(respValidarCliente.length) {
        return {
            ok: true,
            message: respValidarCliente
        };
    } else {
        return integrarClienteSap(session, dest, entrega);
    }
    
    return {
        ok: false,
        message: `Erro ao verificar o cliente!`
    };
}