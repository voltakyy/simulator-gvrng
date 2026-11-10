/**
 * GvRng Interpreter & AST Builder
 * Supports Python-style indentation, define, do <count>, while <cond>, if/elif/else,
 * and maintains line-number mapping for step-by-step visual execution.
 */

class GvrInterpreter {
  constructor(world) {
    this.world = world;
    this.functions = new Map();
    this.program = []; // top-level statements
    this.stack = []; // execution frames for step-by-step
    this.isFinished = false;
    this.error = null;
    this.sourceLines = [];
  }

  loadSource(code) {
    this.functions.clear();
    this.program = [];
    this.stack = [];
    this.isFinished = false;
    this.error = null;

    this.sourceLines = code.split('\n');
    const parsed = this.parseLines(this.sourceLines);
    this.program = parsed.statements;
    this.functions = parsed.functions;

    // Initialize execution frame for the main program
    this.stack = [{
      type: 'BLOCK',
      statements: this.program,
      pc: 0,
      scope: 'main'
    }];
  }

  // Parse lines into AST
  parseLines(lines) {
    const rawTokens = [];
    lines.forEach((line, idx) => {
      const lineNo = idx + 1;
      // Strip comments (#)
      const commentIdx = line.indexOf('#');
      const cleanLine = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
      if (!cleanLine.trim()) return;

      // Calculate indentation (spaces)
      const indentMatch = cleanLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1].replace(/\t/g, '    ').length : 0;
      const text = cleanLine.trim();

      rawTokens.push({ lineNo, indent, text, raw: line });
    });

    const functions = new Map();

    const parseBlock = (startIndex, expectedIndent) => {
      const statements = [];
      let i = startIndex;

      while (i < rawTokens.length) {
        const tok = rawTokens[i];

        if (tok.indent < expectedIndent) {
          // Block ended
          break;
        }

        if (tok.indent > expectedIndent) {
          throw new Error(`Line ${tok.lineNo}: Kesalahan indentasi (${tok.text})`);
        }

        const text = tok.text;

        // 1. define <name>:
        if (text.startsWith('define ') && text.endsWith(':')) {
          const fnName = text.slice(7, -1).trim();
          if (!fnName) throw new Error(`Line ${tok.lineNo}: Nama fungsi kosong pada define`);
          
          const child = parseBlock(i + 1, expectedIndent + 4);
          functions.set(fnName, {
            name: fnName,
            lineNo: tok.lineNo,
            body: child.statements
          });
          i = child.nextIndex;
          continue;
        }

        // 2. do <n>:
        if (text.startsWith('do ') && text.endsWith(':')) {
          const countStr = text.slice(3, -1).trim();
          const count = parseInt(countStr, 10);
          if (isNaN(count) || count < 0) {
            throw new Error(`Line ${tok.lineNo}: 'do' membutuhkan angka positif (misal: 'do 4:')`);
          }

          const child = parseBlock(i + 1, expectedIndent + 4);
          statements.push({
            type: 'DO_LOOP',
            count,
            lineNo: tok.lineNo,
            body: child.statements
          });
          i = child.nextIndex;
          continue;
        }

        // 3. while <cond>:
        if (text.startsWith('while ') && text.endsWith(':')) {
          const cond = text.slice(6, -1).trim();
          const child = parseBlock(i + 1, expectedIndent + 4);
          statements.push({
            type: 'WHILE_LOOP',
            condition: cond,
            lineNo: tok.lineNo,
            body: child.statements
          });
          i = child.nextIndex;
          continue;
        }

        // 4. if <cond>: / elif / else:
        if (text.startsWith('if ') && text.endsWith(':')) {
          const cond = text.slice(3, -1).trim();
          const child = parseBlock(i + 1, expectedIndent + 4);
          const ifNode = {
            type: 'IF_BRANCH',
            condition: cond,
            lineNo: tok.lineNo,
            body: child.statements,
            elifBranches: [],
            elseBranch: null
          };

          i = child.nextIndex;

          // Check consecutive elif / else at same indent
          while (i < rawTokens.length && rawTokens[i].indent === expectedIndent) {
            const nextText = rawTokens[i].text;
            if (nextText.startsWith('elif ') && nextText.endsWith(':')) {
              const elifCond = nextText.slice(5, -1).trim();
              const elifChild = parseBlock(i + 1, expectedIndent + 4);
              ifNode.elifBranches.push({
                condition: elifCond,
                lineNo: rawTokens[i].lineNo,
                body: elifChild.statements
              });
              i = elifChild.nextIndex;
            } else if (nextText === 'else:') {
              const elseChild = parseBlock(i + 1, expectedIndent + 4);
              ifNode.elseBranch = {
                lineNo: rawTokens[i].lineNo,
                body: elseChild.statements
              };
              i = elseChild.nextIndex;
              break;
            } else {
              break;
            }
          }

          statements.push(ifNode);
          continue;
        }

        // 5. Primitive commands or function calls
        statements.push({
          type: 'COMMAND',
          command: text,
          lineNo: tok.lineNo
        });
        i++;
      }

      return { statements, nextIndex: i };
    };

    const root = parseBlock(0, 0);
    return { statements: root.statements, functions };
  }

  // Evaluate sensor condition in current world state
  evalCondition(cond) {
    const c = cond.trim().toLowerCase();
    switch (c) {
      case 'front_is_clear': return this.world.frontIsClear();
      case 'front_is_blocked': return !this.world.frontIsClear();
      case 'left_is_clear': return this.world.leftIsClear();
      case 'left_is_blocked': return !this.world.leftIsClear();
      case 'right_is_clear': return this.world.rightIsClear();
      case 'right_is_blocked': return !this.world.rightIsClear();
      case 'next_to_a_beeper': return this.world.nextToABeeper();
      case 'not_next_to_a_beeper': return !this.world.nextToABeeper();
      case 'any_beepers_in_beeper_bag': return this.world.anyBeepersInBag();
      case 'no_beepers_in_beeper_bag': return !this.world.anyBeepersInBag();
      case 'any_beepers_in_world': return this.world.anyBeepersInWorld();
      case 'no_beepers_in_world': return !this.world.anyBeepersInWorld();
      case 'facing_north': return this.world.robot.dir === 'NORTH';
      case 'not_facing_north': return this.world.robot.dir !== 'NORTH';
      case 'facing_south': return this.world.robot.dir === 'SOUTH';
      case 'not_facing_south': return this.world.robot.dir !== 'SOUTH';
      case 'facing_east': return this.world.robot.dir === 'EAST';
      case 'not_facing_east': return this.world.robot.dir !== 'EAST';
      case 'facing_west': return this.world.robot.dir === 'WEST';
      case 'not_facing_west': return this.world.robot.dir !== 'WEST';
      default:
        throw new Error(`Sensor tidak dikenal: '${cond}'`);
    }
  }

  // Execute single atomic step, returns { lineNo, command, isFinished, error }
  step() {
    if (this.isFinished) return { isFinished: true };
    if (this.stack.length === 0) {
      this.isFinished = true;
      return { isFinished: true };
    }

    const frame = this.stack[this.stack.length - 1];

    // Block frame
    if (frame.type === 'BLOCK') {
      if (frame.pc >= frame.statements.length) {
        this.stack.pop();
        return this.step();
      }

      const stmt = frame.statements[frame.pc];

      if (stmt.type === 'COMMAND') {
        frame.pc += 1;
        const lineNo = stmt.lineNo;
        const cmd = stmt.command;

        // Check if command is a user-defined function
        if (this.functions.has(cmd)) {
          if (this.stack.length > 250) {
            const err = `Line ${lineNo}: Call stack overflow! Terlalu banyak pemanggilan fungsi bersarang (kemungkinan rekursi tanpa henti).`;
            this.error = err;
            this.isFinished = true;
            return { lineNo, command: cmd, error: err, isFinished: true };
          }
          const fn = this.functions.get(cmd);
          this.stack.push({
            type: 'BLOCK',
            statements: fn.body,
            pc: 0,
            scope: fn.name,
            callLineNo: lineNo
          });
          return { lineNo, command: `Panggil fungsi: ${cmd}()`, isFinished: false };
        }

        // Primitive commands
        try {
          if (cmd === 'move') this.world.move();
          else if (cmd === 'turnleft') this.world.turnleft();
          else if (cmd === 'pickbeeper') this.world.pickbeeper();
          else if (cmd === 'putbeeper') this.world.putbeeper();
          else if (cmd === 'turnoff') {
            this.world.turnoff();
            this.isFinished = true;
          } else {
            throw new Error(`Line ${lineNo}: Perintah tidak dikenal: '${cmd}'`);
          }
        } catch (err) {
          this.error = err.message;
          this.isFinished = true;
          return { lineNo, command: cmd, error: err.message, isFinished: true };
        }

        return { lineNo, command: cmd, isFinished: this.isFinished };
      }

      if (stmt.type === 'DO_LOOP') {
        frame.pc += 1;
        this.stack.push({
          type: 'DO_LOOP_FRAME',
          remaining: stmt.count,
          total: stmt.count,
          body: stmt.body,
          lineNo: stmt.lineNo
        });
        return { lineNo: stmt.lineNo, command: `do ${stmt.count}:`, isFinished: false };
      }

      if (stmt.type === 'WHILE_LOOP') {
        frame.pc += 1;
        this.stack.push({
          type: 'WHILE_LOOP_FRAME',
          condition: stmt.condition,
          body: stmt.body,
          lineNo: stmt.lineNo,
          iterations: 0
        });
        return { lineNo: stmt.lineNo, command: `while ${stmt.condition}:`, isFinished: false };
      }

      if (stmt.type === 'IF_BRANCH') {
        frame.pc += 1;
        const isTrue = this.evalCondition(stmt.condition);
        if (isTrue) {
          this.stack.push({
            type: 'BLOCK',
            statements: stmt.body,
            pc: 0,
            scope: 'if_body'
          });
          return { lineNo: stmt.lineNo, command: `if ${stmt.condition} (BENAR)`, isFinished: false };
        } else {
          // Check elif branches
          let branchTaken = false;
          for (const elif of stmt.elifBranches) {
            if (this.evalCondition(elif.condition)) {
              this.stack.push({
                type: 'BLOCK',
                statements: elif.body,
                pc: 0,
                scope: 'elif_body'
              });
              branchTaken = true;
              return { lineNo: elif.lineNo, command: `elif ${elif.condition} (BENAR)`, isFinished: false };
            }
          }
          if (!branchTaken && stmt.elseBranch) {
            this.stack.push({
              type: 'BLOCK',
              statements: stmt.elseBranch.body,
              pc: 0,
              scope: 'else_body'
            });
            return { lineNo: stmt.elseBranch.lineNo, command: `else (dieksekusi)`, isFinished: false };
          }
          return { lineNo: stmt.lineNo, command: `if ${stmt.condition} (SALAH - lewati)`, isFinished: false };
        }
      }
    }

    // DO Loop Frame
    if (frame.type === 'DO_LOOP_FRAME') {
      if (frame.remaining <= 0) {
        this.stack.pop();
        return this.step();
      }
      frame.remaining -= 1;
      this.stack.push({
        type: 'BLOCK',
        statements: frame.body,
        pc: 0,
        scope: `do_iteration_${frame.total - frame.remaining}`
      });
      return { lineNo: frame.lineNo, command: `Iterasi do (${frame.total - frame.remaining}/${frame.total})`, isFinished: false };
    }

    // WHILE Loop Frame
    if (frame.type === 'WHILE_LOOP_FRAME') {
      frame.iterations += 1;
      if (frame.iterations > 2000) {
        const err = `Line ${frame.lineNo}: Terdeteksi INFINITE LOOP pada while ${frame.condition}! Robot telah berputar lebih dari 2000 iterasi.`;
        this.error = err;
        this.isFinished = true;
        return { lineNo: frame.lineNo, error: err, isFinished: true };
      }

      const isTrue = this.evalCondition(frame.condition);
      if (isTrue) {
        this.stack.push({
          type: 'BLOCK',
          statements: frame.body,
          pc: 0,
          scope: `while_body_${frame.iterations}`
        });
        return { lineNo: frame.lineNo, command: `while ${frame.condition} (BENAR, iterasi ${frame.iterations})`, isFinished: false };
      } else {
        this.stack.pop();
        return { lineNo: frame.lineNo, command: `while ${frame.condition} (SALAH, loop selesai)`, isFinished: false };
      }
    }

    this.stack.pop();
    return this.step();
  }

  // Count non-empty, non-comment lines (the standard rule used by Aslab in quizzes)
  static countEffectiveLines(code) {
    if (!code) return 0;
    return code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('#');
    }).length;
  }

  // HTML syntax highlighter for GvRng code
  static highlightLine(rawText) {
    if (!rawText) return '&nbsp;';
    
    // Check if whole line is comment
    const trimmed = rawText.trim();
    if (trimmed.startsWith('#')) {
      return `<span class="tok-comment">${escapeHtml(rawText)}</span>`;
    }

    // Split inline comment if exists
    let codePart = rawText;
    let commentPart = '';
    const hashIdx = rawText.indexOf('#');
    if (hashIdx >= 0) {
      codePart = rawText.slice(0, hashIdx);
      commentPart = rawText.slice(hashIdx);
    }

    // Replace keywords
    let html = escapeHtml(codePart);

    // Keywords
    html = html.replace(/\b(define|do|while|if|elif|else)\b/g, '<span class="tok-kw">$1</span>');
    
    // Numbers
    html = html.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');

    // Built-in actions
    html = html.replace(/\b(move|turnleft|pickbeeper|putbeeper|turnoff)\b/g, '<span class="tok-fn">$1</span>');

    // Sensors
    html = html.replace(/\b(front_is_clear|front_is_blocked|left_is_clear|left_is_blocked|right_is_clear|right_is_blocked|next_to_a_beeper|not_next_to_a_beeper|any_beepers_in_beeper_bag|no_beepers_in_beeper_bag|facing_north|not_facing_north|facing_south|not_facing_south|facing_east|not_facing_east|facing_west|not_facing_west)\b/g, '<span class="tok-cond">$1</span>');

    if (commentPart) {
      html += `<span class="tok-comment">${escapeHtml(commentPart)}</span>`;
    }

    return html;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

window.GvrInterpreter = GvrInterpreter;
