/*
 * Author: Rodrigo Amorim de Moura
 * Data: 07/02/2018
 * Email: ram.amorim@gmail.com
 */


if(!getCurrentUser()){
    window.location.href = 'index.html';
}

var usuario = getCurrentUser().user;

var ipCliente = '';

var IDEmpresaLogin = usuario['IDEMPRESA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];

var listaEmpresas = [];
var caixaListaAtualiza = [];
var caixaListaLimpa = [];

//var IDEmpresaLogin = 35;
//var NOEmpresaLogin = '0035 - TO - valparizo 1';
//var NomeFuncionarioLogin = 'DANIEL ALVES DA SILVA';

console.dir(usuario);

/////////// Pega Data Atual ///////////////////////

var data = new Date();
var dia = data.getDate(); // 1-31
var dia_sem = data.getDay(); // 0-6 (zero=domingo)
var mes = data.getMonth(); // 0-11 (zero=janeiro)
var ano2 = data.getYear(); // 2 dígitos
var ano4 = data.getFullYear(); // 4 dígitos
var hora = data.getHours(); // 0-23
var min = data.getMinutes(); // 0-59
var seg = data.getSeconds(); // 0-59

diaFormatado = String(dia);
mesatual = (mes + 1);
tresmesesatras = (mes - 3);
mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

var dataPesquisaFormatada = dataAtual;

// Variáveis do Link Relatório BI
var idfilialRelBIModal = '';
var idrelatoriobimodalselected = 0;

//////////////// Funções Globais ///////////////////////////////////

function Onlynumbers(e) {
    var tecla = (window.event) ? event.keyCode : e.which;
    if (tecla > 47 && tecla < 58) {
        return true;
    } else {
        if (tecla === 8 || tecla === 0) {
            return true;
        } else {
            return false;
        }
    }
}

function mascaraValor(valor) {
	valor = valor.toString().replace(/\D/g, "");
	valor = valor.toString().replace(/(\d{1})(\d{17})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{14})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{11})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{8})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{5})$/, "$1.$2");
	valor = valor.toString().replace(/(\d{1})(\d{2})$/, "$1,$2");
	return valor;
}

function mascaraCep(valor) {

	valor = String(valor).replace(/\D/g, "").slice(0, 8);

    if (valor) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d)/, "$1-$2")
    }

    return valor;
}

function mascaraCepTempoReal(elemento) {
    const valorAtual = elemento.value;
    const valorComMascara = mascaraCep(valorAtual);
    elemento.value = valorComMascara;
}

function mascaraTelefone(valor) {

    valor = String(valor).replace(/\D/g, "").slice(0, 11);

    if (valor) {
        valor = valor.replace(/^(\d{0})(\d)/, "$1($2")

        valor = valor.replace(/(\d{2})(\d)/, "$1) $2")

        valor = valor.length > 9 ? valor.replace(/(\d{3})(\d)/, "$1$2-"): valor;

        if (valor.length > 14) {
            valor = valor.replace(/\D/g, '')
            valor = valor.replace(/(\d{2})(\d)/, "($1) $2")
            console.log(`valo1: ${valor}`)
            valor = valor.replace(/(\d)(\d{8})$/, "$1 $2")
            console.log(`valo2: ${valor}`)
            valor = valor.replace(/(\d)(\d{4})$/, "$1-$2")
            console.log(`valo3: ${valor}`)
        }
    }

    return valor
}

function mascaraTelefoneTempoReal(elemento) {
    let valorAtual = elemento.value;
    const valorComMascara = mascaraTelefone(valorAtual);
    elemento.value = valorComMascara;
}

function limparMascara(valor) {
    return valor.replace(/\D/g, '');
}

function newDataTable(tipo) {

    if (tipo == 'MovCaixas') {
        $('#dt-basic-venda-ativa').dataTable({
            destroy: true,
            responsive: true,
            fixedHeader: true,
            colReorder: true
        });
        $('#dt-basic-venda-cancelada').dataTable({
            destroy: true,
            responsive: true,
            fixedHeader: true,
            colReorder: true
        });
    } else {
        $('#dt-basic-' + tipo).dataTable({
            destroy: true,
            responsive: true,
            fixedHeader: true,
            colReorder: true
        });
    }

    $('#dt-buttons-' + tipo).dataTable({
        responsive: true,
        lengthChange: false,
        dom:
        /*	--- Layout Structure 
            --- Options
            l	-	length changing input control
            f	-	filtering input
            t	-	The table!
            i	-	Table information summary
            p	-	pagination control
            r	-	processing display element
            B	-	buttons
            R	-	ColReorder
            S	-	Select

            --- Markup
            < and >				- div element
            <"class" and >		- div with a class
            <"#id" and >		- div with an ID
            <"#id.class" and >	- div with an ID and a class

            --- Further reading
            https://datatables.net/reference/option/dom
            --------------------------------------
            */
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
        order: ([1, 'desc']),
        buttons: [{
                extend: 'colvis',
                text: 'Mostrar Colunas',
                titleAttr: 'Visualizar e Esconder Colunas',
                className: 'mr-sm-3'
            },
            {
                extend: 'pdfHtml5',
                text: 'PDF',
                titleAttr: 'Gerar PDF',
                className: 'btn-outline-danger btn-sm mr-1'
            },
            {
                extend: 'excelHtml5',
                text: 'Excel',
                titleAttr: 'Gerar Excel',
                className: 'btn-outline-success btn-sm mr-1'
            },
            {
                extend: 'print',
                text: 'Imprimir',
                titleAttr: 'Imprimir Tabela',
                className: 'btn-outline-primary btn-sm'
            }
        ]
    });

}

function logout() {
    LogoffUser();
	window.location.href = 'index.html';
}

function alerta_atualizado_sucesso() {
    Swal.fire({
        type: "success",
        title: "Dados Atualizado com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
}

function alerta_cadastrado_sucesso() {
    Swal.fire({
        type: "success",
        title: "Dados Cadastrados com Sucesso",
        showConfirmButton: false,
        timer: 2000
    });
}

function ValidaCPF(){	
    var RegraValida=document.getElementById("cpfFuncionario").value; 
    var cpfValido = /^(([0-9]{3}.[0-9]{3}.[0-9]{3}-[0-9]{2})|([0-9]{11}))$/;	 
    if (cpfValido.test(RegraValida) == true)	{ 
       //return true;
       return isValidCPF(RegraValida);
    } else	{	 
        return false;	
    }
}

function isValidCPF(cpf) {
    if (typeof cpf !== "string") return false
    cpf = cpf.replace(/[\s.-]*/igm, '')
    if (
        !cpf ||
        cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999" 
    ) {
        return false
    }
    var soma = 0
    var resto
    for (var i = 1; i <= 9; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i)
    resto = (soma * 10) % 11
    if ((resto == 10) || (resto == 11))  resto = 0
    if (resto != parseInt(cpf.substring(9, 10)) ) return false
    soma = 0
    for (var i = 1; i <= 10; i++) 
        soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i)
    resto = (soma * 10) % 11
    if ((resto == 10) || (resto == 11))  resto = 0
    if (resto != parseInt(cpf.substring(10, 11) ) ) return false
    return true
}

function fMasc(objeto,mascara) {
    obj=objeto
    masc=mascara
    setTimeout("fMascEx()",1)
}
    
function fMascEx() {
    obj.value=masc(obj.value)
}
    
function mCPF(cpf){
    cpf=cpf.replace(/\D/g,"")
    cpf=cpf.replace(/(\d{3})(\d)/,"$1.$2")
    cpf=cpf.replace(/(\d{3})(\d)/,"$1.$2")
    cpf=cpf.replace(/(\d{3})(\d{1,2})$/,"$1-$2")
    return cpf
}

function RetiraMascara(ObjCPF) {
    return ObjCPF.value.replace(/\D/g, '');
}
//////////////// Página Inicial //////////////////

$(document).ready(function() {

    $('#parametro_dia').val(dataAtualCampo);
    $('.dataAtual').text(dataAtual);
    $('.NoFuncionarioTitulo').text(NomeFuncionarioLogin);
    $('.NoEmpresaTitulo').text(NOEmpresaLogin);

    /////////////Lista de Empresas ///////////////////////////////////////////

    ajaxGet('api/informatica/empresa.xsjs')
        .then(retornoListaEmpresas)
        .catch(funcErrorListaEmpresas);
        
	ajaxGet('http://ipwho.is/')
	.then(retornoIp)
	.catch(funcError);

});

function retornoIp(resp){
    ipCliente = resp.ip;
}

function retornoListaEmpresas(respostaListaEmpresas) {

    var tableListaEmpresas = $('#dt-basic-lista_empresas').DataTable();

    tableListaEmpresas.rows().remove().draw();

    if (respostaListaEmpresas['rows'] > 0) {

        var ContadorEmpresas = 0;

        for (var i = 0; i < respostaListaEmpresas['data'].length; i++) {

            ContadorEmpresas = ContadorEmpresas + 1;

            IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
            NoEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];
            NuCNPJEmpresa = respostaListaEmpresas.data[i]['NUCNPJ'];
            NuIEEmpresa = respostaListaEmpresas.data[i]['NUINSCESTADUAL'];
            IDConfiguracaoEmpresa = respostaListaEmpresas.data[i]['IDCONFIGURACAO'];
            NuCertificadoEmpresa = respostaListaEmpresas.data[i]['DSNOMEPFX'];
            DTValidadeCertificadoEmpresa = respostaListaEmpresas.data[i]['DTVALIDADECERTIFICADO'];

            if (IDConfiguracaoEmpresa > 0) {
                SituacaoConfEmpresa = '<div class="btn-group btn-group-xs">' +
                    '<button type="button" class="btn btn-primary btn-xs" title="Atualizar Certificado" id="' + IDConfiguracaoEmpresa + '" onclick="modal_Atualiza_Cerfificado(this.id)">Certificado</button>' +
                    '<button type="button" class="btn btn-warning btn-xs" title="Editar Status de Atualização Diaria" id="' + IDEmpresa + '" onclick="modal_Editar_Empresa(this.id)">Editar</button>' +
                    '<button type="button" class="btn btn-success btn-xs" title="Listar Caixas" id="' + IDEmpresa + '" onclick="ListaCaixas(this.id)" >Caixas - PDV</button></div>';
            } else {
                SituacaoConfEmpresa = '';
            }

            tableListaEmpresas.row.add([
                `<label style="color: blue; font-size: 11px;">` + ContadorEmpresas + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NoEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuCNPJEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuIEEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuCertificadoEmpresa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DTValidadeCertificadoEmpresa + `</label>`,
                SituacaoConfEmpresa,
            ]).draw(false);

        }

    } else {


    }

}

function funcErrorListaEmpresas(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoListaEmpresas',
        showConfirmButton: false,
        timer: 15000
    });
}

function ListaCaixas(id) {

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
            newDataTable('listcaixas');

            $('.dataAtual').text(dataAtual);
            $('#IDEmpCaixa').val(id);

            return ajaxGet('api/informatica/caixa.xsjs?idEmpresa=' + id)
                .then(retornoTableListCaixasEmpresa)
                .catch(funcErrorListCaixasEmpresa);
        }
    };
    xmlhttp.open("GET", "informatica_action_listcaixa.html", true);
    xmlhttp.send();
}

function retornoTableListCaixasEmpresa(respostaListaCaixasEmpresas) {

    var tableListaCaixasEmpresas = $('#dt-basic-lista_caixas_empresas').DataTable();

    tableListaCaixasEmpresas.rows().remove().draw();

    if (respostaListaCaixasEmpresas['rows'] > 0) {

        var ContadorCaixasEmpresas = 0;

        for (var i = 0; i < respostaListaCaixasEmpresas['data'].length; i++) {

            ContadorCaixasEmpresas = ContadorCaixasEmpresas + 1;

            IDCaixa = respostaListaCaixasEmpresas.data[i]['IDCAIXAWEB'];
            DsCaixa = respostaListaCaixasEmpresas.data[i]['DSCAIXA'];
            IDEmpresaCaixa = respostaListaCaixasEmpresas.data[i]['IDEMPRESA'];
            DsEmpresa = respostaListaCaixasEmpresas.data[i]['NOFANTASIA'];
            NuPorta = respostaListaCaixasEmpresas.data[i]['DSPORTACOMUNICACAO'];
            NuSerieNota = respostaListaCaixasEmpresas.data[i]['NUSERIEPROD'];
            NuUltNota = respostaListaCaixasEmpresas.data[i]['NUNFCEPROD'];
            VersaoCaixa = respostaListaCaixasEmpresas.data[i]['VERSAO'];
            TPTEF = respostaListaCaixasEmpresas.data[i]['TIPOTEF'];
            STSituacaoCaixa = respostaListaCaixasEmpresas.data[i]['STATIVO'];

            if (STSituacaoCaixa == 'True') {
                tagCaixaAtivo = '<label style="color: blue;">Ativo</label>';
            } else {
                tagCaixaAtivo = '<label style="color: red;">Inativo</label>';
            }

            tagEditarCaixaBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-primary btn-xs" title="Editar Caixa" id="' + IDCaixa + '" onclick="modal_Atualiza_Caixa(this.id)" >Editar</button></div>';

            tableListaCaixasEmpresas.row.add([
                `<label style="color: blue; font-size: 11px;">` + IDCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + DsCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuPorta + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuSerieNota + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + NuUltNota + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + VersaoCaixa + `</label>`,
                `<label style="color: blue; font-size: 11px;">` + TPTEF + `</label>`,
                tagCaixaAtivo,
                tagEditarCaixaBotao,
            ]).draw(false);

        }

        $('#NoEmpCaixa').val(DsEmpresa);

        $('.DescTituloCaixasEmpresa').html(
            `<i class='subheader-icon fal fa-chart-area'></i> Lista de Caixas da Empresa - <span class='fw-300'>` + DsEmpresa + `</span>`);

    }

}

function funcErrorListCaixasEmpresa(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoTableListCaixasEmpresa',
        showConfirmButton: false,
        timer: 15000
    });
}

function modal_Editar_Empresa(id) {

    caixaListaAtualiza = [];
    caixaListaLimpa = [];
    
    $.get('informatica_action_updateempresamodal.html', function(res) {

        $('#resulmodalempresaatualiza').html(res);
        $("#UpEmpresasAtualiza").modal('show');
        $('#UpEmpresasAtualiza').on('shown.bs.modal', function() {

        });

        $('#statualizadiario').select2()
        $('#stLojaAberta').select2()
        
        return ajaxGet('api/informatica/atualiza-empresa-diario.xsjs?id=' + id)
            .then(retornoUpdateAtualizaDiario)
            .catch(funcError);

    })

}

function retornoUpdateAtualizaDiario(updateAtualizaEmpresa) {

    IDEmpresaAtualiza = updateAtualizaEmpresa.data[0]['IDEMPRESA'];
    NomeEmpresaAtualiza = updateAtualizaEmpresa.data[0]['NOFANTASIA'];
    HoraEmpresaAtualiza = updateAtualizaEmpresa.data[0]['HRATUALIZACAO'];
    STAtualizaEmpresa = updateAtualizaEmpresa.data[0]['STATUALIZADIARIO'];
    let stLojaAberta = updateAtualizaEmpresa.data[0]['STLOJAABERTA'] || "";
    let idFuncionarioSupervisor = updateAtualizaEmpresa.data[0]['IDFUNCIONARIOSUPERVISOR'] || "";


    $('#IDEmpresaUpdate').val(IDEmpresaAtualiza);
    $('#nomeempupdate').val(NomeEmpresaAtualiza);
    $('#HRAtualiza').val(HoraEmpresaAtualiza);
          
    $('#stLojaAberta').val(stLojaAberta).trigger('change');
    
    if (STAtualizaEmpresa == 'True') { 
        $('#statualizardiario').append(
            `<option value="True" selected> SIM</option>
			<option value="False">NÃO</option>`
        );
    } else {
        $('#statualizardiario').append(
            `<option value="True"> SIM</option>
				<option value="False" selected> NÃO</option>`
        );
    }
    
     $('#stLojaAberta').on('change', function() {
      if ($(this).val() == 'False') {
          idFuncionarioSupervisor = null;
      }
    });
    
    return ajaxGet('api/informatica/caixa.xsjs?idEmpresa=' + IDEmpresaAtualiza)
        .then(retornoListaCaixas)
        .catch(funcError);

}

function retornoListaCaixas(respostaListaCaixas) {

	for (var i = 0; i < respostaListaCaixas.data.length; i++) {

		idCaixa = respostaListaCaixas.data[i]['IDCAIXAWEB'];
		DsCaixa = respostaListaCaixas.data[i]['DSCAIXA'];
		
        $("#resultadoListCaixasEmpresas").append(`<tr>
                                            <td><label style="color: black; font-size: 11px; ">`+ idCaixa +`</label></td>
                                            <td><label style="color: black; font-size: 11px; ">`+ DsCaixa +`</label></td>
                                            <td>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" id="A`+idCaixa+`" onclick="IncluirCaixaListaAtualiza(this)">
                                                    <label class="custom-control-label" for="A`+idCaixa+`"></label>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="custom-control custom-checkbox">
                                                    <input type="checkbox" class="custom-control-input" id="L`+idCaixa+`" onclick="IncluirCaixaListaLimpar(this)">
                                                    <label class="custom-control-label" for="L`+idCaixa+`"></label>
                                                </div>
                                            </td>
                                        </tr>`);
	}

}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function IncluirCaixaListaAtualiza(cb){
    
    if(cb.checked === true){
       caixaListaAtualiza.push(cb.id);
    }else{
       caixaListaAtualiza.remove(cb.id); 
    } 
}

function IncluirCaixaListaLimpar(cbl){
    
    if(cbl.checked === true){
       caixaListaAtualiza.push(cbl.id);
    }else{
       caixaListaAtualiza.remove(cbl.id); 
    } 
}

function atualizar_diaria_empresa() {

    var idempresaAtualiza = $("#IDEmpresaUpdate").val();
    var hratualiza = $('#HRAtualiza').val();
    var statualiza = $("#statualizardiario").val();
    let stLojaAberta = $("#stLojaAberta").val();
    let idFuncionarioSupervisor = null;

     if (!stLojaAberta) {
        return Swal.fire({
            icon: "warning",
            title: "Selecione em qual estado a loja está antes de atualizar",
        }).then(() => {
            $("#stLojaAberta").focus();
            $("#stLojaAberta").select2('open');
        });
    }

    if (statualiza != 'True') {
        hratualiza = '00:00:00';
    }
    
    if (stLojaAberta == 'True') {
      idFuncionarioSupervisor = $('#IDFUNCIONARIOSUPERVISOR').val();
    }
    
    var dados = [{
        "IDEMPRESA": parseInt(idempresaAtualiza),
        "HORAATUALIZA": hratualiza,
        "STATUALIZADIARIO": statualiza,
        "STLOJAABERTA": stLojaAberta,
        "IDFUNCIONARIOSUPERVISOR": idFuncionarioSupervisor
    }];

    console.table(dados);

    ajaxPut("api/informatica/atualiza-empresa-diario.xsjs", dados)
        .then(funcSucessUpdateAtualizaEmpresa)
        .catch(funcError);

    var dadosSTCaixa = [{
        "STATUALIZA": caixaListaAtualiza
    }];

    console.table(dadosSTCaixa);

    ajaxPut("api/informatica/atualiza-st-caixas.xsjs", dadosSTCaixa)
        .then(funcSucessUpdateSTCaixas)
        .catch(funcError);
        
	const textdados = JSON.stringify(dados);

	textoFuncao = 'INFORMATICA/EDIÇÃO DE ATUALIZAÇÃO DIÁRIA DOS PDVs DA EMPRESA';

    var dadosEditCaixa = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosEditCaixa)
		.then(funcSucessLog)
		.catch(funcError);

}

function funcSucessUpdateAtualizaEmpresa(resposta) {

    var idempresa = $("#IDEmpresaUpdate").val();

    alerta_atualizado_sucesso();
    $("#UpEmpresasAtualiza").modal('hide');
    window.location.href = 'dashboardinformatica.html';

}

function funcSucessUpdateSTCaixas(resposta) {

}

function funcSucessUpdateAtualizaCaixaTodos(resposta) {

    alerta_atualizado_sucesso();

}

function atualizar_caixas_todos() {

    var statualiza = 'True';

    var dados = [{

        "STATUALIZA": statualiza

    }];

    console.table(dados);

    ajaxPut("api/informatica/atualizar_todos_caixa.xsjs", dados)
        .then(funcSucessUpdateAtualizaCaixaTodos)
        .catch(funcError);
        
	const textdados = JSON.stringify(dados);

	textoFuncao = 'INFORMATICA/ATUALIZAR TODOS OS CAIXA';

    var dadosEditCaixa = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosEditCaixa)
		.then(funcSucessLog)
		.catch(funcError);

}

function modal_Atualiza_Caixa(id) {

    var caixa_idempresa = $("#IDEmpCaixa").val();
    var caixa_nomeempresa = $("#NoEmpCaixa").val();

    $.get('informatica_action_updatecaixamodal.html', function(res) {

        $('#resulmodalupdatecaixa').html(res);
        $("#updateCaixa").modal('show');
        $('#updateCaixa').on('shown.bs.modal', function() {
            $("#DSCaixa").focus();
            $("#DSCaixa").select();

            $('#IDEmpresaUpdate').val(caixa_idempresa);
            $('#nomeempupdate').val(caixa_nomeempresa);

        });

        return ajaxGet('api/informatica/caixa.xsjs?id=' + id)
            .then(retornoUpdateCaixas)
            .catch(funcErrorUpdateCaixas);

    })

}

function retornoUpdateCaixas(updateCaixas) {

    IDEmpresaCaixa = updateCaixas.data[0]['IDEMPRESA'];
    NoFantasiaEmpresaCaixa = updateCaixas.data[0]['NOFANTASIA'];
    NuCNPJEmpresaCaixa = updateCaixas.data[0]['NUCNPJ'];
    IDCaixaEmpresa = updateCaixas.data[0]['IDCAIXAWEB'];
    DsEmpresaCaixa = updateCaixas.data[0]['DSCAIXA'];
    TPEmissao = updateCaixas.data[0]['TBEMISSAOFISCAL'];
    NoImpressora = updateCaixas.data[0]['NOIMPRESSORA'];
    NuPortaCaixa = updateCaixas.data[0]['DSPORTACOMUNICACAO'];
    NuSerieNFCeProd = updateCaixas.data[0]['NUSERIEPROD'];
    NuNFCeProd = updateCaixas.data[0]['NUNFCEPROD'];
    STTef = updateCaixas.data[0]['STTEF'];
    STAtualiza = updateCaixas.data[0]['STATUALIZA'];
    STLimpa = updateCaixas.data[0]['STLIMPA'];

    DadosCaixa = DsEmpresaCaixa;

    $('#IDEmpresa').val(IDEmpresaCaixa);
    $('#nomeempupdate').val(NoFantasiaEmpresaCaixa);
    $('#IDCaixa').val(IDCaixaEmpresa);
    $('#DSCaixa').val(DadosCaixa);
    $('#DSPORTACOMUNICACAO').val(NuPortaCaixa);
    $('#NUSERIEPROD').val(NuSerieNFCeProd);
    $('#NUNFCEPROD').val(NuNFCeProd);
    
    if (STTef == 'True') {
        $('#sttef').append(
            `<option value="True" selected> SIM</option>
			<option value="False">NÃO</option>`
        );
    } else {
        $('#sttef').append(
            `<option value="True"> SIM</option>
				<option value="False" selected> NÃO</option>`
        );
    }
    
    if (STAtualiza == 'True') {
        $('#statualizar').append(
            `<option value="True" selected> SIM</option>
			<option value="False">NÃO</option>`
        );
    } else {
        $('#statualizar').append(
            `<option value="True"> SIM</option>
				<option value="False" selected> NÃO</option>`
        );
    }
    
    if (STLimpa == 'True') {
        $('#stlimpar').append(
            `<option value="True" selected> SIM</option>
			<option value="False">NÃO</option>`
        );
    } else {
        $('#stlimpar').append(
            `<option value="True"> SIM</option>
				<option value="False" selected> NÃO</option>`
        );
    }

    if (TPEmissao == 'NFCE') {

        $('#TBEmissaoFiscal').append(
            `<option value="NFCE" selected> NFCE</option>
				<option value="NFE"> NFE</option>`
        );
    } else {
        $('#TBEmissaoFiscal').append(
            `<option value="NFCE"> NFCE</option>
				<option value="NFE" selected> NFE</option>`
        );
    }

    if (NoImpressora == 'ppEscPosEpson') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson" selected>ppEscPosEpson</option>
                <option value="ppEscBematech">ppEscBematech</option>
                <option value="ppEscDaruma">ppEscDaruma</option>
                <option value="ppEscDiebold">ppEscDiebold</option>
                <option value="ppEscElgin">ppEscElgin</option>
                <option value="ppTexto">ppTexto</option>`
        );
    } else if (NoImpressora == 'ppEscBematech') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson">ppEscPosEpson</option>
                <option value="ppEscBematech" selected>ppEscBematech</option>
                <option value="ppEscDaruma">ppEscDaruma</option>
                <option value="ppEscDiebold">ppEscDiebold</option>
                <option value="ppEscElgin">ppEscElgin</option>
                <option value="ppTexto">ppTexto</option>`
        );
    } else if (NoImpressora == 'ppEscDaruma') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson">ppEscPosEpson</option>
                <option value="ppEscBematech">ppEscBematech</option>
                <option value="ppEscDaruma" selected>ppEscDaruma</option>
                <option value="ppEscDiebold">ppEscDiebold</option>
                <option value="ppEscElgin">ppEscElgin</option>
                <option value="ppTexto">ppTexto</option>`
        );
    } else if (NoImpressora == 'ppEscDiebold') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson">ppEscPosEpson</option>
                <option value="ppEscBematech">ppEscBematech</option>
                <option value="ppEscDaruma">ppEscDaruma</option>
                <option value="ppEscDiebold" selected>ppEscDiebold</option>
                <option value="ppEscElgin">ppEscElgin</option>
                <option value="ppTexto">ppTexto</option>`
        );
    } else if (NoImpressora == 'ppEscElgin') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson">ppEscPosEpson</option>
                <option value="ppEscBematech">ppEscBematech</option>
                <option value="ppEscDaruma">ppEscDaruma</option>
                <option value="ppEscDiebold">ppEscDiebold</option>
                <option value="ppEscElgin" selected>ppEscElgin</option>
                <option value="ppTexto">ppTexto</option>`
        );
    } else if (NoImpressora == 'ppTexto') {
        $('#NOIMPRESSORA').append(
            `<option value="ppEscPosEpson">ppEscPosEpson</option>
                <option value="ppEscBematech">ppEscBematech</option>
                <option value="ppEscDaruma">ppEscDaruma</option>
                <option value="ppEscDiebold">ppEscDiebold</option>
                <option value="ppEscElgin">ppEscElgin</option>
                <option value="ppTexto" selected>ppTexto</option>`
        );
    }
}

function funcErrorUpdateCaixas(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoUpdateCaixas',
        showConfirmButton: false,
        timer: 15000
    });
}

function funcSucessLog(resposta) {


}

function atualizar_caixa() {

    var idcaixa = $("#IDCaixa").val();
    var idempresa = $("#IDEmpresaUpdate").val();
    var dscaixa = $('#DSCaixa').val();
    var tbemissao = $("#TBEmissaoFiscal").val();
    var noimpressora = $("#NOIMPRESSORA").val();
    var dsporta = $("#DSPORTACOMUNICACAO").val();
    var nuserie = $("#NUSERIEPROD").val();
    var nunfceprod = $("#NUNFCEPROD").val();
    var sttef = $("#sttef").val();
    var statualiza = $("#statualizar").val();
    var stlimpa = $("#stlimpar").val();

    var dados = [{

        "IDCAIXAWEB": parseInt(idcaixa),
        "DSCAIXAWEB":dscaixa,
        "TBEMISSAOFISCAL": tbemissao,
        "NOIMPRESSORA": noimpressora,
        "DSPORTACOMUNICACAO": dsporta,
        "NUSERIEPROD": parseInt(nuserie),
        "NUNFCEPROD": parseInt(nunfceprod),
        "DTULTALTERACAO": dataAtualCampo,
        "STTEF": sttef,
        "STATUALIZA": statualiza,
        "STLIMPA": stlimpa

    }];

    console.table(dados);

    ajaxPut("api/informatica/caixa.xsjs", dados)
        .then(funcSucessUpdateCaixa)
        .catch(funcErrorUpdateCaixa);
        
	const textdados = JSON.stringify(dados);

	textoFuncao = 'INFORMATICA/EDIÇÃO DE CAIXA';

    var dadosEditCaixa = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosEditCaixa)
		.then(funcSucessLog)
		.catch(funcError);

}

function funcSucessUpdateCaixa(resposta) {

    var idempresa = $("#IDEmpresaUpdate").val();

    alerta_atualizado_sucesso();
    $("#updateCaixa").modal('hide');
    ListaCaixas(idempresa);

}

function funcErrorUpdateCaixa(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do funcSucessUpdateCaixa',
        showConfirmButton: false,
        timer: 15000
    });
}

function modal_Cad_Caixa() { 

    var caixa_idempresa = $("#IDEmpCaixa").val();
    var caixa_nomeempresa = $("#NoEmpCaixa").val();

    $.get('informatica_action_cadcaixamodal.html', function(res) {

        $('#resulmodalcadcaixa').html(res);
        $("#cadCaixa").modal('show');
        $('#cadCaixa').on('shown.bs.modal', function() {
            $("#DSCaixa").focus();
            $("#DSCaixa").select();

            $('#IDEmpresaCad').val(caixa_idempresa);
            $('#nomeempcad').val(caixa_nomeempresa);

        });

    })

}

function cadastrar_caixa() {

    var idempresa = $("#IDEmpresaCad").val();
    var dscaixa = $('#DSCaixa').val();
    var tbemissao = $("#TBEmissaoFiscal").val();
    var noimpressora = $("#NOIMPRESSORA").val();
    var dsporta = $("#DSPORTACOMUNICACAO").val();
    var nuserie = $("#NUSERIEPROD").val();
    var nunfceprod = $("#NUNFCEPROD").val();
    var statualiza = $("#statualizar").val();
    var stlimpa = $("#stlimpar").val();

    var NUULTNFCE = 0;
    var NUSERIE = 0;
    var NULINHAIMPRESSORA = 48;
    var NUBAUD = '115200';
    var NULINHAENTRECUPOM = 10;
    var STIMPRIMIRUMITEMPORLINHA = 'False';
    var STDANFCERESUMIDO = 'False';
    var STIGNORARTAGFORMATACAO = 'False';
    var STIMPRIMIRDESCACRESITEM = 'True';
    var STVIACONSUMIDOR = 'True';
    var STTEF = 'True';
    var STBALANCA = 'False';
    var STGAVETEIRO = 'False';
    var STSANGRIA = 'True';
    var VRMAXSANGRIA = 0
    var STCONTROLAHORARIO = 'False';
    var HRINICIOLOGIN = '00:00:00';
    var HRFIMLOGIN = '23:59:59';
    var STSTATUS = 'Livre';
    var NUSERIEHOM = 0
    var NUNFCEHOM = 0
    var STATIVO = 'True';
    var VSSISTEMA = '2.5.2.0';

    var dados = [{

        "TBEMISSAOFISCAL": tbemissao,
        "NOIMPRESSORA": noimpressora,
        "DSPORTACOMUNICACAO": dsporta,
        "NUSERIEPROD": parseInt(nuserie),
        "NUNFCEPROD": parseInt(nunfceprod),
        "DTULTALTERACAO": dataAtualCampo,
        "IDEMPRESA": parseInt(idempresa),
        "DSCAIXA": dscaixa,
        "NUULTNFCE": parseInt(NUULTNFCE),
        "NUSERIE": parseInt(NUSERIE),
        "NULINHAIMPRESSORA": parseInt(NULINHAIMPRESSORA),
        "NUBAUD": NUBAUD,
        "NULINHAENTRECUPOM": NULINHAENTRECUPOM,
        "STIMPRIMIRUMITEMPORLINHA": STIMPRIMIRUMITEMPORLINHA,
        "STDANFCERESUMIDO": STDANFCERESUMIDO,
        "STIGNORARTAGFORMATACAO": STIGNORARTAGFORMATACAO,
        "STIMPRIMIRDESCACRESITEM": STIMPRIMIRDESCACRESITEM,
        "STVIACONSUMIDOR": STVIACONSUMIDOR,
        "STTEF": STTEF,
        "STBALANCA": STBALANCA,
        "STGAVETEIRO": STGAVETEIRO,
        "STSANGRIA": STSANGRIA,
        "VRMAXSANGRIA": parseFloat(VRMAXSANGRIA),
        "STCONTROLAHORARIO": STCONTROLAHORARIO,
        "HRINICIOLOGIN": HRINICIOLOGIN,
        "HRFIMLOGIN": HRFIMLOGIN,
        "STSTATUS": STSTATUS,
        "NUSERIEHOM": parseInt(NUSERIEHOM),
        "NUNFCEHOM": parseInt(NUNFCEHOM),
        "STATIVO": STATIVO,
        "VSSISTEMA": VSSISTEMA,
        "STATUALIZA": statualiza,
        "STLIMPA": stlimpa

    }];

    console.table(dados);

    ajaxPost("api/informatica/caixa.xsjs", dados)
        .then(funcSucessCadastroCaixa)
        .catch(funcErrorCadastroCaixa);
        
    console.table(dados);

    ajaxPut("api/informatica/caixa.xsjs", dados)
        .then(funcSucessUpdateCaixa)
        .catch(funcErrorUpdateCaixa);
        
	const textdados = JSON.stringify(dados);

	textoFuncao = 'INFORMATICA/CADASTRO DE CAIXA';

    var dadosCadCaixa = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosCadCaixa)
		.then(funcSucessLog)
		.catch(funcError);

}

function funcSucessCadastroCaixa(resposta) {

    var idempresacad = $("#IDEmpresaCad").val();

    alerta_cadastrado_sucesso();
    $("#cadCaixa").modal('hide');
    ListaCaixas(idempresacad);

}

function funcErrorCadastroCaixa(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do funcSucessCadastroCaixa',
        showConfirmButton: false,
        timer: 15000
    });
}

//////////////////Menu Vendas das Lojas////////////////////////////

function ListaVendasLoja() {

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    $("#resultado").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>" +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

            $('.dataAtual').text(dataAtual);
            $('#DTInicio').val(dataAtualCampo);
            $('#DTFim').val(dataAtualCampo);

            $("#idloja").select2();

            $('.DescTituloListaVendas').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Lista das Vendas das Lojas - <span class='fw-300'></span>`);

            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch(funcErrorListaEmpresasSelect);
        }
    };
    xmlhttp.open("GET", "informatica_action_listavendas.html", true);
    xmlhttp.send();
}

function funcErrorListaEmpresasSelect(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoListaEmpresas',
        showConfirmButton: false,
        timer: 15000
    });
}

function retornoListaEmpresasSelect(respostaListaEmpresas) {
    listaEmpresas = respostaListaEmpresas.data;
    for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

        IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
        DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

        $('#idloja').append(
            `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
        );

        $('#empresaFuncionario').append(
            `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
        );
    }
}

function pesq_vendas_loja() {

    var IDEmpresaPesqVenda = $("#idloja").val();
    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultado").innerHTML = xmlhttp.responseText;
            newDataTable('pesqvendas');

            $('.dataAtual').text(dataAtual);

            ajaxGet('api/informatica/vendas-lojas.xsjs?pagesize=1000&status=False&idEmpresa=' + IDEmpresaPesqVenda + '&dataInicio=' + datapesqinicio + '&dataFim=' + datapesqfim)
                .then(retornoListaVendasLoja)
                .catch(funcErrorListaVendasLoja);
        }
    };
    xmlhttp.open("GET", "informatica_action_pesqvendasloja.html", true);
    xmlhttp.send();
}

function retornoListaVendasLoja(respostaListaVendaAtivas) {

    var VendaAtivaValor = 0;
    var TotalVendaAtiva = 0;
    var contadorAtiva = 0;

    $('#resultado').html(
        `<table id="dt-basic-pesqvendas" class="table table-bordered table-hover table-striped w-100 .dt-responsive">
            <thead class="bg-primary-600">
                <tr>
                    <th></th>
                    <th>Caixa</th>
                    <th>Versão</th>
                    <th>Nº Venda</th>
                    <th>NFCe</th>
                    <th>Abertura</th>
                    <th>Operador</th>
                    <th>Valor</th>
                    <th>Nota</th>
                    <th>Migrado SAP</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody id="resultadoListVendasAtivas">
            </tbody>
            <tfoot class="thead-themed totalAtivas">
            </tfoot>
        </table>`
    );

    var tableVendasAtivas = $('#dt-basic-pesqvendas').DataTable();
    tableVendasAtivas.rows().remove().draw();
    for (var i = 0; i < respostaListaVendaAtivas.data.length; i++) {

        contadorAtiva = contadorAtiva + 1;

        NumCaixa = respostaListaVendaAtivas.data[i]['IDCAIXAWEB'];
        DescCaixa = respostaListaVendaAtivas.data[i]['DSCAIXA'];
        vCaixa = respostaListaVendaAtivas.data[i]['VSSISTEMA'];
        NuVenda = respostaListaVendaAtivas.data[i]['IDVENDA'];
        NuNFCe = respostaListaVendaAtivas.data[i]['NFE_INFNFE_IDE_NNF'];
        DTAberturaVendaAtiva = respostaListaVendaAtivas.data[i]['DTHORAFECHAMENTO'];
        NomeOperadorVendaAtiva = respostaListaVendaAtivas.data[i]['NOFUNCIONARIO'];
        STConferidoMov = respostaListaVendaAtivas.data[i]['STCONFERIDO'];

        VendaAtivaValor = parseFloat(respostaListaVendaAtivas.data[i]['VRTOTALPAGO']);
        EmitidasAtivas = respostaListaVendaAtivas.data[i]['STCONTINGENCIA'];

        if (EmitidasAtivas == 'false') {
            NotaEmitidaAtiva = 'Contigência';
        } else {
            NotaEmitidaAtiva = 'Emitida';
        }

        if (STConferidoMov == 1) {
            STConferido = '<label style="color: blue; font-size: 11px;">SIM</label>';
        } else {

            STConferido = '<label style="color: red; font-size: 11px;">NÃO</label>';
        }

        TotalVendaAtiva = TotalVendaAtiva + VendaAtivaValor;
        tableVendasAtivas.row.add([
            `<label style="color: blue; font-size: 11px;">` + contadorAtiva + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NumCaixa + ` - ` + DescCaixa + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + vCaixa + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NuVenda + `</label>`,
            `<label style="color: blue;">` + NuNFCe + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + DTAberturaVendaAtiva + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NomeOperadorVendaAtiva + `</label>`,
            `<label style="color: blue;">` + mascaraValor(VendaAtivaValor.toFixed(2)) + `</label>`,
            `<label style="color: blue; font-size: 11px;">` + NotaEmitidaAtiva + `</label>`,
            STConferido,
            `<div class="btn-group btn-group-xs">
                <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="` + NuVenda + `" onclick="modal_Detalhe_Venda(this.id)" >Detalhar</button>
                <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="` + NuVenda + `" onclick="modal_Detalhe_Recebimento(this.id)" >Recebimento</button>
            </div>`,
        ]).draw(false);

    }

    $('.totalAtivas').html(
        `<tr>
            <th colspan="7" style="text-align: center;">Total Vendas Ativas</th>
            <th style="text-align: right;">${mascaraValor(TotalVendaAtiva.toFixed(2))}</th>
            <th colspan="3"></th>
        </tr>`
    );
}

function funcErrorListaVendasLoja(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoListaVendasLoja',
        showConfirmButton: false,
        timer: 15000
    });
}

function modal_Cancelar_Venda(id, stconferido) {
    alert(stconferido);

    if (STConferidoMov == 1) {
        alerta_venda_migrada();
    } else {
        $.get('informatica_action_cancelavendamodal.html', function(res) {

            $('#resulmodalcancelvenda').html(res);
            $("#cancelVenda").modal('show');
            $('#cancelVenda').on('shown.bs.modal', function() {});

            $('#IDResumoVendaWeb').val(id);
        })
    }


}

function alerta_venda_migrada() {
    Swal.fire({
        type: "warning",
        title: "A venda já foi migrada para o SAP, não será possível Cancelar. ",
        showConfirmButton: false,
        timer: 2500
    });
}

///////////Detalhe Venda e Recebimentos////////////////////////////

function funcErrorDetVenda(data) {
    Swal.fire({
        type: "error",
        title: data.msg,
        showConfirmButton: false,
        timer: 15000
    });
}

function retornoListaVendasAtivasDetalhe(respostaListaVendaAtivasDetalhe) {

    for (var i = 0; i < respostaListaVendaAtivasDetalhe.data.length; i++) {

        IDVenda = respostaListaVendaAtivasDetalhe.data[i]['IDVENDA'];
        NumCodBarra = respostaListaVendaAtivasDetalhe.data[i]['NUCODBARRAS'];
        DescProduto = respostaListaVendaAtivasDetalhe.data[i]['DSNOME'];
        VrUnitario = parseFloat(respostaListaVendaAtivasDetalhe.data[i]['VUNCOM']);
        QTDProduto = respostaListaVendaAtivasDetalhe.data[i]['QTD'];

        VrTotal = parseFloat(respostaListaVendaAtivasDetalhe.data[i]['VRTOTALLIQUIDO']);
        NomeVendedor = respostaListaVendaAtivasDetalhe.data[i]['VENDEDOR_NOME'];
        SituacaoProduto = respostaListaVendaAtivasDetalhe.data[i]['STCANCELADO'];

        if (SituacaoProduto == 'False') {
            tagDetProdAtivo = '<td><label style="color: blue;">Ativo</label></td>';
        } else {
            tagDetProdAtivo = '<td><label style="color: red;">Cancelado</label></td>';
        }

        $('#resultListDetalheVenda').append(
            `<tr>
                    <td><label style="color: blue;">` + NumCodBarra + `</label></td>
                    <td><label style="color: blue;">` + DescProduto + `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrUnitario.toFixed(2)) + `</label></td>
                    <td><label style="color: blue;">` + QTDProduto + `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrTotal.toFixed(2)) + `</label></td>
                    <td><label style="color: blue;">` + NomeVendedor + `</label></td>` +
            tagDetProdAtivo +
            `</tr>`
        );
    }

    $('.textoCabecalhoDetalhe').html(
        `<h2>
            Lista de Produtos da Venda Nº <span class="fw-300"><i>${IDVenda}</i></span>
        </h2>`
    );
}

function modal_Detalhe_Venda(id) {

    var IDEmpresaPesqVenda = $("#idloja").val();

    $.get('action_detvendamodal.html', function(res) {

        $('#resulmodaldetvenda').html(res);
        $("#detVenda").modal('show');
        $('#detVenda').on('shown.bs.modal', function() {});

        return ajaxGet('api/dashboard/venda/detalhe-venda.xsjs?idEmpresa=' + IDEmpresaPesqVenda + '&idVenda=' + id)
            .then(retornoListaVendasAtivasDetalhe)
            .catch(funcErrorDetVenda);
    })

}

function retornoListaPagamentoVenda(respostaListaPagamentoVenda) {

    for (var i = 0; i < respostaListaPagamentoVenda.data.length; i++) {

        IDVendaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDVENDA'];
        IDEmpresaPagamento = respostaListaPagamentoVenda.data[i]['venda']['IDEMPRESA'];
        VrDinheiroPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRDINHEIRO']);
        VrCartaoPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCARTAO']);
        VrPOSPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECPOS']);
        VrConvenioPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECCONVENIO']);
        VrVoucherPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRRECVOUCHER']);
        VrTotalPagamento = parseFloat(respostaListaPagamentoVenda.data[i]['venda']['VRTOTALVENDA']);

        $('#resultListPagamentoVenda').append(
            `<tr>
                    <td><label style="color: blue;">` + mascaraValor(VrDinheiroPagamento.toFixed(2)) +
            `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrCartaoPagamento.toFixed(2)) +
            `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrPOSPagamento.toFixed(2)) +
            `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrConvenioPagamento.toFixed(2)) +
            `</label></td>
                    <td><label style="color: blue;">` + mascaraValor(VrVoucherPagamento.toFixed(2)) +
            `</label></td>
                </tr>`
        );

        for (var j = 0; j < respostaListaPagamentoVenda.data[i].vendaPagamento.length; j++) {

            TipoPagamento = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['DSTIPOPAGAMENTO'];
            NuParcelas = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NPARCELAS'];
            NuAutorizadora = respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['NSUAUTORIZADORA'];
            VrRecebidoParcela = parseFloat(respostaListaPagamentoVenda.data[i].vendaPagamento[j]['pag']['VALORRECEBIDO']);

            if (NuParcelas == null) {
                NuParcelas = 0;
            }

            if (NuAutorizadora == null) {
                NuAutorizadora = 0;
            }

            $('#resultListPagamento').append(
                `<tr>
                            <td><label style="color: blue;">` + TipoPagamento +
                `</label></td>
                            <td><label style="color: blue;">` + NuParcelas +
                `</label></td>
                            <td><label style="color: blue;">` + NuAutorizadora +
                `</label></td>
                            <td><label style="color: blue;">` + mascaraValor(VrRecebidoParcela.toFixed(2)) +
                `</label></td>
                        </tr>`
            );

        }

        $('#IDResVenda').val(IDVendaPagamento);
        $('#IDEmpResumo').val(IDEmpresaPagamento);
        $('#VrDistribuir').val(mascaraValor(VrTotalPagamento.toFixed(2)));
        $('#VrDistribuir2').val(mascaraValor(VrTotalPagamento.toFixed(2)));
        $('#DTParcelaCartao').val(dataAtualCampo);
        $('#DTParcelaPOS').val(dataAtualCampo);
    }

    $('.textoCabecalhoPagamento').html(
        `<h2>
            <span class="fw-300">Lista de Recebimentos da Venda Nº </span>&nbsp${IDVendaPagamento}&nbsp;
        </h2>`
    );

    return ajaxGet('api/informatica/pagamento-tef.xsjs')
        .then(retornoListaPagamentoTEFSelect)
        .catch(funcErrorListaPagamentoTEFSelect);

}

function modal_Detalhe_Recebimento(id) {

    $.get('informatica_action_detrecebimentomodal.html', function(res) {

        $('#resulmodaldetvendarecebimento').html(res);
        $("#detVendaRecebimento").modal('show');
        $('#detVendaRecebimento').on('shown.bs.modal', function() {});

        return ajaxGet('api/dashboard/venda/recebimento.xsjs?id=' + id)
            .then(retornoListaPagamentoVenda)
            .catch(funcErrorDetVenda);

    })

}

function retornoListaPagamentoTEFSelect(respostaListaDSPagamentoTEF) {

    for (var i = 0; i < respostaListaDSPagamentoTEF.data.length; i++) {

        DSTipoPagamento = respostaListaDSPagamentoTEF.data[i]['DSTIPOPAGAMENTO'];

        $('#DSTipoPagamentoTEF').append(
            `<option value="` + DSTipoPagamento + `"> ` + DSTipoPagamento + `</option>`
        );
    }


    return ajaxGet('api/informatica/pagamento-pos.xsjs')
        .then(retornoListaPagamentoPOSSelect)
        .catch(funcErrorListaPagamentoPOSSelect);

}

function retornoListaPagamentoPOSSelect(respostaListaDSPagamentoPOS) {

    for (var i = 0; i < respostaListaDSPagamentoPOS.data.length; i++) {

        DSTipoPagamentoPOS = respostaListaDSPagamentoPOS.data[i]['DSTIPOPAGAMENTOPOS'];

        $('#DSTipoPagamentoPOS').append(
            `<option value="` + DSTipoPagamentoPOS + `"> ` + DSTipoPagamentoPOS + `</option>`
        );
    }
}

function funcErrorListaPagamentoPOSSelect(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoListaPagamentoPOSSelect',
        showConfirmButton: false,
        timer: 15000
    });
}

function funcErrorListaPagamentoTEFSelect(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados do retornoListaPagamentoTEFSelect',
        showConfirmButton: false,
        timer: 15000
    });
}

function alterar_pagamentos() {

    document.getElementById("idpag").style.display = 'block';
    document.getElementById("buttonpag").style.display = 'block';
    document.getElementById("idbuttonalterar").style.display = 'none';
    document.getElementById("idbuttonalterar2").style.display = 'block';

}

function alterar_pagamentos_fechar() {

    document.getElementById("idpag").style.display = 'none';
    document.getElementById("buttonpag").style.display = 'none';
    document.getElementById("idbuttonalterar").style.display = 'block';
    document.getElementById("idbuttonalterar2").style.display = 'none';

}

function soma_ValoresTotais() {

    var vrdistribuir2 = $("#VrDistribuir2").val().replace(".", "").replace(",", ".");
    var vrdin = $("#VrRecDinheiro").val().replace(".", "").replace(",", ".");
    var vrcartao = $("#VrRecCartao").val().replace(".", "").replace(",", ".");
    var vrpos = $("#VrRecPOS").val().replace(".", "").replace(",", ".");
    var vrvoucher = $("#VrRecVoucher").val().replace(".", "").replace(",", ".");

    var somavalores = parseFloat(vrdin) + parseFloat(vrcartao) + parseFloat(vrpos) + parseFloat(vrvoucher);
    var somadifere = parseFloat(vrdistribuir2) - parseFloat(somavalores);

    $("#VrDistribuir").val(mascaraValor(somadifere.toFixed(2)));

}

function inserir_NovoValor() {

    var idresumo = $("#IDResVenda").val();
    var idempresumo = $("#IDEmpResumo").val();

    var vrdistribuir = $("#VrDistribuir").val().replace(".", "").replace(",", ".");
    var vrdistribuir2 = $("#VrDistribuir2").val().replace(".", "").replace(",", ".");
    var vrdin = $("#VrRecDinheiro").val().replace(".", "").replace(",", ".");
    var vrcartao = $("#VrRecCartao").val().replace(".", "").replace(",", ".");
    var vrpos = $("#VrRecPOS").val().replace(".", "").replace(",", ".");
    var vrvoucher = $("#VrRecVoucher").val().replace(".", "").replace(",", ".");

    var tipopagamento = $("#DSTipoPagamentoTEF").val();
    var nuoperacao = $("#NuOperacao").val();
    var nuatorizacao = $("#NuAutorizacao").val();

    var tipopagamentopos = $("#DSTipoPagamentoPOS").val();
    var nuoperacaopos = $("#NuOperacaoPOS").val();
    var nuatorizacaopos = $("#NuAutorizacaoPOS").val();

    var qtdparcelacartao = $("#QtdParcelaCartao").val();
    var dtparcelacartao = $("#DTParcelaCartao").val();
    var qtdparcelapos = $("#QtdParcelaPOS").val();
    var dtparcelapos = $("#DTParcelaPOS").val();
    var nuvoucher = $("#NuVoucher").val();

    //var somavalores = parseFloat(vrdin) + parseFloat(vrcartao) + parseFloat(vrpos) + parseFloat(vrvoucher);

    if (vrdistribuir2 < vrdistribuir) {
        $("#VrRecDinheiro").focus();
        $("#VrRecDinheiro").select();

        alerta_valor_menor_venda();
        return false;
    }

    if (vrdin > 0) {
        //ATUALIZA DINHEIRO NA TABELA DE RESUMO VENDA
        alert(vrdin);
    } else {
        //ATUALIZA DINHEIRO NA TABELA DE RESUMO VENDA

    }

    if (vrcartao > 0) {
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

        if (qtdparcelacartao == 0) {
            //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO

        } else {
            valordivCredito = 0;
            valorresultCredito = 0;
            valorparc = 0;
            valordiv = parseFloat((vrcartao / qtdparcelacartao).toFixed(2));

            for (i = 1; i <= qtdparcelacartao; i++) {

                valorparc += (valordiv);

                if (i == 1) {
                    finalparcelacred = dtparcelacartao;
                } else {

                    dtparccartao = dtparcelacartao.split('-');

                    var dt = new Date(dtparccartao[0], dtparccartao[1], dtparccartao[2]);

                    e = i - 1;
                    finalparcelacredTeste = dt.setMonth(dt.getMonth() + e);

                    var dataParcCartao = new Date(finalparcelacredTeste);
                    var diaParcCartao = dataParcCartao.getDate(); // 1-31
                    var mesParcCartao = dataParcCartao.getMonth(); // 0-11 (zero=janeiro)
                    var ano4ParcCartao = dataParcCartao.getFullYear(); // 4 dígitos
                    diaFormatadoParcCartao = String(diaParcCartao);

                    finalparcelacred = ano4ParcCartao + '-' + (mesParcCartao) + '-' + diaFormatadoParcCartao.padStart(2, '0');

                }

                if (i == qtdparcelacartao) {

                    if (valorparc > vrcartao) {

                        valordivCredito = parseFloat((valorparc - vrcartao).toFixed(2));
                        valorresultCredito = valordiv - valordivCredito;
                    }
                    if (valorparc < vrcartao) {

                        valordivCredito = parseFloat((vrcartao - valorparc).toFixed(2));
                        valorresultCredito = valordiv + valordivCredito;
                    }
                    if (valorparc == vrcartao) {

                        valorresultCredito = valordiv;
                    }
                } else {

                    valorresultCredito = valordiv;
                }

                //INSERE OS RECEBIMENTOS CARTAO NA VENDAPAGAMENTO

                //alert(tipopagamento);
                //alert(nuoperacao);
                //alert(nuatorizacao);
                //alert(qtdparcelacartao);
                //alert(finalparcelacred);
                //alert(valorresultCredito);

            }
        }

    } else {
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

    }

    if (vrpos > 0) {
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

        if (qtdparcelapos == 0) {
            //INSERE RECEBIMENTO CARTAO NA VENDAPAGAMENTO

        } else {
            valordivCreditoPOS = 0;
            valorresultCreditoPOS = 0;
            valorparcPOS = 0;
            valordivPOS = parseFloat((vrpos / qtdparcelapos).toFixed(2));

            for (i = 1; i <= qtdparcelapos; i++) {

                valorparcPOS += (valordivPOS);

                if (i == 1) {
                    finalparcelacredPOS = dtparcelapos;
                } else {

                    dtparcpos = dtparcelapos.split('-');

                    var dtpos = new Date(dtparcpos[0], dtparcpos[1], dtparcpos[2]);

                    e = i - 1;
                    finalparcelaposTeste = dtpos.setMonth(dtpos.getMonth() + e);

                    var dataParcPos = new Date(finalparcelaposTeste);
                    var diaParcPos = dataParcPos.getDate(); // 1-31
                    var mesParcPos = dataParcPos.getMonth(); // 0-11 (zero=janeiro)
                    var ano4ParcPos = dataParcPos.getFullYear(); // 4 dígitos
                    diaFormatadoParcPos = String(diaParcPos);

                    finalparcelacredPOS = ano4ParcPos + '-' + (mesParcPos) + '-' + diaFormatadoParcPos.padStart(2, '0');

                }

                if (i == qtdparcelapos) {

                    if (valorparcPOS > vrpos) {

                        valordivCreditoPOS = parseFloat((valorparcPOS - vrpos).toFixed(2));
                        valorresultCreditoPOS = valordivPOS - valordivCreditoPOS;
                    }
                    if (valorparcPOS < vrpos) {

                        valordivCreditoPOS = parseFloat((vrpos - valorparcPOS).toFixed(2));
                        valorresultCreditoPOS = valordivPOS + valordivCreditoPOS;
                    }
                    if (valorparcPOS == vrpos) {

                        valorresultCreditoPOS = valordivPOS;
                    }
                } else {

                    valorresultCreditoPOS = valordivPOS;
                }

                //INSERE OS RECEBIMENTOS CARTAO NA VENDAPAGAMENTO

                //alert(tipopagamento);
                //alert(nuoperacao);
                //alert(nuatorizacao);
                //alert(qtdparcelacartao);
                //alert(finalparcelacred);
                //alert(valorresultCredito);

            }
        }

    } else {
        //ATUALIZA CARTAO NA TABELA DE RESUMO VENDA

    }

    if (vrvoucher > 0) {
        //ATUALIZA VOUCHER NA TABELA DE RESUMO VENDA

    } else {
        //ATUALIZA VOUCHER NA TABELA DE RESUMO VENDA

    }

}

function alerta_novo_recebimento_sucesso() {
    Swal.fire({
        type: "success",
        title: "Recebimento Alterado com Sucesso.",
        showConfirmButton: false,
        timer: 2500
    });
}

function alerta_valor_menor_venda() {
    Swal.fire({
        type: "warning",
        title: "A soma dos valores é menor que o valor da Venda. ",
        showConfirmButton: false,
        timer: 2500
    });
}

///////////Menu Funcionarios////////////////////////////

function ListaFuncionarios() {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    $("#resultado").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>" +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
    );

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

            $('.dataAtual').text(dataAtual);
            $('#DTInicio').val(dataAtualCampo);
            $('#DTFim').val(dataAtualCampo);

            $("#idloja").select2();

            $('.DescTituloListaVendas').html(
                `<i class='subheader-icon fal fa-chart-area'></i> Lista dos funcionários das Lojas <span class='fw-300'></span>`);

            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch(funcErrorListaEmpresasSelect);
                
            pesq_funcionarios_loja();
        }
    };
    xmlhttp.open("GET", "informatica_action_listafuncionarios.html", true);
    xmlhttp.send();
}

function pesq_funcionarios_loja() {
    dataRetornoFuncionario=[];
    var IDEmpresaPesqVenda = $("#idloja").val();
    var DSNomeFunc = $("#dsNomeFunc").val();
    
    if(DSNomeFunc.length == 11 || DSNomeFunc.length == 14){
        DSNomeFunc = DSNomeFunc.replace(/\D/g, '');
    }
    
    
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.onreadystatechange = function() {

        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultado").innerHTML = xmlhttp.responseText;
            newDataTable('pesqvendas');

            $('.dataAtual').text(dataAtual);

            ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&idEmpresa=' + IDEmpresaPesqVenda + '&dsNomeFunc=' + DSNomeFunc)
                .then(retornoListaFuncionariosLoja)
                .catch(funcError);
        }
    };
    xmlhttp.open("GET", "informatica_action_pesqfuncionariosloja.html", true);
    xmlhttp.send();
}

//funcao para chamar todos funcionarios cadastrados
function chamarProximaListaFuncionario(numPage){
    var IDEmpresaPesqVenda = $("#idloja").val();
    var DSNomeFunc = $("#dsNomeFunc").val();
    ajaxGet('api/informatica/funcionario-loja.xsjs?page='+numPage+'&pagesize=1000&idEmpresa=' + IDEmpresaPesqVenda + '&dsNomeFunc=' + DSNomeFunc)
                .then(retornoListaFuncionariosLoja)
                .catch(funcError);
        
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaFuncionariosLoja(respostaListaFuncionariosLoja) {
    var tableFuncionariosEmpresa = $('#dt-basic-funcionario-loja').DataTable();
    var numPageAtual = parseInt(respostaListaFuncionariosLoja.page);
    
    if(respostaListaFuncionariosLoja.data.length != 0){
        for (var i = 0; i < respostaListaFuncionariosLoja.data.length; i++) {
            registroFuncionario = respostaListaFuncionariosLoja.data[i];
    
            idFuncionario = registroFuncionario['ID'];
            noFuncionario = registroFuncionario['NOFUNCIONARIO'];
            matricula = registroFuncionario['IDFUNCIONARIO'];
            noLogin = registroFuncionario['NOLOGIN'];
            noFuncao = registroFuncionario['DSFUNCAO'];
            DTDemissao = registroFuncionario['DTDEMISSAO'];
            SituacaoFunc = registroFuncionario['STATIVO'];
            TipoFunc = registroFuncionario['DSTIPO'];
            PercDescFunc = registroFuncionario['PERC'];
            cpf = registroFuncionario['NUCPF']; 
            
            if(DTDemissao == null){
                DTDemissao = '';
            }
    
            if(TipoFunc == 'PN'){
                TipoFunc = 'PARCEIRO DE NEGÓCIOS';
            }
            if(TipoFunc == 'PNC'){
                TipoFunc = 'PARCEIRO DE NEGÓCIOS CONVÊNIO';
                if (SituacaoFunc == 'True') {
        			STFuncionario = `<label style="color: blue;">Ativo</label>`;
        			htmlOpcao =   ``;
        		} else {
        			STFuncionario = `<label style="color: red;">Inativo</label>`;
        			htmlOpcao =   ``;
        		}
            }else{
            
        		if (SituacaoFunc == 'True') {
        			STFuncionario = `<label style="color: blue;">Ativo</label>`;
        			htmlOpcao =   `<div class="btn-group btn-group-xs">
        			                    <button type="button" class="btn btn-success btn-xs" title="Alterar" id="` +idFuncionario + `" onclick="modal_funcionario_loja(this.id)" >Alterar</button>
        			                    <button type="button" class="btn btn-primary btn-xs" title="Alterar Desconto Autorizado" id="` +idFuncionario + `" onclick="modal_funcionario_Desconto(this.id)" >Desconto</button>
                                        <!--<button type="button" class="btn btn-info btn-xs" title="Crédito Bônus" id="` +idFuncionario + `" name="` +matricula + `" onclick="modal_funcionario_Bonus(this.name)" >Bônus</button>-->
                                        <button type="button" class="btn btn-danger btn-xs" title="Inativar" id="` +idFuncionario + `" onclick="mudar_status_funcionario(this.id,\'False\')" >Inativar</button>
                                        <button type="button" class="btn btn-warning btn-xs" title="Desligar" id="` +idFuncionario + `" onclick="desligar_funcionario(this.id)" >Desligar</button>
                                  </div>`;
        		} else {
        			STFuncionario = `<label style="color: red;">Inativo</label>`;
        			htmlOpcao =   `<div class="btn-group btn-group-xs">
                                        <button type="button" class="btn btn-danger btn-xs" title="Inativar" id="` +idFuncionario + `" onclick="mudar_status_funcionario(this.id,\'True\')" >Ativar</button>
                                  </div>`;
        		}
            }
    		dataRetornoFuncionario.push( [
    		                    cpf,
    		                    noFuncionario,
                                noLogin,
                                noFuncao,
                                TipoFunc,
                                PercDescFunc,
                                STFuncionario,
                                DTDemissao,
                                htmlOpcao
                                ]);
        }
        chamarProximaListaFuncionario(numPageAtual+1);
    }else{
        $('#resultado').html(
            `<table id="dt-basic-funcionario-loja" class="table table-bordered table-hover table-striped w-100">
                    <thead class="bg-primary-600">
                        <tr>
                            <th width="10%">CPF</th>
                            <th width="30%">Funcionário</th>
                            <th width="10%">Login</th>
                            <th width="15%">Função</th>
                            <th width="10%">Tipo</th>
                            <th width="10%">% Desc.</th>
                            <th width="10%">Situação</th>
                            <th width="10%">DT Desl.</th>
                            <th width="15%"></th>
                        </tr>
                    </thead>
                    <tbody id="resultadoListFuncionario">
                    </tbody>
                    <tfoot class="thead-themed totalProduto">
                    </tfoot>
                </table>`
        );
        
	   $('#dt-basic-funcionario-loja').DataTable( {
            data: dataRetornoFuncionario,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
    
}

//

function ValidaCpf(cpf) {
  cpf = cpf.replace(/[^\d]+/g,'');	
	if(cpf == '') return false;	
	// Elimina CPFs invalidos conhecidos	
	if (cpf.length != 11 || 
		cpf == "00000000000" || 
		cpf == "11111111111" || 
		cpf == "22222222222" || 
		cpf == "33333333333" || 
		cpf == "44444444444" || 
		cpf == "55555555555" || 
		cpf == "66666666666" || 
		cpf == "77777777777" || 
		cpf == "88888888888" || 
		cpf == "99999999999")
    Swal.fire({
      type: 'error',
      title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
      timer: 15000
    })	
    $("#cpfFuncionario").focus();				
	// Valida 1o digito	
	add = 0;	
	for (i=0; i < 9; i ++)		
		add += parseInt(cpf.charAt(i)) * (10 - i);	
		rev = 11 - (add % 11);	
		if (rev == 10 || rev == 11)		
			rev = 0;	
		if (rev != parseInt(cpf.charAt(9)))		
    Swal.fire({
      type: 'error',
      title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
      timer: 15000
    })
    $("#cpfFuncionario").focus();	
	// Valida 2o digito	
	add = 0;	
	for (i = 0; i < 10; i ++)		
		add += parseInt(cpf.charAt(i)) * (11 - i);	
	rev = 11 - (add % 11);	
	if (rev == 10 || rev == 11)	
		rev = 0;	
	if (rev != parseInt(cpf.charAt(10)))
  Swal.fire({
    type: 'error',
    title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
    timer: 15000
  })
  $("#cpfFuncionario").focus();			
	return true;   
}

function modal_funcionario_loja(id) {

    $.get('informatica_action_updatefuncionariomodal.html', function(res) {
 
    $('#resulmodalfuncionario').html(res);
    $('#cadFuncionario').modal({
      backdrop: 'static',
      keyboard: false
    });

    $("#cadFuncionario").modal('show');
    $('#cadFuncionario').on('shown.bs.modal', function () { });

    $('#cadFuncionario').on('shown.bs.modal', function () {
      $(document).off('focusin.modal');
    })
        
        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionario').append(
                `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
            );
        }

        $("#empresaFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });

        $("#tipoFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });
        $("#funcaoFuncionario").select2({
            dropdownParent: $("#cadFuncionario")
        });

        if (id > 0) {
            $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="update_funcionario()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

            ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&id=' + id)
                .then(retornoAtualizaFuncionario)
                .catch(funcError);
        } else {
            // $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="validar_cadastrar_funcionario()">Cadastrar</button>
            // <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
            
             $('.senhaFuncionario').addClass('d-none');
              $('.repeteSenhaFuncionario').addClass('d-none');
              $('#dataAdmissao').val(dataAdmissao);
              $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="validar_cadastrar_funcionario()">Cadastrar</button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        
              ajaxGet('api/informatica/funcionario-ultimoID.xsjs?pagesize=1000&id=')
                .then(retornoUltimoIDFuncionario)
                .catch(funcError);
        }

    })

}

function retornoUltimoIDFuncionario(respostaUltimoIDFuncionario) {
      // 1. Obter a data de admissão original (data atual)
      let dataAdmissaoOriginal = new Date();
      let dataFormatadaOriginal = dataAdmissaoOriginal.toISOString().split('T')[0];
  
      // 2. Calcular intervalo permitido (últimos 45 dias)
      const hoje = new Date();
      const primeiroDiaPermitido = new Date();
      primeiroDiaPermitido.setDate(hoje.getDate() - 45);
      
      // 3. Formatar datas para input[type="date"]
      const formatarData = (date) => date.toISOString().split('T')[0];
  
      // 4. Definir valores mínimos e máximos no input
      $("#dataAdmissao")
        .val(dataFormatadaOriginal)
        .attr("min", formatarData(primeiroDiaPermitido))
        .attr("max", formatarData(hoje))
        .prop('disabled', false);
  
      // 5. Validar data selecionada pelo usuário
      $("#dataAdmissao").on('change', function () {
        const dataSelecionada = new Date(this.value);
        
        if (dataSelecionada < primeiroDiaPermitido || dataSelecionada > hoje) {
          alert("Só é permitido alterar para datas dentro dos últimos 45 dias.");
          this.value = dataFormatadaOriginal;
        }
      });
  
  id = respostaUltimoIDFuncionario.data[0]['ID'];
  $("#IDFuncionarioAtualizar").val(id);
}

function carregaDadosFuncionario(cpf) {
  let cpfFormatado = cpf.replace(/\D/g, '').trim();

  ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&nuCPF=' + cpfFormatado)
    .then(retornoAtualizaFuncionario)
    .catch(funcError);
}

function modal_funcionario_Desconto(id) {

    $.get('informatica_action_updatefuncdescontomodal.html', function(res) {

        $('#resulmodalfuncionario').html(res);
        $("#cadFuncionario").modal('show');
        $('#cadFuncionario').on('shown.bs.modal', function() {});
        
        $('#dtInicioDesc').val(dataAtualCampo);
        $('#dtFimDesc').val(dataAtualCampo);
        
        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionarioDesc').append(
                ` + DSEmpresa + `
            );
        }

        if (id > 0) {
            $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="update_funcionario_desc()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

            ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&id=' + id)
                .then(retornoAtualizaFuncionarioDesconto)
                .catch(funcError);
        }

    })

}

function retornoAtualizaFuncionario(respostaAtualizaFuncionario) {

  if (respostaAtualizaFuncionario.data.length) {
    for (var i = 0; i < respostaAtualizaFuncionario.data.length; i++) {

      if (respostaAtualizaFuncionario.data[i]['STATIVO'] == "True") {

        id = respostaAtualizaFuncionario.data[i]['ID'];
        idFuncionario = respostaAtualizaFuncionario.data[i]['IDFUNCIONARIO']
        nomeFuncionario = respostaAtualizaFuncionario.data[i]['NOFUNCIONARIO']
        nomeEmpresa = respostaAtualizaFuncionario.data[i]['NOFANTASIA']
        loginFunc = respostaAtualizaFuncionario.data[i]['NOLOGIN']

        let idEmpresaFuncionario = respostaAtualizaFuncionario.data[i]['IDEMPRESA']
        funcao = respostaAtualizaFuncionario.data[i]['DSFUNCAO']
        tipo = respostaAtualizaFuncionario.data[i]['DSTIPO']
        cpf = respostaAtualizaFuncionario.data[i]['NUCPF']
        valorSalario = respostaAtualizaFuncionario.data[i]['VALORSALARIO']
        valorPerc = respostaAtualizaFuncionario.data[i]['PERC']
        valorDisponivel = respostaAtualizaFuncionario.data[i]['VALORDISPONIVEL']
        // 1. Obter a data de admissão original
       let dataAdmissaoOriginal = new Date(respostaAtualizaFuncionario.data[i]['DATA_ADMISSAO']);
       let dataFormatadaOriginal = dataAdmissaoOriginal.toISOString().split('T')[0];
       
       // 2. Configurar o campo (SEMPRE habilitado)
       $("#dataAdmissao").val(dataFormatadaOriginal).prop('disabled', false);
       
       // 3. Calcular intervalo do mês atual
       const hoje = new Date();
       const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 45);
       const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
       
      
       const formatarData = (date) => date.toISOString().split('T')[0];
       
      
       $("#dataAdmissao").on('change', function() {
           const dataSelecionada = new Date(this.value);
           
           
           if (dataSelecionada < primeiroDiaMes || dataSelecionada > ultimoDiaMes) {
               alert("Só é permitido alterar para datas dos últimos 45 dias.");
        
               this.value = dataFormatadaOriginal;
           }
       });


      $("#dataAdmissao").on('click', function() {
        this.setAttribute('min', formatarData(primeiroDiaMes));
        this.setAttribute('max', formatarData(ultimoDiaMes));
      });
      
        pass = respostaAtualizaFuncionario.data[i]['PWSENHA']
        stAtivo = respostaAtualizaFuncionario.data[i]['STATIVO']
       
        for (var i = 0; i < listaEmpresas.length; i++) {

          IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
          DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

          $('#empresaFuncionario').append(
            `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
          );
        }

        $("#IDFuncionarioAtualizar").val(id);
        $("#nomefuncionario").val(nomeFuncionario);

        $("#codigoFuncionario").val(idFuncionario);
        if (dataAdmissao) {
          let date = new Date(dataAdmissao);
          let formattedDate = date.toISOString().split('T')[0];
          $('#dataAdmissao').val(formattedDate);
        }
        
        $('#empresaFuncionario').val(idEmpresaFuncionario);
        $('#empresaFuncionario').trigger('change');
        $("#loginFuncionario").val(loginFunc);

        $("#senhaFuncionario").val(pass);
        $("#repeteSenhaFuncionario").val(pass);

        $("#funcaoFuncionario").val(funcao);
        $('#funcaoFuncionario').trigger('change');

        $("#tipoFuncionario").val(tipo);
        $('#tipoFuncionario').trigger('change');

        $('#stativofunc').val(stAtivo)
        $('#stativofunc').trigger('change');

        $("#cpfFuncionario").val(cpf);
        $("#CPFCadastrado").val(cpf);
        $("#valorSalFunc").val(valorSalario);
        $("#percDescFunc").val(valorPerc);
        $("#valorDescFunc").val(valorDisponivel);

        $('#nomefuncionario').attr('readonly', false);
        $('#empresaFuncionario').attr('disabled', false);
        $('#cpfFuncionario').attr('readonly', true);
        $('#funcaoFuncionario').attr('disabled', false);

        $("#footerfuncionario").html(`<button type="button" class="btn btn-success" onclick="update_funcionario()">Atualizar</button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        
        break
      }
    }
  }
}

function retornoAtualizaFuncionarioDesconto(respostaAtualizaFuncionarioDesc) {

    for (var i = 0; i < respostaAtualizaFuncionarioDesc.data.length; i++) {
        idDesc = respostaAtualizaFuncionarioDesc.data[i]['ID'];
        idFuncionarioDesc = respostaAtualizaFuncionarioDesc.data[i]['IDFUNCIONARIO']
        nomeFuncionarioDesc = respostaAtualizaFuncionarioDesc.data[i]['NOFUNCIONARIO']
        nomeEmpresaDesc = respostaAtualizaFuncionarioDesc.data[i]['NOFANTASIA']

        let idEmpresaFuncionarioDesc = respostaAtualizaFuncionarioDesc.data[i]['IDEMPRESA']
        cpfDesc = respostaAtualizaFuncionarioDesc.data[i]['NUCPF']
        valorPercAutorizado = respostaAtualizaFuncionarioDesc.data[i]['PERCDESCUSUAUTORIZADO']
        dtIniDesc = respostaAtualizaFuncionarioDesc.data[i]['DTINICIODESC']
        dtFimDesc = respostaAtualizaFuncionarioDesc.data[i]['DTFIMDESC']

        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionarioDesc').append( 
                ` + DSEmpresa + `
            );
        }

        $("#IDFuncionarioAtualizarDesc").val(idDesc);
        $("#nomefuncionarioDesc").val(nomeFuncionarioDesc);
        
        $('#empresaFuncionarioDesc').val(idEmpresaFuncionarioDesc);

        $("#cpfFuncionarioDesc").val(cpfDesc);
        $("#percDescFuncAlt").val(valorPercAutorizado);
        
        $('#dtInicioDesc').val(dtIniDesc);
        $('#dtFimDesc').val(dtFimDesc);
    }
}

// function retornoCadastrarFuncionario(respostaCadastroFuncionario) {

//     idFuncionario = 0;
//     nomeFuncionario = '';
//     matricula = '';
//     cpf = 0;

//     id = $("#IDFuncionarioAtualizar").val();
//     var NLoginAtualizar = $("#loginFuncionario").val();
//     var NSenhaAtualizar = $("#repeteSenhaFuncionario").val();
//     var SenhaAtualizar = $("#senhaFuncionario").val();
//     var nomefuncionario = $("#nomefuncionario").val();
//     var cpfFuncionario = $("#cpfFuncionario").val().replace(/\D/g, '').trim();
//     var cpfCadastrado = $("#CPFCadastrado").val();
//     var funcaoFuncionario = $("#funcaoFuncionario").val();
//     var TipoFuncionario = $("#tipoFuncionario").val();
//     var vrsalarioFuncionario = $("#valorSalFunc").val().replace(".", "").replace(",", ".");
//     var vrdesconto = $("#percDescFunc").val().replace(".", "").replace(",", ".");
//     var vrdisponivel = $("#valorDescFunc").val().replace(".", "").replace(",", "."); 
//     var empresaFuncionario = $("#empresaFuncionario").val();
//     var idfuncionarioNovo = $("#codigoFuncionario").val();
//     var STAtivo = $("#stativofunc").val();
//     var cpfFuncionarioSemMask = cpfFuncionario;
//     cpfFuncionarioSemMask = cpfFuncionarioSemMask.replace(/\D/g, '').trim();
//     idNovo = parseFloat(id) + 1;

//     if(respostaCadastroFuncionario.data.length){ 
//             idFuncionario = respostaCadastroFuncionario.data[0]['IDFUNCIONARIO'];
//             nomeFuncionario = respostaCadastroFuncionario.data[0]['NOFUNCIONARIO'];
//             matricula = respostaCadastroFuncionario.data[0]['NOLOGIN'];
//             cpf = respostaCadastroFuncionario.data[0]['NUCPF'];
//     }

//         if(cpf == cpfFuncionarioSemMask && respostaCadastroFuncionario.data.length){
//             $("#cadFuncionario").modal('hide');
//             Swal.fire({
//                 type: "error",
//                 title: 'Já existe um Colaborador cadastrado com esse CPF! Nome: '+nomeFuncionario+' - Matrícula: '+matricula + " , Porém, está INATIVO ou foi DESLIGADO, Ative o Funcionário e tente novamente",
//                 showConfirmButton: false,
//                 timer: 10000
//             });
//         }else{
//             if(!empresaFuncionario){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe a Empresa do Funcionário!</div>"
//         		);
//         		$("#empresaFuncionario").focus();
//         		return false;
//             }
//             if(!funcaoFuncionario){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe a Função do Funcionário!</div>"
//         		);
//         		$("#funcaoFuncionario").focus();
//         		return false;
//             }
//             if(!TipoFuncionario){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe o Tipo do Funcionário!</div>"
//         		);
//         		$("#tipoFuncionario").focus();
//         		return false;
//             }
//             if(!cpfFuncionario){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe CPF do Funcionário!</div>"
//         		);
//         		$("#cpfFuncionario").focus();
//         		return false;
//             }
            
            
            
//             if(ValidaCPF()== false){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> CPF do Funcionário Inválido!</div>"
//         		);
//         		$("#cpfFuncionario").focus();
//         		return false;
//             }
            
//             if(!nomefuncionario){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe Nome do Funcionário!</div>"
//         		);
//         		$("#nomefuncionario").focus();
//         		return false;
//             }
            
//             if(!vrdesconto){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe o Desconto do Funcionário!</div>"
//         		);
//         		$("#percDescFunc").focus();
//         		return false;
//             }
            
//             if(!SenhaAtualizar || !NSenhaAtualizar){
//             	$("#NotificacaoModalFuncionario").html(
//         			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
//         			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
//         			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
//         			"</button>" +
//         			"<strong>Atenção!</strong> Informe corretamente os campos da senha do Funcionário!</div>"
//         		);
//         		$("#senhaFuncionario").focus();
//         		return false;
//             }
            
//             //  var dados = [{ 
//             //     "IDFUNCIONARIO": parseInt(idNovo),
//             //     "IDSUBGRUPOEMPRESARIAL": parseInt(idSubGrupoEmpresarial),
//             //     "IDEMPRESA": parseInt(empresaFuncionario),
//             //     "NOFUNCIONARIO": nomefuncionario,
//             //     "NUCPF": cpfFuncionarioSemMask,
//             //     "NOLOGIN": idNovo.toString(),
//             //     "PWSENHA": NSenhaAtualizar,
//             //     "DSFUNCAO": funcaoFuncionario,
//             //     "VALORSALARIO": parseFloat(vrsalarioFuncionario),
//             //     "PERC": parseFloat(vrdesconto),
//             //     "STATIVO":'True',
//             //     "DSTIPO": TipoFuncionario,
//             //     "VALORDISPONIVEL": parseFloat(vrdisponivel),
//             //     STCONVENIO,
//             //     STDESCONTOFOLHA
//             // }];
            
//             var dados = [{ 
//                 "IDEMPRESA": parseInt(empresaFuncionario),
//                 "NOFUNCIONARIO": nomefuncionario.toUpperCase(),
//                 "NUCPF": cpfFuncionario,
//                 "NOLOGIN": idNovo.toString(),
//                 "PWSENHA": NSenhaAtualizar,
//                 "DSFUNCAO": funcaoFuncionario,
//                 "VALORSALARIO": parseFloat(vrsalarioFuncionario),
//                 "PERC": parseFloat(vrdesconto),
//                 "STATIVO":'True',
//                 "DSTIPO": TipoFuncionario,
//                 "VALORDISPONIVEL": parseFloat(vrdisponivel)
//             }];
    
//             if (SenhaAtualizar == NSenhaAtualizar && !respostaCadastroFuncionario.data.length) {
             

//                     ajaxPost("api/informatica/funcionario-loja.xsjs", dados)
//                         .then(funcSucessPostFuncionario)
//                         .catch(funcError);
                        
//                     	const textdados = JSON.stringify(dados);
                    
//                     	textoFuncao = 'INFORMATICA/CADASTRO DE FUNCIONARIOS';
                    
//                         var dadosCadFunc = [{
                            
//                             "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
//                             "PATHFUNCAO":textoFuncao,
//                             "DADOS":textdados,
//                             "IP":ipCliente
//                         }];
                    
//                       	ajaxPost("api/log-web.xsjs", dadosCadFunc)
//                     		.then(funcSucessLog)
//                     		.catch(funcError);

//             }else{
//                 Swal.fire({
//                     type: "error",
//                     title: 'Campo Senha não confere com o campo Repete Senha!',
//                     showConfirmButton: false,
//                     timer: 15000
//                 });
//             }
//         }
// }

function abrirModalLogin() {
  Swal.fire({
      title: 'Faça login para continuar',
      html: `
          <div>
              <label class="form-label" for="matricula">Matrícula</label>
              <div class="input-group">
                  <input type="text" id="matricula" class="swal2-input" placeholder="Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
              </div>
              <label class="form-label" for="senha">Senha</label>
              <div class="input-group">
                  <input type="password" id="senha" class="swal2-input" placeholder="Senha" style="text-align: center;">
              </div>
          </div>
      `,
      width: '20rem',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Voltar',
      cancelButtonColor: '#3085d6',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
          let matricula = $('#matricula').val().replace(/\D/g, "").trim();
          let senha = $('#senha').val();

          if (!matricula || !senha) {
              Swal.showValidationMessage('Campo de Matrícula ou senha vazio');
              return false;
          }

          try {
              const response = await ajaxGet(`api/funcionario/todos.xsjs?matricula=${matricula}&senha=${senha}`);

              if (!response.data.length) {
                  $('#matricula').val("").focus();
                  $('#senha').val("");
                  throw new Error("Matrícula ou Senha inválidos! Tente novamente");
              }

              const idFuncionario = response.data[0]["IDFUNCIONARIO"];

              // Implemente a lógica de autorização aqui se necessário

              return true;
          } catch (error) {
              Swal.showValidationMessage(error);
          }
      },
      allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
      if (result.dismiss == 'timer') {
          Swal.fire({
              icon: 'error',
              title: `Tempo de resposta ou inatividade atingido`,
              timer: 10000,
          });
      } else if (result.dismiss == 'cancel') {
          return false;
      } else {
          // Se o login for bem-sucedido, mostrar a div para inserir o percentual de desconto
          $('#percDescFuncDiv').css('display', 'block');
          // $('#percDescFunc').css('display', 'none')
      }
  });
}

function retornoCadastrarFuncionario(respostaCadastroFuncionario) {
  let idFuncionario = 0;
  let nomeFuncionario = '';
  let matricula = '';
  let cpf = 0;

  let id = $("#IDFuncionarioAtualizar").val();
  let NLoginAtualizar = $("#loginFuncionario").val();
  let NSenhaAtualizar = $("#repeteSenhaFuncionario").val();
  let SenhaAtualizar = $("#senhaFuncionario").val();
  let nomefuncionario = $("#nomefuncionario").val();
  let cpfFuncionario = $("#cpfFuncionario").val().replace(/\D/g, '').trim();
  let cpfCadastrado = $("#CPFCadastrado").val();
  let funcaoFuncionario = $("#funcaoFuncionario").val();
  let TipoFuncionario = $("#tipoFuncionario").val();
  let vrsalarioFuncionario = $("#valorSalFunc").val().replace(".", "").replace(",", ".");
  let vrdesconto = $("#percDescFunc").val().replace(".", "").replace(",", ".");
  let vrdisponivel = $("#valorDescFunc").val().replace(".", "").replace(",", ".");
  let empresaFuncionario = $("#empresaFuncionario").val();
  let idfuncionarioNovo = $("#codigoFuncionario").val();
  let STAtivo = $("#stativofunc").val();
  let cpfFuncionarioSemMask = cpfFuncionario.replace(/\D/g, '').trim();
  let idNovo = parseFloat(id) + 1;

  let dataAdmissao = $("#dataAdmissao").val();
  let dataBase = new Date('2024-08-01');
  let diferencaDias = Math.floor((dataBase - new Date(dataAdmissao)) / (1000 * 60 * 60 * 24));

  let maxDesconto = 0;
  if (diferencaDias < 90) {
      maxDesconto = 10;
  } else if (diferencaDias >= 90 && diferencaDias < 365) {
      maxDesconto = 15;
  } else if (diferencaDias >= 365 && diferencaDias < 730) {
      maxDesconto = 20;
  }

  if (respostaCadastroFuncionario.data.length) {
      idFuncionario = respostaCadastroFuncionario.data[0]['IDFUNCIONARIO'];
      funcao = respostaCadastroFuncionario.data[0]['DSFUNCAO'];
      nomeFuncionario = respostaCadastroFuncionario.data[0]['NOFUNCIONARIO'];
      matricula = respostaCadastroFuncionario.data[0]['NOLOGIN'];
      cpf = respostaCadastroFuncionario.data[0]['NUCPF'];
  }

  if (cpf == cpfFuncionarioSemMask && respostaCadastroFuncionario.data.length) {
      $("#cadFuncionario").modal('hide');
      Swal.fire({
          icon: "error",
          title: `Já existe um Colaborador cadastrado com esse CPF! Nome: ${nomeFuncionario} - Matrícula: ${matricula}, Porém, está INATIVO ou foi DESLIGADO. Ative o Funcionário e tente novamente`,
          showConfirmButton: false,
          timer: 10000
      });
  } else {
      if (!empresaFuncionario) {
          $("#NotificacaoModalFuncionario").html(`
              <div class="alert alert-danger alert-dismissible fade show" role="alert">
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                      <span aria-hidden="true"><i class="fal fa-times"></i></span>
                  </button>
                  <strong>Atenção!</strong> Informe a Empresa do Funcionário!
              </div>
          `);
          $("#empresaFuncionario").focus();
          return false;
      }

      const isAuthorized = funcaoFuncionario == 'TI';

      if (parseFloat(vrdesconto) > maxDesconto) {
          Swal.fire({
              title: 'Autorização',
              html: `
                  <div>
                      <label class="form-label" for="matricula">Matrícula</label>
                      <div class="input-group">
                          <input type="text" id="matricula" class="swal2-input" placeholder="Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
                      </div>
                      <label class="form-label" for="senha">Senha</label>
                      <div class="input-group">
                          <input type="password" id="senha" class="swal2-input" placeholder="Senha" style="text-align: center;">
                      </div>
                  </div>
              `,
              width: '20rem',
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Confirmar',
              cancelButtonText: 'Voltar',
              cancelButtonColor: '#3085d6',
              showLoaderOnConfirm: true,
              preConfirm: async () => {
                  let matricula = $('#matricula').val().replace(/\D/g, "").trim();
                  let senha = $('#senha').val();

                  if (!matricula || !senha) {
                      Swal.showValidationMessage('Campo de Matrícula ou senha vazio');
                      return false;
                  }

                  try {
                      const response = await ajaxGet(`api/funcionario/todos.xsjs?matricula=${matricula}&senha=${senha}`);

                      if (!response.data.length) {
                          $('#matricula').val("").focus();
                          $('#senha').val("");
                          throw new Error("Matrícula ou Senha inválidos! Tente novamente");
                      }

                      const funcao = response.data[0]["DSFUNCAO"];

                      if (funcao !== 'TI') {
                          throw new Error("Acesso não autorizado para modificar PERC maior que 20!");
                      }

                      if (parseFloat(vrdesconto) > 50) {
                          throw new Error("Valor desconto maior que permitido!");
                      }

                      return true;
                  } catch (error) {
                      Swal.showValidationMessage(error);
                  }
              },
              allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
              if (result.dismiss == 'timer') {
                  Swal.fire({
                      icon: 'error',
                      title: `Tempo de resposta ou inatividade atingido`,
                      timer: 10000,
                  });
              } else if (result.dismiss == 'cancel') {
                  return false;
              } else {
                  // Prosseguir com o salvamento dos dados
                  salvarDadosFuncionario({
                    idNovo,
                    empresaFuncionario,
                    nomefuncionario,
                    cpfFuncionario,
                    NSenhaAtualizar,
                    funcaoFuncionario,
                    vrsalarioFuncionario,
                    vrdesconto,
                    STAtivo,
                    TipoFuncionario,
                    vrdisponivel,
                    dataAdmissao
                  });
              }
          });

          return false; // prevent form submission
      }

      
      salvarDadosFuncionario({
        idNovo,
        empresaFuncionario,
        nomefuncionario,
        cpfFuncionario,
        NSenhaAtualizar,
        funcaoFuncionario,
        vrsalarioFuncionario,
        vrdesconto,
        STAtivo,
        TipoFuncionario,
        vrdisponivel,
        dataAdmissao
      });
  }
}

function salvarDadosFuncionario(dados) {
  
  var dadosFuncionario = [{
    "IDFUNCIONARIO": parseInt(dados.idNovo),
    "IDEMPRESA": parseInt(dados.empresaFuncionario),
    "NOFUNCIONARIO": dados.nomefuncionario,
    "NUCPF": dados.cpfFuncionario,
    "NOLOGIN": dados.idNovo,
    "PWSENHA": dados.NSenhaAtualizar,
    "DSFUNCAO": dados.funcaoFuncionario,
    "VALORSALARIO": parseFloat(dados.vrsalarioFuncionario || 0),
    "PERC": parseFloat(dados.vrdesconto || 0),
    "STATIVO": 'True',
    "DSTIPO": dados.TipoFuncionario,
    "VALORDISPONIVEL": parseFloat(dados.vrdisponivel || 0),
    "STLOJA": dados.stLoja,
    "DATA_ADMISSAO": dados.dataAdmissao,
  }];

  ajaxPost("api/informatica/funcionario-loja.xsjs", dadosFuncionario)
      .then(funcSucessPostFuncionario)
      .catch(funcError);

  const textDados = JSON.stringify(dadosFuncionario);
  const textoFuncao = 'INFORMATICA/CADASTRO DE FUNCIONARIOS';

  var dadosLogFunc = [{
      "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
      "PATHFUNCAO": textoFuncao,
      "DADOS": textDados,
      "IP": ipCliente
  }];

  ajaxPost("api/log-web.xsjs", dadosLogFunc)
      .then(funcSucessLog)
      .catch(funcError);
}

function validar_cadastrar_funcionario() {

    cpfFuncionario = $("#cpfFuncionario").val().replace(/\D/g, '').trim();
    
    empresaFuncionario = $("#empresaFuncionario").val();
    funcaoFuncionario = $("#funcaoFuncionario").val();
    tipoFuncionario = $("#tipoFuncionario").val();
    
    if(!empresaFuncionario){
    	$("#NotificacaoModalFuncionario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Empresa do Funcionário!</div>"
		);
		$("#empresaFuncionario").focus();
		return false;
    }
    
    if(!funcaoFuncionario){
    	$("#NotificacaoModalFuncionario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe a Função do Funcionário!</div>"
		);
		$("#funcaoFuncionario").focus();
		return false;
    }
    
    if(!tipoFuncionario){
    	$("#NotificacaoModalFuncionario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o Tipo do Funcionário!</div>"
		);
		$("#tipoFuncionario").focus();
		return false;
    }
    
     if(!cpfFuncionario.length){
    	$("#NotificacaoModalFuncionario").html(
			"<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
			"<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
			"<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
			"</button>" +
			"<strong>Atenção!</strong> Informe o CPF do Funcionário!</div>"
		);
		$("#cpfFuncionario").focus();
		
      ValidaCpf(cpfFuncionario)
      return false;
    }
      ajaxGet('api/informatica/funcionario-loja.xsjs?pagesize=1000&nuCPF=' + cpfFuncionario)
      .then(retornoCadastrarFuncionario)
      .catch(funcError);
    
   
}

function formatInputValor(element){
  let valor = element.value;

  valor = valor.replace(/\D/g, '').replace(/(\d)(\d{2})$/, '$1.$2');

  return $(element).val(valor);
}

function update_funcionario() {
  let tipoContratacao = $('#radioCLT:checked')?.length ? 'True' : $('#radioPJ:checked')?.length ? 'False' : null;
  let id = $("#IDFuncionarioAtualizar").val();
  let NLoginAtualizar = $("#loginFuncionario").val();
  let NSenhaAtualizar = $("#repeteSenhaFuncionario").val();
  let SenhaAtualizar = $("#senhaFuncionario").val();
  let vrsalarioFuncionario = $("#valorSalFunc").val().replace(".", "").replace(",", ".");
  let vrdisponivel = $("#valorDescFunc").val().replace(".", "").replace(",", ".");
  let nomefuncionario = $("#nomefuncionario").val();
  let cpfFuncionario = $("#cpfFuncionario").val();
  let cpfCadastrado = $("#CPFCadastrado").val();
  let funcaoFuncionario = $("#funcaoFuncionario").val();
  let TipoFuncionario = $("#tipoFuncionario").val();
  let idSubGrupoEmpresarial = $("#empresaFuncionario").select2('data')[0]['title'];
  let empresaFuncionario = $("#empresaFuncionario").val();
  let idFuncionario = $("#codigoFuncionario").val();
  let STAtivo = $("#stativofunc").val();
  let stLoja = $('#tpLocalizacaoFunc').val() || null;
  let STCONVENIO = tipoContratacao;
  let STDESCONTOFOLHA = tipoContratacao;
  let vrdesconto = $("#percDescFunc").val();
  let motivodesc = $("#descMotivoDesconto").val();
  let idFuncAlteracao = IDFuncionarioLogin;


  if (NLoginAtualizar > 0) {
    NLoginAtualizar = NLoginAtualizar;
  } else {
    NLoginAtualizar = idFuncionario;
  }
  let dataAdmissao = $("#dataAdmissao").val();
  let dataBase = new Date('2024-08-01');
  let diferencaDias = Math.floor((new Date(dataAdmissao)) / (1000 * 60 * 60 * 24));

  let maxDesconto = 0;
  if (diferencaDias < 90) {
      maxDesconto = 10;
  } else if (diferencaDias >= 90 && diferencaDias < 365) {
      maxDesconto = 15;
  } else if (diferencaDias >= 365 && diferencaDias < 730) {
      maxDesconto = 20;
  }

  if (parseFloat(vrdesconto) > maxDesconto) {
      Swal.fire({
          title: 'Autorização',
          html: `
              <div>
                  <label class="form-label" for="matricula">Matrícula</label>
                  <div class="input-group">
                      <input type="text" id="matricula" class="swal2-input" placeholder="Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
                  </div>
                  <label class="form-label" for="senha">Senha</label>
                  <div class="input-group">
                      <input type="password" id="senha" class="swal2-input" placeholder="Senha" style="text-align: center;">
                  </div>
              </div>
          `,
          width: '20rem',
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: 'Confirmar',
          cancelButtonText: 'Voltar',
          cancelButtonColor: '#3085d6',
          showLoaderOnConfirm: true,
          preConfirm: async () => {
              let matricula = $('#matricula').val().replace(/\D/g, "").trim();
              let senha = $('#senha').val();

              if (!matricula || !senha) {
                  Swal.showValidationMessage('Campo de Matrícula ou senha vazio');
                  return false;
              }

              try {
                  const response = await ajaxGet(`api/funcionario/todos.xsjs?matricula=${matricula}&senha=${senha}`);

                  if (!response.data.length) {
                      $('#matricula').val("").focus();
                      $('#senha').val("");
                      throw new Error("Matrícula ou Senha inválidos! Tente novamente");
                  }

                  const funcao = response.data[0]["DSFUNCAO"];

                  if (funcao !== 'TI') {
                      throw new Error("Acesso não autorizado para modificar PERC maior que 20!");
                  }

                  if (parseFloat(vrdesconto) > 50) {
                      throw new Error("Valor desconto maior que permitido!");
                  }

                  return true;
              } catch (error) {
                  Swal.showValidationMessage(error);
              }
          },
          allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
          if (result.dismiss == 'timer') {
              Swal.fire({
                  icon: 'error',
                  title: `Tempo de resposta ou inatividade atingido`,
                  timer: 10000,
              });
          } else if (result.dismiss == 'cancel') {
              return false;
          } else {
              // Prosseguir com o salvamento dos dados
              atualizarDadosFuncionario({
                empresaFuncionario,
                  nomefuncionario,
                  cpfFuncionario,
                  NSenhaAtualizar,
                  funcaoFuncionario,
                  vrsalarioFuncionario,
                  vrdesconto,
                  TipoFuncionario,
                  STAtivo,
                  id,
                  dataAdmissao: $("#dataAdmissao").val(),
  
              });
          }
      });

      return false; // prevent form submission
  }

  atualizarDadosFuncionario({
        empresaFuncionario,
      nomefuncionario,
      cpfFuncionario,
      NSenhaAtualizar,
      funcaoFuncionario,
      vrsalarioFuncionario,
      vrdesconto,
      TipoFuncionario,
      STAtivo,
      id,
      dataAdmissao: $("#dataAdmissao").val(),
  });
}

function atualizarDadosFuncionario(dados) {
  var dadosFuncionario = [{
    "IDEMPRESA": parseInt(dados.empresaFuncionario),
    "NOFUNCIONARIO": dados.nomefuncionario,
    "NUCPF": dados.cpfFuncionario,
    "NOLOGIN": dados.NLoginAtualizar,
    "PWSENHA": dados.NSenhaAtualizar,
    "DSFUNCAO": dados.funcaoFuncionario,
    "VALORSALARIO": parseFloat(dados.vrsalarioFuncionario || 0),
    "PERC": parseFloat(dados.vrdesconto || 0),
    "STATIVO": dados.STAtivo,
    "DSTIPO": dados.TipoFuncionario,
    "VALORDISPONIVEL": parseFloat(dados.vrdisponivel) || 0,
    "ID": parseInt(dados.id),
    "DATA_ADMISSAO": dados.dataAdmissao,
  }];
  
  ajaxPut("api/informatica/funcionario-loja.xsjs", dadosFuncionario)
  .then(funcSucessPostFuncionario)
  .catch(funcError);
  console.log(dadosFuncionario, 'dados')

  const textDados = JSON.stringify(dadosFuncionario);
  const textoFuncao = 'INFORMATICA/UPDATE DE FUNCIONARIOS';

  var dadosLogFunc = [{
      "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
      "PATHFUNCAO": textoFuncao,
      "DADOS": textDados,
      "IP": ipCliente
  }];

  ajaxPost("api/log-web.xsjs", dadosLogFunc)
      .then(funcSucessLog)
      .catch(funcError);
}


function update_funcionario_desc() {
    
    id = $("#IDFuncionarioAtualizarDesc").val();
    var vrdescontoauto = $("#percDescFuncAlt").val().replace(".", "").replace(",", ".");
    var dtinidesc = $("#dtInicioDesc").val();
    var dtfimdesc = $("#dtFimDesc").val();
    var motivodesc = $("#descMotivoDesconto").val();
    var idFuncAlteracao = IDFuncionarioLogin;

    if(vrdescontoauto > 100) {
        Swal.fire({
            type: "error",
            title: "O Desconto Autorizado não pode ser maior que 100% !",
            showConfirmButton: false,
            timer: 5000
        });
        $("#percDescFuncAlt").focus();
        return false;
    }
    
    var dados = [{
        "ID": parseInt(id),
        "DTINICIODESC": dtinidesc,
        "DTFIMDESC": dtfimdesc,
        "PERCDESCUSUAUTORIZADO": parseFloat(vrdescontoauto),
        "MOTIVODESC": motivodesc,
        "IDFUNCALTERACAO": parseInt(idFuncAlteracao)
    }];

    console.log(dados);

            ajaxPut("api/informatica/funcionario-desconto.xsjs", dados)
                .then(funcSucessUpdateFuncionario)
                .catch(funcError);
                
                    	const textdados = JSON.stringify(dados);
                    
                    	textoFuncao = 'INFORMATICA/EDIÇÃO DE DESCONTO DE FUNCIONARIOS';
                    
                        var dadosEditFuncDesc = [{
                            
                            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                            "PATHFUNCAO":textoFuncao,
                            "DADOS":textdados,
                            "IP":ipCliente
                        }];
                    
                      	ajaxPost("api/log-web.xsjs", dadosEditFuncDesc)
                    		.then(funcSucessLog)
                    		.catch(funcError);

}

//================ PRODUTOS PREÇOS ==============================================
 
function ListaProdutoPreco(){
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
        $("#resultado").html(
          "<div align=\"center\">" +
          "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
          "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
          "</div>"
        ); 
        
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) { 
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
        
        	$("#idmarca").select2();
        	$("#idloja").select2();
        	
            $('.DescTituloListaVendas').html(
			`<i class='subheader-icon fal fa-chart-area'></i> Lista de Produtos - <span class='fw-300'></span>`);

        	ajaxGet('api/informatica/grupoempresas.xsjs')
                        .then(retornoListaGrupoEmpresasSelectVendedor)
                        .catch(funcError);

      }
    };
    xmlhttp.open("GET", "informatica_produtos_preco.html", true);
    xmlhttp.send();
}

function retornoListaGrupoEmpresasSelectVendedor(respostaGrupoEmpresas) {

	for (var i = 0; i < respostaGrupoEmpresas.data.length; i++) {

		IDGrupo = respostaGrupoEmpresas.data[i]['IDGRUPOEMPRESARIAL'];
		DSGrupo = respostaGrupoEmpresas.data[i]['GRUPOEMPRESARIAL'];

			$('#idmarca').append(
				`<option value="` + IDGrupo + `"> ` + DSGrupo + `</option>`
			);
	}
}

function selecionamarcavendedor(){
    
    $("#idloja").empty();
    
    idmarca = $('#idmarca').val();

    ajaxGet('api/comercial/empresa.xsjs?idmarca=' + idmarca)
	.then(retornoListaEmpresasSelect)
	.catch(funcError);
}

function retornoListaEmpresasSelect(respostaListaEmpresas) { 
    listaEmpresas = respostaListaEmpresas.data;
    $("#idloja").empty();
    $('#idloja').append(
	    `<option value="">Selecione ...</option>`
	);
	for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

			$('#idloja').append(
			    `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
			);
	}
	
}


function pesq_produto_preco(numPage){
    
    dataRetornoProdutoPreco=[];
    contador = 0;

    var descricaoProduto = $("#dsProduto").val();
    
    var idgrupo = $("#idmarca").val();

  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });

    if (idempresa == 0) {
  
        alert("Atenção! É preciso selecionar a  Empresa.");
        $("#idmarca").focus();
        return false;
    } 
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    xmlhttp.onreadystatechange = function () {
        
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        
        $('.dataAtual').text(dataAtual);
      
        ajaxGet('api/informatica/produto-preco.xsjs?page='+numPage+'&idEmpresa=' + idempresa + '&dsProduto='+descricaoProduto)
        	.then(retornoListaProdutoPreco)
        	.catch(funcError);
      }
    };
    
    xmlhttp.open("GET", "informatica_action_pesqprodutopreco.html", true);
    xmlhttp.send();
} 

function chamarProximaListaProdutoPreco(numPage){ 
    
    var idgrupo = $("#idmarca").val();
    var descricaoProduto = $("#dsProduto").val();
  	var idempresa = [];
    $('#idloja option:selected').each(function (index, el) {
        idempresa.push($(el).val());
    });
    
        ajaxGet('api/informatica/produto-preco.xsjs?page='+numPage+'&idEmpresa=' + idempresa + '&dsProduto='+descricaoProduto)
        	.then(retornoListaProdutoPreco)
        	.catch(funcError);
        	
    $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
    );
}

function retornoListaProdutoPreco(respostaListaProdutoPreco) {

    var numPageAtual = parseInt(respostaListaProdutoPreco.page);
    if(respostaListaProdutoPreco.data.length != 0){
        for (var i=0; i < respostaListaProdutoPreco.data.length; i++) { 
            contador ++;
            var registro = respostaListaProdutoPreco.data[i];
            Codigo = registro.CODIGO_ITEM;
            CodBarras = registro.CODIGO_BARRAS;
            DsProduto = registro.DESCRICAO_ITEM; 
            VrCusto = parseFloat(registro.PRECO_CUSTO);
            VrSap = parseFloat(registro.PRECO_VENDA_SAP);
            VrQuality = parseFloat(registro.PRECO_VENDA_PDV);
            DtUltAlteracao = registro.DATA_ULTIMA_ALTERACAO_PDV;

              dataRetornoProdutoPreco.push( [contador,
                                Codigo,
                                CodBarras,
                                DsProduto,
                                VrCusto.toFixed(2),
                                VrSap.toFixed(2),
                                VrQuality.toFixed(2),
                                DtUltAlteracao]);
        }
        
       //alert(dataVendaProdutoConsolidado[0]['DATAEMISSAO']);
        chamarProximaListaProdutoPreco(numPageAtual + 1); 
    }else{
         $('#resultado').html(
            `<table id="dt-buttons-produto-preco" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                <thead class="bg-primary-600">
                    <tr>
                        <th>*</th>
                        <th>Código</th>
                        <th>Código Barras</th>
                        <th>Descrição</th>
                        <th>Preço Custo</th>
                        <th>Preço SAP</th>
                        <th>Preço Quality</th>
                        <th>Alterado</th>
                    </tr>
                </thead>
                <tbody id="resultadoListProdutoPreco">
                </tbody>
                <tfoot id="totalprodutopreco"class="thead-themed">
                </tfoot>
            </table>`
        );
        
         $('#dt-buttons-produto-preco').DataTable( {
            data: dataRetornoProdutoPreco,
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
    }
    
       
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function modal_funcionario_Bonus(id) {

    $.get('informatica_action_updatefuncbonusmodal.html', function(res) {

        $('#resulmodalbonusfuncionario').html(res);
        $("#cadBonusFuncionario").modal('show');
        $('#cadBonusFuncionario').on('shown.bs.modal', function() {});
        
        $('#dtInicioDesc').val(dataAtualCampo);
        $('#dtFimDesc').val(dataAtualCampo);
        
        for (var i = 0; i < listaEmpresas.length; i++) {

            IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
            DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

            $('#empresaFuncionarioDesc').append(
                ` + DSEmpresa + `
            );
        }

        if (id > 0) {
            $("#footerBonusfuncionario").html(`<button type="button" class="btn btn-success" onclick="gravar_funcionario_bonus()">Creditar(R$)</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

            ajaxGet('api/pdv-novo/funcionario-extrato/saldo.xsjs?pageSize=1&idFuncionario=' + id)
                .then(retornoFuncionarioSaldoBonus)
                .catch(funcError);
        }

    })

}

function retornoFuncionarioSaldoBonus(respostaFuncionarioSaldoBonus) {

    for (var i = 0; i < respostaFuncionarioSaldoBonus.data.length; i++) {
        vlSaldo = respostaFuncionarioSaldoBonus.data[i]['VLSALDOFINAL'];
        idFuncionarioBonus = respostaFuncionarioSaldoBonus.data[i]['IDFUNCIONARIO']
        nomefuncionarioBonus = respostaFuncionarioSaldoBonus.data[i]['NOFUNCIONARIO']
        cpfFuncionarioBonus = respostaFuncionarioSaldoBonus.data[i]['NUCPF']

        $("#IDFuncionarioBonus").val(idFuncionarioBonus);
        $("#nomefuncionarioBonus").val(nomefuncionarioBonus);
      
        $("#cpfFuncionarioBonus").val(cpfFuncionarioBonus);
        $("#vlSaldo").val(vlSaldo);

       
    }
}

function gravar_funcionario_bonus() {
    
    id = $("#IDFuncionarioBonus").val();
    var vlBonus = $("#vlBonus").val().replace(".", "").replace(",", ".");
    
    var dados = [{
        "IDFUNCIONARIO":parseInt(id),
        "VLCREDITO":parseFloat(vlBonus),
        "VLDEBITO":parseFloat(0),
        "TXTHISTORICO":"LANCAMENTO DE CREDITO BONUS EFETUADO POR: " + IDFuncionarioLogin.toString() + "->"+NomeFuncionarioLogin
    }];

    console.log(dados);

            ajaxPost("api/pdv-novo/funcionario-extrato/todos.xsjs", dados)
                .then(funcSucessCreditoFuncionario)
                .catch(funcError);
                
                    	const textdados = JSON.stringify(dados);
                    
                    	textoFuncao = 'INFORMATICA/CREDITO DE BONUS DE FUNCIONARIOS';
                    
                        var dadosEditFuncDesc = [{
                            
                            "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
                            "PATHFUNCAO":textoFuncao,
                            "DADOS":textdados,
                            "IP":ipCliente
                        }];
                    
                      	ajaxPost("api/log-web.xsjs", dadosEditFuncDesc)
                    		.then(funcSucessLog)
                    		.catch(funcError);

}

function funcSucessCreditoFuncionario(resposta) {

    alerta_atualizado_sucesso();
    $("#cadBonusFuncionario").modal('hide');
    pesq_funcionarios_loja();

}

function funcSucessUpdateFuncionario(resposta) {

    alerta_atualizado_sucesso();
    $("#cadFuncionario").modal('hide');
    pesq_funcionarios_loja();

}

function funcSucessPostFuncionario(resposta) {

    alerta_cadastrado_sucesso();
    $("#cadFuncionario").modal('hide');
    $("#IDFuncionarioAtualizar").val('');
    $("#nomefuncionario").val('');
    $("#empresaFuncionario").val('');
    $("#loginFuncionario").val('');

    $("#funcaoFuncionario").val('');
    $("#tipoFuncionario").val('');
    $("#cpfFuncionario").val('');
    $("#salarioFuncionario").val('');
    $("#percDescFunc").val('');
    $("#valorDescFunc").val('');

    $('#nomefuncionario').attr('readonly', false);
    $('#empresaFuncionario').attr('disabled', false);
    $('#cpfFuncionario').attr('readonly', false);
    $('#funcaoFuncionario').attr('disabled', false);
    $('#tipoFuncionario').attr('disabled', false);
    ListaFuncionarios();

}

function funcError(data) {
    Swal.fire({
        type: "error",
        title: 'Erro ao Carregar os Dados',
        showConfirmButton: false,
        timer: 15000
    });
}

function mudar_status_funcionario(id, status) {

	var dados = {
        "DATAULTIMAALTERACAO": dataAtualCampo,
        "STATIVO": status,
        "DATA_DEMISSAO" :"",
		"ID": parseInt(id)
	};

	console.table(dados);

    ajaxPut('api/informatica/funcionario-inativa.xsjs',dados)
        .then(funcSucessUpdateStatusFuncionario)
        .catch(funcError);
        
	const textdados = JSON.stringify(dados);
	
	if(status=='True'){
	    textoFuncao = 'INFORMATICA/ATIVADO FUNCIONARIO';
	}else{
	    textoFuncao = 'INFORMATICA/INATIVA FUNCIONARIO';
	}
		
    var dadosStatusFunc = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosStatusFunc)
		.then(funcSucessLog)
		.catch(funcError);
		
}

function desligar_funcionario(id) {

	var dados = {
        "DATAULTIMAALTERACAO": dataAtualCampo,
        "STATIVO": 'False',
        "DATA_DEMISSAO" :dataAtualCampo,
		"ID": parseInt(id)
	};

	console.table(dados);

    ajaxPut('api/informatica/funcionario-inativa.xsjs',dados)
        .then(funcSucessUpdateStatusFuncionario)
        .catch(funcError);
        
	const textdados = JSON.stringify(dados);
	
	if(status=='True'){
	    textoFuncao = 'INFORMATICA/ATIVA DESLIGAMENTO DE FUNCIONARIO';
	}else{
	    textoFuncao = 'INFORMATICA/DESLIGAMENTO DE FUNCIONARIO';
	}
		
    var dadosDesligaFunc = [{
        
        "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
        "PATHFUNCAO":textoFuncao,
        "DADOS":textdados,
        "IP":ipCliente
    }];

  	ajaxPost("api/log-web.xsjs", dadosDesligaFunc)
		.then(funcSucessLog)
		.catch(funcError);
		
}

function funcSucessUpdateStatusFuncionario(resposta) {

	alerta_atualizado_sucesso();
	pesq_funcionarios_loja();
}
 
function funcErrorUpdateStatusMovimento(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do funcSucessUpdateStatusMovimento',
		showConfirmButton: false,
		timer: 15000
	});
}

//////////////////////////// INTEGRAÇÃO VENDAS / ALLOC ////////////////////////////////////////////////////////
function ListaVendasAlloc() {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            //$('#DTInicio').val(dataAtualCampo);
            //$('#DTFim').val(dataAtualCampo);
            
            $("#idloja").select2();
        
            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch(funcError);

      }
    };
    xmlhttp.open("GET", "informatica_action_listvendasalloc.html", true);
    xmlhttp.send();
}

function pesq_vendas_alloc() {

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
    var IDEmpresaLoja = $("#idloja").val();
    var stvendasalloc = $("#stvendasalloc").val();
    var idVenda = $('#Venda').val();
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    $("#resultado").html(
      "<div align=\"center\">" +
      "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
      "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
      "</div>"
      );
   
   
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        //newDataTable('quebracaixa');

    		    return	ajaxGet('api/informatica/lista-vendas-alloc.xsjs?idVenda=' + idVenda + '&idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim + '&stvendasalloc=' + stvendasalloc)
    				.then(retornoTableListVendasAlloc)
    				.catch(funcErrorVendasAlloc);

				
      }
    };
    xmlhttp.open("GET", "informatica_action_pesqvendasalloc.html", true);
    xmlhttp.send();
}

function retornoTableListVendasAlloc(vendasalloc) {

	var contadorVendaAlloc = 0;
	var tableVendaAlloc = $('#dt-basic-vendasalloc').DataTable({
		    deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            destroy: true,
            
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
		});

	for (var i = 0; i < vendasalloc.data.length; i++) {

		contadorVendaAlloc = contadorVendaAlloc + 1;

		IDVendaAlloc = vendasalloc.data[i]['IDVENDA'];
		IDEmpresaVendaAlloc = vendasalloc.data[i]['IDEMPRESA'];
		DTEMVIO = vendasalloc.data[i]['DTEMVIO'];
		DTVENDA = vendasalloc.data[i]['DTVENDA'];
		IDRETORNOALLOC = vendasalloc.data[i]['IDRETORNOALLOC'];
		CUPOM_CODIGO = vendasalloc.data[i]['CUPOM_CODIGO'];
		IDRETORNOPAGAMENTO = vendasalloc.data[i]['IDRETORNOPAGAMENTO'];
		TXT_VENDA = vendasalloc.data[i]['TXT_VENDA'];
		TXT_PAGAMENTO = vendasalloc.data[i]['TXT_PAGAMENTO'];
		TXTRETORNOALLOC = vendasalloc.data[i]['TXTRETORNOALLOC'];
		TXTRETORNOERROALLOC = vendasalloc.data[i]['TXTRETORNOERROALLOC'];
		STSTATUS = vendasalloc.data[i]['STSTATUS'];

            tagDetVendaAlloc='<div class="btn-group btn-group-xs"><button type="button" class="btn btn-info btn-xs" title="Detalhar Venda / Alloc" id="'+IDVendaAlloc+'" onclick="det_venda_alloc(this.id)" >Detalhar</button></div>';

		tableVendaAlloc.row.add([
            `<label style="color: blue;">` + contadorVendaAlloc + `</label>`,
            `<label style="color: blue;">` + IDEmpresaVendaAlloc + `</label>`,
            `<label style="color: blue;">` + DTVENDA + `</label>`,
            `<label style="color: blue;">` + IDVendaAlloc + `</label>`,
            `<label style="color: blue;">` + DTEMVIO + `</label>`,
            `<label style="color: blue;">` + IDRETORNOALLOC + `</label>`,
            `<label style="color: blue;">` + CUPOM_CODIGO + `</label>`,
            `<label style="color: blue;">` + IDRETORNOPAGAMENTO + `</label>`,
            `<label style="color: blue;">` + STSTATUS + `</label>`,
            tagDetVendaAlloc,
        ]).draw(false);
	}
}

function funcErrorVendasAlloc(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados do retornoTableListQuebraCaixaLoja',
		showConfirmButton: false,
		timer: 15000
	});
}


////////////////////////////  VENDAS / CONTINGENCIAS ////////////////////////////////////////////////////////
function ListaVendasContigencia() {

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
        
            $('.dataAtual').text(dataAtual);
            //$('#DTInicio').val(dataAtualCampo);
            //$('#DTFim').val(dataAtualCampo);
            
            $("#idloja").select2();
        
            ajaxGet('api/informatica/empresa.xsjs')
                .then(retornoListaEmpresasSelect)
                .catch(funcError);

      }
    };
    xmlhttp.open("GET", "informatica_action_listvendascontigencia.html", true);
    xmlhttp.send();
}

function pesq_vendas_contingencia() {

    var datapesqinicio = $("#DTInicio").val();
    var datapesqfim = $("#DTFim").val();
    var IDEmpresaLoja = $("#idloja").val();
  
    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
   
    $("#resultado").html(
      "<div align=\"center\">" +
      "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
      "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
      "</div>"
      );
   
   
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
        document.getElementById("resultado").innerHTML = xmlhttp.responseText;
        //newDataTable('quebracaixa');

    		    return	ajaxGet('api/informatica/lista-vendas-contingencia.xsjs?idEmpresa=' + IDEmpresaLoja + '&dataPesquisaInic=' + datapesqinicio + '&dataPesquisaFim=' + datapesqfim)
    				.then(retornoTableListVendasContingencia)
    				.catch(funcError);

				
      }
    };
    xmlhttp.open("GET", "informatica_action_pesqvendascontingencia.html", true);
    xmlhttp.send();
}

function retornoTableListVendasContingencia(vendascontingencia) {

	var contadorVendaContigencia = 0;
	var tableVendaContingencia = $('#dt-basic-vendascontingencia').DataTable({
		    deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            destroy: true,
            
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
		});

	for (var i = 0; i < vendascontingencia.data.length; i++) { 

		contadorVendaContigencia = contadorVendaContigencia + 1;

		IDVendaContigencia = vendascontingencia.data[i]['IDVENDA'];
		IDEmpresaVendaContigencia = vendascontingencia.data[i]['NOFANTASIA'];
		DSCAIXA = vendascontingencia.data[i]['DSCAIXA'];
		NFContigencia = vendascontingencia.data[i]['NFE_INFNFE_IDE_NNF'];
		DTHORAFECHAMENTO = vendascontingencia.data[i]['DTHORAFECHAMENTO'];
		PROTNFE_INFPROT_XMOTIVO = vendascontingencia.data[i]['PROTNFE_INFPROT_XMOTIVO'];

		tableVendaContingencia.row.add([
            `<label style="color: blue;">` + contadorVendaContigencia + `</label>`,
            `<label style="color: blue;">` + IDEmpresaVendaContigencia + `</label>`,
            `<label style="color: blue;">` + DTHORAFECHAMENTO + `</label>`,
            `<label style="color: blue;">` + IDVendaContigencia + `</label>`,
            `<label style="color: blue;">` + DSCAIXA + `</label>`,
            `<label style="color: blue;">` + NFContigencia + `</label>`,
            `<label style="color: blue;">` + PROTNFE_INFPROT_XMOTIVO + `</label>`,
        ]).draw(false);
	}
}

function funcError(data) {
	Swal.fire({
		type: "error",
		title: 'Erro ao Carregar os Dados',
		showConfirmButton: false,
		timer: 15000
	});
}
////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////// ROTINA CLIENTE ////////////////////
// Leandro Massafera - 20/09/2022
function ListaCliente(){

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

        	$("#idmarca").select2();
            $("#idloja").select2();

        	ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaGrupoEmpresasSelectVendedor)
                .catch(funcError);
		}
	};
	
	xmlhttp.open("GET", "informatica_action_cliente.html", true);
	xmlhttp.send();
}

// Retorno das buscas dos Clientes
function retornoListaCliente(respostaListaCliente) {
                    
    var numPageAtual = parseInt(respostaListaCliente.page);
	var BtnOpcao = "";

    if(respostaListaCliente.data.length != 0){
        for (var i=0; i < respostaListaCliente.data.length; i++) { 

            var registro = respostaListaCliente.data[i];

			empresa = registro.NOFANTASIA
			IdCliente = registro.IDCLIENTE;
            RazaoSocial = registro.DSNOMERAZAOSOCIAL;
            nomeFantasia = registro.DSAPELIDONOMEFANTASIA
            NuCPFCNPJ = registro.NUCPFCNPJ;
            TipoCliente = registro.TPCLIENTE;
            Status = registro.STATIVO;
            Celular = registro.NUTELCELULAR;
            Email = registro.EEMAIL;
            ultimaAlteracao = registro.DTULTALTERACAOFORMATADA;
            dataNascimento = registro.DTNASCFUNDACAOFORMATADA;
            numRG = registro.NURGINSCESTADUAL
            cep = registro.NUCEP;
            endereco = registro.EENDERECO;
            numero = registro.NUENDERECO
            complemento = registro.ECOMPLEMENTO;
            estado = registro.SGUF;
            cidade = registro.ECIDADE;
            bairro = registro.EBAIRRO;
            numIBGE = registro.NUIBGE;
            optSimples = registro.STOPTANTESIMPLES;
            insSUFRAMA = registro.NUINSCRICAOSUFRAMA;
            insMunicipal = registro.NUINSCMUNICIPAL;
            insEstadual = registro.TPINDICADORINSCESTADUAL;
            contato01 = registro.NOCONTATOCLIENTE01;
            telCont01 = registro.FONECONTATOCLIENTE01;
            emailCont01 = registro.EEMAILCONTATOCLIENTE01;
            cargoCont01 = registro.DSCARGOCONTATOCLIENTE01;
            contato02 = registro.NOCONTATOCLIENTE02;
            telCont02 = registro.FONECONTATOCLIENTE02;
            emailCont02 = registro.EEMAILCONTATOCLIENTE02;
            cargoCont02 = registro.DSCARGOCONTATOCLIENTE02;

            if(Status === 'True'){
                Status = 'ATIVO';
            } else {
                Status = 'INATIVO';
            }

            BtnOpcao = `<div class="demo">`;
            BtnOpcao = BtnOpcao + `
                    <button type="button" class="btn btn-success btn-xs btn-icon waves-effect waves-themed" title="Visualizar Dados do Cliente" id="`+ IdCliente +`" onclick="visualizarCliente(this.id)"><i class="fal fa-list"></i></button>
                `;
            BtnOpcao = BtnOpcao + `</div>`;

            dataRetornoCliente.push( [BtnOpcao
                                    ,empresa
                                    ,IdCliente
                                    ,RazaoSocial
                                    ,nomeFantasia
                                    ,NuCPFCNPJ
                                    ,Celular
                                    ,Email
                                    ,TipoCliente
                                    ,Status
                                    ,dataNascimento
                                    ,ultimaAlteracao
                                    ,numRG
                                    ,cep
                                    ,endereco
                                    ,numero
                                    ,complemento
                                    ,estado
                                    ,cidade
                                    ,bairro
                                    ,numIBGE
                                    ,optSimples
                                    ,insSUFRAMA
                                    ,insMunicipal
                                    ,insEstadual
                                    ,contato01
                                    ,telCont01
                                    ,emailCont01
                                    ,cargoCont01
                                    ,contato02
                                    ,telCont02
                                    ,emailCont02
                                    ,cargoCont02]);
        }
        
        chamarProximaListaCliente(numPageAtual + 1); 
    }
    else{
        $('#resultadocliente').html(
			`<table id="dt-basic-cliente" class="table table-bordered table-hover table-striped w-100">
				<thead class="bg-primary-600">
					<tr>
						<th></th>
						<th>Empresa</th>
						<th>Nº Cliente</th>
						<th>Nome</th>
						<th>Nome Fantasia</th>
						<th>CPF / CNPJ</th>
						<th>Telefone</th>
						<th>E-mail</th>
						<th>Tipo Cliente</th>
						<th>Status</th>
						<th>Data de nascimento</th>
						<th>Data última alteração</th>
						<th>Nº RG</th>
						<th>CEP</th>
						<th>Endereço</th>
						<th>Nº Endereço</th>
						<th>Complemento</th>
						<th>Estado</th>
						<th>Cidade</th>
						<th>Bairro</th>
						<th>Nº IBGE</th>
						<th>Optante simples</th>
						<th>Inscrição SUFRAMA</th>
						<th>Inscrição municipal</th>
						<th>Tipo inscrição estadual</th>
						<th>Contato 01</th>
						<th>Telefone Contato 01</th>
						<th>E-Mail Contato 01</th>
						<th>Cargo Contato 01</th>
						<th>Contato 02</th>
						<th>Telefone Contato 02</th>
						<th>E-Mail Contato 02</th>
                        <th>Cargo Contato 02</th>
					</tr>
				</thead>
			</table>`
        );
	   
	   $('#dt-basic-cliente').DataTable( {
            data: dataRetornoCliente,
            "columnDefs": [
                { "width": "7%", "targets": 0 },
                { "width": "25%", "targets": 1 },
                { "width": "10%", "targets": 2 },
                { "width": "10%", "targets": 3 },
                { "width": "27%", "targets": 4 },
                { "width": "9%", "targets": 5 },
                { "width": "6%", "targets": 6 },
                { "width": "6%", "targets": 7 }
            ],
			order: [
				[0, 'desc'],
			],
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

// Chama Proxima Lista de Clientes
function chamarProximaListaCliente(numPage){
    var idmarca = $("#idmarca").val();
    var idloja = $("#idloja").val();
    var dscliente = $("#dscliente").val();
    var idcpfcnpj = $("#idcpfcnpj").val();
    var idtipocliente = $("#idtipocliente").val();
    var idstatus = $("#idstatus").val();
    ajaxGet('api/informatica/cliente.xsjs?page=' + numPage + '&idmarca=' + idmarca + '&idloja=' + idloja + '&dscliente=' + dscliente + '&idcpfcnpj=' + idcpfcnpj + '&idtipocliente=' + idtipocliente + '&idstatus=' + idstatus)
		.then(retornoListaCliente)
		.catch(funcError);
}

// Função para Pesquisar os Clientes
function pesquisarCliente(){

    var idmarca = $("#idmarca").val();
	var idloja = $("#idloja").val();
    var dscliente = $("#dscliente").val();
    var idcpfcnpj = $("#idcpfcnpj").val();
    var idtipocliente = $("#idtipocliente").val();
    var idstatus = $("#idstatus").val();

    dataRetornoCliente = [];
	numPage = 1;

    $("#resultadocliente").html(
        "<div align=\"center\">" +
        "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
        "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
        "</div>"
        );

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			document.getElementById("resultadomodalcliente").innerHTML = xmlhttp.responseText;

        	$("#idmarca").select2();
            $("#idloja").select2();

			ajaxGet('api/informatica/cliente.xsjs?page=' + numPage + '&idmarca=' + idmarca + '&idloja=' + idloja + '&dscliente=' + dscliente + '&idcpfcnpj=' + idcpfcnpj + '&idtipocliente=' + idtipocliente + '&idstatus=' + idstatus)
				.then(retornoListaCliente)
				.catch(funcError);
		}
	};
	
	xmlhttp.open("GET", "informatica_action_cliente.html", true);
	xmlhttp.send();
}

// Função para apresentar a tela de Visualização dos Clientes
function visualizarCliente(id){

    $.get('informatica_action_cliente_modal.html', function(res) {

        $('#resultadomodalcliente').html(res);
        $("#cadcliente").modal('show');
        $('#cadcliente').on('shown.bs.modal', function() {});

        ajaxGet('api/informatica/cliente.xsjs?id=' + id)
		    .then(retornoListaDetalheCliente)
		    .catch(funcError);

    })
}

// Retorno de todos os campos do Cliente
function retornoListaDetalheCliente(respostaListaDetalheCliente) {
                    
    var registro = respostaListaDetalheCliente.data[0];

    if(registro.STATIVO === 'True'){
        Status = 'ATIVO';
    } else {
        Status = 'INATIVO';
    }

    if(registro.STOPTANTESIMPLES === 'True'){
        StatusOptSimples = 'SIM';
    } else {
        StatusOptSimples = 'NÃO';
    }

    $("#IdCliente").val(registro.IDCLIENTE);
    $("#Empresa").val(registro.NOFANTASIA);
    $("#RazaoSocial").val(registro.DSNOMERAZAOSOCIAL);
    $("#nome_cliente").val(registro.DSNOMERAZAOSOCIAL);
    $("#NomeFantasia").val(registro.DSAPELIDONOMEFANTASIA);
    $("#TipoCliente").val(registro.TPCLIENTE);
    $("#NuCPFCNPJ").val(registro.NUCPFCNPJ);
    $("#NuRGInscEstadual").val(registro.NURGINSCESTADUAL);
    $("#NuInsMunicipal").val(registro.NUINSCMUNICIPAL);
    $("#NuInscSuframa").val(registro.NUINSCRICAOSUFRAMA);
    $("#TipoIndInscEstadual").val(registro.TPINDICADORINSCESTADUAL);
    $("#StatusOptSimples").val(StatusOptSimples);
    $("#NuCEP").val(registro.NUCEP);
    $("#NuIBGE").val(registro.NUIBGE);
    $("#Endereco").val(registro.EENDERECO);
    $("#NuEndereco").val(registro.NUENDERECO);
    $("#Complemento").val(registro.ECOMPLEMENTO);
    $("#Bairro").val(registro.EBAIRRO);
    $("#Cidade").val(registro.ECIDADE);
    $("#Estado").val(registro.SGUF);
    $("#Email").val(registro.EEMAIL);
    $("#TelComercial").val(registro.NUTELCOMERCIAL);
    $("#TelCelular").val(registro.NUTELCELULAR);
    $("#Observacao").val(registro.DSOBSERVACAO);
    $("#Contato01").val(registro.NOCONTATOCLIENTE01);
    $("#EmailContato01").val(registro.EEMAILCONTATOCLIENTE01);
    $("#TelContato01").val(registro.FONECONTATOCLIENTE01);
    $("#CargoContato01").val(registro.DSCARGOCONTATOCLIENTE01);
    $("#Contato02").val(registro.NOCONTATOCLIENTE02);
    $("#EmailContato02").val(registro.EEMAILCONTATOCLIENTE02);
    $("#TelContato02").val(registro.FONECONTATOCLIENTE02);
    $("#CargoContato02").val(registro.DSCARGOCONTATOCLIENTE02);
    $("#Status").val(Status);
    $("#DataUltimaAlteracao").val(registro.DTULTALTERACAOFORMATADA);
    $("#DataNascimento").val(registro.DTNASCFUNDACAOFORMATADA);

}

//////////////////// LISTA VENDAS CANCELADAS ////////////////////
/////////////////// João Paulo - 20/10/2022 ////////////////////////

function ListaVendasCanceladas(){

    if (window.XMLHttpRequest) {
      // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else {
      // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }


    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

            $('.dataAtual').text(dataAtual);
            $('#dataPesquisaInicio').val(dataAtualCampo);
            $('#dataPesquisaFim').val(dataAtualCampo);

        	$("#idEmpresa").select2();
            $("#idMarca").select2();

            ajaxGet('api/informatica/grupoempresas.xsjs')
                .then(retornoListaMarcaVendasCanceladasSelect)
                .catch(funcError);
        
            ajaxGet(`api/empresa.xsjs`)
                .then(retornoListaEmpresasVendasCanceladasSelect)
                .catch(funcError);
        }
    };
    xmlhttp.open("GET", "informatica_action_listavendascanceladas.html", true);
    xmlhttp.send();
}

function retornoListaEmpresasVendasCanceladasSelect(respostaListaEmpresasVendasCanceladasSelect) {
    listaEmpresas = respostaListaEmpresasVendasCanceladasSelect.data;
    dadosEmpresas = []

    for (var i = 0; i < respostaListaEmpresasVendasCanceladasSelect.data.length; i++) {

        IDEmpresa = respostaListaEmpresasVendasCanceladasSelect.data[i]['IDEMPRESA'];
        DSEmpresa = respostaListaEmpresasVendasCanceladasSelect.data[i]['NOFANTASIA'];

        dadosEmpresas.push({
            IDEmpresa,
            DSEmpresa
        });

	}
    
    dadosEmpresas.sort(function (a, b) {
        if (a.DSEmpresa < b.DSEmpresa) {
            return -1;
        }
        if (a.DSEmpresa > b.DSEmpresa) {
            return 1;
        }
        return 0;
    });

    for (const { IDEmpresa, DSEmpresa } of dadosEmpresas) {
        $('#idEmpresa').append(
        `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
        );
    }
    
}

function retornoListaMarcaVendasCanceladasSelect(respostaListaMarcaVendasCanceladasSelect) {
    listaMarca = respostaListaMarcaVendasCanceladasSelect.data;
    
    for (var i = 0; i < respostaListaMarcaVendasCanceladasSelect.data.length; i++) {

        IDMarca = respostaListaMarcaVendasCanceladasSelect.data[i]['IDGRUPOEMPRESARIAL'];
        DSMarca = respostaListaMarcaVendasCanceladasSelect.data[i]['GRUPOEMPRESARIAL'];

        $('#idMarca').append(
            `<option value="` + IDMarca + `"> ` + DSMarca + `</option>`
        );
	}
}

function filtraEmpresas() {
    $("#idEmpresa").empty();
    
    idMarca = $('#idMarca').val();

    ajaxGet('api/empresa.xsjs?idSubGrupoEmpresa=' + idMarca)
	.then(retornoListaEmpresasVendasCanceladasSelect)
	.catch(funcError);
}

function pesq_vendas_canceladas(){
    var idEmpresa = $("#idEmpresa").val();
    var idMarca = $("#idMarca").val();
    var dataPesquisaInicio = $("#dataPesquisaInicio").val();
    var dataPesquisaFim = $("#dataPesquisaFim").val();
    dadosVendasCanceladas = [];
    ct = 0;

    numPage = 1;

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
      } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
      }
     
      xmlhttp.onreadystatechange = function () {
          
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          document.getElementById("resultado").innerHTML = xmlhttp.responseText;

          $("#resultado").html(
            "<div align=\"center\">" +
            "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>"  +
            "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
            "</div>"
            );

          
            $("#dataPesquisaInicio").val(dataPesquisaInicio);
            $("#dataPesquisaFim").val(dataPesquisaFim);
            $("idEmpresa").select2();
            $("idMarca").select2();
          
            ajaxGet('api/venda-cancelada.xsjs?page=' + numPage + '&idEmpresa=' + idEmpresa + '&idMarca=' + idMarca + '&dataPesquisaInicio=' + dataPesquisaInicio + '&dataPesquisaFim=' + dataPesquisaFim)
                .then(retornoVendasCanceladas)
                .catch(funcError);
        }

      };

        xmlhttp.open("GET", "informatica_action_pesqvendascanceladas.html", true);
        xmlhttp.send();
}

function retornoVendasCanceladas(respostaVendasCanceladas){
    
    var numPageAtual = parseInt(respostaVendasCanceladas.page);
    var opcoes = "";
    
    if(respostaVendasCanceladas.data.length != 0){

        for(var i = 0; i < respostaVendasCanceladas.data.length; i++){
            var registro = respostaVendasCanceladas.data[i];
            
            ct ++;
            empresa = registro.venda.NOEMPRESA;
            idcaixaweb = registro.venda.IDCAIXAWEB;
            caixaweb = registro.venda.DSCAIXA;
            venda = registro.venda.IDVENDA;
            nnf = registro.venda.NFE_INFNFE_IDE_NNF;
            dtHoraAbertura = registro.venda.DTHORAABERTURA;
            operador = registro.venda.NOOPERADOR;
            vrTotalPago = registro.venda.VRTOTALPAGO;
            statusEmissaoNota = registro.venda.STELETRONICOENVIADO;
            usuarioCancelamento = registro.venda.NOFUNCIONARIOCANCEL;
            funcaoCancelador = registro.venda.NOFUNCAOCANCEL;
            motivoCancelamento = registro.venda.TXTMOTIVOCANCELAMENTO;
            statusCancelamento = registro.venda.STCANCELADO;

            if (registro == null || registro == undefined || registro == " ") {
                registro = '0';
            }
            
            for(var k = 0; k < registro.pagamento.length; k++){
                var registroPagamento = registro.pagamento[k];

                formaPagamento = registroPagamento.pag.DSTIPOPAGAMENTO;
            }

            if (registroPagamento == null || registroPagamento == undefined || registroPagamento == " ") {
                registroPagamento = '0';
            }
            
            if(statusCancelamento === 'True'){
                statusCancelamento = 'CANCELADO';
            } else {
                statusCancelamento = 'ATIVO';
            }

            if(statusEmissaoNota === 'True'){
                statusEmissaoNota = 'Emitida';
            } else {
                statusEmissaoNota = 'Não Emitida';
            }

            opcoes = `<div class="btn-group btn-group-xs">
                <button type="button" class="btn btn-info btn-xs" title="Detalhar Venda" id="${venda}" onclick="visualizarDetalheVendaCancelada(this.id)" >Venda</button>
                <button type="button" class="btn btn-warning btn-xs text-white" title="Detalhar Produtos" id="${venda}" onclick="visualizarProdutosVendaCancelada(this.id)" >Produtos</button>
                <button type="button" class="btn btn-success btn-xs" title="Detalhar Recebimentos" id="${venda}" onclick="visualizarPagamentoVendaCancelada(this.id)">Pagamento</button>
            </div>`;

            dadosVendasCanceladas.push( [
                ct,
                empresa,
                caixaweb,
                venda,
                nnf,
                dtHoraAbertura,
                operador,
                vrTotalPago,
                statusEmissaoNota,
                usuarioCancelamento,
                funcaoCancelador,
                motivoCancelamento,
                opcoes
            ]);
            
        }

        chamarProximaListaVendasCanceladas(numPageAtual + 1);

    } else {
        $('#resultado').html(
			`<table id="dt-basic-venda-cancelada" class="table table-bordered table-hover table-striped w-100">
            <thead class="bg-primary-600">
                <tr>
                    <th>*</th>
                    <th>Empresa</th>
                    <th>Caixa</th>
                    <th>Nº Venda</th>
                    <th>NFCe</th>
                    <th>Abertura</th>
                    <th>Operador</th>
                    <th>Valor</th>
                    <th>Nota</th>
                    <th>Cancelado Por</th>
                    <th>Função</th>
                    <th>Motivo</th>
                    <th>Opções</th>
                </tr>
            </thead>
            <tbody>

            </tbody>
        </table>
        `
        );
        $('#dt-basic-venda-cancelada').DataTable({
            data: dadosVendasCanceladas,

            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            destroy: true,

            dom:"<'row mb-3'<'col-sm-12 col-md-6 d-flex n-items-center justify-content-start'f><'col-sm-12 col-md-6 ex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
    }
}

function chamarProximaListaVendasCanceladas(numPage){
    var idEmpresa = $("#idEmpresa").val();
    var idMarca = $("#idMarca").val();
    var dataPesquisaInicio = $("#dataPesquisaInicio").val();
    var dataPesquisaFim = $("#dataPesquisaFim").val();

    ajaxGet('api/venda-cancelada.xsjs?page=' + numPage + '&idEmpresa=' + idEmpresa + '&idMarca=' + idMarca + '&dataPesquisaInicio=' + dataPesquisaInicio + '&dataPesquisaFim=' + dataPesquisaFim)
        .then(retornoVendasCanceladas)
        .catch(funcError);
}

function visualizarDetalheVendaCancelada(id){

    $.get('informatica_action_vendas_canceladas_modal.html', function(res) {

        $('#resulmodaldetvendacancelada').html(res);
        $("#modalVendaCancelada").modal('show');
        $('#modalVendaCancelada').on('shown.bs.modal', function() {});

        ajaxGet('api/venda-cancelada.xsjs?idVenda=' + id)

            .then(retornoListaVendasCanceladas)
            .catch(funcError);

    })

}

function visualizarProdutosVendaCancelada(id){

    $.get('informatica_action_vendas_canceladas_produtos_modal.html', function(res) {

        $('#resulmodaldetvendacancelada').html(res);
        $("#modalVendaCancelada").modal('show');
        $('#modalVendaCancelada').on('shown.bs.modal', function() {});

        ajaxGet('api/venda-cancelada.xsjs?idVenda=' + id)

            .then(retornoListaVendasCanceladas)
            .catch(funcError);

    })

}

function visualizarPagamentoVendaCancelada(id){

    $.get('informatica_action_vendas_canceladas_pagamento_modal.html', function(res) {

        $('#resulmodaldetvendacancelada').html(res);
        $("#modalVendaCancelada").modal('show');
        $('#modalVendaCancelada').on('shown.bs.modal', function() {});

        ajaxGet('api/venda-cancelada.xsjs?idVenda=' + id)

            .then(retornoListaVendasCanceladas)
            .catch(funcError);

    })

}

function retornoListaVendasCanceladas(respostaListaVendasCanceladas){

    var registro = respostaListaVendasCanceladas.data[0];

    if(registro.venda.STCANCELADO === 'True'){
        statusCancelamento = 'CANCELADA';
    } else {
        statusCancelamento = 'ATIVA';
    }


    $("#noEmpresa").val(registro.venda.NOEMPRESA);
    $("#idVenda").val(registro.venda.IDVENDA);
    $("#nnf").val(registro.venda.NFE_INFNFE_IDE_NNF);
    $("#idMovCaixa").val(registro.venda.IDMOVIMENTOCAIXAWEB);
    $("#noOperador").val(registro.venda.NOOPERADOR);
    $("#statusCancelamento").val(statusCancelamento);
    $("#dtHoraAbertura").val(registro.venda.DTHORAABERTURA);
    $("#dtHoraFechamento").val(registro.venda.DTHORAFECHAMENTO);
    $("#chaveCancelamento").val(registro.venda.PROTNFE_INFPROT_CHNFE);
    $("#vrTotalPago").val(registro.venda.VRTOTALPAGO);
    $("#vrDescontoNota").val(registro.venda.NFE_INFNFE_TOTAL_ICMSTOT_VDESC);
    $("#vrNota").val(registro.venda.NFE_INFNFE_TOTAL_ICMSTOT_VPROD);
    $("#vrBrutoNota").val(registro.venda.NFE_INFNFE_TOTAL_ICMSTOT_VBC);
    $("#nuCupom").val(registro.venda.NFE_INFNFE_TOTAL_ICMSTOT_VFCP);
    $("#txtMotivoCancelamento").val(registro.venda.TXTMOTIVOCANCELAMENTO);
    $("#vrDinheiro").val(registro.venda.VRRECDINHEIRO);
    $("#vrCartao").val(registro.venda.VRRECCARTAO);
    $("#vrPos").val(registro.venda.VRRECPOS);
    $("#vrCheque").val(registro.venda.VRRECCHEQUE);
    $("#vrConvenio").val(registro.venda.VRRECCONVENIO);
    $("#vrVoucher").val(registro.venda.VRRECVOUCHER);

    for(var j = 0; j < registro.detalhe.length; j++){
        var registroDetalhe = registro.detalhe[j];

        $("#descricaoProduto").val(registroDetalhe.det.XPROD);
        $("#vrUnitario").val(registroDetalhe.det.VPROD);
        $("#vrRecebidoUnidade").val(registroDetalhe.det.VUNTRIB);
        $("#qtd").val(registroDetalhe.det.VUNCOM);
        $("#vendedor_nome").val(registroDetalhe.det.VENDEDOR_NOME);

        $('#resultListProdutosVendaCancelada').append(
            `<tr>
                <td><label style="color: blue;">` + registroDetalhe.det.XPROD + `</label></td>
                <td><label style="color: blue;">` + parseFloat(registroDetalhe.det.VPROD).toFixed(2).replace('.', ',') + `</label></td>
                <td><label style="color: blue;">` + registroDetalhe.det.VUNCOM + `</label></td>
                <td><label style="color: blue;">` + parseFloat(registroDetalhe.det.VUNTRIB).toFixed(2).replace('.', ',') + `</label></td>
                <td><label style="color: blue;">` + registroDetalhe.det.VENDEDOR_NOME + `</label></td>
                <td><label style="color: red;">` + statusCancelamento + `</label></td>` + 
            `</tr>`
        );

    }

    for(var k = 0; k < registro.pagamento.length; k++){
        var registroPagamento = registro.pagamento[k];
        

        $("#qtParcelas").val(registroPagamento.pag.NPARCELAS);
        $("#nsu").val(registroPagamento.pag.NSUTEF);
        $("#formaPagamento").val(registroPagamento.pag.DSTIPOPAGAMENTO);
        $("#vrRecebido").val(registroPagamento.pag.VALORRECEBIDO);
        
        
        if (registroPagamento.pag.NPARCELAS == null ){
            registroPagamento.pag.NPARCELAS = "";
        }

        if (registroPagamento.pag.NSUTEF == null ){
            registroPagamento.pag.NSUTEF = "";
        }

    }

    $('.textoCabecalhoDetalhe').html(
        `<h2">
            <span class="fw-100">${registro.venda.IDVENDA}</span>
        </h2>`
    );

    $('.textoCabecalhoProdutos').html(
        `<h2>
            Lista de Produtos da Venda Nº <span class="fw-300"><i>${registro.venda.IDVENDA}</i></span>
        </h2>`
    );

    $('#resultListPagamentoVendaCancelada').append(
        `<tr>
            <td><label style="color: blue;">` + mascaraValor(registro.venda.VRRECDINHEIRO) + `</label></td>
            <td><label style="color: blue;">` + mascaraValor(registro.venda.VRRECCARTAO) + `</label></td>
            <td><label style="color: blue;">` + mascaraValor(registro.venda.VRRECPOS) + `</label></td>
            <td><label style="color: blue;">` + mascaraValor(registro.venda.VRRECCONVENIO) + `</label></td>
            <td><label style="color: blue;">` + mascaraValor(registro.venda.VRRECVOUCHER) + `</label></td>` +
        `</tr>`
    );

    $('#resultListaPagamentoVendaCancelada').append(
        `<tr>
            <td><label style="color: blue;">` + registroPagamento.pag.DSTIPOPAGAMENTO + `</label></td>
            <td><label style="color: blue;">` + registroPagamento.pag.NPARCELAS + `</label></td>
            <td><label style="color: blue;">` + registroPagamento.pag.NSUTEF + `</label></td>
            <td><label style="color: blue;">` + mascaraValor(registroPagamento.pag.VALORRECEBIDO) + `</label></td>` +
        `</tr>`
    );

    $('.textoCabecalhoPagamento').html(
        `<h2>
            <span class="fw-300">Lista de Recebimentos da Venda Nº </span>&nbsp${registro.venda.IDVENDA}&nbsp;
        </h2>`
    );

}


    //=============================================================================================================
    //////////////////// FIM VENDAS CANCELADAS ////////////////

//////////////////// INICIO ROTINA Create/Update EMPRESAS ///////////////////////////////////////////////////////////////////////////////////////////////

function ListaEmpresas() {
  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  $("#resultado").html(
    "<div align=\"center\">" +
    "<button class=\"btn btn-lg btn-info\" type=\"button\" disabled>" +
    "<span class=\"spinner-border spinner-border-sm\" role=\"status\" aria-hidden=\"true\"></span> Dados Sendo Processados...</button>" +
    "</div>"
  );

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

      $('.DescTituloListaEmpresas').html(
        `<i class='subheader-icon fal fa-chart-area'></i> Lista de Lojas<span class='fw-300'></span>`);

      ajaxGet('api/empresa.xsjs')
        .then(retornoListaEmpresasSelectPesquisa)
        .catch(funcErrorListaEmpresasSelecPesquisa);

      pesq_empresas();
    }
  };

  xmlhttp.open("GET", "informatica_action_listaempresas_old.html", true);
  xmlhttp.send();
}

function retornoListaEmpresasSelectPesquisa(respostaListaEmpresas) {
  $('#idloja').select2({})

  listaEmpresas = respostaListaEmpresas.data;
  var dadosSelectEmpresas = []

  for (var i = 0; i < listaEmpresas.length; i++) {

    var IDEmpresa = listaEmpresas[i]['IDEMPRESA'];
    var DSEmpresa = listaEmpresas[i]['NOFANTASIA'];

    dadosSelectEmpresas.push({
      IDEmpresa,
      DSEmpresa
    })

  }

  dadosSelectEmpresas.sort(function (a, b) {
    if (a.IDEmpresa > b.IDEmpresa) {
      return 1;
    }

    if (a.IDEmpresa < b.IDEmpresa) {
      return -1;
    }
    return 0;
  })

  for (const elemento of dadosSelectEmpresas) {

    $('#idloja').append(
      `<option value="` + elemento.IDEmpresa + `"> ` + elemento.DSEmpresa + `</option>`);
  }

}

function pesq_empresas() {
  dataRetornoEmpresas = [];
  numPage = 1;
  var IDEmpresa = $("#idloja").val();


  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {

    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("resultado").innerHTML = xmlhttp.responseText;
      newDataTable('tableListaEmpresas');

      $('.dataAtual').text(dataAtual);

      ajaxGet('api/empresa.xsjs?id=' + IDEmpresa)
        .then(retornoListaEmpresa)
        .catch(funcError);
    }
  };
  xmlhttp.open("GET", "informatica_action_pesqempresas_old.html", true);
  xmlhttp.send();
}

function retornoListaEmpresa(respostaListaEmpresas) {
  var numPageAtual = parseInt(respostaListaEmpresas.page);

  if (respostaListaEmpresas.data.length !== 0) {
    for (var i = 0; i < respostaListaEmpresas.data.length; i++) {
      registroEmpresas = respostaListaEmpresas.data[i];

      idEmpresa = registroEmpresas['IDEMPRESA'];
      noEmpresa = registroEmpresas['NOFANTASIA'];
      CNPJ = registroEmpresas['NUCNPJ'];
      IE = registroEmpresas['NUINSCESTADUAL'];
      Cnae = registroEmpresas['CNAE'];
      Endereco = registroEmpresas['EENDERECO'];
      Estado = registroEmpresas['SGUF'];
      SituacaoEmpresa = registroEmpresas['STATIVO'];
      DTUltimaAlteracao = registroEmpresas['DTULTATUALIZACAO'];
      IDConfiguracaoEmpresa = registroEmpresas['IDCONFIGURACAO'];
      NuCertificadoEmpresa = registroEmpresas['DSNOMEPFX'];
      DTValidadeCertificadoEmpresa = registroEmpresas['DTVALIDADECERTIFICADO'];

      if (Estado !== 'DF') {
        Cidade = registroEmpresas['ECIDADE']

      } else {
        Cidade = registroEmpresas['EBAIRRO'];
      }

      if (DTUltimaAlteracao == null) {
        DTUltimaAlteracao = '';
      }

      if (SituacaoEmpresa == 'True') {
        SituacaoEmpresa = `<label style="color: blue;">Ativo</label>`;
      } else {
        SituacaoEmpresa = `<label style="color: red;">Inativo</label>`;
      }

      if (idEmpresa > 0) {
        Opcoes = `<div class="btn-group btn-group-xs"><button type="button" class="btn btn-warning btn-xs" title="Editar Informações da Empresa" id="${idEmpresa}" onclick="modal_cadastro_empresas(this.id)">Editar</button><button type="button" class="btn btn-primary btn-xs" title="Atualizar Certificado" id="${idEmpresa}" onclick="modal_Atualiza_Cerfificado(this.id)">Certificado</button><button type="button" class="btn btn-success btn-xs" title="Listar Caixas" id="${idEmpresa}" onclick="ListaCaixasEmpresa(this.id)" >Caixas - PDV</button></div>`;
      }

      dataRetornoEmpresas.push([
        idEmpresa,
        noEmpresa,
        CNPJ,
        IE,
        Cnae,
        Endereco,
        Cidade,
        Estado,
        SituacaoEmpresa,
        DTUltimaAlteracao,
        NuCertificadoEmpresa,
        DTValidadeCertificadoEmpresa,
        Opcoes
      ]);

    }

   // chamarProximaListaEmpresas(numPageAtual + 1);



    $('#dt-basic-empresas').DataTable({
      data: dataRetornoEmpresas,
      deferRender: true,
      columnDefs: [
        { "width": "100px", "targets": "_all" }],
      responsive: true,
      dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
      buttons: [
        {
          extend: 'pdfHtml5',
          text: 'PDF',
          titleAttr: 'Generate PDF',
          className: 'btn-outline-danger btn-sm mr-1'
        },
        {
          extend: 'excelHtml5',
          text: 'Excel',
          titleAttr: 'Generate Excel',
          className: 'btn-outline-success btn-sm mr-1'
        },
        {
          extend: 'print',
          text: 'Print',
          titleAttr: 'Print Table',
          className: 'btn-outline-primary btn-sm'
        }
      ]
    });

  }

}

function chamarProximaListaEmpresas(numPage) {

  ajaxGet('/api/empresa.xsjs?page=' + numPage)
    .then(retornoListaEmpresa)
    .catch(funcError);
}

function modal_cadastro_empresas(id) {
    
  $.get('informatica_action_cadastrarempresamodal.html', function (res) {

    $('#resultadoModalEmpresa').html(res);
    $("#cadEmpresa").modal('show');
    $('#cadEmpresa').on('shown.bs.modal', function () { });

    $('#IDEmpresaAtualizar').val(id)
    $('#IdGrupoEmpresarial').select2({})

    if (id > 0) {
      $("#footerEmpresa").html(`<button type="button" class="btn btn-success" onclick="valida_update_empresa()">Atualizar</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

      ajaxGet('api/empresa.xsjs?id=' + id)
        .then(atualizaEmpresa)
        .catch(funcError);
    } else {
      $("#footerEmpresa").html(`<button type="button" class="btn btn-success" onclick="cadastrar_empresa()">Cadastrar</button>
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

    }

  })

}

//-----------Tratamento de Data ------------------//

function converte_data(dataTipoString) {

  let data = dataTipoString.split('/');
  let dia = data[0]
  let mes = data[1]
  let ano = data[2]
  let dataFormatada = ano.concat('-', mes, '-', dia)

  return dataFormatada
}

//-----------API´s Externas ---------------------//

//---Traz todos os dados IE e Token CSC, porém, tem acesso limitado a 100 consultas por mês
function fetch_cnpj(cnpj) {

  return fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`)
}

function fetch_cnpj2 (cnpj){

  return fetch(`https://minhareceita.org/${cnpj}`)
}

//--Traz o endereço de acordo com o CEP
function fetch_cep(cep) {

  return fetch(`https://viacep.com.br/ws/${cep}/json/`)
}

//-----------Preenchimento de  dados no Cadastro com API -----------//

async function preenche_cnpj(cnpjNaoFormatado) {

  var cnpjFormatado = cnpjNaoFormatado.replace(/\D/g, "")
  console.log(cnpjFormatado)

  try {
    let dados_json = await fetch_cnpj(cnpjFormatado)
    let dados_obj = await dados_json.json()

    $('#dataCriacao').val(dados_obj['estabelecimento']["data_inicio_atividade"])
    $("#CNAE").val(dados_obj['estabelecimento']['atividade_principal']["id"]);
    $("#razaoSocial").val(dados_obj['razao_social'])
    $("#IE").val(dados_obj['estabelecimento']['inscricoes_estaduais'][0]['inscricao_estadual'])
    $("#CEP").val(dados_obj['estabelecimento']['cep'])
    $("#endereco").val(dados_obj['estabelecimento']['logradouro'] + " " + dados_obj['estabelecimento']['numero'])
    $("#complemento").val(dados_obj['estabelecimento']['complemento'])
    $("#email").val(dados_obj['estabelecimento']['email'])
    $("#telefone").val(dados_obj['estabelecimento']['ddd1'] + dados_obj['estabelecimento']['telefone1'])

    preenche_cep($("#CEP").val().replace(/\D/g, ""));
    
    return true
    
  } catch (e) {

    console.log("Erro ao retornar o autocomplete pelo CNPJ, Erro: " + e.message)
  }

}


async function preenche_cep(cep) {

  try {
    let dados_json = await fetch_cep(cep)
    let dados_obj = await dados_json.json()

    console.log(dados_obj)
    $("#bairro").val(dados_obj.bairro)
    $("#cidade").val(dados_obj.localidade)
    $("#estado").val(dados_obj.uf)
    $("#IBGE").val(dados_obj.ibge)

  }
  catch (e) {
    console.log("Erro ao retornar o autocomplete pelo CEP " + e)
  }

}

function modal_Preenchimento_CNPJ(cnpjEmpresa){
  Swal.fire({
    title: 'Deseja Autocompletar ou Atualizar as Informações deste Fornecedor Automaticamente?',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sim',
    cancelButtonText: 'Não'
  }).then(async(result) => {

    if(result.value == true & cnpjEmpresa !== "" & cnpjEmpresa.length == 14){
        let dadosObj = await fetch_cnpj2(cnpjEmpresa)
        let status = dadosObj.status

          if(status === 200){

          let status_preenchimento = await preenche_cnpj(cnpjEmpresa)
          console.log(status_preenchimento)

          Swal.fire({
            title: "Carregando os dados do CNPJ... Por favor aguarde!",
            type: "info",
            html:``,
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer:4000,
            onBeforeOpen: function () {

                Swal.showLoading()

            },
            onClose: function () {
              if(status_preenchimento){
            
                Swal.fire({
                    title: 'Dados Preenchidos com Sucesso!',
                    type: 'success'
                })
              } else{
                
                Swal.fire({
                  title: 'Erro ao preencher os dados, aguarde 1 minuto e tente novamente ou faça o preenchimento manual!',
                  type: 'error'
              })
                }
            }
        })
          
          
            // valida_cnpj_forn(cnpjFornecedor)

            // Swal.fire({
            //   title: 'Dados Preenchidos com Sucesso!',
            //   type: 'success'
            // })
            
        }
          if(status !== 200){
            Swal.fire({
              title: `CNPJ Inválido!`,
              text: `Favor Digitar um CNPJ Válido!`,
              type: 'warning'
            })

          }

    }

      if(result.value == true & cnpjEmpresa.length < 14 & cnpjEmpresa !== ''){
          Swal.fire({
            title: `CNPJ Incompleto!`,
            text: `Falta ${14 - cnpjEmpresa.length} Digitos, Favor Verificar o CNPJ!`,
            type: 'warning'
          })

      }

      if(result.value == true & cnpjEmpresa == ''){
        Swal.fire({
          title: `CNPJ Vazio!`,
          text: `Favor Digitar o CNPJ!`,
          type: 'error'
        })

      }

  })

}

//-----------Preenchimento de  dados no Cadastro com API  - FIM -----------//

function cadastrar_empresa() {

  nuCNPJ = $('#CNPJ').val().replace(/\D/g, "")

  if ($('#IdGrupoEmpresarial').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Grupo Empresarial!</div>"
    );
    $("#IdGrupoEmpresarialJ").focus();
    return false;
  }
  if ($('#stativoEmpresa').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe a Situação da Empresa!</div>"
    );
    $("#stativoEmpresaJ").focus();
    return false;
  }
  if ($('#dataCriacao').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe a Data de Criação da Empresa!</div>"
    );
    $("#dataCriacao").focus();
    return false;
  }
  if ($('#CNPJ').val() === '' || $('#CNPJ').val().length < 14 || $('#CNPJ').val().length > 18) {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o CNPJ da Empresa!</div>"
    );
    $("#CNPJ").focus();
    return false;
  }
  if ($('#IE').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe a Inscrição Estadual!</div>"
    );
    $("#IE").focus();
    return false;
  }
  if ($('#CNAE').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o CNAE da Empresa!</div>"
    );
    $("#CNAE").focus();
    return false;
  }
  if ($('#razaoSocial').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe a Razão Social da Empresa!</div>"
    );
    $("#razaoSocial").focus();
    return false;
  }

  if ($('#nomeFantasia').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Nome Fantasia da Empresa!</div>"
    );
    $("#nomeFantasia").focus();
    return false;
  }
  if ($('#CEP').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o CEP da Empresa!</div>"
    );
    $("#CEP").focus();
    return false;
  }
  if ($('#endereco').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Endereço!</div>"
    );
    $("#endereco").focus();
    return false;
  }
  if ($('#bairro').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Bairro!</div>"
    );
    $("#bairro").focus();
    return false;
  }
  if ($('#cidade').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe a Cidade!</div>"
    );
    $("#cidade").focus();
    return false;
  }
  if ($('#estado').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Estado!</div>"
    );
    $("#estado").focus();
    return false;
  }
  if ($('#IBGE').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Número IBGE!</div>"
    );
    $("#IBGE").focus();
    return false;
  }
  if ($('#email').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o E-mail da Empresa!</div>"
    );
    $("#email").focus();
    return false;
  }
  if ($('#telefone').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o Número de Telefone da Empresa!</div>"
    );
    $("#telefone").focus();
    return false;
  }
  if ($('#pis').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o PIS!</div>"
    );
    $("#pis").focus();
    return false;
  }
  if ($('#cofins').val() === '') {
    $("#notificacaoModalCadastroEmpresa").html(
      "<div class=\"alert alert-danger alert-dismissible fade show\" role=\"alert\">" +
      "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">" +
      "<span aria-hidden=\"true\"><i class=\"fal fa-times\"></i></span>" +
      "</button>" +
      "<strong>Atenção!</strong> Informe o COFINS!</div>"
    );
    $("#cofins").focus();
    return false;
  } else {

    ajaxGet('api/empresa.xsjs?cnpj=' + nuCNPJ)
      .then((resp)=>{retornoValidaCadastroEmpresa(resp)})
      .catch(funcErrorCadastroEmpresa);
  }

}

function retornoValidaCadastroEmpresa(resp) {

  var grupoEmpresarial = $("#IdGrupoEmpresarial").val();
  var razaoSocial = $("#razaoSocial").val();
  var noFantasia = $("#nomeFantasia").val();
  var nuCNPJ = $("#CNPJ").val().replace(/\D/g, "");
  var IE = $("#IE").val();
  var IM = $("#IM").val();
  var CNAE = $("#CNAE").val();
  var endereco = $("#endereco").val();
  var complemento = $("#complemento").val();
  var bairro = $("#bairro").val();
  var cidade = $("#cidade").val();
  var UF = $("#estado").val();
  var CEP = $("#CEP").val().replace(/\D/g, "");
  var IBGE = $("#IBGE").val();
  var email = $("#email").val();
  var nuTelefoneComercial = $("#telefone").val().replace(/\D/g, "").slice(0, 10);
  var dataCriacao = $("#dataCriacao").val();
  var stAtivo = $("#stativoEmpresa").val();
  var pis = $("#pis").val();
  var cofins = $("#cofins").val();

  if (UF === "DF") {
    var nuUF = 53

  } else {
    var nuUF = 52

  }

  var dadosEmpresa = [{

    "STGRUPOEMPRESARIAL": 1,
    "IDGRUPOEMPRESARIAL": parseInt(grupoEmpresarial),
    "IDSUBGRUPOEMPRESARIAL": parseInt(grupoEmpresarial),
    "NORAZAOSOCIAL": razaoSocial,
    "NOFANTASIA": noFantasia,
    "NUCNPJ": nuCNPJ,
    "NUINSCESTADUAL": IE,
    "NUINSCMUNICIPAL": IM,
    "CNAE": CNAE,
    "EENDERECO": endereco,
    "ECOMPLEMENTO": complemento,
    "EBAIRRO": bairro,
    "ECIDADE": cidade,
    "SGUF": UF,
    "NUUF": nuUF,
    "NUCEP": CEP,
    "NUIBGE": IBGE,
    "EEMAILPRINCIPAL": email,
    "EEMAILCOMERCIAL": "",
    "EEMAILFINANCEIRO": "",
    "EEMAILCONTABILIDADE": "",
    "NUTELPUBLICO": "",
    "NUTELCOMERCIAL": nuTelefoneComercial,
    "NUTELFINANCEIRO": "",
    "NUTELGERENCIA": "",
    "EURL": "",
    "PATHIMG": "",
    "NUCNAE": CNAE,
    "STECOMMERCE": "False",
    "DTULTATUALIZACAO": dataCriacao,
    "STATIVO": stAtivo,
    "ALIQPIS": parseFloat(pis),
    "ALIQCOFINS": parseFloat(cofins),
    "IDCONFIGURACAO": "",
    "DSNOMEPFX": "",
    "DTVALIDADECERTIFICADO": ""

  }];
 
  if(resp.rows == 0){

      ajaxPost("api/empresa.xsjs", dadosEmpresa)
        .then(funcSucessCadastroEmpresa)
        .catch(funcErroInsereRegistroEmpresa)
  }else{
    funcErrorCadastroEmpresa(dadosEmpresa)
  }
}

function atualizaEmpresa(updateEmpresa) {

  registroUpdateEmpresa = updateEmpresa["data"][0]


  $("#IdGrupoEmpresarial").val(registroUpdateEmpresa["IDGRUPOEMPRESARIAL"]).trigger('change');
  $("#razaoSocial").val(registroUpdateEmpresa["NORAZAOSOCIAL"]);
  $("#nomeFantasia").val(registroUpdateEmpresa["NOFANTASIA"]);
  $("#CNPJ").val(registroUpdateEmpresa["NUCNPJ"]);
  $("#IE").val(registroUpdateEmpresa["NUINSCESTADUAL"]);
  $("#IM").val(registroUpdateEmpresa["NUINSCMUNICIPAL"]);
  $("#CNAE").val(registroUpdateEmpresa["NUCNAE"]);
  $("#endereco").val(registroUpdateEmpresa["EENDERECO"]);
  $("#complemento").val(registroUpdateEmpresa["ECOMPLEMENTO"]);
  $("#bairro").val(registroUpdateEmpresa["EBAIRRO"]);
  $("#cidade").val(registroUpdateEmpresa["ECIDADE"]);
  $("#estado").val(registroUpdateEmpresa["SGUF"]);
  $("#CEP").val(registroUpdateEmpresa["NUCEP"]);
  $("#IBGE").val(registroUpdateEmpresa["NUIBGE"]);
  $("#email").val(registroUpdateEmpresa["EEMAILPRINCIPAL"]);
  $("#telefone").val((registroUpdateEmpresa["NUTELCOMERCIAL"]));
  $("#dataCriacao").val((registroUpdateEmpresa["DTULTATUALIZACAO"]).slice(0, 10));
  $("#stativoEmpresa").val(registroUpdateEmpresa["STATIVO"]);
  $("#pis").val(registroUpdateEmpresa["ALIQPIS"]);
  $("#cofins").val(registroUpdateEmpresa["ALIQCOFINS"]);

}

function valida_update_empresa() {

  if ($("#estado").val() === "DF") {
    var nuUF = 53
  } else {
    var nuUF = 52
  }

  var dadosEmpresaUpdate = [{

    "IDEMPRESA": parseInt($("#IDEmpresaAtualizar").val()),
    "STGRUPOEMPRESARIAL": parseInt($("#IdGrupoEmpresarial").val()),
    "IDGRUPOEMPRESARIAL": parseInt($("#IdGrupoEmpresarial").val()),
    "IDSUBGRUPOEMPRESARIAL": parseInt($("#IdGrupoEmpresarial").val()),
    "NORAZAOSOCIAL": $("#razaoSocial").val(),
    "NOFANTASIA": $("#nomeFantasia").val(),
    "NUCNPJ": $("#CNPJ").val().replace(/\D/g, ""),
    "NUINSCESTADUAL": $("#IE").val(),
    "NUINSCMUNICIPAL": $("#IM").val(),
    "CNAE": $("#CNAE").val(),
    "EENDERECO": $("#endereco").val(),
    "ECOMPLEMENTO": $("#complemento").val(),
    "EBAIRRO": $("#bairro").val(),
    "ECIDADE": $("#cidade").val(),
    "SGUF": $("#estado").val(),
    "NUUF": parseInt(nuUF),
    "NUCEP": $("#CEP").val().replace(/\D/g, ""),
    "NUIBGE": $("#IBGE").val(),
    "EEMAILPRINCIPAL": $("#email").val(),
    "EEMAILCOMERCIAL": "",
    "EEMAILFINANCEIRO": "",
    "EEMAILCONTABILIDADE": "",
    "NUTELPUBLICO": "",
    "NUTELCOMERCIAL": $("#telefone").val().replace(/\D/g, "").slice(0, 10),
    "NUTELFINANCEIRO": "",
    "NUTELGERENCIA": "",
    "EURL": "",
    "PATHIMG": "",
    "NUCNAE": $("#CNAE").val(),
    "STECOMMERCE": "False",
    "DTULTATUALIZACAO": $("#dataCriacao").val(),
    "STATIVO": $("#stativoEmpresa").val(),
    "ALIQPIS": parseFloat($("#pis").val()),
    "ALIQCOFINS": parseFloat($("#cofins").val()),
    "IDCONFIGURACAO": "",
    "DSNOMEPFX": "",
    "DTVALIDADECERTIFICADO": ""
  }];

  ajaxPut("api/empresa.xsjs", dadosEmpresaUpdate)
    .then(funcSucessCadastroEmpresa)
    .catch(funcErroInsereRegistroEmpresa)
}

//----------FuncSucess/FuncError--------------//

function funcSucessCadastroEmpresa() {

  $("#cadEmpresa").modal('hide');

  Swal.fire({
    type: "success",
    title: `Empresa Cadastrada com Sucesso!`,
    showConfirmButton: false,
    timer: 2000
  });

  ListaEmpresas();
}

function funcErrorCadastroEmpresa(data) {

  Swal.fire({
    type: "error",
    title: `A Empresa já tem cadastro no Sistema <br> <br> EMPRESA`,
    html: `<b>${data[0]["NOFANTASIA"]}</b> <br>  CNPJ: <b>${data[0]["NUCNPJ"]}</b>`,
    showConfirmButton: true,
    timer: 15000
  });
}

function funcErrorListaEmpresasSelecPesquisa(data) {

  Swal.fire({
    type: "error",
    title: `Não foi possivel carregar a lista de empresas, ERRO: ${data.message}`,
    showConfirmButton: true,
    timer: 15000
  });
}

function funcErroInsereRegistroEmpresa(data) {

  Swal.fire({
    type: "error",
    title: `Erro ao tentar inserir o registro da EMPRESA, ERRO: ${data.message} `,
    showConfirmButton: true,
  });
}

/////////////////////////////////////////// FIM ROTINA Create/Update EMPRESAS /////////////////////////////////////////

////////////////////////////////////////// INICIO ROTINA Create/Edit CAIXAS EMPRESAS ////////////////////////////////////////

function ListaCaixasEmpresa(id) {

  if (window.XMLHttpRequest) {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;
      newDataTable('listcaixas');

      $('.dataAtual').text(dataAtual);
      $('#IDEmpCaixa').val(id);

      ajaxGet('api/informatica/caixa.xsjs?idEmpresa=' + id)
        .then(retornoTableListCaixasEmpresas)
        .catch(funcErrorListCaixasEmpresas);

      ajaxGet('api/empresa.xsjs?id=' + id)
        .then(retornoTableListCaixasEmpresas)
        .catch(funcErrorListCaixasEmpresas);
    }


  };
  xmlhttp.open("GET", "informatica_action_listcaixa.html", true);
  xmlhttp.send();
}

function retornoTableListCaixasEmpresas(respostaListaCaixasEmpresas) {

  nomeEmpresa = respostaListaCaixasEmpresas.data[0]['NOFANTASIA']

  var tableListaCaixasEmpresas = $('#dt-basic-lista_caixas_empresas').DataTable();

  tableListaCaixasEmpresas.rows().remove().draw();

  if (respostaListaCaixasEmpresas.data[0]['IDCAIXAWEB'] > 0) {

    var ContadorCaixasEmpresas = 0;

    for (var i = 0; i < respostaListaCaixasEmpresas['data'].length; i++) {

      ContadorCaixasEmpresas = ContadorCaixasEmpresas + 1;

      IDCaixa = respostaListaCaixasEmpresas.data[i]['IDCAIXAWEB'];
      DsCaixa = respostaListaCaixasEmpresas.data[i]['DSCAIXA'];
      IDEmpresaCaixa = respostaListaCaixasEmpresas.data[i]['IDEMPRESA'];
      DsEmpresa = respostaListaCaixasEmpresas.data[i]['NOFANTASIA'];
      NuPorta = respostaListaCaixasEmpresas.data[i]['DSPORTACOMUNICACAO'];
      NuSerieNota = respostaListaCaixasEmpresas.data[i]['NUSERIEPROD'];
      NuUltNota = respostaListaCaixasEmpresas.data[i]['NUNFCEPROD'];
      VersaoCaixa = respostaListaCaixasEmpresas.data[i]['VERSAO'];
      TPTEF = respostaListaCaixasEmpresas.data[i]['TIPOTEF'];
      STSituacaoCaixa = respostaListaCaixasEmpresas.data[i]['STATIVO'];

      if (STSituacaoCaixa == 'True') {
        tagCaixaAtivo = '<label style="color: blue;">Ativo</label>';
      } else {
        tagCaixaAtivo = '<label style="color: red;">Inativo</label>';
      }

      tagEditarCaixaBotao = '<div class="btn-group btn-group-xs"><button type="button" class="btn btn-primary btn-xs" title="Editar Caixa" id="' + IDCaixa + '" onclick="modal_Atualiza_Caixa(this.id)" >Editar</button></div>';

      tableListaCaixasEmpresas.row.add([
        `<label style="color: blue; font-size: 11px;">` + IDCaixa + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + DsCaixa + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + NuPorta + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + NuSerieNota + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + NuUltNota + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + VersaoCaixa + `</label>`,
        `<label style="color: blue; font-size: 11px;">` + TPTEF + `</label>`,
        tagCaixaAtivo,
        tagEditarCaixaBotao,
      ]).draw(false);

    }

  }

  $('#NoEmpCaixa').val(nomeEmpresa);

  $('.DescTituloCaixasEmpresa').html(
    `<i class='subheader-icon fal fa-chart-area'></i> Lista de Caixas da Empresa - <span class='fw-300'>` + nomeEmpresa + `</span>`);

}

function funcErrorListCaixasEmpresas(data) {

  if (data.message = "Cannot read properties of undefined (reading 'IDCAIXAWEB')") {
    Swal.fire({
      type: "warning",
      title: 'Empresa sem Caixas registrados, favor cadastrar!',
      showConfirmButton: false,
      timer: 20000
    });

  } else {
    Swal.fire({
      type: "error",
      title: 'Erro ao Carregar os Dados do retornoTableListCaixasEmpresa ' + data.message,
      showConfirmButton: false,
      timer: 20000
    });

  }

}

///////////////////////////////////////// FIM ROTINA Create/Edit CAIXAS EMPRESAS //////////////////////////////////

//////////////////////////////////////// INICIO ROTINA Edit/Update CERTIFICADO///////////////////////////////////////////////

function modal_Atualiza_Cerfificado(id) {

  $.get('informatica_action_cadcertificadomodal.html', async function (res) {

    $('#resultadoModalEmpresa').html(res);
    $("#cadEmpresa").modal('show');
    $('#cadEmpresa').on('shown.bs.modal', function () { });

    $('#IDEmpresaCad').val(id)

    await ajaxGet('api/empresa.xsjs?id=' + id)
      .then(atualizaCertificadoModal)
      .catch(funcError);

    var nomeCertificado = $('#certificado').val()

    if (nomeCertificado != "") {
      $("#footerEmpresa").html(`<button type="button" class="btn btn-success" onclick="valida_update_certificado_empresa()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

    } else {
      $("#footerEmpresa").html(`<button type="button" class="btn btn-success" onclick="valida_update_certificado_empresa()">Cadastrar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

    }

  })
}

function atualizaCertificadoModal(dadosEmpresa) {

  registroUpdateCertEmpresa = dadosEmpresa["data"][0]

  $("#nomeempcad").val(registroUpdateCertEmpresa["NOFANTASIA"]);
  $("#ufEmpresa").val(registroUpdateCertEmpresa["SGUF"]);
  $("#certificado").val(registroUpdateCertEmpresa["DSNOMEPFX"]);
  $("#dtvalidade").val(registroUpdateCertEmpresa["DTVALIDADECERTIFICADO"]);
  $("#configuracao").val(registroUpdateCertEmpresa["IDCONFIGURACAO"]);
  $("#tpFormaEmissao").val(registroUpdateCertEmpresa["TPFORMAEMISSAO"]);
  $("#tpModeloDocFiscal").val(registroUpdateCertEmpresa["TPMODELODOCFISCAL"]);
  $("#tpEmissao").val(registroUpdateCertEmpresa["TPEMISSAO"]);
  $("#tpAmbiente").val(registroUpdateCertEmpresa["TPAMBIENTE"]);
  $("#nuCertificado").val(registroUpdateCertEmpresa["NUCERTIFICADO"]);
  $("#dsCRT").val(registroUpdateCertEmpresa["DSCRT"]);
  $("#idTokenCSC").val(registroUpdateCertEmpresa["IDTOKEN"]);
  $("#tokenCSC").val(registroUpdateCertEmpresa["TOKENCSC"]);

}

function valida_update_certificado_empresa() {

  if ($('#newCertificado').val() === '') {
    $("#AvisoDadosIncompletos").html(
      `<div id="aviso" class=\"alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção!</strong> Favor Inserir o ARQUIVO do Novo Certificado!</div>`
    );
    $("#newCertificado").focus();

    setTimeout(() => { $('#AvisoDadosIncompletos').html("") }, 5000)

    return true;
  }

  if ($('#newCertificado')[0].files[0].type != "application/x-pkcs12") {
    $("#AvisoDadosIncompletos").html(
      `<div id="aviso" class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção!</strong> Favor Inserir Certificado com a Extensão PFX!</div>`
    );
    $("#newCertificado").focus();
    
    setTimeout(() => { $('#AvisoDadosIncompletos').html("") }, 5000)
    
    return false;
  }

  if ($('#newCertificadoValidade').val() === '') {
    $("#AvisoDadosIncompletos").html(
      `<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção!</strong> Favor Inserir a DATA de Validade do Novo Certificado!</div>`
    );
    $("#newCertificadoValidade").focus();
    
    setTimeout(() => { $('#AvisoDadosIncompletos').html("") }, 5000)
    
    return false;
  }

  if ($('#newCertificadoValidade').val() < converte_data(dataAtual)) {
    $("#AvisoDadosIncompletos").html(
      `<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção!</strong> Data Inserida inferior a data Atual, Favor Inserir a DATA de Validade do Novo Certificado!</div>`
    );
    $("#newCertificadoValidade").focus();
    
    setTimeout(() => { $('#AvisoDadosIncompletos').html("") }, 5000)
    
    return false;
  }

  if ($('#senha').val() === '') {
    $("#AvisoDadosIncompletos").html(
      `<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção!</strong> Favor Inserir a SENHA do Novo Certificado!</div>`
    );
    $("#senha").focus();
    
    setTimeout(() => { $('#AvisoDadosIncompletos').html("") }, 5000)
    
    return false;
  }


  var arquivoCertificado = $('#newCertificado')[0].files[0]
  var lerArquivo = new FileReader();

  lerArquivo.onload = function (arquivoCarregado) {

    certificadoBase64 = arquivoCarregado.target.result

    atualizaCertificado(certificadoBase64.slice(33))

  }

  lerArquivo.readAsDataURL(arquivoCertificado)

}

function atualizaCertificado(dadosBase64) {

  var idEmpresa = $('#IDEmpresaCad').val()
  var ufEmpresa = $("#ufEmpresa").val()
  var idConfiguracao = $("#configuracao").val()
  var certificadoBase64 = dadosBase64
  var novoCertificado = $('#newCertificado')[0].files[0].name
  var validadeCertificadoNovo = $('#newCertificadoValidade').val()
  var senhaCertificado = $("#senha").val()
  var dataAlteracao = converte_data(dataAtual)


  certificado = [{

    "IDEMPRESA": parseInt(idEmpresa),
    "UF": ufEmpresa,
    "TPFORMAEMISSAO": "teNormal",
    "TPMODELODOCFISCAL": "moNFCe",
    "TPVERSAOMODFISCAL": "ve400",
    "TPEMISSAO": "libCapicom",
    "TPAMBIENTE": "Homologação",
    "PATHCERTIFICADO": "../spednfe/certs/GTO COMERCIO 2022-2023.pfx",
    "NUCERTIFICADO": "TESTE",
    "PWSENHA": senhaCertificado,
    "TXTDADOSPFX": certificadoBase64,
    "NULOTEPROD": 0,
    "NUULTNFPROD": 0,
    "NULOTHOM": 0,
    "NUULTNFHOM": 0,
    "DSCRT": "crtRegimeNormal",
    "STATUALIZA_XML": "False",
    "STEXIBIRERROSCHEMA": "False",
    "ST_CRIARPASTAMENSALMENTE": "True",
    "ST_SEPARARARQ_CNPJCERTIFICADO": "True",
    "DSFORMATOALERTA": "[ %TAGNIVEL%%TAG% ]   %DESCRICAO% - %MSG%",
    "IDTOKEN": "1",
    "TOKENCSC": "380C6C5FE43544E3B6EA75012C02809A",
    "STRETIRARACENTOSXML": "False",
    "STSALVARARQUIVOENVIORESPOSTA": "True",
    "PATHSALVARARQUIVOSENVIORESP": "C:\\\\QUALITY\\\\FISCAL\\\\ARQRESP",
    "PATHARQXDS_SCHEMA": "C:\\\\QUALITY\\\\FISCAL\\\\SCHEMAS\\\\NFE",
    "PATH_ARQNFE": "C:\\\\QUALITY\\\\FISCAL\\\\NFE",
    "PATH_ARQCANCELADO": "C:\\\\QUALITY\\\\FISCAL\\\\CANCELADOS",
    "PATH_ARQ_CARTACORRECAO": "C:\\\\QUALITY\\\\FISCAL\\\\CCORRECAO",
    "PATH_ARQINUTILIZACAO": "C:\\\\QUALITY\\\\FISCAL\\\\Inutilizados",
    "PATH_ARQ_DPEC": "C:\\\\QUALITY\\\\FISCAL\\\\DPEC",
    "PATH_ARQ_EVENTO": "C:\\\\QUALITY\\\\FISCAL\\\\EVENTOS",
    "PATH_LOGO": "img/imagens/empresa/87/",
    "DTULTALTERACAO": dataAlteracao,
    "DSNOMEPFX": novoCertificado,
    "STCERTIFICADO": "True",
    "DTVALIDADECERTIFICADO": validadeCertificadoNovo,
    "CNPJ_AUTXML": "11098707000107",
    "DSPATHNFCE": "",
    "ST_SAP_ONLINE": "True"
  }]

  if ($("#certificado").val() != '') {

    ajaxPut('api/configuracao/todos.xsjs', certificado)
      .then(funcSuccessCertificado)
      .catch(funcErrorCertificado);

  } else {
   
    ajaxPost('api/configuracao/todos.xsjs', certificado)
      .then(funcSuccessCertificado)
      .catch(funcErrorCertificado);

  }

}

//------FuncSucess/FuncError----------------//
function funcSuccessCertificado() {
  $("#cadEmpresa").modal('hide');

  Swal.fire({
    type: "success",
    title: `Certificado Atualizado com Sucesso!`,
    showConfirmButton: false,
    timer: 2000
  });

  ListaEmpresas();
}
function funcErrorCertificado(e) {
  $("#cadEmpresa").modal('hide');

  Swal.fire({
    type: "error",
    title: `Erro ao tentar inserir o Certificado, ERRO: ${e.message} `,
    showConfirmButton: true,
  });
}
//////////////////////////////////////// FIM ROTINA Edit/Update CERTIFICADO////////////////////////////////////////

//////////////////// ROTINA RELATORIO BI ////////////////////
// Leandro Massafera - 07/12/2022
function ListaRelatorioBI(){

    dataRetornoRelatorioBI = [];
	numPage = 1;

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

        	ajaxGet('api/informatica/relatoriobi.xsjs?page=' + numPage)
                .then(retornoListaRelatorioBI)
                .catch(funcError);
		}
	};

	xmlhttp.open("GET", "informatica_action_relatoriobi.html", true);
	xmlhttp.send();
}

// Retorno das buscas dos Relatórios BI
function retornoListaRelatorioBI(respostaListaRelatorioBI) {
                    
    var numPageAtual = parseInt(respostaListaRelatorioBI.page);
	var BtnOpcao = "";

    if(respostaListaRelatorioBI.data.length != 0){
        for (var i=0; i < respostaListaRelatorioBI.data.length; i++) { 

            var registro = respostaListaRelatorioBI.data[i];

            IdRelatorioBI = registro.IDRELATORIOBI;
            DescRelatorioBI = registro.DSRELATORIOBI;
            
            if(registro.STATIVO === 'True'){
                Status = 'ATIVO';
            } else {
                Status = 'INATIVO';
            }
            BtnOpcao = `<div class="btn-group btn-group-xs">
                            <button type="button" class="btn btn-success btn-xs" title="Alterar" id="` + IdRelatorioBI + `:` + DescRelatorioBI + `:` + Status + `" onclick="modal_RelatorioBI(this.id)" >Alterar</button>
                        </div>`;

            dataRetornoRelatorioBI.push([IdRelatorioBI
                ,DescRelatorioBI
                ,Status
                ,BtnOpcao]);
        }
        
        chamarProximaListaRelatorioBI(numPageAtual + 1); 
    }
    else{
        $('#resultadorelatoriobi').html(
			`<table id="dt-basic-relatoriobi" class="table table-bordered table-hover table-striped w-100">
				<thead class="bg-primary-600">
					<tr>
						<th>ID Relatório</th>
						<th>Descrição</th>
						<th>Status</th>
						<th>Opções</th>
					</tr>
				</thead>
			</table>`
        );
	   
	   $('#dt-basic-relatoriobi').DataTable( {
            data: dataRetornoRelatorioBI,
            "columnDefs": [
                { "width": "10%", "targets": 0 },
                { "width": "60%", "targets": 1 },
                { "width": "20%", "targets": 2 },
                { "width": "10%", "targets": 3 }
            ],
			order: [
				[0, 'desc'],
			],
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

// Chama Proxima Lista do Relatorio BI
function chamarProximaListaRelatorioBI(numPage){

    ajaxGet('api/informatica/relatoriobi.xsjs?page=' + numPage)
		.then(retornoListaRelatorioBI)
		.catch(funcError);
}

// Modal para Incluir/Alterar Relatorio BI
function modal_RelatorioBI(id) {

    if (parseInt(id) > 0) {
        idchave = id.split(":");
        id = idchave[0];
        descrelatoriobi = idchave[1];
        stativo = idchave[2] === "ATIVO" ? "True" : "False";
    }

    $.get('informatica_action_relatoriobimodal.html', function(res){

        $('#resultadomodalrelatoriobi').html(res);
        $("#cadrelatoriobi").modal('show');
        $('#IdRelatorioBI').val(id);
        $('#cadrelatoriobi').on('shown.bs.modal', function() {});
        
        if (parseInt(id) > 0) {
            $('#descrelatoriobi').val(descrelatoriobi);
            $("#stativorelatoriobi").val(stativo);
            $("#footermodalrelatoriobi").html(`<button type="button" class="btn btn-success" onclick="alterar_RelatorioBI()">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        } else {
            $("#footermodalrelatoriobi").html(`<button type="button" class="btn btn-success" onclick="inserir_RelatorioBI()">Cadastrar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        }

    })

}

// Função para Inserir Relatorio BI
function inserir_RelatorioBI(){

    var descrelatoriobi = $("#descrelatoriobi").val();
    var stativorelatoriobi = $("#stativorelatoriobi").val();

    var dados = [{
        "DSRELATORIOBI": descrelatoriobi.toUpperCase()
        ,"STATIVO": stativorelatoriobi
    }];

  	ajaxPost("api/informatica/relatoriobi.xsjs", dados)
		.then(alerta_cadastrado_sucesso(retornoListaRelatorioBI))
		.catch(funcError);
    
    $('#cadrelatoriobi').modal('hide');
}

// Função para Alterar Relatorio BI
function alterar_RelatorioBI(){

    var idrelatoriobi = $("#IdRelatorioBI").val();
    var descrelatoriobi = $("#descrelatoriobi").val();
    var stativorelatoriobi = $("#stativorelatoriobi").val();

    var dados = [{
        "IDRELATORIOBI": parseInt(idrelatoriobi)
        ,"DSRELATORIOBI": descrelatoriobi.toUpperCase()
        ,"STATIVO": stativorelatoriobi
    }];

  	ajaxPut("api/informatica/relatoriobi.xsjs", dados)
		.then(alerta_atualizado_sucesso(retornoListaRelatorioBI))
		.catch(funcError);
    
    $('#cadrelatoriobi').modal('hide');
}
//////////////////// FIM ROTINA RELATORIO BI ////////////////

//////////////////// SELECT RELATORIO BI ////////////////////
function retornoListaRelatorioBISelect(respostaListaRelatorioBI) {
    
    $('#idrelatoriobi').empty();
    $('#idrelatoriobi').append(
	    `<option value="">Selecione ...</option>`
	);

    for (var i = 0; i < respostaListaRelatorioBI.data.length; i++) {

        IDRelatorioBI = respostaListaRelatorioBI.data[i]['IDRELATORIOBI'];
        DSRelatorioBI = respostaListaRelatorioBI.data[i]['DSRELATORIOBI'];

        $('#idrelatoriobi').append(
            `<option value="` + IDRelatorioBI + `"> ` + DSRelatorioBI + `</option>`
        );

    }
}

function retornoListaRelatorioBISelectModal(respostaListaRelatorioBI) {
    
    $('#idlinkrelatoriobimodal').empty();
    $('#idlinkrelatoriobimodal').append(
	    `<option value="">Selecione ...</option>`
	);

    for (var i = 0; i < respostaListaRelatorioBI.data.length; i++) {

        IDRelatorioBI = respostaListaRelatorioBI.data[i]['IDRELATORIOBI'];
        DSRelatorioBI = respostaListaRelatorioBI.data[i]['DSRELATORIOBI'];

        $('#idlinkrelatoriobimodal').append(
            `<option value="` + IDRelatorioBI + `"> ` + DSRelatorioBI + `</option>`
        );

    }

    $("#idlinkrelatoriobimodal").val(idrelatoriobimodalselected).trigger('change');
}

function retornoListaRelatorioBISelectModalImportar(respostaListaRelatorioBI) {
    
    $('#idlinkrelatoriobimodalimportar').empty();
    $('#idlinkrelatoriobimodalimportar').append(
	    `<option value="">Selecione ...</option>`
	);

    for (var i = 0; i < respostaListaRelatorioBI.data.length; i++) {

        IDRelatorioBI = respostaListaRelatorioBI.data[i]['IDRELATORIOBI'];
        DSRelatorioBI = respostaListaRelatorioBI.data[i]['DSRELATORIOBI'];

        $('#idlinkrelatoriobimodalimportar').append(
            `<option value="` + IDRelatorioBI + `"> ` + DSRelatorioBI + `</option>`
        );

    }
}
//////////////////// FIM SELECT RELATORIO BI ////////////////////

//////////////////// SELECT FILIAL LINK RELATORIO BI MODAL /////
function retornoListaEmpresasSelectRelBi(respostaListaEmpresas) {
 
    for (var i = 0; i < respostaListaEmpresas.data.length; i++) {

		IDEmpresa = respostaListaEmpresas.data[i]['IDEMPRESA'];
		DSEmpresa = respostaListaEmpresas.data[i]['NOFANTASIA'];

            $('#idfilialmodal').append(
                `<option value="` + IDEmpresa + `"> ` + DSEmpresa + `</option>`
            );
	}

    $("#idfilialmodal").val(idfilialRelBIModal).trigger('change');

}
//////////////////// FIM SELECT FILIAL LINK RELATORIO BI MODAL //

//////////////////// ROTINA LINK RELATORIO BI ////////////////////
// Leandro Massafera - 07/12/2022
function ListaLinkRelatorioBI(){

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			document.getElementById("js-page-content").innerHTML = xmlhttp.responseText;

            $("#idloja").select2();
            $("#idrelatoriobi").select2();

            ajaxGet('api/informatica/empresa.xsjs')
        		.then(retornoListaEmpresasSelect)
        		.catch(funcErrorListaEmpresasSelect);

        	ajaxGet('api/informatica/relatoriobi.xsjs')
                .then(retornoListaRelatorioBISelect)
                .catch(funcError);
		}
	};

	xmlhttp.open("GET", "informatica_action_linkrelatoriobi.html", true);
	xmlhttp.send();
}

// Retorno das buscas dos Relatórios BI
function retornoListaLinkRelatorioBI(respostaListaLinkRelatorioBI) {
                    
    var numPageAtual = parseInt(respostaListaLinkRelatorioBI.page);
	var BtnOpcao = "";

    if(respostaListaLinkRelatorioBI.data.length != 0){
        for (var i=0; i < respostaListaLinkRelatorioBI.data.length; i++) { 

            var registro = respostaListaLinkRelatorioBI.data[i];

            IdRelatorioBI = registro.IDRELATORIOBI;
            IdFilial = registro.IDEMPRESA;
            Relatorio = registro.DSRELATORIOBI;
            Filial = registro.NOFANTASIA;
            Link = registro.LINK;
            
            if(registro.STATIVO === 'True'){
                Status = 'ATIVO';
            } else {
                Status = 'INATIVO';
            }
            BtnOpcao = `<div class="btn-group btn-group-xs">
                            <button type="button" class="btn btn-success btn-xs" title="Alterar" id="` + IdRelatorioBI + `|` + IdFilial + `|` + Link + `|` + Status + `" onclick="modal_LinkRelatorioBI(this.id)" >Alterar</button>
                        </div>`;

            dataRetornoLinkRelatorioBI.push([Filial
                ,Relatorio
                ,Status
                ,BtnOpcao]);
        }
        
        chamarProximaListaLinkRelatorioBI(numPageAtual + 1); 
    }
    else{
        $('#resultadolinkrelatoriobi').html(
			`<table id="dt-basic-linkrelatoriobi" class="table table-bordered table-hover table-striped w-100">
				<thead class="bg-primary-600">
					<tr>
                        <th>Filial</th>
                        <th>Relatório</th>
                        <th>Status</th>
                        <th>Opções</th>
					</tr>
				</thead>
			</table>`
        );
	   
	   $('#dt-basic-linkrelatoriobi').DataTable( {
            data: dataRetornoLinkRelatorioBI,
            "columnDefs": [
                { "width": "40%", "targets": 0 },
                { "width": "30%", "targets": 1 },
                { "width": "20%", "targets": 2 },
                { "width": "10%", "targets": 3 }
            ],
			order: [
				[0, 'desc'],
			],
            deferRender:    true,
            //scrollY:        800,
            //scrollCollapse: false,
            //scroller:       false,
            responsive: true,
            dom:        "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                        "<'row'<'col-sm-12'tr>>" +
                        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
            buttons: [
                        {
                            extend: 'pdfHtml5',
                            text: 'PDF',
                            titleAttr: 'Generate PDF',
                            className: 'btn-outline-danger btn-sm mr-1'
                        },
                        {
                            extend: 'excelHtml5',
                            text: 'Excel',
                            titleAttr: 'Generate Excel',
                            className: 'btn-outline-success btn-sm mr-1'
                        },
                        {
                            extend: 'print',
                            text: 'Print',
                            titleAttr: 'Print Table',
                            className: 'btn-outline-primary btn-sm'
                        }
                    ]
        } );
        
    }
}

// Chama Proxima Lista do Relatorio BI
function chamarProximaListaLinkRelatorioBI(numPage){

    ajaxGet('api/informatica/linkrelatoriobi.xsjs?page=' + numPage)
		.then(retornoListaLinkRelatorioBI)
		.catch(funcError);
}

// Modal para Incluir/Alterar Link Relatorio BI
function modal_LinkRelatorioBI(id) {

    if (parseInt(id) > 0) {
        idchave = id.split("|");
        id = idchave[0];
        idfilial = idchave[1];
        link = idchave[2];
        stativo = idchave[3] === "ATIVO" ? "True" : "False";
    }

    $.get('informatica_action_linkrelatoriobimodal.html', function(res){

        $('#resultadomodallinkrelatoriobi').html(res);
        $("#cadlinkrelatoriobi").modal('show');
        $('#cadlinkrelatoriobi').on('shown.bs.modal', function() {});

        $("#idfilialmodal").select2({
            dropdownParent: $("#cadlinkrelatoriobi")
        });

        $("#idlinkrelatoriobimodal").select2({
            dropdownParent: $("#cadlinkrelatoriobi")
        });

        ajaxGet('api/informatica/empresa.xsjs')
            .then(retornoListaEmpresasSelectRelBi)
            .catch(funcErrorListaEmpresasSelect);

        ajaxGet('api/informatica/relatoriobi.xsjs?stativo=True')
            .then(retornoListaRelatorioBISelectModal)
            .catch(funcError);

        if (parseInt(id) > 0) {
            
            idfilialRelBIModal = idfilial;
            $('#idfilialmodal').prop("disabled", true);

            idrelatoriobimodalselected = id;
           
            $('#stativorelatoriobi').val(stativo);
            $('#linkrelatoriobi').val(link);
            $("#footermodallinkrelatoriobi").html(`<button type="button" class="btn btn-success" onclick="alterar_LinkRelatorioBI(`+id+`)">Atualizar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        } else {
            $("#footermodallinkrelatoriobi").html(`<button type="button" class="btn btn-success" onclick="inserir_LinkRelatorioBI()">Cadastrar</button>
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);
        }

    })

}

// Função para Inserir Link Relatorio BI
function inserir_LinkRelatorioBI(){

    var idfilialmodal = $("#idfilialmodal").val();
    var idlinkrelatoriobimodal = $("#idlinkrelatoriobimodal").val();
    var stativorelatoriobi = $("#stativorelatoriobi").val();
    var linkrelatoriobi = $("#linkrelatoriobi").val();

    var dados = [{
        "IDRELATORIOBI": parseInt(idlinkrelatoriobimodal)
        ,"IDEMPRESA": parseInt(idfilialmodal)
        ,"LINK": linkrelatoriobi
        ,"STATIVO": stativorelatoriobi
    }];

  	ajaxPost("api/informatica/linkrelatoriobi.xsjs", dados)
		.then(alerta_cadastrado_sucesso(ListaLinkRelatorioBI))
		.catch(funcError);
    
    $('#cadlinkrelatoriobi').modal('hide');
}

// Função para Alterar Link Relatorio BI
function alterar_LinkRelatorioBI(id){

    var idfilialmodal = $("#idfilialmodal").val();
    var idlinkrelatoriobimodal = $("#idlinkrelatoriobimodal").val();
    var stativorelatoriobi = $("#stativorelatoriobi").val();
    var linkrelatoriobi = $("#linkrelatoriobi").val();

    var dados = [{
        "IDRELATORIOBI": parseInt(idlinkrelatoriobimodal)
        ,"IDEMPRESA": parseInt(idfilialmodal)
        ,"LINK": linkrelatoriobi
        ,"STATIVO": stativorelatoriobi
        ,"IDRELATORIOBIANTIGO": parseInt(id)
    }];

  	ajaxPut("api/informatica/linkrelatoriobi.xsjs", dados)
		.then(alerta_atualizado_sucesso(ListaLinkRelatorioBI))
		.catch(funcError);
    
    $('#cadlinkrelatoriobi').modal('hide');
}

// Função para Pesquisar os Link Relatorio BI
function pesq_LinkRelatorioBI(){

    dataRetornoLinkRelatorioBI = [];
	numPage = 1;

    var idloja = $("#idloja").val();
    var idrelatoriobi = $("#idrelatoriobi").val();

	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xmlhttp = new XMLHttpRequest();
	} else {
		// code for IE6, IE5
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            document.getElementById("resultadolinkrelatoriobi").innerHTML = xmlhttp.responseText;

            ajaxGet('api/informatica/linkrelatoriobi.xsjs?page=' + numPage + '&id=' + idrelatoriobi + '&idfilial=' + idloja)
                .then(retornoListaLinkRelatorioBI)
                .catch(funcError);
		}
	};

	xmlhttp.open("GET", "informatica_action_linkrelatoriobi.html", true);
	xmlhttp.send();

}

// Função para Importar todos os link's dos relatório BI 
function importar_LinkRelatorioBI(){

    $.get('informatica_action_importarlinkrelatoriobimodal.html', function(res){

        $('#resultadomodalimportarlinkrelatoriobi').html(res);
        $("#cadimportarlinkrelatoriobi").modal('show');
        $('#cadimportarlinkrelatoriobi').on('shown.bs.modal', function() {});

        $("#idlinkrelatoriobimodalimportar").select2({
            dropdownParent: $("#cadimportarlinkrelatoriobi")
        });

        ajaxGet('api/informatica/relatoriobi.xsjs?stativo=True')
            .then(retornoListaRelatorioBISelectModalImportar)
            .catch(funcError);

        $("#footermodalimportarlinkrelatoriobi").html(`<button type="button" class="btn btn-success" onclick="inserir_ImportarLinkRelatorioBI()">Importar</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>`);

    })

}

// Função inserção dos dados
function inserir_ImportarLinkRelatorioBI(){

    var file = importarlinkrelatoriobi.files[0];
    var reader = new FileReader();
    var dados = [];
    var idlinkrelatoriobimodal = $("#idlinkrelatoriobimodalimportar").val();

    reader.readAsText(file);

    reader.onload = function(){

        const text = this.result;
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            idchave = lines[i].split(";");
            dados[i] = {
                "IDRELATORIOBI": parseInt(idlinkrelatoriobimodal)
                ,"IDEMPRESA": parseInt(idchave[0])
                ,"LINK": idchave[1]
                ,"STATIVO": "True"
            };
        }
        ajaxPost("api/informatica/linkrelatoriobi.xsjs", dados)
		    .then(alerta_cadastrado_sucesso(ListaLinkRelatorioBI))
		    .catch(funcError);
    
        $('#cadimportarlinkrelatoriobi').modal('hide');
    };

    reader.onerror = function() {
        Swal.fire({
            type: "error",
            title: "Erro ao Carregar Arquivo => " + reader.error,
            showConfirmButton: true,
            timer: 2000
        });
    };

}

function ListaPromocao() {
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest();
  } else {
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      document.getElementById("js-page-content").innerHTML = `
        <iframe src="https://quality-web.vercel.app/" style="width:100%;height:200vh;border:none;"></iframe>
      `;
    }
  };

  xmlhttp.open("GET", "informatica_action_promocao.html", true);
  xmlhttp.send();
}
//////////////////// FIM ROTINA LINK RELATORIO BI ////////////////

///////////////////////////////////////////////////////////// INÍCIO Rotina - Lista Empresas //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////// Gabriel Figueredo - 27/08/2023 /////////////////////////////////////////////////////////////

async function listarEmpresas() {
      animationLoadingStart();

      try {

        await $.get("informatica_action_listaempresas.html", (respHtml) => {$("#js-page-content").html(respHtml)}); 

        await ajaxGet('api/empresa.xsjs').then(retornoEmpresasSelect);
        
      } catch (error) {
        msgError(error);
      };

      pesquisarEmpresas();

      animationLoadingStop();
};

function retornoEmpresasSelect(respostaEmpresasSelect) {

    const {data} = respostaEmpresasSelect;

    let dadosSelectEmpresas = []
  
    for (let registro of data){
  
      let idEmpresa = registro.IDEMPRESA;
      let dsEmpresa = registro.NOFANTASIA;
  
      dadosSelectEmpresas.push({
        idEmpresa,
        dsEmpresa
      })
  
    }
  
    dadosSelectEmpresas.sort(function (a, b) {
      if (a.idEmpresa > b.idEmpresa) {
        return 1;
      }
  
      if (a.idEmpresa < b.idEmpresa) {
        return -1;
      }
      return 0;
    })
  
    for (const elemento of dadosSelectEmpresas) {
      $('#idloja').append( `<option value="${elemento.idEmpresa}">${elemento.dsEmpresa}</option>`);
    }

    $('#idloja').select2()
}

async function pesquisarEmpresas() {
    let idEmpresa = $("#idloja").val();

    try{
        await $.get("informatica_action_pesqempresas.html", (respHtml) => {$("#resultado").html(respHtml)}); 

        await ajaxGet(`api/empresa.xsjs?id=${idEmpresa}`).then(retornoPesquisaListaEmpresa);
    } catch(error) {
      msgError(error);
    };

}

function retornoPesquisaListaEmpresa(respostaPesquisaListaEmpresa) {
    const {data} = respostaPesquisaListaEmpresa;
    let dadosRetornoEmpresas = [];

    if (data.length != 0) {
        for(let registro of data) {

            let idEmpresa = registro.IDEMPRESA;
            let dsEmpresa = registro.NOFANTASIA;
            let email = registro.EEMAILPRINCIPAL;
            let telefone = registro.NUTELGERENCIA;
            let opcoes = 
            `
              <button type="button" title="Detalhar" class="btn btn-primary btn-sm" onclick="detalharEmpresa(${idEmpresa})"><i class="fal fa-list"></i></button>
              <button type="button" title="Editar" class="btn btn-success btn-sm " onclick="editarEmpresa(${idEmpresa})"><i class="fal fa-edit"></i></button>
            `;
          
            dadosRetornoEmpresas.push([
                idEmpresa,
                dsEmpresa,
                email,
                mascaraTelefone(telefone),
                opcoes
            ]);
        }

        criarDataTableEmpresas(dadosRetornoEmpresas);
    } else {
       msgError(error);
    }
}

function criarDataTableEmpresas(data) {
  $('#dt-basic-pesqempresas').DataTable({
    data: data,
    deferRender: true,
    columnDefs: [
        { width: 25, targets: 0 },
        { width: 200, targets: 1 },
        { width: 200, targets: 2 },
        { width: 200, targets: 3 },
        { width: 100, targets: 4 }
    ],
    responsive: true,
    dom: "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
    buttons: [
      {
        extend: 'pdfHtml5',
        text: 'PDF',
        titleAttr: 'Generate PDF',
        className: 'btn-outline-danger btn-sm mr-1'
      },
      {
        extend: 'excelHtml5',
        text: 'Excel',
        titleAttr: 'Generate Excel',
        className: 'btn-outline-success btn-sm mr-1'
      },
      {
        extend: 'print',
        text: 'Print',
        titleAttr: 'Print Table',
        className: 'btn-outline-primary btn-sm'
      }
    ]
  });
}

function detalharEmpresa(idEmpresa) {
  try{
    $.get('informatica_action_detalharempresamodal.html', async (res) => {
        $('#resultadoModalDetalheEmpresa').html(res);
        $('#detalheEmpresa').modal('show');
        $("#footerDetalheEmpresa").html(
          `
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
          `
        );

        await ajaxGet(`api/empresa.xsjs?id=${idEmpresa}`).then(retornoDetalhePesquisaEmpresa);

    });
    
  } catch(error) {
      msgError(error);
    }
}

function retornoDetalhePesquisaEmpresa(respostaDetalhePesquisaEmpresa) {
    let registro = respostaDetalhePesquisaEmpresa.data[0];

    $('#IdGrupoEmpresarial').val(registro.IDGRUPOEMPRESARIAL);
    $('#status').val(registro.STATIVO);
    $('#dataCriacao').val(registro.DTULTATUALIZACAO.slice(0, 10));
    $('#nomeFantasia').val(registro.NOFANTASIA);
    $('#cep').val(mascaraCep(registro.NUCEP));
    $('#endereco').val(registro.EENDERECO);
    $('#complemento').val(registro.ECOMPLEMENTO);
    $('#bairro').val(registro.EBAIRRO);
    $('#cidade').val(registro.ECIDADE);
    $('#estado').val(registro.SGUF);
    $('#email').val(registro.EEMAILPRINCIPAL);
    $('#telefone').val(mascaraTelefone(registro.NUTELGERENCIA));

}

async function editarEmpresa(idEmpresa) {
  try{
      await $.get('informatica_action_detalharempresamodal.html', async (res) => {
        $('#resultadoModalDetalheEmpresa').html(res);
        $('#detalheEmpresa').modal('show');

        $('#IDEmpresaAtualizar').val(idEmpresa);

        if (idEmpresa > 0) {

          await ajaxGet(`api/empresa.xsjs?id=${idEmpresa}`).then(retornoDadosEmpresa);

          $(`
            #div-pai #status, #div-pai #cep, #div-pai #endereco, 
            #div-pai #complemento, #div-pai #bairro, #div-pai #cidade, 
            #div-pai #estado, #div-pai #telefone`).prop({"disabled": false, "readonly": false});

          $("#footerDetalheEmpresa").html(
            `
              <button type="button" class="btn btn-success" onclick="atualizarEmpresa()">Atualizar</button>
              <button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>
            `
          );
        };
    });
  } catch(error) {
      msgError(error);
    };
}

function retornoDadosEmpresa(respAtualizarEmpresa) {
    let registro = respAtualizarEmpresa.data[0];

    $("#IdGrupoEmpresarial").val((registro.IDGRUPOEMPRESARIAL));
    $("#razaoSocial").val(registro.NORAZAOSOCIAL);
    $("#nomeFantasia").val(registro.NOFANTASIA);
    $("#cnpj").val(registro["NUCNPJ"]);
    $("#inscricaoEstadual").val(registro.NUINSCESTADUAL);
    $("#inscricaoMunicipal").val(registro.NUINSCMUNICIPAL);
    $("#cnae").val(registro.NUCNAE);
    $("#endereco").val(registro.EENDERECO);
    $("#complemento").val(registro.ECOMPLEMENTO);
    $("#bairro").val(registro.EBAIRRO);
    $("#cidade").val(registro.ECIDADE);
    $("#estado").val(registro.SGUF);
    $("#cep").val(mascaraCep(registro.NUCEP));
    $("#ibge").val(registro.NUIBGE);
    $("#email").val(registro.EEMAILPRINCIPAL);
    $("#telefone").val(mascaraTelefone(registro.NUTELGERENCIA));
    $("#dataCriacao").val((registro.DTULTATUALIZACAO).slice(0, 10));
    $("#status").val(registro.STATIVO);
    $("#pis").val(registro.ALIQPIS);
    $("#cofins").val(registro.ALIQCOFINS);
}

async function validarDadosEmpresa(){

  let nuUF = $("#estado").val() === "DF" ? 53: 52;

  let dados = [{
        "STGRUPOEMPRESARIAL": Number($("#IdGrupoEmpresarial").val()),
        "IDGRUPOEMPRESARIAL": Number($("#IdGrupoEmpresarial").val()),
        "IDSUBGRUPOEMPRESARIAL": Number($("#IdGrupoEmpresarial").val()),
        "NORAZAOSOCIAL": $("#razaoSocial").val(),
        "NOFANTASIA": $("#nomeFantasia").val(),
        "NUCNPJ": $("#cnpj").val(),
        "NUINSCESTADUAL": $("#inscricaoEstadual").val(),
        "NUINSCMUNICIPAL": $("#inscricaoMunicipal").val(),
        "CNAE": $("#cnae").val(),
        "EENDERECO": $("#endereco").val(),
        "ECOMPLEMENTO": $("#complemento").val(),
        "EBAIRRO": $("#bairro").val(),
        "ECIDADE": $("#cidade").val(),
        "SGUF": $("#estado").val(),
        "NUUF": Number(nuUF),
        "NUCEP": limparMascara($("#cep").val()),
        "NUIBGE": $("#ibge").val(),
        "EEMAILPRINCIPAL": $("#email").val(),
        "NUTELGERENCIA": limparMascara($("#telefone").val()),
        "NUCNAE": $("#cnae").val(),
        "STECOMMERCE": "False",
        "DTULTATUALIZACAO": $("#dataCriacao").val(),
        "STATIVO": $("#status").val(),
        "ALIQPIS": parseFloat($("#pis").val()),
        "ALIQCOFINS": parseFloat($("#cofins").val()),
        "IDEMPRESA": Number($("#IDEmpresaAtualizar").val())
    }];

    const resp = await msgQuestion();

    if(resp.value) {
      return dados;
    } else { 
      return false;
    }
    
}

async function atualizarEmpresa() {

    let dados = await validarDadosEmpresa();

    if(dados) {

      let textdados = JSON.stringify(dados);

      let dadosLog = [
          {
              "IDFUNCIONARIO": IDFuncionarioLogin.toString(),
              "PATHFUNCAO": "INFORMATICA/EDICAO EMPRESA",
              "DADOS": textdados,
              "IP": ipCliente
          }
      ];

      try {
        await ajaxPut('api/empresa.xsjs', dados);
        await ajaxPost("api/log-web.xsjs", dadosLog);
        funcSuccessUpdateEmpresa();
      } catch(error) {
        msgError(error);
      }
    } else {
      // faça nada
    }

}

function funcSuccessUpdateEmpresa() {
    alerta_atualizado_sucesso();
    $('#detalheEmpresa').modal('hide');
    pesquisarEmpresas();
}

///////////////////////////////////////////////////////////// FIM Rotina - Lista Empresas //////////////////////////////////////////////////////