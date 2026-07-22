class CodeEditorManager {
  constructor(editorElem, highlightElem, linesElem) {
    this.editor = editorElem;
    this.highlight = highlightElem;
    this.lines = linesElem;
    this.initEvents();
  }

  initEvents() {
    this.editor.addEventListener('input', () => {
      this.updateLines();
      this.highlightSyntax();
    });

    this.editor.addEventListener('scroll', () => {
      this.highlight.scrollTop = this.editor.scrollTop;
      this.highlight.scrollLeft = this.editor.scrollLeft;
      this.lines.scrollTop = this.editor.scrollTop;
    });

    this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.editor.addEventListener('click', () => this.updateActiveLine());
    this.editor.addEventListener('keyup', () => this.updateActiveLine());
  }

  handleKeydown(e) {
    const pairs = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
    const selStart = this.editor.selectionStart;
    const selEnd = this.editor.selectionEnd;
    const val = this.editor.value;

    if (pairs[e.key] && selStart === selEnd) {
      e.preventDefault();
      this.editor.value = val.substring(0, selStart) + e.key + pairs[e.key] + val.substring(selEnd);
      this.editor.selectionStart = this.editor.selectionEnd = selStart + 1;
      this.highlightSyntax();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const currentLine = val.substring(0, selStart).split('\n').pop();
      const indentMatch = currentLine.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';
      if (currentLine.trim().endsWith('{')) indent += '  ';
      this.editor.value = val.substring(0, selStart) + '\n' + indent + val.substring(selEnd);
      this.editor.selectionStart = this.editor.selectionEnd = selStart + 1 + indent.length;
      this.updateLines();
      this.highlightSyntax();
      return;
    }
  }

  updateLines() {
    const count = this.editor.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= count; i++) {
      html += `<div class="line-num" id="ln-${i}">${i}</div>`;
    }
    this.lines.innerHTML = html;
    this.updateActiveLine();
  }

  updateActiveLine() {
    const lineNo = this.editor.value.substring(0, this.editor.selectionStart).split('\n').length;
    document.querySelectorAll('.line-num').forEach(el => el.classList.remove('active-number'));
    const activeEl = document.getElementById(`ln-${lineNo}`);
    if (activeEl) activeEl.classList.add('active-number');
  }

  highlightSyntax() {
    let code = this.editor.value
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    code = code.replace(/(\/\/.*)/g, '<span class="hl-comment">$1</span>');
    code = code.replace(/(".*?"|'.*?')/g, '<span class="hl-string">$1</span>');
    code = code.replace(/\b(var|const|texto|numero|decimal|booleano|se|senao|para|enquanto|funcao|retornar)\b/g, '<span class="hl-keyword">$1</span>');
    code = code.replace(/\b(Brasil|Matematica|Sistema|mostrar|entrada)\b/g, '<span class="hl-lib">$1</span>');
    code = code.replace(/\b(\d+)\b/g, '<span class="hl-number">$1</span>');

    this.highlight.innerHTML = code + '\n';
  }
}
window.CodeEditorManager = CodeEditorManager;