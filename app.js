// ========== MAIN APP ==========

// Boot sequence
const BOOT_MESSAGES = [
  '> Initializing ITCommand Center...',
  '> Loading system modules...',
  '> Connecting to local storage...',
  '> Mounting ticket engine...',
  '> Loading device inventory...',
  '> Activating troubleshoot wizard...',
  '> Starting log analyzer...',
  '> Loading knowledge base...',
  '> Applying gamification layer...',
  '> All systems nominal.',
  '> Welcome to ITCommand Center ✓',
];

function runBoot() {
  const logEl = document.getElementById('boot-log');
  const progEl = document.getElementById('boot-progress');
  let i = 0;
  const interval = setInterval(() => {
    if (i < BOOT_MESSAGES.length) {
      const line = document.createElement('div');
      line.className = 'line';
      line.textContent = BOOT_MESSAGES[i];
      line.style.animationDelay = '0s';
      logEl.appendChild(line);
      logEl.scrollTop = logEl.scrollHeight;
      progEl.style.width = ((i + 1) / BOOT_MESSAGES.length * 100) + '%';
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        document.getElementById('boot-screen').style.opacity = '0';
        document.getElementById('boot-screen').style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.getElementById('boot-screen').classList.add('hidden');
          document.getElementById('app').classList.remove('hidden');
          initApp();
        }, 500);
      }, 400);
    }
  }, 80);
}

// Initialize app
function initApp() {
  startClock();
  Gamification.updateUI();
  updateBadge();
  const name = Storage.get('profile_name', 'IT Support');
  document.getElementById('avatar-name').textContent = name;
  navigate('dashboard');
}

// Clock
function startClock() {
  function tick() {
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString();
  }
  tick();
  setInterval(tick, 1000);
}

// Navigation
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  tickets: 'Ticket Management',
  inventory: 'Device Inventory',
  wizard: 'Troubleshoot Wizard',
  analyzer: 'Log Analyzer',
  tools: 'Quick Tools',
  kb: 'Knowledge Base',
  profile: 'My Profile',
};

const PAGE_RENDERERS = {
  dashboard: renderDashboard,
  tickets: renderTickets,
  inventory: renderInventory,
  wizard: renderWizard,
  analyzer: renderAnalyzer,
  tools: renderTools,
  kb: renderKB,
  profile: renderProfile,
};

function navigate(page) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target page
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');

  // Highlight nav item
  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  // Update title
  document.getElementById('page-title').textContent = PAGE_TITLES[page] || page;

  // Render page content
  if (PAGE_RENDERERS[page]) PAGE_RENDERERS[page]();
}

// Toast notification
let toastTimer;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// Start boot on load
window.addEventListener('load', runBoot);
