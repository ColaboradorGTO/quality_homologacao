var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let codSubgrupoEstrutura;

function padLeft(number, length, character) {
	if(character == null) {
		character = '0';
    }
	var result = String(number);
	for(var i = result.length; i < length; ++i) {
		result = character + result;
	}
	return result;
}

function calcularDigitoVerificador(codigo){
  let soma = 0;
  
  codigo = codigo.substring(0, 12);
  
  for (let i = codigo.length; i >= 1; i--){
    let digito = parseInt(codigo[i-1], 0);
    
    if (i % 2 === 0){ // odd
        soma += digito * 3;
    } else { // even
        soma += digito * 1;
    }
  }

  let digitoVerificador = (10 - (soma % 10)) % 10;

  return digitoVerificador;
}

function gerarCodigoBarras(idSubgrupo, idForn, conn){
    try{
        let codBarsParcial;
        let codeBars = getCodigoSubgrupoEstrutura(idSubgrupo);
        
        codeBars += getIdFornecedor(idForn);
        codeBars += getNumeroContadorSubgrupoEstrutura(idSubgrupo);
        codeBars += calcularDigitoVerificador(codeBars);
        
        codeBars = validaExistenciaCodBarrasProd(codeBars, idForn, idSubgrupo, conn);
        
        if(codeBars.length > 13){
            throw {message: `O codigo de barras(${codeBars}) gerado é maior que 13 digitos, verifique os dados que o compõe(CODSUBGRUPOESTRUTURA(3), IDFORNECEDOR(4), NUCONTADOR(5), DIGITO_VERIFICADOR(1))`}
        }
        return codeBars;
    } catch (error){
        throw error;
    }
}

function getCodigoSubgrupoEstrutura(idSubgrupo){
    let queryCodSubgrupoEstrutura = `
        SELECT 
            *
        FROM
            "VAR_DB_NAME"."SUBGRUPOESTRUTURA" 
        WHERE 
            "STATIVO" = 'True'
            AND "IDSUBGRUPOESTRUTURA" =  ?
    `;
    
    let respCodSubgrupo = api.sqlQuery(queryCodSubgrupoEstrutura, idSubgrupo);
    
    if(respCodSubgrupo.length){
        let codSubgrupoEstruturaCompleto = respCodSubgrupo[0]["CODSUBGRUPOESTRUTURA"];
        
        codSubgrupoEstrutura = codSubgrupoEstruturaCompleto.substring(2, 3) + codSubgrupoEstruturaCompleto.substring(4, 6);
        
        return codSubgrupoEstrutura;
    } else {
        throw {message: `Estrutura não encontrada ou Inativa! IDSUBGRUPOESTRUTURA: ${idSubgrupo}`}
    }
}

function getIdFornecedor(idForn){
    let queryFornecedor = `
        SELECT 
            * 
        FROM 
            "VAR_DB_NAME".FORNECEDOR 
        WHERE 
            "STATIVO" = 'True'
            AND "IDFORNECEDOR" = ? 
    `;
    
    let respFornecedor = api.sqlQuery(queryFornecedor, idForn);
    
    if(respFornecedor.length){
        let idFornecedor = padLeft(String(respFornecedor[0]["IDFORNECEDOR"]), 4);
        
        if(idFornecedor.length > 4){
            throw {message: `O ID do Fornecedor é maior que 4 digitos! IDFORNECEDOR: ${idForn}`}
        }
        
        return idFornecedor;
    } else {
        throw {message: `Fornecedor não encontrado ou Inativo! IDFORNECEDOR: ${idForn}`};
    }
}

function getNumeroContadorSubgrupoEstrutura(idSubgrupo){
    let queryContSubgrupoEstrutura = `
        SELECT 
            *
        FROM
            "VAR_DB_NAME"."SUBGRUPOESTRUTURA" 
        WHERE
            "STATIVO" = 'True'
            AND "IDSUBGRUPOESTRUTURA" =  ?
    `;
    
    let respContSubgrupo = api.sqlQuery(queryContSubgrupoEstrutura, idSubgrupo);
    
    if(respContSubgrupo.length){
        let nuContador = parseInt(respContSubgrupo[0]["NUCONTADOR"]);
        
        nuContador = padLeft(String(nuContador), 5);
        
        if(nuContador.length > 5){
            throw {message: `NUCONTADOR da Estrutura é maior que 5 digitos! IDSUBGRUPOESTRUTURA: ${idSubgrupo}`};
        }
        
        return padLeft(String(nuContador), 5);
    } else {
        throw {message: `Estrutura não encontrada ou Inativa! IDSUBGRUPOESTRUTURA: ${idSubgrupo}`}
    }
}

function atualizaContadorSubgrupoEstrutura(idSubgrupo, conn){
    
    let queryContSubgrupoEstrutura = `
        UPDATE 
            "VAR_DB_NAME"."SUBGRUPOESTRUTURA" 
        SET 
            "NUCONTADOR" =  "NUCONTADOR" + 1
        WHERE 
            "IDSUBGRUPOESTRUTURA" =  ?
    `;
    
    let pStmtUpdateSubgrupo = conn.prepareStatement(api.replaceDbName(queryContSubgrupoEstrutura));
    
    pStmtUpdateSubgrupo.setInt(1, idSubgrupo);
    
    pStmtUpdateSubgrupo.execute();
    pStmtUpdateSubgrupo.close();
    
    conn.commit();
}

function validaExistenciaCodBarrasProd(nuCodeBars, idForn, idSubgrupo, conn) {
    let codeBars = nuCodeBars;
    let stContinua = true;
    let respQueryCodBarras;
    
    do {
        let queryValidaCodBarras = `
            SELECT 
                (SELECT TBP.IDPRODUTO FROM "VAR_DB_NAME".PRODUTO TBP WHERE TBP.NUCODBARRAS = '${codeBars}') AS IDPRODPRODUTO,
                (SELECT TBO."ItemCode" FROM SBO_GTO_PRD.OITM TBO WHERE TBO."CodeBars" = '${codeBars}') AS IDPRODOITM,
                (SELECT TBD.IDPRODCADASTRO FROM "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBD WHERE TBD.CODBARRAS = '${codeBars}' AND TBD.STCANCELADO <> 'True') AS IDPRODDETPEDIDO
            FROM 
                DUMMY
            WHERE
                1 = ?
        `;
        
        respQueryCodBarras = api.sqlQuery(queryValidaCodBarras, 1);
        
        atualizaContadorSubgrupoEstrutura(idSubgrupo, conn);
        
        if (!respQueryCodBarras[0].IDPRODPRODUTO && !respQueryCodBarras[0].IDPRODOITM && !respQueryCodBarras[0].IDPRODDETPEDIDO) {
            stContinua = false;
            return codeBars;
        } else {
            codeBars = getCodigoSubgrupoEstrutura(idSubgrupo);
            codeBars += getIdFornecedor(idForn);
            codeBars += getNumeroContadorSubgrupoEstrutura(idSubgrupo);
            codeBars += calcularDigitoVerificador(codeBars);
            
            stContinua = true;
        }
    } while (stContinua);
}
