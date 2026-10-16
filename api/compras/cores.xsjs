var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function validarSeExisteDescricaoOuSiglaAntesDeInserir(descricao, sigla){
    let query = ` 
        SELECT 
            1
        FROM 
            "VAR_DB_NAME".COR
        WHERE
            1 = ? 
            AND (
                UPPER(TRIM(DSCOR)) = UPPER(TRIM('${descricao}'))
                OR UPPER(TRIM(DSSIGLA)) = UPPER(TRIM('${sigla}'))
            )
            AND STBLOQUEADOPARACADASTROPRODUTONOVO = 'False'
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return reg.length > 0;
}

function validarSeExisteDescricaoOuSiglaAntesDeAtualizar(id, descricao, sigla){
    let query = ` 
        SELECT 
            1
        FROM 
            "VAR_DB_NAME".COR
        WHERE
            1 = ? 
            AND (
                UPPER(TRIM(DSCOR)) = UPPER(TRIM('${descricao}'))
                OR UPPER(TRIM(DSSIGLA)) = UPPER(TRIM('${sigla}'))
            )
            AND IDCOR <> '${id}'
            AND STBLOQUEADOPARACADASTROPRODUTONOVO = 'False'
    `;
    
    let reg = api.sqlQuery(query, 1) || [];
    
    return reg.length > 0;
}

function fnHandleGet(byId) {
    let idCor = $.request.parameters.get("idCor");
    let descCor = $.request.parameters.get("descCor");
    let idGrupoCor = $.request.parameters.get("idGrupoCor");
    
    let query = `
        SELECT 
            A.IDCOR AS ID_COR, 
            A.IDGRUPOCOR AS ID_GRUPOCOR, 
            A.DSCOR AS DS_COR, 
            A.DSSIGLA,
            A.STBLOQUEADOPARACADASTROPRODUTONOVO,
            A.STATIVO, 
            B.DSGRUPOCOR DS_GRUPOCOR 
        FROM 
            "VAR_DB_NAME".COR A 
        INNER JOIN "VAR_DB_NAME".GRUPOCOR B ON
            A.IDGRUPOCOR = B.IDGRUPOCOR
        WHERE
            1 = ?
    `;
    
    if(idGrupoCor){
        query += ` AND A.IDGRUPOCOR IN ( '${idGrupoCor}')  `;
    }
    
    if ( byId ) {
        query += ` AND A.IDCOR = '${byId}' `;
    }

    if ( idCor ) {
        query += ` AND A.IDCOR = '${idCor}' `;
    }

    if ( descCor ) {
        query += ` AND CONTAINS((A.DSCOR, A.DSSIGLA),'%${descCor}%') `;
    }
    

    query += `
        ORDER BY 
            CASE 
                WHEN UPPER(B.DSGRUPOCOR) = 'NOVO PADRÃO' THEN 0
                ELSE B.IDGRUPOCOR
            END,
            A.DSCOR 
    `;

    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let query = `
        UPDATE 
            "VAR_DB_NAME"."COR" 
        SET
            "IDGRUPOCOR" = ?,
            "DSCOR" = ?,
            "DSSIGLA" = ?,
            "STATIVO" = ?,
            "IDUSRULTIMAALTERACAO" = ?,
            "DTHORAULTIMAALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDCOR" =  ? 
    `;
    
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
    let bodyJson = JSON.parse($.request.body.asString()); 
    
    for (let registro of bodyJson) {
        let exist = validarSeExisteDescricaoOuSiglaAntesDeAtualizar(registro.IDCOR, registro.DSCOR, registro.DSSIGLA);
        
        if(exist){
            throw new Error('Já existe uma Cor com essa mesma DESCRIÇÃO ou SIGLA');
        }
        
        pStmt.setInt(1, registro.IDGRUPOCOR);
        pStmt.setString(2, registro.DSCOR);
        pStmt.setString(3, registro.DSSIGLA);
        pStmt.setString(4, registro.STATIVO);
        pStmt.setInt(5, registro.IDFUNCIONARIO);
        pStmt.setInt(6, registro.IDCOR);
        
        pStmt.execute();
    }
    
	pStmt.close();

	conn.commit();
	
	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost(){
    let conn = $.db.getConnection();
    let query = `
        INSERT INTO 
            "VAR_DB_NAME"."COR"
        (
            "IDGRUPOCOR",
            "DSCOR",
            "DSSIGLA",
            "IDUSRCRIACAO",
            "IDUSRULTIMAALTERACAO"
        )
        VALUES(?, ?, ?, ?, ?) 
    `;
	
    let pStmt = conn.prepareStatement(api.replaceDbName(query));
	let bodyJson = JSON.parse($.request.body.asString());
    
	for (let registro of bodyJson) {
        let exist = validarSeExisteDescricaoOuSiglaAntesDeInserir(registro.DSCOR, registro.DSSIGLA);
        
        if(exist){
            throw new Error('Já existe uma Cor com essa mesma DESCRIÇÃO ou SIGLA');
        }
        
        pStmt.setInt(1, registro.IDGRUPOCOR);
        pStmt.setString(2, registro.DSCOR);
        pStmt.setString(3, registro.DSSIGLA);
        pStmt.setInt(4, registro.IDFUNCIONARIO);
        pStmt.setInt(5, registro.IDFUNCIONARIO);
        	
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
            fnHandleGet(id);
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