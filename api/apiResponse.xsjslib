function replaceDbName(query) {
	return query.replace(/VAR_DB_NAME/g, 'QUALITY_CONC_HML').replace(/VAR_DB_SAP_NAME/g, 'SBO_GTO_TESTE4');
}

function getConnection(){
    var conn = $.hdb.getConnection({"sqlcc": "quality.concentrador_homologacao.api::sql_conn", "pool": true});
    conn.executeUpdate('SET SCHEMA QUALITY_CONC_HML');
    return conn;
}

function getParameters(query, args) {
    query = replaceDbName(query);
    
    var parameters = [query];

    if (args === undefined || args === null) {
        return parameters;
    }
    
    if (!Array.isArray(args)) {
        args = [args];
    }
    
    for (var i = 0; i < args.length; i++) {
        parameters.push(args[i]);
    }
    
    return parameters;
}

function sqlQueryTst(query, args){
    var conn = getConnection();
    try {
        var parameters = [query];
        for (var i = 0; i < args.length; i++) {
           parameters.push(args[i]);
        }
        
        // Retorna os dados diretamente sem usar o Iterator instável
        var res = conn.executeQuery.apply(conn, parameters);
        return Array.prototype.slice.call(res); 
    } finally {
        conn.close(); 
    }
}

function totalOfRecords(query, queryParams) {
	var conn = getConnection();
    try {
        var res = conn.executeQuery("SELECT COUNT(*) AS QTD FROM (" + replaceDbName(query).replace("$RECORDS", "") + ")", queryParams);
        
        // Transforma o resultado diretamente em Array segura na memória
        var data = Array.prototype.slice.call(res);
        
        if (data && data.length > 0) {
            return Number(data[0].QTD.toString());
        }
        return 0;
    } finally {
        conn.close(); 
    }
}

function executeScalar(query, queryParams) {
	var conn = getConnection();
    try {
        var res = conn.executeQuery(replaceDbName(query), queryParams);
        var data = Array.prototype.slice.call(res);
        
        if (data && data.length > 0) {
            // Captura dinamicamente a primeira coluna independente do nome
            for (var key in data[0]) {
                return Number(data[0][key].toString());
            }
        }
        return 0;
    } finally {
        conn.close(); 
    }
}

function sqlQuery(query, queryParams) {
	var conn = getConnection();
    try {
        var res = conn.executeQuery(replaceDbName(query), queryParams);
        return Array.prototype.slice.call(res);
    } finally {
        conn.close(); 
    }
}

function responseWithQuery(query, responsePage, queryParams) {
    var conn = null;
	try {
		responsePage.rows = totalOfRecords(query, queryParams);
		responsePage.page = responsePage.page || 1;
		responsePage.pageSize = responsePage.pageSize || 1000;

		const rowStart = (responsePage.page - 1) * responsePage.pageSize;

		conn = getConnection(); 
		var queryTop = replaceDbName(query) + " LIMIT " + responsePage.pageSize + " OFFSET " + rowStart;

		var res = conn.executeQuery(queryTop, queryParams);
		
		// Converte diretamente sem risco de fechar metadados no laço 'while'
		responsePage.data = Array.prototype.slice.call(res);

		$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(responsePage));
		$.response.status = $.net.http.OK;
	} catch (e) {
		$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(e.message));
		$.response.status = 400;
	} finally {
	    if (conn) {
	        conn.close();
	    }
	}
}

function sqlQueryPage(query, responsePage, queryParams) {
	responsePage.rows = totalOfRecords(query, queryParams);
	responsePage.page = responsePage.page || 1;
	responsePage.pageSize = responsePage.pageSize || 1000;

	const rowStart = (responsePage.page - 1) * responsePage.pageSize;

	var conn = getConnection();
    try {
    	var queryTop = replaceDbName(query) + " LIMIT " + responsePage.pageSize + " OFFSET " + rowStart;
    
    	var res = conn.executeQuery(queryTop, queryParams);
    	responsePage.data = Array.prototype.slice.call(res);
    	
    	return responsePage;
    } finally {
        conn.close();
    }
}