let loadedPlugins = [];

console.clear();
const noop = () => {};
console.warn = console.error = window.debug = noop;

const splashScreen = document.createElement('splashScreen');

class EventEmitter {
  constructor() { this.events = {}; }
  on(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(t => {
      (this.events[t] = this.events[t] || []).push(e);
    });
  }
  off(t, e) {
    (Array.isArray(t) ? t : [t]).forEach(t => {
      this.events[t] && (this.events[t] = this.events[t].filter(h => h !== e));
    });
  }
  emit(t, ...e) {
    this.events[t]?.forEach(h => h(...e));
  }
  once(t, e) {
    const s = (...i) => {
      e(...i);
      this.off(t, s);
    };
    this.on(t, s);
  }
}

const plppdo = new EventEmitter();

// Observer otimizado
new MutationObserver(mutationsList => 
  mutationsList.some(m => m.type === 'childList') && plppdo.emit('domChanged')
).observe(document.body, { childList: true, subtree: true });

// Funções helpers
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const findAndClickBySelector = selector => document.querySelector(selector)?.click();

function sendToast(text, duration = 5000, gravity = 'bottom') {
  Toastify({
    text,
    duration,
    gravity,
    position: "center",
    stopOnFocus: true,
    style: { background: "#000000" }
  }).showToast();
}

async function showSplashScreen() {
  splashScreen.style.cssText = `
    position:fixed;
    top:0;left:0;width:100%;height:100%;
    background-color:#000;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    z-index:9999;
    opacity:0;
    transition:opacity 0.5s ease;
    user-select:none;
    color:white;
    font-family:MuseoSans,sans-serif;
    text-align:center;
  `;

  splashScreen.innerHTML = `
    <div style="font-size:50px;">
      🚀 <span style="color:white;">KHAN</span><span style="color:#72ff72;"> DESTROYER</span>
    </div>
    <div style="font-size:16px;color:#ccc;margin-top:10px;">
      by Ryan Imperador 💻
    </div>
  `;

  document.body.appendChild(splashScreen);
  setTimeout(() => splashScreen.style.opacity = '1', 10);
}

async function hideSplashScreen() {
  splashScreen.style.opacity = '0';
  setTimeout(() => splashScreen.remove(), 1000);
}

async function loadScript(url, label) {
  const response = await fetch(url);
  const script = await response.text();
  loadedPlugins.push(label);
  eval(script);
}

async function loadCss(url) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    link.onload = resolve;
    document.head.appendChild(link);
  });
}

function addFollowCard() {
  const card = document.createElement('div');
  card.id = 'follow-card';
  card.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: #1e1e1e; color: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 0 10px #000; z-index: 9999; max-width: 260px; font-family:MuseoSans,sans-serif;`;
  card.innerHTML = `
    <h3 style="color: #00ff88; margin: 0 0 8px;">Siga o Projeto!</h3>
    <p style="font-size: 14px; margin: 0 0 10px;">Acompanhe atualizações no Instagram</p>
    <a href="https://www.instagram.com/ryanalvessantos243/" target="_blank" style="display:inline-block;background:#E1306C;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none;font-weight:bold;margin-right:8px;font-size:14px;">Seguir</a>
    <button id="follow-card-close" style="background:#333;color:#fff;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;font-size:14px;">X</button>
  `;
  document.body.appendChild(card);
  document.getElementById('follow-card-close').addEventListener('click', () => card.remove());
}

function setupMain() {
  const originalFetch = window.fetch;
  window.fetch = async function(input, init) {
    let body;
    if (input instanceof Request) body = await input.clone().text();
    else if (init?.body) body = init.body;

    // Vídeo exploit
    if (body?.includes('"operationName":"updateUserVideoProgress"')) {
      try {
        let bodyObj = JSON.parse(body);
        if (bodyObj.variables?.input) {
          const d = bodyObj.variables.input.durationSeconds;
          bodyObj.variables.input.secondsWatched = d;
          bodyObj.variables.input.lastSecondWatched = d;
          body = JSON.stringify(bodyObj);
          if (input instanceof Request) input = new Request(input, { body });
          else init.body = body;
          sendToast("🔄｜Vídeo exploitado.", 1000);
        }
      } catch {}
    }

    const originalResponse = await originalFetch.apply(this, arguments);
    try {
      const clone = originalResponse.clone();
      const txt = await clone.text();
      let resp = JSON.parse(txt);
      if (resp?.data?.assessmentItem?.item?.itemData) {
        let itemData = JSON.parse(resp.data.assessmentItem.item.itemData);
        if (itemData.question.content[0] === itemData.question.content[0].toUpperCase()) {
          itemData.answerArea = { calculator:false,chi2Table:false,periodicTable:false,tTable:false,zTable:false };
          itemData.question.content = "🌟 Desenvolvido por Ryan Imperador 🌟 [[☃ radio 1]]";
          itemData.question.widgets = { "radio 1": { type:"radio", options:{ choices:[ {content:"Ryan é o mais bonito 😎",correct:true} ] } } };
          resp.data.assessmentItem.item.itemData = JSON.stringify(itemData);
          return new Response(JSON.stringify(resp), { status: originalResponse.status, statusText: originalResponse.statusText, headers: originalResponse.headers });
        }
      }
    } catch {}
    return originalResponse;
  };

  (async () => {
    const selectors = [
      `[data-testid="choice-icon__library-choice-icon"]`,
      `[data-testid="exercise-check-answer"]`,
      `[data-testid="exercise-next-question"]`,
      `._1udzurba`,
      `._awve9b`
    ];
    window.khanwareDominates = true;
    while (window.khanwareDominates) {
      for (const sel of selectors) {
        findAndClickBySelector(sel);
        const el = document.querySelector(`${sel}> div`);
        if (el?.innerText === "Mostrar resumo") sendToast("🎉｜Exercício concluído!",3000);
      }
      await delay(1000);
    }
  })();
}

if (!/^https?:\/\/(?:[a-z0-9-]+\.)?khanacademy\.org\//.test(window.location.href)) {
  window.location.href = "https://pt.khanacademy.org/";
} else {
  (async function init() {
    await showSplashScreen();
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js','darkReaderPlugin').then(()=>{ DarkReader.setFetchMethod(window.fetch); DarkReader.enable(); }),
      loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css'),
      loadScript('https://cdn.jsdelivr.net/npm/toastify-js','toastifyPlugin')
    ]);
    await delay(2000);
    await hideSplashScreen();
    setupMain();
    addFollowCard();
    sendToast("👌｜Khan Destroyer iniciado!");
    console.clear();
  })();
}
