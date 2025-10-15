async function enviarZPLParaImpressora(labelPagesZPL) {
  if (labelPagesZPL?.length == 0) {
    return msgWarning('Nenhum arquivo enviado para impressão, verifique e tente novamente!');
  }

  labelPagesZPL = labelPagesZPL.replace(/^[ \t]+/gm, '').replace(/^\s*$(?:\r\n?|\n)/gm, '');

  animationLoadingStart('Conectando a Impressora, aguarde...', false);

  const socket = new WebSocket('ws://localhost:9090');

  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = (err) => reject(new Error('Falha na conexão com o serviço de impressão do Quality!'));
    setTimeout(() => reject(new Error('Tempo limite de conexão excedido!')), 10000);
  });

  animationLoadingStart('Imprimindo, aguarde...', false);

  socket.send(labelPagesZPL.trim());

  await new Promise((resolve, reject) => {
    socket.onmessage = (e) => (e?.data?.includes("ERROR") ? reject(new Error(e?.data)) : resolve(e?.data));
    socket.onerror = (err) => reject(new Error('Erro na comunicação com a impressora!'));
    socket.onclose = () => resolve('Impressão enviada com sucesso!');
    setTimeout(() => reject(new Error('Tempo limite de resposta excedido')), 10000);
  });

  socket.close();

  animationLoadingStop();
}
