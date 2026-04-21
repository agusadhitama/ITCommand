// ========== DASHBOARD MODULE ==========
function renderDashboard() {
  const page = document.getElementById('page-dashboard');
  const tickets = Tickets.getAll();
  const devices = Inventory.getAll();
  const kb = KB.getAll();
  const xp = Gamification.getXP();
  const lvl = Gamification.getLevel();
  const open = tickets.filter(t => t.status === 'Open').length;
  const inprog = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;
  const recentTickets = tickets.slice(0, 5);
  const name = Storage.get('profile_name', 'IT Support');

  page.innerHTML = `
    <div style="margin-bottom:1.5rem">
      <h1 style="font-size:1.4rem;font-weight:900;color:var(--text-1)">Good ${getGreeting()}, <span style="color:var(--accent)">${name}</span> 👋🏽</h1>
      <p style="color:var(--text-3);font-size:0.82rem;font-family:var(--font-mono)">${new Date().toDateString()} - ${lvl.title}</p>
    </div>

    <div class="grid-4" style="margin-bottom:1.25rem">
      <div class="stat-card">
        <div class="stat-label">Open Tickets</div>
        <div class="stat-value" style="color:var(--danger)">${open}</div>
        <div class="stat-sub">Needs attention</div>
      </div>
      <div class="stat-card warn">
        <div class="stat-label">In Progress</div>
        <div class="stat-value" style="color:var(--warn)">${inprog}</div>
        <div class="stat-sub">Being handled</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">Resolved</div>
        <div class="stat-value" style="color:var(--success)">${resolved}</div>
        <div class="stat-sub">All time</div>
      </div>
      <div class="stat-card purple">
        <div class="stat-label">Total XP</div>
        <div class="stat-value" style="color:var(--accent2)">${xp}</div>
        <div class="stat-sub">${lvl.title}</div>
      </div>
    </div>

    <div class="grid-2" style="gap:1.25rem;margin-bottom:1.25rem">
      <div class="card">
        <div class="card-title">Recent Tickets</div>
        ${recentTickets.length === 0 ? `<div class="empty-state" style="padding:1.5rem"><div class="empty-icon">🎫</div><div class="empty-text">No tickets yet</div></div>` : `
        <div>
          ${recentTickets.map(t => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0.55rem 0;border-bottom:1px solid rgba(30,45,74,0.4)">
              <div>
                <span class="mono" style="color:var(--accent);font-size:0.72rem">${t.id}</span>
                <span style="font-size:0.82rem;color:var(--text-2);margin-left:0.5rem">${t.title}</span>
              </div>
              <div class="flex-gap">
                <span class="tag tag-${t.priority.toLowerCase()}">${t.priority}</span>
                <span class="tag tag-${t.status.toLowerCase().replace(' ','-')}">${t.status}</span>
              </div>
            </div>`).join('')}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:0.75rem" onclick="navigate('tickets')">View All →</button>`}
      </div>

      <div class="card">
        <div class="card-title">Quick Stats</div>
        <div style="display:flex;flex-direction:column;gap:0.75rem">
          ${[
            ['Devices Tracked', devices.length, 'var(--accent)', '◫'],
            ['KB Entries', kb.length, 'var(--accent2)', '◬'],
            ['Total Tickets', tickets.length, 'var(--warn)', '◉'],
            ['Resolution Rate', tickets.length ? Math.round((resolved/tickets.length)*100)+'%' : '0%', 'var(--success)', '◈'],
          ].map(([l,v,c,icon]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid rgba(30,45,74,0.3)">
              <span style="font-size:0.82rem;color:var(--text-2)">${icon} ${l}</span>
              <span style="font-weight:700;color:${c}">${v}</span>
            </div>`).join('')}
        </div>
        <hr class="divider"/>
        <div style="font-size:0.72rem;color:var(--text-3);font-family:var(--font-mono)">QUICK ACTIONS</div>
        <div class="flex-gap" style="margin-top:0.5rem">
          <button class="btn btn-primary btn-sm" onclick="openTicketModal()">+ Ticket</button>
          <button class="btn btn-outline btn-sm" onclick="openDeviceModal()">+ Device</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('wizard')">🧠 Wizard</button>
          <button class="btn btn-outline btn-sm" onclick="navigate('analyzer')">🔬 Analyze</button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">System Status</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0.75rem">
        ${[
          ['Ticket System', 'Online'],
          ['Inventory DB', 'Online'],
          ['Knowledge Base', 'Online'],
          ['Local Storage', checkStorage()],
        ].map(([svc,status]) => `
          <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:6px;padding:0.75rem;display:flex;align-items:center;gap:0.5rem">
            <div style="width:8px;height:8px;border-radius:50%;background:${status==='Online'?'var(--accent3)':'var(--danger)'};box-shadow:0 0 6px ${status==='Online'?'var(--accent3)':'var(--danger)'}"></div>
            <div>
              <div style="font-size:0.75rem;color:var(--text-2)">${svc}</div>
              <div style="font-size:0.68rem;color:${status==='Online'?'var(--accent3)':'var(--danger)'};">${status}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function checkStorage() {
  try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return 'Online'; }
  catch { return 'Unavailable'; }
}
