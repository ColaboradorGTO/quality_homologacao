var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dataUltAtualizacao = $.request.parameters.get("dataUltAtualizacao");
    var horaUltAtualizacao = $.request.parameters.get("horaUltAtualizacao") || '00:00:00';
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var query;
    
    if(!idEmpresa){
        query = `SELECT DISTINCT
                    	TBP.IDPRODUTO,
                    	(CASE 
                    		WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                    		ELSE TBP.IDGRUPOEMPRESARIAL 
                    	END) AS IDGRUPOEMPRESARIAL,
                    	(CASE 
                    		WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                    		ELSE  TBGE.DSGRUPOEMPRESARIAL
                    	END) AS GRUPOEMPRESARIAL,
                    	TBP.DSNOME,
                    	TBP.STGRADE,
                    	TBP.UND,
                    	TBP.NUCODBARRAS,
                    	TBP.NUNCM,
                    	TBP.PRECOCUSTO,
                    	IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA) AS PRECOVENDA,
                    	TBP.NUREFERENCIA,
                    	TBP.DTULTALTERACAO,
                    	TBP.GRP_MATERIAIS,
                    	TBP.STATIVO,
                    	TBP.IDSUBGRUPO,
                    	TBPEM.SUBGRUPO,
                    	TBES.DSESTILO,
                    	TBLE.DSLOCALEXPOSICAO,
                    	TBPEM.MARCA
                    FROM
                        "VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO TBHP
                    RIGHT JOIN"VAR_DB_NAME".PRODUTO TBP ON
                        TBP.IDPRODUTO = TBHP.IDPRODUTO  AND TBHP.IDRESUMOLISTAPRECO = ${idGrupoEmpresarial} AND TBHP.STATIVO =  'True'
                    LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                    	TBPEM.IDPRODUTO = TBP.IDPRODUTO
                    LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                    	TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
                    LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                        TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
                    LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                        TBES.IDESTILO = TBP.IDESTILO
                    WHERE 
                    	1 = ?`;
    } else{
        
        query = `SELECT DISTINCT
                    	TBP.IDPRODUTO,
                    	(CASE 
                    		WHEN TBP.IDGRUPOEMPRESARIAL IS NULL THEN 0 
                    		ELSE TBP.IDGRUPOEMPRESARIAL 
                    	END) AS IDGRUPOEMPRESARIAL,
                    	(CASE 
                    		WHEN TBGE.DSGRUPOEMPRESARIAL IS NULL THEN 'TODOS'
                    		ELSE  TBGE.DSGRUPOEMPRESARIAL
                    	END) AS GRUPOEMPRESARIAL,
                    	TBPP.IDEMPRESA,
                    	TBEMP.NOFANTASIA,
                    	TBP.DSNOME,
                    	TBP.STGRADE,
                    	TBP.UND,
                    	TBP.NUCODBARRAS,
                    	TBP.NUNCM,
                    	TBP.PRECOCUSTO,
                    	IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA ) AS PRECOVENDA,
                    	TBP.NUREFERENCIA,
                    	TBP.DTULTALTERACAO,
                    	TBP.GRP_MATERIAIS,
                    	TBP.STATIVO,
                    	TBP.IDSUBGRUPO,
                    	TBPEM.SUBGRUPO,
                    	TBES.DSESTILO,
                    	TBLE.DSLOCALEXPOSICAO,
                    	TBPEM.MARCA
                    FROM
                    	"VAR_DB_NAME".PRODUTO_PRECO TBPP
                    INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                    	TBPP.IDPRODUTO = TBP.IDPRODUTO
                    LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                    	TBPEM.IDPRODUTO = TBP.IDPRODUTO
                    LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                    	TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
                    INNER JOIN "VAR_DB_NAME".EMPRESA TBEMP ON
                        TBPP.IDEMPRESA = TBEMP.IDEMPRESA
                    LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                        TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
                    LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                        TBES.IDESTILO = TBP.IDESTILO
                    WHERE 
                        TBPP.IDEMPRESA = ${idEmpresa}
                    	AND 1 = ?`;
    }
    
    if ( byId ) {
        query += ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
    }
    
    if ( dataUltAtualizacao ) {
        query = query + ' And  tbp.DTULTALTERACAO >= \'' + dataUltAtualizacao + ' ' + horaUltAtualizacao + '\' ';
    }
    
    if(idGrupoEmpresarial || (idEmpresa ==='31' || idEmpresa ==='109' || idEmpresa ==='56' || idEmpresa ==='90' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='51' || idEmpresa ==='86')){
        idGrupoEmpresarial = idGrupoEmpresarial || null
        
        if(idEmpresa ==='31' || idEmpresa ==='109'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2)`;
        }else if(idEmpresa ==='90' || idEmpresa ==='56' || idEmpresa ==='68' || idEmpresa ==='70' || idEmpresa ==='5' || idEmpresa ==='86'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else if(idEmpresa ==='51'){
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL OR TBP.IDGRUPOEMPRESARIAL = 1 OR TBP.IDGRUPOEMPRESARIAL = 2 OR TBP.IDGRUPOEMPRESARIAL = 4)`;
        }else{
            query += `AND (TBP.IDGRUPOEMPRESARIAL = ${idGrupoEmpresarial} OR TBP.IDGRUPOEMPRESARIAL = 0 OR TBP.IDGRUPOEMPRESARIAL IS NULL)`; 
        }
    }
    
    if ( codeBars ) {
        query += ` And  TBP.NUCODBARRAS = '${codeBars}' `;
    }
    
    if ( descProd ) {
        descProd = descProd.split(' ').join('%');
        
        query += ` And  CONTAINS((tbp.DSNOME, tbp.NUCODBARRAS), '%${descProd}%')`;
    }
    
    query += `ORDER BY ${idGrupoEmpresarial == 'TODAS_FILIAIS' ? 'TBEMP.IDEMPRESA, TBP.IDPRODUTO' : idGrupoEmpresarial ? 'TBP.IDGRUPOEMPRESARIAL' : 'TBP.IDPRODUTO'}`;
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function atualizarHistoricoPrecoLista(bodyJson, conn){
    let prodListQuery = '';
    let idListaPreco = bodyJson[0]['IDLISTAPRECO'];
    let contador = 0;
    
    bodyJson.map((registro, indice) => {
        
        let updateRegProdHist = `UPDATE 
                                    	"VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                    SET
                                    	STATIVO = 'False'
                                    WHERE
                                    	IDPRODUTO = '${registro['IDPRODUTO']}'
                                    	AND STATIVO = 'True'
                                    	AND IDRESUMOLISTAPRECO = ? `;
         
           let pStmtUpdateHist = conn.prepareStatement(api.replaceDbName(updateRegProdHist));
         
            pStmtUpdateHist.setInt(1, parseInt(idListaPreco));
            
            pStmtUpdateHist.execute();
            pStmtUpdateHist.close();
      /*  if(indice == bodyJson.length - 1 || contador >= 500){
            prodListQuery += `'${registro['IDPRODUTO']}'`;
            
        } else if(indice < bodyJson.length -1){
            prodListQuery += `'${registro['IDPRODUTO']}',`;
            
        }
        
        if(contador >= 500 || (indice == bodyJson.length - 1)){
            let updateRegProdHist = `UPDATE 
                                    	"VAR_DB_NAME".HISTORICOPRODUTOLISTAPRECO
                                    SET
                                    	STATIVO = 'False'
                                    WHERE
                                    	IDPRODUTO IN(${prodListQuery})
                                    	AND STATIVO = 'True'
                                    	AND IDRESUMOLISTAPRECO = ? `;
         
           let pStmtUpdateHist = conn.prepareStatement(api.replaceDbName(updateRegProdHist));
         
            pStmtUpdateHist.setInt(1, parseInt(idListaPreco));
            
            pStmtUpdateHist.execute();
            pStmtUpdateHist.close();
         
            contador = 0;
        }
     
        contador++*/
    });
    
    conn.commit();
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
            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}