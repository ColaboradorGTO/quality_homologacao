let tokenStorage = new $.security.Store("tokenStorage.xssecurestore");
let credentialStore = new $.security.Store("credentialStore.xssecurestore");
let apiClient = $.import("quality.concentrador_homologacao.api.integracao-api-externa-OTB.libs.services", "apiClient");

function storeToken(access_token, expires_in) {
    let expirationDate = new Date();
    
    expirationDate.setTime(expirationDate.getTime() + (expires_in - 10000));
    
    tokenStorage.store({
        name: "access_token",
        value: JSON.stringify({
            token: access_token,
            expiresAt: expirationDate.toISOString()
        })
    });
}

function readToken() {
    let tokenData;
    let value = tokenStorage.read({
        name: "access_token"
    });

    if (!value) {
        return null;
    }

    try {
        tokenData = JSON.parse(value);
    } catch (e) {
        return null;
    }

    if (!tokenData.token || !tokenData.expiresAt) {
        return null;
    }

    if (new Date() >= new Date(tokenData.expiresAt)) {
        return null;
    }
    
    let { expiresAt, token } = tokenData;
    
    return {
        expiresAt,
        token
    }
}

function storeCredentials(username, password) {
    credentialStore.store({
        name: "api_credentials",
        value: JSON.stringify({
            username,
            password
        })
    });
}

function readCredentials() {
    let credentialsData;
    let value = credentialStore.read({
        name: "api_credentials"
    });

    if (!value) {
        return null;
    }
    
    try {
        credentialsData = JSON.parse(value);
    } catch (e) {
        return null;
    }

    if (!credentialsData.username || !credentialsData.password) {
        return null;
    }
    
    let { username, password } = credentialsData;
    
    return {
        username,
        password
    }
}

function readUrl(){
    return $.net.http.readDestination(pathUrl, "url");
}

function getAccessToken(force = false){
    let token = readToken();

    if (token && !force) {
        return token;
    }

    autenticar();

    token = readToken();
    
    if (!token) {
        throw new Error( "Falha ao obter access token.");
    }

    return token;
}

function autenticar(){
    let credentials = readCredentials();

    if (!credentials){
        throw new Error(
            "Credenciais não configuradas."
        );
    }

    let formData =
        "grant_type=password" +
        "&client_id=userIntegration" +
        "&username=" +
        encodeURIComponent(credentials.username) +
        "&password=" +
        encodeURIComponent(credentials.password);

    let response = apiClient.sendRequest({
        method: $.net.http.POST,
        url: "/Auth/Token",
        body: formData,
        useAuth: false,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    if (response.status !== 200){
        throw new Error( "Erro na autenticação." );
    }

    let json = JSON.parse(response.body);

    storeToken(
        json.access_token,
        json.expires_in
    );
}