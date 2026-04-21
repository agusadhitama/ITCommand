// ========== LOG ANALYZER MODULE ==========
const LOG_PATTERNS = [
  { regex: /DHCP.*fail|no ip address|169\.254\./i, type:'error', msg:'🔴 DHCP failure detected - check DHCP server or connection' },
  { regex: /dns.*fail|dns.*timeout|could not resolve/i, type:'error', msg:'🔴 DNS resolution failure - check DNS server config' },
  { regex: /access.?denied|permission.?denied|privilege/i, type:'warn', msg:'🟡 Permission/access denied - check user rights or ACL' },
  { regex: /connection.?refused|connection.?reset|ECONNREFUSED/i, type:'error', msg:'🔴 Connection refused - target service may be down or port blocked' },
  { regex: /timeout|timed.?out|request.?timeout/i, type:'warn', msg:'🟡 Timeout detected - check network latency or server load' },
  { regex: /disk.?full|no.?space.?left|out.?of.?disk/i, type:'error', msg:'🔴 Disk full - free up space immediately' },
  { regex: /memory.*leak|out.?of.?memory|memory.*critical/i, type:'error', msg:'🔴 Memory issue - check running processes' },
  { regex: /0x[0-9A-Fa-f]{8}|bsod|blue.?screen|system.*crash/i, type:'error', msg:'🔴 System crash / BSOD code detected - check minidump' },
  { regex: /certificate.*expire|ssl.*error|certificate.*invalid/i, type:'warn', msg:'🟡 SSL/TLS certificate issue - check cert validity' },
  { regex: /authentication.*fail|invalid.?password|auth.?error/i, type:'warn', msg:'🟡 Authentication failure - wrong credentials or locked account' },
  { regex: /firewall.*block|port.?\d+.*block|packet.?drop/i, type:'warn', msg:'🟡 Firewall blocking traffic - review firewall rules' },
  { regex: /virus|malware|trojan|ransomware|infected/i, type:'error', msg:'🔴 SECURITY THREAT detected - isolate system immediately!' },
  { regex: /disk.*error|bad.*sector|read.*error.*drive/i, type:'error', msg:'🔴 Disk hardware error - back up data and check SMART status' },
  { regex: /driver.*fail|device.*not.?found|missing.*driver/i, type:'warn', msg:'🟡 Driver issue - update or reinstall driver' },
  { regex: /cpu.*\d{2,3}%|high.?cpu|cpu.*overload/i, type:'warn', msg:'🟡 High CPU usage - check processes with Task Manager' },
  { regex: /warning/i, type:'warn', msg:'🟡 Warning entry found' },
  { regex: /error|fail|critical/i, type:'error', msg:'🔴 Error/failure keyword detected' },
  { regex: /success|connected|ok|ready|started/i, type:'ok', msg:'🟢 Success/healthy state detected' },
];

function renderAnalyzer() {
  const page = document.getElementById('page-analyzer');
  page.innerHTML = `
    <div class="section-header">
      <h2>🤖 Log Analyzer</h2>
    </div>
    <div class="grid-2" style="gap:1.25rem">
      <div>
        <div class="card">
          <div class="card-title">Paste Log / Error Message</div>
          <textarea class="textarea" id="log-input" style="min-height:220px;font-family:var(--font-mono);font-size:0.78rem"
            placeholder="Paste your error message, event log, or command output here...&#10;&#10;Example:&#10;DHCP request failed: no response from server&#10;DNS timeout for host google.com&#10;Authentication failed for user admin@domain.com"></textarea>
          <div class="flex-gap" style="margin-top:0.75rem">
            <button class="btn btn-primary" onclick="analyzeLog()">🔬 Analyze</button>
            <button class="btn btn-outline" onclick="document.getElementById('log-input').value='';document.getElementById('log-output').innerHTML='';document.getElementById('log-summary').innerHTML=''">Clear</button>
            <button class="btn btn-outline btn-sm" onclick="loadSampleLog()">Load Sample</button>
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-title">Analysis Results</div>
          <div id="log-summary" style="margin-bottom:0.75rem"></div>
          <div class="analyzer-output" id="log-output">
            <span style="color:var(--text-3)">// Results will appear here after analysis...</span>
          </div>
        </div>
      </div>
    </div>
    <div class="card mt-2">
      <div class="card-title">Common Error Patterns Reference</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;font-size:0.75rem">
        ${[
          ['DHCP fail / 169.254.x.x','IP address not assigned'],
          ['DNS timeout','Cannot resolve hostnames'],
          ['Access denied','Permission or ACL issue'],
          ['Connection refused','Service down or port blocked'],
          ['0x8xxxxxxx','Windows error code'],
          ['Certificate expired','SSL/TLS cert invalid'],
        ].map(([k,v]) => `
          <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:5px;padding:0.6rem">
            <div class="mono" style="color:var(--accent);font-size:0.7rem">${k}</div>
            <div style="color:var(--text-3);margin-top:0.2rem">${v}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

function analyzeLog() {
  const input = document.getElementById('log-input').value.trim();
  if (!input) { showToast('Paste a log first!', 'warn'); return; }

  Gamification.unlockAchievement('analyzer_used');

  const lines = input.split('\n');
  const findings = [];
  let errors = 0, warns = 0, oks = 0;

  const outputEl = document.getElementById('log-output');
  const summaryEl = document.getElementById('log-summary');

  let html = '';
  lines.forEach(line => {
    if (!line.trim()) return;
    let matched = false;
    for (const p of LOG_PATTERNS) {
      if (p.regex.test(line)) {
        const cls = p.type === 'error' ? 'log-error' : p.type === 'warn' ? 'log-warn' : 'log-ok';
        const highlighted = line.replace(p.regex, m => `<span class="log-match">${m}</span>`);
        html += `<span class="log-line ${cls}"> ${line.length > 80 ? line.substring(0,80)+'...' : highlighted}</span>`;
        if (!findings.includes(p.msg)) {
          findings.push(p.msg);
          if (p.type === 'error') errors++;
          else if (p.type === 'warn') warns++;
          else oks++;
        }
        matched = true;
        break;
      }
    }
    if (!matched) {
      html += `<span class="log-line" style="color:var(--text-3)">${line.substring(0,100)}</span>`;
    }
  });

  outputEl.innerHTML = html || '<span style="color:var(--text-3)">No patterns detected</span>';

  if (findings.length) {
    const total = errors + warns + oks;
    summaryEl.innerHTML = `
      <div style="display:flex;gap:0.5rem;margin-bottom:0.75rem;flex-wrap:wrap">
        <span class="tag tag-high">${errors} Error${errors!==1?'s':''}</span>
        <span class="tag tag-progress">${warns} Warning${warns!==1?'s':''}</span>
        <span class="tag tag-resolved">${oks} OK</span>
        <span class="tag tag-info">${findings.length} Pattern${findings.length!==1?'s':''} Found</span>
      </div>
      <div style="background:var(--bg-base);border:1px solid var(--border);border-radius:6px;padding:0.75rem;font-size:0.8rem">
        <div style="font-size:0.68rem;color:var(--text-3);font-family:var(--font-mono);margin-bottom:0.5rem">// RECOMMENDATIONS</div>
        ${findings.map(f => `<div style="padding:0.25rem 0;border-bottom:1px solid rgba(30,45,74,0.4)">${f}</div>`).join('')}
      </div>`;
    Gamification.addXP(10, 'Log analyzed');
  } else {
    summaryEl.innerHTML = `<span class="tag tag-resolved">✓ No known issues detected</span>`;
  }
}

function loadSampleLog() {
  document.getElementById('log-input').value = `[2024-01-15 08:32:11] DHCP request failed: no response from server 192.168.1.1
[2024-01-15 08:32:12] Assigned APIPA address: 169.254.22.10
[2024-01-15 08:32:15] DNS timeout for host: google.com
[2024-01-15 08:33:01] Authentication failed for user: jdoe@company.local
[2024-01-15 08:33:05] Access denied: C:\\Windows\\System32\\config
[2024-01-15 08:35:22] Service 'Print Spooler' started successfully
[2024-01-15 08:36:01] Connection refused on port 443 to 10.0.0.5
[2024-01-15 08:40:15] SSL Certificate error: certificate has expired`;
}
