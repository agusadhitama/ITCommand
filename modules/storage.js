// ========== STORAGE MODULE ==========
const Storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem('itcmd_' + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('itcmd_' + key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  push(key, item) {
    const arr = this.get(key, []);
    arr.push(item);
    return this.set(key, arr);
  }
};
