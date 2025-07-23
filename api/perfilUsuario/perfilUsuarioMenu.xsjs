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


function fnHandleGetMenuPai(idModulo) {
    try {
        var query = 'SELECT IDMENU, STATIVO, IDMODULO, DSMENU FROM "QUALITY_CONC_TST"."MENUPAI" WHERE IDMODULO = ?';
        var result = api.sqlQuery(query, idModulo);
        return result.map(detalhe => ({
            IDMENU: detalhe.IDMENU,
            STATIVO: detalhe.STATIVO,
            IDMODULO: detalhe.IDMODULO,
            DSMENU: detalhe.DSMENU
        }));
    } catch (error) {
        $.trace.error(`Erro ao buscar menu pai para módulo ${idModulo}: ${error}`);
        return [];
    }
}

function fnHandleGetMenuFilho(idMenuPai) {
    try {
        var query = `SELECT ID, DSNOME, IDMENUPAI, URL, ALTERAR, CRIAR, VISUALIZAR, 
                    N1, N2, N3, N4, ADMINISTRADOR 
                    FROM "QUALITY_CONC_TST"."MENUFILHO" 
                    WHERE IDMENUPAI = ?`;
        var result = api.sqlQuery(query, idMenuPai);
        return result.map(item => ({
            ID: item.ID,
            DSNOME: item.DSNOME,
            IDMENUPAI: item.IDMENUPAI,
            URL: item.URL,
            ALTERAR: item.ALTERAR,
            CRIAR: item.CRIAR,
            VISUALIZAR: item.VISUALIZAR,
            N1: item.N1,
            N2: item.N2,
            N3: item.N3,
            N4: item.N4,
            ADMINISTRADOR: item.ADMINISTRADOR
        }));
    } catch (error) {
        $.trace.error(`Erro ao buscar menu filho para menu pai ${idMenuPai}: ${error}`);
        return [];
    }
}
// function fnHandleGetModuloPrincipal(idModulo) {
//     try {
//         // Converter para número para garantir compatibilidade
//         idModulo = Number(idModulo);
//         if (isNaN(idModulo)) {
//             $.trace.warn(`ID de módulo inválido: ${idModulo}`);
//             return [];
//         }

//         var query = 'SELECT ID, DSMODULO, IDPERFIL, IDMENU, NOME FROM "QUALITY_CONC_TST"."MODULOPRINCIPAL" WHERE ID = ?';
//         var result = api.sqlQuery(query, [idModulo]);
        
//         if (!result || result.length === 0) {
//             $.trace.warn(`Nenhum módulo encontrado para ID ${idModulo}`);
//             return [];
//         }
        
//         return result;
//     } catch (error) {
//         $.trace.error(`Erro ao buscar módulo principal ${idModulo}: ${error}`);
//         return [];
//     }
// }

function fnHandleGetModuloPrincipal(idModulo) {
    try {
        // Converter para número para garantir compatibilidade
        idModulo = Number(idModulo);
        if (isNaN(idModulo)) {
            $.trace.warn(`ID de módulo inválido: ${idModulo}`);
            return [];
        }

        var query = 'SELECT * FROM "QUALITY_CONC_TST"."MODULOPRINCIPAL" WHERE ID = ?';
        var result = api.sqlQuery(query, String(idModulo));

        if (!result || result.length === 0) {
            $.trace.warn(`Nenhum módulo encontrado para ID ${idModulo}`);
            return [];
        }

        return result;
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
                IDUSUARIO, DSPERFIL, CRIAR, ALTERAR, STATIVO, IDPERFILUSUARIO, 
                IDMODULO, IDMODULOADMINISTRATIVO, IDMODULOCOMERCIAL, IDMODULOCONTABILIDADE, 
                IDMODULOFINANCEIRO, IDMODULOGERENCIA, IDMODULOINFORMATICA, IDMODULOMARKETING, 
                IDMODULOCOMPRAS, IDMODULOCADASTRO, IDMODULOEXPEDICAO, IDMODULOCOMPRASADM, 
                IDMODULOETIQUETAGEM, IDMODULOCONFERENCIACEGA, IDMODULOVOUCHER, IDMODULOMALOTE, 
                IDMODULORH, IDUSERULTIMAALTERACAO, IDPERMISSAO, IDMODULORESUMOVENDAS, 
                IDMODULOPROMOCAO, ADMINISTRADOR, N4, N3, N2, N1, IDMENUFILHO, IDMENU
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
            "IDMODULO", "IDMODULOADMINISTRATIVO", "IDMODULOCOMERCIAL", "IDMODULOCONTABILIDADE",
            "IDMODULOFINANCEIRO", "IDMODULOGERENCIA", "IDMODULOINFORMATICA", "IDMODULOMARKETING",
            "IDMODULOCOMPRAS", "IDMODULOCADASTRO", "IDMODULOEXPEDICAO", "IDMODULOCOMPRASADM",
            "IDMODULOETIQUETAGEM", "IDMODULOCONFERENCIACEGA", "IDMODULOVOUCHER", "IDMODULOMALOTE",
            "IDMODULORH", "IDMODULORESUMOVENDAS", "IDMODULOPROMOCAO"
        ];

        let data = [];
        let perfilMap = {};

        for (let i = 0; i < response.data.length; i++) {
            let detalhe = response.data[i];
            let perfilKey = detalhe.IDUSUARIO;

            if (!perfilMap[perfilKey]) {
                perfilMap[perfilKey] = {
                    IDUSUARIO: detalhe.IDUSUARIO,
                    DSPERFIL: detalhe.DSPERFIL,
                    CRIAR: detalhe.CRIAR,
                    ALTERAR: detalhe.ALTERAR,
                    STATIVO: detalhe.STATIVO,
                    IDPERFILUSUARIO: detalhe.IDPERFILUSUARIO,
                    IDMODULO: detalhe.IDMODULO,
                    IDMODULOADMINISTRATIVO: detalhe.IDMODULOADMINISTRATIVO,
                    IDMODULOCOMERCIAL: detalhe.IDMODULOCOMERCIAL,
                    IDMODULOCONTABILIDADE: detalhe.IDMODULOCONTABILIDADE,
                    IDMODULOFINANCEIRO: detalhe.IDMODULOFINANCEIRO,
                    IDMODULOGERENCIA: detalhe.IDMODULOGERENCIA,
                    IDMODULOINFORMATICA: detalhe.IDMODULOINFORMATICA,
                    IDMODULOMARKETING: detalhe.IDMODULOMARKETING,
                    IDMODULOCOMPRAS: detalhe.IDMODULOCOMPRAS,
                    IDMODULOCADASTRO: detalhe.IDMODULOCADASTRO,
                    IDMODULOEXPEDICAO: detalhe.IDMODULOEXPEDICAO,
                    IDMODULOCOMPRASADM: detalhe.IDMODULOCOMPRASADM,
                    IDMODULOETIQUETAGEM: detalhe.IDMODULOETIQUETAGEM,
                    IDMODULOCONFERENCIACEGA: detalhe.IDMODULOCONFERENCIACEGA,
                    IDMODULOVOUCHER: detalhe.IDMODULOVOUCHER,
                    IDMODULOMALOTE: detalhe.IDMODULOMALOTE,
                    IDMODULORH: detalhe.IDMODULORH,
                    IDUSERULTIMAALTERACAO: detalhe.IDUSERULTIMAALTERACAO,
                    IDPERMISSAO: detalhe.IDPERMISSAO,
                    IDMODULORESUMOVENDAS: detalhe.IDMODULORESUMOVENDAS,
                    IDMODULOPROMOCAO: detalhe.IDMODULOPROMOCAO,
                    ADMINISTRADOR: detalhe.ADMINISTRADOR,
                    N4: detalhe.N4,
                    N3: detalhe.N3,
                    N2: detalhe.N2,
                    N1: detalhe.N1,
                    IDMENUFILHO: detalhe.IDMENUFILHO,
                    IDMENU: detalhe.IDMENU,
                    modulos: []
                };
                data.push(perfilMap[perfilKey]);
            }

            let modulos = perfilMap[perfilKey].modulos;
            let modulosAdicionados = new Set(modulos.map(m => m.ID)); // não deixa duplicados

            for (let campo of camposModulos) {
                let idModulo = detalhe[campo];
                if (idModulo) {
                    let idModuloInt = parseInt(idModulo, 10);
                    if (!modulosAdicionados.has(idModuloInt)) {
                        modulosAdicionados.add(idModuloInt);

                        let moduloPrincipal = fnHandleGetModuloPrincipal(idModuloInt)[0]; // único objeto
                        let menuPai = fnHandleGetMenuPai(idModuloInt)[0]; // único pai

                        let menuFilho = fnHandleGetMenuFilho(menuPai.IDMENU);

                       
                        modulos.push({
                            ID: moduloPrincipal.ID,
                            DSMODULO: moduloPrincipal.DSMODULO,
                            IDPERFIL: moduloPrincipal.IDPERFIL,
                            IDMENU: moduloPrincipal.IDMENU,
                            NOME: moduloPrincipal.NOME,
                            menuPai: {
                                IDMENU: menuPai.IDMENU,
                                DSMENU: menuPai.DSMENU,
                                menuFilho: menuFilho
                            }
                        });

                    }
                }
            }
        }

        return {
            rows: data.length,
            data
        };

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