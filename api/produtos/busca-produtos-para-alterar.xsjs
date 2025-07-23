var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var IDRESUMOALTERACAOPRECO;
var conn;

function setIntOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setInt(fieldId, value);
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setDate(fieldId, value);
}

function fnHandleGet(byId) {
    
    var dtCadInicio = $.request.parameters.get("dtCadProdInicio");
    var dtCadFim = $.request.parameters.get("dtCadProdFim");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var idGrupoEmpresarial = $.request.parameters.get("idGrupoEmpresarial");
    var codeBars = $.request.parameters.get("codeBars");
    var descProd = $.request.parameters.get("descProd");
    var idGrpEstrutura = $.request.parameters.get("idGrpEstrutura");
    var idsSubgrpEstrutura = $.request.parameters.get("idsSubgrpEstrutura");
    var precoInicial = $.request.parameters.get("precoInicial");
    var precoFinal = $.request.parameters.get("precoFinal");
    var query;

    if(!idEmpresa){
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                TO_VARCHAR(IFNULL(TBP.DTCADASTRO, (SELECT "CreateDate" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = TBP.IDPRODUTO)), 'DD/MM/YYYY HH24:MI:SS') AS DTCADASTRO,
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
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".HISTORICOALTERACAOPRECOPRODUTOLISTAPRECO TBHP
            RIGHT JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBP.IDPRODUTO = TBHP.IDPRODUTO AND TBP.STATIVO =  'True' AND TBHP.IDRESUMOLISTAPRECO = ${idGrupoEmpresarial} AND TBHP.STATIVO =  'True'
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
            LEFT JOIN "VAR_DB_NAME".GRUPOEMPRESARIAL TBGE ON
                TBGE.IDGRUPOEMPRESARIAL = TBP.IDGRUPOEMPRESARIAL
            LEFT JOIN "VAR_DB_NAME".LOCALEXPOSICAO TBLE ON
                TBLE.IDLOCALEXPOSICAO = TBP.IDLOCALEXPOSICAO
            LEFT JOIN "VAR_DB_NAME".ESTILOS TBES ON
                TBES.IDESTILO = TBP.IDESTILO
            WHERE 
                1 = ?
                AND TBP.STATIVO = 'True'
        `;
    } else{
        query = `
            SELECT DISTINCT
                TBP.IDPRODUTO,
                TO_VARCHAR(IFNULL(TBP.DTCADASTRO, (SELECT "CreateDate" FROM SBO_GTO_PRD.OITM WHERE "ItemCode" = TBP.IDPRODUTO)), 'DD/MM/YYYY HH24:MI:SS') AS DTCADASTRO,
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
                TBPEM.MARCA,
                IFNULL(TBGS.DSGRUPOESTRUTURA, TBPEM.GRUPO) AS DSGRUPOESTRUTURA,
                TBGS.IDGRUPOESTRUTURA,
                IFNULL(TBSE.IDSUBGRUPOESTRUTURA, TBPEM.IDSUBGRUPO) AS IDSUBGRUPOESTRUTURA,
                IFNULL(TBSE.DSSUBGRUPOESTRUTURA, TBPEM.SUBGRUPO) AS DSSUBGRUPOESTRUTURA
            FROM
                "VAR_DB_NAME".PRODUTO_PRECO TBPP
            INNER JOIN "VAR_DB_NAME".PRODUTO TBP ON
                TBPP.IDPRODUTO = TBP.IDPRODUTO AND TBP.STATIVO =  'True'
            LEFT JOIN "VAR_DB_NAME".VW_PRODUTO_ESTRUTURA_MERCADOLOGICA TBPEM ON
                TBPEM.IDPRODUTO = TBP.IDPRODUTO
            LEFT JOIN "VAR_DB_NAME".SUBGRUPOESTRUTURA TBSE ON
                TBP.IDSUBGRUPO = TBSE.IDSUBGRUPOESTRUTURA
            LEFT JOIN "VAR_DB_NAME".GRUPOESTRUTURA TBGS ON
                (TBSE.IDGRUPOESTRUTURA = TBGS.IDGRUPOESTRUTURA OR UPPER(TBPEM.GRUPO) = UPPER(TBGS.DSGRUPOESTRUTURA))
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
                AND TBP.STATIVO = 'True'
                AND 1 = ?
        `;
    }
    
    if ( byId ) {
        query += ' And  tbp.IDPRODUTO = \'' + byId + '\' ';
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
       // descProd = descProd.split(' ').join('%');
        
        query += ` And  CONTAINS((tbp.DSNOME), '%${descProd}%')`;
    }
    
    if(idGrpEstrutura){
        query +=  ` AND TBGS.IDGRUPOESTRUTURA IN (${idGrpEstrutura}) `;
    }
    
    if(idsSubgrpEstrutura){
        //idsSubgrpEstrutura = idsSubgrpEstrutura.split(',').join(',');
        query +=  ` AND (TBSE.IDSUBGRUPOESTRUTURA IN (${idsSubgrpEstrutura}) OR TBPEM.IDSUBGRUPO IN (${idsSubgrpEstrutura})) `;
    }
    
    if(precoInicial && precoFinal){
        precoInicial = parseFloat(precoInicial);
        precoFinal = parseFloat(precoFinal);
        query += !idEmpresa ? ` AND LEAST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) >= ${precoInicial} AND GREATEST(IFNULL(TBHP.PRECOVENDA, TBP.PRECOVENDA)) <= ${precoFinal} ` : ` AND LEAST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) >= ${precoInicial} AND GREATEST(IFNULL(tbpp.PRECO_VENDA, tbp.PRECOVENDA )) <= ${precoFinal} `
    }
    
    if ( dtCadInicio && dtCadFim) {
        query += ` And  TBP.DTCADASTRO BETWEEN '${dtCadInicio} 00:00:00' AND '${dtCadFim} 23:59:59' `;
    }
    
    query += `ORDER BY ${idGrupoEmpresarial == 'TODAS_FILIAIS' ? ' TBP.DSNOME, TBEMP.IDEMPRESA' : idGrupoEmpresarial ? ' TBP.DSNOME, TBP.IDGRUPOEMPRESARIAL' : ' TBP.DSNOME,TBP.IDPRODUTO'}`;

    /*$.response.contentType = 'application/json';
	$.response.setBody(JSON.stringify(query));
	$.response.status = $.net.http.OK;
    return;*/

    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    //return {query}
    api.responseWithQuery(query, request, 1);
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
           // $.response.setBody(JSON.stringify(fnHandleGet(id)));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}