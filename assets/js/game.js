/**
 * ==========================================================================
 * SIMULADOR XR: INSPECTOR INMERSIVO DE CALIDAD & HACCP
 * Minijuego de gamificación para auditoría de líneas asépticas en tiempo real
 * ==========================================================================
 */

const XRSimulator = (() => {
  // Configuración y Estado del Juego
  let state = {
    score: 0,
    streak: 0,
    inspectedCount: 0,
    correctCount: 0,
    timeLeft: 7,
    maxTime: 7,
    timerId: null,
    isPlaying: false,
    currentBatch: null,
    rank: 'Trainee XR en Inocuidad'
  };

  // Audio sintetizado mediante Web Audio API (cero dependencias externas)
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playTone(freq, type, duration, delay = 0) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + delay);
      osc.stop(audioCtx.currentTime + delay + duration);
    } catch (e) {
      // Audio no disponible o silenciado
    }
  }

  function playSound(effect) {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (effect === 'approve') {
      playTone(523.25, 'sine', 0.12, 0); // C5
      playTone(659.25, 'sine', 0.18, 0.08); // E5
    } else if (effect === 'reject') {
      playTone(330, 'square', 0.12, 0);
      playTone(220, 'sawtooth', 0.2, 0.08);
    } else if (effect === 'tick') {
      playTone(800, 'triangle', 0.03, 0);
    } else if (effect === 'level') {
      playTone(440, 'triangle', 0.1, 0);
      playTone(554.37, 'triangle', 0.1, 0.1);
      playTone(659.25, 'triangle', 0.25, 0.2);
    }
  }

  // Catálogo de Productos y Defectos Posibles
  const PRODUCTS = [
    {
      name: 'Leche Entera UHT (Aseptic Pack)',
      targetTemp: 138,
      targetPH: 6.7,
      targetSeal: 99.5,
      tempTol: 2,
      phTol: 0.15
    },
    {
      name: 'Jugo Néctar de Durazno Pasteurizado',
      targetTemp: 88,
      targetPH: 3.8,
      targetSeal: 99.0,
      tempTol: 3,
      phTol: 0.2
    },
    {
      name: 'Conserva Hermética de Atún (12D)',
      targetTemp: 121,
      targetPH: 6.1,
      targetSeal: 99.9,
      tempTol: 1.5,
      phTol: 0.15
    },
    {
      name: 'Bebida Probiótica Fermentada',
      targetTemp: 74,
      targetPH: 4.4,
      targetSeal: 99.2,
      tempTol: 2,
      phTol: 0.18
    }
  ];

  // DOM Elements
  let scoreEl, streakEl, accuracyEl, rankEl;
  let batchIdEl, batchNameEl, batchTempEl, batchPhEl, batchSealEl, batchAlertBanner, batchCard;
  let timerFillEl;
  let btnApprove, btnReject, btnStart;

  function init() {
    scoreEl = document.getElementById('game-score');
    streakEl = document.getElementById('game-streak');
    accuracyEl = document.getElementById('game-accuracy');
    rankEl = document.getElementById('game-rank');

    batchIdEl = document.getElementById('batch-id-display');
    batchNameEl = document.getElementById('batch-name-display');
    batchTempEl = document.getElementById('batch-temp-display');
    batchPhEl = document.getElementById('batch-ph-display');
    batchSealEl = document.getElementById('batch-seal-display');
    batchAlertBanner = document.getElementById('batch-alert-banner');
    batchCard = document.getElementById('batch-card-target');
    timerFillEl = document.getElementById('game-timer-fill');

    btnApprove = document.getElementById('btn-game-approve');
    btnReject = document.getElementById('btn-game-reject');
    btnStart = document.getElementById('btn-game-start');

    if (!btnStart) return;

    btnStart.addEventListener('click', startGame);
    btnApprove.addEventListener('click', () => submitDecision(true));
    btnReject.addEventListener('click', () => submitDecision(false));
  }

  function startGame() {
    state.score = 0;
    state.streak = 0;
    state.inspectedCount = 0;
    state.correctCount = 0;
    state.isPlaying = true;

    btnStart.style.display = 'none';
    btnApprove.disabled = false;
    btnReject.disabled = false;

    updateStatsUI();
    nextBatch();
  }

  function generateRandomBatch() {
    const prod = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const isDefective = Math.random() < 0.45; // 45% probabilidad de defecto crítico
    const batchCode = `LOT-${Math.floor(1000 + Math.random() * 9000)}-XR`;

    let temp = prod.targetTemp;
    let ph = prod.targetPH;
    let seal = prod.targetSeal;
    let defectMessage = '';
    let defectType = null;

    if (isDefective) {
      const type = Math.floor(Math.random() * 3);
      if (type === 0) {
        // Defecto térmico: sub-pasteurización
        temp = parseFloat((prod.targetTemp - (prod.tempTol * 2.8)).toFixed(1));
        defectMessage = 'PCC1 CRÍTICO: Temperatura por debajo del umbral de muerte térmica';
        defectType = 'thermal';
      } else if (type === 1) {
        // Defecto hermético: microfisura
        seal = parseFloat((prod.targetSeal - 14.5 - Math.random() * 8).toFixed(1));
        defectMessage = 'PCC2 CRÍTICO: Integridad de termosellado comprometida (<95%)';
        defectType = 'seal';
      } else {
        // Desviación de pH
        ph = parseFloat((prod.targetPH + (Math.random() > 0.5 ? 0.7 : -0.7)).toFixed(2));
        defectMessage = 'PCC3 CRÍTICO: Desviación fisicoquímica en pH de producto';
        defectType = 'ph';
      }
    } else {
      // Variaciones normales dentro de especificación
      temp = parseFloat((prod.targetTemp + (Math.random() * prod.tempTol * 0.8 - (prod.tempTol * 0.4))).toFixed(1));
      ph = parseFloat((prod.targetPH + (Math.random() * prod.phTol * 0.8 - (prod.phTol * 0.4))).toFixed(2));
      seal = parseFloat((prod.targetSeal - (Math.random() * 0.3)).toFixed(1));
      defectMessage = 'CONFORME: Todos los parámetros asépticos dentro del estándar HACCP';
    }

    return {
      batchCode,
      productName: prod.name,
      isDefective,
      temp,
      targetTemp: prod.targetTemp,
      ph,
      targetPH: prod.targetPH,
      seal,
      defectMessage,
      defectType
    };
  }

  function nextBatch() {
    if (!state.isPlaying) return;

    state.currentBatch = generateRandomBatch();
    state.timeLeft = state.maxTime;

    // Renderizar Lote
    if (batchIdEl) batchIdEl.textContent = state.currentBatch.batchCode;
    if (batchNameEl) batchNameEl.textContent = state.currentBatch.productName;
    if (batchTempEl) {
      batchTempEl.textContent = `${state.currentBatch.temp}°C`;
      batchTempEl.className = 'telemetry-val ' + (state.currentBatch.defectType === 'thermal' ? 'telemetry-critical' : 'telemetry-normal');
    }
    if (batchPhEl) {
      batchPhEl.textContent = state.currentBatch.ph;
      batchPhEl.className = 'telemetry-val ' + (state.currentBatch.defectType === 'ph' ? 'telemetry-critical' : 'telemetry-normal');
    }
    if (batchSealEl) {
      batchSealEl.textContent = `${state.currentBatch.seal}%`;
      batchSealEl.className = 'telemetry-val ' + (state.currentBatch.defectType === 'seal' ? 'telemetry-critical' : 'telemetry-normal');
    }

    // Resetear estilos visuales del HUD
    if (batchCard) {
      batchCard.classList.remove('has-danger', 'is-safe');
    }
    if (batchAlertBanner) {
      batchAlertBanner.textContent = 'ESCANEANDO SENSORES HOLOGRÁFICOS...';
      batchAlertBanner.className = 'hud-alert-banner';
    }

    // Reiniciar Timer Bar
    clearInterval(state.timerId);
    state.timerId = setInterval(() => {
      state.timeLeft -= 0.1;
      const progress = Math.max(0, (state.timeLeft / state.maxTime) * 100);
      if (timerFillEl) timerFillEl.style.width = `${progress}%`;

      if (state.timeLeft <= 0) {
        clearInterval(state.timerId);
        // Tiempo agotado = omisión de auditoría
        handleTimeout();
      }
    }, 100);
  }

  function submitDecision(approved) {
    if (!state.isPlaying || !state.currentBatch) return;

    clearInterval(state.timerId);
    state.inspectedCount++;

    const isCorrect = approved ? !state.currentBatch.isDefective : state.currentBatch.isDefective;

    if (isCorrect) {
      state.correctCount++;
      state.streak++;
      const gainedXP = 50 + (state.streak * 15);
      state.score += gainedXP;
      playSound('approve');

      if (batchCard) batchCard.classList.add('is-safe');
      if (batchAlertBanner) {
        batchAlertBanner.textContent = approved ? '✓ LOTE INOCUO APROBADO EXITOSAMENTE (+XP)' : '✓ DEFECTO DETECTADO Y DESVIADO A CUARENTENA (+XP)';
        batchAlertBanner.className = 'hud-alert-banner hud-alert-safe';
      }
    } else {
      state.streak = 0;
      state.score = Math.max(0, state.score - 40);
      playSound('reject');

      if (batchCard) batchCard.classList.add('has-danger');
      if (batchAlertBanner) {
        batchAlertBanner.textContent = approved 
          ? `✕ FALLO CRÍTICO: Aprobaste un lote contaminado (${state.currentBatch.defectMessage})`
          : '✕ ERROR: Rechazaste un lote que cumplía con todos los estándares';
        batchAlertBanner.className = 'hud-alert-banner hud-alert-danger';
      }
    }

    updateStatsUI();

    // Siguiente lote tras breve pausa para leer feedback
    setTimeout(() => {
      if (state.inspectedCount >= 10) {
        endGame();
      } else {
        nextBatch();
      }
    }, 1200);
  }

  function handleTimeout() {
    state.inspectedCount++;
    state.streak = 0;
    playSound('reject');

    if (batchAlertBanner) {
      batchAlertBanner.textContent = '⏱ TIEMPO AGOTADO: Inspección omitida en línea continua.';
      batchAlertBanner.className = 'hud-alert-banner hud-alert-danger';
    }

    updateStatsUI();

    setTimeout(() => {
      if (state.inspectedCount >= 10) {
        endGame();
      } else {
        nextBatch();
      }
    }, 1200);
  }

  function updateStatsUI() {
    if (scoreEl) scoreEl.textContent = `${state.score} XP`;
    if (streakEl) streakEl.textContent = `${state.streak}x`;

    const acc = state.inspectedCount > 0 ? Math.round((state.correctCount / state.inspectedCount) * 100) : 100;
    if (accuracyEl) accuracyEl.textContent = `${acc}%`;

    // Actualizar Rango
    if (state.score < 300) {
      state.rank = 'Trainee XR en Inocuidad';
    } else if (state.score < 650) {
      state.rank = 'Auditor HACCP Inmersivo';
    } else {
      state.rank = 'Master en Gemelos Digitales XR';
    }

    if (rankEl) rankEl.textContent = state.rank;
  }

  function endGame() {
    state.isPlaying = false;
    clearInterval(state.timerId);
    playSound('level');

    if (batchAlertBanner) {
      batchAlertBanner.textContent = `SIMULACIÓN COMPLETADA: ${state.correctCount}/10 Lotes auditados correctamente. Certificación final: ${state.rank}`;
      batchAlertBanner.className = 'hud-alert-banner hud-alert-safe';
    }

    if (btnStart) {
      btnStart.textContent = 'Reiniciar Auditoría Virtual';
      btnStart.style.display = 'inline-flex';
    }
    if (btnApprove) btnApprove.disabled = true;
    if (btnReject) btnReject.disabled = true;
  }

  return { init, startGame, submitDecision };
})();

document.addEventListener('DOMContentLoaded', XRSimulator.init);
