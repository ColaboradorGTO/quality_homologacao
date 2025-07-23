const traducoes = {
    "vendor": "Fornecedor",
    "value": "valor",
    "linked payment method": "Forma de Pagamento Vinculada",
    "is inactive": "Está Inativo(a)",
    " or ": " ou ",
    "is no longer linked with": "Não Está Vinculada com",
    "business partner": "Parceiro de Negócios", 
    "document total value must be zero or greater than zero": "O valor total do documento deve ser zero ou maior que zero",
    "specify valid tax code": "Especifique um código tributário válido",
    "entity with": "Entidade com",
    "does not exist": "não existe",
    "nota fiscal number was already used for a bp; specify a new number": "O numero desta nota fiscal ja foi usado por um Parceiro de Negocios(BP); Especifique um novo numero",
    "this entry": "Esta Entrada",
    "already": "Ja",
    "exists": "Existe",
    "in the following tables": "Nas Seguintes Tabelas"
};

function traduzirTexto(texto) {
    let textoTraduzido = texto.toLowerCase().trim();

    for (let key in traducoes) {
        let valor = traducoes[key];
        let vrKey = key.toLowerCase().trim();
        
        if(textoTraduzido.includes(vrKey)){
        	textoTraduzido = textoTraduzido.replace(key, valor);
        }
    }
    
    return textoTraduzido;
}