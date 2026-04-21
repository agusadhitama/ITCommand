// ========== TROUBLESHOOT WIZARD ==========
const WIZARD_TREE = {
  id: 'root',
  q: 'What type of issue are you troubleshooting?',
  options: [
    {
      label: 'Internet / Network not working',
      next: {
        q: 'Is it affecting one device or all devices?',
        options: [
          {
            label: 'One device only',
            next: {
              q: 'What type of connection?',
              options: [
                {
                  label: 'WiFi',
                  solution: {
                    title: '📡 WiFi Single Device Fix',
                    steps: [
                      'Forget the WiFi network and reconnect',
                      'Disable & re-enable WiFi adapter',
                      'Update WiFi driver (Device Manager)',
                      'Run: ipconfig /release then ipconfig /renew',
                      'Check IP conflict — run: ipconfig /all',
                      'Try DNS 8.8.8.8 manually',
                      'Restart TCP/IP stack: netsh int ip reset',
                    ]
                  }
                },
                {
                  label: 'LAN / Ethernet',
                  solution: {
                    title: '🔌 LAN Single Device Fix',
                    steps: [
                      'Check cable — swap with known good cable',
                      'Try different switch/hub port',
                      'Disable & re-enable network adapter',
                      'Run: ipconfig /release → /renew',
                      'Check NIC link light (should be solid/blinking)',
                      'Ping gateway: ping 192.168.1.1',
                      'Update NIC driver',
                    ]
                  }
                }
              ]
            }
          },
          {
            label: 'All devices (whole network)',
            next: {
              q: 'Can you access the router admin page?',
              options: [
                {
                  label: 'Yes, router admin accessible',
                  solution: {
                    title: '🌐 ISP / WAN Issue',
                    steps: [
                      'Check WAN status in router admin',
                      'Restart modem (unplug 30 sec)',
                      'Restart router after modem',
                      'Check ISP status page or call ISP',
                      'Verify PPPoE credentials if applicable',
                      'Check if WAN IP is assigned',
                      'Test with another device tethered via 4G',
                    ]
                  }
                },
                {
                  label: 'No, router unreachable',
                  solution: {
                    title: '🔴 Router / Core Network Down',
                    steps: [
                      'Check router power — look for power LED',
                      'Hard reset router (hold reset 10s)',
                      'Connect PC directly to router via LAN',
                      'Check if DHCP is enabled on router',
                      'Default router IP: 192.168.1.1 or 192.168.0.1',
                      'Try factory reset if still unreachable',
                      'Replace router if hardware failure suspected',
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      label: 'Computer slow / freezing',
      next: {
        q: 'When does it happen?',
        options: [
          {
            label: 'Startup is very slow',
            solution: {
              title: '🐢 Slow Startup Fix',
              steps: [
                'Open Task Manager → Startup tab → disable unnecessary apps',
                'Run: msconfig → check boot options',
                'Check disk health: CrystalDiskInfo',
                'Defrag HDD (not SSD): Defragment & Optimize Drives',
                'Clean temp files: cleanmgr / CCleaner',
                'Check available RAM — minimum 4GB free recommended',
                'Scan for malware: Windows Defender full scan',
              ]
            }
          },
          {
            label: 'Slow during normal use',
            solution: {
              title: '⚙️ Performance Fix',
              steps: [
                'Check CPU/RAM usage: Task Manager → Performance tab',
                'Kill high-resource processes',
                'Check disk usage — if 100% disk, see known fix',
                'Run: sfc /scannow in CMD (as Admin)',
                'Clear browser cache and extensions',
                'Check for Windows Update stuck in background',
                'Increase virtual memory if RAM is low',
              ]
            }
          }
        ]
      }
    },
    {
      label: 'Cannot login / password issue',
      next: {
        q: 'What type of login?',
        options: [
          {
            label: 'Windows local account',
            solution: {
              title: '🔑 Windows Local Login Fix',
              steps: [
                'Try last known passwords',
                'Boot to Safe Mode - use Administrator account',
                'Use Windows Recovery: net user [username] [newpass]',
                'Check Caps Lock and keyboard layout',
                'Check if account is locked in Computer Management',
                'Create new admin account via recovery CMD',
              ]
            }
          },
          {
            label: 'Domain / Active Directory',
            solution: {
              title: '🏢 Domain Login Fix',
              steps: [
                'Check if PC is connected to network',
                'Ping domain controller: ping [domain-name]',
                'Check domain trust — rejoin domain if needed',
                'Reset password from Active Directory Users & Computers',
                'Unlock account in ADUC if locked',
                'Check event log on DC for Kerberos errors',
                'Force GP update: gpupdate /force',
              ]
            }
          }
        ]
      }
    },
    {
      label: 'Printer not working',
      next: {
        q: 'What is the issue?',
        options: [
          {
            label: 'Printer offline / not detected',
            solution: {
              title: '🖨️ Printer Offline Fix',
              steps: [
                'Check printer power and cable / WiFi',
                'Set printer as default: Control Panel → Devices',
                'Clear print queue: Services → Print Spooler → restart',
                'Remove and re-add printer',
                'Reinstall printer driver from manufacturer site',
                'Check if IP changed (network printers)',
                'Ping printer IP to test connectivity',
              ]
            }
          },
          {
            label: 'Prints blank or wrong output',
            solution: {
              title: '📄 Print Quality Fix',
              steps: [
                'Run printer head cleaning from printer utility',
                'Check ink/toner levels',
                'Try printing a test page from printer itself',
                'Check paper alignment and type settings',
                'Update / rollback printer driver',
                'Test with different application',
                'Check if print settings are correct (color vs B&W)',
              ]
            }
          }
        ]
      }
    }
  ]
};

let wizardPath = [];
let currentNode = WIZARD_TREE;

function renderWizard() {
  const page = document.getElementById('page-wizard');
  page.innerHTML = `
    <div class="section-header">
      <h2>🧠 Troubleshoot Wizard</h2>
      <button class="btn btn-outline btn-sm" onclick="resetWizard()">↺ Reset</button>
    </div>
    <div class="wizard-box">
      <div class="card">
        ${wizardPath.length ? `
          <div class="wizard-breadcrumb">
            ${wizardPath.map(p => `<span class="crumb">${p}</span>`).join('')}
          </div>` : ''}
        <div id="wizard-body"></div>
      </div>
    </div>`;
  renderWizardStep();
}

function renderWizardStep() {
  const body = document.getElementById('wizard-body');
  if (!body) return;

  if (currentNode.solution) {
    Gamification.unlockAchievement('wizard_used');
    body.innerHTML = `
      <div class="wizard-solution">
        <h3>✅ ${currentNode.solution.title}</h3>
        <ol class="wizard-steps">
          ${currentNode.solution.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>
      <div class="flex-gap" style="margin-top:1rem">
        <button class="btn btn-success btn-sm" onclick="wizardResolved()">✓ Issue Resolved</button>
        <button class="btn btn-outline btn-sm" onclick="resetWizard()">↺ Start Over</button>
      </div>`;
  } else {
    body.innerHTML = `
      <div class="wizard-question">${currentNode.q}</div>
      <div class="wizard-options">
        ${currentNode.options.map((opt, i) => `
          <div class="wizard-option" onclick="wizardChoose(${i})">
            ${opt.label}
          </div>`).join('')}
      </div>`;
  }
}

function wizardChoose(index) {
  const opt = currentNode.options[index];
  wizardPath.push(opt.label);
  currentNode = opt.next || { solution: opt.solution };
  if (!currentNode.q && !currentNode.solution && opt.solution) {
    currentNode = { solution: opt.solution };
  }
  renderWizard();
}

function resetWizard() {
  wizardPath = [];
  currentNode = WIZARD_TREE;
  renderWizard();
}

function wizardResolved() {
  Gamification.addXP(25, 'Issue resolved via Wizard');
  showToast('Great work! Issue resolved 🎉', 'success');
  resetWizard();
}
