// ========== QUICK TOOLS MODULE ==========
function renderTools() {
  const page = document.getElementById('page-tools');
  page.innerHTML = `
    <div class="section-header"><h2>🛠️ Quick Tools</h2></div>
    <div class="tool-grid">

      <!-- Password Generator -->
      <div class="card">
        <div class="card-title">Password Generator</div>
        <div class="form-group">
          <label class="form-label">Length: <span id="pw-len-val">16</span></label>
          <input type="range" min="8" max="64" value="16" style="width:100%;accent-color:var(--accent)"
            oninput="document.getElementById('pw-len-val').textContent=this.value" id="pw-len"/>
        </div>
        <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;font-size:0.78rem">
          <label style="color:var(--text-2);display:flex;align-items:center;gap:0.3rem">
            <input type="checkbox" id="pw-upper" checked style="accent-color:var(--accent)"> A-Z
          </label>
          <label style="color:var(--text-2);display:flex;align-items:center;gap:0.3rem">
            <input type="checkbox" id="pw-lower" checked style="accent-color:var(--accent)"> a-z
          </label>
          <label style="color:var(--text-2);display:flex;align-items:center;gap:0.3rem">
            <input type="checkbox" id="pw-num" checked style="accent-color:var(--accent)"> 0-9
          </label>
          <label style="color:var(--text-2);display:flex;align-items:center;gap:0.3rem">
            <input type="checkbox" id="pw-sym" checked style="accent-color:var(--accent)"> !@#
          </label>
        </div>
        <button class="btn btn-primary btn-sm" onclick="generatePassword()">Generate</button>
        <div class="tool-output" id="pw-out" onclick="copyText('pw-out')">// click to copy</div>
      </div>

      <!-- Base64 Encoder/Decoder -->
      <div class="card">
        <div class="card-title">Base64 Encoder / Decoder</div>
        <textarea class="textarea" id="b64-input" style="min-height:80px;font-family:var(--font-mono);font-size:0.78rem" placeholder="Enter text or Base64 string..."></textarea>
        <div class="flex-gap" style="margin-top:0.5rem">
          <button class="btn btn-primary btn-sm" onclick="b64Encode()">Encode →</button>
          <button class="btn btn-outline btn-sm" onclick="b64Decode()">← Decode</button>
        </div>
        <div class="tool-output" id="b64-out" onclick="copyText('b64-out')">// result here</div>
      </div>

      <!-- Subnet Calculator -->
      <div class="card">
        <div class="card-title">Subnet Calculator</div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">IP Address</label>
            <input class="input" id="sub-ip" placeholder="192.168.1.0" value="192.168.1.0"/>
          </div>
          <div class="form-group">
            <label class="form-label">CIDR</label>
            <select class="select" id="sub-cidr">
              ${[8,16,24,25,26,27,28,29,30].map(c => `<option ${c===24?'selected':''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="calcSubnet()">Calculate</button>
        <div class="tool-output" id="sub-out" style="font-size:0.75rem;line-height:1.9">// result here</div>
      </div>

      <!-- IP Info Lookup -->
      <div class="card">
        <div class="card-title">IP Info Lookup</div>
        <div class="form-group">
          <label class="form-label">IP Address (leave blank for your IP)</label>
          <input class="input" id="ip-input" placeholder="e.g. 8.8.8.8"/>
        </div>
        <button class="btn btn-primary btn-sm" onclick="lookupIP()">Lookup</button>
        <div class="tool-output" id="ip-out" style="font-size:0.75rem;line-height:1.9">// result here</div>
      </div>

      <!-- Port Reference -->
      <div class="card" style="grid-column:span 2">
        <div class="card-title">Common Port Reference</div>
        <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:0.5rem">
          ${[
            ['20/21','FTP'],['22','SSH'],['23','Telnet'],['25','SMTP'],['53','DNS'],
            ['67/68','DHCP'],['80','HTTP'],['110','POP3'],['143','IMAP'],['161','SNMP'],
            ['389','LDAP'],['443','HTTPS'],['445','SMB'],['3306','MySQL'],['3389','RDP'],
            ['5432','PostgreSQL'],['5900','VNC'],['8080','HTTP Alt'],['8443','HTTPS Alt'],['27017','MongoDB'],
          ].map(([p,n]) => `
            <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:5px;padding:0.5rem;cursor:pointer;transition:border-color 0.15s"
              onclick="copyRaw('${p}')" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
              <div class="mono" style="color:var(--accent);font-size:0.8rem">${p}</div>
              <div style="font-size:0.7rem;color:var(--text-3)">${n}</div>
            </div>`).join('')}
        </div>
      </div>

    </div>`;
}

function generatePassword() {
  const len = parseInt(document.getElementById('pw-len').value);
  const upper = document.getElementById('pw-upper').checked;
  const lower = document.getElementById('pw-lower').checked;
  const num = document.getElementById('pw-num').checked;
  const sym = document.getElementById('pw-sym').checked;
  let chars = '';
  if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (lower) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (num)   chars += '0123456789';
  if (sym)   chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) { showToast('Select at least one character type', 'warn'); return; }
  let pw = '';
  for (let i = 0; i < len; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  document.getElementById('pw-out').textContent = pw;
}

function b64Encode() {
  const v = document.getElementById('b64-input').value;
  try { document.getElementById('b64-out').textContent = btoa(unescape(encodeURIComponent(v))); }
  catch { document.getElementById('b64-out').textContent = 'Encoding error'; }
}
function b64Decode() {
  const v = document.getElementById('b64-input').value;
  try { document.getElementById('b64-out').textContent = decodeURIComponent(escape(atob(v))); }
  catch { document.getElementById('b64-out').textContent = 'Invalid Base64 string'; }
}

function calcSubnet() {
  const ipStr = document.getElementById('sub-ip').value.trim();
  const cidr = parseInt(document.getElementById('sub-cidr').value);
  const parts = ipStr.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    document.getElementById('sub-out').textContent = 'Invalid IP address';
    return;
  }
  const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
  const ip32 = (parts[0]<<24|parts[1]<<16|parts[2]<<8|parts[3]) >>> 0;
  const net = (ip32 & mask) >>> 0;
  const broad = (net | (~mask >>> 0)) >>> 0;
  const hosts = cidr >= 31 ? (cidr===32?1:2) : Math.pow(2, 32-cidr) - 2;
  const toIP = n => [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  const maskIP = toIP(mask);
  document.getElementById('sub-out').innerHTML =
    `Network:    ${toIP(net)}/${cidr}\nSubnet Mask: ${maskIP}\nFirst Host:  ${toIP(net+1)}\nLast Host:   ${toIP(broad-1)}\nBroadcast:   ${toIP(broad)}\nTotal Hosts: ${hosts.toLocaleString()}`;
}

async function lookupIP() {
  const ip = document.getElementById('ip-input').value.trim();
  const el = document.getElementById('ip-out');
  el.textContent = 'Looking up...';
  try {
    const url = ip ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
    const res = await fetch(url);
    const d = await res.json();
    if (d.error) { el.textContent = 'Error: ' + d.reason; return; }
    el.textContent = `IP:       ${d.ip}\nCity:     ${d.city}\nRegion:   ${d.region}\nCountry:  ${d.country_name}\nISP:      ${d.org}\nTimezone: ${d.timezone}\nLatLng:   ${d.latitude}, ${d.longitude}`;
    Gamification.addXP(5, 'IP lookup performed');
  } catch { el.textContent = 'Lookup failed - check network'; }
}

function copyText(id) {
  const text = document.getElementById(id).textContent;
  navigator.clipboard.writeText(text).then(() => showToast('Copied!'));
}
function copyRaw(text) {
  navigator.clipboard.writeText(text).then(() => showToast(`Port ${text} copied`));
}
