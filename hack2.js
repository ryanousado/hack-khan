let loadedPlugins = [];

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

// EventEmitter para detectar mudanças no DOM
class EventEmitter {
  constructor() { this.events = {}; }
  on(event, listener) {
    (Array.isArray(event) ? event : [event]).forEach(e => {
      (this.events[e] = this.events[e] || []).push(listener);
    });
  }
  off(event, listener) {
    (Array.isArray(event) ? event : [event]).forEach(e => {
      this.events[e] && (this.events[e] = this.events[e].filter(l => l !== listener));
    });
  }
  emit(event, ...args) {
    this.events[event]?.forEach(l => l(...args));
  }
}
const plppdo = new EventEmitter();
// Observer otimizado para childList
new MutationObserver(mutations => {
  if (mutations.some(m => m.type === 'childList')) plppdo.emit('domChanged');
}).observe(document.body, { childList: true, subtree: true });

// Create styled splash screen
const splashScreen = document.createElement('div');
splashScreen.id = 'khan-destroyer-splash';

const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
  #khan-destroyer-splash {
    position: fixed; top: 0; left: 0;
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, #0d0d0d, #1a1a1a);
    color: #72ff72;
    font-family: 'Montserrat', sans-serif;
    font-size: 2.5rem;
    text-align: center;
    opacity: 0;
    transition: opacity 0.6s ease;
    z-index: 9999;
  }
  #khan-destroyer-splash .logo {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    animation: pulse 2s infinite;
  }
  #khan-destroyer-splash .subtitle {
    font-size: 1.25rem;
    color: #ffffff88;
  }
  @keyframes pulse {
    0%,100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
document.head.appendChild(style);
document.body.appendChild(splashScreen);

// Helpers
const delay = ms => new Promise(res => setTimeout(res, ms));
const sendToast = (text, duration = 4000) => Toastify({ text, duration, gravity: 'bottom', position: 'center', stopOnFocus: true, style: { background: 'rgba(0,0,0,0.8)', color: '#fff', fontFamily: 'Montserrat,sans-serif' } }).showToast();

async function showSplash() {
  splashScreen.innerHTML = `
    <div class="logo">KHAN <span style="color: #72ff72">DESTROYER</span></div>
    <div class="subtitle">Carregando plugins & recursos...</div>
  `;
  await delay(10);
  splashScreen.style.opacity = '1';
}

async function hideSplash() {
  splashScreen.style.opacity = '0';
  await delay(700);
  splashScreen.remove();
}

async function loadScript(url, label) {
  const res = await fetch(url);
  const txt = await res.text();
  loadedPlugins.push(label);
  eval(txt);
}
async function loadCss(url) {
  return new Promise(res => {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = url;
    l.onload = res;
    document.head.appendChild(l);
  });
}

// Setup principal
(async () => {
  // Redirecionamento se não for Khan Academy
  if (!/^https?:\/\/(?:[a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
    window.location.href = 'https://pt.khanacademy.org/';
    return;
  }
  await showSplash();
  // Carrega DarkReader e Toastify
  await Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReader'),
    loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'),
    loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastify')
  ]);
  // Ativa dark mode customizado
  DarkReader.setFetchMethod(window.fetch);
  DarkReader.enable({ brightness: 100, contrast: 90 });
  await delay(1500);
  await hideSplash();
  sendToast('👌｜Khan Destroyer iniciado!', 3000);
  console.clear();
  setupMain();
})();

function setupMain() {
  // Override fetch para auto-progressão
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let body = init?.body;
    if (input instanceof Request) body = await input.clone().text();
    // Completa vídeo
    if (body?.includes('"updateUserVideoProgress"')) {
      try {
        const obj = JSON.parse(body);
        const d = obj.variables.input.durationSeconds;
        obj.variables.input.secondsWatched = d;
        obj.variables.input.lastSecondWatched = d;
        init = init || {};
        init.body = JSON.stringify(obj);
        sendToast('🔄｜Vídeo completado!', 1200);
      } catch {}
    }
    const res = await originalFetch.apply(this, arguments);
    // Modifica exercício se houver itemData
    try {
      const clone = res.clone();
      const text = await clone.text();
      const j = JSON.parse(text);
      const itm = j.data?.assessmentItem?.item?.itemData;
      if (itm) {
        const data = JSON.parse(itm);
        if (data.question.content[0] === data.question.content[0].toUpperCase()) {
          data.question.content = 'Desenvolvido por: ryan_imperador [[☃ radio 1]]';
          data.answerArea = { calculator: false, chi2Table: false, periodicTable: false, tTable: false, zTable: false };
          data.question.widgets = { 'radio 1': { type: 'radio', options: { choices: [{ content: '👌', correct: true }] } } };
          j.data.assessmentItem.item.itemData = JSON.stringify(data);
          return new Response(JSON.stringify(j), { status: res.status, statusText: res.statusText, headers: res.headers });
        }
      }
    } catch {}
    return res;
  };
  // Loop de cliques automáticos
  const selectors = ['[data-testid="choice-icon__library-choice-icon"]', '[data-testid="exercise-check-answer"]', '[data-testid="exercise-next-question"]', '._1udzurba', '._awve9b'];
  window.khanDestroyerRunning = true;
  plppdo.on('domChanged', async () => {
    if (!window.khanDestroyerRunning) return;
    selectors.forEach(sel => document.querySelector(sel)?.click());
    await delay(1000);
  });
}
