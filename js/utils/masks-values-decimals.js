function maskValorEmBRL(valor, numMaxCasasDecimais = 2) {
    return new Intl.NumberFormat('br-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: numMaxCasasDecimais
    }).format(valor)
}

function maskValorEmDecimal(valor, numMaxCasasDecimais = 2) {
    return new Intl.NumberFormat('br-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: numMaxCasasDecimais
    }).format(valor)
}

function maskValorEmInteiro(valor) {
    return new Intl.NumberFormat('br-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor)
}