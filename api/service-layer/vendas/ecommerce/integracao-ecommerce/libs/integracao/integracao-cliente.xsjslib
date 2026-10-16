let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let filePathLibs = `${filePathEnviroment}.service-layer.vendas.ecommerce.integracao-ecommerce.libs`;
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let libInsertClienteQuality = $.import(`${filePathLibs}.inserts`, "insert-cliente-quality"); 
let libInsertClienteSap = $.import(`${filePathLibs}.inserts`, "insert-cliente-sap"); 
let libAtualizarEnderecoCliente = $.import(`${filePathLibs}.atualizacao-dados`, "atualizar-dados-cliente"); 

function verificarClienteSap(idCliente){
    let query = `
        SELECT
        	A.IDCLIENTESAP
        FROM
        	"VAR_DB_NAME".CLIENTE A
        WHERE
            1 = ?
        	AND A.STATIVO = 'True'
        	AND IFNULL(A.IDCLIENTESAP, '') <> ''
        	AND A.IDCLIENTE = '${idCliente}'
    `;
    
    let respValidarClienteSap = api.sqlQuery(query, 1);
    if(respValidarClienteSap.length) return respValidarClienteSap[0].IDCLIENTESAP;
    
    return false;
}

function verificarClienteQuality(dest) {
    let query = `
        SELECT
        	A.IDCLIENTE
        FROM
        	"VAR_DB_NAME".CLIENTE A
        WHERE
            1 = ?
        	AND A.STATIVO = 'True'
    `;
    
    if(dest.CPF) {
        query += ` AND A.NUCPFCNPJ = '${dest.CPF}'`
    } else {
        query += ` AND A.NUCPFCNPJ = '${dest.CNPJ}'`
    }
    
    let respValidarClienteQuality = api.sqlQuery(query, 1);
    if(respValidarClienteQuality.length) return respValidarClienteQuality[0].IDCLIENTE;
    
    return false;
}

function atualizarLogErrorSap (idCliente, message, conn) {
    let query = `
        UPDATE
            "VAR_DB_NAME"."CLIENTE"
        SET 
            ERRORLOGSAP = '${message}'
        WHERE 
            IDCLIENTE = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmt.setInt(1, idCliente);
    	pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function atualizarDadosClienteQuality(conn, idCliente, CardCode){
    let query = `
        UPDATE
            "VAR_DB_NAME"."CLIENTE"
        SET 
            IDCLIENTESAP = '${CardCode}',
            ERRORLOGSAP = null
        WHERE 
            IDCLIENTE = ?
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));

    try {
    	pStmt.setInt(1, idCliente);
    	pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch (error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function validarIntegracaoCliente(idempresa, conn, session, dest, entrega) {
    let idCliente = verificarClienteQuality(dest);
    
    if (!idCliente) {
        let respValidarInsertQuality = libInsertClienteQuality.integrarClienteQuality(idempresa, conn, dest);
        if(respValidarInsertQuality.status) idCliente = respValidarInsertQuality.idCliente;
    }
    
    if(idCliente) {
        let idClienteSap = verificarClienteSap(idCliente); 
        
        if(idClienteSap) {
            let respVerificarMudancaCadastro = libAtualizarEnderecoCliente.verificarMudancaCadastro(idCliente, idClienteSap, dest, conn, session);
            if(!respVerificarMudancaCadastro.status) return {status: false, message: respVerificarMudancaCadastro.message};
            
            return {
                status: true,
                message: `Cliente integrado com sucesso.`,
                idCliente: idCliente,
                idClienteSap: idClienteSap
            }
        }
        
        let respIntegracaoSap = libInsertClienteSap.integrarClienteSap(conn, session, idCliente);
        if(respIntegracaoSap.status) {
            let respAtualizarCliente = atualizarDadosClienteQuality(conn, idCliente, respIntegracaoSap.CardCode);
            
            if(respAtualizarCliente == true) {
                return {
                    status: true,
                    message: `Cliente integrado com sucesso.`,
                    idCliente: idCliente,
                    idClienteSap: respIntegracaoSap.CardCode
                }
            }
            
            atualizarLogErrorSap(idCliente, `Erro ao atualizar os dados no quality: ${respAtualizarCliente}`, conn);
            return {
                status: false,
                message: `Erro ao atualizar os dados no quality: ${respAtualizarCliente}`
            }
        } else {
            atualizarLogErrorSap(idCliente, respIntegracaoSap.message, conn);
            return {
                status: false,
                message: `Erro ao integrar o cliente no SAP: ${respIntegracaoSap.message}`
            }
        }
    }
    
    return {
        status: false,
        message: 'Erro ao integrar o cliente.'
    }
}