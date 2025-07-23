let api = $.import("quality.concentrador_homologacao.api.apiResponse", "int_api");

function registraLogAlteracaoPreco(idResumoAlteracao, logText = 'REALIZADA COM SUCESSO', conn){
    let queryUpdateLog = `
        UPDATE
        	"VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO
        SET
        	LOGALTERACAOPRECOPRODUTO = '${logText}'
        WHERE
        	IDRESUMOALTERACAOPRECOPRODUTO = ?
    `;
    
    let pStmtUpdateLog = conn.prepareStatement(api.replaceDbName(queryUpdateLog));
    
    pStmtUpdateLog.setInt(1, idResumoAlteracao);
    pStmtUpdateLog.execute();
    pStmtUpdateLog.close();
    
    conn.commit();
}

function executeAlteracaoPreco(byId) {
    let conn = $.db.getConnection();
    let idResumoAlteracao;
    let dtHora = new Date();
    let dtHoraAlteracao;
    
    dtHoraAlteracao = dtHora;
    dtHoraAlteracao = dtHoraAlteracao.toISOString().split('T')[0] + ' 05:00:00';

    try{
        
        let precoAntigo;
        
        let prodsAgrupadosPorPreco;
        
        let prodListQuery = '';
        let listEmpresas = '';
        let prodListVerificar = [];
        let prodsEncontrados = [];
        let idsProdsNaoEncontrados = [];
        let validaProxPasso = true;
        let stExecutado = 'False';
        
        let dtHoraHoje = new Date();
        
        dtHoraHoje = dtHoraHoje.toISOString().split('T')[0];
        
        let queryResumoAlteracoes = `
            SELECT
                TBR.IDRESUMOALTERACAOPRECOPRODUTO
            FROM
                "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
            WHERE
                TBR.STCANCELADO <> 'True'
                AND TBR.STEXECUTADO <> 'True'
                AND ( ${ byId ? ` TBR.IDRESUMOALTERACAOPRECOPRODUTO = '${byId}' ` : ` TBR.AGENDAMENTOALTERACAO BETWEEN '${dtHoraHoje} 00:00:00' AND '${dtHoraHoje} 23:59:59' ` })
                AND 1 = ?
        `;
        
        let regResumoAlteracoes = api.sqlQuery(queryResumoAlteracoes, 1);
        
        if(regResumoAlteracoes.length){
            for(let i = 0; i < regResumoAlteracoes.length; i++){
                idResumoAlteracao = regResumoAlteracoes[i].IDRESUMOALTERACAOPRECOPRODUTO;
                
                let queryUpdateResumo = `
                    UPDATE
                        "VAR_DB_NAME".RESUMOALTERACAOPRECOPRODUTO TBR
                    SET
                        STEXECUTADO = 'True',
                        DATAATUALIZACAO = now(),
                        DATAEXECUTADO = now(),
                        LOGALTERACAOPRECOPRODUTO = 'REALIZADA COM SUCESSO VIA JOB'
                    WHERE
                        TBR.IDRESUMOALTERACAOPRECOPRODUTO = ?
                `;
                
                let pStmtUpdateResumo = conn.prepareStatement(api.replaceDbName(queryUpdateResumo));
                
                pStmtUpdateResumo.setInt(1, Number(idResumoAlteracao));
                pStmtUpdateResumo.execute();
                pStmtUpdateResumo.close();
                
                conn.commit();
                
                //registraLogAlteracaoPreco(idResumoAlteracao, 'REALIZADA COM SUCESSO VIA JOB', conn)
            }
            
            return {
                "type": 'success',
                "msg": "Alterações realizadas com sucesso!"
            };
            
        }
        
        return {
            "type": 'success',
            "msg": "Nenhuma Alteração encontrada para Hoje!"
        }
        
    } catch (error){
        conn.rollback();
        registraLogAlteracaoPreco(idResumoAlteracao, (error.message || 'ERROR AO EXECUTAR VIA JOB'), conn);
        throw error;
    } finally{
        conn.close();
    }
    
}

if($.response) {
    $.response.contentType = 'application/json';
    $.response.status = $.net.http.OK;
    
    try {
        switch ( $.request.method ) {
            //Handle your GET calls here
            case $.net.http.POST:
                var id = $.request.parameters.get("idResumo");
                var doc = executeAlteracaoPreco(id);
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

