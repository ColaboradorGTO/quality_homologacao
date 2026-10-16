const TAGS_SEMPRE_ARRAY = ["det", "detPag", "dup"];

function parseAttributes(attributeString) {
    var attrs = {};
    var attrRegex = /(\w+)="([^"]*)"/g;
    var match;

    while ((match = attrRegex.exec(attributeString)) !== null) {
        attrs[match[1]] = match[2];
    }

    return attrs;
}

function parseNode(xml) {
    var obj = {};
    var tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
    var match;

    while ((match = tagRegex.exec(xml)) !== null) {
        var tag = match[1];
        var attributes = parseAttributes(match[2]);
        var content = match[3];

        var value;

        if (/<[^\/][^>]*>/.test(content)) {
            value = parseNode(content);
        } else {
            value = content;
        }

        // Adiciona os atributos somente se existirem
        if (Object.keys(attributes).length > 0) {
            if (typeof value === "object" && value !== null) {
                value._attributes = attributes;
            } else {
                value = {
                    _value: value,
                    _attributes: attributes
                };
            }
        }

        if (obj[tag]) {
            if (!Array.isArray(obj[tag])) {
                obj[tag] = [obj[tag]];
            }
            obj[tag].push(value);
        } else {
            obj[tag] = value;
        }
    }

    for (let key of Object.keys(obj)) {
        if (TAGS_SEMPRE_ARRAY.includes(key) && !Array.isArray(obj[key])) {
            obj[key] = [obj[key]];
        }
    }

    return obj;
}

function XmlParaJson(xmlString) {
    xmlString = xmlString.replace(/\r?\n|\r/g, '').trim();
    // REMOVIDO: xmlString = xmlString.replace(/<(\w+)([^>]*)>/g, '<$1>');
    xmlString = xmlString.replace(/<(\w+)\s*\/>/g, '<$1></$1>');

    return parseNode(xmlString);
}