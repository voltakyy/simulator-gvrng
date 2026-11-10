/**
 * GvRng World Builder Studio Engine
 * Full interactive authoring environment for custom GvRng mazes,
 * dot-to-dot wall drawing, robot positioning, beeper placement,
 * target goal authoring, .gvrw two-way sync, and local storage persistence.
 */

class GvrWorldBuilder {
  constructor() {
    this.canvas = null;
    this.initialWorld = new GvrWorld(15, 15);
    this.goalWorld = new GvrWorld(15, 15);
    
    // Default initial world
    this.initialWorld.setRobot(1, 1, 'EAST', 0);
    this.initialWorld.addBeeper(5, 5, 1);
    this.initialWorld.addHWall(3, 4);
    this.initialWorld.addVWall(4, 3);
    this.initialWorld.saveSnapshot();

    // Default target goal world
    this.goalWorld.setRobot(5, 5, 'EAST', 1);
    this.goalWorld.robot.isOff = true;

    // Builder UI State
    this.activeLayer = 'initial'; // 'initial' or 'goal'
    this.activeTool = 'wall'; // 'wall', 'robot', 'beeper', 'eraser'
    this.eraserFilter = 'all'; // 'all', 'beeper', 'wall'
    this.robotDir = 'EAST';
    this.robotBag = 0;
    this.beeperDelta = 1;
    this.hoverTarget = null;
    this.isMouseDown = false;
    this.isEnabled = false;
    this._eventsBound = false;
    this.onWorldChanged = null; // Callback for real-time sync with simulator runtime

    // Custom Worlds Storage
    this.storageKey = 'gvrng_custom_worlds_v2';
    this.customWorlds = this.loadCustomWorldsFromStorage();
  }

  getActiveWorld() {
    return this.activeLayer === 'initial' ? this.initialWorld : this.goalWorld;
  }

  syncFromWorlds(initial, goal) {
    if (initial) {
      this.initialWorld = initial;
    }
    if (goal) {
      this.goalWorld = goal;
    }
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
  }

  init(canvasId) {
    this.canvas = typeof canvasId === 'string' ? document.getElementById(canvasId) : canvasId;
    if (!this.canvas) return;

    if (!this._eventsBound) {
      this.bindCanvasEvents();
      this._eventsBound = true;
    }
    this.isEnabled = true;
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
  }

  // ==========================================
  // CANVAS INTERACTIVE EVENTS (MOUSE & TOUCH)
  // ==========================================
  bindCanvasEvents() {
    const canvas = this.canvas;

    const getCanvasPos = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const dpr = window.devicePixelRatio || 1;
      return {
        px: ((clientX - rect.left) * scaleX) / dpr,
        py: ((clientY - rect.top) * scaleY) / dpr
      };
    };

    // Hover & Move
    const onMove = (evt) => {
      if (!this.isEnabled) return;
      const { px, py } = getCanvasPos(evt);
      const hit = this.getActiveWorld().hitTest(px, py, canvas, 20);

      this.hoverTarget = hit;
      this.render();
    };

    // Click / Pointer Down
    const onDown = (evt) => {
      if (!this.isEnabled) return;
      const { px, py } = getCanvasPos(evt);
      this.isMouseDown = true;
      this.applyToolAt(px, py);
    };

    const onUp = () => {
      this.isMouseDown = false;
    };

    const onLeave = () => {
      this.isMouseDown = false;
      this.hoverTarget = null;
      if (this.isEnabled) this.render();
    };

    // Right click (contextmenu) quick erase
    canvas.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
      const { px, py } = getCanvasPos(evt);
      const world = this.getActiveWorld();
      const hit = world.hitTest(px, py, this.canvas, 20);
      if (hit.hasBeeper && hit.cell) {
        const cur = world.getBeeperCount(hit.cell.x, hit.cell.y);
        world.setBeeper(hit.cell.x, hit.cell.y, Math.max(0, cur - 1));
      } else if (hit.existingWall) {
        if (hit.existingWall.type === 'hwall') world.removeHWall(hit.existingWall.a, hit.existingWall.s);
        else if (hit.existingWall.type === 'vwall') world.removeVWall(hit.existingWall.a, hit.existingWall.s);
      }
      world.saveSnapshot();
      this.render();
      this.updateGvrwTextarea();
      this.updateHUDStats();
      if (this.onWorldChanged) this.onWorldChanged(world);
    });

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', onLeave);

    // Touch support for mobile phones
    canvas.addEventListener('touchstart', (e) => {
      if (e.cancelable) e.preventDefault();
      onDown(e);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (e.cancelable) e.preventDefault();
      onMove(e);
    }, { passive: false });

    canvas.addEventListener('touchend', onUp);
  }

  applyToolAt(px, py) {
    const world = this.getActiveWorld();
    const hit = world.hitTest(px, py, this.canvas, 20);

    if (this.activeTool === 'wall') {
      if (hit.wall) {
        if (hit.wall.type === 'hwall') {
          world.toggleHWall(hit.wall.a, hit.wall.s);
        } else if (hit.wall.type === 'vwall') {
          world.toggleVWall(hit.wall.a, hit.wall.s);
        }
      } else if (hit.cell) {
        const trans = world.getTransform(this.canvas);
        const cellCenter = trans.toCellCenter(hit.cell.x, hit.cell.y);
        const dx = px - cellCenter.px;
        const dy = py - cellCenter.py;
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) world.toggleVWall(hit.cell.x, hit.cell.y);
          else world.toggleVWall(hit.cell.x - 1, hit.cell.y);
        } else {
          if (dy > 0) world.toggleHWall(hit.cell.x, hit.cell.y - 1);
          else world.toggleHWall(hit.cell.x, hit.cell.y);
        }
      }
    } else if (this.activeTool === 'robot') {
      if (hit.cell) {
        world.setRobot(hit.cell.x, hit.cell.y, this.robotDir, this.robotBag);
      }
    } else if (this.activeTool === 'beeper') {
      if (hit.cell) {
        if (this.beeperDelta === 0) {
          // Direct Delete / Zero beeper
          world.setBeeper(hit.cell.x, hit.cell.y, 0);
        } else {
          const cur = world.getBeeperCount(hit.cell.x, hit.cell.y);
          const next = cur + this.beeperDelta;
          world.setBeeper(hit.cell.x, hit.cell.y, Math.max(0, next));
        }
      }
    } else if (this.activeTool === 'eraser') {
      if (this.eraserFilter === 'beeper') {
        if (hit.cell) world.setBeeper(hit.cell.x, hit.cell.y, 0);
      } else if (this.eraserFilter === 'wall') {
        if (hit.existingWall) {
          if (hit.existingWall.type === 'hwall') world.removeHWall(hit.existingWall.a, hit.existingWall.s);
          else if (hit.existingWall.type === 'vwall') world.removeVWall(hit.existingWall.a, hit.existingWall.s);
        }
      } else {
        // Smart Eraser (Auto):
        // 1. If cell has beeper:
        if (hit.hasBeeper) {
          if (hit.existingWall && hit.existingWall.dist < hit.cellCenterDist) {
            if (hit.existingWall.type === 'hwall') world.removeHWall(hit.existingWall.a, hit.existingWall.s);
            else if (hit.existingWall.type === 'vwall') world.removeVWall(hit.existingWall.a, hit.existingWall.s);
          } else {
            world.setBeeper(hit.cell.x, hit.cell.y, 0);
          }
        } else if (hit.existingWall) {
          if (hit.existingWall.type === 'hwall') world.removeHWall(hit.existingWall.a, hit.existingWall.s);
          else if (hit.existingWall.type === 'vwall') world.removeVWall(hit.existingWall.a, hit.existingWall.s);
        } else if (hit.cell) {
          // Fallback: clear beepers in cell
          world.setBeeper(hit.cell.x, hit.cell.y, 0);
        }
      }
    }

    world.saveSnapshot();
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
    if (this.onWorldChanged) {
      this.onWorldChanged(world);
    }
  }

  // Set active tool
  setTool(tool) {
    this.activeTool = tool;
    this.render();
  }

  // Switch between editing Initial State vs Target Goal State
  setLayer(layer) {
    this.activeLayer = layer; // 'initial' or 'goal'
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
  }

  // Set Grid Dimensions
  resizeGrid(cols, rows) {
    this.initialWorld.resize(cols, rows);
    this.goalWorld.resize(cols, rows);
    this.initialWorld.saveSnapshot();
    this.goalWorld.saveSnapshot();
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
  }

  // Render on builder canvas
  render() {
    if (!this.canvas) return;
    const world = this.getActiveWorld();
    world.render(this.canvas, {
      isTargetView: this.activeLayer === 'goal',
      activeTool: this.activeTool,
      hover: this.hoverTarget
    });
  }

  // Update .gvrw code editor box
  updateGvrwTextarea() {
    const textarea = document.getElementById('builderGvrwText');
    if (textarea && document.activeElement !== textarea) {
      textarea.value = this.getActiveWorld().toGvrw();
    }
  }

  // Apply code typed in .gvrw textarea to canvas
  loadFromGvrwText(text) {
    this.getActiveWorld().fromGvrw(text);
    this.render();
    this.updateHUDStats();
  }

  // Update HUD metrics in builder toolbar
  updateHUDStats() {
    const world = this.getActiveWorld();
    const statRobot = document.getElementById('builderStatRobot');
    const statBeepers = document.getElementById('builderStatBeepers');
    const statWalls = document.getElementById('builderStatWalls');
    const statSize = document.getElementById('builderStatSize');

    if (statRobot) statRobot.textContent = `(${world.robot.x}, ${world.robot.y}) ${world.robot.dir}`;
    if (statBeepers) {
      let totalB = 0;
      world.beepers.forEach(c => totalB += c);
      statBeepers.textContent = `${totalB} beeper`;
    }
    if (statWalls) {
      statWalls.textContent = `${world.hWalls.size + world.vWalls.size} tembok`;
    }
    if (statSize) {
      statSize.textContent = `${world.cols} × ${world.rows}`;
    }
  }

  // Quick preset loader
  loadPreset(presetType) {
    const world = this.getActiveWorld();
    world.clearAll();

    if (presetType === 'empty') {
      world.setRobot(1, 1, 'EAST', 0);
    } else if (presetType === 'four_towers') {
      world.resize(24, 14);
      world.setRobot(4, 4, 'EAST', 0);
      world.addHWall(4, 4);
      for (let a = 5; a <= 21; a++) world.addHWall(a, 4);
      // Tower 1 (Avenues 6..7, Street 9)
      world.addVWall(6, 4); world.addVWall(6, 5); world.addVWall(6, 6); world.addVWall(6, 7); world.addVWall(6, 8);
      world.addHWall(6, 9);
      world.addVWall(7, 8); world.addVWall(7, 7); world.addVWall(7, 6); world.addVWall(7, 5); world.addVWall(7, 4);
      world.setBeeper(7, 8, 3);
      // Tower 2
      world.setBeeper(9, 4, 1);
      world.addVWall(10, 4); world.addVWall(10, 5); world.addVWall(10, 6);
      world.addHWall(10, 7);
      world.addVWall(11, 6); world.addVWall(11, 5); world.addVWall(11, 4);
      world.setBeeper(11, 6, 2);
    } else if (presetType === 'zigzag') {
      world.resize(18, 12);
      world.setRobot(2, 2, 'EAST', 0);
      for (let s = 3; s <= 9; s += 2) {
        for (let a = 3; a <= 15; a++) world.addHWall(a, s);
      }
      world.setBeeper(15, 2, 2);
      world.setBeeper(3, 4, 3);
      world.setBeeper(15, 6, 2);
    } else if (presetType === 'spiral') {
      world.resize(15, 15);
      world.setRobot(1, 1, 'EAST', 0);
      for (let a = 2; a <= 14; a++) world.addHWall(a, 14);
      for (let s = 2; s <= 13; s++) world.addVWall(14, s);
      for (let a = 3; a <= 13; a++) world.addHWall(a, 2);
      for (let s = 3; s <= 12; s++) world.addVWall(2, s);
      world.setBeeper(8, 8, 5);
    }

    world.saveSnapshot();
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
  }

  // ==========================================
  // STORAGE & PRESETS
  // ==========================================
  loadCustomWorldsFromStorage() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  saveCustomWorld(title, description = '') {
    const id = 'custom_' + Date.now();
    const entry = {
      id,
      title: title || 'Peta Kustom ' + new Date().toLocaleDateString(),
      description,
      createdAt: new Date().toISOString(),
      initialGvrw: this.initialWorld.toGvrw(),
      goalGvrw: this.goalWorld.toGvrw(),
      cols: this.initialWorld.cols,
      rows: this.initialWorld.rows
    };

    this.customWorlds.unshift(entry);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customWorlds));
    } catch (e) {}

    return entry;
  }

  loadCustomWorldById(id) {
    const found = this.customWorlds.find(w => w.id === id);
    if (!found) return null;

    this.initialWorld.fromGvrw(found.initialGvrw);
    this.goalWorld.fromGvrw(found.goalGvrw);
    this.render();
    this.updateGvrwTextarea();
    this.updateHUDStats();
    return found;
  }

  deleteCustomWorld(id) {
    this.customWorlds = this.customWorlds.filter(w => w.id !== id);
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customWorlds));
    } catch (e) {}
  }
}

// Global instance
window.gvrWorldBuilder = new GvrWorldBuilder();

