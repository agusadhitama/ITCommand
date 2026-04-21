// ========== TICKETS MODULE ==========
const Tickets = {
  getAll() { return Storage.get('tickets', []); },
  save(tickets) { Storage.set('tickets', tickets); },

  add(data) {
    const tickets = this.getAll();
    const ticket = {
      id: 'TKT-' + String(tickets.length + 1).padStart(3, '0'),
      ...data,
      status: 'Open',
      createdAt: new Date().toLocaleDateString(),
      resolvedAt: null
    };
    tickets.unshift(ticket);
    this.save(tickets);
    Gamification.addXP(20, `Ticket created: ${ticket.id}`);
    if (tickets.length === 1) Gamification.unlockAchievement('first_ticket');
    updateBadge();
    return ticket;
  },

  updateStatus(id, status) {
    const tickets = this.getAll();
    const t = tickets.find(t => t.id === id);
    if (t) {
      t.status = status;
      if (status === 'Resolved') {
        t.resolvedAt = new Date().toLocaleDateString();
        Gamification.addXP(30, `Ticket resolved: ${id}`);
        const resolved = tickets.filter(t => t.status === 'Resolved').length;
        if (resolved === 10) Gamification.unlockAchievement('ticket_10');
        if (resolved === 50) Gamification.unlockAchievement('ticket_50');
      }
      this.save(tickets);
      updateBadge();
    }
  },

  delete(id) {
    const tickets = this.getAll().filter(t => t.id !== id);
    this.save(tickets);
    updateBadge();
  }
};

function updateBadge() {
  const open = Tickets.getAll().filter(t => t.status === 'Open').length;
  const badge = document.getElementById('badge-tickets');
  if (badge) { badge.textContent = open; badge.style.display = open > 0 ? '' : 'none'; }
}

function renderTickets() {
  const page = document.getElementById('page-tickets');
  const tickets = Tickets.getAll();
  const filter = Storage.get('ticket_filter', 'All');

  const filtered = filter === 'All' ? tickets : tickets.filter(t => t.status === filter);

  page.innerHTML = `
    <div class="section-header">
      <h2>🎫 Ticket Management</h2>
      <button class="btn btn-primary btn-sm" onclick="openTicketModal()">+ New Ticket</button>
    </div>
    <div class="flex-gap" style="margin-bottom:1rem">
      ${['All','Open','In Progress','Resolved'].map(s =>
        `<button class="btn btn-sm ${filter===s?'btn-primary':'btn-outline'}" onclick="setTicketFilter('${s}')">${s}</button>`
      ).join('')}
    </div>
    <div class="card">
      ${filtered.length === 0 ? `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-text">No tickets found</div></div>` : `
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Title</th><th>Priority</th><th>Status</th>
            <th>Category</th><th>Created</th><th>Actions</th>
          </tr></thead>
          <tbody>
            ${filtered.map(t => `
              <tr>
                <td class="mono" style="color:var(--accent)">${t.id}</td>
                <td>${t.title}</td>
                <td><span class="tag tag-${t.priority.toLowerCase()}">${t.priority}</span></td>
                <td><span class="tag tag-${t.status.toLowerCase().replace(' ','-')}">${t.status}</span></td>
                <td><span class="tag tag-info">${t.category}</span></td>
                <td style="color:var(--text-3)">${t.createdAt}</td>
                <td>
                  <div class="flex-gap">
                    ${t.status !== 'Resolved' ? `<button class="btn btn-xs btn-success" onclick="changeStatus('${t.id}','${t.status==='Open'?'In Progress':'Resolved'}')">
                      ${t.status==='Open'?'▶ Start':'✓ Resolve'}
                    </button>` : ''}
                    <button class="btn btn-xs btn-danger" onclick="deleteTicket('${t.id}')">✕</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`}
    </div>
  `;
}

function setTicketFilter(f) { Storage.set('ticket_filter', f); renderTickets(); }
function changeStatus(id, status) { Tickets.updateStatus(id, status); renderTickets(); }
function deleteTicket(id) { if (confirm('Delete this ticket?')) { Tickets.delete(id); renderTickets(); showToast('Ticket deleted'); } }

function openTicketModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-title">+ New Support Ticket</div>
      <div class="form-group">
        <label class="form-label">Title *</label>
        <input class="input" id="t-title" placeholder="Brief description of issue"/>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Priority</label>
          <select class="select" id="t-priority">
            <option>High</option><option selected>Medium</option><option>Low</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="select" id="t-category">
            <option>Hardware</option><option>Software</option><option>Network</option>
            <option>Account</option><option>Security</option><option>Other</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Requester</label>
        <input class="input" id="t-requester" placeholder="User's name"/>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="textarea" id="t-desc" placeholder="Detailed description..."></textarea>
      </div>
      <div class="modal-footer">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="submitTicket()">Create Ticket</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

function submitTicket() {
  const title = document.getElementById('t-title').value.trim();
  if (!title) { showToast('Title is required', 'danger'); return; }
  Tickets.add({
    title,
    priority: document.getElementById('t-priority').value,
    category: document.getElementById('t-category').value,
    requester: document.getElementById('t-requester').value || 'Unknown',
    description: document.getElementById('t-desc').value,
  });
  document.querySelector('.modal-overlay').remove();
  renderTickets();
  showToast('Ticket created!');
}
