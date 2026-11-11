// =========================================================
// GvRNG STUDIO — MATERI INTERACTIVE CANVASES VISUALIZER
// Real 2D Canvas Engine with Full Trajectory & Live Playback
// =========================================================

(function() {
  'use strict';

  const materiInstances = new Map();

  function initMateriVisualizers() {
    if (!window.GVR_MISSIONS || !window.GvrWorld || !window.GvrInterpreter) return;

    const canvases = document.querySelectorAll('.materi-interactive-canvas');
    canvases.forEach(canvas => {
      const missionId = canvas.getAttribute('data-mission-id');
      const mission = window.GVR_MISSIONS.find(m => m.id === missionId || m.number === parseInt(missionId, 10));
      if (!mission) return;

      // Avoid re-initializing if already initialized
      if (materiInstances.has(canvas)) {
        const inst = materiInstances.get(canvas);
        renderFrame(inst, inst.currentFrame, inst.currentFrame === 0 || inst.currentFrame === inst.frames.length - 1 && !inst.isPlaying);
        return;
      }

      // 1. Build initial world
      const world = new GvrWorld(mission.cols, mission.rows);
      world.setRobot(mission.initialRobot.x, mission.initialRobot.y, mission.initialRobot.dir, mission.initialRobot.beepers || 0);
      (mission.hWalls || []).forEach(([x, y]) => world.addHWall(x, y));
      (mission.vWalls || []).forEach(([x, y]) => world.addVWall(x, y));
      (mission.initialBeepers || []).forEach(([x, y, c]) => world.setBeeper(x, y, c));

      // 2. Simulate & record all key frames
      const frames = [];
      frames.push({
        robot: { ...world.robot },
        beepers: new Map(world.beepers),
        pathHistory: [...world.pathHistory]
      });

      const interp = new GvrInterpreter(world);
      try {
        interp.loadSource(mission.solutionCode);
        let s = 0;
        while (!world.robot.isOff && s < 4000) {
          interp.step();
          frames.push({
            robot: { ...world.robot },
            beepers: new Map(world.beepers),
            pathHistory: [...world.pathHistory]
          });
          s++;
        }
      } catch (err) {
        console.warn(`[Materi] Simulation warning for ${mission.id}:`, err);
      }

      const instance = {
        mission,
        canvas,
        world,
        frames,
        fullPath: [...world.pathHistory],
        currentFrame: 0,
        isPlaying: false,
        interval: null,
        badgeEl: document.getElementById(`stepBadge_${mission.id}`),
        playBtn: document.querySelector(`.btn-materi-playback[data-action="play"][data-target="${mission.id}"]`),
        resetBtn: document.querySelector(`.btn-materi-playback[data-action="reset"][data-target="${mission.id}"]`)
      };

      materiInstances.set(canvas, instance);

      // Render full initial overview with robot at start, full path trail & yellow arrows
      renderFrame(instance, 0, true);

      // Bind playback controls
      if (instance.playBtn) {
        instance.playBtn.addEventListener('click', () => togglePlay(instance));
      }
      if (instance.resetBtn) {
        instance.resetBtn.addEventListener('click', () => resetPlayback(instance));
      }
    });
  }

  function renderFrame(inst, frameIndex, isFullStatic = false) {
    if (!inst.frames || !inst.frames[frameIndex]) return;
    const f = inst.frames[frameIndex];

    if (isFullStatic) {
      // In static overview mode: place robot at START position with initial beepers, but show FULL path
      inst.world.robot = {
        x: inst.mission.initialRobot.x,
        y: inst.mission.initialRobot.y,
        dir: inst.mission.initialRobot.dir,
        beepers: inst.mission.initialRobot.beepers || 0,
        isOff: false
      };
      inst.world.beepers = new Map();
      (inst.mission.initialBeepers || []).forEach(([x, y, c]) => inst.world.beepers.set(`${x},${y}`, c));
      inst.world.pathHistory = [...inst.fullPath];
    } else {
      // Apply animated frame state to world
      inst.world.robot = { ...f.robot };
      inst.world.beepers = new Map(f.beepers);
      inst.world.pathHistory = [...f.pathHistory];
    }

    // Render onto canvas with highlight trail, yellow arrows, and top-left status pill
    inst.world.render(inst.canvas, {
      isMateriView: true,
      highlightTrail: true,
      isTargetView: false,
      badgeText: isFullStatic ? 'KONDISI SAAT INI / LIVE' : `LANGKAH ${frameIndex} / ${inst.frames.length - 1}`
    });

    // Update counter badge
    if (inst.badgeEl) {
      if (isFullStatic) {
        inst.badgeEl.textContent = `Lintasan Lengkap (${inst.fullPath.length} Titik)`;
      } else {
        inst.badgeEl.textContent = `Langkah: ${frameIndex} / ${inst.frames.length - 1}`;
      }
    }
  }

  function togglePlay(inst) {
    if (inst.isPlaying) {
      pause(inst);
    } else {
      play(inst);
    }
  }

  function play(inst) {
    inst.isPlaying = true;
    if (inst.playBtn) inst.playBtn.innerHTML = '⏸️ Jeda Animasi';

    // If at end or just starting, start from frame 0
    if (inst.currentFrame >= inst.frames.length - 1) {
      inst.currentFrame = 0;
    }

    clearInterval(inst.interval);
    const speedMs = inst.frames.length > 500 ? 15 : (inst.frames.length > 200 ? 30 : 60);

    inst.interval = setInterval(() => {
      inst.currentFrame++;
      if (inst.currentFrame >= inst.frames.length) {
        pause(inst);
        // Show static full overview once done
        renderFrame(inst, inst.frames.length - 1, true);
        return;
      }
      renderFrame(inst, inst.currentFrame, false);
    }, speedMs);
  }

  function pause(inst) {
    inst.isPlaying = false;
    clearInterval(inst.interval);
    if (inst.playBtn) inst.playBtn.innerHTML = '▶️ Putar Animasi';
  }

  function resetPlayback(inst) {
    pause(inst);
    inst.currentFrame = 0;
    renderFrame(inst, 0, true);
  }

  // Trigger on tab switch or page load
  window.initMateriVisualizers = initMateriVisualizers;

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMateriVisualizers, 120);
  });

  // Re-render when switching to tabMateri
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.nav-tab-btn[data-tab="tabMateri"]');
    if (tabBtn) {
      setTimeout(initMateriVisualizers, 80);
    }
  });

  // Window resize observer to keep canvases sharp
  window.addEventListener('resize', () => {
    materiInstances.forEach(inst => {
      renderFrame(inst, inst.currentFrame, !inst.isPlaying);
    });
  });

})();
