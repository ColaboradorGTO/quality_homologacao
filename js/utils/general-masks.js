function maskCpf(valor) {
  valor = String(valor)?.replace(/\D/g, "") || "";

  if (valor.length) {
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  return valor;
}

function maskCnpj(valor) {
  valor = String(valor)?.replace(/\D/g, "") || "";

  if (valor.length) {
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  }

  return valor;
}

function maskIE(valor, UF) {
  valor = String(valor)?.replace(/\D/g, "") || "";

  if (valor.length) {
    if (UF == 'DF'){
      valor = valor.replace(/^(\d{11})(\d)/, "$1-$2");
    }

    if (UF == 'GO') {
      valor = valor.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");
    }

    if (UF == 'MG') {
      valor = valor.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2");
    }
  }

  return valor;
}

function maskCep(valor) {
  valor = String(valor)?.replace(/\D/g, "") || "";

  if (valor.length) {
    valor = valor.replace(/^(\d{2})(\d)/, "$1.$2").replace(/\.(\d{3})(\d)/, ".$1-$2");
  }

  return valor;
}

function maskTelefone(valor) {
  valor = String(valor)?.replace(/\D/g, "") || "";

  let tpCelular = valor.length === 11;

  if (valor.length) {
    valor = valor.replace(/^(\d{1})(\d)/, "($1$2) ")

    valor = tpCelular ? valor.replace(/\ (\d{1})(\d)/, " $1 $2 ").replace(/\ (\d{3})(\d)/, "$1-$2") : valor.replace(/(\d{3,4})(\d)/, "$1-$2");
  }

  return valor;
}