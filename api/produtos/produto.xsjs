var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let libAtualizar = $.import("quality.concentrador_homologacao.api.service-layer.produto.libs", "atualizar-produto");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function updateLogError(idProduto, msgError){
    let query = `
        UPDATE 
            "VAR_DB_NAME".PRODUTO 
        SET
            ERRORLOGSAP = ?
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));
    
    pStmt.setString(1, msgError);
	pStmt.setString(2, idProduto);
	
	pStmt.executeUpdate();
	pStmt.close();
}

function updateLogSuccess(idProduto){
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".PRODUTO 
        SET
            ERRORLOGSAP = NULL
        WHERE 
            IDPRODUTO = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	
	pStmt.executeUpdate();
	pStmt.close();
}

function validarSeExisteNoSAP(idProduto){
    let query = `
        SELECT 
            "ItemCode"
        FROM
            "${dbNameSAP}".OITM
        WHERE
            "ItemCode" = '${idProduto}'
            AND 1 = ?
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return (reg.length > 0);
}

function gerarCodigoBarras(idFornecedor, idSubgrupoEstrutura, conn){
    let stmt = conn.prepareCall(api.replaceDbName(`CALL "VAR_DB_NAME".GerarEValidarCodBarrasParaProduto(?, ?, ?)`));
    
    stmt.setInt(1, idFornecedor);
    stmt.setInt(2, idSubgrupoEstrutura);
    
    stmt.execute();
    
    let codBars = stmt.getNString(3);
    
    stmt.close();
    
    return codBars;
}

function fnHandleGet(byId) {
    let nome = $.request.parameters.get("nome");
    let codBarras = $.request.parameters.get("codBarras");
    let dtInicio = $.request.parameters.get("dtInicio");
    let dtFim = $.request.parameters.get("dtFim");
    let NomeOuCodBarras = $.request.parameters.get("NomeOuCodBarras");
    let stAtivo = $.request.parameters.get("stAtivo");
    let idFornecedor = $.request.parameters.get("idFornecedor");
      
    let query = `
        SELECT 
            TBP.IDPRODUTO,
            TBP.DSNOME,
            TBP.NUCODBARRAS,
            TBP.NUREFERENCIA,
            TBT.DSTAMANHO,
            TBP.NUNCM,
            TBP.STECOMMERCE,
            IFNULL(TBP.STMIGRADOSAP, (SELECT FIRST_VALUE(TBDP.STMIGRADOSAP ORDER BY TBDP.STATIVO DESC, TBDP.STMIGRADOSAP DESC) FROM "VAR_DB_NAME".DETALHEPRODUTOPEDIDO TBDP WHERE TBP.IDPRODUTO = TBDP.IDPRODCADASTRO AND TBDP.STMIGRADOSAP = 'True')) AS STMIGRADOSAP,
            TBP.DTCADASTRO,
            TBP.DTULTALTERACAO,
            TBP.PRECOCUSTO,
            TBP.PRECOVENDA,
            TBP.STATIVO,
            TBFAB.DSFABRICANTE,
            TBP.IDGRUPOEMPRESARIAL,
            TBP.IDFORNECEDOR,
            TBP.IDFABRICANTE,
            TBU.IDUNIDADEMEDIDA,
            TBP.IDCOR,
            TBP.IDTIPOTECIDO,
            TBP.IDCATEGORIAPEDIDO,
            TBS.IDGRUPOESTRUTURA,
            TBS.IDSUBGRUPOESTRUTURA,
            TBP.IDESTILO,
            TBP.IDCATEGORIAS,
            TBP.IDLOCALEXPOSICAO,
            TBP.IDTAMANHO,
            TBP.IDTIPOPRODUTOFISCAL, 
            TBP.IDFONTEPRODUTOFISCAL,
            TO_VARCHAR(TBP.ERRORLOGSAP) AS ERRORLOGSAP
        FROM 
            "VAR_DB_NAME".PRODUTO TBP
        LEFT JOIN "VAR_DB_NAME".TAMANHO TBT ON 
            TBP.IDTAMANHO = TBT.IDTAMANHO
        LEFT JOIN "VAR_DB_NAME".UNIDADEMEDIDA TBU ON 
            TBP.UND = TBU.DSSIGLA
        LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBS ON 
            TBP.IDSUBGRUPO = TBS.IDSUBGRUPOESTRUTURA
        LEFT JOIN "VAR_DB_NAME".FABRICANTE TBFAB ON 
            TBP.IDFABRICANTE = TBFAB.IDFABRICANTE
        WHERE 
            1 = ?
    `;
    
    if( byId ){
        query += ` AND  TBP.IDPRODUTO = '${byId}' `;
    }
    
    if( nome ){
        query += ` AND  CONTAINS(TBP."DSNOME", '%${nome}%') `;
    }
    
    if( codBarras ){
        query += ` AND  TBP."NUCODBARRAS" = '${codBarras}' `;
    }
    
    if( dtInicio && dtFim ){
        query += ` AND  ( TO_DATE( IFNULL( TBP.DTCADASTRO, TBP.DTULTALTERACAO ) ) BETWEEN '${dtInicio}' AND '${dtFim}' ) `;
    }
    
    if( NomeOuCodBarras ){
        query += ` AND  CONTAINS((TBP."DSNOME", TBP."NUCODBARRAS"), '%${NomeOuCodBarras}%') `;
    }
    
    if( stAtivo ){
        query += ` AND TBP.STATIVO = '${stAtivo}'  `;
    }
    
    if ( idFornecedor ) {
        query += ` AND TBP.IDFORNECEDOR = '${idFornecedor}' `;
    }
    
    query += ` 
        ORDER BY 
            --TO_DATE(TBP.DTCADASTRO), 
            UPPER(SUBSTRING(TBP.DSNOME, 0, LENGTH(TBP.DSNOME) - 2)),
            CASE 
                WHEN TBT.DSTAMANHO BETWEEN '0' AND '99999' THEN TO_INTEGER(REPLACE(TBT.DSTAMANHO, '/', ''))
                WHEN TBT.DSTAMANHO = 'PP' THEN 1
                WHEN TBT.DSTAMANHO = 'P'  THEN 2
                WHEN TBT.DSTAMANHO = 'M'  THEN 3
                WHEN TBT.DSTAMANHO = 'G'  THEN 4
                WHEN TBT.DSTAMANHO = 'GG' THEN 5
                WHEN TBT.DSTAMANHO = 'EG' THEN 6
                WHEN TBT.DSTAMANHO = 'EGG' THEN 7
                WHEN TBT.DSTAMANHO = 'G1'  THEN 8
                WHEN TBT.DSTAMANHO = 'G2'  THEN 9
                WHEN TBT.DSTAMANHO = 'G3'  THEN 10
                WHEN TBT.DSTAMANHO = 'G4'  THEN 11
                WHEN TBT.DSTAMANHO = 'G5'  THEN 12
                WHEN TBT.DSTAMANHO = 'XG' THEN 13
                WHEN TBT.DSTAMANHO = 'XGG' THEN 14
                ELSE 999
            END
    `;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    conn = $.db.getConnection();
    
    let query = `
        UPDATE 
            "VAR_DB_NAME".PRODUTO
        SET 
            "DSNOME" = ?,
            "IDGRUPOEMPRESARIAL" = ?,
            "NUNCM" = ?,
            "UND" = ?,
            "PRECOCUSTO" = ?,
            "IDSUBGRUPO" = ?,
            "IDFABRICANTE" = ?,
            "IDFORNECEDOR" = ?,
            "NUREFERENCIA" = ?,
            "IDCOR" = ?,
            "IDTAMANHO" = ?,
            "IDCATEGORIAPEDIDO" = ?,
            "IDTIPOTECIDO" = ?,
            "IDESTILO" = ?,
            "IDLOCALEXPOSICAO" = ?,
            "IDCATEGORIAS" = ?,
            "IDTIPOPRODUTOFISCAL" = ?,
            "IDFONTEPRODUTOFISCAL" = ?,
            "STECOMMERCE" = ?,
            "STREDESOCIAL" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP,
            "DTCADASTRO" = IFNULL("DTCADASTRO", "DTULTALTERACAO")
        WHERE 
            "IDPRODUTO" = ?
            AND "STATIVO" =  'True'
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString());
    // return {bodyJson}
    try{
        for (let registro of bodyJson) {
            let indice = 1;
            
            pStmt.setString(indice++, registro.DSNOME);               
            pStmt.setInt(indice++, registro.IDGRUPOEMPRESARIAL);      
            pStmt.setString(indice++, registro.NUNCM);                
            pStmt.setString(indice++, registro.UND);                  
            pStmt.setFloat(indice++, registro.PRECOCUSTO);            
            pStmt.setInt(indice++, registro.IDSUBGRUPO);              
            pStmt.setInt(indice++, registro.IDFABRICANTE);            
            pStmt.setInt(indice++, registro.IDFORNECEDOR);            
            pStmt.setString(indice++, registro.NUREFERENCIA);         
            pStmt.setInt(indice++, registro.IDCOR);                   
            pStmt.setInt(indice++, registro.IDTAMANHO);               
            pStmt.setInt(indice++, registro.IDCATEGORIAPEDIDO);       
            pStmt.setInt(indice++, registro.IDTIPOTECIDO);            
            pStmt.setInt(indice++, registro.IDESTILO);                
            pStmt.setInt(indice++, registro.IDLOCALEXPOSICAO);        
            pStmt.setInt(indice++, registro.IDCATEGORIAS);            
            pStmt.setInt(indice++, registro.IDTIPOPRODUTOFISCAL);     
            pStmt.setInt(indice++, registro.IDFONTEPRODUTOFISCAL);    
            pStmt.setString(indice++, registro.STECOMMERCE);
            pStmt.setString(indice++, registro.STREDESOCIAL);
            pStmt.setString(indice++, registro.IDPRODUTO);
            
            let existSap = validarSeExisteNoSAP(registro.IDPRODUTO);
            //return registro
            //return {existSap}
            if(existSap){
                let respSAP = libAtualizar.atualizarProdutoSAP(registro);
                
                if(!respSAP.success){
                    let msgError = respSAP.msgError || 'Erro ao tentar Atualizar o produto no SAP.';
                    
                    updateLogError(registro.IDPRODUTO, msgError);
                    
                    continue;
                }
            }
            
            updateLogSuccess(registro.IDPRODUTO);
            
            pStmt.execute();
        }
        
        conn.commit();
        
    } catch (e) {
        throw e;
    } finally {
        pStmt.close();
        conn.close();
    }
   
    return {
        msg: 'Produto Atualizado Com Sucesso!',
        data: bodyJson
    };
}

function fnHandlePost() {
    conn = $.db.getConnection();
    
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."PRODUTO" 
        (
            "IDPRODUTO", 
            "DSNOME",
            "IDGRUPOEMPRESARIAL", 
            "NUNCM", 
            "NUCODBARRAS",
            "UND",
            "PRECOCUSTO",
            "PRECOVENDA",
            "IDSUBGRUPO",
            "IDFABRICANTE",
            "IDFORNECEDOR",
            "NUREFERENCIA",
            "IDCOR",
            "IDTAMANHO",
            "IDCATEGORIAPEDIDO",
            "IDTIPOTECIDO",
            "IDESTILO",
            "IDLOCALEXPOSICAO",
            "IDCATEGORIAS",
            "IDTIPOPRODUTOFISCAL",
            "IDFONTEPRODUTOFISCAL",
            "STECOMMERCE",
            "STREDESOCIAL",
            "IDDETALHEPRODUTOPEDIDO",
            "DTULTALTERACAO",
            "NUCEST",
            "NUCST_ICMS",
            "NUCFOP",
            "PERC_OUT",
            "STGRADE",
            "QTDENTRADA",
            "QTDCOMERCIALIZADA",
            "QTDPERDA",
            "QTDDISPONIVEL",
            "PERCICMS",
            "PERCISS",
            "PERCPIS",
            "PERCCOFINS",
            "COD_CSOSN",
            "PERCCSOSC",
            "NUCST_IPI",
            "NUCST_PIS",
            "NUCST_COFINS",
            "PERCIPI",
            "STPESAVEL",
            "GRP_MATERIAIS",
            "STATIVO",
            "DTCADASTRO"
        )
        SELECT
            "VAR_DB_NAME".SEQ_PRODUTOPEDIDO.NEXTVAL AS IDPRODUTO,
            ? AS DSNOME,
            ? AS IDGRUPOEMPRESARIAL,
            ? AS NUNCM,
            ? AS NUCODBARRAS,
            ? AS UND,
            ? AS PRECOCUSTO,
            ? AS PRECOVENDA,
            ? AS IDSUBGRUPO,
            ? AS IDFABRICANTE,
            ? AS IDFORNECEDOR,
            ? AS NUREFERENCIA,
            ? AS IDCOR,
            ? AS IDTAMANHO,
            ? AS IDCATEGORIAPEDIDO,
            ? AS IDTIPOTECIDO,
            ? AS IDESTILO,
            ? AS IDLOCALEXPOSICAO,
            ? AS IDCATEGORIAS,
            ? AS IDTIPOPRODUTOFISCAL,
            ? AS IDFONTEPRODUTOFISCAL,
            ? AS STECOMMERCE,
            ? AS STREDESOCIAL,
            NULL AS IDDETALHEPRODUTOPEDIDO,
            CURRENT_TIMESTAMP  AS DTULTALTERACAO,
            '' AS NUCEST,
            '' AS NUCST_ICMS,
            '' AS NUCFOP,
            '' AS PERC_OUT,
            1 AS STGRADE,
            0 AS QTDENTRADA,
            0 AS QTDCOMERCIALIZADA,	
            0 AS QTDPERDA,
            0 AS QTDDISPONIVEL,
            0.0 AS PERCICMS,
            0.0 AS PERCISS,
            0.0 AS PERCPIS,
            0.0 AS PERCCOFINS,
            '' AS COD_CSOSN,
            0.0 AS PERCCSOSC,
            '' AS NUCST_IPI,
            '' AS NUCST_PIS,
            '' AS NUCST_COFINS,
            0.0 AS PERCIPI,
            0 AS STPESAVEL,
            1 AS GRP_MATERIAIS,
            'True' AS STATIVO,
            CURRENT_TIMESTAMP  AS DTCADASTRO
        FROM 
            DUMMY;
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString());
    
    try {
        for (let registro of bodyJson) {
            let indice = 1;
            
            let codBars = gerarCodigoBarras(registro.IDFORNECEDOR, registro.IDSUBGRUPO, conn) || "";
            
            pStmt.setString(indice++, registro.DSNOME);               
            pStmt.setInt(indice++, registro.IDGRUPOEMPRESARIAL);      
            pStmt.setString(indice++, registro.NUNCM);                
            pStmt.setString(indice++, codBars);                       
            pStmt.setString(indice++, registro.UND);                  
            pStmt.setFloat(indice++, registro.PRECOCUSTO);            
            pStmt.setFloat(indice++, registro.PRECOVENDA);            
            pStmt.setInt(indice++, registro.IDSUBGRUPO);              
            pStmt.setInt(indice++, registro.IDFABRICANTE);            
            pStmt.setInt(indice++, registro.IDFORNECEDOR);            
            pStmt.setString(indice++, registro.NUREFERENCIA);         
            pStmt.setInt(indice++, registro.IDCOR);                   
            pStmt.setInt(indice++, registro.IDTAMANHO);               
            pStmt.setInt(indice++, registro.IDCATEGORIAPEDIDO);       
            pStmt.setInt(indice++, registro.IDTIPOTECIDO);            
            pStmt.setInt(indice++, registro.IDESTILO);                
            pStmt.setInt(indice++, registro.IDLOCALEXPOSICAO);        
            pStmt.setInt(indice++, registro.IDCATEGORIAS);            
            pStmt.setInt(indice++, registro.IDTIPOPRODUTOFISCAL);     
            pStmt.setInt(indice++, registro.IDFONTEPRODUTOFISCAL);    
            pStmt.setString(indice++, registro.STECOMMERCE);
            pStmt.setString(indice++, registro.STREDESOCIAL);    
            
            pStmt.executeUpdate();
        }
        
        conn.commit();
        
    } catch (e) {
        throw e;
    } finally {
        pStmt.close();
        conn.close();
    }
    
    return {
        msg: 'Produto Cadastrado Com Sucesso!'
    };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            //$.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        case $.net.http.POST:
            var docReturn = fnHandlePost();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}