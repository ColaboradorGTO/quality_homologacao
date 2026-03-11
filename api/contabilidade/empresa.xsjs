let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
let idsOutlets = ['31','51','67','70','76','89','104','109','113','116'];

function getListaAlvarasEmpresa(idEmpresa) {
    let data = [];
    let currentIdAlvara = '';
    let ITEMS = [];
    
    let query = `
        SELECT 
            *
        FROM (
            SELECT
                TBV.IDVINCULO,
                TBV.IDEMPRESA,
                TBA.IDALVARA,
                TBA.DESCRICAO AS DESCRICAOALVARA,
                TO_VARCHAR(TBV.DTINICIOCOMPETENCIAALVARA, 'YYYY-MM-DD') AS DTINICIOCOMPETENCIAALVARA,
                TO_VARCHAR(TBV.DTFIMCOMPETENCIAALVARA, 'YYYY-MM-DD') AS DTFIMCOMPETENCIAALVARA,
                TBS.IDSTATUS,
                TBS.DESCRICAO AS DESCRICAOSTATUS,
                TO_VARCHAR(TBV.DESCRICAODETALHEANDAMENTO) AS DESCRICAODETALHEANDAMENTO,
                TBV.METRAGEMEMPRESA,
                TBV.STATIVO,
                TBV.ARQUIVOALVARA,
                ROW_NUMBER() OVER (
                    PARTITION BY 
                        TBA.IDALVARA
                    ORDER BY 
                        TBV.DTFIMCOMPETENCIAALVARA DESC,
                        TBV.STATIVO DESC,
                        TBV.IDVINCULO DESC
                ) AS RN
            FROM
                "VAR_DB_NAME".ALVARA TBA
            LEFT JOIN "VAR_DB_NAME".VINCULOALVARAEMPRESA TBV ON 
                TBV.IDALVARA = TBA.IDALVARA AND TBV.IDEMPRESA = ?
            LEFT JOIN "VAR_DB_NAME".STATUSANDAMENTOALVARA TBS ON 
                TBV.IDSTATUSANDAMENTO = TBS.IDSTATUS
        )
        WHERE 
            RN = 1
        ORDER BY 
            IDALVARA
    `;

    return api.sqlQuery(query, idEmpresa);
    
    let map = new Map();

    regs.forEach(registro => {
      let { IDALVARA, DESCRICAOALVARA, IDVINCULO } = registro;
    
      if (!map.has(IDALVARA)) {
        map.set(IDALVARA, {
          IDALVARA,
          DESCRICAOALVARA,
          ITEMS: []
        });
      }
      
      IDVINCULO && !map.get(IDALVARA).ITEMS.length && map.get(IDALVARA).ITEMS.push(registro);
    });
    
    data = Array.from(map.values());
    
    return data
}

function getListaGerentesEmpresa(idEmpresa) {
    let query = `
        SELECT TOP 3
            IDFUNCIONARIO,
            NOFUNCIONARIO,
            DSFUNCAO,
            TELEFONE,
            STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO
        WHERE
            IDEMPRESA = ?
            AND STATIVO = 'True'
            AND CONTAINS(DSFUNCAO, 'Gerente%')
        ORDER BY 
            IDFUNCIONARIO
    `;

    return api.sqlQuery(query, idEmpresa);
}

function getSupervisorEmpresa(idSupervisor) {
    let query = `
        SELECT TOP 3
            IDFUNCIONARIO,
            NOFUNCIONARIO,
            DSFUNCAO,
            TELEFONE,
            STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO
        WHERE
            IDFUNCIONARIO = ?
            AND STATIVO = 'True'
        ORDER BY 
            IDFUNCIONARIO
    `;

    return api.sqlQuery(query, idSupervisor);
}

function montarResponse(response){
    let newArrayData = [];
    let { data } = response || [];
    
    for(let registro of data){
        let {
            IDEMPRESA,
            IDFUNCIONARIOSUPERVISOR,
        } = registro;
        
        let LISTA_ALVARAS = getListaAlvarasEmpresa(IDEMPRESA);
        let objEmpresa = Object.assign({}, registro, { LISTA_ALVARAS });
        
        newArrayData.push(objEmpresa);
    }
    
    response.data = newArrayData;
    
    return response;
}

function fnHandleGet(byId) {
    
    let idEmpresa = $.request.parameters.get("idEmpresa");
    let idSubGrupoEmpresa = $.request.parameters.get("idSubGrupoEmpresa");
    let nuCnpj = $.request.parameters.get("cnpj");
    let uf = $.request.parameters.get("uf");
    let stAtivo = $.request.parameters.get("stAtivo");
    
    let query = `
        SELECT
            TBE.IDEMPRESA,
            TBE.STGRUPOEMPRESARIAL,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            TBE.NORAZAOSOCIAL,
            TBE.NOFANTASIA,
            TBE.NUCNPJ,
            TBE.NUINSCESTADUAL,
            TBE.NUINSCMUNICIPAL,
            TBE.CNAE,
            TO_VARCHAR(TBE.EENDERECO) AS EENDERECO,
            TO_VARCHAR(TBE.ECOMPLEMENTO) AS ECOMPLEMENTO,
            TO_VARCHAR(TBE.EBAIRRO) AS EBAIRRO,
            TO_VARCHAR(TBE.ECIDADE) AS ECIDADE,
            TBE.SGUF,
            TBE.NUUF,
            TBE.NUCEP,
            TBE.NUIBGE,
            TBE.EEMAILPRINCIPAL,
            TBE.EEMAILCOMERCIAL,
            TBE.EEMAILFINANCEIRO,
            TBE.EEMAILCONTABILIDADE,
            TBE.NUTELPUBLICO,
            TBE.NUTELCOMERCIAL,
            TBE.NUTELFINANCEIRO,
            TBE.NUTELGERENCIA,
            TBE.EURL,
            TBE.PATHIMG,
            TBE.NUCNAE,
            TBE.STECOMMERCE,
            TO_VARCHAR(TBE.DTULTATUALIZACAO, 'YYYY-MM-DD HH24:MI:SS') AS DTULTATUALIZACAO,
            TBE.STATIVO,
            TBE.IDFUNCIONARIOSUPERVISOR
        FROM
            "VAR_DB_NAME".EMPRESA TBE
        WHERE
            1 = ?
        `;
    
    if (byId) {
        query += `AND TBE.IDEMPRESA = '${byId}' `;
    }
    
    if (idSubGrupoEmpresa) {
        let clausula = `AND TBE.IDSUBGRUPOEMPRESARIAL = '${idSubGrupoEmpresa}' AND NOT CONTAINS(TBE.NOFANTASIA, '%${idSubGrupoEmpresa}%') `;
        
        if( idSubGrupoEmpresa == 'OUTLET'){
            clausula = `AND CONTAINS(TBE.NOFANTASIA, '%${idSubGrupoEmpresa}%')`
        }
        
        query += clausula;
    }
    
    if (nuCnpj) {
        query += `AND TBE.NUCNPJ = '${nuCnpj}' `;
    }
    
    if(uf){
        query += ` AND  UPPER(TBE.SGUF) = UPPER('${uf}') `;
    }

    if(stAtivo){
        query += `AND TBE.STATIVO = '${stAtivo}' `;
    }
    
    query += ' ORDER BY IDEMPRESA ';
    
    let request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    let listaEmpresas = api.sqlQueryPage(query, request, 1);
    
    let response = montarResponse(listaEmpresas);
    
    return response;
}

function fnHandlePut() {
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."EMPRESA" SET ' + 
        ' "STGRUPOEMPRESARIAL" = ?, ' +
        ' "IDGRUPOEMPRESARIAL" = ?, ' +
        ' "IDSUBGRUPOEMPRESARIAL" = ?, ' +
        ' "NORAZAOSOCIAL" = ?, ' +
        ' "NOFANTASIA" = ?, ' +
        ' "NUCNPJ" = ?, ' +
        ' "NUINSCESTADUAL" = ?, ' +
        ' "NUINSCMUNICIPAL" = ?, ' +
        ' "CNAE" = ?, ' +
        ' "EENDERECO" = ?, ' +
        ' "ECOMPLEMENTO" = ?, ' +
        ' "EBAIRRO" = ?, ' +
        ' "ECIDADE" = ?, ' +
        ' "SGUF" = ?, ' +
        ' "NUUF" = ?, ' +
        ' "NUCEP" = ?, ' +
        ' "NUIBGE" = ?, ' +
        ' "EEMAILPRINCIPAL" = ?, ' +
        ' "NUTELGERENCIA" = ?, ' +
        ' "NUCNAE" = ?, ' +
        ' "STECOMMERCE" = ?, ' +
        ' "DTULTATUALIZACAO" = ?, ' +
        ' "STATIVO" = ?, ' +
        ' "ALIQPIS" = ?, ' +
        ' "ALIQCOFINS" = ? ' + 
    	' WHERE "IDEMPRESA" =  ? ';
        
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
    var bodyJson = JSON.parse($.request.body.asString()); 

    for (var i = 0; i < bodyJson.length; i++) {

		var registro = bodyJson[i];

        pStmt.setInt(1, registro.STGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.CNAE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setInt(15, registro.NUUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.NUIBGE);
        pStmt.setString(18, registro.EEMAILPRINCIPAL);
        pStmt.setString(19, registro.NUTELGERENCIA);
        pStmt.setString(20, registro.NUCNAE);
        pStmt.setString(21, registro.STECOMMERCE);
        pStmt.setDate(22, registro.DTULTATUALIZACAO);
        pStmt.setString(23, registro.STATIVO);
        pStmt.setFloat(24, registro.ALIQPIS);
        pStmt.setFloat(25, registro.ALIQCOFINS);
        pStmt.setInt(26, registro.IDEMPRESA);
                    
    	pStmt.execute();
    }
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    var conn = $.db.getConnection();
    
    var query = 'INSERT INTO "VAR_DB_NAME"."EMPRESA" ' +
		" ( " +
		' "IDEMPRESA", ' +
        ' "STGRUPOEMPRESARIAL", ' +
        ' "IDGRUPOEMPRESARIAL", ' +
        ' "IDSUBGRUPOEMPRESARIAL", ' +
        ' "NORAZAOSOCIAL", ' +
        ' "NOFANTASIA", ' +
        ' "NUCNPJ", ' +
        ' "NUINSCESTADUAL", ' +
        ' "NUINSCMUNICIPAL", ' +
        ' "CNAE", ' +
        ' "EENDERECO", ' +
        ' "ECOMPLEMENTO", ' +
        ' "EBAIRRO", ' +
        ' "ECIDADE", ' +
        ' "SGUF", ' +
        ' "NUUF", ' +
        ' "NUCEP", ' +
        ' "NUIBGE", ' +
        ' "EEMAILPRINCIPAL", ' +
        ' "EEMAILCOMERCIAL", ' +
        ' "EEMAILFINANCEIRO", ' +
        ' "EEMAILCONTABILIDADE", ' +
        ' "NUTELPUBLICO", ' +
        ' "NUTELCOMERCIAL", ' +
        ' "NUTELFINANCEIRO", ' +
        ' "NUTELGERENCIA", ' +
        ' "EURL", ' +
        ' "PATHIMG", ' +
        ' "NUCNAE", ' +
        ' "STECOMMERCE", ' +
        ' "DTULTATUALIZACAO", ' +
        ' "STATIVO", ' +
        ' "ALIQPIS", ' +
        ' "ALIQCOFINS" ' + 
    	' ) ' +
		' VALUES(QUALITY_CONC_HML.SEQ_EMPRESA.NEXTVAL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ';
		
    var pStmt = conn.prepareStatement(api.replaceDbName(query));
	var bodyJson = JSON.parse($.request.body.asString());

	for (var i = 0; i < bodyJson.length; i++) {
        
		var registro = bodyJson[i];
		
		pStmt.setInt(1, registro.STGRUPOEMPRESARIAL);
        pStmt.setInt(2, registro.IDGRUPOEMPRESARIAL);
        pStmt.setInt(3, registro.IDSUBGRUPOEMPRESARIAL);
        pStmt.setString(4, registro.NORAZAOSOCIAL);
        pStmt.setString(5, registro.NOFANTASIA);
        pStmt.setString(6, registro.NUCNPJ);
        pStmt.setString(7, registro.NUINSCESTADUAL);
        pStmt.setString(8, registro.NUINSCMUNICIPAL);
        pStmt.setString(9, registro.CNAE);
        pStmt.setString(10, registro.EENDERECO);
        pStmt.setString(11, registro.ECOMPLEMENTO);
        pStmt.setString(12, registro.EBAIRRO);
        pStmt.setString(13, registro.ECIDADE);
        pStmt.setString(14, registro.SGUF);
        pStmt.setInt(15, registro.NUUF);
        pStmt.setString(16, registro.NUCEP);
        pStmt.setString(17, registro.NUIBGE);
        pStmt.setString(18, registro.EEMAILPRINCIPAL);
        pStmt.setString(19, registro.EEMAILCOMERCIAL);
        pStmt.setString(20, registro.EEMAILFINANCEIRO);
        pStmt.setString(21, registro.EEMAILCONTABILIDADE);
        pStmt.setString(22, registro.NUTELPUBLICO);
        pStmt.setString(23, registro.NUTELCOMERCIAL);
        pStmt.setString(24, registro.NUTELFINANCEIRO);
        pStmt.setString(25, registro.NUTELGERENCIA);
        pStmt.setString(26, registro.EURL);
        pStmt.setString(27, registro.PATHIMG);
        pStmt.setString(28, registro.NUCNAE);
        pStmt.setString(29, registro.STECOMMERCE);
        pStmt.setDate(30, registro.DTULTATUALIZACAO);
        pStmt.setString(31, registro.STATIVO);
        pStmt.setFloat(32, registro.ALIQPIS);
        pStmt.setFloat(33, registro.ALIQCOFINS);
    	
        pStmt.execute();
	}

	pStmt.close();

	conn.commit();
	
    return {
	    "msg": "Inclusão realizada com sucesso!"
	};
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
            $.response.setBody(JSON.stringify(fnHandleGet(id)));
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
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}