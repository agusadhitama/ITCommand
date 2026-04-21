// ========== INVENTORY MODULE ==========
const Inventory = {
  getAll() { return Storage.get('devices', []); },
  save(d) { Storage.set('devices', d); },
  add(data) {
    const devices = this.getAll();
    const device = { id: 'DEV-' + Date.now(), ...data, addedAt: new Date().toLocaleDateString() };
    devices.unshift(device);
    this.save(devices);
    Gamification.addXP(15, `Device added: ${device.name}`);
    if (devices.length === 1) Gamification.unlockAchievement('first_device');
    if (devices.length === 10) Gamification.unlockAchievement('device_10');
    return device;
  },
  delete(id) { this.save(this.getAll().filter(d => d.id !== id)); },
  update(id, data) {
    const devices = this.getAll();
    const i = devices.findIndex(d => d.id === id);
    if (i > -1) { devices[i] = { ...devices[i], ...data }; this.save(devices); }
  }
};

function renderInventory() {
  const page = document.getElementById('page-inventory');
  const devices = Inventory.getAll();
  const search = Storage.get('inv_search', '');
  const filtered = search ? devices.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase()) ||
    (d.assignedTo || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.serial || '').toLowerCase().includes(search.toLowerCase())
  ) : devices;

  const typeIcon = { Laptop:'💻', Desktop:'🖥️', Printer:'🖨️', Router:'📡', Switch:'🔌', Server:'🗄️', Monitor:'🖥️', Other:'📦' };

  page.innerHTML = `
    <div class="section-header">
      <h2>🗃️ Device Inventory</h2>
      <div class="flex-gap">
        <button class="btn btn-outline btn-sm" onclick="exportDevicesCSV()">⬇ Export CSV</button>
        <button class="btn btn-primary btn-sm" onclick="openDeviceModal()">+ Add Device</button>
      </div>
    </div>
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input placeholder="Search by name, type, user, serial..." value="${search}"
        oninput="Storage.set('inv_search',this.value);renderInventory()"/>
    </div>
    <div style="margin-bottom:0.75rem;font-size:0.75rem;color:var(--text-3);font-family:var(--font-mono)">
      Total: ${devices.length} devices &nbsp;|&nbsp; Shown: ${filtered.length}
    </div>
    <div class="card">
      ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-icon">🖥️</div><div class="empty-text">No devices found</div></div>` : `
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Device</th><th>Type</th><th>Serial No.</th><th>IP Address</th>
            <th>Assigned To</th><th>Location</th><th>Condition</th><th>Added</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${filtered.map(d => `<tr>
              <td><strong style="color:var(--text-1)">${typeIcon[d.type]||'📦'} ${d.name}</strong></td>
              <td><span class="tag tag-info">${d.type}</span></td>
              <td class="mono" style="font-size:0.75rem;color:var(--text-3)">${d.serial || '-'}</td>
              <td class="mono" style="color:var(--accent)">${d.ip || '-'}</td>
              <td>${d.assignedTo || '-'}</td>
              <td>${d.location || '-'}</td>
              <td><span class="tag ${d.condition==='Good'?'tag-resolved':d.condition==='Fair'?'tag-progress':'tag-high'}">${d.condition||'Good'}</span></td>
              <td style="color:var(--text-3)">${d.addedAt}</td>
              <td>
                <div class="flex-gap">
                  <button class="btn btn-xs btn-outline" onclick="viewDevice('${d.id}')">👁</button>
                  <button class="btn btn-xs btn-danger" onclick="deleteDevice('${d.id}')">✕</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`}
    </div>`;
}

function deleteDevice(id) {
  if (confirm('Remove this device?')) { Inventory.delete(id); renderInventory(); showToast('Device removed'); }
}

function viewDevice(id) {
  const d = Inventory.getAll().find(d => d.id === id);
  if (!d) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal">
    <div class="modal-title">📋 ${d.name}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.82rem">
      ${[['ID',d.id],['Type',d.type],['Serial',d.serial||'-'],['IP',d.ip||'-'],
         ['Assigned To',d.assignedTo||'-'],['Location',d.location||'-'],
         ['Condition',d.condition||'Good'],['Added',d.addedAt],['Notes',d.notes||'-']].map(([k,v])=>
        `<div><span style="color:var(--text-3);font-family:var(--font-mono);font-size:0.7rem">${k}</span><br>
         <span style="color:var(--text-1)">${v}</span></div>`
      ).join('')}
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function exportDevicesCSV() {
  const devices = Inventory.getAll();
  if (!devices.length) { showToast('No devices to export', 'warn'); return; }
  const headers = ['ID','Name','Type','Serial','IP','Assigned To','Location','Condition','Added'];
  const rows = devices.map(d => [d.id,d.name,d.type,d.serial||'',d.ip||'',d.assignedTo||'',d.location||'',d.condition||'Good',d.addedAt]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv,' + encodeURIComponent(csv);
  a.download = 'devices_export.csv'; a.click();
  showToast('CSV exported!');
}

function openDeviceModal(existing = null) {
  const d = existing || {};
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal">
    <div class="modal-title">${existing ? '✏️ Edit' : '+ Add'} Device</div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Device Name *</label>
        <input class="input" id="d-name" value="${d.name||''}" placeholder="e.g. LAPTOP-JOHN01"/>
      </div>
      <div class="form-group">
        <label class="form-label">Type</label>
        <select class="select" id="d-type">
          ${['Laptop','Desktop','Printer','Router','Switch','Server','Monitor','Other'].map(t =>
            `<option ${d.type===t?'selected':''}>${t}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Serial Number</label>
        <input class="input" id="d-serial" value="${d.serial||''}" placeholder="SN-XXXXXXX"/>
      </div>
      <div class="form-group">
        <label class="form-label">IP Address</label>
        <input class="input" id="d-ip" value="${d.ip||''}" placeholder="192.168.1.X"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Assigned To</label>
        <input class="input" id="d-user" value="${d.assignedTo||''}" placeholder="User name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Location</label>
        <input class="input" id="d-loc" value="${d.location||''}" placeholder="Room / Floor"/>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Condition</label>
        <select class="select" id="d-cond">
          ${['Good','Fair','Needs Repair','Decommissioned'].map(c =>
            `<option ${(d.condition||'Good')===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Notes</label>
      <textarea class="textarea" id="d-notes" style="min-height:70px" placeholder="Additional notes...">${d.notes||''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" onclick="submitDevice()">Save Device</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function submitDevice() {
  const name = document.getElementById('d-name').value.trim();
  if (!name) { showToast('Device name required', 'danger'); return; }
  Inventory.add({
    name,
    type: document.getElementById('d-type').value,
    serial: document.getElementById('d-serial').value,
    ip: document.getElementById('d-ip').value,
    assignedTo: document.getElementById('d-user').value,
    location: document.getElementById('d-loc').value,
    condition: document.getElementById('d-cond').value,
    notes: document.getElementById('d-notes').value,
  });
  document.querySelector('.modal-overlay').remove();
  renderInventory(); showToast('Device added!');
}
