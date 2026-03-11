function replaceDbName(query) {
	return query.replace(/VAR_DB_NAME/g, 'QUALITY_CONC_HML').replace(/VAR_DB_SAP_NAME/g, 'SBO_GTO_TESTE4');
}

function getConnection(){
    var conn = $.hdb.getConnection({"sqlcc": "quality.concentrador_homologacao.api::sql_conn", "pool": true});
    conn.executeUpdate('SET SCHEMA QUALITY_CONC_HML');
    return conn;
}

function sqlQueryTst(query, args){
    
    var conn = getConnection();
    
    var parameters = [query];
    
    for (var i = 0; i < args.length; i++) {
       parameters.push(args[i]);
    }
    
    var res = conn.executeQuery.apply(conn, parameters);
    
    var iterator = res.getIterator();
	var data = [];
	
    while (iterator.next()) {
		var currentRow = iterator.value();
		data.push(currentRow);
	}
    
    return data;
}

function totalOfRecords(query, queryParams) {

	var conn = getConnection();

	var res = conn.executeQuery("SELECT COUNT(*) AS QTD FROM (" + replaceDbName(query).replace("$RECORDS", "") + ")", queryParams);
	var iterator = res.getIterator();
	var data = [];

	while (iterator.next()) {
		var currentRow = iterator.value();
		data.push(currentRow);
	}

	return Number(data[0].QTD.toString());

}

function executeScalar(query, queryParams) {

	var conn = getConnection();

	var res = conn.executeQuery(replaceDbName(query), queryParams);
	var iterator = res.getIterator();
	var data = [];

	while (iterator.next()) {
		var currentRow = iterator.value();
		data.push(currentRow[0]);
	}

	return Number(data[0].toString());
}

function sqlQuery(query, queryParams) {

	var conn = getConnection();
    
	var res = conn.executeQuery(replaceDbName(query), queryParams);
	var iterator = res.getIterator();
	var data = [];

	while (iterator.next()) {
		var currentRow = iterator.value();
		data.push(currentRow);
	}

	return data;
}

function sqlQuery_Prepare(query, params) {
	let conn = $.db.getConnection();
	let pstmt = conn.prepareStatement(replaceDbName(query));
	   
	pstmt.setInt(1, params);
	
	let res = pstmt.executeQuery();
	let data = [];
	
    while (res.next()) {
        let md = res.getMetaData();
        let count = md.getColumnCount();
        let row = {};
        
        for (let c = 1; c <= count; c++) {
            row[md.getColumnLabel(c)] = res.getString(c);
        }
        
        data.push(row);
    }

    pstmt.close();
    
    return data;
}

function responseWithQuery(query, responsePage, queryParams) {

	try {

		responsePage.rows = totalOfRecords(query, queryParams);
		responsePage.page = responsePage.page || 1;
		responsePage.pageSize = responsePage.pageSize || 1000;

		const rowStart = (responsePage.page - 1) * responsePage.pageSize;

		var conn = $.hdb.getConnection();
		var queryTop = replaceDbName(query) + " LIMIT " + responsePage.pageSize + " OFFSET " + rowStart; //.replace("$RECORDS", "TOP " + responsePage.pageSize);

		var res = conn.executeQuery(queryTop, queryParams);

		var iterator = res.getIterator();
		var data = [];

		while (iterator.next()) {
			var currentRow = iterator.value();
			data.push(currentRow);
		}

		responsePage.data = data;

		$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(responsePage));
		$.response.status = $.net.http.OK;
	} catch (e) {
		$.response.contentType = 'application/json';
		$.response.setBody(JSON.stringify(e.message));
		$.response.status = 400;
	}

}

function sqlQueryPage(query, responsePage, queryParams) {

	responsePage.rows = totalOfRecords(query, queryParams);
	responsePage.page = responsePage.page || 1;
	responsePage.pageSize = responsePage.pageSize || 1000;

	const rowStart = (responsePage.page - 1) * responsePage.pageSize;

	var conn = $.hdb.getConnection();
	var queryTop = replaceDbName(query) + " LIMIT " + responsePage.pageSize + " OFFSET " + rowStart; //.replace("$RECORDS", "TOP " + responsePage.pageSize);

	var res = conn.executeQuery(queryTop, queryParams);

	var iterator = res.getIterator();
	var data = [];

	while (iterator.next()) {
		var currentRow = iterator.value();
		data.push(currentRow);
	}

	responsePage.data = data;

	return responsePage;

}