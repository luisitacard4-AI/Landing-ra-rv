/**
 * ==========================================================================
 * CALCULADORA DE CINÉTICA TÉRMICA & GEMELOS DIGITALES EN ALIMENTOS
 * Motor cinético de pasteurización y esterilización (Valor D, Z, F0 y Reducción Logarítmica)
 * ==========================================================================
 */

const FoodCalculator = (() => {
  // Presets industriales estándar
  const PRESETS = {
    htst_milk: {
      name: 'Pasteurización HTST Leche',
      temp: 72,
      time: 15,
      timeUnit: 's',
      tRef: 71.1,
      zVal: 5.5,
      dRef: 0.02, // minutos a Tref para Coxiella burnetii / Mycobacterium
      targetLog: 6
    },
    canning_botulinum: {
      name: 'Esterilización Clostridium botulinum',
      temp: 121.1,
      time: 15,
      timeUnit: 'm',
      tRef: 121.1,
      zVal: 10.0,
      dRef: 0.25, // minutos a 121.1°C
      targetLog: 12 // Criterio industrial 12D
    },
    citrus_juice: {
      name: 'Pasteurización Jugo Cítrico',
      temp: 85,
      time: 30,
      timeUnit: 's',
      tRef: 80.0,
      zVal: 7.0,
      dRef: 0.15,
      targetLog: 5
    },
    thermization: {
      name: 'Termización Láctea Preliminar',
      temp: 65,
      time: 20,
      timeUnit: 's',
      tRef: 65.0,
      zVal: 6.0,
      dRef: 0.35,
      targetLog: 3
    }
  };

  // DOM Elements
  let tempRange, tempInput;
  let timeRange, timeInput;
  let timeUnitSelect;
  let zInput, dRefInput, tRefInput, targetLogInput;
  
  // Output Elements
  let valDT, valL, valF0, valLogRed, valNutrientScore;
  let statusBadge, twinRecommendation, lethalityProgress;

  function init() {
    // Bind Inputs
    tempRange = document.getElementById('calc-temp-range');
    tempInput = document.getElementById('calc-temp-num');
    timeRange = document.getElementById('calc-time-range');
    timeInput = document.getElementById('calc-time-num');
    timeUnitSelect = document.getElementById('calc-time-unit');
    zInput = document.getElementById('calc-z-val');
    dRefInput = document.getElementById('calc-d-ref');
    tRefInput = document.getElementById('calc-t-ref');
    targetLogInput = document.getElementById('calc-target-log');

    // Bind Outputs
    valDT = document.getElementById('res-dt');
    valL = document.getElementById('res-l');
    valF0 = document.getElementById('res-f0');
    valLogRed = document.getElementById('res-log-red');
    valNutrientScore = document.getElementById('res-nutrient');
    statusBadge = document.getElementById('res-status-badge');
    twinRecommendation = document.getElementById('res-twin-rec');
    lethalityProgress = document.getElementById('res-lethality-bar');

    if (!tempRange) return;

    // Attach Listeners
    tempRange.addEventListener('input', (e) => {
      tempInput.value = e.target.value;
      calculate();
    });
    tempInput.addEventListener('input', (e) => {
      tempRange.value = e.target.value;
      calculate();
    });

    timeRange.addEventListener('input', (e) => {
      timeInput.value = e.target.value;
      calculate();
    });
    timeInput.addEventListener('input', (e) => {
      timeRange.value = e.target.value;
      calculate();
    });

    [timeUnitSelect, zInput, dRefInput, tRefInput, targetLogInput].forEach(el => {
      if (el) el.addEventListener('change', calculate);
      if (el && el.tagName === 'INPUT') el.addEventListener('input', calculate);
    });

    // Preset buttons
    const presetBtns = document.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const presetKey = btn.getAttribute('data-preset');
        applyPreset(presetKey);
      });
    });

    // Run Initial Calculation
    calculate();
  }

  function applyPreset(key) {
    const p = PRESETS[key];
    if (!p) return;

    tempRange.value = p.temp;
    tempInput.value = p.temp;
    timeRange.value = p.time;
    timeInput.value = p.time;
    if (timeUnitSelect) timeUnitSelect.value = p.timeUnit;
    if (zInput) zInput.value = p.zVal;
    if (dRefInput) dRefInput.value = p.dRef;
    if (tRefInput) tRefInput.value = p.tRef;
    if (targetLogInput) targetLogInput.value = p.targetLog;

    calculate();
  }

  function calculate() {
    const T = parseFloat(tempInput.value) || 72;
    const rawTime = parseFloat(timeInput.value) || 15;
    const timeUnit = timeUnitSelect ? timeUnitSelect.value : 's';
    const timeMin = timeUnit === 's' ? (rawTime / 60) : rawTime;

    const z = parseFloat(zInput.value) || 5.5;
    const Dref = parseFloat(dRefInput.value) || 0.02;
    const Tref = parseFloat(tRefInput.value) || 71.1;
    const targetLog = parseFloat(targetLogInput.value) || 6;

    // 1. Tasa de letalidad instantánea L = 10 ^ ((T - Tref) / z)
    const L = Math.pow(10, (T - Tref) / z);

    // 2. Valor D a la temperatura de proceso D_T = Dref * 10 ^ ((Tref - T) / z)
    const DT = Dref * Math.pow(10, (Tref - T) / z);

    // 3. Letalidad acumulada F = L * tiempo (min)
    const F0 = L * timeMin;

    // 4. Reducción logarítmica alcanzada = tiempo (min) / DT
    const logReductions = DT > 0 ? (timeMin / DT) : 0;

    // 5. Estimación de preservación de nutrientes y termolabilidad (0 - 100%)
    // A mayor temperatura y tiempo excesivo sobre la letalidad requerida, decae la retención vitamínica
    const overcookFactor = Math.max(0, logReductions - targetLog);
    const nutrientScore = Math.max(30, Math.round(100 - (overcookFactor * 3.5) - (T > 90 ? (T - 90) * 0.4 : 0)));

    // Actualizar UI
    if (valDT) valDT.textContent = DT < 0.001 ? DT.toExponential(2) : DT.toFixed(3);
    if (valL) valL.textContent = L < 0.01 ? L.toExponential(2) : L.toFixed(2);
    if (valF0) valF0.textContent = F0 < 0.01 ? F0.toExponential(2) : F0.toFixed(2);
    if (valLogRed) valLogRed.textContent = logReductions.toFixed(1);
    if (valNutrientScore) valNutrientScore.textContent = `${nutrientScore}%`;

    // Porcentaje de cumplimiento objetivo
    const compliancePercent = Math.min(100, Math.round((logReductions / targetLog) * 100));
    if (lethalityProgress) {
      lethalityProgress.style.width = `${compliancePercent}%`;
      if (compliancePercent < 100) {
        lethalityProgress.style.background = 'linear-gradient(90deg, #f59e0b, #f43f5e)';
      } else {
        lethalityProgress.style.background = 'linear-gradient(90deg, #10b981, #00e5ff)';
      }
    }

    // Diagnóstico del Gemelo Digital XR
    if (logReductions < targetLog) {
      // Peligro de sub-tratamiento
      if (statusBadge) {
        statusBadge.textContent = 'Riesgo Microbiológico';
        statusBadge.className = 'status-badge status-danger';
      }
      if (twinRecommendation) {
        const missingTime = (targetLog - logReductions) * DT;
        const missingUnit = timeUnit === 's' ? `${(missingTime * 60).toFixed(1)} segundos` : `${missingTime.toFixed(2)} minutos`;
        twinRecommendation.textContent = `ALERTA CRÍTICA: Se alcanzaron solo ${logReductions.toFixed(1)} reducciones decimales (objetivo: ${targetLog}D). Se requieren ${missingUnit} adicionales o elevar temperatura en el intercambiador de calor para asegurar la inocuidad.`;
      }
    } else if (logReductions >= targetLog && logReductions <= targetLog * 1.8) {
      // Zona Óptima
      if (statusBadge) {
        statusBadge.textContent = 'Tratamiento Óptimo';
        statusBadge.className = 'status-badge status-optimal';
      }
      if (twinRecommendation) {
        twinRecommendation.textContent = `PARÁMETROS ASÉPTICOS CONFIRMADOS: Esterilidad comercial garantizada con ${logReductions.toFixed(1)}D. Balance organoléptico y nutricional ideal (${nutrientScore}% de retención bioactiva). Gemelo digital listo para transferir receta a PLC.`;
      }
    } else {
      // Sobre-procesamiento térmico
      if (statusBadge) {
        statusBadge.textContent = 'Sobrecalentamiento';
        statusBadge.className = 'status-badge status-warning';
      }
      if (twinRecommendation) {
        twinRecommendation.textContent = `INEFICIENCIA TÉRMICA DETECTADA: Inocuidad superada con holgura (${logReductions.toFixed(1)}D vs ${targetLog}D meta), pero genera estrés térmico innecesario, pérdida de micronutrientes y mayor gasto de vapor en caldera.`;
      }
    }
  }

  return { init, calculate, applyPreset };
})();

document.addEventListener('DOMContentLoaded', FoodCalculator.init);
