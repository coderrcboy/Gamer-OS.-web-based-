// GamerOS JS

const storageKey = 'webos_lite_user';
let currentUser = localStorage.getItem(storageKey) || '';
let expr = '';
let z = 30;

const welcome = document.getElementById('welcome');
const shade = document.getElementById('shade');

function updateClock(){
  const d = new Date();
  document.getElementById('dateTxt').textContent =
    d.toLocaleDateString([], {weekday:'short', year:'numeric', month:'short', day:'numeric'});
  document.getElementById('timeTxt').textContent =
    d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
  document.getElementById('tzPill').textContent =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
}
setInterval(updateClock, 1000);
updateClock();

function renderUser(){
  if(currentUser){
    document.getElementById('greetTop').textContent = 'Welcome back, ' + currentUser;
    document.getElementById('userMini').textContent = currentUser;
  } else {
    document.getElementById('greetTop').textContent = 'GamerOS- by Shyam';
    document.getElementById('userMini').textContent = 'Not set';
  }
}

function showWelcome(){
  renderUser();
  const first = !currentUser;
  document.getElementById('welcomeTitle').textContent =
    first ? 'Welcome!' : 'Welcome back, ' + currentUser + '!';
  document.getElementById('welcomeMsg').textContent = first
    ? 'Welcome to GamerOS. this is a WebOS for gamers available offline and online. It is still a work in progress. Enter Name to continue.'
    : 'Continue to your desktop.';
  document.getElementById('nameRow').style.display = first ? 'flex' : 'none';
  welcome.style.display = 'flex';
  if(!first) setTimeout(()=> welcome.style.display = 'none', 1200);
}

function saveName(){
  const v = document.getElementById('nameInput').value.trim();
  if(!v) return;
  currentUser = v;
  localStorage.setItem(storageKey, v);
  renderUser();
  document.getElementById('welcomeTitle').textContent = 'Hello, ' + v + '!';
  document.getElementById('welcomeMsg').textContent = 'Loading your desktop...';
  document.getElementById('nameRow').style.display = 'none';
  setTimeout(()=> welcome.style.display = 'none', 900);
}

function guestMode(){
  currentUser = 'Guest';
  localStorage.setItem(storageKey, currentUser);
  renderUser();
  document.getElementById('welcomeTitle').textContent = 'Hello, Guest!';
  document.getElementById('welcomeMsg').textContent = 'Loading your desktop...';
  document.getElementById('nameRow').style.display = 'none';
  setTimeout(()=> welcome.style.display = 'none', 700);
}

function resetUser(){
  currentUser = '';
  localStorage.removeItem(storageKey);
  welcome.style.display = 'flex';
  document.getElementById('nameRow').style.display = 'flex';
  document.getElementById('nameInput').value = '';
  document.getElementById('welcomeTitle').textContent = 'Welcome!';
  document.getElementById('welcomeMsg').textContent = 'Enter your name to start.';
  renderUser();
}

// Active window + z-index
function bringToFront(win){
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
  win.style.zIndex = ++z;
}

function openWin(id){
  const win = document.getElementById(id);
  if(!win) return;
  win.style.display = 'block';
  bringToFront(win);
}

function hideWin(id){
  const win = document.getElementById(id);
  if(win) win.style.display = 'none';
}

function closeApp(app){
  if(app === 'calculator') hideWin('calculatorWin');
  if(app === 'settings') hideWin('settingsWin');
  if(app === 'chrome') hideWin('chromeWin');
}

// Chrome search helper
function openGoogleSearch(){
  const q = document.getElementById('chromeQuery').value.trim();
  const url = q
    ? 'https://www.google.com/search?q=' + encodeURIComponent(q)
    : 'https://www.google.com';
  window.open(url, '_blank');
}

// Calculator logic
function calcRender(){
  document.getElementById('calcDisplay').textContent = expr || '0';
}
function calcPress(ch){
  expr += ch;
  calcRender();
}
function calcClear(){
  expr = '';
  calcRender();
}
function calcBack(){
  expr = expr.slice(0, -1);
  calcRender();
}
function calcEval(){
  try{
    if(!/^[0-9+\-*/.() ]+$/.test(expr)) throw new Error('bad');
    const result = Function('"use strict";return (' + expr + ')')();
    expr = String(result);
  }catch(e){
    expr = 'Error';
  }
  calcRender();
}

// Draggable windows
function makeDraggable(win){
  const bar = win.querySelector('.titlebar');
  let startX = 0, startY = 0, origX = 0, origY = 0, dragging = false;
  if(!bar) return;
  bar.addEventListener('pointerdown', (e) => {
    // If user clicked on the window buttons, don't start dragging
    if(e.target.closest('.winbtns')) return;

    dragging = true;
    bringToFront(win);
    const r = win.getBoundingClientRect();
    origX = r.left; origY = r.top;
    startX = e.clientX; startY = e.clientY;
    bar.setPointerCapture(e.pointerId);
  });
  bar.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    const nx = origX + (e.clientX - startX);
    const ny = origY + (e.clientY - startY);
    win.style.left = Math.max(8, Math.min(window.innerWidth - win.offsetWidth - 8, nx)) + 'px';
    win.style.top = Math.max(60, Math.min(window.innerHeight - win.offsetHeight - 8, ny)) + 'px';
  });
  bar.addEventListener('pointerup', () => dragging = false);
  bar.addEventListener('pointercancel', () => dragging = false);
}

// Wire up events
function wireEvents(){
  // App icons & taskbar buttons
  document.querySelectorAll('[data-open]').forEach(el => {
    el.addEventListener('click', () => openWin(el.dataset.open + 'Win'));
  });

  // Minimize buttons
  document.querySelectorAll('[data-minimize]').forEach(btn => {
    btn.addEventListener('click', () => hideWin(btn.dataset.minimize));
  });

  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeApp(btn.dataset.close));
  });

  // Shutdown
  const shutdownBtn = document.getElementById('shutdownBtn');
  shutdownBtn.addEventListener('click', () => {
    shade.style.display = 'flex';
    document.querySelectorAll('.window').forEach(w => w.style.display = 'none');
  });
  shade.addEventListener('click', () => {
    shade.style.display = 'none';
    showWelcome();
  });

  // Welcome actions
  document.getElementById('saveNameBtn').addEventListener('click', saveName);
  document.getElementById('guestModeBtn').addEventListener('click', guestMode);
  document.getElementById('resetUserBtn').addEventListener('click', resetUser);

  // Chrome actions
  document.getElementById('chromeSearchBtn').addEventListener('click', openGoogleSearch);
  document.getElementById('chromeHomeBtn').addEventListener('click', () => {
    window.open('https://www.google.com', '_blank');
  });

  // Calculator buttons
  document.querySelectorAll('[data-calc-val]').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.calcVal));
  });
  document.querySelectorAll('[data-calc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.calc;
      if(action === 'clear') calcClear();
      if(action === 'back') calcBack();
      if(action === 'eval') calcEval();
    });
  });

  // Draggable windows
  document.querySelectorAll('.window').forEach(makeDraggable);

  // Keyboard shortcuts for calculator
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') shade.style.display = 'none';
    if(document.getElementById('calculatorWin').style.display === 'block'){
      if(/^[0-9+\-*/.]$/.test(e.key)) calcPress(e.key);
      if(e.key === 'Backspace') calcBack();
      if(e.key === 'Enter') calcEval();
    }
  });
}

// Init
window.addEventListener('load', () => {
  showWelcome();
  renderUser();
  wireEvents();
});