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
    if (value === undefined || value === null || value === "") {
        stmt.setNull(fieldId);
    } else {
        stmt.setInt(fieldId, parseInt(value, 10));
    }
}


function fnHandleGetMenuPai(idModulo) {
    try {
        var query = 'SELECT IDMENU, STATIVO, IDMODULO, DSMENU FROM "VAR_DB_NAME"."MENUPAI" WHERE IDMODULO = ?';
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

function fnHandleGetMenuFilho(idMenuPai, idMenuFilho) {
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
        $.trace.error(`Erro ao buscar menu filho para menu pai ${idMenuPai}: ${error}`);
        return [];
    }
}

function fnHandleGetModuloPrincipal(idModulo) {
    try {
        
        idModulo = Number(idModulo);
        if (isNaN(idModulo)) {
            $.trace.warn(`ID de módulo inválido: ${idModulo}`);
            return [];
        }

        var query = 'SELECT * FROM "VAR_DB_NAME"."MODULOPRINCIPAL" WHERE ID = ?';
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
    var idPerfil = $.request.parameters.get("idPerfil");
    var idModulo = $.request.parameters.get("idModulo");
    var page = $.request.parameters.get("page");
    var pageSize = $.request.parameters.get("pageSize");
    
    page = page && !isNaN(page) ? parseInt(page, 10) : 1;
    pageSize = pageSize && !isNaN(pageSize) ? parseInt(pageSize, 10) : 500;

    var query = `
        SELECT DISTINCT
            IDPERFIL,
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
        FROM "VAR_DB_NAME".PERFILUSUARIOMENU 
        WHERE IDUSUARIO = ?
    `;

    var params = [Number(idUsuario)];
    if (idModulo) {
        query += `
            AND (
                IDMODULO = ?
                OR IDMODULOADMINISTRATIVO = ?
                OR IDMODULOCOMERCIAL = ?
                OR IDMODULOCONTABILIDADE = ?
                OR IDMODULOFINANCEIRO = ?
                OR IDMODULOGERENCIA = ?
                OR IDMODULOINFORMATICA = ?
                OR IDMODULOMARKETING = ?
                OR IDMODULOCOMPRAS = ?
                OR IDMODULOCADASTRO = ?
                OR IDMODULOEXPEDICAO = ?
                OR IDMODULOCOMPRASADM = ?
                OR IDMODULOETIQUETAGEM = ?
                OR IDMODULOCONFERENCIACEGA = ?
                OR IDMODULOVOUCHER = ?
                OR IDMODULOMALOTE = ?
                OR IDMODULORH = ?
                OR IDPERMISSAO = ?
                OR IDMODULORESUMOVENDAS = ?
                OR IDMODULOPROMOCAO = ?
            )
        `;
        for (var i = 0; i < 20; i++) {
            params.push(idModulo);
        }
    }

    query += " ORDER BY IDUSUARIO, IDMENUFILHO";
    
    var request = {
        page: page,
        pageSize: pageSize
    };

    var response = api.sqlQueryPage(query, request, idUsuario, Number(idModulo));
    if (!response.data || response.data.length === 0) {
        return { rows: 0, data: [] };
    }

    // Agrupamento por usuário (usando IDUSUARIO como chave única)
    var usuariosAgrupados = {};
    for (var i = 0; i < response.data.length; i++) {
        var item = response.data[i];
        var usuarioKey = item.IDUSUARIO; // Mudança: usar IDUSUARIO como chave
        if (!usuariosAgrupados[usuarioKey]) {
            usuariosAgrupados[usuarioKey] = {
                IDPERFIL: item.IDPERFIL,
                IDUSUARIO: item.IDUSUARIO,
                IDMENU: item.IDMENU,
                DSPERFIL: item.DSPERFIL,
                CRIAR: item.CRIAR,
                ALTERAR: item.ALTERAR,
                STATIVO: item.STATIVO,
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
                IDMENUFILHO: item.IDMENUFILHO,
                modulos: {},
                menusFilhosAdicionados: {} // Controle para evitar duplicação de menus filhos
            };
        }
        var usuario = usuariosAgrupados[usuarioKey];

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
            item.IDPERMISSAO,
            item.IDMODULOPROMOCAO
        ];

        for (var j = 0; j < modulosAcesso.length; j++) {
            var idModuloAcesso = modulosAcesso[j];
            if (!idModuloAcesso) continue;
            if (!usuario.modulos[idModuloAcesso]) {
                var modulo = fnHandleGetModuloPrincipal(idModuloAcesso);
                if (!modulo[0]) continue;
                var menuPai = fnHandleGetMenuPai(modulo[0].IDMENU);
                if (!menuPai[0]) continue;
                usuario.modulos[idModuloAcesso] = {
                    ID: modulo[0].ID,
                    DSMODULO: modulo[0].DSMODULO,
                    IDPERFIL: modulo[0].IDPERFIL,
                    IDMENU: modulo[0].IDMENU,
                    NOME: modulo[0].NOME,
                    menuPai: {
                        IDMENU: menuPai[0].IDMENU,
                        STATIVO: menuPai[0].STATIVO,
                        IDMODULO: menuPai[0].IDMODULO,
                        DSMENU: menuPai[0].DSMENU,
                        menuFilho: []
                    }
                };
            }
            // Adiciona menuFilho se existir e ainda não foi adicionado
            if (item.IDMENUFILHO) {
                var moduloObj = usuario.modulos[idModuloAcesso];
                var menuFilhoKey = idModuloAcesso + "_" + item.IDMENUFILHO;
                
                // Verifica se este menu filho já foi adicionado para evitar duplicação
                if (!usuario.menusFilhosAdicionados[menuFilhoKey]) {
                    var menuFilho = fnHandleGetMenuFilho(moduloObj.menuPai.IDMENU, item.IDMENUFILHO);
                    if (menuFilho && menuFilho.length > 0) {
                        moduloObj.menuPai.menuFilho = moduloObj.menuPai.menuFilho.concat(menuFilho);
                        usuario.menusFilhosAdicionados[menuFilhoKey] = true;
                    }
                }
            }
        

        }
    }

    // Monta o array final
    var data = [];
    for (var key in usuariosAgrupados) {
        var usuario = usuariosAgrupados[key];
        // Remove o controle de menus filhos adicionados antes de retornar
        delete usuario.menusFilhosAdicionados;
        // Converte o objeto modulos para array
        usuario.modulos = Object.keys(usuario.modulos).map(function(k) { return usuario.modulos[k]; });
        data.push(usuario);
    }

    return {
        rows: data.length,
        data: data
    };
}

function updatePerfilUsuarioMenu() {
    try {
        var conn = $.db.getConnection();
        var bodyJson = JSON.parse($.request.body.asString());
        
        if (!Array.isArray(bodyJson)) {
            bodyJson = [bodyJson];
        }
       
        for (var i = 0; i < bodyJson.length; i++) {
            var item = bodyJson[i];
            
            // Extrai os dados do item
            var IDUSUARIO = item.IDUSUARIO;
            var CRIAR = item.CRIAR;
            var ALTERAR = item.ALTERAR;
            var STATIVO = item.STATIVO;
            var IDMODULO = item.IDMODULO;
            var IDMODULOADMINISTRATIVO = item.IDMODULOADMINISTRATIVO;
            var IDMODULOCOMERCIAL = item.IDMODULOCOMERCIAL;
            var IDMODULOCONTABILIDADE = item.IDMODULOCONTABILIDADE;
            var IDMODULOFINANCEIRO = item.IDMODULOFINANCEIRO;
            var IDMODULOGERENCIA = item.IDMODULOGERENCIA;
            var IDMODULOINFORMATICA = item.IDMODULOINFORMATICA;
            var IDMODULOMARKETING = item.IDMODULOMARKETING;
            var IDMODULOCOMPRAS = item.IDMODULOCOMPRAS;
            var IDMODULOCADASTRO = item.IDMODULOCADASTRO;
            var IDMODULOEXPEDICAO = item.IDMODULOEXPEDICAO;
            var IDMODULOCOMPRASADM = item.IDMODULOCOMPRASADM;
            var IDMODULOETIQUETAGEM = item.IDMODULOETIQUETAGEM;
            var IDMODULOCONFERENCIACEGA = item.IDMODULOCONFERENCIACEGA;
            var IDMODULOVOUCHER = item.IDMODULOVOUCHER;
            var IDMODULOMALOTE = item.IDMODULOMALOTE;
            var IDMODULORH = item.IDMODULORH;
            var IDUSERULTIMAALTERACAO = item.IDUSERULTIMAALTERACAO;
            var IDPERMISSAO = item.IDPERMISSAO;
            var IDMODULORESUMOVENDAS = item.IDMODULORESUMOVENDAS;
            var IDMODULOPROMOCAO = item.IDMODULOPROMOCAO;
            var ADMINISTRADOR = item.ADMINISTRADOR;
            var N4 = item.N4;
            var N3 = item.N3;
            var N2 = item.N2;
            var N1 = item.N1;
            var IDMENU = item.IDMENU;
            var IDMENUFILHO = item.IDMENUFILHO;
            
            // Converte IDMENUFILHO para array se não for
            var menuFilhos = Array.isArray(IDMENUFILHO) ? IDMENUFILHO : [IDMENUFILHO];
            
            // Primeiro, verifica se o perfil do usuário existe
            var checkPerfilQuery = 'SELECT COUNT(*) AS TOTAL FROM "VAR_DB_NAME"."PERFILUSUARIOMENU" WHERE "IDUSUARIO" = ?';
            var checkPerfilStmt = conn.prepareStatement(api.replaceDbName(checkPerfilQuery));
            setIntOrNull(checkPerfilStmt, 1, IDUSUARIO);
            var checkPerfilResult = checkPerfilStmt.executeQuery();
            var perfilExists = false;
            
            if (checkPerfilResult.next()) {
                perfilExists = checkPerfilResult.TOTAL > 0;
            }
            checkPerfilStmt.close();
            var nextIdPerfil = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDPERFIL")), 0) + 1 FROM "VAR_DB_NAME"."PERFILUSUARIOMENU" WHERE 1 = ?', 1);
            // Se o perfil não existir, cria um novo
            if (!perfilExists) {
                var insertPerfilQuery = `
                    INSERT INTO "VAR_DB_NAME"."PERFILUSUARIOMENU" (
                      "IDPERFIL",
                      "IDUSUARIO", 
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
                        "IDUSERULTIMAALTERACAO",
                        "IDPERMISSAO",
                        "IDMODULORESUMOVENDAS",
                        "IDMODULOPROMOCAO",
                        "STATIVO",
                        "ADMINISTRADOR",
                        "IDMENU",
                        "IDMENUFILHO",
                        "DATAULTIMAALTERACAO"
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                `;
                
                var insertPerfilStmt = conn.prepareStatement(api.replaceDbName(insertPerfilQuery));
                insertPerfilStmt.setInt(1, nextIdPerfil);
                insertPerfilStmt.setInt(2, IDUSUARIO);
                insertPerfilStmt.setString(3, IDMODULO || "");
                insertPerfilStmt.setString(4, IDMODULOADMINISTRATIVO || "");
                insertPerfilStmt.setString(5, IDMODULOCOMERCIAL || "");
                insertPerfilStmt.setString(6, IDMODULOCONTABILIDADE || "");
                insertPerfilStmt.setString(7, IDMODULOFINANCEIRO || "");
                insertPerfilStmt.setString(8, IDMODULOGERENCIA || "");
                insertPerfilStmt.setString(9, IDMODULOINFORMATICA || "");
                insertPerfilStmt.setString(10, IDMODULOMARKETING || "");
                insertPerfilStmt.setString(11, IDMODULOCOMPRAS || "");
                insertPerfilStmt.setString(12, IDMODULOCADASTRO || "");
                insertPerfilStmt.setString(13, IDMODULOEXPEDICAO || "");
                insertPerfilStmt.setString(14, IDMODULOCOMPRASADM || "");
                insertPerfilStmt.setString(15, IDMODULOETIQUETAGEM || "");
                insertPerfilStmt.setString(16, IDMODULOCONFERENCIACEGA || "");
                insertPerfilStmt.setString(17, IDMODULOVOUCHER || "");
                insertPerfilStmt.setString(18, IDMODULOMALOTE || "");
                insertPerfilStmt.setString(19, IDMODULORH || "");
                insertPerfilStmt.setString(20, IDUSERULTIMAALTERACAO || "");
                insertPerfilStmt.setString(21, IDPERMISSAO || "");
                insertPerfilStmt.setString(22, IDMODULORESUMOVENDAS || "");
                insertPerfilStmt.setString(23, IDMODULOPROMOCAO || "");
                insertPerfilStmt.setString(24, STATIVO || "");
                insertPerfilStmt.setString(25, ADMINISTRADOR || "");
                setIntOrNull(insertPerfilStmt, 26, IDMENU);
                setIntOrNull(insertPerfilStmt, 27, IDMENUFILHO);
                
             
                insertPerfilStmt.executeUpdate();
                insertPerfilStmt.close();
            }
         
            // Agora processa os menus filhos
            for (var j = 0; j < menuFilhos.length; j++) {
                var menuFilho = menuFilhos[j];
                
             
                
                // Verifica se o registro já existe na tabela PERFILUSUARIOMENU
                var checkQuery = 'SELECT COUNT(*) AS TOTAL FROM "VAR_DB_NAME"."PERFILUSUARIOMENU" WHERE "IDUSUARIO" = ? AND "IDMENUFILHO" = ?';
                var checkStmt = conn.prepareStatement(api.replaceDbName(checkQuery));
                setIntOrNull(checkStmt, 1, IDUSUARIO);
                setIntOrNull(checkStmt, 2, menuFilho);
                var checkResult = checkStmt.executeQuery();
                var exists = false;
                
                if (checkResult.next()) {
                    exists = checkResult.TOTAL > 0;
                }
                checkStmt.close();
                
                if (exists) {
                    // UPDATE
                    var updateFields = [];
                    var updateParams = [];
                    var paramIndex = 1;
                    
                    if (IDMODULO) {
                        updateFields.push("IDMODULO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULO, type: 'varchar'});
                    }
                    if (IDMODULOADMINISTRATIVO) {
                        updateFields.push("IDMODULOADMINISTRATIVO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOADMINISTRATIVO, type: 'varchar'});
                    }
                    if (IDMODULOCOMERCIAL) {
                        updateFields.push("IDMODULOCOMERCIAL = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCOMERCIAL, type: 'varchar'});
                    }
                    if (IDMODULOCONTABILIDADE) {
                        updateFields.push("IDMODULOCONTABILIDADE = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCONTABILIDADE, type: 'varchar'});
                    }
                    if (IDMODULOFINANCEIRO) {
                        updateFields.push("IDMODULOFINANCEIRO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOFINANCEIRO, type: 'varchar'});
                    }
                    if (IDMODULOGERENCIA) {
                        updateFields.push("IDMODULOGERENCIA = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOGERENCIA, type: 'varchar'});
                    }
                    if (IDMODULOINFORMATICA) {
                        updateFields.push("IDMODULOINFORMATICA = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOINFORMATICA, type: 'varchar'});
                    }
                    if (IDMODULOMARKETING) {
                        updateFields.push("IDMODULOMARKETING = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOMARKETING, type: 'varchar'});
                    }
                    if (IDMODULOCOMPRAS) {
                        updateFields.push("IDMODULOCOMPRAS = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCOMPRAS, type: 'varchar'});
                    }
                    if (IDMODULOCADASTRO) {
                        updateFields.push("IDMODULOCADASTRO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCADASTRO, type: 'varchar'});
                    }
                    if (IDMODULOEXPEDICAO) {
                        updateFields.push("IDMODULOEXPEDICAO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOEXPEDICAO, type: 'varchar'});
                    }
                    if (IDMODULOCOMPRASADM) {
                        updateFields.push("IDMODULOCOMPRASADM = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCOMPRASADM, type: 'varchar'});
                    }
                    if (IDMODULOETIQUETAGEM) {
                        updateFields.push("IDMODULOETIQUETAGEM = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOETIQUETAGEM, type: 'varchar'});
                    }
                    if (IDMODULOCONFERENCIACEGA) {
                        updateFields.push("IDMODULOCONFERENCIACEGA = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOCONFERENCIACEGA, type: 'varchar'});
                    }
                    if (IDMODULOVOUCHER) {
                        updateFields.push("IDMODULOVOUCHER = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOVOUCHER, type: 'varchar'});
                    }
                    if (IDMODULOMALOTE) {
                        updateFields.push("IDMODULOMALOTE = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOMALOTE, type: 'varchar'});
                    }
                    if (IDMODULORH) {
                        updateFields.push("IDMODULORH = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULORH, type: 'varchar'});
                    }
                    if (IDPERMISSAO) {
                        updateFields.push("IDPERMISSAO = ?");
                        updateParams.push({index: paramIndex++, value: IDPERMISSAO, type: 'varchar'});
                    }
                    if (IDMODULORESUMOVENDAS) {
                        updateFields.push("IDMODULORESUMOVENDAS = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULORESUMOVENDAS, type: 'varchar'});
                    }
                    if (IDMODULOPROMOCAO) {
                        updateFields.push("IDMODULOPROMOCAO = ?");
                        updateParams.push({index: paramIndex++, value: IDMODULOPROMOCAO, type: 'varchar'});
                    }
                    if (IDMENU) {
                        updateFields.push("IDMENU = ?");
                        updateParams.push({index: paramIndex++, value: IDMENU, type: 'int'});
                    }
                    if (CRIAR !== undefined) {
                        updateFields.push("CRIAR = ?");
                        updateParams.push({index: paramIndex++, value: CRIAR, type: 'varchar'});
                    }
                    if (ALTERAR !== undefined) {
                        updateFields.push("ALTERAR = ?");
                        updateParams.push({index: paramIndex++, value: ALTERAR, type: 'varchar'});
                    }
                    if (ADMINISTRADOR !== undefined) {
                        updateFields.push("ADMINISTRADOR = ?");
                        updateParams.push({index: paramIndex++, value: ADMINISTRADOR, type: 'varchar'});
                    }
                    if (N1 !== undefined) {
                        updateFields.push("N1 = ?");
                        updateParams.push({index: paramIndex++, value: N1, type: 'varchar'});
                    }
                    if (N2 !== undefined) {
                        updateFields.push("N2 = ?");
                        updateParams.push({index: paramIndex++, value: N2, type: 'varchar'});
                    }
                    if (N3 !== undefined) {
                        updateFields.push("N3 = ?");
                        updateParams.push({index: paramIndex++, value: N3, type: 'varchar'});
                    }
                    if (N4 !== undefined) {
                        updateFields.push("N4 = ?");
                        updateParams.push({index: paramIndex++, value: N4, type: 'varchar'});
                    }
                    if (IDUSERULTIMAALTERACAO) {
                        updateFields.push("IDUSERULTIMAALTERACAO = ?");
                        updateParams.push({index: paramIndex++, value: IDUSERULTIMAALTERACAO, type: 'varchar'});
                    }
                    
                    if (updateFields.length > 0) {
                        var updateQuery = 'UPDATE "VAR_DB_NAME"."PERFILUSUARIOMENU" SET ' + 
                                        updateFields.join(', ') + 
                                        ', DATAULTIMAALTERACAO = CURRENT_TIMESTAMP WHERE IDUSUARIO = ? AND IDMENUFILHO = ?';
                        
                        var updateStmt = conn.prepareStatement(api.replaceDbName(updateQuery));
                        
                        // Define os parâmetros
                        for (var k = 0; k < updateParams.length; k++) {
                            var param = updateParams[k];
                            if (param.type === 'int') {
                                setIntOrNull(updateStmt, param.index, param.value);
                            }
                        }
                        
                        // WHERE parameters
                        updateStmt.setIntOrNull(paramIndex++, IDUSUARIO);
                        updateStmt.setIntOrNull(paramIndex, menuFilho);
                        
                        updateStmt.executeUpdate();
                        updateStmt.close();
                        $.trace.info('Permissão atualizada para IDUSUARIO ' + IDUSUARIO + ', IDMENUFILHO ' + menuFilho);
                    }
                } else {
                   
                    // INSERT
                    var insertQuery = `
                        INSERT INTO "VAR_DB_NAME"."PERFILUSUARIOMENU" (
                            "IDPERFIL",
                            "IDUSUARIO", 
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
                            "IDUSERULTIMAALTERACAO",
                            "IDPERMISSAO",
                            "IDMODULORESUMOVENDAS",
                            "IDMODULOPROMOCAO",
                            "IDMENU", 
                            "IDMENUFILHO",
                            "CRIAR", 
                            "ALTERAR", 
                            "ADMINISTRADOR",
                            "N1", 
                            "N2", 
                            "N3", 
                            "N4",
                            "STATIVO",
                            "DATAULTIMAALTERACAO"
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `;
                    
                    var insertStmt = conn.prepareStatement(api.replaceDbName(insertQuery));
              
                    setIntOrNull(insertStmt, 1, nextIdPerfil);
                    setIntOrNull(insertStmt, 2, IDUSUARIO);
                    insertStmt.setString(3, IDMODULO || "");
                    insertStmt.setString(4, IDMODULOADMINISTRATIVO || "");
                    insertStmt.setString(5, IDMODULOCOMERCIAL || "");
                    insertStmt.setString(6, IDMODULOCONTABILIDADE || "");
                    insertStmt.setString(7, IDMODULOFINANCEIRO || "");
                    insertStmt.setString(8, IDMODULOGERENCIA || "");
                    insertStmt.setString(9, IDMODULOINFORMATICA || "");
                    insertStmt.setString(10, IDMODULOMARKETING || "");
                    insertStmt.setString(11, IDMODULOCOMPRAS || "");
                    insertStmt.setString(12, IDMODULOCADASTRO || "");
                    insertStmt.setString(13, IDMODULOEXPEDICAO || "");
                    insertStmt.setString(14, IDMODULOCOMPRASADM || "");
                    insertStmt.setString(15, IDMODULOETIQUETAGEM || "");
                    insertStmt.setString(16, IDMODULOCONFERENCIACEGA || "");
                    insertStmt.setString(17, IDMODULOVOUCHER || "");
                    insertStmt.setString(18, IDMODULOMALOTE || "");
                    insertStmt.setString(19, IDMODULORH || "");
                    insertStmt.setString(20, IDUSERULTIMAALTERACAO || "");
                    insertStmt.setString(21, IDPERMISSAO || "");
                    insertStmt.setString(22, IDMODULORESUMOVENDAS || "");
                    insertStmt.setString(23, IDMODULOPROMOCAO || "");
                    insertStmt.setInt(24, parseInt(IDMENU || 0, 10));
                    insertStmt.setInt(25, menuFilho ? parseInt(menuFilho, 10) : 0);
                    insertStmt.setString(26, CRIAR || "");
                    insertStmt.setString(27, ALTERAR || "");
                    insertStmt.setString(28, ADMINISTRADOR || "");
                    insertStmt.setString(29, N1 || "");
                    insertStmt.setString(30, N2 || "");
                    insertStmt.setString(31, N3 || "");
                    insertStmt.setString(32, N4 || "");
                    insertStmt.setString(33, STATIVO || "");
                    
                    insertStmt.executeUpdate();
                    insertStmt.close();
              
                }
            }
        }
        
        conn.commit();
        conn.close();
        
        return {
            msg: "Atualização de perfil e menus concluída com sucesso!",
            data: bodyJson
        };
        
    } catch (error) {
    
        throw error;
    }
}

function createPerfilUsuarioMenu() {
    try {
        var conn = $.db.getConnection();
        var queryId = api.executeScalar(' SELECT IFNULL(MAX(TO_INT("IDPERFIL")),0) + 1 FROM "VAR_DB_NAME"."PERFILUSUARIOMENU" WHERE 1 = ? ', 1);
     

        var createQuery = `
            INSERT INTO "VAR_DB_NAME"."PERFILUSUARIOMENU" (
                IDPERFIL, 
                IDUSUARIO, 
                CRIAR, 
                ALTERAR, 
                STATIVO, 
                DATAULTIMAALTERACAO, 
                DATA_CRIACAO, 
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
                IDMENU, 
                IDMENUFILHO, 
                IDMODULOPROMOCAO,
                IDMODULO
            ) VALUES (
                ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
        `;

        var createStmt = conn.prepareStatement(api.replaceDbName(createQuery));
        var bodyJson = JSON.parse($.request.body.asString());

        // Permitir tanto array quanto objeto único
        if (!Array.isArray(bodyJson)) {
            bodyJson = [bodyJson];
        }

        for (var i = 0; i < bodyJson.length; i++) {
            var registro = bodyJson[i];
            // Permitir IDMENUFILHO como array ou valor único
            var menuFilhos = Array.isArray(registro.IDMENUFILHO) ? registro.IDMENUFILHO : [registro.IDMENUFILHO];
            for (var j = 0; j < menuFilhos.length; j++) {
                var idMenuFilho = menuFilhos[j];
                createStmt.setInt(1, queryId);
                createStmt.setInt(2, registro.IDUSUARIO);
                createStmt.setString(3, registro.CRIAR || "");
                createStmt.setString(4, registro.ALTERAR || "");
                createStmt.setString(5, registro.STATIVO || "");
                createStmt.setString(6, registro.IDMODULOADMINISTRATIVO || "");
                createStmt.setString(7, registro.IDMODULOCOMERCIAL || "");
                createStmt.setString(8, registro.IDMODULOCONTABILIDADE || "");
                createStmt.setString(9, registro.IDMODULOFINANCEIRO || "");
                createStmt.setString(10, registro.IDMODULOGERENCIA || "");
                createStmt.setString(11, registro.IDMODULOINFORMATICA || "");
                createStmt.setString(12, registro.IDMODULOMARKETING || "");
                createStmt.setString(13, registro.IDMODULOCOMPRAS || "");
                createStmt.setString(14, registro.IDMODULOCADASTRO || "");
                createStmt.setString(15, registro.IDMODULOEXPEDICAO || "");
                createStmt.setString(16, registro.IDMODULOCOMPRASADM || "");
                createStmt.setString(17, registro.IDMODULOETIQUETAGEM || "");
                createStmt.setString(18, registro.IDMODULOCONFERENCIACEGA || "");
                createStmt.setString(19, registro.IDMODULOVOUCHER || "");
                createStmt.setString(20, registro.IDMODULOMALOTE || "");
                createStmt.setString(21, registro.IDMODULORH || "");
                createStmt.setString(22, registro.IDUSERULTIMAALTERACAO || "");
                createStmt.setString(23, registro.IDPERMISSAO || "");
                createStmt.setString(24, registro.IDMODULORESUMOVENDAS || "");
                createStmt.setString(25, registro.ADMINISTRADOR || "");
                createStmt.setString(26, registro.N4 || "");
                createStmt.setString(27, registro.N3 || "");
                createStmt.setString(28, registro.N2 || "");
                createStmt.setString(29, registro.N1 || "");
                createStmt.setInt(30, registro.IDMENU || 0);
                createStmt.setInt(31, idMenuFilho || 0);
                createStmt.setString(32, registro.IDMODULOPROMOCAO || "");
                createStmt.setString(33, registro.IDMODULO || "");

                createStmt.execute();
            }
        }
        conn.commit();
        conn.close();
        return {
            msg: "Criação de perfil de usuário com menus filhos concluída com sucesso!",
            data: bodyJson
        };
    } catch (error) {
       
        if (conn) {
            conn.close();
        }
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
        case $.net.http.PUT:
            var updateResult = updatePerfilUsuarioMenu();
            $.response.setBody(JSON.stringify(updateResult));
            break;
        case $.net.http.POST:
            var createResult = createPerfilUsuarioMenu();
            $.response.setBody(JSON.stringify(createResult));
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