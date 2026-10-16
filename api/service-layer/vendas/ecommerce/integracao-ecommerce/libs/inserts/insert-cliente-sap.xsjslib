let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function postSl(data, session) {
    let response = slApi.post('/BusinessPartners', data, session);
    
    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar integrar o cliente';
        
        return msgReturnError;
    }
    
    return true;
}

function ObterEnderecoCliente(dadosCliente){
    let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE 1 = ? and "IbgeCode" = '${dadosCliente.NUIBGE}' AND UPPER("State") = '${dadosCliente.SGUF}'`, 1);
    
    if(!regAbsId.length) return false;
    
    let enderecosCliente = [
        {
            "AddressName": "COBRANCA", // fixo
            "Street": dadosCliente.EENDERECO, // nome da rua
            "Block": dadosCliente.EBAIRRO, // bairro
            "ZipCode": dadosCliente.NUCEP, // CEP
            "City": dadosCliente.ECIDADE, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": dadosCliente.SGUF, // preencher conforme estado
            "BuildingFloorRoom": dadosCliente.ECOMPLEMENTO, // complemento do endereço
            "AddressType": "bo_BillTo", // fixo
            "StreetNo": dadosCliente.NUENDERECO, // numero da casa
            "U_SKILL_indIEDest": dadosCliente.IDINDICACAOIE  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        },
        {
            "AddressName": "ENTREGA", // fixo
            "Street": (dadosCliente.EENDERECO || "NI"), // nome da rua
            "Block": (dadosCliente.EBAIRRO || "NI"), // bairro
            "ZipCode": dadosCliente.NUCEP, // CEP
            "City": dadosCliente.ECIDADE, // nome da cidade
            "County": String(regAbsId[0]['AbsId']), // inserir o resultado do campo T0."AbsId" da consulta 1
            "Country": "BR", // fixo
            "State": dadosCliente.SGUF, // preencher conforme estado
            "BuildingFloorRoom": dadosCliente.ECOMPLEMENTO, // complemento do endereço
            "AddressType": "bo_ShipTo", // fixo
            "StreetNo": dadosCliente.NUENDERECO, // numero da casa
            "U_SKILL_indIEDest": dadosCliente.IDINDICACAOIE  // 1 = contribuinte ICMS / 2 = contribuinte isento de ICMS / 9 - Não contribuinte ou sem IE
        }
    ];
    
    return enderecosCliente;
}

function montarJsonCliente(dadosCliente) {
    let endereco = ObterEnderecoCliente(dadosCliente)
    if(!endereco) {
        return {
            status: false,
            message: `ID da Cidade Não Localizado, Verifique os Dados de Endereço e Tente Novamente`
        };
    }
    
    let jsonCliente = {
        "Series": 70, // fixo
        "CardName": dadosCliente.DSNOMERAZAOSOCIAL, // razão social 
        "CardForeignName": dadosCliente.DSAPELIDONOMEFANTASIA, // nome fantasia
        "CardType": "cCustomer", // "cCustomer" para cliente e "cSupplier" para fornecedor
        "Phone1": dadosCliente.NUTELCELULAR, //fone 1
        //"Phone2": (registro.FONECONTATOCLIENTE01 || registro.NUTELCELULAR), // fone 2
        "Cellular": '', // celular
        "EmailAddress": dadosCliente.EEMAIL, // email
        "BPAddresses": endereco,
        "BPFiscalTaxIDCollection": [
            {
                "TaxId0": (dadosCliente.TPCLIENTE == 'JURIDICA' ? dadosCliente.NUCPFCNPJ : ''), // CNPJ caso PJ
                "TaxId1": (dadosCliente.NURGINSCESTADUAL || 'ISENTO'), // Inscrição estadual, caso tenha, se não escrever a palavra Isento 
                "TaxId4": (dadosCliente.TPCLIENTE == 'FISICA' ? dadosCliente.NUCPFCNPJ : ''), // CPF caso PF
            }
        ]
    }
    
    return jsonCliente;
}

function verificarClienteSap(dadosCliente){
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
    
    if(dadosCliente.TPCLIENTE == 'FISICA') {
        query += ` AND REPLACE(REPLACE(REPLACE(REPLACE(B."TaxId4", '.', ''), '/', ''), '-', ''), ' ', '') = '${dadosCliente.NUCPFCNPJ}'`;
    } else {
        query += ` AND REPLACE(REPLACE(REPLACE(REPLACE(B."TaxId0", '.', ''), '/', ''), '-', ''), ' ', '') = '${dadosCliente.NUCPFCNPJ}'`;
    }
    
    let respValidarClienteSap = api.sqlQuery(query, 1);
    if(respValidarClienteSap.length) return respValidarClienteSap[0].CardCode;
    
    return false;
}

function getDadosCliente (idCliente) {
    let query = `
        SELECT
        	IDCLIENTE,
        	DSNOMERAZAOSOCIAL,
        	DSAPELIDONOMEFANTASIA,
        	TPCLIENTE,
        	NUCPFCNPJ,
        	IDINDICACAOIE,
        	NURGINSCESTADUAL,
        	NUCEP,
        	NUIBGE,
        	EENDERECO,
        	NUENDERECO,
        	ECOMPLEMENTO,
        	EBAIRRO,
        	ECIDADE,
        	SGUF,
        	EEMAIL,
        	NUTELCELULAR,
        	IDCLIENTESAP
        FROM
        	"VAR_DB_NAME".CLIENTE A 
        WHERE 
        	1 = ?
        	AND A.STATIVO = 'True'
        	AND A.IDCLIENTE = '${idCliente}'
    `;
    
    let respDadosCliente = api.sqlQuery(query, 1);
    if(respDadosCliente.length) return respDadosCliente[0];
    
    return false;
}

function integrarClienteSap (conn, session, idCliente) {
    let dadosCliente = getDadosCliente(idCliente);
    let CardCode = verificarClienteSap(dadosCliente);
    
    if(CardCode) {
        return {
            status: true,
            message: `Cliente cadastrado no SAP`,
            CardCode: CardCode
        }
    }
    
    let jsonCliente = montarJsonCliente(dadosCliente);
    let respIntegracao = postSl(jsonCliente, session);
    
    if(respIntegracao == true) {
        CardCode = verificarClienteSap(dadosCliente);
        if(CardCode) {
            return {
                status: true,
                message: `Cliente cadastrado no SAP`,
                CardCode: CardCode
            };
        }
    } else { 
        return {
            status: false,
            message: respIntegracao
        };
    }
}