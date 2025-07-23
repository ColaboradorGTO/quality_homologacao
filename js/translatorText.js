async function translateText(text, sourceLang, targetLang) {
    if (text) {
        sourceLang = !sourceLang ? 'auto' : sourceLang;
        targetLang = !targetLang ? 'pt' : targetLang;

        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURI(text)}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.statusText}`);
            }

            const responseReturned = await response.json();
            const translations = responseReturned[0].map(text => text[0]);
            const outputText = translations.join(" ");

            return outputText;
        } catch (error) {
            console.error('Erro:', error.message);
            return text;
        }
    }
}