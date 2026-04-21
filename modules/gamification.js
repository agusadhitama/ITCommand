// ========== GAMIFICATION MODULE ==========
const LEVELS = [
  { min: 0,    title: 'Helpdesk Rookie',   lv: 1 },
  { min: 100,  title: 'Cable Wrangler',     lv: 2 },
  { min: 250,  title: 'Ping Master',        lv: 3 },
  { min: 500,  title: 'Script Kiddie',      lv: 4 },
  { min: 800,  title: 'Net Ninja',          lv: 5 },
  { min: 1200, title: 'SysAdmin Pro',       lv: 6 },
  { min: 1800, title: 'Infra Wizard',       lv: 7 },
  { min: 2500, title: 'SysAdmin Legend',    lv: 8 },
];

const ACHIEVEMENTS = [
  { id: 'first_ticket',   icon: '🎫', name: 'First Ticket',    desc: 'Create your first ticket' },
  { id: 'ticket_10',      icon: '📦', name: '10 Tickets',       desc: 'Close 10 tickets' },
  { id: 'ticket_50',      icon: '🏆', name: '50 Tickets',       desc: 'Close 50 tickets' },
  { id: 'first_device',   icon: '💻', name: 'Inventory Init',   desc: 'Add first device' },
  { id: 'device_10',      icon: '🗄️',  name: 'Full Rack',        desc: 'Add 10 devices' },
  { id: 'wizard_used',    icon: '🧙', name: 'Wizard Activated', desc: 'Use troubleshoot wizard' },
  { id: 'analyzer_used',  icon: '🔬', name: 'Log Detective',    desc: 'Use log analyzer' },
  { id: 'kb_5',           icon: '📚', name: 'Scribe',           desc: 'Add 5 KB entries' },
];

const Gamification = {
  getXP() { return Storage.get('xp', 0); },
  getLevel() {
    const xp = this.getXP();
    let lvl = LEVELS[0];
    for (const l of LEVELS) { if (xp >= l.min) lvl = l; }
    return lvl;
  },
  getNextLevel() {
    const xp = this.getXP();
    const idx = LEVELS.findLastIndex(l => xp >= l.min);
    return LEVELS[idx + 1] || null;
  },
  addXP(amount, reason) {
    const xp = this.getXP() + amount;
    Storage.set('xp', xp);
    showToast(`+${amount} XP - ${reason}`, 'success');
    this.updateUI();
    this.logActivity(reason, amount);
  },
  updateUI() {
    const xp = this.getXP();
    const lvl = this.getLevel();
    const next = this.getNextLevel();
    const pct = next ? Math.min(100, ((xp - lvl.min) / (next.min - lvl.min)) * 100) : 100;
    document.getElementById('xp-value').textContent = xp;
    document.getElementById('xp-fill').style.width = pct + '%';
    document.getElementById('level-badge').textContent = `Lv.${lvl.lv}`;
  },
  unlockAchievement(id) {
    const unlocked = Storage.get('achievements', []);
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      Storage.set('achievements', unlocked);
      const ach = ACHIEVEMENTS.find(a => a.id === id);
      if (ach) {
        showToast(`🏅 Achievement: ${ach.name}`, 'success');
        this.addXP(50, `Achievement unlocked: ${ach.name}`);
      }
    }
  },
  isUnlocked(id) { return Storage.get('achievements', []).includes(id); },
  logActivity(msg, xp = 0) {
    const logs = Storage.get('activity_log', []);
    logs.unshift({ time: new Date().toLocaleTimeString(), msg, xp });
    if (logs.length > 50) logs.pop();
    Storage.set('activity_log', logs);
  }
};
