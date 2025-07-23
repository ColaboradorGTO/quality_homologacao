var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function setTimestampOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setTimestamp(fieldId, value);
}

function setDateOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setDate(fieldId, value);
}

function setIntOrNull(stmt, fieldId, value) {
    if (!value) {
        stmt.setNull(fieldId);
        return;
    }
    stmt.setInt(fieldId, value);
}


function fnHandleGetModuloPrincipal(idModulo) {
    try {
        // Converter para número para garantir compatibilidade
        idModulo = Number(idModulo);
        if (isNaN(idModulo)) {
            $.trace.warn(`ID de módulo inválido: ${idModulo}`);
            return [];
        }

        var query = 'SELECT * FROM "QUALITY_CONC_TST"."MODULOPRINCIPAL" WHERE ID = ?';
        var result = api.sqlQuery(query, idModulo);
        
        if (!result || result.length === 0) {
            $.trace.warn(`Nenhum módulo encontrado para ID ${idModulo}`);
            return [];
        }
        
        return result.map(item => ({
            ID: item.ID,
            DSMODULO: item.DSMODULO,
            IDPERFIL: item.IDPERFIL,
            IDMENU: item.IDMENU,
        }))
    } catch (error) {
        $.trace.error(`Erro ao buscar módulo principal ${idModulo}: ${error}`);
        return [];
    }
}

function fnHandleGetPerfilUsuarioMenu() {
    var idUsuario = $.request.parameters.get("idUsuario");

    try {
        var query = `
            SELECT DISTINCT
                IDUSUARIO, 
                DSPERFIL, 
                CRIAR, 
                ALTERAR, 
                STATIVO, 
                IDPERFILUSUARIO, 
                IDMODULO, 
                IDMODULOADMINISTRATIVO, 
                IDMODULOCOMERCIAL, 
                IDMODULOCONTABILIDADE, 
                IDMODULOFINANCEIRO, 
                IDMODULOGERENCIA, 
                IDMODULOINFORMATICA, 
                IDMODULOMARKETING, 
                IDMODULOCOMPRAS, 
                IDMODULOCADASTRO, 
                IDMODULOEXPEDICAO, 
                IDMODULOCOMPRASADM, 
                IDMODULOETIQUETAGEM, 
                IDMODULOCONFERENCIACEGA, 
                IDMODULOVOUCHER, 
                IDMODULOMALOTE, 
                IDMODULORH, 
                IDUSERULTIMAALTERACAO, 
                IDPERMISSAO, 
                IDMODULORESUMOVENDAS, 
                IDMODULOPROMOCAO,
                ADMINISTRADOR, 
                N4, 
                N3, 
                N2, 
                N1,
                IDMENUFILHO,
                IDMENU
            FROM "QUALITY_CONC_TST".PERFILUSUARIOMENU 
            WHERE 1 = 1
        `;

        var params = [];
        if (idUsuario) {
            query += ` AND IDUSUARIO = ?`;
            params.push(idUsuario);
        }
        query += " ORDER BY IDUSUARIO, IDMENU";

        var request = {
            page: $.request.parameters.get("page"),
            pageSize: $.request.parameters.get("pageSize")
        };

        var response = api.sqlQueryPage(query, request, idUsuario);

        let camposModulos = [
            "IDMODULO",
            "IDMODULOADMINISTRATIVO",
            "IDMODULOCOMERCIAL",
            "IDMODULOCONTABILIDADE",
            "IDMODULOFINANCEIRO",
            "IDMODULOGERENCIA",
            "IDMODULOINFORMATICA",
            "IDMODULOMARKETING",
            "IDMODULOCOMPRAS",
            "IDMODULOCADASTRO",
            "IDMODULOEXPEDICAO",
            "IDMODULOCOMPRASADM",
            "IDMODULOETIQUETAGEM",
            "IDMODULOCONFERENCIACEGA",
            "IDMODULOVOUCHER",
            "IDMODULOMALOTE",
            "IDMODULORH",
            "IDMODULORESUMOVENDAS",
            "IDMODULOPROMOCAO"
        ];

        // Agrupamento por perfil
        let data = [];
        let perfilMap = {};

        for (var i = 0; i < response.data.length; i++) {
    let detalhe = response.data[i];
    let perfilKey = detalhe.IDPERFILUSUARIO;

    if (!perfilMap[perfilKey]) {
        perfilMap[perfilKey] = {
            IDUSUARIO: detalhe.IDUSUARIO,
            DSPERFIL: detalhe.DSPERFIL,
            CRIAR: detalhe.CRIAR,
            ALTERAR: detalhe.ALTERAR,
            STATIVO: detalhe.STATIVO,
            IDPERFILUSUARIO: detalhe.IDPERFILUSUARIO,
            ADMINISTRADOR: detalhe.ADMINISTRADOR,
            N4: detalhe.N4,
            N3: detalhe.N3,
            N2: detalhe.N2,
            N1: detalhe.N1,
            IDUSERULTIMAALTERACAO: detalhe.IDUSERULTIMAALTERACAO,
            IDPERMISSAO: detalhe.IDPERMISSAO,
            modulos: []
        };
        data.push(perfilMap[perfilKey]);
    }

    let modulos = perfilMap[perfilKey].modulos;

    for (var j = 0; j < camposModulos.length; j++) {
        let idModuloRegistro = detalhe[camposModulos[j]];
        if (idModuloRegistro) {
            let idModuloInt = parseInt(idModuloRegistro, 10);

            // Evita adicionar o mesmo módulo mais de uma vez
            if (!modulos.some(m => m.ID === idModuloInt)) {
                let moduloPrincipal = fnHandleGetModuloPrincipal(idModuloInt);
                if (moduloPrincipal && moduloPrincipal.length > 0) {
                    modulos.push(moduloPrincipal[0]);
                }
            }
        }
    }
}
        return { data };
    } catch (error) {
        $.trace.error("Erro ao executar a consulta de perfil de usuário: " + error.toString());
        throw error;
    }
}


$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ($.request.method) {
        case $.net.http.GET:
            var result = fnHandleGetPerfilUsuarioMenu();
            $.response.setBody(JSON.stringify(result));
            break;
        default:
            $.response.status = $.net.http.METHOD_NOT_ALLOWED;
            $.response.setBody(JSON.stringify({message: "Método não permitido"}));
            break;
    }
} catch (err) {
    $.response.status = $.net.http.BAD_REQUEST;
    $.response.setBody(JSON.stringify({message: err.toString()}));
}