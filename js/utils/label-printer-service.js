async function enviarZPLParaImpressora(labelPagesZPL) {
  let arrayLabelPage = labelPagesZPL.split('^XZ');
  let contador = 0;
  let LabelPageZPL = '';

  arrayLabelPage.pop();

  animationLoadingStart('Conectando a Impressora, aguarde...', false);

  const socket = new WebSocket('ws://localhost:9090');

  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = (err) => reject(new Error('Falha na conexão com o serviço de impressão do Quality!'));
    setTimeout(() => reject(new Error('Tempo limite de conexão excedido!')), 10000);
  });

  animationLoadingStart('Imprimindo, aguarde...', false);

  for (let i = 0; i < arrayLabelPage.length; i++) {
    LabelPageZPL += arrayLabelPage[i].length ? arrayLabelPage[i].concat('^XZ') : ''

    contador++;

    if (contador == 2 || i == (arrayLabelPage.length - 1)) {

      if (LabelPageZPL.length) {
        socket.send(LabelPageZPL.replace(/^[ \t]+/gm, '').replace(/^\s*$(?:\r\n?|\n)/gm, ''));

        await new Promise((resolve, reject) => {
          socket.onmessage = (e) => (e?.data?.includes("ERROR") ? reject(new Error(e?.data)) : resolve(e?.data));
          socket.onerror = (err) => reject(new Error('Erro na comunicação com a impressora!'));
          socket.onclose = () => resolve('Impressão enviada com sucesso!');
          setTimeout(() => reject(new Error('Tempo limite de resposta excedido')), 10000);
        });

        LabelPageZPL = '';
        contador = 0;
      }
    }
  }

  socket.close();

  animationLoadingStop();
}
