class Lexer {
  constructor(code) { this.code = code || ''; this.pos = 0; this.line = 1; this.tokens = []; }

  tokenize() {
    while (this.pos < this.code.length) {
      let char = this.code[this.pos];

      if (char === '\n') { this.line++; this.pos++; continue; }
      if (char === ' ' || char === '\t' || char === '\r') { this.pos++; continue; }

      if (char === '/' && this.code[this.pos + 1] === '/') {
        while (this.pos < this.code.length && this.code[this.pos] !== '\n') this.pos++;
        continue;
      }

      if (char === '"' || char === "'") {
        let delim = char, val = '', startLine = this.line; this.pos++;
        while (this.pos < this.code.length && this.code[this.pos] !== delim) {
          if (this.code[this.pos] === '\n') this.line++;
          val += this.code[this.pos++];
        }
        this.pos++;
        this.tokens.push({ type: 'STRING', value: val, line: startLine });
        continue;
      }

      if (/[0-9]/.test(char)) {
        let numStr = '';
        while (this.pos < this.code.length && /[0-9.]/.test(this.code[this.pos])) {
          numStr += this.code[this.pos++];
        }
        this.tokens.push({ type: 'NUMBER', value: parseFloat(numStr), line: this.line });
        continue;
      }

      let next2 = this.code.substr(this.pos, 2);
      if (['==', '!=', '<=', '>=', '&&', '||'].includes(next2)) {
        this.tokens.push({ type: 'OPERATOR', value: next2, line: this.line });
        this.pos += 2;
        continue;
      }

      if (['+', '-', '*', '/', '%', '=', '<', '>', '!', '(', ')', '{', '}', '[', ']', ';', ',', '.'].includes(char)) {
        this.tokens.push({ type: char, value: char, line: this.line });
        this.pos++;
        continue;
      }

      if (/[a-zA-Z_À-ÿ]/.test(char)) {
        let id = '';
        while (this.pos < this.code.length && /[a-zA-Z0-9_À-ÿ]/.test(this.code[this.pos])) {
          id += this.code[this.pos++];
        }
        this.tokens.push({ type: 'IDENTIFIER', value: id, line: this.line });
        continue;
      }

      this.pos++;
    }
    this.tokens.push({ type: 'EOF', value: '', line: this.line });
    return this.tokens;
  }
}

class Parser {
  constructor(tokens) { this.tokens = tokens; this.curr = 0; }

  parse() {
    let body = [];
    while (!this.isEnd()) {
      let stmt = this.statement();
      if (stmt) body.push(stmt);
    }
    return { type: 'Program', body };
  }

  statement() {
    if (this.match('IDENTIFIER')) {
      let val = this.previous().value;

      if (['var', 'const', 'texto', 'numero', 'decimal', 'booleano'].includes(val)) {
        let nameToken = this.consume('IDENTIFIER', 'Esperado o nome da variável.');
        let init = null;
        if (this.match('=')) init = this.expression();
        this.match(';');
        return { type: 'VarDecl', name: nameToken.value, init, kind: val, line: nameToken.line };
      }

      if (val === 'se') {
        this.consume('(', "Esperado '(' após 'se'");
        let cond = this.expression();
        this.consume(')', "Esperado ')' após condição");
        let thenBranch = this.block();
        let elseBranch = null;
        if (this.check('IDENTIFIER') && this.peek().value === 'senao') {
          this.advance();
          elseBranch = this.block();
        }
        return { type: 'If', cond, thenBranch, elseBranch, line: this.previous().line };
      }

      if (val === 'enquanto') {
        this.consume('(', "Esperado '(' após 'enquanto'");
        let cond = this.expression();
        this.consume(')', "Esperado ')' após condição");
        let body = this.block();
        return { type: 'While', cond, body, line: this.previous().line };
      }

      if (val === 'para') {
        this.consume('(', "Esperado '(' após 'para'");
        let init = this.statement();
        let cond = this.expression();
        this.consume(';', "Esperado ';' após condição");
        let inc = this.expression();
        this.consume(')', "Esperado ')' após incremento");
        let body = this.block();
        return { type: 'For', init, cond, inc, body, line: this.previous().line };
      }

      if (val === 'funcao') {
        let nameToken = this.consume('IDENTIFIER', 'Esperado nome da função.');
        this.consume('(', "Esperado '('");
        let params = [];
        if (!this.check(')')) {
          do { params.push(this.consume('IDENTIFIER', 'Esperado parâmetro').value); } while (this.match(','));
        }
        this.consume(')', "Esperado ')'");
        let body = this.block();
        return { type: 'FunDecl', name: nameToken.value, params, body, line: nameToken.line };
      }

      if (val === 'retornar') {
        let expr = this.expression();
        this.match(';');
        return { type: 'Return', expr, line: this.previous().line };
      }

      this.curr--;
    }

    let expr = this.expression();
    this.match(';');
    return { type: 'ExprStmt', expr };
  }

  block() {
    this.consume('{', "Esperado '{'");
    let stmts = [];
    while (!this.check('}') && !this.isEnd()) {
      stmts.push(this.statement());
    }
    this.consume('}', "Esperado '}'");
    return stmts;
  }

  expression() { return this.assignment(); }

  assignment() {
    let expr = this.logicalOr();
    if (this.match('=')) {
      let value = this.assignment();
      if (expr.type === 'Var') return { type: 'Assign', name: expr.name, value, line: expr.line };
      throw new Error("Atribuição inválida na linha " + expr.line);
    }
    return expr;
  }

  logicalOr() {
    let expr = this.logicalAnd();
    while (this.match('OPERATOR') && this.previous().value === '||') {
      let right = this.logicalAnd();
      expr = { type: 'Binary', op: '||', left: expr, right, line: expr.line };
    }
    return expr;
  }

  logicalAnd() {
    let expr = this.equality();
    while (this.match('OPERATOR') && this.previous().value === '&&') {
      let right = this.equality();
      expr = { type: 'Binary', op: '&&', left: expr, right, line: expr.line };
    }
    return expr;
  }

  equality() {
    let expr = this.relational();
    while (this.match('OPERATOR') && ['==', '!='].includes(this.previous().value)) {
      let op = this.previous().value;
      let right = this.relational();
      expr = { type: 'Binary', op, left: expr, right, line: expr.line };
    }
    return expr;
  }

  relational() {
    let expr = this.additive();
    while (this.match('<', '>') || (this.check('OPERATOR') && ['<=', '>='].includes(this.peek().value))) {
      let op = this.check('OPERATOR') ? this.advance().value : this.previous().value;
      let right = this.additive();
      expr = { type: 'Binary', op, left: expr, right, line: expr.line };
    }
    return expr;
  }

  additive() {
    let expr = this.multiplicative();
    while (this.match('+', '-')) {
      let op = this.previous().value;
      let right = this.multiplicative();
      expr = { type: 'Binary', op, left: expr, right, line: expr.line };
    }
    return expr;
  }

  multiplicative() {
    let expr = this.primary();
    while (this.match('*', '/', '%')) {
      let op = this.previous().value;
      let right = this.primary();
      expr = { type: 'Binary', op, left: expr, right, line: expr.line };
    }
    return expr;
  }

  primary() {
    if (this.match('NUMBER', 'STRING')) return { type: 'Literal', value: this.previous().value, line: this.previous().line };

    if (this.match('IDENTIFIER')) {
      let name = this.previous().value;
      let line = this.previous().line;

      let expr = { type: 'Var', name, line };
      while (this.match('.')) {
        let prop = this.consume('IDENTIFIER', 'Esperado nome da propriedade').value;
        expr = { type: 'Member', object: expr, property: prop, line };
      }

      if (this.match('(')) {
        let args = [];
        if (!this.check(')')) {
          do { args.push(this.expression()); } while (this.match(','));
        }
        this.consume(')', "Esperado ')'");
        return { type: 'Call', callee: expr, args, line };
      }

      return expr;
    }

    if (this.match('(')) {
      let expr = this.expression();
      this.consume(')', "Esperado ')'");
      return expr;
    }

    let t = this.peek();
    throw { line: t.line || 1, message: 'Sintaxe inválida próximo a "' + (t.value || 'fim') + '"', sug: "Verifique parênteses ou ponto e vírgula." };
  }

  match(...types) {
    for (let t of types) { if (this.check(t)) { this.curr++; return true; } }
    return false;
  }

  consume(type, msg) {
    if (this.check(type)) return this.tokens[this.curr++];
    let t = this.peek();
    throw { line: t.line || 1, message: msg, sug: "Corrija a digitação do comando." };
  }

  check(type) { return !this.isEnd() && this.peek().type === type; }
  advance() { if (!this.isEnd()) this.curr++; return this.previous(); }
  isEnd() { return this.peek().type === 'EOF'; }
  peek() { return this.tokens[this.curr]; }
  previous() { return this.tokens[this.curr - 1]; }
}

class Interpreter {
  constructor(logger, inputFn) {
    this.logger = logger;
    this.inputFn = inputFn;
    this.env = new Map();
    this.constants = new Set();
    this.setupGlobals();
  }

  setupGlobals() {
    this.env.set('mostrar', (msg) => this.logger(msg));
    this.env.set('entrada', (msg) => this.inputFn(msg));
    this.env.set('Brasil', window.Brasil);
    this.env.set('Matematica', window.Matematica);
    this.env.set('Sistema', window.Sistema);
  }

  exec(node) {
    if (!node) return;
    try {
      switch (node.type) {
        case 'Program':
          for (let s of node.body) this.exec(s);
          break;

        case 'VarDecl':
          if (this.env.has(node.name)) throw { line: node.line, message: `Variável "${node.name}" já declarada.`, sug: "Use outro nome." };
          let val = node.init ? this.exec(node.init) : null;
          this.env.set(node.name, val);
          if (node.kind === 'const') this.constants.add(node.name);
          break;

        case 'Assign':
          if (this.constants.has(node.name)) throw { line: node.line, message: `Constante "${node.name}" não pode ser alterada.`, sug: "Remova a atribuição." };
          if (!this.env.has(node.name)) throw { line: node.line, message: `Variável "${node.name}" não declarada.`, sug: "Declare com var antes." };
          let rVal = this.exec(node.value);
          this.env.set(node.name, rVal);
          return rVal;

        case 'If':
          if (this.exec(node.cond)) {
            for (let s of node.thenBranch) this.exec(s);
          } else if (node.elseBranch) {
            for (let s of node.elseBranch) this.exec(s);
          }
          break;

        case 'While':
          while (this.exec(node.cond)) {
            for (let s of node.body) this.exec(s);
          }
          break;

        case 'For':
          this.exec(node.init);
          while (this.exec(node.cond)) {
            for (let s of node.body) this.exec(s);
            this.exec(node.inc);
          }
          break;

        case 'FunDecl':
          this.env.set(node.name, (...args) => {
            let localEnv = new Map(this.env);
            node.params.forEach((p, idx) => localEnv.set(p, args[idx]));
            let oldEnv = this.env;
            this.env = localEnv;
            let retVal = null;
            try {
              for (let s of node.body) this.exec(s);
            } catch (r) {
              if (r && r.type === 'ReturnValue') retVal = r.value;
              else throw r;
            } finally {
              this.env = oldEnv;
            }
            return retVal;
          });
          break;

        case 'Return':
          throw { type: 'ReturnValue', value: this.exec(node.expr) };

        case 'ExprStmt': return this.exec(node.expr);

        case 'Binary':
          let l = this.exec(node.left);
          let r = this.exec(node.right);
          switch (node.op) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': return r !== 0 ? l / r : NaN;
            case '%': return l % r;
            case '==': return l == r;
            case '!=': return l != r;
            case '<': return l < r;
            case '>': return l > r;
            case '<=': return l <= r;
            case '>=': return l >= r;
            case '&&': return l && r;
            case '||': return l || r;
          }
          break;

        case 'Member':
          let obj = this.exec(node.object);
          if (obj && obj[node.property]) return obj[node.property];
          throw { line: node.line, message: `Propriedade "${node.property}" não encontrada.`, sug: "Verifique o nome da biblioteca." };

        case 'Call':
          let fn = this.exec(node.callee);
          let args = node.args.map(a => this.exec(a));
          if (typeof fn === 'function') return fn(...args);
          throw { line: node.line, message: "Função não encontrada.", sug: "Verifique o nome." };

        case 'Var':
          if (this.env.has(node.name)) return this.env.get(node.name);
          throw { line: node.line, message: `Variável "${node.name}" não foi definida.`, sug: "Declare antes de usar." };

        case 'Literal': return node.value;
      }
    } catch (err) {
      if (err.type === 'ReturnValue') throw err;
      if (err.line) throw err;
      throw { line: node.line || 1, message: err.message || "Erro de execução.", sug: "Revise a lógica." };
    }
  }
}
window.Lexer = Lexer;
window.Parser = Parser;
window.Interpreter = Interpreter;