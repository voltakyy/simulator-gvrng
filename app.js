/**
 * GvRng Studio Web IDE & World Builder Application
 * Coordinates Simulator, World Builder, Step Debugger, Virtual Helper Keyboard,
 * Validation Engine, and Interactive Quiz Modes.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Canvases & Viewport
  const liveCanvas = document.getElementById('worldCanvas');
  const targetCanvas = document.getElementById('targetCanvas');
  const canvasViewport = document.getElementById('canvasViewport');
  const targetCanvasWrapper = document.getElementById('targetCanvasWrapper');
  const puzzleSelect = document.getElementById('puzzleSelect');

  // View Mode Buttons
  const btnViewLive = document.getElementById('btnViewLive');
  const btnViewTarget = document.getElementById('btnViewTarget');
  const btnViewSplit = document.getElementById('btnViewSplit');
  const btnToggleTrail = document.getElementById('btnToggleTrail');

  // Execution Controls
  const btnRun = document.getElementById('btnRun');
  const btnStep = document.getElementById('btnStep');
  const btnReset = document.getElementById('btnReset');
  const btnValidate = document.getElementById('btnValidate');
  const btnLoadStarter = document.getElementById('btnLoadStarter');
  const btnLoadSolution = document.getElementById('btnLoadSolution');

  // Mission Info Elements
  const missionTitle = document.getElementById('missionTitle');
  const missionBadgePill = document.getElementById('missionBadgePill');
  const missionConstraint = document.getElementById('missionConstraint');
  const missionPrompt = document.getElementById('missionPrompt');
  const solutionCodeDisplay = document.getElementById('solutionCodeDisplay');
  const missionDockCarousel = document.getElementById('missionDockCarousel');

  // Stepper & Drawer
  const btnPrevMission = document.getElementById('btnPrevMission');
  const btnNextMission = document.getElementById('btnNextMission');
  const btnOpenDrawer = document.getElementById('btnOpenDrawer');
  const missionDrawerModal = document.getElementById('missionDrawerModal');
  const btnCloseMissionDrawer = document.getElementById('btnCloseMissionDrawer');
  const missionDrawerGrid = document.getElementById('missionDrawerGrid');

  // Editor & Line Gutter
  const editorGutter = document.getElementById('editorGutter');
  const editorTextarea = document.getElementById('editorTextarea');

  // Telemetry HUD Elements
  const telPos = document.getElementById('telPos');
  const telDir = document.getElementById('telDir');
  const telBag = document.getElementById('telBag');
  const telWorld = document.getElementById('telWorld');
  const telSteps = document.getElementById('telSteps');
  const telLines = document.getElementById('telLines');
  const telStatus = document.getElementById('telStatus');

  // Tracing Terminal & Toast
  const termBody = document.getElementById('termBody');
  const toastNotification = document.getElementById('toastNotification');

  // Celebration Modal
  const celebrationModal = document.getElementById('celebrationModal');
  const btnCloseCelebration = document.getElementById('btnCloseCelebration');
  const cstatSteps = document.getElementById('cstatSteps');
  const cstatLines = document.getElementById('cstatLines');
  const cstatBeepers = document.getElementById('cstatBeepers');
  const celebrateDesc = document.getElementById('celebrateDesc');

  // Simulator Runtime State
  const missions = window.GVR_MISSIONS || [];
  let currentMissionIndex = 0;
  let currentMission = missions[0];
  let world = new GvrWorld(15, 15);
  let targetWorld = new GvrWorld(15, 15);
  let interpreter = new GvrInterpreter(world);
  let isRunning = false;
  let playInterval = null;
  let currentSpeed = 180;
  let viewMode = 'live';

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  function showToast(msg, duration = 3000) {
    if (!toastNotification) return;
    toastNotification.textContent = msg;
    toastNotification.classList.add('show');
    clearTimeout(toastNotification._timer);
    toastNotification._timer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, duration);
  }

  // ==========================================
  // NAVIGATION MODE SWITCHER (4 MODES)
  // ==========================================
  const modePills = document.querySelectorAll('.nav-tab-btn');
  const tabViews = document.querySelectorAll('.main-tab-view');

  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetTab = pill.getAttribute('data-tab');
      switchMainTab(targetTab);
    });
  });

  function switchMainTab(tabId) {
    modePills.forEach(p => p.classList.toggle('active', p.getAttribute('data-tab') === tabId));
    tabViews.forEach(v => v.classList.toggle('active', v.id === tabId));

    if (tabId === 'tabBuilder') {
      if (window.gvrWorldBuilder) {
        window.gvrWorldBuilder.init('builderCanvas');
      }
    } else if (tabId === 'tabSimulator') {
      renderSimulatorCanvases();
    }
  }

  // ==========================================
  // MISSION LOADING & CAROUSEL
  // ==========================================
  function loadMission(missionId) {
    const foundIdx = missions.findIndex(m => m.id === missionId);
    if (foundIdx === -1) return;

    currentMissionIndex = foundIdx;
    currentMission = missions[foundIdx];

    // Reconstruct World
    world = new GvrWorld(currentMission.cols, currentMission.rows);
    if (currentMission.initialRobot) {
      world.setRobot(
        currentMission.initialRobot.x,
        currentMission.initialRobot.y,
        currentMission.initialRobot.dir,
        currentMission.initialRobot.beepers || 0
      );
    }
    if (currentMission.initialBeepers) {
      currentMission.initialBeepers.forEach(([x, y, count]) => {
        world.addBeeper(x, y, count);
      });
    }
    if (currentMission.hWalls) {
      currentMission.hWalls.forEach(([a, s]) => world.addHWall(a, s));
    }
    if (currentMission.vWalls) {
      currentMission.vWalls.forEach(([a, s]) => world.addVWall(a, s));
    }
    world.saveSnapshot();

    // Reconstruct Target World
    if (currentMission.targetWorldInstance) {
      targetWorld = currentMission.targetWorldInstance.clone();
    } else {
      targetWorld = new GvrWorld(currentMission.cols, currentMission.rows);
      if (currentMission.targetState && currentMission.targetState.finalRobot) {
        const fr = currentMission.targetState.finalRobot;
        targetWorld.setRobot(fr.x, fr.y, fr.dir, fr.beepers || 0);
        targetWorld.robot.isOff = true;
      }
      if (currentMission.targetBeepers) {
        currentMission.targetBeepers.forEach(([x, y, count]) => targetWorld.addBeeper(x, y, count));
      }
      if (currentMission.hWalls) currentMission.hWalls.forEach(([a, s]) => targetWorld.addHWall(a, s));
      if (currentMission.vWalls) currentMission.vWalls.forEach(([a, s]) => targetWorld.addVWall(a, s));
    }

    interpreter = new GvrInterpreter(world);

    // Update UI headers
    if (missionBadgePill) missionBadgePill.textContent = `Misi ${currentMission.number}`;
    if (missionTitle) missionTitle.textContent = currentMission.title;
    if (missionConstraint) missionConstraint.textContent = currentMission.badge || currentMission.category;
    if (missionPrompt) missionPrompt.textContent = currentMission.prompt;
    if (solutionCodeDisplay) solutionCodeDisplay.textContent = currentMission.solutionCode || '# Solusi belum dipublikasikan';
    if (puzzleSelect) puzzleSelect.value = currentMission.id;

    // Load starter code into editor
    if (editorTextarea) {
      editorTextarea.value = currentMission.starterCode || '';
      updateLineGutter();
    }

    // Reset controls
    stopRun();
    updateTelemetry('READY');
    renderSimulatorCanvases();
    updateCarouselActive();
  }

  function updateCarouselActive() {
    if (!missionDockCarousel) return;
    const cards = missionDockCarousel.querySelectorAll('.dock-mission-card');
    cards.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-id') === currentMission.id);
    });
  }

  function populateMissionCarousel() {
    if (!missionDockCarousel) return;
    missionDockCarousel.innerHTML = '';
    missions.forEach((m, idx) => {
      const chip = document.createElement('button');
      chip.className = 'dock-mission-card' + (idx === currentMissionIndex ? ' active' : '');
      chip.setAttribute('data-id', m.id);
      chip.textContent = `${m.number}: ${m.title.split('&')[0].trim()}`;
      chip.addEventListener('click', () => loadMission(m.id));
      missionDockCarousel.appendChild(chip);
    });

    // Populate dropdown
    if (puzzleSelect) {
      puzzleSelect.innerHTML = '';
      missions.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `Misi ${m.number}: ${m.title}`;
        puzzleSelect.appendChild(opt);
      });
      puzzleSelect.value = currentMission.id;
      puzzleSelect.addEventListener('change', (e) => loadMission(e.target.value));
    }

    // Populate modal drawer
    if (missionDrawerGrid) {
      missionDrawerGrid.innerHTML = '';
      missions.forEach(m => {
        const card = document.createElement('div');
        card.className = 'dock-mission-card';
        card.style.padding = '10px 12px';
        card.innerHTML = `
          <strong style="display:block; margin-bottom:2px;">Misi ${m.number}: ${m.title}</strong>
          <span style="font-size:11px; color:#64748b;">${m.source || m.category}</span>
        `;
        card.addEventListener('click', () => {
          loadMission(m.id);
          if (missionDrawerModal) missionDrawerModal.setAttribute('aria-hidden', 'true');
        });
        missionDrawerGrid.appendChild(card);
      });
    }
  }

  // Stepper buttons
  if (btnPrevMission) {
    btnPrevMission.addEventListener('click', () => {
      const nextIdx = (currentMissionIndex - 1 + missions.length) % missions.length;
      loadMission(missions[nextIdx].id);
    });
  }
  if (btnNextMission) {
    btnNextMission.addEventListener('click', () => {
      const nextIdx = (currentMissionIndex + 1) % missions.length;
      loadMission(missions[nextIdx].id);
    });
  }
  if (btnOpenDrawer) {
    btnOpenDrawer.addEventListener('click', () => {
      if (missionDrawerModal) missionDrawerModal.removeAttribute('aria-hidden');
    });
  }
  if (btnCloseMissionDrawer) {
    btnCloseMissionDrawer.addEventListener('click', () => {
      if (missionDrawerModal) missionDrawerModal.setAttribute('aria-hidden', 'true');
    });
  }

  // ==========================================
  // SIMULATOR RENDERING & VIEWS
  // ==========================================
  function renderSimulatorCanvases() {
    if (liveCanvas) world.render(liveCanvas);
    if (targetCanvas) targetWorld.render(targetCanvas, { isTargetView: true });
  }

  function setViewMode(mode) {
    viewMode = mode;
    [btnViewLive, btnViewTarget, btnViewSplit].forEach(b => {
      if (b) b.classList.remove('active');
    });

    if (mode === 'live') {
      if (btnViewLive) btnViewLive.classList.add('active');
      if (canvasViewport) {
        canvasViewport.classList.remove('mode-split');
        canvasViewport.querySelector('.canvas-box-live').style.display = 'flex';
      }
      if (targetCanvasWrapper) targetCanvasWrapper.style.display = 'none';
    } else if (mode === 'target') {
      if (btnViewTarget) btnViewTarget.classList.add('active');
      if (canvasViewport) {
        canvasViewport.classList.remove('mode-split');
        canvasViewport.querySelector('.canvas-box-live').style.display = 'none';
      }
      if (targetCanvasWrapper) targetCanvasWrapper.style.display = 'flex';
    } else if (mode === 'split') {
      if (btnViewSplit) btnViewSplit.classList.add('active');
      if (canvasViewport) {
        canvasViewport.classList.add('mode-split');
        canvasViewport.querySelector('.canvas-box-live').style.display = 'flex';
      }
      if (targetCanvasWrapper) targetCanvasWrapper.style.display = 'flex';
    }
    renderSimulatorCanvases();
  }

  if (btnViewLive) btnViewLive.addEventListener('click', () => setViewMode('live'));
  if (btnViewTarget) btnViewTarget.addEventListener('click', () => setViewMode('target'));
  if (btnViewSplit) btnViewSplit.addEventListener('click', () => setViewMode('split'));

  // ==========================================
  // TELEMETRY & LINE GUTTER
  // ==========================================
  function updateTelemetry(status = 'READY') {
    if (telPos) telPos.textContent = `(${world.robot.x}, ${world.robot.y})`;
    if (telDir) telDir.textContent = world.robot.dir;
    if (telBag) telBag.textContent = world.robot.beepers.toString();
    if (telSteps) telSteps.textContent = world.robot.stepCount.toString();
    if (telStatus) {
      telStatus.textContent = status;
      telStatus.className = 'hud-item-val ' + (status === 'RUNNING' ? 'text-blue' : status === 'FINISHED' ? 'text-emerald' : status === 'CRASHED' ? 'text-rose' : '');
    }

    // Count world beepers
    if (telWorld) {
      let bCount = 0;
      world.beepers.forEach(c => bCount += c);
      telWorld.textContent = bCount.toString();
    }
  }

  function updateLineGutter(activeLineNo = null) {
    if (!editorTextarea || !editorGutter) return;
    const lines = editorTextarea.value.split('\n');
    const count = lines.length;

    let gutterHtml = '';
    for (let i = 1; i <= count; i++) {
      const isActive = i === activeLineNo ? ' active-line' : '';
      gutterHtml += `<div class="${isActive}">${i}</div>`;
    }
    editorGutter.innerHTML = gutterHtml;

    if (telLines) telLines.textContent = count.toString();
  }

  if (editorTextarea) {
    editorTextarea.addEventListener('input', () => updateLineGutter());
    editorTextarea.addEventListener('scroll', () => {
      if (editorGutter) editorGutter.scrollTop = editorTextarea.scrollTop;
    });

    // Handle Tab key
    editorTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = editorTextarea.selectionStart;
        const end = editorTextarea.selectionEnd;
        editorTextarea.value = editorTextarea.value.substring(0, start) + '    ' + editorTextarea.value.substring(end);
        editorTextarea.selectionStart = editorTextarea.selectionEnd = start + 4;
        updateLineGutter();
      }
    });
  }

  // ==========================================
  // VIRTUAL GVRNG KEYBOARD FOR MOBILE PHONES
  // ==========================================
  const vkeyBtns = document.querySelectorAll('.vkey-btn');
  vkeyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!editorTextarea) return;
      const insertStr = btn.getAttribute('data-insert').replace(/\\n/g, '\n');
      const start = editorTextarea.selectionStart;
      const end = editorTextarea.selectionEnd;
      const val = editorTextarea.value;

      editorTextarea.value = val.substring(0, start) + insertStr + val.substring(end);
      editorTextarea.selectionStart = editorTextarea.selectionEnd = start + insertStr.length;
      editorTextarea.focus();
      updateLineGutter();
    });
  });

  // Starter & Solution Loaders
  if (btnLoadStarter) {
    btnLoadStarter.addEventListener('click', () => {
      if (editorTextarea && currentMission) {
        editorTextarea.value = currentMission.starterCode || '';
        updateLineGutter();
        showToast('↺ Kode starter awal dimuat.');
      }
    });
  }
  if (btnLoadSolution) {
    btnLoadSolution.addEventListener('click', () => {
      if (editorTextarea && currentMission && currentMission.solutionCode) {
        editorTextarea.value = currentMission.solutionCode;
        updateLineGutter();
        showToast('💡 Kunci contekan resmi dimuat ke editor.');
      }
    });
  }

  // Subtabs switcher
  const subtabBtns = document.querySelectorAll('.subtab-btn');
  const subtabPanels = document.querySelectorAll('.subtab-panel');
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab');
      subtabBtns.forEach(b => b.classList.toggle('active', b === btn));
      subtabPanels.forEach(p => p.classList.toggle('active', p.id === target));
    });
  });

  // Speed selection
  const speedBtns = document.querySelectorAll('.speed-btn');
  speedBtns.forEach(b => {
    b.addEventListener('click', () => {
      speedBtns.forEach(btn => btn.classList.remove('active'));
      b.classList.add('active');
      currentSpeed = parseInt(b.getAttribute('data-speed'), 10);
      if (isRunning) {
        clearInterval(playInterval);
        playInterval = setInterval(runStep, currentSpeed);
      }
    });
  });

  // ==========================================
  // EXECUTION CONTROLS (RUN, STEP, RESET)
  // ==========================================
  function logTerminal(msg, type = 'normal') {
    if (!termBody) return;
    const line = document.createElement('div');
    line.className = 'terminal-line log-' + type;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function resetSimulator() {
    stopRun();
    world.restoreSnapshot();
    interpreter = new GvrInterpreter(world);
    updateTelemetry('READY');
    updateLineGutter();
    renderSimulatorCanvases();
    logTerminal('Simulator di-reset ke kondisi awal.', 'system');
  }

  function stopRun() {
    isRunning = false;
    clearInterval(playInterval);
    if (btnRun) {
      btnRun.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><span>Run</span>`;
    }
  }

  function runStep() {
    if (!interpreter.stack.length || interpreter.isFinished) {
      // Finished
      stopRun();
      updateTelemetry('FINISHED');
      updateLineGutter();
      renderSimulatorCanvases();
      logTerminal('Program selesai dieksekusi.', 'success');
      return false;
    }

    try {
      const activeLineNo = interpreter.step();
      updateLineGutter(activeLineNo);
      updateTelemetry('RUNNING');
      renderSimulatorCanvases();
      return true;
    } catch (err) {
      stopRun();
      updateTelemetry('CRASHED');
      logTerminal(err.message, 'error');
      showToast('❌ ' + err.message, 4000);
      return false;
    }
  }

  function startRun() {
    if (isRunning) {
      stopRun();
      updateTelemetry('PAUSED');
      return;
    }

    if (interpreter.isFinished || !interpreter.stack.length) {
      // Re-parse code from editor
      const code = editorTextarea ? editorTextarea.value : '';
      if (!code.trim()) {
        showToast('⚠️ Editor kosong! Tuliskan kode program GvRng terlebih dahulu.');
        return;
      }
      try {
        interpreter.loadSource(code);
      } catch (err) {
        showToast('❌ ' + err.message, 4000);
        logTerminal(err.message, 'error');
        return;
      }
    }

    isRunning = true;
    if (btnRun) {
      btnRun.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg><span>Pause</span>`;
    }
    updateTelemetry('RUNNING');
    playInterval = setInterval(runStep, currentSpeed);
  }

  if (btnRun) btnRun.addEventListener('click', startRun);
  if (btnStep) {
    btnStep.addEventListener('click', () => {
      if (isRunning) stopRun();
      if (interpreter.isFinished || !interpreter.stack.length) {
        const code = editorTextarea ? editorTextarea.value : '';
        try {
          interpreter.loadSource(code);
        } catch (err) {
          showToast('❌ ' + err.message);
          return;
        }
      }
      runStep();
    });
  }
  if (btnReset) btnReset.addEventListener('click', resetSimulator);

  // ==========================================
  // MISSION VALIDATION ENGINE ("CEK MISI")
  // ==========================================
  function validateMissionSolution() {
    const diffs = world.diffState(targetWorld);

    if (diffs.length === 0) {
      // SUCCESS!
      showCelebrationModal();
    } else {
      // Show first issue
      showToast('⚠️ Belum selesai: ' + diffs[0], 5000);
      logTerminal('Validasi gagal: ' + diffs.join('; '), 'error');
    }
  }

  function showCelebrationModal() {
    if (!celebrationModal) return;
    if (cstatSteps) cstatSteps.textContent = world.robot.stepCount.toString();
    if (cstatLines) {
      const lines = editorTextarea ? editorTextarea.value.trim().split('\n').filter(l => l.trim() && !l.trim().startsWith('#')).length : 0;
      cstatLines.textContent = lines.toString();
    }
    if (cstatBeepers) cstatBeepers.textContent = world.robot.beepers.toString();
    if (celebrateDesc) {
      celebrateDesc.textContent = `Luar biasa! Kode programmu berhasil menyelesaikan ${currentMission.title} dengan sukses tanpa menabrak tembok.`;
    }

    celebrationModal.style.display = 'flex';
    celebrationModal.removeAttribute('aria-hidden');
  }

  if (btnValidate) btnValidate.addEventListener('click', validateMissionSolution);
  if (btnCloseCelebration) {
    btnCloseCelebration.addEventListener('click', () => {
      if (celebrationModal) {
        celebrationModal.style.display = 'none';
        celebrationModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ==========================================
  // WORLD BUILDER STUDIO INTEGRATION
  // ==========================================
  const wb = window.gvrWorldBuilder;

  // Layer buttons
  const btnBuilderLayerInitial = document.getElementById('btnBuilderLayerInitial');
  const btnBuilderLayerGoal = document.getElementById('btnBuilderLayerGoal');
  if (btnBuilderLayerInitial) {
    btnBuilderLayerInitial.addEventListener('click', () => {
      btnBuilderLayerInitial.classList.add('active');
      if (btnBuilderLayerGoal) btnBuilderLayerGoal.classList.remove('active');
      wb.setLayer('initial');
    });
  }
  if (btnBuilderLayerGoal) {
    btnBuilderLayerGoal.addEventListener('click', () => {
      btnBuilderLayerGoal.classList.add('active');
      if (btnBuilderLayerInitial) btnBuilderLayerInitial.classList.remove('active');
      wb.setLayer('goal');
    });
  }

  // Tools buttons
  const toolBtns = document.querySelectorAll('.builder-tool-btn');
  const robotToolOptions = document.getElementById('robotToolOptions');
  const beeperToolOptions = document.getElementById('beeperToolOptions');

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      toolBtns.forEach(b => b.classList.toggle('active', b === btn));
      wb.setTool(tool);

      if (robotToolOptions) robotToolOptions.style.display = tool === 'robot' ? 'flex' : 'none';
      if (beeperToolOptions) beeperToolOptions.style.display = tool === 'beeper' ? 'flex' : 'none';
    });
  });

  // Robot direction options
  const btnOptDirs = document.querySelectorAll('.btn-opt-dir');
  btnOptDirs.forEach(btn => {
    btn.addEventListener('click', () => {
      btnOptDirs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      wb.robotDir = btn.getAttribute('data-dir');
    });
  });

  const inputRobotBag = document.getElementById('inputRobotBag');
  if (inputRobotBag) {
    inputRobotBag.addEventListener('input', (e) => {
      wb.robotBag = parseInt(e.target.value, 10) || 0;
    });
  }

  // Beeper delta
  const btnBeeperPlus = document.getElementById('btnBeeperPlus');
  const btnBeeperMinus = document.getElementById('btnBeeperMinus');
  if (btnBeeperPlus) {
    btnBeeperPlus.addEventListener('click', () => {
      btnBeeperPlus.classList.add('active');
      if (btnBeeperMinus) btnBeeperMinus.classList.remove('active');
      wb.beeperDelta = 1;
    });
  }
  if (btnBeeperMinus) {
    btnBeeperMinus.addEventListener('click', () => {
      btnBeeperMinus.classList.add('active');
      if (btnBeeperPlus) btnBeeperPlus.classList.remove('active');
      wb.beeperDelta = -1;
    });
  }

  // Grid resizing
  const btnApplyResize = document.getElementById('btnApplyResize');
  const builderCols = document.getElementById('builderCols');
  const builderRows = document.getElementById('builderRows');
  if (btnApplyResize) {
    btnApplyResize.addEventListener('click', () => {
      const c = parseInt(builderCols.value, 10) || 15;
      const r = parseInt(builderRows.value, 10) || 15;
      wb.resizeGrid(c, r);
      showToast(`Ukuran kisi diubah ke ${c} × ${r}`);
    });
  }

  // Presets & Clear
  const btnLoadPreset = document.getElementById('btnLoadPreset');
  const presetSelect = document.getElementById('presetSelect');
  if (btnLoadPreset && presetSelect) {
    btnLoadPreset.addEventListener('click', () => {
      wb.loadPreset(presetSelect.value);
      showToast('Preset dimuat!');
    });
  }

  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('Yakin ingin membersihkan semua tembok dan beeper pada peta ini?')) {
        wb.getActiveWorld().clearAll();
        wb.render();
        wb.updateGvrwTextarea();
        wb.updateHUDStats();
        showToast('Peta dibersihkan.');
      }
    });
  }

  // Save Custom World
  const btnSaveCustomWorld = document.getElementById('btnSaveCustomWorld');
  const customWorldTitle = document.getElementById('customWorldTitle');
  if (btnSaveCustomWorld) {
    btnSaveCustomWorld.addEventListener('click', () => {
      const title = customWorldTitle ? customWorldTitle.value.trim() : '';
      const saved = wb.saveCustomWorld(title);
      showToast(`💾 Peta "${saved.title}" berhasil disimpan di browser!`);
    });
  }

  // .gvrw Code buttons
  const btnCopyGvrw = document.getElementById('btnCopyGvrw');
  const btnDownloadGvrw = document.getElementById('btnDownloadGvrw');
  const btnLoadFromGvrw = document.getElementById('btnLoadFromGvrw');
  const builderGvrwText = document.getElementById('builderGvrwText');

  if (btnCopyGvrw && builderGvrwText) {
    btnCopyGvrw.addEventListener('click', () => {
      navigator.clipboard.writeText(builderGvrwText.value);
      showToast('📋 Kode .gvrw disalin ke clipboard!');
    });
  }

  if (btnDownloadGvrw && builderGvrwText) {
    btnDownloadGvrw.addEventListener('click', () => {
      const blob = new Blob([builderGvrwText.value], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'peta-kustom.gvrw';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnLoadFromGvrw && builderGvrwText) {
    btnLoadFromGvrw.addEventListener('click', () => {
      wb.loadFromGvrwText(builderGvrwText.value);
      showToast('Teks .gvrw diterapkan ke kanvas!');
    });
  }

  // Launch into Simulator Button (The core integration!)
  const btnTestInSimulator = document.getElementById('btnTestInSimulator');
  if (btnTestInSimulator) {
    btnTestInSimulator.addEventListener('click', () => {
      const title = customWorldTitle && customWorldTitle.value.trim() ? customWorldTitle.value.trim() : 'Peta Kustom Mandiri';
      
      // Register into GVR_MISSIONS
      if (window.registerCustomMission) {
        const customEntry = window.registerCustomMission({
          title,
          description: `Peta teka-teki kustom berukuran ${wb.initialWorld.cols}×${wb.initialWorld.rows}. Selesaikan target misi!`,
          initialWorld: wb.initialWorld,
          goalWorld: wb.goalWorld
        });

        populateMissionCarousel();
        loadMission(customEntry.id);
        switchMainTab('tabSimulator');
        showToast('🚀 Peta kustom berhasil dimuat ke Simulator! Tuliskan kodenya sekarang.', 4000);
      }
    });
  }

  // ==========================================
  // INITIALIZATION
  // ==========================================
  window.loadMapAndSolution = loadMission;
  populateMissionCarousel();
  loadMission(missions[0].id);
  setViewMode('live');
});
