// ========== KNOWLEDGE BASE MODULE ==========
const KB = {
  getAll() { return Storage.get('kb_entries', []); },
  add(data) {
    const entries = this.getAll();
    const entry = { id: 'KB-' + Date.now(), ...data, createdAt: new Date().toLocaleDateString() };
    entries.unshift(entry);
    Storage.set('kb_entries', entries);
    Gamification.addXP(15, `KB entry added: ${entry.title}`);
    if (entries.length === 5) Gamification.unlockAchievement('kb_5');
    return entry;
  },
  delete(id) { Storage.set('kb_entries', this.getAll().filter(e => e.id !== id)); },
  update(id, data) {
    const entries = this.getAll();
    const i = entries.findIndex(e => e.id === id);
    if (i > -1) { entries[i] = { ...entries[i], ...data }; Storage.set('kb_entries', entries); }
  }
};

const KB_CATEGORIES = ['Network','Windows','Hardware','Security','Software','Server','Other'];

function renderKB() {
  const page = document.getElementById('page-kb');
  const entries = KB.getAll();
  const search = Storage.get('kb_search', '');
  const catFilter = Storage.get('kb_cat', 'All');

  let filtered = entries;
  if (search) filtered = filtered.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.content.toLowerCase().includes(search.toLowerCase())
  );
  if (catFilter !== 'All') filtered = filtered.filter(e => e.category === catFilter);

  page.innerHTML = `
    <div class="section-header">
      <h2>📚 Knowledge Base</h2>
      <button class="btn btn-primary btn-sm" onclick="openKBModal()">+ New Entry</button>
    </div>
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input placeholder="Search knowledge base..." value="${search}"
        oninput="Storage.set('kb_search',this.value);renderKB()"/>
    </div>
    <div class="flex-gap" style="margin-bottom:1rem">
      ${['All',...KB_CATEGORIES].map(c =>
        `<button class="btn btn-xs ${catFilter===c?'btn-primary':'btn-outline'}" onclick="Storage.set('kb_cat','${c}');renderKB()">${c}</button>`
      ).join('')}
    </div>
    ${filtered.length === 0 ? `
      <div class="empty-state"><div class="empty-icon">📖</div>
      <div class="empty-text">${entries.length === 0 ? 'No entries yet. Add your first SOP!' : 'No results found'}</div></div>
    ` : `
      <div>
        ${filtered.map(e => `
          <div class="kb-item" onclick="viewKBEntry('${e.id}')">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <div class="kb-item-title">${e.title}</div>
                <div class="kb-item-preview">${e.content.substring(0,100)}${e.content.length>100?'...':''}</div>
              </div>
              <div style="display:flex;gap:0.4rem;flex-shrink:0;margin-left:1rem">
                <span class="tag tag-info">${e.category}</span>
                <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();deleteKBEntry('${e.id}')">✕</button>
              </div>
            </div>
            <div style="font-size:0.68rem;color:var(--text-3);margin-top:0.5rem;font-family:var(--font-mono)">${e.createdAt}</div>
          </div>`).join('')}
      </div>`}`;
}

function viewKBEntry(id) {
  const entry = KB.getAll().find(e => e.id === id);
  if (!entry) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal" style="max-width:640px">
    <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:1rem">
      <div class="modal-title" style="margin:0">${entry.title}</div>
      <span class="tag tag-info">${entry.category}</span>
    </div>
    <div class="kb-detail"><pre>${entry.content}</pre></div>
    <div class="modal-footer">
      <button class="btn btn-outline btn-sm" onclick="copyRawText('${id}')">📋 Copy</button>
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Close</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  window._currentKBId = id;
}

function copyRawText(id) {
  const entry = KB.getAll().find(e => e.id === id);
  if (entry) navigator.clipboard.writeText(entry.content).then(() => showToast('Copied!'));
}

function deleteKBEntry(id) {
  if (confirm('Delete this entry?')) { KB.delete(id); renderKB(); showToast('Entry deleted'); }
}

function openKBModal(existing = null) {
  const e = existing || {};
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal" style="max-width:600px">
    <div class="modal-title">+ New Knowledge Base Entry</div>
    <div class="form-group">
      <label class="form-label">Title *</label>
      <input class="input" id="kb-title" value="${e.title||''}" placeholder="e.g. How to reset AD password"/>
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="select" id="kb-cat">
        ${KB_CATEGORIES.map(c => `<option ${(e.category||'Other')===c?'selected':''}>${c}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Content / SOP Steps *</label>
      <textarea class="textarea" id="kb-content" style="min-height:160px;font-family:var(--font-mono);font-size:0.78rem"
        placeholder="Write your SOP, commands, steps, or notes here...">${e.content||''}</textarea>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
      <button class="btn btn-primary" onclick="submitKBEntry()">Save Entry</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function submitKBEntry() {
  const title = document.getElementById('kb-title').value.trim();
  const content = document.getElementById('kb-content').value.trim();
  if (!title || !content) { showToast('Title and content are required', 'danger'); return; }
  KB.add({ title, category: document.getElementById('kb-cat').value, content });
  document.querySelector('.modal-overlay').remove();
  renderKB(); showToast('KB entry saved!');
}
