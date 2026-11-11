/**
 * GvRng Studio Web IDE & Unified World Builder Application (v3.0)
 * Integrates Arena Simulator, Interactive World Builder, Step Debugger,
 * Virtual Helper Keyboard, Validation Engine, and Authentic .GVRW Code Sync
 * on a SINGLE SEAMLESS PAGE.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Canvases & Viewport
  const liveCanvas = document.getElementById('worldCanvas');
  const targetCanvas = document.getElementById('targetCanvas');
  const canvasViewport = document.getElementById('canvasViewport');
  const targetCanvasWrapper = document.getElementById('targetCanvasWrapper');
  const puzzleSelect = document.getElementById('puzzleSelect');
  const liveCanvasIndicator = document.getElementById('liveCanvasIndicator');

  // Unified Mode Switcher (Simulasi vs Desain Peta)
  const btnModeSimulate = document.getElementById('btnModeSimulate');
  const btnModeBuild = document.getElementById('btnModeBuild');
  const simViewToolbar = document.getElementById('simViewToolbar');
  const builderInlineToolbar = document.getElementById('builderInlineToolbar');

  // View Mode Buttons (Simulasi)
  const btnViewLive = document.getElementById('btnViewLive');
  const btnViewTarget = document.getElementById('btnViewTarget');
  const btnViewSplit = document.getElementById('btnViewSplit');

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

  // Builder Engine Instance
  const wb = window.gvrWorldBuilder || new GvrWorldBuilder();
  window.gvrWorldBuilder = wb;

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
  let viewMode = 'live'; // 'live', 'target', 'split'
  let studioMode = 'simulate'; // 'simulate' or 'build'

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
  // TOP NAVIGATION SWITCHER (STUDIO vs BANK SOAL)
  // ==========================================
  const modePills = document.querySelectorAll('.nav-tab-btn');
  const tabViews = document.querySelectorAll('.main-tab-view');

  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetTab = pill.getAttribute('data-tab');
      modePills.forEach(p => p.classList.toggle('active', p === pill));
      tabViews.forEach(v => v.classList.toggle('active', v.id === targetTab));

      if (targetTab === 'tabSimulator') {
        renderSimulatorCanvases();
      }
    });
  });

  // ==========================================
  // MATERI TO SIMULATOR DEEP LINK HANDLER
  // ==========================================
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-materi-load');
    if (!btn) return;
    const mId = btn.getAttribute('data-mission-id');
    const mission = (window.GVR_MISSIONS || []).find(m => m.id === mId || m.number === parseInt(mId, 10));
    if (mission) {
      const simTabBtn = document.querySelector('.nav-tab-btn[data-tab="tabSimulator"]');
      if (simTabBtn) simTabBtn.click();
      if (typeof loadMission === 'function') {
        loadMission(mission);
      }
      if (editorTextarea) {
        editorTextarea.value = mission.solutionCode;
        updateLineGutter();
      }
      if (typeof showToast === 'function') {
        showToast(`Misi ${mission.number}: ${mission.title} siap diuji!`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ==========================================
  // UNIFIED STUDIO SUBMODE SWITCHER
  // (Uji Kode vs Desain Peta pada SATU Halaman)
  // ==========================================
  function setStudioSubmode(mode) {
    studioMode = mode;
    if (mode === 'simulate') {
      if (btnModeSimulate) btnModeSimulate.classList.add('active');
      if (btnModeBuild) btnModeBuild.classList.remove('active');
      if (builderInlineToolbar) builderInlineToolbar.style.display = 'none';
      if (simViewToolbar) simViewToolbar.style.display = 'flex';
      if (liveCanvasIndicator) liveCanvasIndicator.textContent = 'KONDISI SAAT INI / LIVE';
      wb.isEnabled = false;
      renderSimulatorCanvases();
    } else {
      if (btnModeBuild) btnModeBuild.classList.add('active');
      if (btnModeSimulate) btnModeSimulate.classList.remove('active');
      if (builderInlineToolbar) builderInlineToolbar.style.display = 'flex';
      if (simViewToolbar) simViewToolbar.style.display = 'none';
      if (liveCanvasIndicator) liveCanvasIndicator.textContent = 'MODE DESAIN PETA (Klik Kanvas untuk Pasang/Hapus)';

      // Switch viewport to live canvas for builder
      setViewMode('live');

      // Initialize builder on live canvas
      wb.init(liveCanvas);
      wb.syncFromWorlds(world, targetWorld);
      wb.isEnabled = true;
      wb.onWorldChanged = (updatedWorld) => {
        if (wb.activeLayer === 'initial') {
          world = updatedWorld;
          world.saveSnapshot();
          interpreter = new GvrInterpreter(world);
        } else {
          targetWorld = updatedWorld;
        }
        updateTelemetry('EDITED');
        updateGvrwPanel();
      };
      wb.render();
      updateGvrwPanel();
    }
  }

  if (btnModeSimulate) {
    btnModeSimulate.addEventListener('click', () => setStudioSubmode('simulate'));
  }
  if (btnModeBuild) {
    btnModeBuild.addEventListener('click', () => setStudioSubmode('build'));
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

    // Sync builder instance
    wb.syncFromWorlds(world, targetWorld);

    // Update UI headers
    if (missionBadgePill) missionBadgePill.textContent = `Misi ${currentMission.number}`;
    if (missionTitle) missionTitle.textContent = currentMission.title;
    if (missionConstraint) missionConstraint.textContent = currentMission.badge || currentMission.category;
    if (missionPrompt) missionPrompt.textContent = currentMission.prompt;
    if (solutionCodeDisplay) solutionCodeDisplay.textContent = currentMission.solutionCode || '# Solusi belum dipublikasikan';
    const logicExplanationDisplay = document.getElementById('logicExplanationDisplay');
    if (logicExplanationDisplay) {
      logicExplanationDisplay.textContent = currentMission.logicExplanation || 'Ikuti syarat & batasan baris untuk menyelesaikan misi.';
    }

    const altSchemasContainer = document.getElementById('altSchemasList');
    if (altSchemasContainer) {
      altSchemasContainer.innerHTML = '';
      if (currentMission.alternativeSolutions && currentMission.alternativeSolutions.length > 0) {
        currentMission.alternativeSolutions.forEach((alt, idx) => {
          const card = document.createElement('div');
          card.style.cssText = 'background:rgba(255,255,255,0.7); border:1px solid rgba(0,0,0,0.08); border-radius:8px; padding:10px;';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; gap:8px;">
              <strong style="color:var(--ios-blue); font-size:12px;">${alt.name}</strong>
              <button class="btn-micro-pill btn-pill-amber btn-apply-schema" data-idx="${idx}">⚡ Pakai Skema</button>
            </div>
            <p style="font-size:11px; color:var(--color-text-subtle); margin-bottom:6px;">${alt.desc}</p>
            <pre class="code-preview-block" style="margin:0; font-size:11px;"><code style="font-size:11px;">${alt.code}</code></pre>
          `;
          const btn = card.querySelector('.btn-apply-schema');
          btn.addEventListener('click', () => {
            if (editorTextarea) {
              editorTextarea.value = alt.code;
              updateLineGutter();
              showToast(`⚡ ${alt.name} dimuat ke editor!`);
            }
          });
          altSchemasContainer.appendChild(card);
        });
      } else {
        altSchemasContainer.innerHTML = '<p style="font-size:11px; color:var(--color-text-subtle);">Solusi di atas merupakan skema tunggal paling optimal & terverifikasi resmi.</p>';
      }
    }
    if (puzzleSelect) puzzleSelect.value = currentMission.id;

    // Load starter code into editor
    if (editorTextarea) {
      editorTextarea.value = currentMission.starterCode || '';
      updateLineGutter();
    }

    // Reset controls
    stopRun();
    updateTelemetry('READY');
    updateGvrwPanel(true);
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

  // Modal drawer open/close
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
  // VIEWPORT LAYOUT & CANVAS RENDERING
  // ==========================================
  function setViewMode(mode) {
    viewMode = mode;
    if (btnViewLive) btnViewLive.classList.toggle('active', mode === 'live');
    if (btnViewTarget) btnViewTarget.classList.toggle('active', mode === 'target');
    if (btnViewSplit) btnViewSplit.classList.toggle('active', mode === 'split');

    if (canvasViewport) {
      canvasViewport.className = 'canvases-viewport mode-' + mode;
    }

    if (targetCanvasWrapper) {
      targetCanvasWrapper.style.display = (mode === 'target' || mode === 'split') ? 'flex' : 'none';
    }

    renderSimulatorCanvases();
  }

  if (btnViewLive) btnViewLive.addEventListener('click', () => setViewMode('live'));
  if (btnViewTarget) btnViewTarget.addEventListener('click', () => setViewMode('target'));
  if (btnViewSplit) btnViewSplit.addEventListener('click', () => setViewMode('split'));

  function renderSimulatorCanvases() {
    if (studioMode === 'build') {
      wb.render();
      return;
    }

    if (viewMode === 'live' || viewMode === 'split') {
      if (liveCanvas) {
        world.render(liveCanvas, { isTargetView: false });
      }
    }
    if (viewMode === 'target' || viewMode === 'split') {
      if (targetCanvas) {
        targetWorld.render(targetCanvas, { isTargetView: true });
      }
    }
  }

  // ==========================================
  // TELEMETRY HUD & GVRW UPDATE
  // ==========================================
  function updateTelemetry(status = 'READY') {
    if (telPos) telPos.textContent = `(${world.robot.x}, ${world.robot.y})`;
    if (telDir) telDir.textContent = world.robot.dir;
    if (telBag) telBag.textContent = world.robot.beepers.toString();
    
    if (telWorld) {
      let totalB = 0;
      world.beepers.forEach(c => totalB += c);
      telWorld.textContent = `${totalB} beeper`;
    }

    if (telSteps) telSteps.textContent = world.robot.stepCount.toString();
    if (telStatus) {
      telStatus.textContent = status;
      telStatus.className = 'hud-item-val ' + (
        status === 'RUNNING' ? 'text-amber' :
        status === 'FINISHED' ? 'text-emerald' :
        status === 'CRASHED' ? 'text-rose' : 'text-emerald'
      );
    }
  }

  function updateGvrwPanel(force = false) {
    const textarea = document.getElementById('builderGvrwText');
    if (textarea && (force || !textarea.value.trim())) {
      textarea.value = world.toGvrw();
    }
  }

  // ==========================================
  // EDITOR LINE GUTTER & SYNTAX
  // ==========================================
  function updateLineGutter(activeLineNum = null) {
    if (!editorTextarea || !editorGutter) return;
    const lines = editorTextarea.value.split('\n');
    const count = lines.length;

    let html = '';
    for (let i = 1; i <= count; i++) {
      const isActive = i === activeLineNum;
      html += `<div class="gutter-num${isActive ? ' active-line' : ''}">${i}</div>`;
    }
    editorGutter.innerHTML = html;

    if (telLines) {
      const codeLines = lines.filter(l => l.trim() && !l.trim().startsWith('#')).length;
      telLines.textContent = codeLines.toString();
    }
  }

  if (editorTextarea) {
    editorTextarea.addEventListener('input', () => updateLineGutter());
    editorTextarea.addEventListener('scroll', () => {
      if (editorGutter) editorGutter.scrollTop = editorTextarea.scrollTop;
    });

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

  const btnCopySolution = document.getElementById('btnCopySolution');
  if (btnCopySolution) {
    btnCopySolution.addEventListener('click', () => {
      if (currentMission && currentMission.solutionCode) {
        navigator.clipboard.writeText(currentMission.solutionCode).then(() => {
          showToast('📋 Kunci jawaban berhasil disalin!');
        }).catch(() => {
          showToast('📋 Kunci jawaban siap digunakan.');
        });
      }
    });
  }

  // Subtabs switcher in editor pane
  const subtabBtns = document.querySelectorAll('.subtab-btn');
  const subtabPanels = document.querySelectorAll('.subtab-panel');
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-subtab');
      subtabBtns.forEach(b => b.classList.toggle('active', b === btn));
      subtabPanels.forEach(p => p.classList.toggle('active', p.id === target));
      if (target === 'paneGvrw') {
        updateGvrwPanel();
      }
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

  // Auto-apply .gvrw textarea content if it differs from current world snapshot.
  // This prevents the common mistake of pasting a custom map into the textarea
  // but forgetting to click "Terapkan Teks" before running.
  function applyGvrwIfChanged() {
    if (!builderGvrwText) return;
    const gvrwText = builderGvrwText.value.trim();
    if (!gvrwText) return;
    // Compare textarea with current world serialization to detect user edits
    const currentGvrw = world.toGvrw().trim();
    if (gvrwText !== currentGvrw) {
      try {
        world.fromGvrw(gvrwText);
        world.saveSnapshot();
        wb.syncFromWorlds(world, targetWorld);
        interpreter = new GvrInterpreter(world);
        logTerminal(`Peta .gvrw dari textarea diterapkan otomatis: Grid ${world.cols}×${world.rows}, ${world.hWalls.size + world.vWalls.size} tembok.`, 'system');
      } catch (e) {
        // If gvrw is malformed, silently ignore and use current world
      }
    }
  }

  function startRun() {
    // If currently in builder mode, switch back to simulation view seamlessly
    if (studioMode === 'build') {
      setStudioSubmode('simulate');
    }

    if (isRunning) {
      stopRun();
      updateTelemetry('PAUSED');
      return;
    }

    if (interpreter.isFinished || !interpreter.stack.length) {
      // Auto-apply gvrw textarea if user edited it without clicking "Terapkan Teks"
      applyGvrwIfChanged();
      world.restoreSnapshot();
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
      renderSimulatorCanvases();
      updateTelemetry('READY');
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
      if (studioMode === 'build') setStudioSubmode('simulate');
      if (isRunning) stopRun();
      if (interpreter.isFinished || !interpreter.stack.length) {
        // Auto-apply gvrw textarea if user edited it without clicking "Terapkan Teks"
        applyGvrwIfChanged();
        world.restoreSnapshot();
        const code = editorTextarea ? editorTextarea.value : '';
        if (!code.trim()) {
          showToast('⚠️ Editor kosong! Tuliskan kode program GvRng terlebih dahulu.');
          return;
        }
        try {
          interpreter.loadSource(code);
        } catch (err) {
          showToast('❌ ' + err.message);
          return;
        }
        renderSimulatorCanvases();
        updateTelemetry('READY');
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
      showCelebrationModal();
    } else {
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
  // INLINE WORLD BUILDER CONTROLS
  // ==========================================
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
  const eraserToolOptions = document.getElementById('eraserToolOptions');

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.getAttribute('data-tool');
      toolBtns.forEach(b => b.classList.toggle('active', b === btn));
      wb.setTool(tool);

      if (robotToolOptions) robotToolOptions.style.display = tool === 'robot' ? 'flex' : 'none';
      if (beeperToolOptions) beeperToolOptions.style.display = tool === 'beeper' ? 'flex' : 'none';
      if (eraserToolOptions) eraserToolOptions.style.display = tool === 'eraser' ? 'flex' : 'none';
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

  // Beeper options (+1, -1, 0 Hapus)
  const btnBeeperPlus = document.getElementById('btnBeeperPlus');
  const btnBeeperMinus = document.getElementById('btnBeeperMinus');
  const btnBeeperZero = document.getElementById('btnBeeperZero');

  function updateBeeperPills(activeBtn, delta) {
    [btnBeeperPlus, btnBeeperMinus, btnBeeperZero].forEach(b => {
      if (b) b.classList.toggle('active', b === activeBtn);
    });
    wb.beeperDelta = delta;
  }

  if (btnBeeperPlus) {
    btnBeeperPlus.addEventListener('click', () => updateBeeperPills(btnBeeperPlus, 1));
  }
  if (btnBeeperMinus) {
    btnBeeperMinus.addEventListener('click', () => updateBeeperPills(btnBeeperMinus, -1));
  }
  if (btnBeeperZero) {
    btnBeeperZero.addEventListener('click', () => updateBeeperPills(btnBeeperZero, 0));
  }

  // Eraser options (all, beeper, wall)
  const btnEraserAll = document.getElementById('btnEraserAll');
  const btnEraserBeeper = document.getElementById('btnEraserBeeper');
  const btnEraserWall = document.getElementById('btnEraserWall');

  function updateEraserPills(activeBtn, filter) {
    [btnEraserAll, btnEraserBeeper, btnEraserWall].forEach(b => {
      if (b) b.classList.toggle('active', b === activeBtn);
    });
    wb.eraserFilter = filter;
  }

  if (btnEraserAll) {
    btnEraserAll.addEventListener('click', () => updateEraserPills(btnEraserAll, 'all'));
  }
  if (btnEraserBeeper) {
    btnEraserBeeper.addEventListener('click', () => updateEraserPills(btnEraserBeeper, 'beeper'));
  }
  if (btnEraserWall) {
    btnEraserWall.addEventListener('click', () => updateEraserPills(btnEraserWall, 'wall'));
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
      world = wb.initialWorld;
      targetWorld = wb.goalWorld;
      interpreter = new GvrInterpreter(world);
      showToast(`Ukuran kisi diubah ke ${c} × ${r}`);
    });
  }

  // Presets & Clear
  const btnLoadPreset = document.getElementById('btnLoadPreset');
  const presetSelect = document.getElementById('presetSelect');
  if (btnLoadPreset && presetSelect) {
    btnLoadPreset.addEventListener('click', () => {
      wb.loadPreset(presetSelect.value);
      world = wb.initialWorld;
      targetWorld = wb.goalWorld;
      interpreter = new GvrInterpreter(world);
      showToast('Preset dimuat!');
    });
  }

  const btnClearAll = document.getElementById('btnClearAll');
  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (confirm('Yakin ingin membersihkan semua tembok dan beeper pada peta ini?')) {
        wb.getActiveWorld().clearAll();
        wb.render();
        updateGvrwPanel();
        updateTelemetry('CLEARED');
        showToast('Peta dibersihkan.');
      }
    });
  }

  // .gvrw Code buttons (Authentic format without 'size')
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
      a.download = 'peta-gvrng.gvrw';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnLoadFromGvrw && builderGvrwText) {
    btnLoadFromGvrw.addEventListener('click', () => {
      const gvrwText = builderGvrwText.value.trim();
      if (!gvrwText) {
        showToast('⚠️ Teks .gvrw kosong!');
        return;
      }
      stopRun();
      world.fromGvrw(gvrwText);
      world.saveSnapshot();
      wb.syncFromWorlds(world, targetWorld);
      interpreter = new GvrInterpreter(world);
      renderSimulatorCanvases();
      updateTelemetry('READY');
      showToast('✅ Peta .gvrw berhasil diterapkan ke kanvas!');
      logTerminal(`Peta .gvrw dimuat: Robot (${world.robot.x}, ${world.robot.y}) ${world.robot.dir}, Grid ${world.cols}×${world.rows}, ${world.hWalls.size + world.vWalls.size} tembok.`, 'system');
    });
  }

  // Window Resize & Orientation Change listener to maintain sharp responsive canvas
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      renderSimulatorCanvases();
    }, 100);
  });

  // ==========================================
  // INITIALIZATION
  // ==========================================
  window.loadMapAndSolution = loadMission;
  populateMissionCarousel();
  loadMission(missions[0].id);
  setViewMode('live');
  setStudioSubmode('simulate');
});
