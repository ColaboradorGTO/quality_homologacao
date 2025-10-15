function ajaxPost(url, jsonData) {

	return new Promise(
		function(resolve, reject) {

			$.ajax({
				url: url,
				data: JSON.stringify(jsonData),
				type: "POST",
				dataType: 'json',
				contentType: 'application/json',
				success: function(resposta) {

					resolve(resposta);
				},
				error: function(data) {
					reject(data?.responseJSON || data);
				}
			});

		}
	);

}

function ajaxPut(url, jsonData) {

	return new Promise(
		function(resolve, reject) {

			$.ajax({
				url: url,
				data: JSON.stringify(jsonData),
				type: "PUT",
				dataType: 'json',
				contentType: 'application/json',
				success: function(resposta) {

					resolve(resposta);
				},
				error: function(data) {
					reject(data?.responseJSON || data);
				}
			});

		}
	);

}

function ajaxGet(url) {

	return new Promise(
		function(resolve, reject) {

			$.ajax({
				url: url,
				type: "GET",
				dataType: 'json',
				contentType: 'application/json',
				success: function(resposta) {

					resolve(resposta);
				},
				error: function(data) {
					reject(data?.responseJSON || data);
				}
			});

		}
	);

}

function ajaxGet2(url) {

	return new Promise(
		function(resolve, reject) {

			$.ajax({
				url: url,
				type: "GET",
				dataType: 'json',
				contentType: 'application/json',
				username: 'JULIANO',
                password: 'Gto@2015',
				success: function(resposta) {
					resolve(resposta);
				},
				error: function(data) {
					reject(data?.responseJSON || data);
				}
			});

		}
	);

}

function ajaxGetAllData(url, msgLoading = 'Carregando Dados', funcRetorno) {
    try {
        if (msgLoading?.length > 0) {
            msgLoading = msgLoading.includes('...') ? msgLoading : msgLoading + '...';
            
            animationLoadingStop();
            animationLoadingStart(msgLoading);
        }

        if (!url) {
            throw new Error('Endereço de API não definido!');
        }

        url = url.includes('?') ? url : url + '?';
        url = url.replace('&page=1', '').replace('page=1', '');

        return new Promise(async (resolve, reject) => {
            try {
                let dataAccumulator;
                let urlApi = url;
                let dataResponse = await ajaxGet(`${urlApi}&page=1`).catch((error)=>{ throw error});
                let page = dataResponse && Number(dataResponse?.page);
                let pageSize = dataResponse && Number(dataResponse?.pageSize);
                let pages = page ? (Math.ceil(Number(dataResponse?.rows) / (pageSize || 1000))) : '';
                let regs = dataResponse?.data?.length || 0;

                dataAccumulator = dataResponse || '';

                if (dataAccumulator?.data?.length && pages > 1) {
                    proximaPaginaGetAllData();

                    async function proximaPaginaGetAllData() {
                        try {
                            if(msgLoading?.length > 0 && pages){
                                $('#numPagesLoading').html(`
                                    <div>Página ${page} de ${pages}</div>
                                    <div>Registros ${regs} de ${dataResponse?.rows}</div>
                                `);
                            }
                            
                            page++;
                            dataResponse = await ajaxGet(`${urlApi}&page=${page}`).catch((error) => { throw error });;
                            regs += dataResponse?.data?.length || 0;

                            dataResponse.data.length > 0 && dataAccumulator.data.push(...dataResponse.data);

                            if (!dataResponse?.data?.length || dataResponse?.rows == dataAccumulator?.data?.length){
                                msgLoading && animationLoadingStop();
                                funcRetorno && funcRetorno(dataAccumulator);

                                resolve(dataAccumulator);
                            } else {
                                proximaPaginaGetAllData()
                            }

                        } catch (error) {
                            msgLoading && animationLoadingStop();

                            reject(error);
                        }
                    }

                } else {
                    msgLoading && animationLoadingStop();
                    funcRetorno && funcRetorno(dataAccumulator);
                    resolve(dataAccumulator)
                }
            } catch (error) {
                msgLoading && animationLoadingStop();
                console.log(error)
                reject(error);
            }

        })
    } catch (error) {
        msgLoading && animationLoadingStop();
        console.log(error)
        msgError(error);
    }
}


function saveCurrentUser(data) {
	localStorage.setItem('currentUser', JSON.stringify(data));
}

function getCurrentUser() {
   var value = localStorage.getItem('currentUser');
   return JSON.parse(value);
}

function LogoffUser() {
  localStorage.removeItem('currentUser');
  $.ajaxSetup({ cache: false });
  location.reload(true);
  window.location.href = 'index.html';
}

async function sessionValidator() {
  const sessaoUser = await getCurrentUser();
  const { user } = sessaoUser || '';
  const dataSessao = user && (user['DATA_HORA_SESSAO'].split(' '))[0];

  const dataFormatoBR = new Date().toLocaleDateString('pt-BR');
  const modulo = (window.location.pathname).split('/').pop().replace(/dashboard|\.html/g, "");
  const startPage = (window.location.pathname).split('/').pop();

  if (startPage == 'dashboard-fora.html' || startPage == 'dashboardetiquetagem.html') return;

  if (!sessaoUser || dataSessao != dataFormatoBR) {
    if (startPage != 'index.html') {
      setTimeout(() => msgWarning('Sua sessão expirou, por favor faça o login novamente.'), 2000);
      setTimeout(() => LogoffUser(), 6000);
    }

  } else if (user) {

    const dadosUser = {
      modulo,
      user
    };

    try {
      let { auth } = await ajaxPost('api/validaSessao.xsjs', dadosUser) || '';

      if (!auth) LogoffUser();

    } catch (error) {
      LogoffUser();
      console.log(error);
    }
  }

}

async function startSessionValidator() {
  const startPage = (window.location.pathname).split('/').pop();

  if (startPage == 'index.html') return;

  await sessionValidator();

  setInterval(async () => {
    await sessionValidator();
  }, 1800000);
}

$(document).ready(async function () {
    await startSessionValidator();
});
