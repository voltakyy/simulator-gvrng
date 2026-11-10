/**
 * GvRng 2D World Simulation & Authoring Engine
 * Full authentic Guido van Robot NG runtime with interactive World Builder,
 * dot-to-dot wall geometry, Cartesian cell coordinates, hit-testing,
 * and .gvrw serialization.
 */

class GvrWorld {
  constructor(cols = 15, rows = 15) {
    this.cols = Math.max(5, Math.min(40, cols));
    this.rows = Math.max(5, Math.min(40, rows));
    this.reset();
  }

  reset() {
    this.robot = {
      x: 1,
      y: 1,
      dir: 'EAST', // 'NORTH', 'EAST', 'SOUTH', 'WEST'
      beepers: 0,
      isOff: false,
      stepCount: 0
    };
    // Map of "x,y" -> beeper count
    this.beepers = new Map();
    // Wall sets:
    // hWalls: horizontal wall on Street s from Avenue a to a+1 (connects dot (a, s) to (a+1, s))
    // vWalls: vertical wall on Avenue a from Street s to s+1 (connects dot (a, s) to (a, s+1))
    this.hWalls = new Set();
    this.vWalls = new Set();
    this.initialSnapshot = null;
    this.pathHistory = []; // stores [{x, y}] coordinates visited
  }

  setRobot(x, y, dir = 'EAST', beepers = 0) {
    this.robot.x = Math.max(1, Math.min(this.cols, x));
    this.robot.y = Math.max(1, Math.min(this.rows, y));
    this.robot.dir = dir.toUpperCase();
    this.robot.beepers = Math.max(0, beepers);
    this.robot.isOff = false;
    this.robot.stepCount = 0;
    this.pathHistory = [{ x: this.robot.x, y: this.robot.y }];
  }

  addBeeper(x, y, count = 1) {
    if (x < 1 || x > this.cols || y < 1 || y > this.rows) return;
    const key = `${x},${y}`;
    const cur = this.beepers.get(key) || 0;
    this.beepers.set(key, cur + count);
  }

  setBeeper(x, y, count) {
    if (x < 1 || x > this.cols || y < 1 || y > this.rows) return;
    const key = `${x},${y}`;
    if (count <= 0) {
      this.beepers.delete(key);
    } else {
      this.beepers.set(key, count);
    }
  }

  removeBeeper(x, y, count = 1) {
    const key = `${x},${y}`;
    const cur = this.beepers.get(key) || 0;
    const next = cur - count;
    if (next <= 0) {
      this.beepers.delete(key);
    } else {
      this.beepers.set(key, next);
    }
  }

  getBeeperCount(x, y) {
    return this.beepers.get(`${x},${y}`) || 0;
  }

  clearAllBeepers() {
    this.beepers.clear();
  }

  // Add horizontal wall segment North of Street s along Avenue a (connects dot (a, s+1) to (a+1, s+1))
  addHWall(a, s) {
    if (a < 1 || a > this.cols || s < 1 || s >= this.rows) return;
    this.hWalls.add(`${a},${s}`);
  }

  removeHWall(a, s) {
    this.hWalls.delete(`${a},${s}`);
  }

  hasHWall(a, s) {
    return this.hWalls.has(`${a},${s}`);
  }

  hasVWall(a, s) {
    return this.vWalls.has(`${a},${s}`);
  }

  toggleHWall(a, s) {
    if (a < 1 || a > this.cols || s < 1 || s >= this.rows) return false;
    const key = `${a},${s}`;
    if (this.hWalls.has(key)) {
      this.hWalls.delete(key);
      return false; // removed
    } else {
      this.hWalls.add(key);
      return true; // added
    }
  }

  // Add vertical wall segment East of Avenue a along Street s (connects dot (a+1, s) to (a+1, s+1))
  addVWall(a, s) {
    if (a < 1 || a >= this.cols || s < 1 || s > this.rows) return;
    this.vWalls.add(`${a},${s}`);
  }

  removeVWall(a, s) {
    this.vWalls.delete(`${a},${s}`);
  }

  toggleVWall(a, s) {
    if (a < 1 || a >= this.cols || s < 1 || s > this.rows) return false;
    const key = `${a},${s}`;
    if (this.vWalls.has(key)) {
      this.vWalls.delete(key);
      return false;
    } else {
      this.vWalls.add(key);
      return true;
    }
  }

  clearAllWalls() {
    this.hWalls.clear();
    this.vWalls.clear();
  }

  clearAll() {
    this.clearAllWalls();
    this.clearAllBeepers();
    this.setRobot(1, 1, 'EAST', 0);
  }

  resize(cols, rows) {
    this.cols = Math.max(5, Math.min(40, cols));
    this.rows = Math.max(5, Math.min(40, rows));

    // Prune walls & beepers outside new bounds
    [...this.hWalls].forEach(k => {
      const [a, s] = k.split(',').map(Number);
      if (a > this.cols || s >= this.rows) this.hWalls.delete(k);
    });
    [...this.vWalls].forEach(k => {
      const [a, s] = k.split(',').map(Number);
      if (a >= this.cols || s > this.rows) this.vWalls.delete(k);
    });
    [...this.beepers.keys()].forEach(k => {
      const [x, y] = k.split(',').map(Number);
      if (x > this.cols || y > this.rows) this.beepers.delete(k);
    });

    if (this.robot.x > this.cols) this.robot.x = this.cols;
    if (this.robot.y > this.rows) this.robot.y = this.rows;
  }

  clone() {
    const clone = new GvrWorld(this.cols, this.rows);
    clone.setRobot(this.robot.x, this.robot.y, this.robot.dir, this.robot.beepers);
    clone.robot.isOff = this.robot.isOff;
    clone.robot.stepCount = this.robot.stepCount;
    clone.beepers = new Map(this.beepers);
    clone.hWalls = new Set(this.hWalls);
    clone.vWalls = new Set(this.vWalls);
    clone.pathHistory = [...this.pathHistory];
    return clone;
  }

  // Save snapshot to allow resetting to the exact initial world state
  saveSnapshot() {
    this.initialSnapshot = {
      robot: { ...this.robot },
      beepers: new Map(this.beepers),
      hWalls: new Set(this.hWalls),
      vWalls: new Set(this.vWalls),
      cols: this.cols,
      rows: this.rows
    };
  }

  restoreSnapshot() {
    if (!this.initialSnapshot) return;
    this.robot = { ...this.initialSnapshot.robot, isOff: false, stepCount: 0 };
    this.beepers = new Map(this.initialSnapshot.beepers);
    this.hWalls = new Set(this.initialSnapshot.hWalls);
    this.vWalls = new Set(this.initialSnapshot.vWalls);
    this.cols = this.initialSnapshot.cols;
    this.rows = this.initialSnapshot.rows;
    this.pathHistory = [{ x: this.robot.x, y: this.robot.y }];
  }

  getLeftDir(dir) {
    const order = ['NORTH', 'WEST', 'SOUTH', 'EAST'];
    const idx = order.indexOf(dir);
    return order[(idx + 1) % 4];
  }

  getRightDir(dir) {
    const order = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const idx = order.indexOf(dir);
    return order[(idx + 1) % 4];
  }

  // ==========================================
  // SENSORS SUITE (18 Authentic GvRng Sensors)
  // ==========================================
  frontIsClear() {
    const { x, y, dir } = this.robot;
    if (dir === 'NORTH') {
      if (y >= this.rows) return false;
      return !this.hWalls.has(`${x},${y}`);
    } else if (dir === 'SOUTH') {
      if (y <= 1) return false;
      return !this.hWalls.has(`${x},${y - 1}`);
    } else if (dir === 'EAST') {
      if (x >= this.cols) return false;
      return !this.vWalls.has(`${x},${y}`);
    } else if (dir === 'WEST') {
      if (x <= 1) return false;
      return !this.vWalls.has(`${x - 1},${y}`);
    }
    return false;
  }

  frontIsBlocked() {
    return !this.frontIsClear();
  }

  leftIsClear() {
    const origDir = this.robot.dir;
    this.robot.dir = this.getLeftDir(origDir);
    const clear = this.frontIsClear();
    this.robot.dir = origDir;
    return clear;
  }

  leftIsBlocked() {
    return !this.leftIsClear();
  }

  rightIsClear() {
    const origDir = this.robot.dir;
    this.robot.dir = this.getRightDir(origDir);
    const clear = this.frontIsClear();
    this.robot.dir = origDir;
    return clear;
  }

  rightIsBlocked() {
    return !this.rightIsClear();
  }

  nextToABeeper() {
    return this.getBeeperCount(this.robot.x, this.robot.y) > 0;
  }

  notNextToABeeper() {
    return !this.nextToABeeper();
  }

  anyBeepersInBag() {
    return this.robot.beepers > 0;
  }

  noBeepersInBag() {
    return !this.anyBeepersInBag();
  }

  anyBeepersInWorld() {
    for (const val of this.beepers.values()) {
      if (val > 0) return true;
    }
    return false;
  }

  noBeepersInWorld() {
    return !this.anyBeepersInWorld();
  }

  facingNorth() {
    return this.robot.dir === 'NORTH';
  }

  notFacingNorth() {
    return !this.facingNorth();
  }

  facingEast() {
    return this.robot.dir === 'EAST';
  }

  notFacingEast() {
    return !this.facingEast();
  }

  facingSouth() {
    return this.robot.dir === 'SOUTH';
  }

  notFacingSouth() {
    return !this.facingSouth();
  }

  facingWest() {
    return this.robot.dir === 'WEST';
  }

  notFacingWest() {
    return !this.facingWest();
  }

  // ==========================================
  // PRIMITIVE EXECUTION ACTIONS
  // ==========================================
  move() {
    if (this.robot.isOff) throw new Error('Robot sudah dimatikan (turnoff).');
    if (!this.frontIsClear()) {
      throw new Error(`Tabrakan dengan tembok! Robot berada di (${this.robot.x}, ${this.robot.y}) menghadap ${this.robot.dir}.`);
    }

    if (this.robot.dir === 'NORTH') this.robot.y++;
    else if (this.robot.dir === 'SOUTH') this.robot.y--;
    else if (this.robot.dir === 'EAST') this.robot.x++;
    else if (this.robot.dir === 'WEST') this.robot.x--;

    this.robot.stepCount++;
    this.pathHistory.push({ x: this.robot.x, y: this.robot.y });
  }

  turnleft() {
    if (this.robot.isOff) throw new Error('Robot sudah dimatikan (turnoff).');
    this.robot.dir = this.getLeftDir(this.robot.dir);
  }

  pickbeeper() {
    if (this.robot.isOff) throw new Error('Robot sudah dimatikan (turnoff).');
    const count = this.getBeeperCount(this.robot.x, this.robot.y);
    if (count <= 0) {
      throw new Error(`Tidak ada beeper di persimpangan (${this.robot.x}, ${this.robot.y})!`);
    }
    this.removeBeeper(this.robot.x, this.robot.y, 1);
    this.robot.beepers++;
  }

  putbeeper() {
    if (this.robot.isOff) throw new Error('Robot sudah dimatikan (turnoff).');
    if (this.robot.beepers <= 0) {
      throw new Error(`Tas robot kosong! Tidak ada beeper untuk diletakkan.`);
    }
    this.robot.beepers--;
    this.addBeeper(this.robot.x, this.robot.y, 1);
  }

  turnoff() {
    this.robot.isOff = true;
  }

  // ==========================================
  // GVRW SERIALIZATION (.gvrw)
  // Standard Authentic Guido van Robot Format (No alien 'size' command)
  // ==========================================
  toGvrw() {
    const lines = [];
    lines.push(`# Guido van Robot World (.gvrw)`);
    lines.push(`robot ${this.robot.x} ${this.robot.y} ${this.robot.dir[0]} ${this.robot.beepers}`);

    // Horizontal walls (wall Avenue Street N)
    this.hWalls.forEach(key => {
      const [a, s] = key.split(',');
      lines.push(`wall ${a} ${s} N`);
    });

    // Vertical walls (wall Avenue Street E)
    this.vWalls.forEach(key => {
      const [a, s] = key.split(',');
      lines.push(`wall ${a} ${s} E`);
    });

    // Beepers (beepers Avenue Street Count)
    this.beepers.forEach((count, key) => {
      if (count > 0) {
        const [x, y] = key.split(',');
        lines.push(`beepers ${x} ${y} ${count}`);
      }
    });

    return lines.join('\n');
  }

  fromGvrw(text) {
    if (!text || typeof text !== 'string') return;
    this.clearAll();

    let maxAvenue = 15;
    let maxStreet = 15;

    const lines = text.split('\n');
    lines.forEach(raw => {
      const clean = raw.trim();
      if (!clean || clean.startsWith('#')) return;
      const parts = clean.split(/\s+/);
      const cmd = parts[0].toLowerCase();

      if (cmd === 'size' && parts.length >= 3) {
        // Optional legacy fallback if present
        const c = parseInt(parts[1], 10);
        const r = parseInt(parts[2], 10);
        if (!isNaN(c) && !isNaN(r)) {
          maxAvenue = Math.max(maxAvenue, c);
          maxStreet = Math.max(maxStreet, r);
        }
      } else if (cmd === 'robot' && parts.length >= 4) {
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        let dirLetter = parts[3].toUpperCase();
        let dir = 'EAST';
        if (dirLetter.startsWith('N')) dir = 'NORTH';
        else if (dirLetter.startsWith('S')) dir = 'SOUTH';
        else if (dirLetter.startsWith('W')) dir = 'WEST';
        else if (dirLetter.startsWith('E')) dir = 'EAST';
        const beepers = parts[4] !== undefined ? parseInt(parts[4], 10) : 0;
        maxAvenue = Math.max(maxAvenue, x + 2);
        maxStreet = Math.max(maxStreet, y + 2);
        this.setRobot(x, y, dir, isNaN(beepers) ? 0 : beepers);
      } else if (cmd === 'wall' && parts.length >= 4) {
        const a = parseInt(parts[1], 10);
        const s = parseInt(parts[2], 10);
        const dir = parts[3].toUpperCase();
        maxAvenue = Math.max(maxAvenue, a + 2);
        maxStreet = Math.max(maxStreet, s + 2);
        if (dir.startsWith('N')) this.addHWall(a, s);
        else if (dir.startsWith('S')) this.addHWall(a, s - 1);
        else if (dir.startsWith('E')) this.addVWall(a, s);
        else if (dir.startsWith('W')) this.addVWall(a - 1, s);
      } else if (cmd === 'beepers' && parts.length >= 4) {
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        const count = parseInt(parts[3], 10);
        maxAvenue = Math.max(maxAvenue, x + 2);
        maxStreet = Math.max(maxStreet, y + 2);
        if (!isNaN(count) && count > 0) this.setBeeper(x, y, count);
      }
    });

    if (maxAvenue > this.cols || maxStreet > this.rows) {
      this.resize(Math.max(this.cols, maxAvenue), Math.max(this.rows, maxStreet));
    }

    this.saveSnapshot();
  }

  // ==========================================
  // GOAL STATE VALIDATION & DIFF
  // ==========================================
  diffState(targetGoal) {
    const issues = [];
    if (!this.robot.isOff) {
      issues.push('Robot belum berhenti dengan turnoff.');
    }

    if (!targetGoal) return issues;

    // 1. Robot position check (if target specified)
    if (targetGoal.robot) {
      if (targetGoal.robot.x !== undefined && this.robot.x !== targetGoal.robot.x) {
        issues.push(`Posisi X robot: ${this.robot.x}, target harus di ${targetGoal.robot.x}.`);
      }
      if (targetGoal.robot.y !== undefined && this.robot.y !== targetGoal.robot.y) {
        issues.push(`Posisi Y robot: ${this.robot.y}, target harus di ${targetGoal.robot.y}.`);
      }
      if (targetGoal.robot.dir && this.robot.dir !== targetGoal.robot.dir) {
        issues.push(`Arah hadap robot: ${this.robot.dir}, target harus ${targetGoal.robot.dir}.`);
      }
      if (targetGoal.robot.beepers !== undefined && targetGoal.robot.beepers >= 0) {
        if (this.robot.beepers !== targetGoal.robot.beepers) {
          issues.push(`Isi tas robot: ${this.robot.beepers} beeper, target harus ${targetGoal.robot.beepers}.`);
        }
      }
    }

    // 2. Beepers check
    if (targetGoal.beepers instanceof Map) {
      const allKeys = new Set([...this.beepers.keys(), ...targetGoal.beepers.keys()]);
      allKeys.forEach(k => {
        const cur = this.beepers.get(k) || 0;
        const req = targetGoal.beepers.get(k) || 0;
        if (cur !== req) {
          const [bx, by] = k.split(',');
          issues.push(`Beeper di (${bx}, ${by}): ada ${cur}, target membutuhkan ${req}.`);
        }
      });
    }

    return issues;
  }

  // ==========================================
  // CANVAS COORDINATE TRANSFORM & HIT TESTING
  // Authentic GvRng Geometry:
  // - Grid dots at (gx, gy) for gx=1..cols+1, gy=1..rows+1
  // - Cells at (cx, cy) for cx=1..cols, cy=1..rows
  // - Robot and Beepers centered inside cells at (cx, cy)
  // - H-Walls North of (a, s) connect dot (a, s+1) to (a+1, s+1)
  // - V-Walls East of (a, s) connect dot (a+1, s) to (a+1, s+1)
  // ==========================================
  getTransform(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const padX = 36;
    const padY = 36;
    const availW = canvas.width / dpr - padX * 2;
    const availH = canvas.height / dpr - padY * 2;

    const cellSize = Math.min(availW / this.cols, availH / this.rows, 42);

    const gridW = this.cols * cellSize;
    const gridH = this.rows * cellSize;
    const startX = padX + ((availW - gridW) / 2);
    const startY = (canvas.height / dpr) - padY - ((availH - gridH) / 2);

    // Grid intersection dot position: gx: 1..cols+1, gy: 1..rows+1
    const toPx = (gx, gy) => ({
      px: startX + (gx - 1) * cellSize,
      py: startY - (gy - 1) * cellSize
    });

    // Cell center: cx: 1..cols, cy: 1..rows
    const toCellCenter = (cx, cy) => ({
      px: startX + (cx - 0.5) * cellSize,
      py: startY - (cy - 0.5) * cellSize
    });

    const fromPx = (px, py) => ({
      gx: (px - startX) / cellSize + 1,
      gy: (startY - py) / cellSize + 1
    });

    return { dpr, padX, padY, availW, availH, cellSize, startX, startY, toPx, toCellCenter, fromPx };
  }

  hitTest(px, py, canvas, threshold = 20) {
    const { startX, startY, cellSize, toPx, toCellCenter } = this.getTransform(canvas);

    // 1. Cell coordinates (cell cx, cy)
    const cellX = Math.floor((px - startX) / cellSize) + 1;
    const cellY = Math.floor((startY + cellSize - py) / cellSize);
    const isInsideCell = cellX >= 1 && cellX <= this.cols && cellY >= 1 && cellY <= this.rows;

    let cellCenterDist = 999;
    let beeperCount = 0;
    if (isInsideCell) {
      const center = toCellCenter(cellX, cellY);
      cellCenterDist = Math.hypot(px - center.px, py - center.py);
      beeperCount = this.getBeeperCount(cellX, cellY);
    }

    // 2. Check dot-to-dot walls
    let existingWall = null;
    let closestWallSlot = null;
    let minExistingDist = threshold;
    let minSlotDist = threshold;

    // Horizontal walls: North of cell (a, s) connects dot (a, s+1) to (a+1, s+1)
    for (let a = 1; a <= this.cols; a++) {
      for (let s = 1; s < this.rows; s++) {
        const p1 = toPx(a, s + 1);
        const p2 = toPx(a + 1, s + 1);
        if (px >= p1.px - 6 && px <= p2.px + 6) {
          const dist = Math.abs(py - p1.py);
          const wallKey = `${a},${s}`;
          const isPresent = this.hWalls.has(wallKey);

          if (isPresent && dist < minExistingDist) {
            minExistingDist = dist;
            existingWall = { type: 'hwall', a, s, dist };
          }
          if (dist < minSlotDist) {
            minSlotDist = dist;
            closestWallSlot = { type: 'hwall', a, s, dist };
          }
        }
      }
    }

    // Vertical walls: East of cell (a, s) connects dot (a+1, s) to (a+1, s+1)
    for (let a = 1; a < this.cols; a++) {
      for (let s = 1; s <= this.rows; s++) {
        const p1 = toPx(a + 1, s);
        const p2 = toPx(a + 1, s + 1);
        if (py <= p1.py + 6 && py >= p2.py - 6) {
          const dist = Math.abs(px - p1.px);
          const wallKey = `${a},${s}`;
          const isPresent = this.vWalls.has(wallKey);

          if (isPresent && dist < minExistingDist) {
            minExistingDist = dist;
            existingWall = { type: 'vwall', a, s, dist };
          }
          if (dist < minSlotDist) {
            minSlotDist = dist;
            closestWallSlot = { type: 'vwall', a, s, dist };
          }
        }
      }
    }

    // 3. Nearest grid intersection dot (gx, gy)
    const dotX = Math.round((px - startX) / cellSize) + 1;
    const dotY = Math.round((startY - py) / cellSize) + 1;
    const isInsideGrid = dotX >= 1 && dotX <= this.cols + 1 && dotY >= 1 && dotY <= this.rows + 1;

    return {
      wall: closestWallSlot,
      existingWall,
      cell: isInsideCell ? { x: cellX, y: cellY } : null,
      beeperCount,
      hasBeeper: beeperCount > 0,
      cellCenterDist,
      dot: isInsideGrid ? { x: dotX, y: dotY } : null
    };
  }

  // ==========================================
  // RENDER ENGINE
  // ==========================================
  render(canvas, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { dpr, cellSize, startX, startY, toPx, toCellCenter } = this.getTransform(canvas);

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Background paper
    ctx.fillStyle = options.isTargetView ? '#fcfbf7' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // 1. Grid Intersections (Dots)
    for (let x = 1; x <= this.cols + 1; x++) {
      for (let y = 1; y <= this.rows + 1; y++) {
        const { px, py } = toPx(x, y);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = options.isTargetView ? '#cbd5e1' : '#94a3b8';
        ctx.fill();
      }
    }

    // Numbered Axis Labels (Avenue columns & Street rows)
    ctx.font = '11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#64748b';

    for (let x = 1; x <= this.cols; x++) {
      const { px } = toCellCenter(x, 1);
      ctx.fillText(x.toString(), px, startY + 18);
    }
    for (let y = 1; y <= this.rows; y++) {
      const { py } = toCellCenter(1, y);
      ctx.fillText(y.toString(), startX - 18, py);
    }

    // 1b. Boundary Walls (West of Avenue 1 & South of Street 1)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // South outer wall: connecting dot (1,1) to (cols+1, 1)
    const pBL = toPx(1, 1);
    const pBR = toPx(this.cols + 1, 1);
    ctx.beginPath();
    ctx.moveTo(pBL.px, pBL.py);
    ctx.lineTo(pBR.px, pBR.py);
    ctx.stroke();

    // West outer wall: connecting dot (1,1) to (1, rows+1)
    const pTL = toPx(1, this.rows + 1);
    ctx.beginPath();
    ctx.moveTo(pBL.px, pBL.py);
    ctx.lineTo(pTL.px, pTL.py);
    ctx.stroke();

    // 2. Path Trail (Live simulation path history)
    if (!options.isTargetView && this.pathHistory && this.pathHistory.length > 1) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 102, 204, 0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const pStart = toCellCenter(this.pathHistory[0].x, this.pathHistory[0].y);
      ctx.moveTo(pStart.px, pStart.py);
      for (let i = 1; i < this.pathHistory.length; i++) {
        const pt = toCellCenter(this.pathHistory[i].x, this.pathHistory[i].y);
        ctx.lineTo(pt.px, pt.py);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Hover Indicators (for World Builder live feedback)
    if (options.hover) {
      if (options.hover.wall) {
        ctx.save();
        ctx.strokeStyle = options.activeTool === 'eraser' ? '#ef4444' : '#3b82f6';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.setLineDash([4, 4]);
        const w = options.hover.wall;
        if (w.type === 'hwall') {
          const p1 = toPx(w.a, w.s + 1);
          const p2 = toPx(w.a + 1, w.s + 1);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        } else if (w.type === 'vwall') {
          const p1 = toPx(w.a + 1, w.s);
          const p2 = toPx(w.a + 1, w.s + 1);
          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.stroke();
        }
        ctx.restore();
      } else if (options.hover.cell && (options.activeTool === 'robot' || options.activeTool === 'beeper' || options.activeTool === 'beeper-plus' || options.activeTool === 'beeper-minus')) {
        ctx.save();
        const { px, py } = toCellCenter(options.hover.cell.x, options.hover.cell.y);
        ctx.beginPath();
        ctx.arc(px, py, cellSize * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = options.activeTool === 'robot' ? 'rgba(0, 102, 204, 0.15)' : 'rgba(2, 132, 199, 0.2)';
        ctx.fill();
        ctx.restore();
      }
    }

    // 4. Dot-to-Dot Walls
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    // Horizontal walls North of cell (a, s): connects dot (a, s+1) to (a+1, s+1)
    this.hWalls.forEach(key => {
      const [a, s] = key.split(',').map(Number);
      const p1 = toPx(a, s + 1);
      const p2 = toPx(a + 1, s + 1);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    });

    // Vertical walls East of cell (a, s): connects dot (a+1, s) to (a+1, s+1)
    this.vWalls.forEach(key => {
      const [a, s] = key.split(',').map(Number);
      const p1 = toPx(a + 1, s);
      const p2 = toPx(a + 1, s + 1);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
    });

    // 5. Beepers (Rendered in cell centers with proportional ocean blue tokens)
    this.beepers.forEach((count, key) => {
      if (count <= 0) return;
      const [gx, gy] = key.split(',').map(Number);
      const { px, py } = toCellCenter(gx, gy);

      // Proportional radius (never collides with walls or adjacent beepers)
      const bRadius = Math.max(7.5, Math.min(13, cellSize * 0.30));
      const fontSize = Math.max(8, Math.min(12, Math.round(bRadius * 1.05)));

      // Main Token Disc (Ocean Blue Gradient)
      ctx.beginPath();
      ctx.arc(px, py, bRadius, 0, Math.PI * 2);
      const grad = ctx.createLinearGradient(px, py - bRadius, px, py + bRadius);
      if (options.isTargetView) {
        grad.addColorStop(0, '#34d399'); // emerald light
        grad.addColorStop(1, '#059669'); // emerald dark
      } else {
        grad.addColorStop(0, '#38bdf8'); // cyan sea blue
        grad.addColorStop(1, '#0284c7'); // deep ocean blue
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Crisp border: 1.8px white outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Subtle dark contrast rim
      ctx.beginPath();
      ctx.arc(px, py, bRadius + 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = options.isTargetView ? '#064e3b' : '#0369a1';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // High-contrast crisp white number badge
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${fontSize}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const textToDisplay = count > 99 ? '99+' : count.toString();
      ctx.fillText(textToDisplay, px, py + 0.5);
    });

    // 6. Robot (Directional Arrow Vehicle inside cell)
    if (this.robot && this.robot.x && this.robot.y) {
      const { px, py } = toCellCenter(this.robot.x, this.robot.y);
      ctx.save();
      ctx.translate(px, py);

      let angle = 0;
      if (this.robot.dir === 'NORTH') angle = -Math.PI / 2;
      else if (this.robot.dir === 'SOUTH') angle = Math.PI / 2;
      else if (this.robot.dir === 'WEST') angle = Math.PI;
      else if (this.robot.dir === 'EAST') angle = 0;
      ctx.rotate(angle);

      const rSize = cellSize * 0.38;
      ctx.beginPath();
      ctx.moveTo(rSize, 0);
      ctx.lineTo(-rSize * 0.75, -rSize * 0.75);
      ctx.lineTo(-rSize * 0.4, 0);
      ctx.lineTo(-rSize * 0.75, rSize * 0.75);
      ctx.closePath();

      if (this.robot.isOff) {
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#334155';
      } else if (options.isTargetView) {
        ctx.fillStyle = '#059669';
        ctx.strokeStyle = '#047857';
      } else {
        ctx.fillStyle = '#0066cc';
        ctx.strokeStyle = '#004c99';
      }

      ctx.lineWidth = 2.2;
      ctx.fill();
      ctx.stroke();

      // Eye
      ctx.beginPath();
      ctx.arc(rSize * 0.25, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      // Overlap indicator badge if robot is standing on top of a beeper cell
      const robotCellKey = `${this.robot.x},${this.robot.y}`;
      const beeperCountUnderRobot = this.beepers.get(robotCellKey) || 0;
      if (beeperCountUnderRobot > 0) {
        const badgeX = px + cellSize * 0.28;
        const badgeY = py - cellSize * 0.28;
        const miniR = Math.max(5, Math.min(8, cellSize * 0.18));
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, miniR, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(6.5, Math.round(miniR * 1.05))}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(beeperCountUnderRobot.toString(), badgeX, badgeY + 0.5);
      }
    }

    ctx.restore();
  }
}

// Export to window for browser access
window.GvrWorld = GvrWorld;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GvrWorld };
}
