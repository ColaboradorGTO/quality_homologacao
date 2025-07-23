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
 
function patch(pathUrl, body, session){
   
    var dest = readUrl();
    //session = testSession(session);
    //var session = loginServiceLayer();
    var client = new $.net.http.Client();
    var request = new $.net.http.Request($.net.http.PATCH, pathUrl);
    
    
    request.cookies.set('B1SESSION', session);
    request.headers.set('Prefer', 'return-no-content');
    request.setBody(JSON.stringify(body));
    
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
 }

function testget(pathUrl){
   
    var dest = readUrl();
    
    //var session = loginServiceLayer();
     var session = '469e6884-d088-11ec-8000-005056b5a3a0';
    var client = new $.net.http.Client();
   
    var request = new $.net.http.Request($.net.http.GET, pathUrl);
   
    request.cookies.set('B1SESSION', session);
     //request.setBody(JSON.stringify(body));
     
    client.request(request, dest);
    var response = client.getResponse();
    client.close();
    
    return response;
}