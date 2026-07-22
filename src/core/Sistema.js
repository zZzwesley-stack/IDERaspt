window.Sistema = {
  dataAtual: () => new Date().toLocaleDateString('pt-BR'),
  horaAtual: () => new Date().toLocaleTimeString('pt-BR'),
  versao: () => "RastPt Engine v1.5",
  limparConsole: () => {
    const log = document.getElementById('console-log');
    if (log) log.innerHTML = '';
  }
};