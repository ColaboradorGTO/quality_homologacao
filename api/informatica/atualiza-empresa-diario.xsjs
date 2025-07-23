var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function fnHandleGet(byId) {
    
    var query = 'SELECT ' +
        'tbe.IDEMPRESA, ' +
        'tbe.NOFANTASIA, ' +
        'TO_VARCHAR(tbe.HORAATUALIZA,\'HH24:MI:SS\') AS HRATUALIZACAO, ' +
        'tbe.STATUALIZADIARIO, ' +
        'tbe.STLOJAABERTA, ' +
        'tbe.IDFUNCIONARIOSUPERVISOR ' +
        'FROM "VAR_DB_NAME".EMPRESA tbe ' +
        'WHERE 1 = ? ' +
        'AND tbe.STATIVO = \'True\'';
    
    if ( byId ) {
        query = query + ' And  tbe.IDEMPRESA = \'' + byId + '\' ';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
  var conn = $.db.getConnection();
  var query = 'UPDATE "QUALITY_CONC_HML"."EMPRESA" SET ' +
      '"STATUALIZADIARIO" = ?, ' +
      '"HORAATUALIZA" = ?, ' +
      '"IDFUNCIONARIOSUPERVISOR" = ?, ' +
      '"STLOJAABERTA" = ? ' +
      'WHERE "IDEMPRESA" = ?';

  var pStmt = conn.prepareStatement(query);
  var bodyJson = JSON.parse($.request.body.asString());

  for (var i = 0; i < bodyJson.length; i++) {
      var registro = bodyJson[i];

      pStmt.setString(1, registro.STATUALIZADIARIO);
      pStmt.setString(2, registro.HORAATUALIZA);

     if (registro.IDFUNCIONARIOSUPERVISOR !== 0) {
            pStmt.setInteger(3, registro.IDFUNCIONARIOSUPERVISOR);
     } else {
            pStmt.setNull(3);
    }


      pStmt.setString(4, registro.STLOJAABERTA);
      pStmt.setInt(5, registro.IDEMPRESA);

      pStmt.execute();
  }

  pStmt.close();
  conn.commit();

  return {
      msg: "Atualização realizada com sucesso!"
  };
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;

try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.PUT:
            var docReturn = fnHandlePut();
            $.response.setBody(JSON.stringify(docReturn));
            break;
            
        //Handle your GET calls here
        case $.net.http.GET:
            var id = $.request.parameters.get("id");
            fnHandleGet(id);
            break;
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}