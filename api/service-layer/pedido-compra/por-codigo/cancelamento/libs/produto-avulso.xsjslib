var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var securityStorage = new $.security.Store("localStore.xssecurestore");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

function patchSl(docEntry,data,session) {
    
    var response = slApi.patch('/Items('+docEntry+')',data,session);
    if (response.status !== 204) {
        return JSON.parse(response.body.asString());
    }else{
        return 'True';
    }
}

function executeCancelamentoProdutoAvulso(codProduto){
       var session = slApi.loginServiceLayer(true);
        slApi.loginServiceLayer(true);
     
    var rsSl = patchSl(codProduto, JSON.parse('{"Valid":"tNO","Frozen":"tYES"}'), session);
    if(rsSl !== 'True'){
        return 'False';
    }
    return 'True';
	   
	
}


