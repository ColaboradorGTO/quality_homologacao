var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");


function fnHandleGetModuloPrincipal(idModulo) {
    try {
        var query = 'SELECT * FROM "VAR_DB_NAME"."MODULOPRINCIPAL" WHERE ID = ?';
        var result = api.sqlQuery(query, idModulo);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        $.trace.error(`Erro ao buscar módulo principal ${idModulo}: ${error}`);
        return [];
    }
}

function fnHandleGetMenuPai(idMenu) {
    try {
        var query = 'SELECT IDMENU, STATIVO, IDMODULO, DSMENU FROM "VAR_DB_NAME"."MENUPAI" WHERE IDMENU = ?';
        var result = api.sqlQuery(query, idMenu);
        return Array.isArray(result) ? result : [];
    } catch (error) {
        $.trace.error(`Erro ao buscar menu pai ${idMenu}: ${error}`);
        return [];
    }
}

function fnHandleGetMenuFilhos(idMenuPai, idMenuFilho) {
    try {
        var query = `
            SELECT 
                ID, 
                DSNOME, 
                IDMENUPAI, 
                URL, 
                ALTERAR, 
                CRIAR, 
                VISUALIZAR, 
                N1, 
                N2, 
                N3, 
                N4, 
                ADMINISTRADOR 
            FROM "VAR_DB_NAME"."MENUFILHO" 
            WHERE 1 = ?
        `;
        
        var params = [1];
        
        if (idMenuPai) {
            query += ` AND IDMENUPAI = ${idMenuPai}`;
            params.push(idMenuPai);
        }
        
        if (idMenuFilho) {
            query += ` AND ID = ${idMenuFilho}`;
            params.push(idMenuFilho);
        }

        var result = api.sqlQuery(query, 1, idMenuPai, idMenuFilho);
        
        if (!Array.isArray(result) || result.length === 0) return [];

        return result.map(function(item) {
            return {
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
            };
        });
    } catch (error) {
        $.trace.error(`Erro ao buscar menu filho: ${error}`);
        return [];
    }
}

function fnHandleGetPerfilUsuarioMenu() {
    try {
        var idUsuario = $.request.parameters.get("idUsuario");
        var idMenuFilho = $.request.parameters.get("idMenuFilho");
 
        
        var query = `
            SELECT 
                IDPERFIL,
                IDUSUARIO,
                IDMENU,
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
                ADMINISTRADOR, 
                N4, 
                N3, 
                N2, 
                N1,
                IDMENUFILHO
            FROM "VAR_DB_NAME".PERFILUSUARIOMENU 
            WHERE 1 = ?
        `;
        
        var params = [1];
        
        if (idUsuario) {
                query += ` AND IDUSUARIO = ${Number(idUsuario)}`;

        }
        
        if (idMenuFilho) {
            query += ` AND IDMENUFILHO = ${Number(idMenuFilho)}`;
      
        }
        
        query += ' ORDER BY IDUSUARIO, IDMENUFILHO';
        
        var result = api.sqlQuery(query, 1, idUsuario);
        
        if (!Array.isArray(result) || result.length === 0) {
            return {
                rows: 0,
                data: []
            };
        }
        
        var data = [];
        
        for (var i = 0; i < result.length; i++) {
            var item = result[i];
            
            var modulosAcesso = [
                item.IDMODULOADMINISTRATIVO,
                item.IDMODULOGERENCIA,
                item.IDMODULOINFORMATICA,
                item.IDMODULOFINANCEIRO,
                item.IDMODULOMARKETING,
                item.IDMODULORH,
                item.IDMODULOCOMERCIAL,
                item.IDMODULOCOMPRAS,
                item.IDMODULOCONTABILIDADE,
                item.IDMODULOCOMPRASADM,
                item.IDMODULOEXPEDICAO,
                item.IDMODULOCONFERENCIACEGA,
                item.IDMODULOCADASTRO,
                item.IDMODULOETIQUETAGEM,
                item.IDMODULORESUMOVENDAS,
                item.IDMODULOVOUCHER,
                item.IDMODULOMALOTE,
                item.IDPERMISSAO
            ].filter(function(modulo) { return modulo !== null && modulo !== undefined; });
            
            var modulosPrincipais = [];
            
            for (var j = 0; j < modulosAcesso.length; j++) {
                var modulo = fnHandleGetModuloPrincipal(modulosAcesso[j]);
                
                if (modulo.length === 0) continue;
                
                var menuPai = fnHandleGetMenuPai(modulo[0].IDMENU);
                var menuFilho = menuPai.length > 0 ? 
                    fnHandleGetMenuFilhos(menuPai[0].IDMENU, idMenuFilho) : [];
                
                // Criando objeto módulo manualmente
                var moduloObj = {
                    ID: modulo[0].ID,
                    DSMODULO: modulo[0].DSMODULO,
                    STATIVO: modulo[0].STATIVO,
                    IDMENU: modulo[0].IDMENU,
                    // Adicione outras propriedades conforme necessário
                    menuPai: null
                };
                
                if (menuPai.length > 0) {
                    moduloObj.menuPai = {
                        IDMENU: menuPai[0].IDMENU,
                        STATIVO: menuPai[0].STATIVO,
                        IDMODULO: menuPai[0].IDMODULO,
                        DSMENU: menuPai[0].DSMENU,
                        menuFilho: menuFilho
                    };
                }
                
                modulosPrincipais.push(moduloObj);
            }
            
            // Criando objeto item manualmente
            var itemData = {
                IDPERFIL: item.IDPERFIL,
                IDUSUARIO: item.IDUSUARIO,
                IDMENU: item.IDMENU,
                DSPERFIL: item.DSPERFIL,
                IDPERFILUSUARIO: item.IDPERFILUSUARIO,
                IDMODULO: item.IDMODULO,
                IDMODULOADMINISTRATIVO: item.IDMODULOADMINISTRATIVO,
                IDMODULOCOMERCIAL: item.IDMODULOCOMERCIAL,
                IDMODULOCONTABILIDADE: item.IDMODULOCONTABILIDADE,
                IDMODULOFINANCEIRO: item.IDMODULOFINANCEIRO,
                IDMODULOGERENCIA: item.IDMODULOGERENCIA,
                IDMODULOINFORMATICA: item.IDMODULOINFORMATICA,
                IDMODULOMARKETING: item.IDMODULOMARKETING,
                IDMODULOCOMPRAS: item.IDMODULOCOMPRAS,
                IDMODULOCADASTRO: item.IDMODULOCADASTRO,
                IDMODULOEXPEDICAO: item.IDMODULOEXPEDICAO,
                IDMODULOCOMPRASADM: item.IDMODULOCOMPRASADM,
                IDMODULOETIQUETAGEM: item.IDMODULOETIQUETAGEM,
                IDMODULOCONFERENCIACEGA: item.IDMODULOCONFERENCIACEGA,
                IDMODULOVOUCHER: item.IDMODULOVOUCHER,
                IDMODULOMALOTE: item.IDMODULOMALOTE,
                IDMODULORH: item.IDMODULORH,
                IDUSERULTIMAALTERACAO: item.IDUSERULTIMAALTERACAO,
                IDPERMISSAO: item.IDPERMISSAO,
                ADMINISTRADOR: item.ADMINISTRADOR,
                N4: item.N4,
                N3: item.N3,
                N2: item.N2,
                N1: item.N1,
                CRIAR: item.CRIAR,
                ALTERAR: item.ALTERAR,
                STATIVO: item.STATIVO,
                IDMENUFILHO: item.IDMENUFILHO,
                modulos: modulosPrincipais
            };
            
            data.push(itemData);
        }
        
        return {
            rows: result.length,
            data: data
        };
        
    } catch (error) {
        $.trace.error('Erro ao buscar perfil usuário menu: ' + error.toString());
        return {
            rows: 0,
            data: [],
            error: error.toString()
        };
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
    $.response.setBody(JSON.stringify({
        message: err.toString(),
        stack: err.stack
    }));
}