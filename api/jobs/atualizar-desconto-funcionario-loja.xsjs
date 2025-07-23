var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function execute() {
  var conn = $.db.getConnection();

  let query = `
    UPDATE "VAR_DB_NAME"."FUNCIONARIO"
    SET
      "PERC" = CASE 
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 730 THEN 20  -- 730 dias ou mais
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 365 THEN 15  -- 365 dias ou mais
                  WHEN DAYS_BETWEEN("DATA_ADMISSAO", NOW()) >= 90 THEN 10    -- 90 dias ou mais
                  ELSE "PERC" 
              END,
      "DATAULTIMAALTERACAO" = NOW()
    WHERE 
      "DATA_ADMISSAO" >= '2024-08-01'
      AND ("PERC" < 20 OR "PERC" IS NULL)
  `;

  var pStmt = conn.prepareStatement(api.replaceDbName(query));


  pStmt.execute();
  
  pStmt.close();
  conn.commit();
  return {
    msg: "Atualização realizada com sucesso!"
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
