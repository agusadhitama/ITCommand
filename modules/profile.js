// ========== PROFILE MODULE ==========
function renderProfile() {
  const page = document.getElementById('page-profile');
  const name = Storage.get('profile_name', 'IT Support');
  const title = Storage.get('profile_title', 'IT Support Specialist');
  const xp = Gamification.getXP();
  const lvl = Gamification.getLevel();
  const next = Gamification.getNextLevel();
  const pct = next ? Math.min(100, ((xp - lvl.min) / (next.min - lvl.min)) * 100) : 100;
  const unlocked = Storage.get('achievements', []);
  const tickets = Tickets.getAll();
  const devices = Inventory.getAll();
  const kb = KB.getAll();
  const logs = Storage.get('activity_log', []);
  const initial = name.charAt(0).toUpperCase();

  page.innerHTML = `
    <div class="section-header"><h2>◯ My Profile</h2></div>
    <div class="grid-2" style="gap:1.25rem">
      <div>
        <div class="card">
          <div class="profile-avatar-wrap">
            <div class="profile-avatar">${initial}</div>
            <div class="profile-title" id="disp-name">${name}</div>
            <div class="profile-level">${lvl.title} · Lv.${lvl.lv}</div>
          </div>
          <hr class="divider"/>
          <div class="form-group">
            <label class="form-label">Display Name</label>
            <input class="input" id="prof-name" value="${name}" placeholder="Your name"/>
          </div>
          <div class="form-group">
            <label class="form-label">Job Title</label>
            <input class="input" id="prof-title" value="${title}" placeholder="e.g. IT Support Specialist"/>
          </div>
          <button class="btn btn-primary btn-sm" onclick="saveProfile()">Save Profile</button>
          <hr class="divider"/>
          <div style="font-size:0.8rem;color:var(--text-2)">
            <div style="margin-bottom:0.5rem;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-3)">XP PROGRESS</div>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <div style="flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden">
                <div style="height:100%;background:linear-gradient(90deg,var(--accent2),var(--accent));width:${pct}%;transition:width 0.5s"></div>
              </div>
              <span class="mono" style="color:var(--accent);font-size:0.78rem">${xp} XP</span>
            </div>
            ${next ? `<div style="font-size:0.68rem;color:var(--text-3);margin-top:0.3rem">${next.min - xp} XP to ${next.title}</div>` : '<div style="font-size:0.68rem;color:var(--accent3)">Max level reached! 🏆</div>'}
          </div>
        </div>

        <div class="card mt-2">
          <div class="card-title">Stats</div>
          <div class="grid-2" style="gap:0.75rem">
            ${[
              ['Tickets Created', tickets.length],
              ['Tickets Resolved', tickets.filter(t=>t.status==='Resolved').length],
              ['Devices Tracked', devices.length],
              ['KB Entries', kb.length],
              ['Achievements', `${unlocked.length}/${ACHIEVEMENTS.length}`],
              ['Total XP', xp],
            ].map(([l,v]) => `
              <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:6px;padding:0.75rem;text-align:center">
                <div style="font-size:1.5rem;font-weight:900;color:var(--accent)">${v}</div>
                <div style="font-size:0.68rem;color:var(--text-3)">${l}</div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <div class="card-title">Achievements (${unlocked.length}/${ACHIEVEMENTS.length})</div>
          <div class="achievement-grid">
            ${ACHIEVEMENTS.map(a => `
              <div class="achievement ${unlocked.includes(a.id)?'unlocked':''}" title="${a.desc}">
                <span class="ach-icon">${a.icon}</span>
                <div>${a.name}</div>
              </div>`).join('')}
          </div>
        </div>

        <div class="card mt-2">
          <div class="card-title">Recent Activity</div>
          ${logs.length === 0 ? `<div class="empty-state" style="padding:1rem"><div class="empty-text">No activity yet</div></div>` : `
          <div class="log-feed">
            ${logs.slice(0,20).map(l => `
              <div class="log-entry">
                <span class="log-time">${l.time}</span>
                <span class="log-msg"><span class="hl">+${l.xp||0}xp</span> ${l.msg}</span>
              </div>`).join('')}
          </div>`}
          ${logs.length > 0 ? `<button class="btn btn-outline btn-sm" style="margin-top:0.75rem" onclick="exportActivityLog()">⬇ Export Log</button>` : ''}
        </div>
      </div>
    </div>`;
}

function saveProfile() {
  const name = document.getElementById('prof-name').value.trim() || 'IT Support';
  const title = document.getElementById('prof-title').value.trim();
  Storage.set('profile_name', name);
  Storage.set('profile_title', title);
  document.getElementById('avatar-name').textContent = name;
  showToast('Profile saved!');
  renderProfile();
}

function exportActivityLog() {
  const logs = Storage.get('activity_log', []);
  const text = logs.map(l => `[${l.time}] +${l.xp||0}xp - ${l.msg}`).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/plain,' + encodeURIComponent(text);
  a.download = 'activity_log.txt'; a.click();
  showToast('Log exported!');
}
