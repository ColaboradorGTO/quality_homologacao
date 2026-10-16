var api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");
var slApi = $.import("quality.concentrador_homologacao.api.service-layer.api", "slApi");

let quebraLinha = String.fromCharCode(13) + String.fromCharCode(10);
let linhaEmBranco = quebraLinha + quebraLinha;
let session = '';

const LIMITE_TAMANHO_BATCH = 100;

function getRegistrosAlteracaoPrecoProduto(idResumoAlteracaoPrecoProduto){
    let query = `
        SELECT
            TBR.IDRESUMOALTERACAOPRECOPRODUTO,
            TBD.IDDETALHEALTERACAOPRECOPRODUTO,
            TBD.IDRESUMOLISTAPRECO,
            TBD.IDPRODUTO,
            TBD.PRECOVENDA,
            (
                SELECT
                    STRING_AGG(XB.ID_LISTA_LOJA, ',')
                FROM
                    "VAR_DB_NAME".DETALHELISTAPRECO XA
                INNER JOIN "VAR_DB_NAME".EMPRESA XB ON
                    XA.IDEMPRESA = XB.IDEMPRESA
                WHERE
                    XA.STATIVO = 'True'
                    AND XA.IDRESUMOLISTAPRECO = TBD.IDRESUMOLISTAPRECO
            ) AS LISTAS_PRECO_INDIVIDUAIS_SAP
        FROM
            "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
        INNER JOIN "VAR_DB_NAME".DETALHEALTERACAOPRECOPRODUTO TBD ON 
            TBR.IDRESUMOALTERACAOPRECOPRODUTO = TBD.IDRESUMOALTERACAOPRECOPRODUTO
        WHERE 
            TBR.STATIVO = 'True'
            AND TBR.STEXECUTADO = 'True'
            AND TBD.STATIVO = 'True'
            AND TBD.STEXCLUIDO = 'False'
            AND TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
        ORDER BY 
            TBR.IDRESUMOALTERACAOPRECOPRODUTO,
            TBD.IDDETALHEALTERACAOPRECOPRODUTO
        LIMIT 10
    `;
    
	return api.sqlQuery(query, idResumoAlteracaoPrecoProduto);
}

// INICIO Atualização de Status/Dados //

function registrarErrorAoMigrarVenda(arrayIdsAlteracaoPrecoProduto, p_Error){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET 
            ERRORLOGSAP = ? 
        WHERE 
            IDVENDA = ? 
    `;

	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, p_Error);
	pStmt.setString(2, arrayIdsAlteracaoPrecoProduto);
	
	pStmt.execute();
	pStmt.close();
	
	return false;
}

function registrarSucessoAoMigrarVenda(arrayIdsAlteracaoPrecoProduto, idSapDocNum, idSapDocEntry){
    let query = `
        UPDATE 
            "VAR_DB_NAME"."VENDA" 
        SET
            ERRORLOGSAP = NULL,
            SAP_DOCENTRY = ?,
            SAP_DOCENTRY_CORRETO = ?
        WHERE 
            IDVENDA = ?
    `;
	
	let pStmt = conn.prepareStatement(api.replaceDbName(query));

	setIntOrNull(pStmt, 1, parseInt(idSapDocNum));
	pStmt.setInt(2, parseInt(idSapDocEntry));
	pStmt.setString(3, arrayIdsAlteracaoPrecoProduto);
	
	pStmt.execute();
	pStmt.close();
	
	return true;
}

// FIM Atualização de Status/Dados //

// INICIO Validação de Dados //

function validarMigracaoAlteracaoPrecoProdutoEmLote(response, arrayIdsAlteracaoPrecoProduto){
   let { body, status } = response || '';
   
   if(status !== 502){
        
       for (let  {IDVENDA, DocEntry, DocNum, error } of body){
           
            if (status == 202) {
                if(error.length > 0){
                    registrarErrorAoMigrarVenda(IDVENDA, (error || 'Erro ao tentar integrar o Pagamento'));
                } else{
                    registrarSucessoAoMigrarVenda(IDVENDA, Number(DocNum), Number(DocEntry));
                }
            } else {
                if(error.contains('Invoice is already closed or blocked')){
                    validarMigracaoVenda(IDVENDA);
                } else {
                    registrarErrorAoMigrarVenda(IDVENDA, (error || 'Erro ao tentar integrar o Pagamento'));
                }
           }
        }
    } else {
        for (let { IDVENDA } of arrayIdsVendas){
            validarMigracaoVenda(IDVENDA);
        }
    }
}

// FIM Validação de Dados //

// INICIO Manipulação de Resposta da SL //

function extractJsonFromResponseBatch(raw) {
    if (!raw) return null;

    let jsonRegex = /({[\s\S]*})/m;
    let jsonMatch = raw.match(jsonRegex);
    
    let jsonString = jsonMatch[1] || null;
    
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return { 
            error: "Falha ao fazer parse do JSON", 
            raw: jsonString 
        };
    }
}

function extractContentIdResponseBatch(raw) {
    if (!raw) return null;
    
    let idRegex = /Content-ID:\s*([^\r\n]+)/i;
    let idMatch = raw.match(idRegex);
    
    return idMatch ? idMatch[1] : null;
}

function extractDocEntryResponseBatch(raw) {
    if (!raw) return null;

    let match = raw.match(/Invoices\((\d+)\)/);

    return match ? match[1] : null;
}

function deepDumpOnlyBody(obj, visited) {
    visited = visited || new WeakSet();

    // valores primitivos
    if (obj === null || typeof obj !== "object") {
        return null;
    }

    if (visited.has(obj)) return null;
    visited.add(obj);

    let props = [];
    let current = obj;

    // pegar enumeráveis + não enumeráveis + herdadas
    while (current !== null) {
        try {
            props = props.concat(Object.getOwnPropertyNames(current));
        } catch (e) {}
        current = Object.getPrototypeOf(current);
    }

    // remover duplicados
    props = props.filter((v, i, a) => a.indexOf(v) === i);

    for (let p of props) {
        try {
            let val = obj[p];

            // ENCONTROU BODY?
            if (p === "body") {

                // Caso XSJS nativo
                if (val && typeof val.asString === "function") {
                    return val.asString();
                }

                // Caso seja string (batch / conversion)
                if (typeof val === "string") {
                    return val;
                }
            }

            // Recursão — procurar o body dentro de objetos internos
            if (val && typeof val === "object") {
                let found = deepDumpOnlyBody(val, visited);
                if (found !== null) return found;
            }

        } catch (e) {
            // ignora erros e continua
        }
    }

    return null; // não achou body
}

function padStartString(string){
    let lengthString = string.length;
    
    string = lengthString < 2 ? ('0' + string) : string;
    
    return string;
}

function getDateTimeFormatted() {
    const now = new Date();

    const dd = padStartString(String(now.getDate()));
    const mm = padStartString(String(now.getMonth() + 1)); // meses começam em 0
    const yyyy = now.getFullYear();

    const hh = padStartString(String(now.getHours()));
    const min = padStartString(String(now.getMinutes()));
    const ss = padStartString(String(now.getSeconds()));
    const ms = padStartString(String(now.getMilliseconds()));

    return `${dd}-${mm}-${yyyy} ${hh}:${min}:${ss}:${ms}`;
}

function parseBatchResponse(response) {
    let { entities } = response || {};
    let body = [];
    let dtHoraInicioResponse = getDateTimeFormatted();
    if (entities && entities.length) {
        
        for (var i = 0; i < entities.length; i++) {
            
            let item = entities[i];
            let raw = deepDumpOnlyBody(item) || null;
            
            try {
                
                let data = extractJsonFromResponseBatch(raw);
                let DocEntry = data.DocEntry;//extractDocEntryResponseBatch(raw);
                let idDetalheAlteracaoPrecoProduto = extractContentIdResponseBatch(raw);
                let error = '';
                
                if (data.error) {
                    error = data.error.message.value || 'Erro ao tentar integrar a alteracao de preco de produto';
                }
                
                body.push(
                    {
                       idDetalheAlteracaoPrecoProduto,
                       error
                    }
                );
                
            } catch (e) {
                error = e.toString();
            }
            
        }
        
    }
    
    let dtHoraFimResponse = getDateTimeFormatted();

    return {
        status: response.status,
        dtHoraInicioResponse,
        dtHoraFimResponse,
        body
    };
}

// FIM Manipulação de Resposta da SL //

// INICIO Montagem de Objetos Para Integração //

function templateBatch(boundary, changeSetResponse, json) {
    let itemCode = json.ItemCode;
    let contentId = json.IdDetalheAlteracaoPrecoProduto;
    let jsonString = JSON.stringify({"ItemPrices": json.ItemPrices});
    
    return (
        `--${boundary}` + quebraLinha +
        `Content-Type: multipart/mixed; boundary=${changeSetResponse}` +
        linhaEmBranco +
        `--${changeSetResponse}`+ quebraLinha +
        "Content-Type: application/http" + quebraLinha +
        "Content-Transfer-Encoding: binary" + quebraLinha +
        `Content-ID: ${contentId}` +
        linhaEmBranco +
        `PATCH Items('${itemCode}') HTTP/1.1` + quebraLinha +
        "Content-Type: application/json; charset=utf-8" + quebraLinha +
        "Prefer: return=minimal" + quebraLinha +
        linhaEmBranco +
        jsonString + 
        linhaEmBranco +
        `--${changeSetResponse}--`+
        linhaEmBranco
    );
}

function criarBatch(data) {
    let changeSet = "changesetresponse_" + session;
    let boundary = "batch_" + Date.now() + "_" + session;
    let contador = 1;
    let body = "";

    for (let json of data) {
        
        let currentChangeSet = (changeSet + "_" + contador);
        
        body += templateBatch(boundary, currentChangeSet, json);
        
        contador++;
    }

    body += (
        `--${boundary}--` +
        linhaEmBranco    
    );

    return { boundary, body };
}

function gerarArrayBatch(registros){
    let arrayBatch = [];
    let arrayItemPrices = [];
    let batch = '';
    let count = 0;
    
    for (let i = 0; i < registros.length; i++) {
        let { IDRESUMOALTERACAOPRECOPRODUTO, IDDETALHEALTERACAOPRECOPRODUTO, IDPRODUTO, PRECOVENDA, LISTAS_PRECO_INDIVIDUAIS_SAP } = registros[i];
        let listasPrecosSap = LISTAS_PRECO_INDIVIDUAIS_SAP;
        let arrayListasPreco = listasPrecosSap.split(',');
        let arrayProductPrices = [];
        
        for(let idListaPrecoSap of arrayListasPreco){		
            arrayProductPrices.push(
                {
                    "PriceList": Number(idListaPrecoSap)
                    ,"Price": Number(PRECOVENDA)
                    ,"Currency": "R$" // ou BRL
                    ,"Factor": 1.0
                }
            );
        }
        
        count++;
        
        arrayItemPrices.push({ "ItemCode": IDPRODUTO, "IdDetalheAlteracaoPrecoProduto": IDDETALHEALTERACAOPRECOPRODUTO, "ItemPrices": arrayProductPrices});
        
        if(count == LIMITE_TAMANHO_BATCH || i == registros.length - 1){
            
            batch = criarBatch(arrayItemPrices);
            
            arrayBatch.push({length: arrayItemPrices.length, batch});
            
            batch = '';
            count = 0;
            arrayItemPrices = [];
        }
	}
	
	return arrayBatch;
}

// FIM Montagem de Objetos Para Integração //

function patchBatchSL(dataBatch, session) {
    if(!client){
        client = new $.net.http.Client();
    }
    
    if(!session){
        session = slApi.loginServiceLayer(true);
    }
    
    let response = slApi.patchBatch(client, dataBatch, session);
    let respostaFormatada = parseBatchResponse(response);
    
    validarMigracaoAlteracaoPrecoProdutoEmLote(respostaFormatada, arrayIdsAlteracaoPrecoProduto);
    
    return respostaFormatada;
}

function atualizaMigracaoProduto(idProduto){
    var conn = $.db.getConnection();
    var query = 'UPDATE "VAR_DB_NAME"."DETALHEPRODUTOPEDIDO" SET' +
		'  STMIGRADOSAP = \'True\','+
		'  STVINCPRODPEDSAP = \'True\''+
		' WHERE IDPRODCADASTRO = ?';
	
	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	pStmt.setString(1, idProduto);
	
	pStmt.execute();
	
	pStmt.close();

	conn.commit();
	return 'True';
}

function executeIntegracaoAlteracaoPrecoProduto(idResumoAlteracaoPrecoProduto){
	let registros = getRegistrosAlteracaoPrecoProduto(idResumoAlteracaoPrecoProduto);
	
	if(registros.length <= 0){
	    return;
	}
	
	if(!session){
        session = slApi.loginServiceLayer(true);
	} 
	//return { leng: registros.length};
	let arrayBatches = gerarArrayBatch(registros);
	
	return { arrayBatches };
	
	for(let { batch } of arrayBatches){
        let respIntegracao = patchBatchSL(batch);
        
        validarRespostaIntegracao(respIntegracao);
	}

    return 'Migração Alteração de Preco de Produto realizada com sucesso!';
}
if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var doc = executeProdutosItem();
                 $.response.setBody(JSON.stringify({ result : doc }));
                break;
                
            default:
                break;
        }
    
    } catch(e) {
        $.response.contentType = 'application/json';
        $.response.setBody(JSON.stringify({ message : e.message }));
        $.response.status = 400;
    }   
}

