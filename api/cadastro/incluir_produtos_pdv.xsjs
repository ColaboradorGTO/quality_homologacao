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

function atualizaDetalheProdutoPedido(idDetProdPedido, conn){
    
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET ' + 
        ' DETALHEPRODUTOPEDIDO.STCADASTRADO = \'True\' ' + 
        ' FROM "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" ' + 
        ' WHERE DETALHEPRODUTOPEDIDO.IDDETALHEPRODUTOPEDIDO =  \'' + idDetProdPedido + '\' ';
    
    var atualizadorDeStatus = conn.prepareStatement(api.replaceDbName(query));
    atualizadorDeStatus.execute();
    
    atualizadorDeStatus.close();
	//conn.commit();
} 
 
function execute () {
    var bodyJson = JSON.parse($.request.body.asString()); 
    
    if(bodyJson.length > 0){
        var conn = $.db.getConnection();
        	    
        for (var i = 0; i < bodyJson.length; i++) {
            let registro = bodyJson[i];
            
            let queryInsertProduto = `
                INSERT INTO "VAR_DB_NAME"."PRODUTO" 
                    (
                        "IDPRODUTO", 
                        "IDGRUPOEMPRESARIAL", 
                        "NUNCM", 
                        "NUCEST", 
                        "NUCST_ICMS", 
                        "NUCFOP", 
                        "PERC_OUT", 
                        "NUCODBARRAS", 
                        "DSNOME", 
                        "STGRADE", 
                        "UND", 
                        "PRECOCUSTO", 
                        "PRECOVENDA", 
                        "QTDENTRADA", 
                        "QTDCOMERCIALIZADA", 
                        "QTDPERDA", 
                        "QTDDISPONIVEL", 
                        "PERCICMS", 
                        "PERCISS", 
                        "PERCPIS", 
                        "PERCCOFINS", 
                        "COD_CSOSN", 
                        "PERCCSOSC", 
                        "NUCST_IPI", 
                        "NUCST_PIS", 
                        "NUCST_COFINS", 
                        "PERCIPI", 
                        "STPESAVEL", 
                        "GRP_MATERIAIS", 
                        "IDSUBGRUPO", 
                        "IDFABRICANTE", 
                        "IDFORNECEDOR", 
                        "NUREFERENCIA", 
                        "STATIVO", 
                        "IDCOR", 
                        "IDTAMANHO", 
                        "IDCATEGORIAPEDIDO", 
                        "IDTIPOTECIDO", 
                        "IDESTILO", 
                        "IDLOCALEXPOSICAO", 
                        "IDCATEGORIAS", 
                        "IDDETALHEPRODUTOPEDIDO", 
                        "IDTIPOPRODUTOFISCAL", 
                        "IDFONTEPRODUTOFISCAL",
                        "DTULTALTERACAO" 
                    )
                    SELECT
                        "VAR_DB_NAME".SEQ_PRODUTOPEDIDO.NEXTVAL AS IDPRODUTO,
                        tbrp.IDGRUPOEMPRESARIAL As IDGRUPOEMPRESARIAL,
                        detprodped.NUNCM As NUNCM,
                        '' As NUCEST,
                        '' As NUCST_ICMS,
                        '' As NUCFOP,
                        '' As PERC_OUT,
                        detprodped.CODBARRAS As NUCODBARRAS,
                        detprodped.DSPRODUTO As DSNOME,
                        1 As STGRADE,
                        detprodped.UND As UND,
                        detprodped.VRCUSTO As PRECOCUSTO,
                        detprodped.VRVENDA As PRECOVENDA,
                        0 As QTDENTRADA,
                        0 As QTDCOMERCIALIZADA,	
                        0 As QTDPERDA,
                        0 As QTDDISPONIVEL,
                        0.0 As PERCICMS,
                        0.0 As PERCISS,
                        0.0 As PERCPIS,
                        0.0 As PERCCOFINS,
                        '' As COD_CSOSN,
                        0.0 As PERCCSOSC,
                        '' As NUCST_IPI,
                        '' As NUCST_PIS,
                        '' As NUCST_COFINS,
                        0.0 As PERCIPI,
                        0 As STPESAVEL,
                        1 As GRP_MATERIAIS,
                        detprodped.IDSUBGRUPOESTRUTURA As IDSUBGRUPO,
                        detprodped.IDFABRICANTE As IDFABRICANTE,
                        tbrp.IDFORNECEDOR As IDFORNECEDOR,
                        detprodped.NUREF As NUREFERENCIA,
                        'True' As STATIVO,
                        detprodped.IDCOR As IDCOR,
                        detprodped.IDTAMANHO As IDTAMANHO,
                        detprodped.IDCATEGORIAPEDIDO As IDCATEGORIAPEDIDO,
                        detprodped.IDTIPOTECIDO As IDTIPOTECIDO,
                        detprodped.IDESTILO As IDESTILO,
                        detprodped.IDLOCALEXPOSICAO As IDLOCALEXPOSICAO,
                        detprodped.IDCATEGORIAS As IDCATEGORIAS,
                        detprodped.IDDETALHEPRODUTOPEDIDO As IDDETALHEPRODUTOPEDIDO,
                        detprodped.IDTIPOPRODUTOFISCAL As IDTIPOPRODUTOFISCAL,
                        detprodped.IDFONTEPRODUTOFISAL As IDFONTEPRODUTOFISCAL,
                        CURRENT_TIMESTAMP  As DTULTALTERACAO
                    FROM 
                        "VAR_DB_NAME".DETALHEPRODUTOPEDIDO AS detprodped 
                    INNER JOIN "VAR_DB_NAME".DETALHEPEDIDO AS tbdp ON 
                        detprodped.IDDETALHEPEDIDO = tbdp.IDDETALHEPEDIDO 
                    INNER JOIN "VAR_DB_NAME".RESUMOPEDIDO AS tbrp ON 
                        tbdp.IDRESUMOPEDIDO = tbrp.IDRESUMOPEDIDO
                    WHERE
                    	detprodped.STCANCELADO ='False' 
                    	AND detprodped.STCADASTRADO <> 'True' 
                    	AND detprodped.STREPOSICAO <> 'True'
                    	AND detprodped.IDDETALHEPRODUTOPEDIDO = ?
            `;
            		
            let pStmt = conn.prepareStatement(api.replaceDbName(queryInsertProduto));
            
            pStmt.setInt(1, registro.IDDETALHEPRODUTOPEDIDO);
            
            pStmt.execute();
            
            pStmt.close();
            
            atualizaDetalheProdutoPedido(registro.IDDETALHEPRODUTOPEDIDO, conn);
            
            conn.commit();
        }
    }
    
    return true;
}

$.response.contentType = 'application/json';
$.response.status = $.net.http.OK;
    
try {
    switch ( $.request.method ) {
        //Handle your GET calls here
        case $.net.http.POST:
            var doc = execute();
             $.response.setBody(JSON.stringify({ result : doc }));
            break;
            
        default:
            break;
    }

} catch (e) {
    var detalheError = e.stack.split('\n');
    
    detalheError = detalheError.length > 3 ? detalheError[1].trim() : detalheError[ detalheError.length - 3].trim()
    
    if(detalheError){
       detalheError = `Linha: ${detalheError.split(':')[1]} da Funcao ${detalheError.split('@').shift()}()`;
    }
    
    $.response.contentType = 'application/json';
    $.response.setBody(
        JSON.stringify({
            message: e.message,
            detalheError
        })
    );
    $.response.status = 400;
} 