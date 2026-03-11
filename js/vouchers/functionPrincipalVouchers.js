///////////////////////////////////////////////////////////// INICIO Rotina - Create Edit Cancel - VOUCHER  //////////////////////////////////////////////////////
//---Variaveis Globais das funçoes da rotina---//

var usuario = getCurrentUser()?.user;
usuario || LogoffUser();

var IDEmpresaLogin = usuario['IDEMPRESA'];
var IDListaEmp = usuario['ID_LISTA_LOJA'];
var NOEmpresaLogin = usuario['NOFANTASIA'];
var IDFuncionarioLogin = usuario['id'];
var NomeFuncionarioLogin = usuario['NOFUNCIONARIO'];


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
var hora = data.getHours();          // 0-23
var min = data.getMinutes();        // 0-59
var seg = data.getSeconds();

var DSdesc = '';// 0-59


diaFormatado = String(dia);
mesatual = (mes + 1);
mesFormatado = String(mesatual);

var dataAtual = diaFormatado.padStart(2, '0') + '/' + (mesFormatado.padStart(2, '0')) + '/' + ano4;

let dataAtualCampo = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');
let horaAtualCampo = hora + ':' + min + ':' + seg;

let dataAtualCampo3Meses = ano4 + '-' + (mesFormatado.padStart(2, '0')) + '-' + diaFormatado.padStart(2, '0');

let horaStr = String(hora);
let minStr = String(min);
let horaAtual = horaStr.padStart(2, '0') + ':' + minStr.padStart(2, '0');

function logout() {
    LogoffUser();
    window.location.href = 'index.html';
}

//========== INICIO Rotina - Create Edit Cancel - VOUCHER ==========//
// Autor: Hendryw Deyvison
// E-mail: hendryw.deyvison@gmail.com
// Data: 15/07/2024
// Data Atualizacao: 23/09/2024

//---Variaveis Globais das funçoes da rotina---//
var id = 0;
var dadosVendaTabela = [];
var idProd = 0;
var dadosProdutoTabela = [];
var ctdPreencheCNPJ = 0;
var valorProdutosVoucher = [];
var dataRetornoVendaDetalheVoucher = [];
var dadosListaVoucher = [];
var dadosUpdateVoucher = [];
var voucher = [];
var detalheVoucher = [];
var vendaDetalheVoucher = [];

//----------INICIO Funcoes Globais da Rotina----------//

function mascaraMulti(dados, funcao) {
    v_obj = dados
    v_fun = funcao
    setTimeout('execmascara()', 1)
}

function mascaraMultiAutomatica(dados) {
    v_obj = dados;
    setTimeout('execmascaraAutomatica()', 1)
}

function execmascaraAutomatica() {
    v_obj.value = v_obj.value.length > 15 ? Cnpj(v_obj.value) : Cpf(v_obj.value)
}

function execmascara() {
    v_obj.value = v_fun(v_obj.value)
}

function onlyNum(valor) {
    valor = String(valor).replace(/\D/g, "")
    return valor;
}

// Mascara do CPF
function Cpf(valor) {
    valor = String(valor).replace(/\D/g, "");

    if (valor) {
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    }

    return valor
}

// Mascara do CNPJ
function Cnpj(valor) {
    valor = String(valor).replace(/\D/g, "")

    if(valor){
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")

        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")

        valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2")

        valor = valor.replace(/(\d{4})(\d)/, "$1-$2")
    }

    return valor
}

// Mascara do TELEFONE
function Fone(valor) {

    //Remove tudo o que não é dígito
    valor = String(valor).replace(/\D/g, "")

    if (valor) {
        valor = valor.replace(/^(\d{0})(\d)/, "$1($2")

        valor = valor.replace(/(\d{2})(\d)/, "$1) $2")

        valor = valor.replace(/(\d{3})(\d)/, "$1$2-")

        if (valor.length > 14) {
            valor = valor.replace(/\D/g, '')
            valor = valor.replace(/(\d{2})(\d)/, "($1) $2")
            valor = valor.replace(/(\d)(\d{8})$/, "$1 $2")
            valor = valor.replace(/(\d)(\d{4})$/, "$1-$2")

        }
    }

    return valor


}

// Mascara do CEP
function Cep(valor) {
    valor = String(valor).replace(/\D/g, "");

    if (valor) {
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2")

        valor = valor.replace(/(\d{3})(\d)/, "$1-$2")
    }

    return valor
}

//	função que mascara o CPF
function maskCPF(CPF) {
    return CPF.substring(0, 3) + "." + CPF.substring(3, 6) + "." + CPF.substring(6, 9) + "-" + CPF.substring(9, 11);
}

//	função que mascara o CNPJ
function maskCNPJ(CNPJ) {
    return CNPJ.substring(0, 2) + "." + CNPJ.substring(2, 5) + "." + CNPJ.substring(5, 8) + "/" + CNPJ.substring(8, 12) + "-" + CNPJ.substring(12, 14);
}

//	função que mascara o TELEFONE
function maskFone(Fone) {
    //Remove tudo o que não é dígito
    let valor = Fone.replace(/\D/g, "")
    
    if(valor){
        valor = valor.replace(/^(\d{0})(\d)/, "$1($2")
        
        valor = valor.replace(/(\d{2})(\d)/, "$1) $2")
            
        valor = valor.replace(/(\d{3})(\d)/, "$1$2-")
        
        if (valor.length > 14) {
            valor = valor.replace(/\D/g, '')
            valor = valor.replace(/(\d{2})(\d)/, "($1) $2")
            valor = valor.replace(/(\d)(\d{8})$/, "$1 $2")
            valor = valor.replace(/(\d)(\d{4})$/, "$1-$2")
            
        }
    }

    return valor
}

//	função que mascara o CEP
function maskCEP(CEP) {
    return CEP.substring(0, 2) + "." + CEP.substring(2, 5) + "-" + CEP.substring(5, 8);
}

//	função que mascara o VALOR
function maskValor(valor) {
    return new Intl.NumberFormat('br-BR', { style: 'currency', currency: 'BRL' }).format(valor)
}

//funcao OnlyNumbers
function onlyNumberKey(event) {
    var key = window.event ? event.keyCode : event.which;

    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if (key < 48 || key > 57) {
        return false;
    } else {
        return true;
    }

}

function ValidaCpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
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
        cpf == "99999999999") {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    // Valida 1o digito	
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9))) {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    // Valida 2o digito	
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10))) {
        Swal.fire({
            type: 'error',
            title: 'CPF Inválido, verifique o CPF digitado e tente novamente',
            timer: 15000
        })
        $("#CPFCNPJ").val('');
        $("#CPFCNPJ").focus();
    }
    return true;
}

async function ValidaCNPJ(cnpj) {
    let stCnpj = true;
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') stCnpj = false;

    if (cnpj.length != 14)
        stCnpj = false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999") {
        stCnpj = false;
    }
    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0)) {
        stCnpj = false;
    }
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1)) {
        stCnpj = false;
    }

    if(!stCnpj){
        return Swal.fire({
            type: 'error',
            title: 'CNPJ Inválido, verifique o CNPJ digitado e tente novamente',
            timer: 15000
        }).then(()=>{
            $("#CPFCNPJ").val('').focus()

            return false;
        })
    }

    return true;

}

async function validaCEP(cep, verificarNaApi = false) {
    const regex = /^[0-9]{5}-?[0-9]{3}$/;
    
    if (!regex.test(cep)){
        return false;
    }

    if(verificarNaApi){
        let respCep = await getDadosEnderecoViaCep_API_externa(cep);

        return !(respCep?.erro == 'true'); 
    }

    return true;
}

function validaTelefoneOrCelular(telefoneOrCelular) {
    telefoneOrCelular = String(telefoneOrCelular).replace(/\D/g, "");

    if (telefoneOrCelular?.length < 10) return false;

    const regex = /^(\(?\d{2}\)?\s?)?(\d{4,5}\-?\d{4})$/;
    return regex.test(telefoneOrCelular);
}

function validaEmail(email) {
    email = String(email);

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Converter número no formato string para número por extenso.
String.prototype.extenso = function (c) { // Função para converter número no formato string para número por extenso.
    var ex = [
        ["Zero", "Um", "Dois", "Três", "Quatro", "Cinco", "Seis", "Sete", "Oito", "Nove", "Dez", "Onze", "Doze", "Treze", "Quatorze", "Quinze", "Dezesseis", "Dezessete", "Dezoito", "Dezenove"],
        ["Dez", "Vinte", "Trinta", "Quarenta", "Cinquenta", "Sessenta", "Setenta", "Oitenta", "Noventa"],
        ["Cem", "Cento", "Duzentos", "Trezentos", "Quatrocentos", "Quinhentos", "Seiscentos", "Setecentos", "Oitocentos", "Novecentos"],
        ["Mil", "Milhão", "Bilhão", "Trilhão", "Quadrilhão", "Quintilhão", "Sextilhão", "Setilhão", "Octilhão", "Nonilhão", "Decilhão", "Undecilhão", "Dodecilhão", "Tredecilhão", "Quatrodecilhão", "Quindecilhão", "Sedecilhão", "Septendecilhão", "Octencilhão", "Nonencilhão"]
    ];
    var a, n, v, i, n = this.replace(c ? /[^,\d]/g : /\D/g, "").split(","), e = " e ", $ = "Real", d = "Centavo", sl;
    for (var f = n.length - 1, l, j = -1, r = [], s = [], t = ""; ++j <= f; s = []) {
        j && (n[j] = (("." + n[j]) * 1).toFixed(2).slice(2));
        if (!(a = (v = n[j]).slice((l = v.length) % 3).match(/\d{3}/g), v = l % 3 ? [v.slice(0, l % 3)] : [], v = a ? v.concat(a) : v).length) continue;
        for (a = -1, l = v.length; ++a < l; t = "") {
            if (!(i = v[a] * 1)) continue;
            i % 100 < 20 && (t += ex[0][i % 100]) ||
                i % 100 + 1 && (t += ex[1][(i % 100 / 10 >> 0) - 1] + (i % 10 ? e + ex[0][i % 10] : ""));
            s.push((i < 100 ? t : !(i % 100) ? ex[2][i == 100 ? 0 : i / 100 >> 0] : (ex[2][i / 100 >> 0] + e + t)) +
                ((t = l - a - 2) > -1 ? " " + (i > 1 && t > 0 ? ex[3][t].replace("ão", "ões") : ex[3][t]) : ""));
        }
        a = ((sl = s.length) > 1 ? (a = s.pop(), s.join(" ") + e + a) : s.join("") || ((!j && (n[j + 1] * 1 > 0) || r.length) ? "" : ex[0][0]));
        a && r.push(a + (c ? (" " + (v.join("") * 1 > 1 ? j ? d + "s" : (/0{6,}$/.test(n[0]) ? "de " : "") + $.replace("l", "is") : j ? d : $)) : ""));
    }
    return r.join(e);
}

function retornaDiasEntreDatas(dataHoraInicio = "", dataHoraFim = "", zerarHorario = true) {
    dataHoraInicio = dataHoraInicio ? new Date(dataHoraInicio) : new Date();
    dataHoraFim = dataHoraFim ? new Date(dataHoraFim) : new Date();

    if (zerarHorario) {
        dataHoraInicio.setUTCHours(0, 0, 0, 0);
        dataHoraFim.setUTCHours(0, 0, 0, 0);
    }

    return Math.ceil(Math.abs(dataHoraFim - dataHoraInicio) / (1000 * 60 * 60 * 24));
}

function validar_Cpf(cpf) {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf == '') return false;
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
        cpf == "99999999999") {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }

    // Valida 1o digito
    add = 0;
    for (i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(9))) {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }
    // Valida 2o digito	
    add = 0;
    for (i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i);
    rev = 11 - (add % 11);
    if (rev == 10 || rev == 11)
        rev = 0;
    if (rev != parseInt(cpf.charAt(10))) {

        $("#nuCPFCNPJmodal").focus();
        return false;
    }
    return true;
}

function validar_Cnpj(cnpj) {

    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj == '') return false;

    if (cnpj.length != 14)
        return false;

    // Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999")
        return false;
    $("#nuCPFCNPJmodal").focus();

    // Valida DVs
    tamanho = cnpj.length - 2
    numeros = cnpj.substring(0, tamanho);
    digitos = cnpj.substring(tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(0))
        return false;
    $("#nuCPFCNPJmodal").focus();

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2)
            pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado != digitos.charAt(1))
        return false;
    $("#nuCPFCNPJmodal").focus();

    return true;

}

function animationLoadingFormClient(msg = 'Enviando dados do Cliente, aguarde...') {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-success alert-dismissible fade show text-center" role="alert" style="margin: auto !important; text-align: center !important">
          <button type="button" class="btn text-primary">
                <span class="spinner-border spinner-border-sm text-primary"></span>
                ${msg}
            </button>
        </div>
    `);
}

function msgSuccessFormCliente(msgSuccess = 'Dados Carregados Com Sucesso') {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true"><i class="fal fa-times"></i></span>
            </button><strong>Atenção!</strong> 
            ${msgSuccess}!</div>
      
    `);

    $('#notificacaoModalCadastroCliente button').focus();
}

function msgWarningCadastroCliente(element = $('#notificacaoModalCadastroCliente'), msgError, stUltimaInstancia = true) {
    $('#notificacaoModalCadastroCliente').html(`
        <div class="alert alert-danger alert-dismissible h6 fade show" role="alert">
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">
                    <i class="fal fa-times"></i>
                </span>
            </button>
            <span>
                <strong>Atenção!</strong> ${msgError}
            </span>
        </div>
    `);

    $('#notificacaoModalCadastroCliente button').focus();

    !stUltimaInstancia && animationLoadingStop();

    if ($(element).hasClass('select2')) {
        setTimeout(() => $(element).select2('open').focus(), 1000);
    } else {
        setTimeout(() => {
            let vlElement = $(element).val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") || "";
            
            $(element).val(vlElement).focus();
        }, 1000);
    }
}

function returnMsgClientInsertOrUpdateSuccess(stUltimaInstancia, cpfOuCnpj) {
    $('#detClienteVoucher, #detVoucherProdutos, #detVendaVoucher').modal('hide');

    if (!stUltimaInstancia) {
        return msgSuccess('Cliente Cadastrado/Atualizado com Sucesso!');
    } else {
        $('#nuCPFCNPJmodal').val(cpfOuCnpj.length > 11 ? maskCNPJ(cpfOuCnpj) : maskCPF(cpfOuCnpj))
        
        $('#swal2-validation-message').html(`
            <h6 class="text-success fw-700" >CLIENTE CADASTRADO/ATUALIZADO COM SUCESSO, CONFIRME PARA GERAR O VOUCHER!</h6>
        `);
    }

}

async function verificaSePrecisaAtualizarCadastroCliente(cliente){
    let propsCliente = [
        "TPCLIENTE",
        "DSNOMERAZAOSOCIAL",
        "DSAPELIDONOMEFANTASIA",
        "NUCPFCNPJ",
        "NURGINSCESTADUAL",
        "NUCEP",
        "NUIBGE",
        "EENDERECO",
        "EBAIRRO",
        "ECIDADE",
        "SGUF",
        "EEMAIL",
        "NUTELCOMERCIAL",
        "NUTELCELULAR",
        "IDINDICACAOIE",
    ];

    let stValido = true;

    for (prop of propsCliente) {
        if (cliente["TPCLIENTE"] !== 'JURIDICA'){
            if (prop == "DSAPELIDONOMEFANTASIA" && !cliente["DSAPELIDONOMEFANTASIA"]){
                continue;
            }
        }

        if ( !String(cliente[prop])?.trim()) {
            stValido = false;
            break;
        }
    }

    return stValido;
}

///----------FIM Funcoes Globais da Rotina----------///

///----------INICIO Funçoes com API´s Externas ---------------------///

//---Traz todos os dados do CNPJ(IE e Token CSC), porém, tem acesso limitado a 3 consultas por minuto
const URL_PUBLICAWS = 'https://publica.cnpj.ws/cnpj/{CNPJ}';
const URL_MINHA_RECEITA = 'https://minhareceita.org/{CNPJ}';
const URL_RECEITAWS = 'https://www.receitaws.com.br/v1/cnpj/{CNPJ}';
const URL_VIA_CEP = 'https://viacep.com.br/ws/{CEP}/json/'

async function getDadosCNPJRedundancia_API_externa(cnpj) {
    return $.get(URL_RECEITAWS.replace('{CNPJ}', cnpj))
        .then((data) => {
            let { status, message } = data || undefined;

            if (status == 'OK') {
                status = 200;
            }

            if (status !== 200) {
                throw { status, message }
            }

            return { status, data }
        })
        .catch((respError) => {
            let { status, message } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            return { status, message }
        }).done((data) => data.descApi = "API-receitaws");
}

async function getDadosCNPJComIE_API_externa(cnpj) {
    return $.get(URL_PUBLICAWS.replace('{CNPJ}', cnpj))
        .then((data) => {
            let status = data?.status || 200;

            if (status == 'OK') {
                status = 200;
            }

            return { status, data }
        })
        .catch((respError) => {
            let { status, message, responseJSON } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            message = responseJSON?.detalhes || responseJSON?.message; 

            return { status, message }
        })
        .done((data) => data.descApi = "API-publicaws");
}

async function getDadosExistenciaCNPJ_API_externa(cnpj) {
    let data = await $.get(URL_MINHA_RECEITA.replace('{CNPJ}', cnpj))
        .then((data) => { return { status: 200, data } })
        .catch((respError) => { 
            let { status, message } = respError || undefined;

            if (status == 'ERROR') {
                status = 400;
            }

            message = respError?.responseText ? JSON.parse(respError?.responseText)?.message : undefined;

            return { status, message } 
        }).done((data) => data.descApi = "API-minhareceita");

    if (data?.status !== 200 && data?.status !== 400) {
        return await getDadosCNPJRedundancia_API_externa(cnpj);
    }

    return data;
}

//--Traz o endereço de acordo com o CEP
async function getDadosEnderecoViaCep_API_externa(cep) {
    cep = cep.replace(/\D/g, "");

    return $.get(URL_VIA_CEP.replace('{CEP}', cep))
        .then((data) => {
            let { erro, status} = data || undefined;

            if (!erro) {
                status = 200;
            }

            if (status !== 200) {
                throw { status: 429, message: 'CEP INVÁLIDO OU NÃO ENCONTRADO, verifique e tente novamente!' }
            }

            return { status, data}
        })
        .catch((respError) => {
            let { status, message, statusText } = respError || undefined;

            message = statusText || message;

            return { status, message }
        })
}

//--Traz todas as UFs
function get_UFs() {
    return $.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome&view=nivelado');
}

//--Traz todas as cidades da UF
function get_Cidades_UF(idUF) {
    return $.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${idUF}/municipios?view=nivelado`);
}

//--Traz todos os bairros da cidade
function get_Bairros_Cidade(idCidade) {
    return $.get(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${idCidade}/subdistritos?view=nivelado`)
}

async function busca_e_valida_dados_empresa_com_API_externa(cnpjCliente, stUltimaInstancia = false){
    cnpjCliente = cnpjCliente?.replace(/\D/g, "");

    let objCliente = await getDadosExistenciaCNPJ_API_externa(cnpjCliente);
    let inscricaoEstadual;
    let razao;
    let fantasia;
    let cnae;
    let dataCriacaoEmpresa;
    let cep;
    let endereco;
    let numeroEndereco;
    let complemento;
    let email;
    let tel1;
    let tel2;

    if (objCliente?.status == 200) {
        const dadosComIE = await getDadosCNPJComIE_API_externa(cnpjCliente);

        if (dadosComIE.status == 200){
            objCliente = dadosComIE;
        } 

    } else {
        !stUltimaInstancia && msgError(objCliente?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!');
        return msgWarningCadastroCliente($("#CPFCNPJ"), objCliente?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!')
    }

    dadosCNPJ = objCliente.data;
    razao = dadosCNPJ?.razao_social || dadosCNPJ?.nome || "";
    fantasia = dadosCNPJ?.estabelecimento?.nome_fantasia || dadosCNPJ?.fantasia || dadosCNPJ?.nome_fantasia || razao;
    inscricaoEstadual = dadosCNPJ?.estabelecimento?.inscricoes_estaduais[0]?.inscricao_estadual || "";
    cnae = dadosCNPJ?.estabelecimento?.atividade_principal?.id || dadosCNPJ?.atividade_principal[0].code || dadosCNPJ?.cnae_fiscal || ""
    dataCriacaoEmpresa = dadosCNPJ?.estabelecimento?.data_inicio_atividade || dadosCNPJ?.data_situacao || dadosCNPJ?.data_inicio_atividade || "";
    tel1 = (dadosCNPJ?.estabelecimento?.ddd1 + dadosCNPJ?.estabelecimento?.telefone1) || dadosCNPJ?.telefone || (dadosCNPJ?.ddd_telefone || dadosCNPJ?.ddd_telefone_1) || "";
    tel2 = (dadosCNPJ?.estabelecimento?.ddd2 + dadosCNPJ?.estabelecimento?.telefone2) || dadosCNPJ?.ddd_telefone_2 || "";
    email = dadosCNPJ?.estabelecimento?.email || dadosCNPJ?.email || "";
    cep = dadosCNPJ?.estabelecimento?.cep || dadosCNPJ?.cep || "";
    endereco = dadosCNPJ?.estabelecimento?.logradouro || dadosCNPJ?.logradouro || "";
    numeroEndereco = dadosCNPJ?.estabelecimento?.numero || dadosCNPJ?.numero || "";
    complemento = dadosCNPJ?.estabelecimento?.complemento || dadosCNPJ?.complemento || "";

    return {
        razao,
        fantasia,
        inscricaoEstadual,
        cnae,
        dataCriacaoEmpresa,
        tel1,
        tel2,
        email,
        cep,
        endereco,
        numeroEndereco,
        complemento,
    };
}

async function preenche_cadastro_empresa_com_dados_de_API_externa(cnpjCliente, stUltimaInstancia = false) {
    let {
        razao,
        fantasia,
        inscricaoEstadual,
        cnae,
        dataCriacaoEmpresa,
        tel1,
        tel2,
        email,
        cep,
        endereco,
        numeroEndereco,
        complemento,
    } = await busca_e_valida_dados_empresa_com_API_externa(cnpjCliente, stUltimaInstancia) || "";

    if (razao) {

        cnae = cnae?.replace(/\D/g, "") ? cnae : "";
        tel1 = tel1 ? tel1?.replace(/\D/g, "") : "";
        tel2 = tel2 ? tel2?.replace(/\D/g, "") : tel1;
        cep = cep ? cep?.replace(/\D/g, "") : "";

        tel1 = tel1 ? maskFone(tel1) : "";
        tel2 = tel2 ? maskFone(tel2) : "";
        cep = cep ? maskCEP(cep) : "";

        $("#IE").val(inscricaoEstadual)
        $("#CNAE").val(cnae);
        $("#DataNascimentoCriacao").val(dataCriacaoEmpresa);
        $("#NomeClienteRazao").val(razao);
        $('#sobrenomeNomeFan').val(fantasia)
        $("#NuCEP").val(cep);
        $("#Endereco").val(endereco);
        $("#NuEndereco").val(numeroEndereco);
        $("#Complemento").val(complemento);
        $("#email").val(email);
        $("#TelefoneCliente").val(tel1);
        $('#TelefoneClienteEmpresaComercial').val(tel2);

        if(cep) {
            await valida_e_preenche_cep_empresa_com_API_externa(cep, stUltimaInstancia);
        }
        
        return true;
    }

    return false;
}

async function valida_dados_cliente_em_ultima_instancia(cpfOrCnpjCliente, stAtualizaCadastro = false) {
    try {
        $('#notificacaoModalCadastroCliente').html(``);

        cpfOrCnpjCliente = cpfOrCnpjCliente?.replace(/\D/g, "");

        if(!stAtualizaCadastro){
            if ($('#tipoClienteEmpresa').val() == 'CNPJ') {
                animationLoadingFormClient('Carregando dados do Cliente direto da Receita Federal, aguarde...');

                let status_preenchimento = await preenche_cadastro_empresa_com_dados_de_API_externa(cpfOrCnpjCliente, true);

                $('#CadCliente').removeClass('d-none').attr('onclick', 'validaDadosDoFormCliente(true)');

                if (status_preenchimento) {
                    msgSuccessFormCliente('Preenchimento Realizado Com Sucesso!');
                }

            } else {
                msgSuccessFormCliente('CPF Válido, prossiga com o restante do cadastro!');
            }

        } else {
            modalCadastroCliente(cpfOrCnpjCliente, true);
        }
    } catch (error) {
        msgWarningCadastroCliente(undefined, 'Error ao Validar os dados, recarregue e tente novamente!');
        console.log(error);
    }
}

async function modal_Preenchimento_CNPJ(cnpjEmpresaVoucherSemFormato, stUltimaInstancia = false) {
    let cnpjEmpresaVoucher = cnpjEmpresaVoucherSemFormato.replace(/\D/g, "")

    if (validar_Cnpj(cnpjEmpresaVoucher)) {
    
        if (!stUltimaInstancia){
            return Swal.fire({
                title: 'Deseja Autocompletar ou Atualizar as Informações deste Cliente Automaticamente de Acordo Com o Cadastro na Receita Federal?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sim',
                cancelButtonText: 'Não',
            }).then(async (result) => {
                if (result.value == true) {
                    animationLoadingStart("Carregando os dados do CNPJ... Por favor aguarde!");


                    let status = await preenche_cadastro_empresa_com_dados_de_API_externa(cnpjEmpresaVoucher);

                    if (status) {
                        await msgSuccess('Dados Preenchidos com Sucesso!');
                    }

                    $('#select2-idIndicacaoIE-container').focus();
                }
            })
        }

        animationLoadingFormClient('Buscando Dados, aguarde...');

        await preenche_cadastro_empresa_com_dados_de_API_externa(cnpjEmpresaVoucher, stUltimaInstancia);

        $('#notificacaoModalCadastroCliente').html('');

        return true;
    } else {
        msgWarningCadastroCliente(undefined, 'CNPJ Inválido, verifique e tente atualizar novamente!')
    }
}

async function valida_e_preenche_cep_empresa_com_API_externa(cepSemFormato, stUltimaInstancia = false) {
    let cep = cepSemFormato?.replace(/\D/g, "");

    try{

        if(cep){
            if (await validaCEP(cep)) {
                let dadosCep = await getDadosEnderecoViaCep_API_externa(cep).then((resp)=>{ 
                   if(resp.status !== 200){
                        throw resp 
                   }

                   return resp.data;
                })
                

                $("#Endereco").val(dadosCep?.logradouro);
                $("#Bairro").val(dadosCep?.bairro);
                $("#Cidade").val(dadosCep?.localidade);
                $("#Estado").val(dadosCep?.uf);
                $("#NuIBGE").val(dadosCep?.ibge);

                if($('#tipoClienteEmpresa').val() == 'CPF'){
                    $('#idIndicacaoIE').val((dadosCep?.uf == 'DF' ? 2 : 9)).trigger('change');
                }

            } else{
                $("#Bairro, #NuIBGE, #Cidade, #Estado").val('');

                !stUltimaInstancia && msgError('CEP Inválido, verifique e tente novamente!');
                return msgWarningCadastroCliente($('#NuCEP'), 'CEP Inválido, verifique e tente novamente!');
            }
        }

    }catch (e) {
        console.log("Erro ao retornar o autocomplete pelo CEP, ERROR: " + (e?.message || e));

        !stUltimaInstancia && msgError(e?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!');
        return msgWarningCadastroCliente(undefined, e?.message || 'Erro ao tentar preencher os dados do cliente, recarregue e tente novamente!')

    }

}

///----------FIM Funçoes com API´s Externas ---------------------///

///----------INICIO Modais de Interação Com o Usuario----------///
async function modalAuthUserCreateVoucher(idVenda, stTipoTroca) {
    let dadosUser;
    let dataUserLogado = await getCurrentUser()?.user;
    let lojaLogada = dataUserLogado?.IDEMPRESA;
    let grupoLojaLogada = dataUserLogado?.IDGRUPOEMPRESARIAL;
    let htmlModalAuth = `
        <div class="text-dark fw-900">

            <label class="form-label" for="matricula">Matricula</label>
            <div class="input-group">
                <input id="matricula" class="swal2-input z-index-5 mt-0 w-75" type="text" autocomplete="off" placeholder="Digite sua Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
            </div>

            <label class="form-label" for="senha">Senha</label>
            <div class="input-group">
                <input id="senha" class="swal2-input mt-0 w-75" type="password" autocomplete="off" placeholder="Digite sua Senha" style="text-align: center;">
            </div>

        </div>
    `;

    return Swal.fire({
        title: 'Autorização',
        html: htmlModalAuth,
        width: '20rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        onOpen: () => {
            $('#matricula').on('keypress', (e) => { if (e.keyCode == 13) $('#senha').val('').focus() });
            $('#senha').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });

            $('#swal2-validation-message').addClass('text-danger fw-700');
        },
        didOpen: () => {
            $('#matricula').focus();
        },
        preConfirm: async () => {
            let matricula = $('#matricula').val()?.trim();
            let senha = $('#senha').val()?.trim();
            let loginFunc;

            if (!matricula || !senha) {
                !matricula ? $('#matricula').val('').focus() : $('#senha').val('').focus();
                return Swal.showValidationMessage('Campo de Matrícula ou Senha vazio');
            }

            loginFunc = {
                "MATRICULA": matricula,
                "SENHA": senha,
                "IDEMPRESALOGADA": lojaLogada,
                "IDGRUPOEMPRESARIAL": grupoLojaLogada,
                "IDVENDA": idVenda,
                "STTIPOTROCA": stTipoTroca
            };

            return ajaxPost(`api/resumo-voucher/auth-funcionario-create-voucher.xsjs`, loginFunc)
                .then(async (response) => {
                    let { data } = response;

                    dadosUser = data[0];
                })
                .catch((returnError) => {
                    let { error } = returnError;

                    Swal.hideLoading();

                    console.log(returnError);
                    $('#matricula').focus();

                    return Swal.showValidationMessage(error || 'Erro ao tentar validar o usuário, recarregue e tente novamente!');
                })
        }
    }).then(async (result) => {
        if (result.value) {
            return dadosUser;
        }

        return false;
    })
}

async function modalAuthUserEditOrPrintVoucher(idVoucher = '', MODOPRINT = false) {
    let dadosUser;
    let dataUserLogado = await getCurrentUser()?.user;
    let lojaLogada = dataUserLogado?.IDEMPRESA;
    let grupoLojaLogada = dataUserLogado?.IDGRUPOEMPRESARIAL;
    let htmlModalAuth = `
        <div class="text-dark fw-900">

            <label class="form-label" for="matricula">Matricula</label>
            <div class="input-group">
                <input id="matricula" class="swal2-input z-index-5 mt-0 w-75" type="text" autocomplete="off" placeholder="Digite sua Matrícula" style="text-align: center;" onkeypress="mascaraMulti(this, onlyNum)">
            </div>

            <label class="form-label" for="senha">Senha</label>
            <div class="input-group">
                <input id="senha" class="swal2-input mt-0 w-75" type="password" autocomplete="off" placeholder="Digite sua Senha" style="text-align: center;">
            </div>

        </div>
    `;

    return Swal.fire({
        title: 'Autorização',
        html: htmlModalAuth,
        width: '20rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
        onOpen: () => {
            $('#matricula').on('keypress', (e) => { if (e.keyCode == 13) $('#senha').val('').focus() });
            $('#senha').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });

            $('#swal2-validation-message').addClass('text-danger fw-700');
        },
        didOpen: () => {
            $('#matricula').focus();
        },
        preConfirm: async () => {
            let matricula = $('#matricula').val().trim();
            let senha = $('#senha').val().trim();
            let loginFunc;

            if (!matricula || !senha) {
                !matricula ? $('#matricula').val('').focus() : $('#senha').val('').focus();
                return Swal.showValidationMessage('Campo de Matrícula ou Senha vazio');
            }

            loginFunc = {
                "MATRICULA": matricula,
                "SENHA": senha,
                "IDVOUCHER": idVoucher,
                "IDEMPRESALOGADA": lojaLogada,
                "IDGRUPOEMPRESARIAL": grupoLojaLogada
            };

            let api = !MODOPRINT ? 'auth-funcionario-update-voucher' : 'auth-funcionario-print-voucher';

            return ajaxPost(`api/resumo-voucher/${api}.xsjs`, loginFunc)
                .then(async (response) => {
                    let { data } = response;

                    dadosUser = data[0];
                })
                .catch((returnError) => {
                    let { error } = returnError;
                    console.log(returnError);
                    $('#matricula').focus();
                    return Swal.showValidationMessage(error || 'Error ao tentar validar o usuário, recarregue e tente novamente!');
                })
        }
    }).then(async (result) => {
        if (result.value) {
            return dadosUser;
        }

        return false;
    })
}

async function modalMotivoCriacaoVoucher() {
    let motivoTroca;

    return Swal.fire({
        title: 'Motivo da troca?',
        html: `
            <div class="d-block m-auto">
                <div class="input-group d-block text-dark text-left pt-0">
                    <input type="text" id="motivoTroca" class="swal2-input m-0" autocomplete="off" placeholder="Digite o Motivo" style="text-transform: uppercase">
                    <small class="fw-700">*Mínimo 10 caracteres</small>
                </div>
            </div>
        `,
        width: '25rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        onOpen: () => {

            $('#motivoTroca').on('keyup', (e) => {
                $('#motivoTroca').val(e.target.value?.replace(/[^a-zA-Z0-9\s]/g, '')?.replace(/\s{2,}/g, ' '));
            });

            $('#motivoTroca').focus().on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() });
            $('#swal2-validation-message').addClass(' text-danger fw-700');

        },
        preConfirm: () => {
            motivoTroca = $('#motivoTroca').val()?.trim();

            if (!motivoTroca?.length || motivoTroca?.length < 10) {
                $('#motivoTroca').focus();
                return Swal.showValidationMessage(`Adicione o Motivo da Troca Com no Mínimo 10 Caracteres!`);
            }

            if (motivoTroca?.length > 200) {
                $('#motivoTroca').focus();
                return Swal.showValidationMessage(`Motivo da Troca Está Muito Grande, Abrevie!`);
            }
        }
    }).then((result) => {
        if (result.value) {
            return motivoTroca;
        }

        return false;
    })
}

async function modalCpfOuCnpjDoClienteParaVoucher(cpfCnpjCliente) {
    let dadosCliente;

    return Swal.fire({
        title: 'Insira o CPF ou CNPJ do cliente',
        html: `
            <div class="d-block m-auto" style="width: 50%;">
                <div class=" input-group text-dark pt-0 mb-3" >
                    <input type="text" id="nuCPFCNPJmodal" class="swal2-input m-0 " maxlength="18" autocomplete="off" onkeyup="mascaraMultiAutomatica(this)" onpaste="mascaraMultiAutomatica(this)" placeholder="Digite o CPF/CNPJ" >
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        onOpen: () => {
            cpfCnpjCliente = cpfCnpjCliente?.replace(/\D/g, "");

            $('#nuCPFCNPJmodal').focus().val(cpfCnpjCliente || '').on('keypress', (e) => {
                if (e.keyCode == 13) {
                    Swal.clickConfirm();
                } else {
                    Swal.resetValidationMessage();
                }
            });

            $('#swal2-validation-message').addClass(' text-danger fw-700');
        },
        preConfirm: async () => {
            let CPFCNPJFormatado = $('#nuCPFCNPJmodal').val()?.replace(/\D/g, "");

            $('#swal2-validation-message').addClass('text-danger fw-700');

            if (CPFCNPJFormatado?.length) {
                
                if (CPFCNPJFormatado?.length <= 11 && !validar_Cpf(CPFCNPJFormatado)) {
                    $('#nuCPFCNPJmodal').val(maskCPF(CPFCNPJFormatado));
                    return Swal.showValidationMessage('CPF Inválido, verifique o CPF digitado e tente novamente');

                }

                if (CPFCNPJFormatado.length > 11 && !validar_Cnpj(CPFCNPJFormatado)) {
                    $('#nuCPFCNPJmodal').val(maskCNPJ(CPFCNPJFormatado));
                    return Swal.showValidationMessage('CNPJ Inválido, verifique o CNPJ digitado e tente novamente');

                }
                return new Promise(async (resolve, reject)=>{

                    await ajaxGet(`api/cliente/todos.xsjs?numeroCpfCnpj=${CPFCNPJFormatado}`)
                        .then(async (response) => {
                            let { data } = response || [];

                            if (!data?.length) {
                                setTimeout(() => {
                                    abreCadastroClienteSemRegistroUltimaInstancia(CPFCNPJFormatado, false);

                                    resolve()
                                }, 5000)
                                return Swal.showValidationMessage(`Cliente sem cadastro, Faça o cadastro ou verifique o CPF/CNPJ inserido! Abrindo tela de cadastro, aguarde...`)
                            } else {
                                dadosCliente = data[0];

                                let stAtualizado = await verificaSePrecisaAtualizarCadastroCliente(dadosCliente);

                                if (!stAtualizado) {

                                    setTimeout(() => {
                                        abreCadastroClienteSemRegistroUltimaInstancia(CPFCNPJFormatado, true);

                                        resolve()
                                    }, 5000)

                                    $('#swal2-validation-message').removeClass('text-danger').addClass('text-info');

                                    return Swal.showValidationMessage(`Cliente com cadastro desatualizado, Atualize os dados! Abrindo cadastro do cliente, aguarde...`);
                                }
                            
                            }

                            Swal.resetValidationMessage();
                            dadosCliente = data[0];

                            resolve();
                        })
                        .catch((error) => {
                            console.log(error);
                            Swal.hideLoading();
                            setTimeout(()=>reject(), 1000);

                            Swal.resetValidationMessage();

                            return Swal.showValidationMessage('Erro ao buscar dados do cliente, recarregue e tente novamente!')
                        })
                    })
            } else {
                Swal.resetValidationMessage();

                return Swal.showValidationMessage('CPF ou CNPJ Vazio, Digite e Tente Novamente');
            }
        }
    }).then((result) => {
        if (result.value) {
            return dadosCliente;
        }

        return false;
    })

}

async function modalDeSelecaoDeTipoDeTroca() {
    let tipoTroca;

    return Swal.fire({
        title: 'Tipo da troca?',
        html: `<div class="d-block m-auto" style="width: 50%;">
                <label class="form-label" for="matricula">Tipo</label>
                <div class="pb-2">
                    <select id="tipoTroca" class="select2">
                        <option value=''>Selecione</option>
                        <option value='CORTESIA'>CORTESIA</option>
                        <option value='DEFEITO'>DEFEITO</option>
                    </select>
                </div>
            </div>`,
        width: '25rem',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Sair',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        backdrop: true,
        onOpen: () => {
            $('#tipoTroca').select2();
            $('#tipoTroca').select2('focus');

            $('#swal2-validation-message').addClass('text-danger fw-700');

            $('#tipoTroca').on('select2:select', () => {
                $('button.swal2-confirm').focus();
                $('swal2-container').on('keypress', (e) => { if (e.keyCode == 13) Swal.clickConfirm() })
            })
        },
        preConfirm: () => {
            tipoTroca = $('#tipoTroca').val();

            if (!tipoTroca) {
                $('#tipoTroca').val('').trigger('change');
                $('#tipoTroca').select2("focus");

                return Swal.showValidationMessage(`Selecione o Tipo da Troca Antes de Prosseguir!`);;

            }
        }
    }).then(async (result) => {
        if (result.value) {
            return tipoTroca;
        }

        return false;
    });
}

///----------FIM Modais de Interação Com o Usuario----------///

async function telaCriacaoEdicaoVouchers(stReloadingHtml, idVoucher) {
    try {
        if (stReloadingHtml) {
            animationLoadingStart();

            await $.get("gerencia_action_tela_search_and_create_voucher.html", async (respHtml) => {
                $("#js-page-content").html(respHtml);

                $('.dataAtual').text(dataAtual);

                $('#dtconsultainicio').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });
                $('#dtconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });

                $('#NVoucher').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVoucherEmitido() });

                $('#NVoucher').focus();

                $('.DescTituloVoucher').html(`
                    <i class='subheader-icon fal fa-chart-area'></i> Vouchers
                `);

                animationLoadingStop();

                if (!idVoucher) {
                    await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?idEmpresa=${IDEmpresaLogin}&stStatus='EM ANALISE'`, 'Carregando Dados...')
                        .then(retornoListaVouchersEmProcessamento)
                        .catch((error) => { throw error; });
                } else {
                    await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...')
                        .then(retornoListaVouchers)
                        .catch((error) => { throw error; })
                }

            }).fail((error) => { throw error; })

        } else {
            $('#btnCadCliente').attr('value', '');
            $('#btnCadVoucher').addClass('d-none');
            $('.tabelaProduto').addClass('d-none');
            $("#resultadoProduto").DataTable().clear().destroy();
            $('.tabelaVenda').removeClass('d-none');
            $("#voltaTela").attr('onclick', 'telaCriacaoEdicaoVouchers(true)');
            $("#resultadoVendaClienteVoucher").DataTable().destroy();
            $("#resultadoVendaClienteVoucher").DataTable({
                paging: true,
                pageLength: 10,
                searching: true,
                info: true,
                deferRender: true,
                responsive: true,
                scrollY: "1000px",
                scrollX: true,
                scrollCollapse: true,
                columnDefs: [
                    {
                        targets: [1, 8],
                        className: 'text-center'
                    },
                    {
                        targets: [6],
                        type: 'currency-brl'
                    },
                    {
                        targets: [7],
                        type: 'date-time-br'
                    },

                ],
                columns: [
                    { width: '5%' },
                    { width: '5%' },
                    { width: '10%' },
                    { width: '25%' },
                    { width: '10%' },
                    { width: '20%' },
                    { width: '10%' },
                    { width: '10%' },
                    { width: '5%' }
                ],
                initComplete: function (settings) {
                    let idTable = `#${settings.nTable.id}`;

                    $('html, body').animate({
                        scrollTop: $(idTable).offset().top - 70
                    }, 1000);
                    
                    $(idTable).find('tbody td:first').focus()
                },
                language: {
                    "emptyTable": "Dados não encontrados, verifique os dados inseridos na pesquisa e tente novamente!"
                },
            });
        }

        return true;

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }

}

function retornoListaVouchersEmProcessamento(respostaListaVouchersEmProcessamento) {
    animationLoadingStop();
    let { data } = respostaListaVouchersEmProcessamento;
    let dadosTable = [];
    let indice = 1;
    let htmlLista = `
        <div id="panel-1" class="panel">
            <div class="panel-container show">
                <div class="panel-content">
                    <div>
                        <table id="detProdVoucherProcessamento" class="table table-bordered table-hover table-responsive-lg table-striped w-100">
                            <thead class="bg-primary-600">
                                <tr>
                                    <th>#</th>
                                    <th>Data Criação</th>
                                    <th>Nº Voucher</th>
                                    <th>Cliente</th>
                                    <th>Tipo Troca</th>
                                    <th>Status Voucher</th>
                                    <th>Dias Passados</th>
                                    <th>Opção</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (data?.length) {
        for (let { voucher } of data) {
            let idVoucher = voucher?.IDVOUCHER;
            let dataVoucher = voucher?.DTINVOUCHER;
            let dataVoucherFormatada = `<span style="color: blue">${voucher?.DTINVOUCHERFORMATADO}</span>`;
            let nuVoucher = `<span style="color: blue">${ocultaParteDosDadosVoucher(voucher?.NUVOUCHER)}</span>`;
            let clienteVoucher = `<span style="color: blue">${voucher?.DSNOMERAZAOSOCIAL}</span>`;
            let tipoTroca = `<span style="color: red">${voucher?.STTIPOTROCA}</span>`;
            let stStatus = `<span style="color: blue">${voucher?.STSTATUS}</span>`;
            let pesqVoucher = `
                <div class="btn-group btn-group-xs">
                    <button type="button" class="btn btn-info btn-xs" title="Visualizar Voucher" onclick="pesquisaVoucherEmitido(this.id)" id="${idVoucher}"><span class="fal fa-search p-1"></span></button>
                </div>
            `;

            const DATAHORAVOUCHER = new Date(dataVoucher.slice(0, 10));
            const DATAHORAATUAL = new Date();
            const DIFERENCAEMDIAS = `<span style="color: red">${Math.ceil(Math.abs(DATAHORAATUAL - DATAHORAVOUCHER.getTime()) / (1000 * 60 * 60 * 24))}</span>`;

            dadosTable.push([
                indice,
                dataVoucherFormatada,
                nuVoucher,
                clienteVoucher,
                tipoTroca,
                stStatus,
                DIFERENCAEMDIAS,
                pesqVoucher,
            ]);

            indice++;
        }

        return Swal.fire({
            type: 'info',
            title: 'Trocas em Processamento ou Não Liberadas',
            html: htmlLista,
            width: '70%',
            showCancelButton: true,
            showCloseButton: true,
            cancelButtonColor: '#17a2b8',
            confirmButtonText: 'Verificar Todos',
            cancelButtonText: 'Prosseguir',
            onOpen: () => {
                $('#detProdVoucherProcessamento').DataTable({
                    data: dadosTable,
                    responsive: true,
                    deferRender: true,
                    columnDefs: [
                        {
                            type: 'date-time-br',
                            targets: [1],
                            className: 'text-left'
                        },
                        {
                            targets: [0, 2, 3, 4, 5, 6],
                            className: 'text-left'
                        },
                    ]
                })
            }
        }).then(async (resp) => {
            if (resp.value) {
                await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?idEmpresa=${IDEmpresaLogin}&stStatus='EM ANALISE'&pageSize=500`, 'Carregando Dados...')
                    .then(retornoListaVouchers)
                    .catch((error) => { throw error; })
            }
        })

    }
}

async function pesquisaVoucherEmitido(idVoucher = '') {
    try {
        let dadosUser = await getCurrentUser()?.user;
        let numerovoucher = idVoucher ? "" : $("#NVoucher").val()?.trim() || "";
        let userFuncao = dadosUser?.DSFUNCAO;
        let grupoEmpresa = dadosUser?.IDSUBGRUPOEMPRESARIAL;
        let idEmpresa = !numerovoucher ? dadosUser?.IDEMPRESA : "";
        let dtInicio = (!numerovoucher && !idVoucher) ? $('#dtconsultainicio').val() : "";
        let dtFim = (!numerovoucher && !idVoucher) ? $('#dtconsultafim').val() : "";

        if (!dadosUser) {
            return msgWarning('Erro ao carregar as informações do Usuário, faça o logoff e entre novamente');
        }

        let numerovoucherFormatado = numerovoucher.split('-');

        if (numerovoucherFormatado.length > 2) {
            numerovoucher = numerovoucherFormatado.join('-');
            $("#NVoucher").val(numerovoucher);
        } else {
            numerovoucher = numerovoucher.replace(/[^0-9]/g, '');
            $("#NVoucher").val(numerovoucher);
        }

        await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}&dataPesquisaInicio=${dtInicio}&dataPesquisaFim=${dtFim}&dadosVoucher=${numerovoucher}&subgrupoEmpresa=${grupoEmpresa}&idEmpresa=${idEmpresa}&pageSize=500`, 'Carregando Dados...')
            .then(retornoListaVouchers)
            .catch((error) => { throw error; })

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }
}

function ocultaParteDosDadosVoucher(stringParaOcultar) {
    if (stringParaOcultar) {
        var dadoString = ("" + stringParaOcultar);
        var stringPronta = dadoString.substring(0, 5) + ((dadoString.substring(5, dadoString.length - 4)).replace(/[0-9]/g, "*")) + dadoString.substring(dadoString.length - 4);

        return stringPronta;
    } else {
        console.erro("O parametro(stringParaOcultar) passado para a função(ocultaParteDosDados) está vazio!");
        return false;
    }
}

function retornoListaVouchers(voucherEmitido) {
    let dadosTable = [];

    animationLoadingStop();

    for (let i = 0; i < voucherEmitido.data.length; i++) {
        let dados = voucherEmitido.data[i]['voucher'];
        let indice = i + 1;
        let IDVoucher = dados?.IDVOUCHER;
        let idEmpresaOrigemVoucher = dados?.IDEMPRESAORIGEM;
        let DTVoucherIN = dados?.DTINVOUCHERFORMATADO;
        let DTVoucherOUT = dados?.DTOUTVOUCHERFORMATADO;
        let idCaixaOrigem = dados?.IDCAIXAORIGEM;
        let DSCaixaOrigem = idCaixaOrigem !== 99999 ? dados?.DSCAIXAORIGEM : 'CAIXA WEB';
        let idUsrAutorizaCriacao = dados?.IDUSRLIBERACAOCRIACAO;
        let nomeUsrAutorizaCriacao = idUsrAutorizaCriacao ? dados?.NOFUNCIONARIOLIBERACAOCRIACAO : "";
        let DSCaixaDestino = dados?.DSCAIXADESTINO ? dados?.DSCAIXADESTINO : "";
        let idUsrAutorizaConsumo = dados?.IDUSRLIBERACAOCONSUMO;
        let nomeUsrAutorizaConsumo = idUsrAutorizaConsumo ? dados?.NOFUNCIONARIOLIBERACAOCONSUMO : "";
        let NuVoucher = dados?.NUVOUCHER;
        let VrVoucher = parseFloat(dados?.VRVOUCHER);
        let STAtivoVoucher = dados?.STATIVO;
        let STCanceladoVoucher = dados?.STCANCELADO;
        let STStatusVoucher = dados?.STSTATUS;
        let EmpresaOrigem = dados?.EMPORIGEM;
        let EmpresaDestino = dados?.EMPDESTINO;
        let statusVoucherParaImpressao;
        let colorTag = 'blue';

        if (STAtivoVoucher == 'True' && !STStatusVoucher) {
            statusVoucherParaImpressao = 'NOVO';
        } else if (STAtivoVoucher == 'False' && !STStatusVoucher) {
            statusVoucherParaImpressao = 'FINALIZADO';
            colorTag = 'red'
        } else if (STAtivoVoucher == 'True' && (STStatusVoucher == 'LIBERADO PARA O CLIENTE' || STStatusVoucher == 'NOVO')) {
            statusVoucherParaImpressao = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && (STStatusVoucher == 'NEGADO' || STStatusVoucher == 'CANCELADO' || STStatusVoucher == 'FINALIZADO')) {
            statusVoucherParaImpressao = STStatusVoucher;
            colorTag = 'red'
        } else if (STAtivoVoucher == 'False' && STStatusVoucher == 'EM ANALISE') {
            statusVoucherParaImpressao = STStatusVoucher;
        } else if (STAtivoVoucher == 'False' && STCanceladoVoucher == 'True' && !STStatusVoucher) {
            statusVoucherParaImpressao = STStatusVoucher;
            colorTag = 'red'
        } else {
            statusVoucherParaImpressao = 'USADO';
            colorTag = 'red'
        }

        tagVoucherAtivo = `<label style="text-align: center; color: ${colorTag}; font-size: 11px;">${statusVoucherParaImpressao}</label>`;


        if (DTVoucherOUT == null) {
            DTVoucherOUT = '';
        } else {
            DTVoucherOUT = DTVoucherOUT;
        }

        if (EmpresaDestino == null) {
            EmpresaDestino = '';
        } else {
            EmpresaDestino = EmpresaDestino;
        }

        dadosTable.push([
            `<label id="${IDVoucher}" style="color: blue; font-size: 11px;">${indice}</label>`,
            `<label style="color: blue; font-size: 11px;">${ocultaParteDosDadosVoucher(NuVoucher)}</label>`,
            `<label style="color: blue; font-size: 11px;">${EmpresaOrigem}</label>`,
            `<label style="color: blue; font-size: 11px;">${DSCaixaOrigem}</label>`,
            `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaCriacao}</label>`,
            `<label style="color: blue; font-size: 11px;">${DTVoucherIN}</label>`,
            `<label style="align: right; color: green; font-size: 11px;">${maskValorEmBRL(VrVoucher)}</label>`,
            `<label style="color: blue; font-size: 11px;">${EmpresaDestino}</label>`,
            `<label style="color: blue; font-size: 11px;">${DSCaixaDestino}</label>`,
            `<label style="color: blue; font-size: 11px;">${nomeUsrAutorizaConsumo}</label>`,
            `<label style="color: blue; font-size: 11px;">${DTVoucherOUT}</label>`,
            tagVoucherAtivo,
            `<div class="btn-group btn-group-xs">
              <button id="detalheVoucher" type="button" class="btn btn-success btn-xs" title="Visualizar Detalhes" value="${IDVoucher}" ><span class="fal fa-list p-1"></button>
              <button type="button" class="btn btn-warning btn-xs" title="Editar Situação" id="${IDVoucher}" onclick="editarStatusVoucher(this.id);"><span class="fal fa-pen p-1 text-white"></button>
              <button type="button" class="btn btn-primary btn-xs" title="Imprimir" id="${IDVoucher}" onclick="imprimirVoucher(this.id);"><span class="fal fa-print p-1"></button>
            </div>`
        ])

    }

    $('#resultado').removeClass('d-none');

    $('#dt-basic-voucher').DataTable().clear().destroy();

    let tableVoucher = $('#dt-basic-voucher').DataTable({
        data: dadosTable,
        "language": { "emptyTable": "Nenhum Voucher Encontrado...", "zeroRecords": "Não há Vendas no Momento" },
        defaultContent: '',
        paging: true,
        pageLength: 50,
        searching: true,
        info: false,
        deferRender: true,
        scrollX: true,
        // responsive: true,
        // "displayLength": 25,
        columnDefs: [
            {
                type: 'date-time-br',
                targets: [5, 10],
            },
            {
                type: 'currency-brl',
                targets: [6],
            },
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;
            
            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);
            
            $(idTable).find('tbody td:first').focus()
        }
    });

    $('#dt-basic-voucher tbody').on('click', 'button#detalheVoucher', async function () {
        try {
            let tr = $(this).closest('tr');
            let row = tableVoucher.row(tr);
            let numVoucherLinha;

            if (tr.hasClass('child')) {
                tr = $($(`#${$(this).attr('value')}`).closest('tr'))

                row = tableVoucher.row(tr);
                numVoucherLinha = $(this).attr('value');

                row.child.hide();
                tr.removeClass('shown');

            } else {
                row = tableVoucher.row(tr);
                numVoucherLinha = $(tr[0].children[0].children[0]).attr('id');
            }

            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');

            } else {
                await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${numVoucherLinha}`, 'Carregando Detalhes do Voucher...')
                    .then((dadosVoucher) => {
                        row.child(formatDataTableAccordion(dadosVoucher)).show();
                    })
                    .catch((error) => { throw error });

                tr.addClass('shown');
            }
        } catch (error) {
            console.log(error);
            animationLoadingStop();
            msgError('Erro ao Carregar os Detalhes do Voucher, Tente Novamente Mais Tarde!')
        }
    });

}

function formatDataTableAccordion(dadosProdutos) {

    let dadosProd = dadosProdutos.data[0]['detalhevoucher'];
    let dadosProdDest = dadosProdutos.data[0]['detalhedestino'];
    let vendaOrigemVoucher = dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEB'] ? dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEB'] : "Não disponível";
    let vendaDestinoVoucher = dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEBDESTINO'] ? dadosProdutos.data[0]['voucher']['IDRESUMOVENDAWEBDESTINO'] : "Não disponível";
    let StatusVoucher = dadosProdutos.data[0]['voucher']['STSTATUS'] ? dadosProdutos.data[0]['voucher']['STSTATUS'] : "";

    // `d` is the original data object for the row
    html = `
  <div class="row">
    <div class="col-xl-12 col-sm-12">
      <div id="panel-1" class="panel">
        <div class="panel-hdr">
            <h2>Produtos Venda de Origem: ${vendaOrigemVoucher}</h2>
        </div>
        <div class="panel-container show">
            <div class="panel-content">
              <table id="vendaOrigem" class="table table-bordered table-hover table-striped w-100">
                <thead>
                  <tr>
                    <th><b>Cod. Barras<b></th>
                    <th><b>Produto<b></th>
                    <th class="tdCenter"><b>Quantidade<b></th>
                    <th><b>Valor<b></th>
                    </tr>
                  </thead>`;

    for (let i = 0; i < dadosProdutos.data[0]['detalhevoucher'].length; i++) {
        html += `        <tbody>
                      <tr>
                        <td>${dadosProd[i]['det']['NUCODBARRAS']}</td>
                        <td>${dadosProd[i]['det']['DSPRODUTO']}</td>
                        <td class="tdCenter">${parseInt(dadosProd[i]['det']['QTD'])}</td>
                        <td>${maskValor(dadosProd[i]['det']['VRTOTALLIQUIDO'])}</td>
                      </tr>
                  </tbody>`;
    }

    if (dadosProdutos.data[0]['voucher']['STATIVO'] == 'False' && (StatusVoucher != 'EM ANALISE' && StatusVoucher != 'CANCELADO' && StatusVoucher != 'NEGADO') || dadosProdDest.length) {
        html += `   </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  </br><hr size="6" width="100%" align="left" color="green"></br>
  
  <div class="row">
    <div class="col-xl-12 col-sm-12">
      <div id="panel-1" class="panel">
        <div class="panel-hdr">
            <h2>Produtos Venda de Destino: ${vendaDestinoVoucher}</h2>
          </div>
          <div class="panel-container show">
            <div class="panel-content">            
              <table id="vendaDestino" class="table table-bordered table-hover table-striped w-100">
                  <thead>
                      <tr>
                        <th><b>Cod. Barras<b></th>
                        <th><b>Produto<b></th>
                        <th class="tdCenter"><b>Quantidade<b></th>
                        <th><b>Valor.<b></th>
                      </tr>
                    </thead>`;

        for (let i = 0; i < dadosProdutos.data[0]['detalhedestino'].length; i++) {
            html += `      <tbody>
                        <tr>
                          <td>${dadosProdDest[i]['vendadetdestino']['NUCODBARRAS']}</td>
                          <td>${dadosProdDest[i]['vendadetdestino']['DSPRODUTO']}</td>
                          <td class="tdCenter">${parseInt(dadosProdDest[i]['vendadetdestino']['QTD'])}</td>
                          <td>${maskValor(dadosProdDest[i]['vendadetdestino']['VRTOTALLIQUIDO'])}</td>
                        </tr>
                    </tbody>`;
        }
    }
    html += `</table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

    return html;
}

async function editarStatusVoucher(idVoucher) {
    $('#memoriaStatusVoucher, #memoriaTipoTrocaVoucher, #memoriaStatusVoucherValue').val('');

    let dadosUser = await modalAuthUserEditOrPrintVoucher(idVoucher) || false;

    if (dadosUser) {
        let dadosVoucher = await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...').catch((error) => { throw error });

        retornoEditarStatusVoucher(dadosVoucher, dadosUser);
    }
}

async function retornoEditarStatusVoucher(detVoucher, dadosFunc) {
    try {
        $("#vendaDestVoucher").addClass('d-none');
        let { DSFUNCAO, IDFUNCIONARIO, IDGRUPOEMPRESARIAL } = dadosFunc;
        let dadosListaVoucher = [];
        let dadosListaVoucherDest = [];
        let { data } = detVoucher;
        let tipoTroca;
        let idVoucher;
        let noCliente;
        let cpfCnpjCliente;
        let nuVoucher;
        let stAtivo;
        let stCancelado;
        let vrVoucher;
        let nuVenda;
        let nuVendaDestino;
        let statusVoucher;
        let dataVenda;
        let diasEmAposCompra;
        let msgUser = '';
        let stEdicao = true;

        for (var i = 0; i < data.length; i++) {
            let { voucher } = data[i];

            idVoucher = voucher?.IDVOUCHER;
            tipoTroca = voucher?.STTIPOTROCA || 'CORTESIA';
            noCliente = voucher?.DSNOMERAZAOSOCIAL || voucher?.DSAPELIDONOMEFANTASIA || "";
            cpfCnpjCliente = voucher?.NUCPFCNPJ?.length ? voucher?.NUCPFCNPJ?.length <= 11 ? maskCPF(voucher?.NUCPFCNPJ) : maskCNPJ(voucher?.NUCPFCNPJ) : ''
            nuVoucher = voucher?.NUVOUCHER;
            stAtivo = voucher?.STATIVO;
            stCancelado = voucher?.STCANCELADO;
            vrVoucher = maskValorEmBRL(voucher?.VRVOUCHER);
            nuVenda = voucher?.IDRESUMOVENDAWEB ? voucher?.IDRESUMOVENDAWEB : "Não disponível";
            nuVendaDestino = voucher?.IDRESUMOVENDAWEBDESTINO ? voucher?.IDRESUMOVENDAWEBDESTINO : "Não disponível";
            statusVoucher = voucher?.STSTATUS ? (voucher?.STSTATUS).toUpperCase() : "";
            dataVenda = voucher?.DTHORAFECHAMENTOVENDAORIGEM;
            motivoTrocaVoucher = voucher?.STCANCELADO == 'True' ? `<h6>Motivo do Cancelamento/Negação : <span class="fw-300">${(voucher?.DSMOTIVOCANCELAMENTO || '')}</span></h6>` : `<h6>Motivo da Troca: <span class="fw-300">${voucher?.MOTIVOTROCA || ""}</span></h6>`;
            diasEmAposCompra = retornaDiasEntreDatas(dataVenda);

            if (stAtivo == 'True' && (statusVoucher == 'NOVO' || !statusVoucher)) {
                statusVoucher = 'NOVO';
            } else if (stAtivo == 'False' && statusVoucher == 'EM ANALISE') {
                nuVoucher = ocultaParteDosDadosVoucher(nuVoucher)
            } else if (stAtivo == 'True' && statusVoucher == 'LIBERADO PARA O CLIENTE') {
                statusVoucher = 'LIBERADO PARA O CLIENTE';
            } else if (stAtivo == 'False' && stCancelado == 'False' && (!statusVoucher || statusVoucher == 'FINALIZADO')) {
                statusVoucher = 'FINALIZADO';
            } else if (stCancelado == 'True' && stAtivo == 'False' && (!statusVoucher || statusVoucher == 'CANCELADO')) {
                statusVoucher = 'CANCELADO';
            } else {
                statusVoucher = 'FINALIZADO';
            }


            if (DSFUNCAO !== 'TI' && DSFUNCAO !== 'SUPERVISOR') {
                if (DSFUNCAO.includes('OPERADOR')) {
                    if (IDGRUPOEMPRESARIAL == 4 || diasEmAposCompra > 32) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização ao Seu Gerente ou Lider para Mudança de Status do Voucher';
                    }
                }
                
                if (tipoTroca !== 'DEFEITO') {
                    
                    if (statusVoucher !== 'EM ANALISE' || diasEmAposCompra > 180) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Do Suporte de Vendas Para Mudança de Status do Voucher';
                    }
                    
                    if (diasEmAposCompra > 60 && diasEmAposCompra < 180) {
                        stEdicao = false;
                        msgUser = 'Usuário Com Permissão Apenas de Visualização, Solicite a Autorização Da Supervisão para Mudança de Status do Voucher';
                    }
                }

            }

            for (let j = 0; j < data[i]['detalhevoucher'].length; j++) {
                let { det } = data[i]?.detalhevoucher[j];
                let codBarras = det?.NUCODBARRAS;
                let descProd = det?.DSPRODUTO;
                let vrUnit = maskValorEmBRL(det?.VRUNIT);
                let qtdProd = parseInt(det?.QTD);
                let vrBruto = maskValorEmBRL(det?.VRTOTALBRUTO);
                let vrDesconto = maskValorEmBRL(det?.VRDESCONTO);
                let vrLiquido = maskValorEmBRL(det?.VRTOTALLIQUIDO);

                dadosListaVoucher.push([
                    `<label style="color: blue; font-size: 11px;">${j + 1}</label>`,
                    `<label style="color: blue; font-size: 11px;">${codBarras}</label>`,
                    `<label style="color: blue; font-size: 11px;">${descProd}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrUnit}</label>`,
                    `<label style="color: blue; font-size: 11px;">${qtdProd}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrBruto}</label>`,
                    `<label style="color: blue; font-size: 11px;">${vrDesconto}</label>`,
                    `<label style="align: right; color: green; font-size: 11px;">${vrLiquido}</label>`
                ])

            }

            if (data[i]['detalhedestino'].length) {
                $("#vendaDestVoucher").removeClass('d-none');
                for (var h = 0; h < data[i]['detalhedestino'].length; h++) {
                    let detDest = data[i]?.detalhedestino[h]?.vendadetdestino;
                    let codBarrasDest = detDest?.NUCODBARRAS;
                    let descProdDest = detDest?.DSPRODUTO;
                    let vrUnitDest = maskValorEmBRL(detDest?.VUNCOM);
                    let qtdProdDest = parseInt(detDest?.QTD);
                    let vrBrutoDest = maskValorEmBRL(detDest?.VPROD);
                    let vrDescontoDest = maskValorEmBRL(detDest?.VDESC);
                    let vrLiquidoDest = maskValorEmBRL(detDest?.VRTOTALLIQUIDO);

                    dadosListaVoucherDest.push([
                        `<label style="color: blue; font-size: 11px;">${h + 1}</label>`,
                        `<label style="color: blue; font-size: 11px;">${codBarrasDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${descProdDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrUnitDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${qtdProdDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrBrutoDest}</label>`,
                        `<label style="color: blue; font-size: 11px;">${vrDescontoDest}</label>`,
                        `<label style="align: right; color: green; font-size: 11px;">${vrLiquidoDest}</label>`
                    ])
                }
            }
        }

        $('#detProdVoucher').DataTable().destroy();
        $('#detProdVoucherDestino').DataTable().destroy();

        $('#detProdVoucher').DataTable({
            data: dadosListaVoucher,
            defaultContent: '',
            paging: true,
            pageLength: 50,
            searching: true,
            info: false,
            deferRender: true,
            responsive: true,
            columnDefs: [
                {
                    type: 'currency-brl',
                    targets: [3, 5, 6],
                }
            ],
            columns: [
                { width: '10%' },
                { width: '10%' },
                { width: '30%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' }
            ],
            language: {
                "emptyTable": "Dados não encontrados!"
            }
        });

        $('#detProdVoucherDestino').DataTable({
            data: dadosListaVoucherDest,
            defaultContent: '',
            paging: true,
            pageLength: 50,
            searching: true,
            info: false,
            deferRender: true,
            responsive: true,
            columnDefs: [
                {
                    type: 'currency-brl',
                    targets: [3, 5, 6],
                }
            ],
            columns: [
                { width: '10%' },
                { width: '10%' },
                { width: '30%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' },
                { width: '10%' }
            ],
            language: {
                "emptyTable": "Dados não encontrados!"
            }
        });

        $('.detDadosVoucher').html(`
      <div class="ml-3">
        <input id="memoriaStatusVoucher" type="text" value="${statusVoucher}" hidden />
        <input id="memoriaTipoTrocaVoucher" type="text" value="${tipoTroca}" hidden />
        <input id="memoriaStatusVoucherValue" type="text" hidden />
        <div id="notificacaoUsuario"></div>
        <h6>Cliente: <span class="fw-300">${noCliente}</span></h6>
        <h6>CPF/CNPJ: <span class="fw-300">${cpfCnpjCliente}</span></h6>
        <h6>Voucher: <span class="fw-300">${nuVoucher}</span></h6>
        <h6>Valor Voucher: <span class="fw-300">${vrVoucher}</span></h6>
        <h6>Venda Origem: <span id="nuVendaVoucher" class="fw-300">${nuVenda}</span></h6>
        ${motivoTrocaVoucher}

        <div class="pl-0" style="width:20%">
          <h6>Tipo Troca:</h6>
          <select id="tipoTrocaVoucher" value="${tipoTroca}" onchange="trocaCorSelectStatusVoucher()">
            <option value='CORTESIA'>CORTESIA</option>
            <option value='DEFEITO'>DEFEITO</option>
          </select>
        </div>
        
        <div class="pl-0" style="width:20%">
          <h6>Status do Voucher:</h6>
          <select id="statusVoucher" value="${statusVoucher}" onchange="trocaCorSelectStatusVoucher()">
            <option value='NOVO'>NOVO</option>
            <option value='EM ANALISE'>EM ANALISE</option>
            <option value='LIBERADO PARA O CLIENTE'>LIBERADO PARA O CLIENTE</option>
            <option value='FINALIZADO' ${DSFUNCAO !== 'TI' ? 'disabled' : ''} >FINALIZADO</option>
            <option value='NEGADO'>NEGADO</option>
            <option value='CANCELADO'>CANCELADO</option>
          </select>
        </div>

        <div class="d-none pt-3" style="width:40%">
          <label class="form-label" for="motivoTrocaStatus"><b>MOTIVO*</b></label>
          <input id="motivoTrocaStatus" class="form-control input" type='text' placeholder="MOTIVO DA TROCA DE STATUS">
          <small><b>Campo Obrigatório*</b></small>
        </div>
      </div>
    `)

        $('#tipoTrocaVoucher').val(tipoTroca);
        $('#statusVoucher').val(statusVoucher);
        $('#tipoTrocaVoucher, #statusVoucher').select2().trigger('change').prop('disabled', !stEdicao);

        $('#vendaVoucherOrigem').html(`Produtos Venda de Origem: ${nuVenda}`);
        $('#vendaVoucherDestino').html(`Produtos Venda de Destino: ${nuVendaDestino}`);

        $("#detStatusVoucher").modal('show');
        // $('#detStatusVoucher').on('shown.bs.modal', function () { })

        msgUser && $('#notificacaoUsuario').html(`
                <div class="alert alert-danger alert-dismissible fade show h4" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true"><i class="fal fa-times"></i></span></button><strong>Atenção! </strong>${msgUser}</div>
            `);

        if (stEdicao) {
            $('#btnUpdateVoucher').removeClass('d-none').attr('onclick', `atualizaStatusVoucher(${idVoucher}, ${IDFUNCIONARIO})`)
        } else {
            $('#btnUpdateVoucher').addClass('d-none');
        }

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError();
    }
}

function trocaCorSelectStatusVoucher() {
    let tipoTrocaVoucher = $('#tipoTrocaVoucher').val();
    let statusVoucher = $('#statusVoucher').val() || $('#memoriaStatusVoucher').val();
    let corTipo = $('#select2-tipoTrocaVoucher-container');
    let corStatus = $('#select2-statusVoucher-container');
    const MEMORIATIPOTROCAVOUCHER = $('#memoriaTipoTrocaVoucher').val();
    const MEMORIASTATUSVOUCHER = $('#memoriaStatusVoucher').val();

    corTipo.attr('style', `color:${tipoTrocaVoucher == 'CORTESIA' ? 'blue' : 'red'}`)

    if (statusVoucher == "FINALIZADO" || statusVoucher == "NEGADO" || statusVoucher == "CANCELADO") {
        corStatus.attr('style', 'color:red');
    } else {
        corStatus.attr('style', 'color:blue');
    }

    if ((MEMORIASTATUSVOUCHER == statusVoucher && MEMORIATIPOTROCAVOUCHER == tipoTrocaVoucher)) {
        $('#motivoTrocaStatus').parent('div').addClass('d-none');
    } else {
        $('#motivoTrocaStatus').parent('div').removeClass('d-none');
    }

}

async function atualizaStatusVoucher(idVoucher, IDFUNCIONARIO) {
    try {
        let dadosUpdateVoucher = [];
        let { IDEMPRESA, IDGRUPOEMPRESARIAL } = await getCurrentUser()?.user;
        let tipoTroca = $('#select2-tipoTrocaVoucher-container').attr("title");
        let statusVoucher = $('#select2-statusVoucher-container').attr("title");
        let motivoTrocaStatus = $('#motivoTrocaStatus').val();
        const MEMORIATIPOTROCAVOUCHER = $('#memoriaTipoTrocaVoucher').attr('value');
        const MEMORIASTATUSVOUCHER = $('#memoriaStatusVoucher').attr('value');

        if (!IDEMPRESA || !IDGRUPOEMPRESARIAL) {
            return msgWarning('Atenção! Dados do usuário não localizados', 'Faça o logoff, entre novamente e tente atualizar');
        }

        if (!motivoTrocaStatus) {
            return msgWarning('Atenção! Motivo de Troca Vazio', 'O Motivo é Obrigatório! Preencha-o e tente atualizar novamente')
                .then(() => {
                    setTimeout(() => $('#motivoTrocaStatus').focus(), 500)
                })
        } else if (motivoTrocaStatus && motivoTrocaStatus.length <= 10) {
            return msgWarning('Atenção! Motivo de Troca Deve Conter Pelo Menos 10 Caracteres', 'Preencha-o com mais detalhes e tente atualizar novamente')
                .then(() => {
                    setTimeout(() => $('#motivoTrocaStatus').focus(), 500)
                })

        } else {

            let STATIVO = 'True'
            let STCANCELADO = 'False'
            let DSMOTIVOTROCASTATUS = $('#motivoTrocaStatus').val()?.toUpperCase().trim();
            let STSTATUS = statusVoucher;
            let STTIPOTROCA = tipoTroca || "";
            let IDVOUCHER = idVoucher;
            let IDEMPRESALOGADA = IDEMPRESA;

            if (statusVoucher == 'NOVO' || statusVoucher == 'LIBERADO PARA O CLIENTE') {
                STATIVO = 'True';
                STCANCELADO = 'False';
            } else if (statusVoucher == 'CANCELADO' || statusVoucher == 'NEGADO') {
                STATIVO = 'False';
                STCANCELADO = 'True';
            } else if (statusVoucher == 'EM ANALISE' || statusVoucher == 'FINALIZADO') {
                STATIVO = 'False';
                STCANCELADO = 'False';
            }

            dadosUpdateVoucher.push({
                STATIVO,
                STCANCELADO,
                DSMOTIVOTROCASTATUS,
                IDFUNCIONARIO,
                STSTATUS,
                STTIPOTROCA,
                IDVOUCHER,
                IDEMPRESALOGADA,
                IDGRUPOEMPRESARIAL
            })

            animationLoadingStart('Enviando dados...');

            await ajaxPut(`api/resumo-voucher/todos-web.xsjs`, dadosUpdateVoucher)
                .then(async () => {
                    $('#NVoucher').val(`${idVoucher}`);

                    await msgSuccess('Voucher Atualizado com Sucesso!')
                        .then(async () => {
                            $('#detStatusVoucher').modal('hide')

                            await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Voucher...')
                                .then(retornoListaVouchers)
                                .catch((error) => { throw error; })

                            $('#NVoucher').val('');
                        })
                })
                .catch((error) => { throw error; })
        }

    } catch (error) {
        console.log(error);
        animationLoadingStop();
        msgError(error.message || error);
    }
}

async function imprimirVoucher(idVoucher) {
    let dadosUser = await modalAuthUserEditOrPrintVoucher(idVoucher, true);

    dadosUser && await ajaxGetAllData(`api/resumo-voucher/detalhe-voucher-dados.xsjs?id=${idVoucher}`, 'Carregando Dados...')
        .then(retornoImprimirVoucher)
        .catch((error) => { throw error });
}

function montarConteudoVoucher(dadosVoucher){
  let { data } = dadosVoucher || [];

  if (!data || data.length === 0) return '';

  let now = new Date();
  let pad = (v) => String(v).padStart(2, '0');

  let dia = pad(now.getDate()); // 1-31
  let mes = pad(now.getMonth()); // 0-11 (zero=janeiro)
  let ano = now.getFullYear(); // 4 dígitos
  let hora = pad(now.getHours());          // 0-23
  let min = pad(now.getMinutes());        // 0-59
  let seg = pad(now.getSeconds());

  let dtAtual = `${dia}/${mes}/${ano}`;
  let hrAtual = `${hora}:${min}:${seg}`;

  let dados = data[0].voucher;
  let noFantasia = dados.EMPORIGEM;
  let razaoSocial = dados.RAZAOEMPORIGEM;
  let cnpjEmp = maskCNPJ(dados.CNPJEMPORIGEM);
  let endEmp = dados.ENDEMPORIGEM;
  let bairroEmp = dados.BAIRROEMPORIGEM;
  let cidadeEmp = dados.CIDADEEMPORIGEM;
  let sgufEmp = dados.SGUFEMPORIGEM;
  let dtCreate = dados.DTINVOUCHERFORMATADO.replaceAll('-', '/');
  let vrVoucher = maskValor(dados.VRVOUCHER);
  let vrExtenso = vrVoucher.extenso(true);
  let idVendaOrigem = dados.IDRESUMOVENDAWEB;
  let nuVoucher = dados.NUVOUCHER;
  let noCliente = dados.DSNOMERAZAOSOCIAL;
  let cpfCnpjCliente = dados.NUCPFCNPJ ? dados.NUCPFCNPJ : "";
  let idCaixa = String(dados.IDCAIXAORIGEM);
  let idVendedor = String((dados.IDVENDEDOR || 0));
  let idResumoDev = String(dados.IDNFEDEVOLUCAO);
  let idOperador = String(dados.IDUSRLIBERACAOCRIACAO);

  if (cpfCnpjCliente.length == 14) {
    noCliente = !noCliente ? dados.DSAPELIDONOMEFANTASIA : noCliente;
  }

  return (`
    <style>
      hr {
        margin: 5px;
      }

      #contentModalVoucher{
        width: 400px !important; 
      }

      .voucher {
        font-size: 16px !important;
        color: black;
        width: 400px !important;
        margin-left: 30px;
        max-width: 400px !important;
        padding-left: 5px !important;
        padding-right: 5px !important;
      }

      .detalhesVoucher p {
        text-align: left !important ;
        align-content: left !important;
        margin: 0 !important;
        margin-top: 10px !important;
        padding: 0 !important;
      }

      .codBarras {
        width: 100% !important;
      }

      .center {
        font-size: 16px !important;
        text-align: center !important ;
        align-content: center !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      .msg p {
        font-size: 12px !important;
        text-align: left !important ;
        align-content: left !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      @media print {
      body {
          font-size: 10px;
          margin: 0 !important;
      }

      @page {
          margin: 0.5cm !important;
      }
      
        .hidden-print {
          display: none !important;
        }
    
        .voucher {
          font-size: 14px !important;
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
          color: black !important;
          width: 400px !important;
          margin-left: 30px;
          max-width: 400px !important;
          padding-left: 5px !important;
          padding-right: 5px !important;
        }
  
        .detalhesVoucher p {
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
          text-align: left !important ;
          align-content: left !important;
          margin: 0 !important;
          margin-top: 10px !important;
          padding: 0 !important;
        }
  
        .codBarras {
          width: 90% !important;
        }
  
        .center {
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
          font-size: 10px !important;
          text-align: center !important ;
          align-content: center !important;
          margin-top: 0 !important;
          margin-bottom: 0 !important;
        }
  
        .msg p {
          font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
          font-size: 9px !important;
          text-align: left !important ;
          align-content: left !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      }

    </style>
    <style id="mediaPrintVoucher"></style>
    <p class="center" style="padding: 0;">
        <b class="center">${noFantasia}</b>
      <br />
        ${razaoSocial}
      <br />
        CNPJ Nº<b class="center">${cnpjEmp}</b>
    </p>
    <p style="margin-top: 10px; margin-bottom: 5px;">
        <b>${endEmp}</b>
      <br />
        <b>${bairroEmp}</b>
      <br />
        <b>${cidadeEmp} - ${sgufEmp}</b>
    </p>

    <p style="margin-bottom: 0">${dtAtual.replace('-', '/').replace('-', '/')} - ${hrAtual}</p>

    <p class="center alinhamentoDuplo pt-1">
      <b>** COMPROVANTE NÃO FISCAL **</b>
    </p>

    <div class="linhaPontilhadaVoucher">
      <hr style="border: 1px dashed" />
    </div> 
    <div>
      <p class="center alinhamentoDuplo">
        ORDEM DE TROCA
        <br />
        CUPOM VALE TROCA
      </p>
    </div>
    <div class="detalhesVoucher">
      <p>
          DATA DA OPERACAO.....: ${dtCreate}
        <br />
          CAIXA..............................: ${idCaixa.padStart(4, '0')}
        <br />
          VENDEDOR.....................: ${idVendedor.padStart(4, '0')}
          
          <p style="margin: 0 !important; padding: 0 !important;">Nº VALE TROCA..............: <b>${nuVoucher}</b></p>
          
          <p style="margin: 0 !important; padding: 0 !important;">Nº VENDA WEB..............: <b>${idVendaOrigem}</b></p>
          
          NSU:${idResumoDev.padStart(9, '0')} - OPER: ${idOperador.padStart(4, '0')}
        <br />
          NOME: <b id="nomeVoucher" value="${noCliente}" class="detalhesVoucher">${noCliente}</b>
        <br />
          CPF/CNPJ: <b class="detalhesVoucher">${maskCPF(cpfCnpjCliente)}</b>
        <br />
      </p>
    </div>
    
    <div class="linhaPontilhadaVoucher">
      <hr style="border: 1px dashed" />
    </div> 
    
    <div>
      <p class="center alinhamentoDuplo">VALE TROCA DE <b class="center alinhamentoDuplo">${vrVoucher}</b></p>
      <p class="center alinhamentoDuplo">(${vrExtenso})</p>
      <p class="center alinhamentoDuplo"><b>Válido por 30 dias.</b></p>
    </div> 
    
    <div class="linhaPontilhadaVoucher">
      <hr style="border: 1px dashed" />
    </div> 
    
    <div  id="codVoucher" class="center p-1">
      <svg id="svgVoucher"
        class="codBarras"
        jsbarcode-value="${nuVoucher}"
        jsbarcode-height="40"
        jsbarcode-margin="0"
        jsbarcode-fontSize="15"
        value="${nuVoucher}">
      </svg>
    </div>
    
    <div class="linhaPontilhadaVoucher">
      <hr style="border: 1px dashed" />
    </div> 
    
    <div class="msg">
      <p>Este vale troca é pessoal e instranferível.</p>
      <p>
        Para sua utilizacao será solicitado a apresentacao de
        documento de identidade e CPF.
      </p>
      <p>
        Não poderá ser utilizado para pagamento de prestacoes e
        compras de produtos FINANCEIROS.
      </p>
      <p>
        As lojas do GRUPO GTO não se responsabilizam pela perda ou
        extravio deste vale troca.
      </p>
      <p>Este comprovante é impresso em papel termossensível.</p>
      <p>
        Não exponha o papel a luz solar, fontes de calor e umidade
        excessiva.
      </p>

      <div class="linhaPontilhadaVoucher">
          <hr style="border: 1px dashed" />
      </div> 

      <p>
        <b>Válido por 30 dias.</b>
      </p>
    </div>

    <div class="linhaPontilhadaVoucher">
      <hr style="border: 1px dashed" />
    </div> 
  `);
}

function retornoImprimirVoucher(dadosRetornoImprimrVoucher) {
  
  $(document).off("keydown");
  let htmlVoucher = montarConteudoVoucher(dadosRetornoImprimrVoucher);
  
  $("#VoucherImp").html(htmlVoucher);

  JsBarcode('#svgVoucher').init();

  $("#impVoucher").modal({
    show: true,
    backdrop: 'static'
  });

  $(document).on("keydown", function (event) {
    if ($("#impVoucher").is(":visible") && event.ctrlKey && event.key === "p") {
      event.preventDefault();
      impVoucher();
    }
  });
}

function impVoucher() {
  let nuVoucher = $('#svgVoucher').attr('value');

  $('#codVoucher').html(`
    <svg id="svgVoucher"
      class="codBarras"
      jsbarcode-value="${nuVoucher}"
      jsbarcode-height="40"
      jsbarcode-margin="0"
      jsbarcode-fontSize="15"
      value="${nuVoucher}">
    </svg>
  `);

  JsBarcode('#svgVoucher').init();

  let htmlVoucher = $('#contentModalVoucher').html();
  let janelaImpressao = window.open('', '', '');

  let conteudo = `
    <html>
      <head>
        <title>Impressão</title>
        <style> button{display: none !important;}</style>
      </head>
      <body>
        ${htmlVoucher}
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.focus();
              window.print();
            }, 300)
          };

          window.onafterprint = () => setTimeout(() => window.close(), 500);
        </script>
      </body>
    </html>
  `;

  janelaImpressao.document.open();
  janelaImpressao.document.write(conteudo);
  janelaImpressao.document.close();
}

function exportPDF() {
    var nuVoucher = $('#svgVoucher').attr('value');
    var nome = $('#nomeVoucher').attr('value');
    var voucher = document.getElementById('VoucherImp');
    var doc = new jsPDF('p', 'pt', 'a4');
    /*var opt = {
     
      filename:    ,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { height: 1000, width: 800, y: 200},
      jsPDF:        { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };*/


    var mediaPrintNormal = `
    @media print {
      .hidden-print {
        display: none !important;
      }
      @page {
        size: A4;
        margin: 0;
      }
    
    
      .voucher {
        font-size: 16px !important;
        font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
        color: black !important;
        width: 793px !important;
        margin-left: 30px;
        max-width: 793px !important;
        padding-left: 5px !important;
        padding-right: 5px !important;
      }

      .detalhesVoucher p {
        font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
        text-align: left !important ;
        align-content: left !important;
        margin: 0 !important;
        margin-top: 10px !important;
        padding: 0 !important;
      }

      .codBarras {
        /* margin: 3px !important;; */
        /* padding-right: 10px !important;; */
        width: 100% !important;
        /* height: 50px !important;; */
      }

      .center {
        font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
        font-size: 16px !important;
        text-align: center !important ;
        align-content: center !important;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }

      .msg p {
        font-family: "Roboto", "Helvetica Neue", Helvetica, Arial !important;
        font-size: 12px !important;
        text-align: left !important ;
        align-content: left !important;
        margin: 0 !important;
        padding: 0 !important;
      }
    }
  `;

    $("#mediaPrintVoucher").html(mediaPrintNormal);
    $('#dialogModalVoucher').removeClass('modal-md');
    $('#dialogModalVoucher').addClass('modal-xl');
    $('#dialogModalVoucher').attr('style', 'padding: 0; margin-top: 0; margin-left: 1%');
    $('#contentModalVoucher').attr('style', 'width: 980px !important; margin-top:auto !important; margin-left: -10px !important;');

    svgAsPngUri(document.getElementById("svgVoucher")).then(uri => { $('#codVoucher').html(`<img id="svgVoucher" value="${nuVoucher}" src="${uri}" style="height: 30px !important; width: 250px !important;">`) })

    $('.linhaPontilhadaVoucher').html(`<h1>-----------------------------------------------------------------------------------------------</h1>`);
    $('.alinhamentoDuplo').removeClass('center');


    // setTimeout(()=>html2pdf().set(opt).from(voucher).save(), 1000);
    setTimeout(() => {
        doc.fromHTML(voucher, 15, 15, {
            'width': 600

        });

    }, 500)

    setTimeout(() => {
        doc.save(`Voucher_${nome}_${nuVoucher}.pdf`)
    }, 600)

    setTimeout(() => {

        $('#codVoucher').html(`
      <svg id="svgVoucher"
        class="codBarras"
        jsbarcode-value="${nuVoucher}"
        jsbarcode-height="40"
        jsbarcode-margin="0"
        jsbarcode-fontSize="15"
        value="${nuVoucher}">
      </svg>
    `);

        JsBarcode('#svgVoucher').init();
    }, 700);

    setTimeout(() => {
        $('.linhaPontilhadaVoucher').html(`<hr style="border: 1px dashed" />`);
        $('.alinhamentoDuplo').addClass('center');
        $('#dialogModalVoucher').attr('style', 'align-content: center;');
        $('#dialogModalVoucher').removeClass('modal-xl');
        $('#dialogModalVoucher').addClass('modal-md');
        $('#contentModalVoucher').attr('style', 'width: 400px !important;');
    }, 700);

}

async function telaPesquisaVendaVoucher() {
    try {
        let dodosUser = await getCurrentUser()?.user;
        let userFuncao = dodosUser.DSFUNCAO;
        let grupoEmpresa = dodosUser?.IDSUBGRUPOEMPRESARIAL || "";
        let idEmpresa = dodosUser?.IDEMPRESA || "";

        $.get("action_pesqvendavoucher.html", (htmlResp) => {
            $("#js-page-content").html(htmlResp);


            $('.dataAtual').text(dataAtual);
            $('#dtconsultavendainicio').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() }).focus();
            $('#dtvendaconsultafim').val(dataAtualCampo).on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#idvenda_cpf').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#serie').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });
            $('#nfce').on('keypress', (e) => { if (e.keyCode == 13) pesquisaVendaCliente() });

        }).fail((error) => { throw error })


        await ajaxGet(`api/resumo-voucher/empresa.xsjs?idSubGrupoEmpresa=${grupoEmpresa}&idEmpresa=${idEmpresa}`)
            .then(retornoListaEmpresasSelectVendaVoucher)
            .catch((error) => { throw error })

        $('#idEmpresaVenda').val(idEmpresa).trigger('change')

    } catch (error) {
        console.log(error);
        msgError();
    }
}

function retornoListaEmpresasSelectVendaVoucher(respostaListaEmpresas) {
    let { data } = respostaListaEmpresas;

    for (var i = 0; i < data.length; i++) {
        let { IDEMPRESA, NOFANTASIA } = data[i];

        $('#idEmpresaVenda').append(
            `<option value="${IDEMPRESA}">${NOFANTASIA}</option>`
        );

    }

    $('#idEmpresaVenda').select2()
}

function selecionaLinhaProdutoParaVoucher(element, selectByQtd) {
    let linhaSelecionada = $(element).closest('tr');

    selectByQtd && $(linhaSelecionada).find('input:first').prop('checked', true);

    if (!linhaSelecionada.hasClass('selected') || selectByQtd) {
        linhaSelecionada.addClass('selected').css("opacity", 0.8)
        linhaSelecionada.attr('title', 'PRODUTO SELECIONADO PARA TROCA!');

    } else {
        linhaSelecionada.removeClass('selected').removeAttr('style')
        linhaSelecionada.attr('title', '')

    }

    if ($('[name="selecaoProdutosParaVoucher"]:checked:not(:disabled)').length) {
        $('#btnCadVoucher').removeClass('d-none');
    } else {
        $('#btnCadVoucher').addClass('d-none');
    }

}

async function validaQtdDigitada(element) {
    let numLinha = $(element).closest('tr').find('td:first').text();
    let qtdOriginal = Number($(element).attr('qtdOriginal'))
    let qtdDigitada = Number($(element).val()?.replace(/\D/g, '') || 0);

    if (qtdDigitada > 0 && qtdDigitada <= qtdOriginal) {
        return $(element).val(qtdDigitada);
    }

    await msgWarning(`Quantidade Inválida Digitada Na Linha( ${numLinha} ), QUANTIDADE DISPONÍVEL: ${qtdOriginal}`)
        .then(() => {
            $(element).val(qtdOriginal).focus();
        })
}

async function pesquisaVendaCliente() {
    let dataInicio = $('#dtconsultavendainicio').val() || "";
    let dataFim = $('#dtvendaconsultafim').val() || "";
    let idLoja = Number($('#idEmpresaVenda').val()) || "";
    let dadosVenda = $('#idvenda_cpf').val() || "";
    let serie = $('#serie').val() || "";
    let nfce = $('#nfce').val() || "";
    let dadosVendaFormatado = dadosVenda?.split('-');
    let dodosUser = await getCurrentUser()?.user;
    let grupoEmpresa = dodosUser?.IDSUBGRUPOEMPRESARIAL;

    $('#voltaTela').removeClass('d-none');
    $('#btnCadCliente').attr('value', "");

    if (dadosVendaFormatado?.length > 2) {
        dadosVenda = dadosVendaFormatado.join('-');
    } else {
        dadosVenda = dadosVenda.replace(/[^0-9]/g, '');
        $('#btnCadCliente').attr('value', dadosVenda);
    }

    $("#resultadoVendaClienteVoucher").DataTable().clear().destroy();
    $(".tabelaVenda").addClass('d-none');
    $("#resultadoProduto").DataTable().clear().destroy();
    $(".tabelaProduto").addClass('d-none');


    await ajaxGetAllData(`api/venda/lista-venda-cliente.xsjs?dtInicio=${dataInicio}&dtFim=${dataFim}&idSubgrupoEmpresarial=${grupoEmpresa}&idEmpresa=${idLoja}&cpfouIdVenda=${dadosVenda}&nnf=${nfce}&serie=${serie}&pageSize=500`, 'Carregando Dados...')
        .then(retornoPesquisaVendaCliente)
        .catch((error) => { throw error })
}

function retornoPesquisaVendaCliente(respostapesquisaVendaCliente) {
    let { data } = respostapesquisaVendaCliente;
    let dadosTable = [];

    $(".tabelaVenda").removeClass('d-none');

    for (i = 0; i < data.length; i++) {
        let dadosVenda = data[i]?.venda;
        let idVenda = dadosVenda?.IDVENDA;
        let nomeRazao = dadosVenda?.DSNOMERAZAOSOCIAL || "";
        let sobrenomeFant = dadosVenda?.DSAPELIDONOMEFANTASIA || "";
        let nuCnpj = dadosVenda?.DEST_CNPJ ? maskCNPJ(dadosVenda?.DEST_CNPJ) : "";
        let nuCpf = dadosVenda?.DEST_CPF ? maskCPF(dadosVenda?.DEST_CPF) : "";
        let nomeClienteVenda = nuCpf ? (nomeRazao + " " + sobrenomeFant) : nomeRazao;
        let cpfCnpjCliente = nuCnpj || nuCpf;
        let loja = dadosVenda?.NOFANTASIA;
        let valorTotal = dadosVenda?.VRTOTALPAGO;
        let dataVenda = dadosVenda?.DTHORAFECHAMENTO;
        let dataVendaFormatada = dadosVenda?.DTHORAFECHAMENTOFORMATEUA;
        let situacaoVenda = `
            <label class"fw-500" style="color: ${dadosVenda?.STCANCELADO == 'False' ? 'blue' : 'red'};">${dadosVenda?.STCANCELADO == 'False' ? 'Ativa' : 'Cancelada'}</label>
        `;
        let opcoesVenda = `
            <div class="btn-group btn-group-xs">
                <button type="button" class="btn btn-success btn-xs" title="Detalhar Produtos" id="${idVenda}" onclick="visualizarProdutosDaVendaParaVoucher(this.id, '${dataVendaFormatada}')" ><span class="fal fa-list mr-1"></span></button>
            </div>
        `;

        dadosTable.push([
            (i + 1),
            opcoesVenda,
            idVenda,
            nomeClienteVenda,
            cpfCnpjCliente,
            loja,
            maskValor(valorTotal),
            dataVenda,
            situacaoVenda

        ])
    }

    $("#resultadoVendaClienteVoucher").DataTable({
        data: dadosTable,
        paging: true,
        pageLength: 10,
        searching: true,
        info: true,
        deferRender: true,
        responsive: true,
        scrollY: "1000px",
        scrollX: true,
        scrollCollapse: true,
        columnDefs: [
            {
                targets: [1, 8],
                className: 'text-center'
            },
            {
                targets: [6],
                type: 'currency-brl'
            },
            {
                targets: [7],
                type: 'date-time-br'
            },

        ],
        columns: [
            { width: '5%' },
            { width: '5%' },
            { width: '10%' },
            { width: '25%' },
            { width: '10%' },
            { width: '20%' },
            { width: '10%' },
            { width: '10%' },
            { width: '5%' }
        ],
        initComplete: function (settings) {
            let idTable = `#${settings.nTable.id}`;

            $('html, body').animate({
                scrollTop: $(idTable).offset().top - 70
            }, 1000);
            
            $(idTable).find('tbody td:first').focus()

        },
        language: {
            "emptyTable": "Dados não encontrados, verifique os dados inseridos na pesquisa e tente novamente!"
        },
    });

}

async function visualizarProdutosDaVendaParaVoucher(IdVenda, dataVenda) {
    try {
        let tipoTroca = await modalDeSelecaoDeTipoDeTroca();

        if (tipoTroca) {
            $(".tabelaVenda").addClass('d-none');
            $('.tabelaProduto').removeClass('d-none')
            $("#voltaTela").attr('onclick', 'telaCriacaoEdicaoVouchers()')

            await ajaxGetAllData(`api/venda/lista-venda-cliente.xsjs?id=${IdVenda}`, 'Carregando Produtos...')
                .then(async (dadosVenda) => {
                    retornoVisualizarProdutos(dadosVenda, tipoTroca);
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        msgError();
    }

}

async function validaUsuarioLogado(dadosVenda) {
    try {
        let idUserLogado = await getCurrentUser()?.user?.id;
        let { DTHORAFECHAMENTO } = dadosVenda?.data[0] || "";
        let diferencaEmDias;
        let dadosUserVerificado;
        let grupoEmpresarial
        let dsFuncVerificado;
        let dsFuncAutorizadas = [
            'TI',
            'SUPERVISOR',
            'GERENTE',
            'SUB GERENTE',
            'FISCAL DE CAIXA',
            'OPERADORA DE CAIXA',
            'OPERADOR DE CAIXA'
        ];

        if (!idUserLogado) {
            throw 'Erro ao validar o usuário, recarregue e tente novamente!';
        }

        let dadosUser = await ajaxGet(`api/funcionario/todos.xsjs?idFuncionario=${idUserLogado}`).catch((error) => { throw error });

        if (!dadosUser?.data?.length) {
            throw 'Erro ao validar o usuário, recarregue e tente novamente!';
        }

        dadosUserVerificado = dadosUser?.data[0]
        dsFuncVerificado = dadosUserVerificado.DSFUNCAO?.trim()?.toUpperCase();
        grupoEmpresarial = dadosUserVerificado?.IDGRUPOEMPRESARIAL;
        diferencaEmDias = retornaDiasEntreDatas(DTHORAFECHAMENTO);

        if (dsFuncAutorizadas.includes(dsFuncVerificado)) {
            if (diferencaEmDias > 180 && dsFuncVerificado !== 'TI') {
                return false;
            }

            if (grupoEmpresarial == 4) {
                dsFuncAutorizadas = [
                    'GERENTE',
                    'SUB GERENTE',
                    'FISCAL DE CAIXA',
                ];

                if (!dsFuncAutorizadas.includes(dsFuncVerificado)) {
                    return false;
                }
            }

            if (diferencaEmDias > 32 && dsFuncVerificado.includes('OPERADOR')) {
                return false;
            }

            return dadosUserVerificado;
        }

        return false;
    } catch (error) {
        console.log(error);
        msgError('Erro ao validar o usuário, recarregue e tente novamente!');
    }
}

async function retornoVisualizarProdutos(respostaVisualizarProdutos, tipoTroca) {
    try {
        let { data } = respostaVisualizarProdutos;
        let { venda } = data[0];
        let { IDVENDA, DEST_CPF, DEST_CNPJ, NRNOTA, DTHORAFECHAMENTOFORMATEUA } = venda;

        let cpfCnpjCliente = DEST_CPF || DEST_CNPJ;
        let dataVenda = DTHORAFECHAMENTOFORMATEUA;
        let dadosTable = [];
        let qtdTotalProdutos = 0;
        let indice = 0;

        const DIFERENCAEMDIAS = retornaDiasEntreDatas(dataVenda);
        const DATAAUTORIZADA = tipoTroca == 'CORTESIA' ? 32 : 90;
        const dsTipoTroca = tipoTroca;

        $('#nuVendaProd').attr('value', NRNOTA).html(`<span class="fw-500"><i>  Produtos - Venda: ${IDVENDA}</i></span>`);

        for (let i = 0; i < data.length; i++) {
            let { detalhe } = data[i];

            for (let j = 0; j < detalhe.length; j++) {
                let { det } = detalhe[j];
                let {
                    CPROD,
                    IDVENDADETALHE,
                    XPROD,
                    NUCODBARRAS,
                    QTD,
                    VRTOTALLIQUIDO,
                    VUNTRIB,
                    VPROD,
                    STTROCA,
                    STCANCELADO,
                    VENDEDOR_MATRICULA
                } = det;

                let idLinha = CPROD + '_' + indice
                let idProduto = CPROD
                let idVendaDetalhe = IDVENDADETALHE;
                let codProduto = CPROD;
                let descProduto = XPROD;
                let codBarras = NUCODBARRAS;
                let quantidade = Number(QTD);
                let valorProd = Number(VRTOTALLIQUIDO);
                let valorProdUnit = Number(VUNTRIB);
                let valorTotalProdBruto = Number(VPROD);
                let descontoProduto = valorProdUnit - valorProd;
                let stTroca = STTROCA == "True" ? "disabled" : ""
                let checked = STTROCA == "True" ? "checked" : "";
                let idVendedor = VENDEDOR_MATRICULA;
                let stQuantidade = checked || quantidade <= 1 ? "disabled" : "";
                let stCancelado = STCANCELADO || 'False';

                if (+DIFERENCAEMDIAS > DATAAUTORIZADA) {
                    //stTroca = "disabled";

                    $('#nuVendaProd').html(`
                    <span class="fw-500">
                        <i> Produtos - Venda: ${IDVENDA}</i>  &#160;&#160; <i class="text-danger h4">Venda Fora do Prazo de <u><b>${DATAAUTORIZADA} DIAS</u></b> Para Troca do Tipo <u><b>${dsTipoTroca}</u></b>. Dias Passados Após a Compra: <u><b>${DIFERENCAEMDIAS} DIAS<b></u></i>
                    </span>
                `);
                }

                selecao = `
                    <div class="custom-control custom-checkbox"> 
                        <input type="checkbox" class="custom-control-input" name="selecaoProdutosParaVoucher" id="${idLinha}" value="${valorProd}" onchange="selecionaLinhaProdutoParaVoucher(this)" idVenda="${IDVENDA}" diasPassadosDaCompra="${DIFERENCAEMDIAS}" idVendaDetalhe="${idVendaDetalhe}" idProduto="${idProduto}" quantidade="${quantidade}" valorProdUnit="${valorProdUnit}" valorTotalProdBruto="${valorTotalProdBruto}" descontoProduto="${descontoProduto}" valorProd="${valorProd}" idVendedor="${idVendedor}" cnpfCnpjCliente="${cpfCnpjCliente}"
                        ${checked} ${stTroca} tipoTroca="${tipoTroca}" dataAutorizada="${DATAAUTORIZADA}" dataVenda="${dataVenda}" />
                        <label class="custom-control-label" for="${idLinha}"></label>
                    </div>
                `;

                quantidade = `
                <div class="custom-control"> 
                    <input class="rounded" type="number" min="1" max="${quantidade}" autocomplete="off" autofill="off" name="quantidaProduto" qtdOriginal="${quantidade}" value="${quantidade}" onchange="validaQtdDigitada(this)" onclick="selecionaLinhaProdutoParaVoucher(this, true)"style="width: 50px; text-align: center;" ${stQuantidade}>
                </div>
            `;
                if(stCancelado == 'False'){
                    qtdTotalProdutos++;
                    indice++;
                    
                    dadosTable.push([
                        indice,
                        selecao,
                        codProduto,
                        descProduto,
                        codBarras,
                        quantidade,
                        maskValorEmBRL(valorProd)
                    ])
                }

            }
        }

        $('#btnCadCliente').removeClass('d-none').attr('value', cpfCnpjCliente);

        $("#resultadoProduto").DataTable().clear().destroy();

        $("#resultadoProduto").DataTable({
            data: dadosTable,
            pageLength: 50,
            paging: true,
            searching: true,
            info: true,
            deferRender: true,
            responsive: true,
            scrollY: "1000px",
            scrollX: true,
            scrollCollapse: true,
            columnDefs: [
                {
                    targets: [1, 5],
                    className: 'text-center'
                },
                {
                    targets: [6],
                    type: 'currency-brl',
                    className: 'text-center'
                }
            ],
            columns: [
                { width: '5%' },
                { width: '5%' },
                { width: '10%' },
                { width: '50%' },
                { width: '15%' },
                { width: '5%' },
                { width: '15%' }
            ],
            initComplete: function (settings) {
                let idTable = `#${settings.nTable.id}`;
                
                $('html, body').animate({
                    scrollTop: $(idTable).offset().top - 70
                }, 1000);
                
                $(idTable).find('tbody td:first').focus()
            },
            language: {
                "emptyTable": "Não há Produtos Na Venda"
            },
        });

        let verificaProd = $("[name=selecaoProdutosParaVoucher]");
        let qtdItensTrocados = 0;

        for (let i = 0; i < verificaProd.length; i++) {
            let linhaProd = $(verificaProd[i]).closest('tr');

            if (verificaProd[i].disabled && verificaProd[i].checked) {
                qtdItensTrocados++
                linhaProd.css("opacity", 0.5).attr('title', 'ESTE PRODUTO JÁ FOI TROCADO!');

            } else if (+DIFERENCAEMDIAS > DATAAUTORIZADA) {
                linhaProd.attr('title', `VENDA FORA DO PRAZO DE ${DATAAUTORIZADA} DIAS PARA A TROCA DO TIPO ${dsTipoTroca}, JÁ SE PASSARAM: ${DIFERENCAEMDIAS} DIAS APÓS A COMPRA!`)//.css("opacity", 0.5)
            }
        }

        if (qtdTotalProdutos - qtdItensTrocados == 0) {
            $('#nuVendaProd').html(`<span class="fw-500 todosTrocados"><i>  Produtos _ Venda: ${IDVENDA}</i>  &#160;&#160; <i class="text-danger h4">Todos os Produtos Desta Venda Já Foram Trocados</i></span>`);
        }

    } catch (error) {
        console.log(error);
        msgError()//.then(() => telaCriacaoEdicaoVouchers())

    }

}

async function exibirModalFormCliente(tipoCliente){
    let actionModal = (tipoCliente ? 'action_clienteVoucher_modal.html' : 'action_empresaVoucher_modal.html');

    await $.get(actionModal, async (res) => {
        $('#resultadoModalCadCliente').html(res);

        $('#notificacaoModalCadastroCliente').html('');
        $("#CadCliente").text('Cadastrar').removeClass('d-none');

        $("#detClienteVoucher").modal('show');

        $("#DataCadastro").val(dataAtualCampo);
        $('#idIndicacaoIE').select2();
    })
}

async function verificaSeExisteCadastroCliente(cpfcnpj = '', stUltimaInstancia = false) {
    try {
        let CPFCNPJ = cpfcnpj.replace(/\D/g, "");

        if (CPFCNPJ?.length) {

            !stUltimaInstancia && animationLoadingStart('Verificando Dados, aguarde...');
            animationLoadingFormClient('Verificando Dados, aguarde...');

            await ajaxGet(`api/gerencia/cliente.xsjs?numeroCpfCnpj=${CPFCNPJ}`)
                .then((resp) => {
                    !stUltimaInstancia && animationLoadingStop();
                    preenche_dados_registrados(resp, CPFCNPJ, stUltimaInstancia)
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        !stUltimaInstancia && msgError();
        msgWarningCadastroCliente(undefined, 'Erro ao verificar dados, recarregue e tente novamente!')
    }
}

async function preenche_dados_registrados(retornoCadastroCliente, cpfcnpj, stUltimaInstancia = false) {
    let { data } = retornoCadastroCliente || [];

    if (data?.length) {
        let {
            IDEMPRESA,
            IDCLIENTE,
            NUCPFCNPJ,
            DSNOMERAZAOSOCIAL,
            DSAPELIDONOMEFANTASIA,
            TPCLIENTE,
            DTCADASTRO,
            DTULTALTERACAO,
            DTNASCFUNDACAO,
            NUTELCELULAR,
            NURGINSCESTADUAL,
            NUINSCMUNICIPAL,
            EEMAIL,
            NUCEP,
            EENDERECO,
            NUENDERECO,
            ECOMPLEMENTO,
            EBAIRRO,
            NUIBGE,
            ECIDADE,
            SGUF,
            NUTELCOMERCIAL,
            IDINDICACAOIE,
            NUCNAE
        } = data[0] || "";

        await exibirModalFormCliente((TPCLIENTE == 'FISICA' || TPCLIENTE == 'FÍSICA') && NUCPFCNPJ?.length <= 11);

        $("#idEmpresa").val(IDEMPRESA);
        $("#idClienteEmpresa").val(IDCLIENTE);
        $("#DataCadastro").val(DTCADASTRO || DTULTALTERACAO.split(" ")[0]);
        $("#DataNascimentoCriacao").val(DTNASCFUNDACAO ? DTNASCFUNDACAO.split(" ")[0] : "");
        $("#TelefoneCliente").val(NUTELCELULAR ? maskFone(NUTELCELULAR?.replace(/\D/g, '')) : NUTELCELULAR);
        $("#email").val(EEMAIL);
        $('#idIndicacaoIE').val((TPCLIENTE !== 'JURIDICA' && SGUF == 'DF') ? 2 : (IDINDICACAOIE || 0)).trigger('change');
        $("#NuCEP").val(maskCEP(NUCEP));
        $("#Endereco").val(EENDERECO);
        $("#NuEndereco").val(NUENDERECO);
        $("#Complemento").val(ECOMPLEMENTO);
        $("#Bairro").val(EBAIRRO);
        $("#NuIBGE").val(NUIBGE);
        $("#Cidade").val(ECIDADE);
        $("#Estado").val(SGUF);
        $('#CadCliente').attr('onclick', `validaDadosDoFormCliente(${stUltimaInstancia})`).text('Atualizar');

        if (NUCPFCNPJ?.length <= 11) {
            let nomeCliente = data[0]["DSNOMERAZAOSOCIAL"];
            let sobrenomeCliente = '';

            nomeCliente = nomeCliente.split(' ');

            if (nomeCliente.length > 1) {
                sobrenomeCliente = nomeCliente.pop()
                nomeCliente = nomeCliente.join(' ');
            }

            $("#CPFCNPJ").val(maskCPF(NUCPFCNPJ))
            $("#NomeClienteRazao").val(nomeCliente)
            $("#sobrenomeNomeFan").val(sobrenomeCliente)
            $("#CPFCNPJ").prop({
                'readonly': (validar_Cpf(NUCPFCNPJ)),
                'disabled': (validar_Cpf(NUCPFCNPJ))
            }).removeAttr('onchange');

        } else if (NUCPFCNPJ?.length > 11) {
            $("#CPFCNPJ").val(maskCNPJ(NUCPFCNPJ));
            $('#container-btn-update-receita-federal').removeClass('d-none');
            $('#btn-update-receita-federal').val(NUCPFCNPJ);

            $("#IE").val(NURGINSCESTADUAL);
            $("#IM").val(NUINSCMUNICIPAL);
            $("#CNAE").val(NUCNAE || "")
            $("#NomeClienteRazao").val(DSNOMERAZAOSOCIAL);
            $("#sobrenomeNomeFan").val(DSAPELIDONOMEFANTASIA);
            $("#TelefoneClienteEmpresaComercial").val(NUTELCOMERCIAL ? maskFone(NUTELCOMERCIAL?.replace(/\D/g, '')) : NUTELCOMERCIAL);
            $("#CPFCNPJ").prop({
                'readonly': (validar_Cnpj(NUCPFCNPJ)),
                'disabled': (validar_Cnpj(NUCPFCNPJ))
            }).removeAttr('onblur');

            if(stUltimaInstancia){
                $('#btn-update-receita-federal').attr('onclick',  `(modal_Preenchimento_CNPJ(document.querySelector("#CPFCNPJ").value, ${true}))`)
            }

        }

        msgSuccessFormCliente();
    } else {
        $('#notificacaoModalCadastroCliente').html('');
        $("#DataCadastro").val(dataAtualCampo)

        if ($('#CPFCNPJ').attr('maxlength') == 18) {
            $('#CPFCNPJ').val(maskCNPJ(cpfcnpj));

            if (!stUltimaInstancia) {
                ValidaCNPJ(cpfcnpj) && setTimeout(() => modal_Preenchimento_CNPJ(cpfcnpj), 1000);
            }

        } else {
            $('#CPFCNPJ').val(maskCPF(cpfcnpj));
            !stUltimaInstancia && ValidaCpf(cpfcnpj);
        }

        $('#CadCliente').attr('onclick', `validaDadosDoFormCliente(${stUltimaInstancia})`).text('Cadastrar');
    }

}

async function modalCadastroCliente(cpfOrCnpj, stUltimaInstancia = false) {
    try {
        let CPFCNPJ = cpfOrCnpj?.replace(/\D/g, "");

        if (!CPFCNPJ && !stUltimaInstancia) {
            Swal.fire({
                type: 'question',
                title: 'Qual o tipo do Cliente?',
                text: 'Clique na opção desejada!',
                showCloseButton: true,
                showCancelButton: true,
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'CPF',
                cancelButtonText: 'CNPJ'
            }).then(async (result) => {
                let { value, dismiss } = result || false;

                if (value || dismiss == 'cancel') {
                    animationLoadingStart();

                    $('#detClienteVoucher').removeAttr('style');

                    await exibirModalFormCliente(value);

                    animationLoadingStop();
                }


            })

        } else if (CPFCNPJ.length) {
            !stUltimaInstancia && animationLoadingStart('Carregando Dados do Cliente, aguarde...');
            animationLoadingFormClient('Carregando dados...');

            await exibirModalFormCliente(CPFCNPJ.length <= 11);
            
            $("CPFCNPJ").val(cpfOrCnpj);

            await ajaxGet(`api/cliente/todos.xsjs?numeroCpfCnpj=${CPFCNPJ}`)
                .then((resp) => preenche_dados_registrados(resp, CPFCNPJ, stUltimaInstancia))
                .catch((error) => { throw error });

            !stUltimaInstancia && animationLoadingStop();
            $('#notificacaoModalCadastroCliente').html('');
        }

        return 
    } catch (error) {
        console.log(error);
        !stUltimaInstancia && msgError();
        msgWarningCadastroCliente($('#notificacaoModalCadastroCliente'), 'Error ao Carregar os dados, recarregue e tente novamente!');
    }

}

async function validaDadosDoFormCliente(stUltimaInstancia = false) {
  try {
    let userLogado = await getCurrentUser()?.user;
    let idFuncionario = userLogado?.id;
    let cpfCnpj = $('#CPFCNPJ').val().replace(/\D/g, "");
    let IDCLIENTE = Number($("#idClienteEmpresa").val());
    let IDEMPRESA = Number($("#idEmpresa").val() || userLogado?.IDEMPRESA);
    let tipo = $('#tipoClienteEmpresa').val();
    let IE = $("#IE").val()?.toUpperCase()?.trim();
    let IM = $("#IM").val()?.toUpperCase()?.trim() || null;
    let razao = $("#NomeClienteRazao").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || null;
    let fantasia = $("#sobrenomeNomeFan").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || null;
    let dtNasc = $("#DataNascimentoCriacao").val() || null;
    let nuCelular = $("#TelefoneCliente").val()?.replace(/\D/g, '') || "";
    let nuComercial = $("#TelefoneClienteEmpresaComercial").val()?.replace(/\D/g, '') || nuCelular;
    let email = $("#email").val()?.trim() || '';
    let idIndicacaoIE = Number($("#idIndicacaoIE").val());
    let dsIndicacaoIE = $("#idIndicacaoIE").select2('data')[0]?.text?.toUpperCase();
    let nuCep = $("#NuCEP").val()?.replace(/\D/g, "") || "";
    let endereco = $("#Endereco").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "";
    let nuEndereco = $("#NuEndereco").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "SN";
    let complemento = $("#Complemento").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "")?.toUpperCase() || "";
    let bairro = $("#Bairro").val()?.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "") || 'NI';
    let nuIbge = $("#NuIBGE").val();
    let cidade = $("#Cidade").val();
    let estado = $("#Estado").val();

    if (tipo == 'CPF') {
      tipo = 'FISICA';
      IE = 'ISENTO';

    } else {
      tipo = 'JURIDICA';
    }

    if (cpfCnpj.length) {
      animationLoadingFormClient();
      !stUltimaInstancia && animationLoadingStart('Validando Dados...', 1);

      if (tipo == 'FISICA' && !validar_Cpf(cpfCnpj)) {
        return msgWarningCadastroCliente($('#CPFCNPJ'), 'CPF Inválido, verifique o número e tente novamente!', stUltimaInstancia);
      }

      if (tipo !== 'FISICA' && !validar_Cnpj(cpfCnpj)) {
        return msgWarningCadastroCliente($('#CPFCNPJ'), 'CNPJ Inválido, verifique o número e tente novamente!', stUltimaInstancia);
      }

    } else {
      return msgWarningCadastroCliente($('#CPFCNPJ'), 'CPF/CNPJ Vazio, verifique o número e tente novamente!', stUltimaInstancia);
    }

    let regexNomeSobreNome = /^[A-Za-zÀ-ÿ\s]+$/;

    if (!razao || razao?.length < 3 || !fantasia || fantasia?.length < 2) {

      if (!razao || razao?.length < 3) return msgWarningCadastroCliente($("#NomeClienteRazao"), 'Nome ou Razão Social Vazio Ou Muito Curto, favor preencher e tentar novamente!', stUltimaInstancia);

      if (!fantasia || fantasia?.length < 2) return msgWarningCadastroCliente($("#sobrenomeNomeFan"), 'Sobrenome ou Nome Fantasia Vazio Ou Muito Curto, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!regexNomeSobreNome.test(razao)) {
      return msgWarningCadastroCliente($("#NomeClienteRazao"), 'Nome ou Razão Social deve conter apenas letras e espaços, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!regexNomeSobreNome.test(fantasia)) {
      return msgWarningCadastroCliente($("#sobrenomeNomeFan"), 'Sobrenome ou Nome Fantasia deve conter apenas letras e espaços, favor preencher e tentar novamente!', stUltimaInstancia);
    }

    if (!await validaCEP(nuCep, true)) {
      return msgWarningCadastroCliente($('#NuCEP'), 'CEP Inválido, verifique o CEP e tente novamente!', stUltimaInstancia);
    }

    if (tipo == "JURIDICA") {

      if (!idIndicacaoIE) {
        return msgWarningCadastroCliente($("#idIndicacaoIE"), 'Selecione o tipo da Indicação da Inscrição Estadual e tentar novamente!', stUltimaInstancia);
      }

      if (idIndicacaoIE == 1) {
        IE = IE?.replace(/\D/g, '');

        if (!IE) {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Vazia ou Divergente do Tipo de Indicação, favor preencher e tentar novamente!', stUltimaInstancia);
        }

        if (!await validarInscricaoEstadual(IE, estado)) {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Incorreta, verifique e tente novamente!', stUltimaInstancia);
        }
      } else if (idIndicacaoIE == 2) {

        if (IE && IE !== 'ISENTO') {
          return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Divergente do Tipo de Indicação, verifique e tente novamente!', stUltimaInstancia);
        }

      } else {
        IE = IE?.replace(/\D/g, '');

        if (IE) {
          //     return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Vazia ou Divergente do Tipo de Indicação, favor preencher e tentar novamente!', stUltimaInstancia);
          // }
          if (!await validarInscricaoEstadual(IE, estado)) {
            return msgWarningCadastroCliente($("#IE"), 'Inscrição Estadual Incorreta, verifique e tente novamente!', stUltimaInstancia);
          }
        }
      }
    } else {
      razao = razao + ' ' + fantasia;
      fantasia = null;
    }

    if (!validaTelefoneOrCelular(nuCelular)) {
      return msgWarningCadastroCliente($('#TelefoneCliente'), 'Numero de Telefone Inválido, verifique o TELEFONE e tente novamente!', stUltimaInstancia);
    }

    if (email?.length > 0 && !validaEmail(email)) {
      return msgWarningCadastroCliente($('#email'), 'E-mail Inválido, verifique o E-MAIL e tente novamente!', stUltimaInstancia);
    }

    if (!bairro) {
      //return msgWarningCadastroCliente($('#NuCEP'), 'O Bairro deve estar preenchido, reveja o CEP e tente novamente!', stUltimaInstancia);
    }

    if ((endereco?.length > 0 && endereco !== 'NI') && !(/^[A-Za-z0-9\s\-\/.,ºªÇçÁáÉéÍíÓóÚúÂâÊêÎîÔôÛûÀàÈèÌìÒòÙùÃãÕõÜü]*$/.test(endereco) && isNaN(Number(endereco))) || !endereco?.length) {
      return msgWarningCadastroCliente($('#Endereco'), 'Endereço Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    if ((nuEndereco?.length > 0 && nuEndereco !== 'SN' && nuEndereco !== 'S/N') && (!/^\d+[A-Za-z\-\/]*$/.test(nuEndereco) || Number(nuEndereco) == 0)) {
      return msgWarningCadastroCliente($('#NuEndereco'), 'Número de Endereço Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    if (complemento?.length > 0 && !(/^[A-Za-z0-9\s\-\/.,ºªÇçÁáÉéÍíÓóÚúÂâÊêÎîÔôÛûÀàÈèÌìÒòÙùÃãÕõÜü]*$/.test(complemento) && isNaN(Number(complemento)))) {
      return msgWarningCadastroCliente($('#Complemento'), 'Complemento Inválido, verifique o endereço e tente novamente!', stUltimaInstancia);
    }

    IE = idIndicacaoIE == 2 ? 'ISENTO' : (IE || 'ISENTO');

    let dadosCliente = [{
      IDCLIENTE,
      IDEMPRESA,
      "DSNOMERAZAOSOCIAL": razao,
      "DSAPELIDONOMEFANTASIA": fantasia,
      "TPCLIENTE": tipo,
      "NUCPFCNPJ": cpfCnpj.replace(/\D/g, ""),
      "NURGINSCESTADUAL": IE,
      "NUINSCMUNICIPAL": IM,
      "NUCEP": nuCep,
      "NUIBGE": parseInt(nuIbge),
      "EENDERECO": endereco,
      "NUENDERECO": nuEndereco,
      "ECOMPLEMENTO": complemento,
      "EBAIRRO": (bairro || 'NI'),
      "ECIDADE": cidade,
      "SGUF": estado,
      "EEMAIL": email,
      "NUTELCOMERCIAL": nuComercial,
      "NUTELCELULAR": nuCelular,
      "DTNASCFUNDACAO": dtNasc,
      "IDINDICACAOIE": idIndicacaoIE,
      "DSINDICACAOIE": dsIndicacaoIE,
      "IDFUNCIONARIO": Number(idFuncionario),
    }];

    await ajaxGet(`api/gerencia/cliente.xsjs?numeroCpfCnpj=${cpfCnpj}`)
      .then((resp) => {
        registra_cliente(resp, dadosCliente, stUltimaInstancia);
      })
      .catch(e => { throw error })

  } catch (error) {
    console.log(error);
    !stUltimaInstancia && msgError('Erro ao tentar registrar os dados, recarregue e tente novamente!', stUltimaInstancia);
    msgWarningCadastroCliente($('#CPFCNPJ'), 'Erro ao tentar registrar os dados, recarregue e tente novamente!', stUltimaInstancia);
  }

}

async function registra_cliente(retornoValidaCliente, dadosCliente, stUltimaInstancia) {
    try {

        let retorno = retornoValidaCliente.data || []

        if (retorno.length) {
            await ajaxPut(`api/gerencia/cliente.xsjs`, dadosCliente).catch((error) => { throw error });

        } else {
            await ajaxPost(`api/gerencia/cliente.xsjs`, dadosCliente).catch((error) => { throw error });

        }
        
        $('#notificacaoModalCadastroCliente').html('');

        await returnMsgClientInsertOrUpdateSuccess(stUltimaInstancia, dadosCliente[0].NUCPFCNPJ);

    } catch (error) {
        console.log(error);
        msgWarningCadastroCliente(undefined, 'Erro ao Cadastrar/Atualizar Dados, recarregue e tente novamente!')
        !stUltimaInstancia && msgError()
    }

}

async function abreCadastroClienteSemRegistroUltimaInstancia(cpfOrCnpj = '', stAtualizaCadastro) {
    cpfOrCnpj = cpfOrCnpj?.replace(/\D/g, "")?.trim();

    $('#detClienteVoucher').attr('style', 'z-index: 30000 !important;');

    Swal.hideLoading();
    
    if (cpfOrCnpj?.length) {

        await modalCadastroCliente(cpfOrCnpj, true);

    } else {
        return false;
    }

    !stAtualizaCadastro && valida_dados_cliente_em_ultima_instancia(cpfOrCnpj)

    setTimeout(() => {
        $('#CPFCNPJ').attr('onchange', `valida_dados_cliente_em_ultima_instancia(this.value)`).prop('disabled', true)
    }, 1000);

}

async function createObjectVoucher() {
    try {
        let produtosSelecionados = $("[name=selecaoProdutosParaVoucher]:checked:not(:disabled)");
        let produtosVoucher = [];
        let detVoucher = [];
        let voucher = [];
        let diasAposACompra;
        let dataAutorizada;
        let stAllProdsTrocados = $('#nuVendaProd').hasClass('todosTrocados');
        let idVendedor;
        let idVendaVoucher;
        let cpfCnpjCliente;
        let IDVENDADETALHE;
        let IDPRODUTO;
        let QTD;
        let qtdDigitada;
        let VRUNIT;
        let VRTOTALBRUTO;
        let VRTOTALLIQUIDO;
        let VRDESCONTO;
        let STATIVO;
        let STCANCELADO;
        let STTROCA;
        let STTIPOTROCA;
        let VRVOUCHER = 0;

        for (let i = 0; i < produtosSelecionados.length; i++) {
            let produto = produtosSelecionados[i];
            let linhaProdutoSelecionado = $(produto).closest('tr');

            idVendaVoucher = $(produto).attr('idVenda');
            diasAposACompra = !diasAposACompra ? Number($(produto).attr('diaspassadosdacompra')) : diasAposACompra;
            dataAutorizada = !dataAutorizada ? Number($(produto).attr('dataAutorizada')) : dataAutorizada;
            IDVENDADETALHE = $(produto).attr('idVendaDetalhe');
            IDPRODUTO = String($(produto).attr('idProduto'));
            QTD = Number($(produto).attr('quantidade')).toFixed(2);
            qtdDigitada = Number($(linhaProdutoSelecionado).find('input:last').val());
            STTIPOTROCA = !STTIPOTROCA ? $(produto).attr('tipotroca') : STTIPOTROCA;
            VRUNIT = Number($(produto).attr('valorProdUnit'));
            VRTOTALBRUTO = Number($(produto).attr('valorTotalProdBruto'));
            VRTOTALLIQUIDO = Number($(produto).attr('valorProd'));
            VRDESCONTO = Number((VRTOTALBRUTO - VRTOTALLIQUIDO).toFixed(2));
            STATIVO = 'True';
            STCANCELADO = 'False';
            idVendedor = parseInt($(produto).attr('idVendedor'));
            cpfCnpjCliente = $(produto).attr('cnpfCnpjCliente') ? $(produto).attr('cnpfCnpjCliente') : "";
            valorProduto = Number(VRTOTALBRUTO);
            STTROCA = 'True'
            cpfCnpjCliente = cpfCnpjCliente ? (cpfCnpjCliente.length == 11 ? maskCPF(cpfCnpjCliente) : maskCNPJ(cpfCnpjCliente)) : "";

            VRTOTALLIQUIDO = Number((VRTOTALLIQUIDO / QTD).toFixed(2));
            VRDESCONTO = Number((VRDESCONTO / QTD).toFixed(2));
            QTD = Number((!qtdDigitada || qtdDigitada > QTD) ? QTD : qtdDigitada);
            VRTOTALBRUTO = Number((qtdDigitada * VRUNIT).toFixed(2));
            valorProduto = Number((qtdDigitada * VRTOTALLIQUIDO).toFixed(2));
            VRDESCONTO = Number(qtdDigitada * VRDESCONTO);
            VRTOTALLIQUIDO = Number(valorProduto);

            VRVOUCHER += Number(valorProduto);

            produtosVoucher.push({
                IDVENDADETALHE,
                STTROCA,
                QTD,
                VRTOTALBRUTO,
                VDESC: VRDESCONTO,
                VRTOTALLIQUIDO: valorProduto

            })

            detVoucher.push({
                IDPRODUTO,
                QTD,
                VRUNIT,
                VRTOTALBRUTO,
                VRDESCONTO,
                VRTOTALLIQUIDO,
                STATIVO,
                STCANCELADO
            })



        }

        if (produtosVoucher?.length) {
            $('#voltaTela').attr('onclick', 'telaCriacaoEdicaoVouchers(true)');

            let dataUserLogado = await getCurrentUser()?.user;
            let idUserLogado = dataUserLogado?.id
            let { IDEMPRESA, IDGRUPOEMPRESARIAL } = dataUserLogado;

            if (!dataUserLogado) {
                throw 'Erro ao Localizar os Dados do Usuário Logado, Recarregue e Tente Novamente!'
            }

            let { IDFUNCIONARIO } = await modalAuthUserCreateVoucher(idVendaVoucher, STTIPOTROCA) || false;
            let MOTIVOTROCA = IDFUNCIONARIO && await modalMotivoCriacaoVoucher() || false;
            let { IDCLIENTE, NUCPFCNPJ } = MOTIVOTROCA && await modalCpfOuCnpjDoClienteParaVoucher(cpfCnpjCliente) || false;

            if (!IDCLIENTE) {
                return false;
            }

            let IDEMPRESAORIGEM = parseInt(IDEMPRESA);
            let IDCAIXAORIGEM = parseInt(99999);
            let IDNFEDEVOLUCAO = parseInt($('#nuVendaProd').attr('value'));
            let IDUSRINVOUCHER = parseInt(idUserLogado); //Usuario da Sessao Logada
            let IDVENDEDOR = parseInt(idVendedor);
            let IDRESUMOVENDAWEB = idVendaVoucher;
            let IDUSRLIBERACAOCRIACAO = parseInt(IDFUNCIONARIO); //Usuario Autorizador da Criação

            IDCLIENTE = parseInt(IDCLIENTE);
            MOTIVOTROCA = MOTIVOTROCA.toUpperCase();
            VRVOUCHER = Number(VRVOUCHER.toFixed(2));

            voucher.push({
                IDGRUPOEMPRESARIAL,
                IDEMPRESAORIGEM,
                IDCAIXAORIGEM,
                IDNFEDEVOLUCAO,
                IDUSRINVOUCHER,
                IDVENDEDOR,
                IDCLIENTE,
                NUCPF: NUCPFCNPJ,
                VRVOUCHER,
                IDRESUMOVENDAWEB,
                STTIPOTROCA,
                MOTIVOTROCA,
                IDUSRLIBERACAOCRIACAO,
                detVoucher,
                produtosVoucher
            });

            if (stAllProdsTrocados) {
                await msgWarning('Todos os Produtos Desta Venda já Foram Trocados, Favor Verificar se o Número da Venda Está Correto!', 'Caso os Dados Estejam Corretos, Oriente o Cliente Sobre o Ocorrido Ou Fale Com o Suporte!');
                
                return false;
                
            }

        } else {
            await msgWarning('Nenhum produto foi selecionado, favor selecionar e tentar novamente!');

            return false;

        }

        return voucher;
    } catch (error) {
        console.log(error);
        msgError(error?.message || 'Erro ao tentar gerar o voucher!');

    }
}

async function criaVoucher() {
    try {
        let voucher = await createObjectVoucher() || [];

       if (voucher?.length) {
            await animationLoadingStart('Criando Voucher...', 1);

            await ajaxPost(`api/resumo-voucher/todos-web.xsjs`, voucher)
                .then(async (response) => {
                    let { IDVOUCHER } = response || '';

                    retornoVoucherCriado(IDVOUCHER);
                    //vinculoVoucherVendaDetalhe(resp, produtosVoucher);
                })
                .catch((error) => { throw error })
        }
    } catch (error) {
        console.log(error);
        msgError(error?.message || 'Erro ao tentar gerar o voucher!');
    }
}

async function retornoVoucherCriado(idVoucher) {
    await msgSuccess('Voucher Cadastrado com Sucesso!').then(() => telaCriacaoEdicaoVouchers(true, idVoucher))

    pesquisaVoucherEmitido(idVoucher);
}

//========== FIM Rotina - Create Edit Cancel - VOUCHER ==========// 