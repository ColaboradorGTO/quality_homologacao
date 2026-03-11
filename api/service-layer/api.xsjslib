var securityStorage = new $.security.Store("localStore.xssecurestore");

function store(sessionId) {
    var config = {
        name: "sl-session-id",
        value: sessionId
    };
    
    securityStorage.store(config);
}

function read() {
    var config = {
        name: "sl-session-id"
    };
    
    var value = securityStorage.read(config);
    
    return value;
}

function readUrl(){
    var dest = $.net.http.readDestination("quality.concentrador_homologacao.api.service-layer", "url");
    return dest;
}

function getSessionId() {

    var request = new $.net.http.Request($.net.http.POST, "/Login");

   var login = {
        "CompanyDB": "SBO_GTO_TESTE4",
        "Password": "sap@123",
        "UserName": "invent.Fabio"  
    };
    
    request.setBody(JSON.stringify(login));

    var client = new $.net.http.Client();    
    // send the request and synchronously get the response
    client.request(request, readUrl());
    var response = client.getResponse();
    
    //throw response.body.asString();
    
    var sessionId = JSON.parse(response.body.asString()).SessionId;
    
    client.close();
    
    return sessionId;
}

function getLocal(pathUrl, session){
    
    var dest = readUrl();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.GET, pathUrl);
    
    request.cookies.set('B1SESSION', session);
    
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}

function testSession(session) {
    
    var response = getLocal('/Users(1)?$select=UserCode', session);
    
    if(response.status === 401) {
        store('');
        session = getSessionId();
        store(session);
    }
    
    return session;
    
}

function loginServiceLayer(force){
    
    var session = read();

    if(!session || force){
        
        var sessionId = getSessionId();
        
        store(sessionId);
    }
    
    session = testSession(session);
    
    return session;
}

function getSL(pathUrl, session){
    let dest = readUrl();
    let client = new $.net.http.Client();
    let request = new $.net.http.Request($.net.http.GET, pathUrl);
   
    request.cookies.set('B1SESSION', session);
    
    client.request(request, dest);
    
    let response = client.getResponse();
    
    client.close();
    
    return response;
 }

function postBatch(client, batch, session){
    let dest = readUrl();
    
    let request = new $.net.http.Request($.net.http.POST, "/$batch");
    let { boundary, body } = batch;
    
    request.cookies.set('B1SESSION', session);
    
    request.headers.set("OData-Version", "3.0");
    request.headers.set("Content-Type", "multipart/mixed;charset=UTF-8;boundary=" + boundary);
    request.headers.set("Prefer", "odata.continue-on-error");
    request.headers.set("Accept", "multipart/mixed");
    request.headers.set("Connection", "keep-alive");
    request.headers.set("Accept-Encoding", "gzip");
    request.headers.set("Content-Encoding", "gzip");
    
    request.setBody(body);
    
    client.request(request, dest);
    
    let response = client.getResponse();
    
    return response;
 }

function post(pathUrl, body, session){
   
    var dest = readUrl();
    //session = testSession(session);
    //var session = loginServiceLayer();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.POST, pathUrl);
    
    
    request.cookies.set('B1SESSION', session);
    request.headers.set('Prefer', 'return-no-content');
    request.setBody(JSON.stringify(body));
    
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
 }
 
function patch(pathUrl, body, session, stReplaceCollections = false){
    var dest = readUrl();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.PATCH, pathUrl);
    
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('Accept', 'application/json');
    request.headers.set('Prefer', 'return-no-content');
    //request.headers.set('Cache-Control', 'no-cache');
    //request.headers.set('Pragma', 'no-cache');*/
    //request.headers.set('Prefer', 'return=representation');
    
    if (stReplaceCollections) {
        request.headers.set('B1S-ReplaceCollectionsOnPatch', 'true');
    }
    
    request.cookies.set('B1SESSION', session);
    request.setBody(JSON.stringify(body));
    
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}


function put(pathUrl, body, session, stReplaceCollections = false){
   
    var dest = readUrl();
    //session = testSession(session);
    //var session = loginServiceLayer();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.PUT, pathUrl);
    
    
    request.cookies.set('B1SESSION', session);
    request.headers.set('Prefer', 'return-no-content');
    //stReplaceCollections && request.headers.set('B1S-ReplaceCollectionsOnPatch', 'true');
    request.setBody(JSON.stringify(body));
    
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}

function getData(pathUrl, session){
   
    var dest = readUrl();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.GET, pathUrl);
   
    request.cookies.set('B1SESSION', session);

    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}

function testget(pathUrl){
   
    var dest = readUrl();
    
    var session = loginServiceLayer();
    //var session = '469e6884-d088-11ec-8000-005056b5a3a0';
    var client = new $.net.http.Client();
   
    var request = new $.net.http.Request($.net.http.GET, pathUrl);
   
    request.cookies.set('B1SESSION', session);
     //request.setBody(JSON.stringify(body));
     
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}