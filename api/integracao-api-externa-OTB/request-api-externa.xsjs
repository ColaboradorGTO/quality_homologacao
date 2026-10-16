let path = "quality.concentrador_homologacao.api";
let api = $.import(path, "apiResponse");
let auth = $.import(path + ".integracao-api-externa-OTB.libs", "auth");

let dbNameSAP = 'SBO_GTO_TESTE4';
let conn;

function fnHandleGet(){
    let token = auth.getAccessToken();
    
    return token
}

function fnHandlePost(){
    let dados = JSON.parse($.request.body.asString());
    let client = new $.net.http.Client();
    let request = new $.net.http.Request($.net.http.POST, "/post");
    let destination = $.net.http.readDestination("quality.concentrador_homologacao.api.teste.teste-api-externa.url", "httpbin");
    
    request.headers.set("Content-Type", "application/json");
    request.headers.set("Accept", "application/json");
    request.headers.set("Authorization", "Bearer SEU_TOKEN");
    //let dados = {};
    request.setBody(JSON.stringify(dados));
    
    client.request(request, destination);
    
    let response = client.getResponse();
    
    let requestJson = {};
    let destJson = {};
    let responseJson = {};

    for (var prop in request) {
        try {
            if(prop == "entities" || prop == "cookies" || prop == 'parameters'){
                requestJson[prop] = JSON.parse(request[prop].asString());
            } else {
                requestJson[prop] = request[prop];
            }
        } catch (e) {
            requestJson[prop] = null;
        }
    }

    for (var prop in destination) {
        try {
            destJson[prop] = destination[prop];
        } catch (e) {
            destJson[prop] = null;
        }
    }
    
    for (var prop in response) {
        try {
            if(prop == "body"){
                responseJson[prop] = JSON.parse(response[prop].asString());
            } else {
                responseJson[prop] = response[prop];
            }
        } catch (e) {
            responseJson[prop] = null;
        }
    }

    let bodyString = response.body ? response.body.asString() : "";

    let bodyJson = null;

    try {
        bodyJson = JSON.parse(bodyString);
    } catch(e) {
        bodyJson = bodyString;
    }

    let result = {
        status: response.status,
        body: bodyJson,
        headers: response.headers,
        request: requestJson,
        destination: destJson,
        response: responseJson
    };

    client.close();
  //  return JSON.parse(response.body.asString())
    return result;
}

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.GET:
            var docReturn = fnHandleGet();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your POST calls here
        case $.net.http.POST:
            var docReturn = fnHandlePost();
            $.response.setBody(JSON.stringify(docReturn));
            break;
    }
    
} catch (e) {
    let detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
        detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({
        message: e.message,
        detalheError
    }));
    $.response.status = 400;
}   