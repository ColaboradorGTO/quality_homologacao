var loader;
var delayMaximo = 400;

var animationLoadingStop = () => {
    clearTimeout(loader);
    Swal.close();
};

var animationLoadingStart = (msg, delay, ctrlClose = true) => {
    animationLoadingStop();
    msg = !msg ? 'Carregando Dados...' : msg;
    
    if(typeof delay != 'number'){
        delay = delayMaximo;
    } else {
        delay = delay < 0 ? 0 : delay;
    }
    
    loader = setTimeout(() => animacaoCarregamento(msg, ctrlClose), delay);
};

function showResponse(type, idCloseModal = '', title = '', text = '', showConfirmButton = true, showCancelButton = false, timeDuration = 5000) {
    if (idCloseModal) {
        $(`#${idCloseModal}`).modal('hide');
    }

    Swal.fire({
        type: type,
        title: title,
        text: text,
        showConfirmButton: showConfirmButton,
        showCancelButton: showCancelButton,
        timer: timeDuration
    });
}

function successResponse(idCloseModal = '', title = 'Success', text = 'Success', showConfirmButton = false, timeDuration = 2500) {
    showResponse('success', idCloseModal, title, text, showConfirmButton, false, timeDuration);
}

function infoResponse(idCloseModal = '', title = 'Info', text = 'Info', showConfirmButton = true, showCancelButton = false, timeDuration = 2500) {
    showResponse('info', idCloseModal, title, text, showConfirmButton, showCancelButton, timeDuration);
}

function errorResponse(idCloseModal = '', title = 'Error', text = 'Error', showConfirmButton = true, showCancelButton = false, timeDuration = 2500) {
    showResponse('error', idCloseModal, title, text, showConfirmButton, showCancelButton, timeDuration);
}

function warningResponse(idCloseModal = '', title = 'Warning', text = 'Warning', showConfirmButton = true, showCancelButton = false, timeDuration = 2500) {
    showResponse('warning', idCloseModal, title, text, showConfirmButton, showCancelButton, timeDuration);
}

function animacaoCarregamento(msgLoading = 'Carregando', ctrlClose = true) {
    return Swal.fire({
        title: 'Aguarde...',
        html: `
          <style>
            .loading span {
              display: inline-block;
              vertical-align: middle;
              width: .6em;
              height: .6em;
              margin: .19em;
              background: #e0dfe2;
              border-radius: .6em;
              animation: loading 1s infinite alternate;
            }
          
            .loading span:nth-of-type(2) {
              background: #e3c8ff;
              animation-delay: 0.3s;
            }
          
            .loading span:nth-of-type(3) {
              background: #d2aef7;
              animation-delay: 0.5s;
            }
          
            .loading span:nth-of-type(4) {
              background: #ba89ee;
              animation-delay: 0.7s;
            }
          
            .loading span:nth-of-type(5) {
              background: #ad65fb;
              animation-delay: 0.9s;
            }
          
            .loading span:nth-of-type(6) {
              background: #9532ff;
              animation-delay: 1.1s;
            }
          
            .loading span:nth-of-type(7) {
              background: #7b00ff;
              animation-delay: 1.3s;
            }
          
            @keyframes loading {
              0% {
                opacity: 0;
              }
          
              100% {
                opacity: 1;
              }
            }
          </style>
          <div class="loading animacaoLoading">
            <h2 class="text-dark fw-700">${msgLoading}</h2>
            <h4 id="numPagesLoading" class="fw-900"></h4>
            <h6 class="${ctrlClose ? 'd-block fw-900' : 'd-none'} ">Caso queira cancelar, recarregue a página!</h6>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false
    })
}

//Caso queira deixar o modal sem o timer, encaminhe o ultimo parametro como false ou o tempo desejado
function msgSuccess(msgTitle = 'Ação executada com Sucesso', text = '', timerClose = 4000) {
    animationLoadingStop()
    
    return Swal.fire({
        type: 'success',
        title: `${msgTitle}`,
        text: `${text || msgTitle}`,
        showConfirmButton: !timerClose,
        timer: timerClose
    })
}

//Caso queira deixar o modal sem o timer, encaminhe o ultimo parametro como false ou o tempo desejado
function msgQuestion(msgTitle = 'Deseja realmente executar esta ação?', text = '', timerClose = false) {
    animationLoadingStop()
    
    return Swal.fire({
        type: 'question',
        title: `${msgTitle}`,
        text: `${text}`,
        showConfirmButton: true,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        cancelButtonColor: '#d33',
        timer: timerClose,
        allowOutsideClick: false,
    })
}

function msgQuestionInputMotivo(msgTitle = 'Digite o motivo!', lengthMotivo = 10) {
    animationLoadingStop();

    let reason = '';

    return Swal.fire({
        type: 'question',
        title: `${msgTitle}`,
        html: `<div>
                    <div class=" input-group pt-0" >
                        <input type="text" id="idMotivoModal" class="swal2-input m-0 " placeholder="Digite o motivo" style="text-transform: uppercase" autocomplete="off" />
                    </div>
                </div>`,
        width: '25rem',
        focusConfirm: false,
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Voltar',
        cancelButtonColor: '#3085d6',
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        onOpen: () => { $('#swal2-validation-message').addClass('text-danger mt-2 fw-700') },
        preConfirm: async () => {
            reason = $('#idMotivoModal').val()?.replace(/[^a-zA-ZÀ-ÿ0-9, ]/g, '')?.replace(/\s{2,}/g, ' ')?.trim()?.toUpperCase();
            
            $('#idMotivoModal').val(reason);

          if (!reason || reason?.length < lengthMotivo) {
            Swal.showValidationMessage(`Digite o motivo!, O Motivo Deve Conter no Minímo ${lengthMotivo} Caracteres!`);
            $('#idMotivoModal').focus();
            return false;
          }
        }
    }).then(async (resp) => {
      let value = resp?.value == true;                  

      return {
        value,
        reason
      };
    })

}

//Caso queira deixar o modal sem o timer, encaminhe o ultimo parametro como false ou o tempo desejado
function msgInfo(msgTitle = 'Atenção!', text = '', timerClose = false) {
    animationLoadingStop()
    
    return Swal.fire({
        type: 'info',
        title: `${msgTitle}`,
        text: `${text || msgTitle}`,
        showConfirmButton: !timerClose,
        showCancelButton: false,
        timer: timerClose
    })
}

//Caso queira deixar o modal sem o timer, encaminhe o ultimo parametro como false ou o tempo desejado
function msgWarning(msgTitle = 'Erro ao carregar os dados, Tente novamente! ', text = '', timerClose = false) {
    animationLoadingStop()
    
    return Swal.fire({
        type: 'warning',
        title: `${msgTitle}`,
        text: `${text || msgTitle}`,
        showConfirmButton: !timerClose,
        timer: timerClose
    })
}

//Caso queira deixar o modal sem o timer, encaminhe o ultimo parametro como false ou o tempo desejado
function msgError(msgTitle = 'Erro ao carregar os dados, recarregue e tente novamente! ', text = '', timerClose = false) {
    animationLoadingStop()
    
    return Swal.fire({
        type: 'error',
        title: `${msgTitle}`,
        text: `${text || msgTitle}`,
        showConfirmButton: !timerClose,
        timer: timerClose
    })
}