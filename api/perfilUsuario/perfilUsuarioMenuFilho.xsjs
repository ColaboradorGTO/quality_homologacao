var api = $.import("quality.concentrador_node.api.apiResponse", "int_api");

function fnHandleGetPerfilUsuarioMenuFilho() {
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
            query += ` AND IDMENUFILHO IN (${idMenuFilho.split(',').map(Number).join(',')})`;
      
        }
        
        query += ' ORDER BY IDUSUARIO, IDMENUFILHO';
        
        var result = api.sqlQuery(query, 1, idUsuario);
        

        
        return {
            rows: result.length,
            data: result
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
            var result = fnHandleGetPerfilUsuarioMenuFilho();
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