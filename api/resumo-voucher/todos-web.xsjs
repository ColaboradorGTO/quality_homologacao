let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function padLeft(number, length, character) {
	if(character == null) {
		character = '0';
    }
	var result = String(number);
	for(var i = result.length; i < length; ++i) {
		result = character + result;
	}
	return result;
}

function setStringOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setString(fieldId, value);
}

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

function setFloatOrNull(stmt, fieldId, value) {
	if (!value) {
		stmt.setNull(fieldId);
		return;
	}
	stmt.setFloat(fieldId, value);
}

function retornaDiasEntreDatas(dataHora){
    let dataHoraAtual = new Date();
    dataHora = dataHora ? new Date(dataHora) : new Date();
    
    dataHora.setUTCHours(0, 0, 0, 0);
    dataHoraAtual.setUTCHours(0, 0, 0, 0);
    
    return Math.ceil(Math.abs(dataHoraAtual - dataHora) / (1000 * 60 * 60 * 24));
}

function fnAuthUserCreate(dadosAuth, MODO) {
    let diferencaEmDias;
    let { IDUSRLIBERACAOCRIACAO, IDGRUPOEMPRESARIAL, IDEMPRESAORIGEM, IDRESUMOVENDAWEB, NUCPF, STTIPOTROCA } = dadosAuth || false;
    let IDFUNCIONARIO = IDUSRLIBERACAOCRIACAO;
    let IDEMPRESALOGADA = IDEMPRESAORIGEM;
    let IDVENDA = IDRESUMOVENDAWEB;
    
    let funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasCreateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasCreate60Ate180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
    ];
    
    let funcAutorizadasCreateNaFCAte180Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA'
    ];
    
    if(!IDEMPRESALOGADA) {
        throw {
            message: 'A identificação de Empresa Logada é uma informação obrigatória'
        };
    }
    
    if(!IDGRUPOEMPRESARIAL) {
        throw {
            message: 'A identificação do Grupo Empresarial é uma informação obrigatória'
        }
    }
    
    if(!IDVENDA) {
        throw {
            message: 'A identificação da Venda é uma informação obrigatória'
        }
    }
    
    if(!IDFUNCIONARIO) {
        throw {
            message: 'A identificação do Funcionario é uma informação obrigatória'
        }
    }
    
    if(!NUCPF) {
        throw {
            message: 'A identificação do CPF/CNPJ do Cliente é uma informação obrigatória'
        }
    }
    
    let queryFunc = `
        SELECT
            tbf.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            tbf.IDEMPRESA,
            tbf.NOFUNCIONARIO,
            tbf.IDPERFIL,
            tbf.NUCPF,
            UPPER(tbf.DSFUNCAO) as DSFUNCAO,
            tbf.STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO tbf
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBF.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            tbf.IDFUNCIONARIO = ?
            AND tbf.STATIVO = 'True' 
    `;
    
    let queryVenda = `
        SELECT
            TBV.DTHORAFECHAMENTO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDEMPRESA
        FROM
            VENDA TBV
        INNER JOIN EMPRESA TBE ON
            TBV.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            TBV.IDVENDA = ?
            AND TBV.STCANCELADO = 'False'
    `;
    
    let queryEmpresaLogada = `
        SELECT
            TBE.IDEMPRESA,
            TBE.IDGRUPOEMPRESARIAL
        FROM
            EMPRESA TBE
        WHERE
            TBE.IDEMPRESA = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, IDFUNCIONARIO);
    let dataVenda = api.sqlQuery(queryVenda, IDVENDA);
    let dataEmpresaLogada = api.sqlQuery(queryEmpresaLogada, IDEMPRESALOGADA);
    
    if(!dataEmpresaLogada.length){
        throw {
            message: 'Empresa do Usuario Não Encontrada!'
        }
    }
    
    if(!dataVenda.length){
        throw {
            message: 'Venda Não Localizada'
        }
    }
    
    if(!dataFunc.length){
       throw {
            message: 'Matricula ou senha inválidos!'
       }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    if(IDGRUPOEMPRESARIAL !== dataVenda[0].IDGRUPOEMPRESARIAL){
        throw {
            message: 'ACESSO NEGADO! Esta Venda Não Pertence a Nenhuma Loja do Grupo!'
        }
    }
    
    if(IDGRUPOEMPRESARIAL !== dataEmpresaLogada[0].IDGRUPOEMPRESARIAL){
        throw {
            message: 'ACESSO NEGADO! Grupo Empresarial da Loja Divergente, Entre Em Contato Com o Suporte!'
        }
    }
    
    if(dataFunc[0].DSFUNCAO.trim().includes('OPERADOR') && dataFunc[0].NUCPF == NUCPF){
        throw {
            message: 'ACESSO NEGADO! Não é Permitida Criação de Voucher Para Você Mesmo, Fale Com o Gerente, Subgerente ou Líder de Loja!'
        }
    }
    
    diferencaEmDias = retornaDiasEntreDatas(dataVenda[0].DTHORAFECHAMENTO);
    
    if(diferencaEmDias > 180){
        throw {
            message: `ACESSO NEGADO! Venda fora do Prazo de Troca! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
        }
    }

    if(dataFunc[0].DSFUNCAO.trim() !== 'TI'){
        
        if(dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR'){
            if(IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
            
            if(IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(!funcAutorizadasCreateAte32Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
            throw {
                message: `Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
            }
        }
        
        if(STTIPOTROCA !== 'DEFEITO'){
            
            if(diferencaEmDias > 32 && !funcAutorizadasCreate60Ate180Dias.includes(dataFunc[0].DSFUNCAO.trim())){
                throw {
                    message: `Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias} Dias`
                }
            }
        } else {
            if(diferencaEmDias > 90) {
                throw {
                    message: `ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}, Fale Com o Suporte`
                }
            }
        }
        
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasCreateNaFCAte180Dias.includes(dataFunc[0].DSFUNCAO.trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
    }
    
    return true;
}

function fnAuthUserUpdate(dadosAuth) {
    let { IDFUNCIONARIO, IDEMPRESALOGADA, IDGRUPOEMPRESARIAL, IDVOUCHER, STSTATUS } = dadosAuth || false;
    let diferencaEmDias;
    
    let funcAutorizadasAcesso = [
        'TI',
        'SUPERVISOR',
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasUpdateAte32Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
        'OPERADORA DE CAIXA',
        'OPERADOR DE CAIXA',
        'OPERADOR(A) DE CAIXA'
    ];
    
    let funcAutorizadasUpdateAte60Dias = [
        'GERENTE',
        'SUB GERENTE',
        'FISCAL DE CAIXA',
    ];
    
    let funcAutorizadasUpdateAte180Dias = [
        'TI',
        'SUPERVISOR',
    ];
    
    let statusVoucherNaoAutorizados = [
        'NOVO',
        'LIBERADO PARA O CLIENTE',
        'FINALIZADO',
        'NEGADO',
        'CANCELADO',
    ]
    
     if(!IDEMPRESALOGADA) {
        throw {
            message: 'A identificação de Empresa Logada é uma informação obrigatória'
        };
    }
    
    if(!IDGRUPOEMPRESARIAL) {
        throw {
            message: 'A identificação do Grupo Empresarial é uma informação obrigatória'
        }
    }
    
    if(!IDFUNCIONARIO) {
        throw {
            message: 'Usuário não encontrado!'
        }
    }
    
    if(!IDVOUCHER) {
        throw {
            message: 'Usuário não encontrado!'
        }
    }
    
    let queryFunc = `
        SELECT
            tbf.IDFUNCIONARIO,
            TBE.IDGRUPOEMPRESARIAL,
            TBE.IDSUBGRUPOEMPRESARIAL,
            tbf.IDEMPRESA,
            tbf.NOFUNCIONARIO,
            tbf.IDPERFIL,
            UPPER(tbf.DSFUNCAO) AS DSFUNCAO,
            tbf.STATIVO
        FROM
            "VAR_DB_NAME".FUNCIONARIO tbf
        INNER JOIN "VAR_DB_NAME".EMPRESA TBE ON
            TBF.IDEMPRESA = TBE.IDEMPRESA
        WHERE
            tbf.IDFUNCIONARIO = ?
            AND tbf.STATIVO = 'True' 
    `;
    
    let queryVoucher = `
        SELECT 
            TBR.IDRESUMOVENDAWEB,
            (SELECT DTHORAFECHAMENTO FROM "VAR_DB_NAME".VENDA WHERE IDVENDA = TBR.IDRESUMOVENDAWEB AND STCANCELADO = 'False') AS DTHORAFECHAMENTO,
            TBR.STSTATUS,
            TBR.STTIPOTROCA
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBR
        WHERE 
            TBR.IDVOUCHER = ?
    `;
    
    let dataFunc = api.sqlQuery(queryFunc, IDFUNCIONARIO);
    let DadosVoucher = api.sqlQuery(queryVoucher, IDVOUCHER);
    
    if(!DadosVoucher.length){
        throw {
            message: 'Venda Não Localizada'
        }
    }

    if(!dataFunc.length){
        throw {
            message: 'Usuário inválido!'
        }
    }
    
    if(!funcAutorizadasAcesso.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
        throw {
            message: 'ACESSO NEGADO! Usuário Sem Permissão!'
        }
    }
    
    diferencaEmDias = retornaDiasEntreDatas(DadosVoucher[0].DTHORAFECHAMENTO);
    
    if(diferencaEmDias > 180){
        throw {
            message: `ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}`
        }
    }
    
    if(dataFunc[0].DSFUNCAO !== 'TI'){
        if(dataFunc[0].DSFUNCAO.trim() !== 'SUPERVISOR'){
            if(IDEMPRESALOGADA !== dataFunc[0].IDEMPRESA){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Nessa Loja, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
            
            if(IDGRUPOEMPRESARIAL !== dataFunc[0].IDGRUPOEMPRESARIAL){
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão Em Lojas Deste Grupo Empresarial, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
        
        if(statusVoucherNaoAutorizados.includes(DadosVoucher[0].STSTATUS.toUpperCase().trim())){
            throw {
                message: `ACESSO NEGADO! Usuário Sem Permissão Para Alterar o Status de: ${DadosVoucher[0].STSTATUS} Para: ${STSTATUS}`
            }
        }
        
        if(diferencaEmDias <= 32 && !funcAutorizadasUpdateAte32Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja !'
            }
        }
        
        if(diferencaEmDias > 32 && diferencaEmDias <= 60 && !funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())){
            throw {
                message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
            }
        }
        
        if(DadosVoucher[0].STTIPOTROCA !== 'DEFEITO') {
            
            if(diferencaEmDias > 60 && !funcAutorizadasUpdateAte180Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com a Supervisão!'
                }
            }
        } else {
            if(diferencaEmDias > 90) {
                throw {
                    message: `ACESSO NEGADO! Voucher fora do Prazo de Troca de Status! DIAS PASSADOS APÓS A VENDA: ${diferencaEmDias}, Fale Com o Suporte`
                }
            }
        }
        
        if((dataFunc[0].IDGRUPOEMPRESARIAL == 4 || IDGRUPOEMPRESARIAL == 4)){
            if(!funcAutorizadasUpdateAte60Dias.includes(dataFunc[0].DSFUNCAO.toUpperCase().trim())) {
                throw {
                    message: 'ACESSO NEGADO! Usuário Sem Permissão, Fale Com o Gerente, Subgerente ou Líder de Loja!'
                }
            }
        }
    }
    
    return true;
}

function fnAtualizaStatusProdutosOrigemVoucher(idVoucher, stAtivo, stCancelado, stStatus, conn){
    let stTroca = 'False';
    
    let queryProdVoucher = `
        SELECT
            TBRV."IDEMPRESAORIGEM",
            TBDV."IDVOUCHER",
            TBDV."IDPRODUTO",
            TBDV."QTD",
            TBRV."STATIVO",
            TBRV."STCANCELADO",
            TBRV."STSTATUS"
        FROM
            "VAR_DB_NAME".RESUMOVOUCHER TBRV
        INNER JOIN DETALHEVOUCHER TBDV ON
            TBRV."IDVOUCHER" = TBDV."IDVOUCHER"
        WHERE
            TBDV."IDVOUCHER" = ?
        ORDER BY
            IDVOUCHER
    `;

    let detalheProdVoucher = api.sqlQuery(queryProdVoucher, idVoucher);
    let lstProd = [];
    
    if (stCancelado  == 'False'){
        stTroca = 'True';
        
        if((stStatus == 'NOVO' || stStatus == 'EM ANALISE' || stStatus == 'LIBERADO PARA O CLIENTE' || stStatus == 'FINALIZADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'CANCELADO' || detalheProdVoucher[0]['STSTATUS'] == 'NEGADO')) {
           fnIncluirInventarioMovimentoEntrada(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn);
        }
        
    } else {
        
        if((stStatus == 'CANCELADO' || stStatus == 'NEGADO') && (!detalheProdVoucher[0]['STSTATUS'] || detalheProdVoucher[0]['STSTATUS'] == 'NOVO' || detalheProdVoucher[0]['STSTATUS'] == 'EM ANALISE' || detalheProdVoucher[0]['STSTATUS'] == 'LIBERADO PARA O CLIENTE' || detalheProdVoucher[0]['STSTATUS'] == 'FINALIZADO')) {
            fnIncluirInventarioMovimentoSaida(detalheProdVoucher[0]['IDEMPRESAORIGEM'], detalheProdVoucher, conn);
        }
        
    }
    
    var queryUpdateDetalheVenda = `
        UPDATE 
            "VAR_DB_NAME"."VENDADETALHE" 
        SET
            STTROCA = ? 
        WHERE 
            "IDVOUCHER" = ? 
    `;
    
    var queryUpdateDetalheVoucher = `
        UPDATE 
            "VAR_DB_NAME"."DETALHEVOUCHER" 
        SET
            "STATIVO" = ?, 
            "STCANCELADO" = ?
        WHERE 
            "IDVOUCHER" = ? 
    `;
    
    var pStmtUpdateDetalheVenda = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVenda));
    var pStmtUpdateDetalheVoucher = conn.prepareStatement(api.replaceDbName(queryUpdateDetalheVoucher));
	
    pStmtUpdateDetalheVenda.setString(1, stTroca);
    pStmtUpdateDetalheVenda.setInt(2, parseInt(idVoucher));
	
    pStmtUpdateDetalheVoucher.setString(1, stTroca);
    pStmtUpdateDetalheVoucher.setString(2, stCancelado);
    pStmtUpdateDetalheVoucher.setInt(3, parseInt(idVoucher));
    
    pStmtUpdateDetalheVenda.execute();
    pStmtUpdateDetalheVoucher.execute();
    
	conn.commit();
	
	pStmtUpdateDetalheVenda.close();
	pStmtUpdateDetalheVoucher.close();
    
    return {
	   msg : "Atualização realizada com sucesso!"
	};
}

function fnInserirHistoricoVoucher(dadosVoucher, conn){
    let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = dadosVoucher;
    
    let queryInsertHistorico = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOVOUCHER
        (
            IDRESUMOVOUCHER,
            STTIPOVOUCHER, 
            STATUSVOUCHER, 
            MOTIVOTROCASTATUS,
            IDUSERALTERACAO
        ) 
        VALUES(?, ?, ?, ?, ?)
    `;
    
    let pStmtInsert = conn.prepareStatement(api.replaceDbName(queryInsertHistorico));
    
    pStmtInsert.setInt(1, IDVOUCHER);
    pStmtInsert.setString(2, STTIPOTROCA);
    pStmtInsert.setString(3, STSTATUS);
    pStmtInsert.setString(4, DSMOTIVOTROCASTATUS);
    pStmtInsert.setInt(5, IDFUNCIONARIO);
    
    pStmtInsert.execute();
    
    pStmtInsert.close();
}

function fnIncluirDetalheVoucher(idVoucher, lstDet, conn){
    
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."DETALHEVOUCHER"  
        (
            "IDDETALHEVOUCHER",
            "IDVOUCHER",
            "IDPRODUTO",
            "QTD",
            "VRUNIT",
            "VRTOTALBRUTO",
            "VRDESCONTO",
            "VRTOTALLIQUIDO",
            "STATIVO",
            "STCANCELADO"
        ) 
        VALUES(?,?,?,?,?,?,?,?, 'True', 'False')
    `;

	var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < lstDet.length; i++) {
        var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDDETALHEVOUCHER")), 0) + 1 FROM "VAR_DB_NAME"."DETALHEVOUCHER" WHERE 1 = ? ', 1);
        
        var registro = lstDet[i];
        
        pStmt.setInt(1, parseInt(queryId));
        pStmt.setInt(2, idVoucher);
        pStmt.setString(3, registro.IDPRODUTO);
        pStmt.setFloat(4, parseFloat(registro.QTD));
        pStmt.setFloat(5, registro.VRUNIT);
        pStmt.setFloat(6, registro.VRTOTALBRUTO);
        pStmt.setFloat(7, parseFloat(registro.VRDESCONTO));
        pStmt.setFloat(8, registro.VRTOTALLIQUIDO);
        //pStmt.setString(9, registro.STATIVO);
        //pStmt.setString(10, registro.STCANCELADO);
        
        pStmt.execute();
        
        conn.commit();
	}

	pStmt.close();

	conn.commit();
}

function fnAtualizarVendaDetalhe(produtosVoucher, idVoucher, conn){
    var queryUpdate = `
        UPDATE 
            "VAR_DB_NAME"."VENDADETALHE" 
        SET
            "STTROCA" = ?,
            "IDVOUCHER" = ?
        WHERE 
            "IDVENDADETALHE" = ?
    `;
    
    var pStmt = conn.prepareStatement(api.replaceDbName(queryUpdate));

    for (var i = 0; i < produtosVoucher.length; i++) {
        
		var registro = produtosVoucher[i];
        
        var queryDetalhe = `
            SELECT
                *
            FROM
                "VAR_DB_NAME".VENDADETALHE
            WHERE 
                IDVENDADETALHE = ?
        `;
        
        var detalheVenda = api.sqlQuery(queryDetalhe,registro.IDVENDADETALHE);
        
        if(detalheVenda[0]['QTD'] == registro.QTD){
            pStmt.setString(1, registro.STTROCA);
            pStmt.setInt(2, idVoucher);
            pStmt.setString(3, registro.IDVENDADETALHE);
            
            pStmt.execute();
            //pStmt.close();
            
            conn.commit();
            
        } else {
            var query2 = `
                INSERT INTO 
                    "VAR_DB_NAME"."VENDADETALHE"
                (
                    IDVENDADETALHE,
                    IDVENDA,
                    NITEM,
                    CPROD,
                    CEAN,
                    XPROD,
                    NCM,
                    EXTIPI,
                    CFOP,
                    UCOM,
                    QCOM,
                    VUNCOM,
                    VPROD,
                    CEANTRIB,
                    UTRIB,
                    QTRIB,
                    VUNTRIB,
                    VFRETE,
                    VSEG,
                    VDESC,
                    VOUTRO,
                    INDTOT,
                    XPED,
                    NITEMPED,
                    VTOTTRIB,
                    ICMS_ORIG,
                    ICMS_CST,
                    ICMS_MODBC,
                    ICMS_VBC,
                    ICMS_PREDBC,
                    ICMS_PICMS,
                    ICMS_VICMS,
                    ICMS_VICMSDESON,
                    ICMS_MODBCST,
                    ICMS_PMVAST,
                    ICMS_PREDBCST,
                    ICMS_VBCST,
                    ICMS_PICMSST,
                    ICMS_VICMSST,
                    ICMS_MOTDESICMS,
                    ICMS_PBCOP,
                    ICMS_UFST,
                    ICMS_VBCSTRET,
                    ICMS_VICMSSTRET,
                    ICMS_VBCSTDEST,
                    ICMS_VICSMSTDEST,
                    ICMS_CSOSN,
                    ICMS_PCREDSN,
                    ICMS_VCREDICMSSN,
                    ICMSUFDEST_PFCPUFDEST,
                    ICMSUFDEST_VBCUFDEST,
                    ICMSUFDEST_PICMSUFDEST,
                    ICMSUFDEST_PICMSINTER,
                    ICMSUFDEST_PICMSINTERPART,
                    ICMSUFDEST_VFCPUFDEST,
                    ICMSUFDEST_VICMSUFDEST,
                    ICMSUFDEST_VICMSUFREMET,
                    IPI_CLENQ,
                    IPI_CNPJPROD,
                    IPI_CSELO,
                    IPI_QSELO,
                    IPI_CENQ,
                    IPI_CST,
                    IPI_VBC,
                    IPI_PIPI,
                    IPI_QUNID,
                    IPI_VUNID,
                    IPI_VIPI,
                    II_VBC,
                    II_VDESPADU,
                    II_VII,
                    II_VIOF,
                    ISSQN_VBC,
                    ISSQN_VALIQ,
                    ISSQN_VISSQN,
                    ISSQN_CMUNFG,
                    ISSQN_CLISTSERV,
                    ISSQN_CSITTRIB,
                    PIS_CST,
                    PIS_VBC,
                    PIS_PPIS,
                    PIS_VPIS,
                    PIS_QBCPROD,
                    PIS_VALIQPROD,
                    PISST_VBC,
                    PISST_PPIS,
                    PISST_VPIS,
                    PISST_QBCPROD,
                    PISST_VALIQPROD,
                    COFINS_CST,
                    COFINS_VBC,
                    COFINS_PCOFINS,
                    COFINS_VCOFINS,
                    COFINS_QBCPROD,
                    COFINS_VALIQPROD,
                    COFINSST_VBC,
                    COFINSST_PCOFINS,
                    COFINSST_VCOFINS,
                    COFINSST_QBCPROD,
                    COFINSST_VALIQPROD,
                    INFADPROD,
                    VENDEDOR_MATRICULA,
                    VENDEDOR_NOME,
                    VENDEDOR_CPF,
                    STCANCELADO,
                    VRTOTALLIQUIDO,
                    QTD,
                    STVENDIGITAL,
                    FROM_MYSQL,
                    STTROCA,
                    IDUSRDESCONTO
                )
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            `;
            var pStmt2 = conn.prepareStatement(api.replaceDbName(query2));
            var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("NITEM")), 0) + 1 FROM "VAR_DB_NAME"."VENDADETALHE" WHERE IDVENDA = ? ', detalheVenda[0].IDVENDA);
            var nitem = queryId;
            
            queryId = `${detalheVenda[0].IDVENDA}-${queryId}`;
            
			pStmt2.setString(1, queryId);
			pStmt2.setString(2, detalheVenda[0].IDVENDA);
			pStmt2.setInt(3, +(nitem));
			pStmt2.setString(4, detalheVenda[0].CPROD);
			pStmt2.setString(5, detalheVenda[0].CEAN);
			pStmt2.setString(6, detalheVenda[0].XPROD);
			pStmt2.setString(7, detalheVenda[0].NCM);
			setStringOrNull(pStmt2, 8, detalheVenda[0].EXTIPI);
			pStmt2.setString(9, detalheVenda[0].CFOP);
			pStmt2.setString(10, detalheVenda[0].UCOM);
			pStmt2.setFloat(11, +(detalheVenda[0].QCOM - registro.QTD));
			pStmt2.setFloat(12, +(detalheVenda[0].VUNCOM));
			pStmt2.setFloat(13, +(detalheVenda[0].VPROD - registro.VRTOTALBRUTO));
			pStmt2.setString(14, detalheVenda[0].CEANTRIB);
			pStmt2.setString(15, detalheVenda[0].UTRIB);
			pStmt2.setFloat(16, +(detalheVenda[0].QTRIB - registro.QTD));
			pStmt2.setFloat(17, +(detalheVenda[0].VUNTRIB));
			setFloatOrNull(pStmt2, 18, +(detalheVenda[0].VFRETE));
			setFloatOrNull(pStmt2, 19, +(detalheVenda[0].VSEG));
			setFloatOrNull(pStmt2, 20, +(detalheVenda[0].VDESC - registro.VDESC));
			setFloatOrNull(pStmt2, 21, +(detalheVenda[0].VOUTRO));
			pStmt2.setInt(22, detalheVenda[0].INDTOT);
			setStringOrNull(pStmt2, 23, detalheVenda[0].XPED);
			setStringOrNull(pStmt2, 24, detalheVenda[0].NITEMPED);
			setFloatOrNull(pStmt2, 25, detalheVenda[0].VTOTTRIB);
			setIntOrNull(pStmt2, 26, +(detalheVenda[0].ICMS_ORIG));
			pStmt2.setString(27, detalheVenda[0].ICMS_CST);
			pStmt2.setInt(28, +(detalheVenda[0].ICMS_MODBC));
			pStmt2.setFloat(29, +(detalheVenda[0].ICMS_VBC - registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt2, 30, detalheVenda[0].ICMS_PREDBC);
			pStmt2.setFloat(31, +(detalheVenda[0].ICMS_PICMS));
			pStmt2.setFloat(32, +(detalheVenda[0].ICMS_VICMS));
			setFloatOrNull(pStmt2, 33, detalheVenda[0].ICMS_VICMSDESON);
			setIntOrNull(pStmt2, 34, detalheVenda[0].ICMS_MODBCST);
			setFloatOrNull(pStmt2, 35, detalheVenda[0].ICMS_PMVAST);
			setFloatOrNull(pStmt2, 36, detalheVenda[0].ICMS_PREDBCST);
			setFloatOrNull(pStmt2, 37, detalheVenda[0].ICMS_VBCST);
			setFloatOrNull(pStmt2, 38, detalheVenda[0].ICMS_PICMSST);
			setFloatOrNull(pStmt2, 39, detalheVenda[0].ICMS_VICMSST);
			setIntOrNull(pStmt2, 40, detalheVenda[0].ICMS_MOTDESICMS);
			setFloatOrNull(pStmt2, 41, detalheVenda[0].ICMS_PBCOP);
			setStringOrNull(pStmt2, 42, detalheVenda[0].ICMS_UFST);
			setFloatOrNull(pStmt2, 43, detalheVenda[0].ICMS_VBCSTRET);
			setFloatOrNull(pStmt2, 44, detalheVenda[0].ICMS_VICMSSTRET);
			setFloatOrNull(pStmt2, 45, detalheVenda[0].ICMS_VBCSTDEST);
			setFloatOrNull(pStmt2, 46, detalheVenda[0].ICMS_VICSMSTDEST);
			setStringOrNull(pStmt2, 47, detalheVenda[0].ICMS_CSOSN);
			setFloatOrNull(pStmt2, 48, detalheVenda[0].ICMS_PCREDSN);
			setFloatOrNull(pStmt2, 49, detalheVenda[0].ICMS_VCREDICMSSN);
			setFloatOrNull(pStmt2, 50, detalheVenda[0].ICMSUFDEST_PFCPUFDEST);
			setFloatOrNull(pStmt2, 51, detalheVenda[0].ICMSUFDEST_VBCUFDEST);
			setFloatOrNull(pStmt2, 52, detalheVenda[0].ICMSUFDEST_PICMSUFDEST);
			setStringOrNull(pStmt2, 53, detalheVenda[0].ICMSUFDEST_PICMSINTER);
			setFloatOrNull(pStmt2, 54, detalheVenda[0].ICMSUFDEST_PICMSINTERPART);
			setFloatOrNull(pStmt2, 55, detalheVenda[0].ICMSUFDEST_VFCPUFDEST);
			setFloatOrNull(pStmt2, 56, detalheVenda[0].ICMSUFDEST_VICMSUFDEST);
			setFloatOrNull(pStmt2, 57, detalheVenda[0].ICMSUFDEST_VICMSUFREMET);
			setStringOrNull(pStmt2, 58, detalheVenda[0].IPI_CLENQ);
			setStringOrNull(pStmt2, 59, detalheVenda[0].IPI_CNPJPROD);
			setStringOrNull(pStmt2, 60, detalheVenda[0].IPI_CSELO);
			setIntOrNull(pStmt2, 61, detalheVenda[0].IPI_QSELO);
			setStringOrNull(pStmt2, 62, detalheVenda[0].IPI_CENQ);
			setStringOrNull(pStmt2, 63, detalheVenda[0].IPI_CST);
			setFloatOrNull(pStmt2, 64, detalheVenda[0].IPI_VBC);
			setFloatOrNull(pStmt2, 65, detalheVenda[0].IPI_PIPI);
			setFloatOrNull(pStmt2, 66, detalheVenda[0].IPI_QUNID);
			setFloatOrNull(pStmt2, 67, detalheVenda[0].IPI_VUNID);
			setFloatOrNull(pStmt2, 68, detalheVenda[0].IPI_VIPI);
			setFloatOrNull(pStmt2, 69, detalheVenda[0].II_VBC);
			setFloatOrNull(pStmt2, 70, detalheVenda[0].II_VDESPADU);
			setFloatOrNull(pStmt2, 71, detalheVenda[0].II_VII);
			setFloatOrNull(pStmt2, 72, detalheVenda[0].II_VIOF);
			setFloatOrNull(pStmt2, 73, detalheVenda[0].ISSQN_VBC);
			setFloatOrNull(pStmt2, 74, detalheVenda[0].ISSQN_VALIQ);
			setFloatOrNull(pStmt2, 75, detalheVenda[0].ISSQN_VISSQN);
			setStringOrNull(pStmt2, 76, detalheVenda[0].ISSQN_CMUNFG);
			setStringOrNull(pStmt2, 77, detalheVenda[0].ISSQN_CLISTSERV);
			setStringOrNull(pStmt2, 78, detalheVenda[0].ISSQN_CSITTRIB);
			setStringOrNull(pStmt2, 79, detalheVenda[0].PIS_CST);
			setStringOrNull(pStmt2, 80, String(detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO));
			setStringOrNull(pStmt2, 81, detalheVenda[0].PIS_PPIS);
			setStringOrNull(pStmt2, 82, detalheVenda[0].PIS_VPIS);
			setFloatOrNull(pStmt2, 83, detalheVenda[0].PIS_QBCPROD);
			setFloatOrNull(pStmt2, 84, detalheVenda[0].PIS_VALIQPROD);
			setFloatOrNull(pStmt2, 85, detalheVenda[0].PISST_VBC);
			setFloatOrNull(pStmt2, 86, detalheVenda[0].PISST_PPIS);
			setFloatOrNull(pStmt2, 87, detalheVenda[0].PISST_VPIS);
			setFloatOrNull(pStmt2, 88, detalheVenda[0].PISST_QBCPROD);
			setFloatOrNull(pStmt2, 89, detalheVenda[0].PISST_VALIQPROD);
			setStringOrNull(pStmt2, 90, detalheVenda[0].COFINS_CST);
			pStmt2.setFloat(91, +(detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO));
			pStmt2.setFloat(92, +(detalheVenda[0].COFINS_PCOFINS));
			pStmt2.setFloat(93, +(detalheVenda[0].COFINS_VCOFINS));
			setFloatOrNull(pStmt2, 94, detalheVenda[0].COFINS_QBCPROD);
			setFloatOrNull(pStmt2, 95, detalheVenda[0].COFINS_VALIQPROD);
			setFloatOrNull(pStmt2, 96, detalheVenda[0].COFINSST_VBC);
			setFloatOrNull(pStmt2, 97, detalheVenda[0].COFINSST_PCOFINS);
			setFloatOrNull(pStmt2, 98, detalheVenda[0].COFINSST_VCOFINS);
			setFloatOrNull(pStmt2, 99, detalheVenda[0].COFINSST_QBCPROD);
			setFloatOrNull(pStmt2, 100, detalheVenda[0].COFINSST_VALIQPROD);
			setStringOrNull(pStmt2, 101, detalheVenda[0].INFADPROD);
			setIntOrNull(pStmt2, 102, detalheVenda[0].VENDEDOR_MATRICULA);
			pStmt2.setString(103, detalheVenda[0].VENDEDOR_NOME);
			pStmt2.setString(104, detalheVenda[0].VENDEDOR_CPF);
			pStmt2.setString(105, detalheVenda[0].STCANCELADO);
			pStmt2.setFloat(106, +(detalheVenda[0].VRTOTALLIQUIDO - registro.VRTOTALLIQUIDO));
			pStmt2.setFloat(107, +(detalheVenda[0].QTD - registro.QTD));
			pStmt2.setString(108, detalheVenda[0].STVENDIGITAL);
			setIntOrNull(pStmt2, 109, detalheVenda[0].FROM_MYSQL);
			pStmt2.setString(110, detalheVenda[0].STTROCA);
			setIntOrNull(pStmt2, 111, detalheVenda[0].IDUSRDESCONTO);
			
			pStmt2.execute();
           // pStmt2.close();
            conn.commit();
            
            pStmt2.close();
            
            var query3 = `
                UPDATE 
                    "VAR_DB_NAME"."VENDADETALHE" 
                SET 
                    EXTIPI = ? , 
                    QCOM = ? , 
                    VPROD = ? , 
                    QTRIB = ? , 
                    VUNTRIB = ? , 
                    VSEG = ? , 
                    VDESC = ? , 
                    VOUTRO = ? , 
                    XPED = ? , 
                    NITEMPED = ? , 
                    VTOTTRIB = ? , 
                    ICMS_ORIG = ? , 
                    ICMS_CST = ? , 
                    ICMS_MODBC = ? , 
                    ICMS_VBC = ? , 
                    ICMS_PREDBC = ? , 
                    ICMS_PICMS = ? , 
                    ICMS_VICMS = ? , 
                    ICMS_VICMSDESON = ? , 
                    ICMS_MODBCST = ? , 
                    ICMS_PMVAST = ? , 
                    ICMS_PREDBCST = ? , 
                    ICMS_VBCST = ? , 
                    ICMS_PICMSST = ? , 
                    ICMS_VICMSST = ? , 
                    ICMS_MOTDESICMS = ? , 
                    ICMS_PBCOP = ? , 
                    ICMS_UFST = ? , 
                    ICMS_VBCSTRET = ? , 
                    ICMS_VICMSSTRET = ? , 
                    ICMS_VBCSTDEST = ? , 
                    ICMS_VICSMSTDEST = ? , 
                    ICMS_CSOSN = ? , 
                    ICMS_PCREDSN = ? , 
                    ICMS_VCREDICMSSN = ? , 
                    ICMSUFDEST_PFCPUFDEST = ? , 
                    ICMSUFDEST_VBCUFDEST = ? , 
                    ICMSUFDEST_PICMSUFDEST = ? , 
                    ICMSUFDEST_PICMSINTER = ? , 
                    ICMSUFDEST_PICMSINTERPART = ? , 
                    ICMSUFDEST_VFCPUFDEST = ? , 
                    ICMSUFDEST_VICMSUFDEST = ? , 
                    ICMSUFDEST_VICMSUFREMET = ? , 
                    IPI_CLENQ = ? , 
                    IPI_CNPJPROD = ? , 
                    IPI_CSELO = ? , 
                    IPI_QSELO = ? , 
                    IPI_CENQ = ? , 
                    IPI_CST = ? , 
                    IPI_VBC = ? , 
                    IPI_PIPI = ? , 
                    IPI_QUNID = ? , 
                    IPI_VUNID = ? , 
                    IPI_VIPI = ? , 
                    II_VBC = ? , 
                    II_VDESPADU = ? , 
                    II_VII = ? , 
                    II_VIOF = ? , 
                    ISSQN_VBC = ? , 
                    ISSQN_VALIQ = ? , 
                    ISSQN_VISSQN = ? , 
                    ISSQN_CMUNFG = ? , 
                    ISSQN_CLISTSERV = ? , 
                    ISSQN_CSITTRIB = ? , 
                    PIS_CST = ? , 
                    PIS_VBC = ? , 
                    PIS_PPIS = ? , 
                    PIS_VPIS = ? , 
                    PIS_QBCPROD = ? , 
                    PIS_VALIQPROD = ? , 
                    PISST_VBC = ? , 
                    PISST_PPIS = ? , 
                    PISST_VPIS = ? , 
                    PISST_QBCPROD = ? , 
                    PISST_VALIQPROD = ? , 
                    COFINS_CST = ? , 
                    COFINS_VBC = ? , 
                    COFINS_PCOFINS = ? , 
                    COFINS_VCOFINS = ? , 
                    COFINS_QBCPROD = ? , 
                    COFINS_VALIQPROD = ? , 
                    COFINSST_VBC = ? , 
                    COFINSST_PCOFINS = ? , 
                    COFINSST_VCOFINS = ? , 
                    COFINSST_QBCPROD = ? , 
                    COFINSST_VALIQPROD = ? , 
                    INFADPROD = ? , 
                    VENDEDOR_MATRICULA = ? , 
                    VENDEDOR_NOME = ? , 
                    VENDEDOR_CPF = ? , 
                    STCANCELADO = ? , 
                    VRTOTALLIQUIDO = ? , 
                    QTD = ? , 
                    STVENDIGITAL = ? , 
                    FROM_MYSQL = ? , 
                    STTROCA = ? , 
                    IDUSRDESCONTO = ?, 
                    IDVOUCHER = ? 
                WHERE 
                    "IDVENDADETALHE" =  ? 
            `;
            
            var pStmt3 = conn.prepareStatement(api.replaceDbName(query3));
            
			setStringOrNull(pStmt3, 1, detalheVenda[0].EXTIPI);
			setFloatOrNull(pStmt3, 2, +(registro.QTD));
			setFloatOrNull(pStmt3, 3, +(registro.VRTOTALBRUTO));
			setFloatOrNull(pStmt3, 4,+(registro.QTD));
			setFloatOrNull(pStmt3, 5, +detalheVenda[0].VUNTRIB);
			setFloatOrNull(pStmt3, 6, +detalheVenda[0].VSEG);
			setFloatOrNull(pStmt3, 7, +(registro.VDESC));
			setFloatOrNull(pStmt3, 8, +detalheVenda[0].VOUTRO);
			setStringOrNull(pStmt3, 9, detalheVenda[0].XPED);
			setStringOrNull(pStmt3, 10, detalheVenda[0].NITEMPED);
			setFloatOrNull(pStmt3, 11, +detalheVenda[0].VTOTTRIB);
			setIntOrNull(pStmt3, 12, +detalheVenda[0].ICMS_ORIG);
			setStringOrNull(pStmt3, 13, detalheVenda[0].ICMS_CST);
			setIntOrNull(pStmt3, 14, +detalheVenda[0].ICMS_MODBC);
			setFloatOrNull(pStmt3, 15, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 16, +detalheVenda[0].ICMS_PREDBC);
			setFloatOrNull(pStmt3, 17, +detalheVenda[0].ICMS_PICMS);
			setFloatOrNull(pStmt3, 18, +detalheVenda[0].ICMS_VICMS);
			setFloatOrNull(pStmt3, 19, +detalheVenda[0].ICMS_VICMSDESON);
			setIntOrNull(pStmt3, 20, +detalheVenda[0].ICMS_MODBCST);
			setFloatOrNull(pStmt3, 21, +detalheVenda[0].ICMS_PMVAST);
			setFloatOrNull(pStmt3, 22, +detalheVenda[0].ICMS_PREDBCST);
			setFloatOrNull(pStmt3, 23, +detalheVenda[0].ICMS_VBCST);
			setFloatOrNull(pStmt3, 24, +detalheVenda[0].ICMS_PICMSST);
			setFloatOrNull(pStmt3, 25, +detalheVenda[0].ICMS_VICMSST);
			setIntOrNull(pStmt3, 26, +detalheVenda[0].ICMS_MOTDESICMS);
			setFloatOrNull(pStmt3, 27, +detalheVenda[0].ICMS_PBCOP);
			setStringOrNull(pStmt3, 28, detalheVenda[0].ICMS_UFST);
			setFloatOrNull(pStmt3, 29, +detalheVenda[0].ICMS_VBCSTRET);
			setFloatOrNull(pStmt3, 30, +detalheVenda[0].ICMS_VICMSSTRET);
			setFloatOrNull(pStmt3, 31, +detalheVenda[0].ICMS_VBCSTDEST);
			setFloatOrNull(pStmt3, 32, +detalheVenda[0].ICMS_VICSMSTDEST);
			setStringOrNull(pStmt3, 33, detalheVenda[0].ICMS_CSOSN);
			setFloatOrNull(pStmt3, 34, +detalheVenda[0].ICMS_PCREDSN);
			setFloatOrNull(pStmt3, 35, +detalheVenda[0].ICMS_VCREDICMSSN);
			setFloatOrNull(pStmt3, 36, +detalheVenda[0].ICMSUFDEST_PFCPUFDEST);
			setFloatOrNull(pStmt3, 37, +detalheVenda[0].ICMSUFDEST_VBCUFDEST);
			setFloatOrNull(pStmt3, 38, +detalheVenda[0].ICMSUFDEST_PICMSUFDEST);
			setStringOrNull(pStmt3, 39, detalheVenda[0].ICMSUFDEST_PICMSINTER);
			setFloatOrNull(pStmt3, 40, +detalheVenda[0].ICMSUFDEST_PICMSINTERPART);
			setFloatOrNull(pStmt3, 41, +detalheVenda[0].ICMSUFDEST_VFCPUFDEST);
			setFloatOrNull(pStmt3, 42, +detalheVenda[0].ICMSUFDEST_VICMSUFDEST);
			setFloatOrNull(pStmt3, 43, +detalheVenda[0].ICMSUFDEST_VICMSUFREMET);
			setStringOrNull(pStmt3, 44, detalheVenda[0].IPI_CLENQ);
			setStringOrNull(pStmt3, 45, detalheVenda[0].IPI_CNPJPROD);
			setStringOrNull(pStmt3, 46, detalheVenda[0].IPI_CSELO);
			setIntOrNull(pStmt3, 47, +detalheVenda[0].IPI_QSELO);
			setStringOrNull(pStmt3, 48, detalheVenda[0].IPI_CENQ);
			setStringOrNull(pStmt3, 49, detalheVenda[0].IPI_CST);
			setFloatOrNull(pStmt3, 50, +detalheVenda[0].IPI_VBC);
			setFloatOrNull(pStmt3, 51, +detalheVenda[0].IPI_PIPI);
			setFloatOrNull(pStmt3, 52, +detalheVenda[0].IPI_QUNID);
			setFloatOrNull(pStmt3, 53, +detalheVenda[0].IPI_VUNID);
			setFloatOrNull(pStmt3, 54, +detalheVenda[0].IPI_VIPI);
			setFloatOrNull(pStmt3, 55, +detalheVenda[0].II_VBC);
			setFloatOrNull(pStmt3, 56, +detalheVenda[0].II_VDESPADU);
			setFloatOrNull(pStmt3, 57, +detalheVenda[0].II_VII);
			setFloatOrNull(pStmt3, 58, +detalheVenda[0].II_VIOF);
			setFloatOrNull(pStmt3, 59, +detalheVenda[0].ISSQN_VBC);
			setFloatOrNull(pStmt3, 60, +detalheVenda[0].ISSQN_VALIQ);
			setFloatOrNull(pStmt3, 61, +detalheVenda[0].ISSQN_VISSQN);
			setStringOrNull(pStmt3, 62, detalheVenda[0].ISSQN_CMUNFG);
			setStringOrNull(pStmt3, 63, detalheVenda[0].ISSQN_CLISTSERV);
			setStringOrNull(pStmt3, 64, detalheVenda[0].ISSQN_CSITTRIB);
			setStringOrNull(pStmt3, 65, detalheVenda[0].PIS_CST);
			setStringOrNull(pStmt3, 66, String(registro.VRTOTALLIQUIDO));
			setStringOrNull(pStmt3, 67, detalheVenda[0].PIS_PPIS);
			setStringOrNull(pStmt3, 68, detalheVenda[0].PIS_VPIS);
			setFloatOrNull(pStmt3, 69, +detalheVenda[0].PIS_QBCPROD);
			setFloatOrNull(pStmt3, 70, +detalheVenda[0].PIS_VALIQPROD);
			setFloatOrNull(pStmt3, 71, +detalheVenda[0].PISST_VBC);
			setFloatOrNull(pStmt3, 72, +detalheVenda[0].PISST_PPIS);
			setFloatOrNull(pStmt3, 73, +detalheVenda[0].PISST_VPIS);
			setFloatOrNull(pStmt3, 74, +detalheVenda[0].PISST_QBCPROD);
			setFloatOrNull(pStmt3, 75, +detalheVenda[0].PISST_VALIQPROD);
			setStringOrNull(pStmt3, 76, detalheVenda[0].COFINS_CST);
			setFloatOrNull(pStmt3, 77, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 78, +detalheVenda[0].COFINS_PCOFINS);
			setFloatOrNull(pStmt3, 79, +detalheVenda[0].COFINS_VCOFINS);
			setFloatOrNull(pStmt3, 80, +detalheVenda[0].COFINS_QBCPROD);
			setFloatOrNull(pStmt3, 81, +detalheVenda[0].COFINS_VALIQPROD);
			setFloatOrNull(pStmt3, 82, +detalheVenda[0].COFINSST_VBC);
			setFloatOrNull(pStmt3, 83, +detalheVenda[0].COFINSST_PCOFINS);
			setFloatOrNull(pStmt3, 84, +detalheVenda[0].COFINSST_VCOFINS);
			setFloatOrNull(pStmt3, 85, +detalheVenda[0].COFINSST_QBCPROD);
			setFloatOrNull(pStmt3, 86, +detalheVenda[0].COFINSST_VALIQPROD);
			setStringOrNull(pStmt3, 87, detalheVenda[0].INFADPROD);
			setIntOrNull(pStmt3, 88, detalheVenda[0].VENDEDOR_MATRICULA);
			setStringOrNull(pStmt3, 89, detalheVenda[0].VENDEDOR_NOME);
			setStringOrNull(pStmt3, 90, detalheVenda[0].VENDEDOR_CPF);
			setStringOrNull(pStmt3, 91, detalheVenda[0].STCANCELADO);
			setFloatOrNull(pStmt3, 92, +(registro.VRTOTALLIQUIDO));
			setFloatOrNull(pStmt3, 93, +registro.QTD);
			setStringOrNull(pStmt3, 94, detalheVenda[0].STVENDIGITAL);
			setIntOrNull(pStmt3, 95, detalheVenda[0].FROM_MYSQL);
			setStringOrNull(pStmt3, 96, registro.STTROCA);
			setIntOrNull(pStmt3, 97, detalheVenda[0].IDUSRDESCONTO);
			setIntOrNull(pStmt3, 98, idVoucher);
			setStringOrNull(pStmt3, 99, detalheVenda[0].IDVENDADETALHE);
			
            pStmt3.execute();
            conn.commit();
            
            pStmt3.close();
        }
        
        
    }
    
    pStmt.close();
    //conn.commit();

	return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnIncluirInventarioMovimentoEntrada(idEmpresa, lstProd, conn) {
    var qtdInicio = 0;
	var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdAjusteBalanco = 0;
	var qtdEntradaVoucher = 0;
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var dataVoucher = y + '-' + mm + '-' + dd;
    var conn2 = conn; //$.db.getConnection();
		
    for (var i = 0; i < lstProd.length; i++) {
        var registro = lstProd[i];
        
        var queryExistsMov = ' SELECT *  FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + dataVoucher + ' 00:00:00\' AND \'' + dataVoucher + ' 23:59:59\')' +
        ' AND IDEMPRESA = ? AND STATIVO=\'True\'';
    
         var idMovExists = api.sqlQuery(queryExistsMov, parseInt(idEmpresa));
         
           
        if(idMovExists.length === 0){
            qtdInicio = 0;
            var queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO+'\''+
            ' AND IDEMPRESA = ? ';
            
            var UltMovimentoProduto = api.sqlQuery(queryMovAnt, parseInt(idEmpresa));
            
            if(UltMovimentoProduto.length > 0){
               
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
               //Atualiza o status para false do Ultimo Movimento
               var queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmtAtualizaStatus = conn2.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn2.commit();
            }else{
                
               qtdEntradaVoucher = parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    	    ' "QTDENTRADAVOUCHER", '+
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO" ' +
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
    
        	var pStmt = conn2.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idEmpresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	conn2.commit();
        }else{
    
            qtdEntradaVoucher = parseInt(registro.QTD) + parseInt(idMovExists[0].QTDENTRADAVOUCHER);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA) - parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
             var queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
                ' "QTDENTRADAVOUCHER" =  ?, ' +
        		' "QTDFINAL" =  ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
                var pStmt2 = conn2.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            	pStmt2.setInt(1, qtdEntradaVoucher);
            	pStmt2.setInt(2, qtdFinal);
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                pStmt2.execute();
                pStmt2.close();
                conn2.commit();
        }
        
    }
   
}

function fnIncluirInventarioMovimentoSaida(idempresa, lstProdMov, conn) {
	
	var qtdInicio = 0;
    var qtdEntrada = 0;
	var qtdSaida = 0;
	var qtdSaidaTransferencia = 0;
	var qtdRetornoAjustePedido = 0;
	var qtdFinal = 0;
	var qtdEntradaVoucher = 0;
	var qtdAjusteBalanco = 0;
	
	var date = new Date();
	var dd = ("0" + date.getDate()).slice(-2);
    var mm = ("0" + (date.getMonth() + 1)).slice(-2);
    var y = date.getFullYear();
 
    var data = y + '-' + mm + '-' + dd;

    
    for (var i = 0; i < lstProdMov.length; i++) {
        
        var registro = lstProdMov[i];
        
        let queryExistsMov = ' SELECT * FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE ' +
        ' IDPRODUTO=\''+ registro.IDPRODUTO+'\'' +
        ' AND (DTMOVIMENTO  BETWEEN \'' + data + ' 00:00:00\' AND \'' + data + ' 23:59:59\')' +
        ' AND IDEMPRESA = ?  and STATIVO=\'True\'';
    
         let idMovExists = api.sqlQuery(queryExistsMov, idempresa);
         
       
        
        if(idMovExists.length === 0){
             
            let queryMovAnt = 'SELECT * '+
            ' FROM "VAR_DB_NAME"."INVENTARIOMOVIMENTO" WHERE STATIVO = \'True\''+
            ' AND IDPRODUTO=\''+ registro.IDPRODUTO +'\''+
            ' AND IDEMPRESA = ? ';
            
            let UltMovimentoProduto = api.sqlQuery(queryMovAnt, idempresa);
           
            if(UltMovimentoProduto.length > 0){
               qtdInicio =  parseInt(UltMovimentoProduto[0].QTDFINAL);
               qtdEntradaVoucher = - parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
               
               //Atualiza o status para false do Ultimo Movimento
               let queryAtualizaStatus = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
        		' "STATIVO" = \'False\'' +
                ' WHERE "IDINVMOVIMENTO" =  ? ';
                
                let pStmtAtualizaStatus = conn.prepareStatement(api.replaceDbName(queryAtualizaStatus));
                
                pStmtAtualizaStatus.setInt(1, parseInt(UltMovimentoProduto[0].IDINVMOVIMENTO));
                
                pStmtAtualizaStatus.execute();
                pStmtAtualizaStatus.close();
                conn.commit();
            }else{
               qtdInicio = 0;
               qtdEntradaVoucher = -parseInt(registro.QTD);
               qtdFinal = qtdInicio + qtdEntradaVoucher;
            }
            
            
    	    var query = 'INSERT INTO "VAR_DB_NAME"."INVENTARIOMOVIMENTO" ' +
    		" ( " +
    		' "IDINVMOVIMENTO", ' +
    		' "IDEMPRESA", ' +
    		' "DTMOVIMENTO", ' +
    		' "IDPRODUTO", ' +
    	    ' "QTDINICIO", ' +
    	    ' "QTDENTRADAVOUCHER", '+
    		' "QTDENTRADA", ' +
    		' "QTDSAIDA", ' +
    		' "QTDSAIDATRANSFERENCIA", ' +
    		' "QTDRETORNOAJUSTEPEDIDO", ' +
    		' "QTDFINAL", ' +
    		' "QTDAJUSTEBALANCO", ' +
    		' "STATIVO" ' +
    		' ) ' +
    		' VALUES("VAR_DB_NAME"."SEQ_INVENTARIOMOVIMENTO".NEXTVAL,?,now(),?,?,?,?,?,?,?,?,?,\'True\') ';
    
        	var pStmt = conn.prepareStatement(api.replaceDbName(query));
            	
            pStmt.setInt(1, parseInt(idempresa));
            pStmt.setString(2, registro.IDPRODUTO);
        	pStmt.setInt(3, qtdInicio);
        	pStmt.setInt(4, qtdEntradaVoucher);
        	pStmt.setInt(5, qtdEntrada);
        	pStmt.setInt(6, qtdSaida);
        	pStmt.setInt(7, qtdSaidaTransferencia);
        	pStmt.setInt(8, qtdRetornoAjustePedido);
        	pStmt.setInt(9, qtdFinal);
        	pStmt.setInt(10, qtdAjusteBalanco);
        	
        	pStmt.execute();
        	pStmt.close();
        	
        }else{
            qtdInicio = parseInt(idMovExists[0].QTDINICIO);
            qtdSaida = parseInt(idMovExists[0].QTDSAIDA);
            qtdEntradaVoucher = parseInt(idMovExists[0].QTDENTRADAVOUCHER) - parseInt(registro.QTD);
            qtdFinal = parseInt(idMovExists[0].QTDINICIO) + parseInt(idMovExists[0].QTDENTRADA) + qtdEntradaVoucher - parseInt(idMovExists[0].QTDSAIDA) + parseInt(idMovExists[0].QTDSAIDATRANSFERENCIA);
            
            let queryAtualizaMovimento = 'UPDATE "VAR_DB_NAME"."INVENTARIOMOVIMENTO" SET ' + 
             //   ' "QTDSAIDA" =  ?, ' +
        		' "QTDFINAL" =  ?, ' +
        		' "QTDENTRADAVOUCHER" = ? ' +
        		' WHERE "IDINVMOVIMENTO" =  ? ';
                
             let pStmt2 = conn.prepareStatement(api.replaceDbName(queryAtualizaMovimento));
                
            	
            //pStmt2.setInt(1, parseInt(qtdSaida));
            	
            	pStmt2.setInt(1, parseInt(qtdFinal));
            	
            	pStmt2.setInt(2, parseInt(qtdEntradaVoucher));
            	
                pStmt2.setInt(3, parseInt(idMovExists[0].IDINVMOVIMENTO));
                
                pStmt2.execute();
                pStmt2.close();
                conn.commit();
                
        }
        
    }
   
    conn.commit();
}

function fnHandleGet(byId) {

    var numeroVoucher = $.request.parameters.get("numeroVoucher");
    var subgrupoEmpresa = $.request.parameters.get("subgrupoEmpresa");
    var id = $.request.parameters.get("id");
    var idEmpresa = $.request.parameters.get("idEmpresa");
    var dataPesquisaInicio = $.request.parameters.get("dataPesquisaInicio");
    var dataPesquisaFim = $.request.parameters.get("dataPesquisaFim");
    var dadosVoucher = $.request.parameters.get("dadosVoucher");
    var stStatus = $.request.parameters.get("stStatus");
    
	let query =`
	    SELECT 
       	  tbrv.IDVOUCHER,  
       	  tbrv.IDEMPRESAORIGEM,  
       	  tbrv.IDCAIXAORIGEM,  
       	  tbrv.IDVENDEDOR,  
       	  tbrv.IDNFEDEVOLUCAO,  
       	  tbrv.IDRESUMOVENDAWEB,  
       	  tbcliente.IDCLIENTE,  
       	  tbcliente.DSNOMERAZAOSOCIAL, 
       	  tbcliente.DSAPELIDONOMEFANTASIA,  
       	  tbcliente.NUCPFCNPJ,  
       	  tbrv.IDRESUMOVENDAWEBDESTINO,  
       	  tbrv.STSTATUS,  
       	  tbrv.STTIPOTROCA,  
       	  tbrv.MOTIVOTROCA,  
       	  tbrv.IDUSRLIBERACAOCRIACAO,
       	  tbrv.IDUSRINVOUCHER,
          tbfuncionario.NOFUNCIONARIO AS NOFUNCIONARIOLIBERACAOCRIACAO, 
       	  tbrv.IDUSRLIBERACAOCONSUMO, 
       	  (SELECT NOFUNCIONARIO FROM  "VAR_DB_NAME".FUNCIONARIO WHERE IDFUNCIONARIO = tbrv.IDUSRLIBERACAOCONSUMO) AS NOFUNCIONARIOLIBERACAOCONSUMO,
       	  tbrv.DTINVOUCHER,
	      TO_VARCHAR(tbrv.DTINVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTINVOUCHERFORMATADO,  
	      tbrv.DTOUTVOUCHER,
	      TO_VARCHAR(tbrv.DTOUTVOUCHER, 'DD/MM/YYYY HH24:MI:SS') AS DTOUTVOUCHERFORMATADO,  
    	  tbcorigem.DSCAIXA AS DSCAIXAORIGEM,  
    	  LEFT(tbrv.NUVOUCHER, 5) || LPAD('', LENGTH(tbrv.NUVOUCHER) - 8, '*') || RIGHT(tbrv.NUVOUCHER, 4) AS NUVOUCHERFORMATOCULTO,
    	  tbrv.NUVOUCHER,
    	  tbrv.VRVOUCHER,  
    	  tbrv.STATIVO,  
    	  tbrv.STCANCELADO,  
    	  CAST(tbrv.DSMOTIVOCANCELAMENTO AS VARCHAR(255)) AS DSMOTIVOCANCELAMENTO,
    	  tbemporigem.IDSUBGRUPOEMPRESARIAL AS SUBGRUPOEMPORIGEM, 
    	  tbemporigem.NORAZAOSOCIAL AS RAZAOEMPORIGEM, 
	      tbemporigem.NOFANTASIA AS EMPORIGEM, 
	      tbemporigem.NUCNPJ AS CNPJEMPORIGEM, 
	      tbemporigem.EENDERECO AS ENDEMPORIGEM, 
	      tbemporigem.EBAIRRO AS BAIRROEMPORIGEM, 
	      tbemporigem.ECIDADE AS CIDADEEMPORIGEM, 
	      tbemporigem.SGUF AS SGUFEMPORIGEM, 
	      tbemporigem.EEMAILCOMERCIAL AS EMAILEMPORIGEM, 
	      tbemporigem.NUTELCOMERCIAL AS NUTELEMPORIGEM, 
	      tbempdestino.NOFANTASIA AS EMPDESTINO,
	      tbcdestino.DSCAIXA AS DSCAIXADESTINO,
	      tbv.DTHORAFECHAMENTO AS DTHORAFECHAMENTOVENDAORIGEM
        FROM 
            "VAR_DB_NAME".RESUMOVOUCHER as tbrv 
        LEFT JOIN "VAR_DB_NAME".VENDA tbv ON tbrv.IDRESUMOVENDAWEB = tbv.IDVENDA
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcorigem ON tbrv.IDCAIXAORIGEM = tbcorigem.IDCAIXAWEB 
        LEFT JOIN "VAR_DB_NAME".CAIXA as tbcdestino ON tbrv.IDCAIXADESTINO = tbcdestino.IDCAIXAWEB 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbemporigem ON tbrv.IDEMPRESAORIGEM = tbemporigem.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".EMPRESA as tbempdestino ON tbrv.IDEMPRESADESTINO = tbempdestino.IDEMPRESA 
	    LEFT JOIN "VAR_DB_NAME".CLIENTE as tbcliente ON tbrv.IDCLIENTE = tbcliente.IDCLIENTE 
	    LEFT JOIN "VAR_DB_NAME".FUNCIONARIO as tbfuncionario ON tbrv.IDUSRLIBERACAOCRIACAO = tbfuncionario.IDFUNCIONARIO 
        WHERE 1 = ?
	`;
     
    if(id) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + id + '\' ';
    }
    
    if(byId) {
        query = query + ' AND tbrv.IDVOUCHER = \'' + byId + '\' ';
    }
    
    if(stStatus){
        query += ` AND tbrv.STTIPOTROCA = 'DEFEITO' AND tbrv.STSTATUS = 'EM ANALISE' `;
    }
    
    if(dataPesquisaInicio && dataPesquisaFim) {
            query = query + 'AND (tbrv.DTINVOUCHER BETWEEN \'' + dataPesquisaInicio + ' 00:00:00\' AND \'' + dataPesquisaFim + ' 23:59:59\')';
    }
    
    if(subgrupoEmpresa){
        query = query + ' AND tbemporigem.IDSUBGRUPOEMPRESARIAL = \'' + subgrupoEmpresa + '\' ';
    }
    
    if(idEmpresa){
        query = query + `AND CONTAINS((tbrv.IDEMPRESAORIGEM, tbrv.IDEMPRESADESTINO), '${idEmpresa}')`;
    }
    
    if(dadosVoucher){
        query += subgrupoEmpresa ? ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}') AND tbemporigem.IDSUBGRUPOEMPRESARIAL = ${subgrupoEmpresa}` : ` AND CONTAINS((tbrv.IDVOUCHER, tbcliente.NUCPFCNPJ, tbrv.NUVOUCHER, tbrv.IDRESUMOVENDAWEBDESTINO, tbrv.IDRESUMOVENDAWEB), '${dadosVoucher}')`;
    }
    
    if(numeroVoucher){
        query += ` And  tbrv.NUVOUCHER = '${numeroVoucher}' AND STATIVO = 'True' `;
    }
    
   query = query + ' ORDER BY tbrv.DTINVOUCHER ';
 
    var request = { 
        page:  $.request.parameters.get("page"),
        pageSize:  $.request.parameters.get("pageSize")
    };
    
    api.responseWithQuery(query, request, 1);
}

function fnHandlePut() {
    let conn = $.db.getConnection();
    let bodyJson = JSON.parse($.request.body.asString());
    let STATIVO;
    let STCANCELADO;
    
    let queryInsertHistorico = `
        INSERT INTO
            "VAR_DB_NAME".HISTORICOVOUCHER
        (
            IDRESUMOVOUCHER,
            STTIPOVOUCHER, 
            STATUSVOUCHER, 
            MOTIVOTROCASTATUS,
            IDUSERALTERACAO
        ) 
        VALUES(?, ?, ?, ?, ?)
    `;
    
    let queryUpdateVoucher = `
        UPDATE 
            "VAR_DB_NAME"."RESUMOVOUCHER" 
        SET
            "STATIVO" = ?,
            "STCANCELADO" = ?,
            "DSMOTIVOCANCELAMENTO" = ?,
            "IDUSRCANCELAMENTO" = ?,
            "STSTATUS" = ?,
            "STTIPOTROCA" = ?,
            "IDUSRULTALTERACAO" = ?,
            "DTULTALTERACAO" = CURRENT_TIMESTAMP
        WHERE 
            "IDVOUCHER" =  ?
    `;
    
    let pStmtUpdate = conn.prepareStatement(api.replaceDbName(queryUpdateVoucher));
    
    for (let i = 0; i < bodyJson.length; i++) {
        
        fnAuthUserUpdate(bodyJson[i]);
        
        let { IDVOUCHER, STTIPOTROCA, STSTATUS, IDFUNCIONARIO, DSMOTIVOTROCASTATUS } = bodyJson[i];
        
        if (STSTATUS == 'NOVO' || STSTATUS == 'LIBERADO PARA O CLIENTE') {
            STATIVO = 'True';
            STCANCELADO = 'False';
        } else if (STSTATUS == 'CANCELADO' || STSTATUS == 'NEGADO') {
            STATIVO = 'False';
            STCANCELADO = 'True';
        } else if (STSTATUS == 'EM ANALISE' || STSTATUS == 'FINALIZADO') {
            STATIVO = 'False';
            STCANCELADO = 'False';
        }
        
        if(IDVOUCHER){
           fnAtualizaStatusProdutosOrigemVoucher(IDVOUCHER, STATIVO, STCANCELADO, STSTATUS, conn)
        }
        
        pStmtUpdate.setString(1, STATIVO);
        pStmtUpdate.setString(2, STCANCELADO);
        setStringOrNull(pStmtUpdate, 3, (STCANCELADO == 'True' ? DSMOTIVOTROCASTATUS : null));
        setIntOrNull(pStmtUpdate, 4, (STCANCELADO == 'True' ? IDFUNCIONARIO : null));
        pStmtUpdate.setString(5, STSTATUS);
        pStmtUpdate.setString(6, STTIPOTROCA);
        pStmtUpdate.setInt(7, IDFUNCIONARIO);
        pStmtUpdate.setInt(8, IDVOUCHER);
        
        fnInserirHistoricoVoucher(bodyJson[i], conn);
        
        pStmtUpdate.execute();
        
    }
    
    pStmtUpdate.close();

    conn.commit();
    
    return {
	    msg : "Atualização realizada com sucesso!"
	};
}

function fnHandlePost() {
    var bodyJson = JSON.parse($.request.body.asString());
    
    var conn = $.db.getConnection();
    
    var queryId = api.executeScalar('SELECT IFNULL(MAX(TO_INT("IDVOUCHER")), 0) + 1 FROM "VAR_DB_NAME"."RESUMOVOUCHER" WHERE 1 = ? ', 1);
    
    var query = `
        INSERT INTO 
            "VAR_DB_NAME"."RESUMOVOUCHER"
		(
            "IDVOUCHER", 
            "IDEMPRESAORIGEM", 
            "IDCAIXAORIGEM", 
            "IDNFEDEVOLUCAO", 
            "DTINVOUCHER", 
            "IDUSRINVOUCHER", 
            "IDVENDEDOR", 
            "IDCLIENTE", 
            "VRVOUCHER", 
            "NUVOUCHER", 
            "STATIVO", 
            "STCANCELADO", 
            "IDRESUMOVENDAWEB" ,
            "STSTATUS" ,
            "STTIPOTROCA" ,
            "MOTIVOTROCA" ,
            "IDUSRLIBERACAOCRIACAO" 
        )
		VALUES(?, ?, ?, ?, now(), ?, ?, ?, ?, ?, 'False', 'False', ?, 'EM ANALISE', ?, ?, ?) 
	`;

    var pStmt = conn.prepareStatement(api.replaceDbName(query));

	for (var i = 0; i < bodyJson.length; i++) {
        
        fnAuthUserCreate(bodyJson[i]);
        
		let {
            IDGRUPOEMPRESARIAL,
            IDEMPRESAORIGEM,
            IDCAIXAORIGEM,
            IDNFEDEVOLUCAO,
            IDUSRINVOUCHER,
            IDVENDEDOR,
            IDCLIENTE,
            VRVOUCHER,
            IDRESUMOVENDAWEB,
            STTIPOTROCA,
            MOTIVOTROCA,
            IDUSRLIBERACAOCRIACAO,
            detVoucher,
            produtosVoucher
        } = bodyJson[i];
        
		var idVoucher = queryId;
		var numVoucher = padLeft(IDGRUPOEMPRESARIAL, 2) + padLeft(IDEMPRESAORIGEM, 3) + padLeft(IDCAIXAORIGEM, 5) + padLeft(IDUSRLIBERACAOCRIACAO, 5) + queryId;
		
		let dadosHistVoucher = {
            "IDVOUCHER": idVoucher,
            STTIPOTROCA, 
            "STSTATUS": 'EM ANALISE', 
            "IDFUNCIONARIO": IDUSRLIBERACAOCRIACAO, 
            "DSMOTIVOTROCASTATUS": MOTIVOTROCA
        }
        
        pStmt.setInt(1, idVoucher);
		pStmt.setInt(2, IDEMPRESAORIGEM);
        pStmt.setInt(3, IDCAIXAORIGEM);
        pStmt.setInt(4, IDNFEDEVOLUCAO);
        //pStmt.setDate(5, DTINVOUCHER);
        pStmt.setInt(5, IDUSRINVOUCHER);
        setIntOrNull(pStmt, 6, IDVENDEDOR);
        pStmt.setInt(7, IDCLIENTE);
        pStmt.setFloat(8, VRVOUCHER);
        pStmt.setString(9, numVoucher);
        //pStmt.setString(10, STATIVO);
       // pStmt.setString(11, STCANCELADO);
        pStmt.setString(10, IDRESUMOVENDAWEB);
       // pStmt.setString(13, STSTATUS);
        pStmt.setString(11, STTIPOTROCA);
        pStmt.setString(12, MOTIVOTROCA);
        pStmt.setInt(13, IDUSRLIBERACAOCRIACAO);
        
        pStmt.execute();
        
        fnIncluirDetalheVoucher(idVoucher, detVoucher, conn);
        fnIncluirInventarioMovimentoEntrada(IDEMPRESAORIGEM, detVoucher, conn);
        fnAtualizarVendaDetalhe(produtosVoucher, idVoucher, conn);
        fnInserirHistoricoVoucher(dadosHistVoucher, conn);
	}

	pStmt.close();

	conn.commit();
	
	return {
	    "IDVOUCHER": idVoucher
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
            
        //Handle your POST calls here
        case $.net.http.POST:
            var doc = fnHandlePost();
             $.response.setBody(JSON.stringify(doc));
            break;            
        default:
            break;
    }
    
} catch(e) {
    $.response.contentType = 'application/json';
    $.response.setBody(JSON.stringify({ message : e.message }));
    $.response.status = 400;
}