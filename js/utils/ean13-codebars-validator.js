function isValidEAN13(ean) {
    // Verifica se a entrada tem 13 dígitos
    if (!/^\d{13}$/.test(ean)) {
        return false;
    }

    // Converte a string em um array de números
    let digits = ean.split('').map(Number);

    // Calcula a soma dos dígitos nas posições ímpares
    let oddSum = digits.slice(0, 12).filter((_, i) => i % 2 === 0).reduce((a, b) => a + b, 0);

    // Calcula a soma dos dígitos nas posições pares e multiplica por 3
    let evenSum = digits.slice(0, 12).filter((_, i) => i % 2 !== 0).reduce((a, b) => a + b, 0) * 3;

    // Soma os resultados
    let totalSum = oddSum + evenSum;

    // Calcula o dígito verificador esperado
    let checkDigit = (10 - (totalSum % 10)) % 10;

    // Verifica se o dígito verificador está correto
    return checkDigit === digits[12];
}