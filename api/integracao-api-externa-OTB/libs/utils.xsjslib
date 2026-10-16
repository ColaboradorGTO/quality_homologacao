function getDataHoraBrasil() {
    let data = new Date();

    data.setHours(data.getHours());

    let yyyy = data.getFullYear();
    let mm = ("0" + (data.getMonth() + 1)).slice(-2);
    let dd = ("0" + data.getDate()).slice(-2);

    let hh = ("0" + data.getHours()).slice(-2);
    let mi = ("0" + data.getMinutes()).slice(-2);
    let ss = ("0" + data.getSeconds()).slice(-2);
    let ms = ("00" + data.getMilliseconds()).slice(-3);

    return yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + mi + ":" + ss + "." + ms;
}

function formatarEmLotes(arrayDados, tamanho = 1000) {
    let arrayLotes = [];

    for (let i = 0; i < arrayDados.length; i += tamanho) {
        let dadosLote = arrayDados.slice(i, i + tamanho);
        let numRegistroInicioLote = i + 1;
        let numRegistroFimLote = Math.min(i + dadosLote.length, arrayDados.length);
        
        arrayLotes.push({
            dados: dadosLote,
            numRegistroInicioLote,
            numRegistroFimLote,
        });
    }

    return arrayLotes;
}