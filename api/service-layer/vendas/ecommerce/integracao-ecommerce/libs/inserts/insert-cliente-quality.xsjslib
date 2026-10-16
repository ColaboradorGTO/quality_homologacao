let dbNameSAP = "SBO_GTO_TESTE4";
let filePathEnviroment = "quality.concentrador_homologacao.api";
let api = $.import(`${filePathEnviroment}.apiResponse`, "int_api");
let slApi = $.import(`${filePathEnviroment}.service-layer`, "api");
let translate = $.import(`${filePathEnviroment}.service-layer`, "traducao-texto");

function getSeqCodeCliente(){
    let sequence;
    
    for(let i = 0; i < 3; i++){
        sequence = api.sqlQuery(`SELECT (MAX(A."IDCLIENTE")+1) AS SEQUENCE FROM "VAR_DB_NAME"."CLIENTE" A WHERE 1 = ?`, 1);
        sequence = sequence[0].SEQUENCE;
        
        let validarSequence = api.sqlQuery(`SELECT A."IDCLIENTE" FROM "VAR_DB_NAME"."CLIENTE" A WHERE 1 = ? AND A."IDCLIENTE" = '${sequence}'`, 1);
        
        if(validarSequence.length > 0) continue;
        
        return sequence;
    }
    
    return false;
}

function executarInsert(idempresa, conn, dest) {
    let idCliente = getSeqCodeCliente();
    
    if(idCliente == false) return `Não foi possível criar a sequência da tabela de clientes.`;
    
    let queryInsert = `
        INSERT INTO "VAR_DB_NAME".CLIENTE
        (
            IDCLIENTE,
            IDEMPRESA,
        	DSNOMERAZAOSOCIAL,
        	DSAPELIDONOMEFANTASIA,
        	TPCLIENTE,
        	NUCPFCNPJ,
        	STOPTANTESIMPLES,
        	IDINDICACAOIE,
        	DSINDICACAOIE,
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
        	DTCADASTRO,
        	ERRORLOGSAP,
        	IDCLIENTESAP,
        	STATIVO,
        	STECOMMERCE)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, null, null, 'True', 'True');
    `;
    
    let descIndicacaoIe;
    if(dest.indIEDest == 1) {
        descIndicacaoIe = 'CONTRIBUINTE ICMS';
    } else if (dest.indIEDest == 2) {
        descIndicacaoIe = 'CONTRIBUINTE ISENTO DE IE';
    } else {
        descIndicacaoIe = 'NÃO CONTRIBUINTE COM OU SEM IE';
    }
    
    let cont = 0;
    let pStmt = conn.prepareStatement(api.replaceDbName(queryInsert));
    
    try {
        pStmt.setInt(++cont, idCliente);
        pStmt.setInt(++cont, idempresa);
        pStmt.setString(++cont, dest.xNome);
        pStmt.setString(++cont, dest.xNome);
        pStmt.setString(++cont, (dest.CPF ? 'FISICA' : 'JURIDICA'));
        pStmt.setString(++cont, (dest.CPF ? dest.CPF : dest.CNPJ));
        pStmt.setString(++cont, 'False');
        pStmt.setInt(++cont, Number(dest.indIEDest));
        pStmt.setString(++cont, descIndicacaoIe);
        pStmt.setString(++cont, dest.IE || 'ISENTO');
        pStmt.setString(++cont, dest.enderDest.CEP);
        pStmt.setInt(++cont, Number(dest.enderDest.cMun));
        pStmt.setString(++cont, dest.enderDest.xLgr);
        pStmt.setString(++cont, dest.enderDest.nro || 'S/N');
        pStmt.setString(++cont, dest.enderDest.xCpl || 'S/C');
        pStmt.setString(++cont, dest.enderDest.xBairro || 'NI');
        pStmt.setString(++cont, dest.enderDest.xMun);
        pStmt.setString(++cont, dest.enderDest.UF);
        pStmt.setString(++cont, dest.email || '@');
        pStmt.setString(++cont, dest.enderDest.fone || '9999999999');
    
        pStmt.execute();
    	conn.commit();
    	
    	return true;
    } catch(error) {
        return error;
    } finally {
        pStmt.close();
    }
}

function validarInsertQuality (dest) {
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

function integrarClienteQuality(idempresa, conn, dest) {
    let respInsert = executarInsert(idempresa, conn, dest);
    
    if(respInsert == true) {
        let respValidacaoCliente = validarInsertQuality(dest);
        if(respValidacaoCliente){
            return {
                status: true,
                idCliente: respValidacaoCliente
            }
        }
    }
    
    return {
        status: false,
        message: `Erro ao inserir o cliente no quality: ${respInsert}`
    }
}