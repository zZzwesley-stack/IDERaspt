class UIManager {
  constructor() {
    this.files = {
      "principal.rast": '// Código RastPt v1.5\nvar usuario = "Desenvolvedor";\nmostrar("Bem-vindo à RastPt IDE v1.5, " + usuario);\n\nvar pontos = 150 + 250;\nmostrar("Pontuação Total: " + pontos);'
    };
    this.folders = [];
    this.activeFile = "principal.rast";
    this.openTabs = ["principal.rast"];
  }

  renderExplorer() {
    const tree = document.getElementById('file-tree');
    let html = '';

    this.folders.forEach(f => {
      html += `<div class="tree-item folder-item">📁 ${f}</div>`;
    });

    Object.keys(this.files).forEach(f => {
      const active = f === this.activeFile ? 'active' : '';
      html += `
        <div class="tree-item ${active}" onclick="window.app.openFile('${f}')">
          <span>📄 ${f}</span>
          <div class="item-actions">
            <span onclick="event.stopPropagation(); window.app.renameFile('${f}')" title="Renomear">✏️</span>
            <span onclick="event.stopPropagation(); window.app.deleteFile('${f}')" title="Excluir">🗑️</span>
          </div>
        </div>`;
    });

    tree.innerHTML = html;
    this.renderTabs();
  }

  renderTabs() {
    const tabBar = document.getElementById('tab-bar');
    let html = '';
    this.openTabs.forEach(f => {
      const active = f === this.activeFile ? 'active' : '';
      html += `
        <div class="tab ${active}" onclick="window.app.openFile('${f}')">
          <span>${f}</span>
          <span class="close-tab" onclick="event.stopPropagation(); window.app.closeTab('${f}')">✕</span>
        </div>`;
    });
    tabBar.innerHTML = html;
    document.getElementById('active-filepath').textContent = `projeto / ${this.activeFile}`;
  }
}
window.UIManager = UIManager;