let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function PatchSl(idclienteSap, data, session) {
    let response = slApi.patch(`/BusinessPartners('${idclienteSap}')`, data, session);

    if(response.status != 204){
        response = JSON.parse(response.body.asString());
        
        let msgReturnError = response.error.message.value.length > 0 ? translate.traduzirTexto(response.error.message.value) : 'Erro ao tentar atualizar o cliente';
        
        return msgReturnError;
    }
    
    return true;
}

function atualizacaoClienteQuality(idCliente, dest, conn) {
    let queryUpdate = `
        UPDATE 
        	"VAR_DB_NAME".CLIENTE A
        SET 
        	A.NUCEP = ?,
        	A.NUIBGE = ?,
        	A.EENDERECO = ?,
        	A.NUENDERECO = ?,
        	A.ECOMPLEMENTO = ?,
        	A.EBAIRRO = ?,
        	A.ECIDADE = ?,
        	A.SGUF = ?
        WHERE 
        	A.IDCLIENTE = ?
    `;
    
    let cont = 0;
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdate));
    
    try {
        pStmtUpdate.setString(++cont, dest.enderDest.CEP);
        pStmtUpdate.setInt(++cont, Number(dest.enderDest.cMun));
        pStmtUpdate.setString(++cont, dest.enderDest.xLgr);
        pStmtUpdate.setString(++cont, dest.enderDest.nro || 'S/N');
        pStmtUpdate.setString(++cont, dest.enderDest.xCpl || 'S/C');
        pStmtUpdate.setString(++cont, dest.enderDest.xBairro || 'NI');
        pStmtUpdate.setString(++cont, dest.enderDest.xMun);
        pStmtUpdate.setString(++cont, dest.enderDest.UF);
        pStmtUpdate.setInt(++cont, Number(idCliente));
        
    	pStmtUpdate.execute();
    	return true;
    } catch(error) {
        return false;
    } finally {
        pStmtUpdate.close();
    }
}

function ObterEnderecoCliente(dadosCliente){
    let regAbsId = api.sqlQuery(`SELECT "AbsId" FROM ${dbNameSAP}.OCNT WHERE 1 = ? and "IbgeCode" = '${dadosCliente.NUIBGE}' AND UPPER("State") = '${dadosCliente.SGUF}'`, 1);
    
    if(!regAbsId.length) return false;
    
    let enderecosCliente = [
        {
            "BPCode": dadosCliente.IDCLIENTESAP,
            "RowNum": Number(dadosCliente.NUMLINECOBRANCA),
            "AddressName": "COBRANCA", // fixo
            "Street": dadosCliente.EENDERECO || "NI", // nome da rua
            "Block": dadosCliente.EBAIRRO || "NI", // bairro
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
            "BPCode": dadosCliente.IDCLIENTESAP,
            "RowNum": Number(dadosCliente.NUMLINEENTREGA),
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
        "BPAddresses": endereco
    }
    
    return {
        status: true,
        message: jsonCliente
    };
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
        	IDCLIENTESAP,
        	(SELECT "LineNum" FROM ${dbNameSAP}.CRD1 WHERE TRIM(UPPER("AdresType")) = 'B' AND "CardCode" = A.IDCLIENTESAP) AS NUMLINECOBRANCA,
            (SELECT "LineNum" FROM ${dbNameSAP}.CRD1 WHERE TRIM(UPPER("AdresType")) = 'S' AND "CardCode" = A.IDCLIENTESAP) AS NUMLINEENTREGA
        FROM
        	"VAR_DB_NAME".CLIENTE A 
        INNER JOIN ${dbNameSAP}.OCRD B ON 
            A.IDCLIENTESAP = B."CardCode"
            AND B."CardType" = 'C'
        WHERE 
        	1 = ?
        	AND A.STATIVO = 'True'
        	AND A.IDCLIENTE = '${idCliente}'
    `;
    
    let respDadosCliente = api.sqlQuery(query, 1);
    if(respDadosCliente.length) return respDadosCliente[0];
    
    return false;
}

function verificarMudancaCadastro(idCliente, idClienteSap, dest, conn, session){
    let query = `
        SELECT
            A.NUCEP
        FROM
        	"VAR_DB_NAME".CLIENTE A
        WHERE
            1 = ?
        	AND A.STATIVO = 'True'
        	AND A.IDCLIENTE = '${idCliente}'
    `;
    
    let respQuery = api.sqlQuery(query, 1);
    
    if(!respQuery.length) return {status: false, message: 'CLiente não encontrado no quality.'};
    
    if(respQuery[0].NUCEP == dest.enderDest.CEP) return {status: true, message: 'Cliente já atualizado'};
    
    let respAtualizacaoClienteQuality = atualizacaoClienteQuality(idCliente, dest, conn);
    if(!respAtualizacaoClienteQuality) return {status: false, message: 'Não foi possível atualizar o cliente no quality.'};
    
    let dadosCliente = getDadosCliente(idCliente);
    if(!dadosCliente) return {status: false, message: 'Erro ao buscar os dados para atualizar no SAP.'};
    
    let json = montarJsonCliente(dadosCliente);
    if(!json.status) return {status: false, message: json.message};
    
    let respAtualizacaoSl = PatchSl(idClienteSap, json.message, session);
    if(respAtualizacaoSl !== true) return {status: false, message: respAtualizacaoSl};
    
    return {
        status: true,
        message: 'Cliente atualizado com sucesso.'
    }
}