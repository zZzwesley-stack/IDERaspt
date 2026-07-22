window.addEventListener('DOMContentLoaded', () => {
  const ui = new UIManager();
  const editorElem = document.getElementById('code-editor');
  const highlightElem = document.getElementById('syntax-highlights');
  const linesElem = document.getElementById('line-numbers');
  const consoleLog = document.getElementById('console-log');
  const terminalHistory = document.getElementById('terminal-history');
  const terminalInput = document.getElementById('terminal-input');
  const sidebar = document.getElementById('sidebar-panel');

  const editorMgr = new CodeEditorManager(editorElem, highlightElem, linesElem);

  editorElem.value = ui.files[ui.activeFile];
  editorMgr.updateLines();
  editorMgr.highlightSyntax();
  ui.renderExplorer();

  // Alternar Visibilidade do Explorador (PC / Mobile)
  document.getElementById('btn-toggle-explorer').addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
  });

  window.app = {
    openFile: (name) => {
      ui.files[ui.activeFile] = editorElem.value;
      ui.activeFile = name;
      if (!ui.openTabs.includes(name)) ui.openTabs.push(name);
      editorElem.value = ui.files[name] || '';
      editorMgr.updateLines();
      editorMgr.highlightSyntax();
      ui.renderExplorer();
      sidebar.classList.remove('mobile-open');
    },

    closeTab: (name) => {
      ui.openTabs = ui.openTabs.filter(t => t !== name);
      if (ui.activeFile === name && ui.openTabs.length > 0) {
        window.app.openFile(ui.openTabs[ui.openTabs.length - 1]);
      } else {
        ui.renderExplorer();
      }
    },

    renameFile: (oldName) => {
      const newName = prompt("Novo nome do arquivo:", oldName);
      if (newName && newName !== oldName) {
        ui.files[newName] = ui.files[oldName];
        delete ui.files[oldName];
        ui.openTabs = ui.openTabs.map(t => t === oldName ? newName : t);
        if (ui.activeFile === oldName) ui.activeFile = newName;
        ui.renderExplorer();
      }
    },

    deleteFile: (name) => {
      if (confirm(`Excluir "${name}"?`)) {
        delete ui.files[name];
        window.app.closeTab(name);
      }
    }
  };

  document.getElementById('btn-new-file').addEventListener('click', () => {
    const fname = prompt("Nome do arquivo (.rast):", "novo.rast");
    if (fname) {
      ui.files[fname] = '// Arquivo RastPt\n';
      window.app.openFile(fname);
    }
  });

  document.getElementById('btn-new-folder').addEventListener('click', () => {
    const fol = prompt("Nome da pasta:", "pasta");
    if (fol) { ui.folders.push(fol); ui.renderExplorer(); }
  });

  document.getElementById('btn-upload-file').addEventListener('click', () => {
    document.getElementById('file-uploader').click();
  });

  document.getElementById('file-uploader').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        ui.files[file.name] = evt.target.result;
        window.app.openFile(file.name);
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    ui.files[ui.activeFile] = editorElem.value;
    alert(`Salvo!`);
  });

  document.getElementById('btn-download').addEventListener('click', () => {
    const blob = new Blob([editorElem.value], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = ui.activeFile;
    a.click();
  });

  document.getElementById('btn-search').addEventListener('click', () => {
    document.getElementById('search-panel').classList.toggle('hidden');
  });
  document.getElementById('btn-close-search').addEventListener('click', () => {
    document.getElementById('search-panel').classList.add('hidden');
  });

  document.getElementById('btn-replace-all').addEventListener('click', () => {
    const f = document.getElementById('search-input').value;
    const r = document.getElementById('replace-input').value;
    if (f) {
      editorElem.value = editorElem.value.replaceAll(f, r);
      editorMgr.updateLines();
      editorMgr.highlightSyntax();
    }
  });

  document.getElementById('tab-btn-console').addEventListener('click', () => {
    document.getElementById('tab-btn-console').classList.add('active');
    document.getElementById('tab-btn-terminal').classList.remove('active');
    consoleLog.classList.add('active'); consoleLog.classList.remove('hidden');
    document.getElementById('terminal-log').classList.remove('active'); document.getElementById('terminal-log').classList.add('hidden');
  });

  document.getElementById('tab-btn-terminal').addEventListener('click', () => {
    document.getElementById('tab-btn-terminal').classList.add('active');
    document.getElementById('tab-btn-console').classList.remove('active');
    document.getElementById('terminal-log').classList.add('active'); document.getElementById('terminal-log').classList.remove('hidden');
    consoleLog.classList.remove('active'); consoleLog.classList.add('hidden');
  });

  document.getElementById('btn-clear-console').addEventListener('click', () => {
    consoleLog.innerHTML = '';
    terminalHistory.innerHTML = '';
  });

  function runRastPt() {
    consoleLog.innerHTML = '';
    ui.files[ui.activeFile] = editorElem.value;

    const logFn = (msg) => {
      const div = document.createElement('div');
      div.className = 'log-line';
      div.textContent = String(msg);
      consoleLog.appendChild(div);
      consoleLog.scrollTop = consoleLog.scrollHeight;
    };

    const inputFn = (p) => prompt(p || "Entrada RastPt:") || "";

    try {
      const lexer = new window.Lexer(editorElem.value);
      const tokens = lexer.tokenize();
      const parser = new window.Parser(tokens);
      const ast = parser.parse();
      const interpreter = new window.Interpreter(logFn, inputFn);
      interpreter.exec(ast);
    } catch (err) {
      const div = document.createElement('div');
      div.className = 'log-error';
      div.innerHTML = `
        <div><strong>[Erro na Linha ${err.line || 1}]:</strong> ${err.message || err}</div>
        ${err.sug ? `<div class="error-sug">💡 Sugestão: ${err.sug}</div>` : ''}
      `;
      consoleLog.appendChild(div);
      consoleLog.scrollTop = consoleLog.scrollHeight;
    }
  }

  document.getElementById('btn-executar').addEventListener('click', runRastPt);
  document.getElementById('btn-executar-top').addEventListener('click', runRastPt);

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && terminalInput.value.trim()) {
      const cmd = terminalInput.value;
      const line = document.createElement('div');
      line.textContent = '> ' + cmd;
      line.style.color = '#7c3aed';
      terminalHistory.appendChild(line);
      terminalInput.value = '';

      try {
        const lexer = new window.Lexer(cmd);
        const tokens = lexer.tokenize();
        const parser = new window.Parser(tokens);
        const ast = parser.parse();
        const interpreter = new window.Interpreter((m) => {
          const res = document.createElement('div');
          res.textContent = String(m);
          res.style.color = '#38bdf8';
          terminalHistory.appendChild(res);
        }, (p) => prompt(p));
        interpreter.exec(ast);
      } catch (err) {
        const res = document.createElement('div');
        res.textContent = '[Erro Terminal]: ' + (err.message || err);
        res.style.color = '#f87171';
        terminalHistory.appendChild(res);
      }
    }
  });
});