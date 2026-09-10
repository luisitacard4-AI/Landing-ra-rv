# 🌐 XR Food Engineering: Tecnologías Inmersivas en Ingeniería de Alimentos

<!-- BADGES PRINCIPALES -->
<p align="left">
  <a href="https://www.python.org/">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Badge" />
  </a>
  <a href="https://developer.mozilla.org/es/docs/Web/HTML">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 Badge" />
  </a>
  <a href="https://developer.mozilla.org/es/docs/Web/CSS">
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Badge" />
  </a>
  <a href="https://developer.mozilla.org/es/docs/Web/JavaScript">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge" />
  </a>
  <a href="https://www.w3.org/Graphics/SVG/">
    <img src="https://img.shields.io/badge/SVG-Vector_Graphics-00e5ff?style=for-the-badge&logo=svg&logoColor=black" alt="SVG Badge" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-059669?style=for-the-badge" alt="License MIT" />
  </a>
</p>

Plataforma interactiva, moderna y minimalista orientada a la divulgación, cálculo y simulación de **Realidad Aumentada (RA)**, **Realidad Virtual (RV)** y **Realidad Mixta (RM)** aplicadas a la **Ingeniería de Alimentos**.

Presenta una doble perspectiva: el impacto directo en la **vida profesional** dentro de plantas agroalimentarias 4.0 y su aplicación práctica en la **vida estudiantil** para laboratorios formativos sin mermas ni riesgos biológicos/físicos.

---

## 🎯 Características Principales

1. **Menú Lateral Izquierdo (Sidebar)**:
   - Navegación vertical fluida con seguimiento activo de sección mediante `IntersectionObserver`.
   - Selector dinámico de **Modo Claro / Modo Oscuro** con persistencia en `localStorage`.
   - Diseño adaptable a dispositivos móviles mediante menú off-canvas.

2. **Gráficos 100% SVG (Vectoriales puros)**:
   - Eliminación total de emoticones convencionales; en su lugar, se emplean gráficos de soporte vectorial nítidos, modernos y con estilo técnico ingenieril.

3. **Botones Interactivos con Micro-Animaciones Realistas**:
   - Efecto de pulsación táctil con elevación 3D, resplandor sutil de acento y efecto de onda expansiva (*ripple effect*) en cada interacción.

4. **Calculadora de Procesos Térmicos en JavaScript (`assets/js/calculator.js`)**:
   - Cálculo en tiempo real de cinética de pasteurización y esterilización:
     - Tasa de letalidad: $L = 10^{(T - T_{ref})/z}$
     - Tiempo de reducción decimal a temperatura de proceso: $D_T = D_{ref} \times 10^{(T_{ref} - T)/z}$
     - Letalidad acumulada ($F_0$) y reducciones logarítmicas alcanzadas ($\Delta \log N$).
     - Estimación de preservación nutricional y bioactiva.
     - Presets industriales: Leche HTST, Conservas 12D (*C. botulinum*), Jugos Cítricos y Termización.
     - Diagnóstico automático para conexión con Gemelos Digitales XR.

5. **Módulo de Gamificación: Inspector XR HACCP (`assets/js/game.js`)**:
   - Simulador estilo visor HUD de Realidad Aumentada.
   - Auditoría de lotes de producción continua con telemetría de temperatura, pH e integridad de sellado.
   - Efectos sonoros sintetizados nativamente vía **Web Audio API** (sin necesidad de archivos de audio externos).
   - Sistema de puntuación (XP), multiplicador de racha y rangos profesionales progresivos (*Trainee*, *Auditor HACCP*, *Master XR*).

---

## 📂 Estructura del Proyecto

Todos los recursos, estilos y código ejecutable están organizados modularmente bajo el directorio `assets/`:

```
c:/Users/lab-indus/Desktop/landing/
├── index.html                   # Documento semántico y maquetación principal
├── README.md                    # Documentación y badges informativos
└── assets/
    ├── css/
    │   └── style.css            # Sistema de tokens, modo oscuro/claro y micro-animaciones
    ├── js/
    │   ├── main.js              # Control de navegación, menú lateral y tema
    │   ├── calculator.js        # Motor matemático y cinético de alimentos
    │   └── game.js              # Simulador gamificado de inspección aséptica
    └── images/
        ├── xr-professional-plant.jpg     # Gemelo digital en pasteurizador industrial
        ├── xr-student-lab.jpg            # Laboratorio virtual de micelas y biorreactores
        └── xr-packaging-inspection.jpg   # Inspección de termosellado aséptico con RM
```

---

## 🐍 ¿Por qué se utiliza el Badge de Python?

El badge azul de **Python** representa la integración con los modelos de ciencia de datos y simulación termodinámica:
- **Modelado Cinético**: Ajuste no lineal de curvas de muerte térmica con `scipy.optimize` y `numpy`.
- **Visión por Computadora**: Algoritmos con `OpenCV` para detección de microfisuras en sellado de empaques que envían coordenadas a las interfaces de Realidad Aumentada.
- **Predicción de Vida Útil**: Modelos de degradación de calidad y textura de alimentos transferidos a la interfaz web mediante arquitecturas de API REST.

---

## 🚀 Cómo Visualizar el Proyecto Localmente

No se requieren dependencias pesadas para ejecutar la landing page. Puede abrirse directamente en cualquier navegador moderno:

### Opción 1: Abrir directamente el archivo
Haz doble clic en el archivo [`index.html`](file:///c:/Users/lab-indus/Desktop/landing/index.html) en tu explorador de archivos.

### Opción 2: Servidor local ligero (Python)
Si dispones de Python instalado, ejecuta en la terminal dentro del directorio del proyecto:

```bash
python -m http.server 8080
```

Luego abre tu navegador en:
```
http://localhost:8080
```

---

## 🛠️ Tecnologías Empleadas

| Tecnología | Rol en el Proyecto |
|---|---|
| **Python** | Modelado analítico y referencia de procesamiento predictivo de datos |
| **HTML5** | Estructura semántica, accesibilidad y maquetación modular |
| **Vanilla CSS3** | Sistema de variables CSS, glassmorphism, responsive design y keyframes |
| **JavaScript (ES6+)** | Lógica de la calculadora termodinámica y motor del minijuego |
| **SVG** | Iconografía y gráficos de precisión vectorial de alta resolución |
| **Web Audio API** | Generación de retroalimentación acústica interactiva en tiempo real |

---

## 👨‍🔬 Autoría
Proyecto desarrollado para estudiantes y profesionales de **Ingeniería de Alimentos** explorando la transformación digital y la **Industria 4.0**.
