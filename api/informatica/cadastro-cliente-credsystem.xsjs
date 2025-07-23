var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

try {
    
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataInicio = $.request.parameters.get("dtInicio");
    var dataFim = $.request.parameters.get("dtFim");    
    
    var query = `SELECT
                	TBC.NUCPFCNPJ AS CPF_CLIENTE,
                	TBC.DSNOMERAZAOSOCIAL AS NOME_CLIENTE,
                	NULL AS NOME_MAE,
                	NULL AS SEXO_CLIENTE,
                	TBC.NUCEP AS CEP_RESIDNCL,
                	TBC.SGUF AS RESIDNCL,
                	TBC.ECIDADE AS CIDADE_RESIDNCL,
                	TBC.EBAIRRO AS BAIRRO_RESIDNCL,
                	NULL AS TP_END_RESIDNCL,
                	TBC.EENDERECO AS END_RESIDNCL,
                	TBC.ECOMPLEMENTO AS COMPL_RESIDNCL,
                	NULL AS DDD_RESIDNCL,
                	TBC.NUTELCOMERCIAL AS NUM_TEL_RESIDNCL,
                	TBC.NUTELCELULAR AS NUM_CELULAR,
                	NULL AS DDD_CELULAR,
                	NULL AS DDD_CMRCL,
                	IFNULL(TBC.FONECONTATOCLIENTE01, TBC.NUTELCELULAR) AS NUM_CMRCL,
                	TBC.EEMAIL AS EMAIL_CLI_PRTCLR,
                	IFNULL(TBC.EEMAILCONTATOCLIENTE01, TBC.EEMAIL) AS EMAIL_CLI_CMRCL,
                	TBE.NOFANTASIA AS NOME_EMP_FIELDD,
                	NULL AS NOME_PARC_CRED,
                	TBC.DTNASCFUNDACAO AS DT_NASCIMENTO,
                	NULL AS NUM_RESIDNCL,
                	TBC.DTULTALTERACAO AS DT_CADASTRO,
                	TBC.DTULTALTERACAO AS DT_ALTERACAO,
                	NULL AS COD_LOJA_PRC_CRD,
                	TBC.DTULTALTERACAO AS DT_INCLUSAO_DW
                FROM
                	"VAR_DB_NAME".CLIENTE TBC 
                INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON 
                	TBC.IDEMPRESA = TBE.IDEMPRESA 
                WHERE
                    1 = ? AND LENGTH(TBC.NUCPFCNPJ) <= 11`;
    
    if(idEmpresa) {
        query = query + ' AND TBC.IDEMPRESA = \'' + idEmpresa + '\' ';
    }
    
    if(dataInicio) {
        query = query + ' AND (TBC.DTULTALTERACAO  BETWEEN \'' + dataInicio + ' 00:00:00\' AND \'' + dataFim + ' 23:59:59\')';
    }
    
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    query += ' ORDER BY TBC.DTULTALTERACAO';
    
    api.responseWithQuery(query, request, 1);
    

} catch(e) {
   
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.toString() }));
    $.response.status = 400;
}