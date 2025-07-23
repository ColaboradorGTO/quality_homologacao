function setResponseError(err) {
	if ($.response.status === $.net.http.OK) {
		$.response.status = $.net.http.BAD_REQUEST;
	}

	$.response.setBody(JSON.stringify({
		msg: err.toString()
	}));
}