var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function execute() {
  var conn = $.db.getConnection();

  let query = `
    UPDATE "VAR_DB_NAME"."FUNCIONARIO"
    SET
      "PERC" = CASE 
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 365 THEN 20  -- 365 dias ou mais
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 182 THEN 15  -- 182 dias ou mais
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 90 THEN 10    -- 90 dias ou mais
                  ELSE "PERC" 
              END,
      "DATAULTIMAALTERACAO" = NOW()
    WHERE 
      "DATA_ADMISSAO" >= '2024-08-01'
      AND ("PERC" < 20 OR "PERC" IS NULL)
  `;

  var pStmt = conn.prepareStatement(api.replaceDbName(query));
  var bodyJson = JSON.parse($.request.body.asString());
  var messages = []; 

 
  var affectedRows = pStmt.executeUpdate(); 

  
  messages.push(`Número de registros afetados: ${affectedRows}`);

  for (var i = 0; i < bodyJson.length; i++) {
    var registro = bodyJson[i];

  
    // messages.push(`Registro: ID=${registro.ID}, PERC=${registro.PERC}, DATA_ADMISSAO=${registro.DATA_ADMISSAO}`);

    if (parseFloat(registro.PERC) > 50) {
      return {
        msg: "Valor de PERC maior que permitido! O máximo permitido é 50.",
        details: messages
      };
    }

    if (parseFloat(registro.PERC) >= 20) {
      continue; 
    }

  }

 
  pStmt.close();
  conn.commit();

  return {
    msg: "Atualização realizada com sucesso!",
  };
}
if ($.response) {
  $.response.contentType = "application/json";
  $.response.status = $.net.http.OK;

  try {
    switch ($.request.method) {
      case $.net.http.PUT:
        var doc = execute();
        $.response.setBody(JSON.stringify({ result: doc }));
        break;
      default:
        // Retorna a mensagem de erro e o bodyJson
        $.response.status = $.net.http.METHOD_NOT_ALLOWED;
        $.response.setBody(JSON.stringify({ message: "Método não permitido" }));
        break;
    }
  } catch (e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message: e.message }));
    $.response.status = 400;
  }
}

