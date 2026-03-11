const TAGS_SEMPRE_ARRAY = ["det"];

function parseNode(xml) {
    var obj = {};
    var tagRegex = /<([^\/?][^>]*)>(.*?)<\/\1>/g;
    var match;

    while ((match = tagRegex.exec(xml)) !== null) {
        var tag = match[1];
        var content = match[2];

        if (/<[^\/][^>]*>/.test(content)) {
            var childObj = parseNode(content);

            if (obj[tag]) {
                if (!Array.isArray(obj[tag])) {
                    obj[tag] = [obj[tag]];
                }
                obj[tag].push(childObj);
            } else {
                obj[tag] = childObj;
            }
        } else {
            if (obj[tag]) {
                if (!Array.isArray(obj[tag])) {
                    obj[tag] = [obj[tag]];
                }
                obj[tag].push(content);
            } else {
                obj[tag] = content;
            }
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
    xmlString = xmlString.replace(/<(\w+)([^>]*)>/g, '<$1>');
    xmlString = xmlString.replace(/<(\w+)\s*\/>/g, '<$1></$1>');
    
    return parseNode(xmlString);
}
