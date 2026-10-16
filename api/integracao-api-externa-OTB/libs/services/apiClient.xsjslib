let path = "quality.concentrador_homologacao.api.integracao-api-externa-OTB.libs";

let auth = $.import(path + ".security", "auth");

function readUrl(){
    return $.net.http.readDestination(path + ".services", "url");
}

function sendRequest(config){
    let {
        method,
        url,
        body,
        headers,
        useAuth
    } = config;

    headers = headers || {};

    if (useAuth !== false) {
        let { token } = auth.getAccessToken();

        headers["Authorization"] = "Bearer " + token;
    }

    return executeRequest({
        method,
        url,
        body,
        headers
    });
}

function executeRequest(config){
    let client = new $.net.http.Client();

    try {
        let request = new $.net.http.Request(
            config.method,
            config.url
        );

        let destination = readUrl();

        for (let key in config.headers){
            request.headers.set(
                key,
                config.headers[key]
            );
        }

        if (config.body){
            request.setBody(
                typeof config.body === "string"
                    ? config.body
                    : JSON.stringify(config.body)
            );
        }

        client.request(
            request,
            destination
        );

        let response = client.getResponse();

        let body = response.body
            ? response.body.asString()
            : "";

        return {
            status: response.status,
            body
        };

    } finally {
        client.close();
    }
}

function post(data, complementoURL){

    let response = sendRequest({
        method: $.net.http.POST,
        url: complementoURL,
        body: data,
        useAuth: true,
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    });
    
    if (response.status !== 200){
        throw new Error( "Erro na autenticação." );
    }
    
    return {
        status: response.status,
        body: response.body ? JSON.parse(response.body) : null
    };
    
}