# ITCommand Center

> All-in-One IT Support Dashboard. Built with pure HTML, CSS, and vanilla JavaScript.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Live Demo
[KLIK DISINI BOI](https://agusadhitama.github.io/ITCommand/)

## ✨ Features

| Module | Description |
|--------|-------------|
| 🎫 **Ticket Management** | Create, track, and resolve IT support tickets with priorities and categories |
| 🗃️ **Device Inventory** | Track all company devices with serial numbers, IPs, and assignments |
| 🧠 **Troubleshoot Wizard** | Interactive decision-tree for guided troubleshooting |
| 🤖 **Log Analyzer** | Paste error logs and get instant pattern-based diagnostics |
| 🛠️ **Quick Tools** | Password gen, Base64, Subnet Calculator, IP Lookup, Port Reference |
| 📚 **Knowledge Base** | Personal SOP documentation with search and categories |
| 🎮 **Gamification** | XP system, levels, achievements. Make IT work fun! |

## 📦 Tech Stack
- Pure HTML5, CSS3, Vanilla JavaScript
- Zero dependencies, zero frameworks
- Data stored in `localStorage`
- Google Fonts (Share Tech Mono + Exo 2)

## 🗂️ Project Structure
```
ITCommand/
├── index.html          # Main entry point
├── style.css           # All styles
├── app.js              # App init, navigation, boot sequence
└── modules/
    ├── storage.js      # localStorage wrapper
    ├── gamification.js # XP, levels, achievements
    ├── tickets.js      # Ticket CRUD + render
    ├── inventory.js    # Device inventory + CSV export
    ├── wizard.js       # Troubleshoot decision tree
    ├── analyzer.js     # Log pattern analyzer
    ├── tools.js        # Quick IT tools
    ├── kb.js           # Knowledge base
    ├── dashboard.js    # Dashboard overview
    └── profile.js      # User profile + activity log
```

## 🛠️ Local Development
Just open `index.html` in your browser no build step needed!

## 📝 License
MIT - free to use and modify.
