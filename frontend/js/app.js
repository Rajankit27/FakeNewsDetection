// --- Configuration ---
const API_BASE = '';

// --- Auth State ---
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username');

// --- Initialization ---
function initAuth() {
    // If logged in, redirect
    if (token) {
        // If sidebar exists (dashboard page), don't redirect. Else go to dashboard.
        if (document.querySelector('aside')) {
            // Already in dashboard
        } else {
            window.location.href = role === 'admin' ? 'admin.html' : 'dashboard.html';
        }
    }

    const form = document.getElementById('authForm');
    const toggle = document.getElementById('toggleMode');
    let isRegister = false;

    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent accidental form submit behavior
            isRegister = !isRegister;
            document.querySelector('button[type="submit"]').textContent = isRegister ? "Register Agent" : "Authenticate";
            toggle.textContent = isRegister ? "Return to Login" : "Initialize New Protocol (Register)";
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        const msg = document.getElementById('msg');

        msg.classList.add('hidden');

        const endpoint = isRegister ? '/auth/register' : '/auth/login';

        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user, password: pass })
            });

            const data = await res.json();

            if (res.ok) {
                if (isRegister) {
                    msg.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3"></i> <span>Registration successful. Please login.</span>';

                    // Reset classes
                    msg.className = 'text-xs mt-4 text-center font-medium py-2 rounded-lg border flex items-center justify-center gap-2';
                    // Add Success classes
                    msg.classList.add('text-green-400', 'bg-green-500/10', 'border-green-500/20');

                    // Toggle back to login
                    isRegister = false;
                    toggle.click();
                    if (window.lucide) lucide.createIcons();
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('username', data.username);
                    window.location.href = data.role === 'admin' ? 'admin.html' : 'dashboard.html';
                }
            } else {
                if (res.status === 401 || res.status === 422) {
                    logout(); // Auto logout on auth fail
                    return;
                }
                throw new Error(data.msg);
            }
        } catch (err) {
            msg.innerHTML = `<i data-lucide="alert-circle" class="w-3 h-3"></i> <span>${err.message}</span>`;

            // Reset classes
            msg.className = 'text-xs mt-4 text-center font-medium py-2 rounded-lg border flex items-center justify-center gap-2';
            // Add Error classes
            msg.classList.add('text-red-400', 'bg-red-500/10', 'border-red-500/20');

            if (window.lucide) lucide.createIcons();
        }
    });
}

function initDashboard() {
    if (!token) window.location.href = 'index.html';
    document.getElementById('userGreeting').textContent = `${username}`;

    // Set view to default
    // For now we only have one view in this SPA-like dashboard file, 
    // but sidebar buttons call setView. We can implement basic toggle or simple alert for now.

    // Load History
    loadHistory();

    // Load News Ticker
    initNewsTicker();

    // Init Charts
    initCharts();

    // Init Search
    initSearch();
}

// Init Header Interactions
initHeaderInteractions();

// Load Settings
loadSettings();

function initHeaderInteractions() {
    const notifyBtn = document.getElementById('notifyBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    if (notifyBtn) {
        notifyBtn.addEventListener('click', () => {
            // Simple toast simulation
            const original = notifyBtn.innerHTML;
            notifyBtn.innerHTML = `<i data-lucide="check" class="w-5 h-5 text-green-400"></i>`;
            lucide.createIcons();
            setTimeout(() => {
                notifyBtn.innerHTML = original;
                lucide.createIcons();
            }, 2000);
        });
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            toggleSettingsModal();
        });
    }
}

function toggleSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (sidebar.classList.contains('-translate-x-full')) {
        // Open
        sidebar.classList.remove('-translate-x-full');
        backdrop.classList.remove('hidden');
        // Re-initialize icons just in case
        if (window.lucide) lucide.createIcons();
    } else {
        // Close
        sidebar.classList.add('-translate-x-full');
        backdrop.classList.add('hidden');
    }
}

function loadSettings() {
    // Load saved settings
    const notify = localStorage.getItem('setting_notify');
    const saver = localStorage.getItem('setting_saver');

    const notifyInput = document.getElementById('settingNotify');
    const saverInput = document.getElementById('settingsaver');

    if (notifyInput) {
        if (notify !== null) notifyInput.checked = notify === 'true';
        notifyInput.addEventListener('change', (e) => localStorage.setItem('setting_notify', e.target.checked));
    }

    if (saverInput) {
        if (saver !== null) saverInput.checked = saver === 'true';
        saverInput.addEventListener('change', (e) => localStorage.setItem('setting_saver', e.target.checked));
    }
}

let scanChartInstance = null;
let confChartInstance = null;

function initCharts() {
    // 1. Total Scans Chart (Sparkline)
    const ctxScan = document.getElementById('scanChart').getContext('2d');

    // Mock Data for sparkle
    const dataPoints = [12, 19, 15, 25, 22, 30, 28, 35, 40, 45, 42, 50];

    scanChartInstance = new Chart(ctxScan, {
        type: 'line',
        data: {
            labels: dataPoints.map((_, i) => i),
            datasets: [{
                data: dataPoints,
                borderColor: '#0284C7',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            scales: { x: { display: false }, y: { display: false } }
        }
    });

    // 2. Confidence Meter (Doughnut)
    const ctxConf = document.getElementById('confidenceChart').getContext('2d');
    confChartInstance = new Chart(ctxConf, {
        type: 'doughnut',
        data: {
            labels: ['Confidence', 'Remaining'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#0284C7', 'rgba(0, 0, 0, 0.05)'],
                borderWidth: 0,
                cutout: '75%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { enabled: false } }
        }
    });
}

function updateConfChart(value, isReal) {
    if (confChartInstance) {
        confChartInstance.data.datasets[0].data = [value, 100 - value];
        confChartInstance.data.datasets[0].backgroundColor = [
            isReal ? '#0284C7' : '#DC2626',
            'rgba(0, 0, 0, 0.05)'
        ];
        confChartInstance.update();
    }
}

function initSearch() {
    const searchInput = document.getElementById('feedSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const items = document.querySelectorAll('#historyList > div');

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(term)) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    }
}

function initAdmin() {
    if (!token || role !== 'admin') window.location.href = 'index.html';
    loadAdminStats();
    loadDisputes();
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}


// --- Dashboard Logic ---

function setView(view) {
    // 1. Update UI (Active State)
    document.querySelectorAll('.sidebar-link').forEach(btn => {
        // Check if this button controls the requested view
        if (btn.getAttribute('onclick').includes(`('${view}')`)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Handle Navigation / Scrolling
    switch (view) {
        case 'admin':
            if (role === 'admin') window.location.href = 'admin.html';
            else alert("Authentication Failed: Admin clearance required.");
            break;
        case 'analyze':
            const terminal = document.getElementById('newsInput');
            if (terminal) {
                terminal.scrollIntoView({ behavior: 'smooth', block: 'center' });
                terminal.focus();
            }
            break;
        case 'history':
            const history = document.getElementById('historyList');
            if (history) {
                // Determine container to scroll if needed, or just scroll entry into view
                // Since layout is strict app-shell now, we might need to rely on the user scrolling or focus
                // But let's try generic scrollIntoView on the panel parent
                history.closest('.glass-panel').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            break;
        case 'dashboard':
        default:
            // Scroll to top or reset
            window.scrollTo({ top: 0, behavior: 'smooth' });
            break;
    }
}

let currentMode = 'text';

function setMode(mode) {
    currentMode = mode;
    // UI Update
    // UI Update (Buttons)
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    // (Optional: highlight current mode if we had mode-specific links)

    // Tab Styling in Command Center
    const tabs = ['text', 'global', 'url'];
    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        if (t === mode) {
            btn.className = "px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white shadow transition";
        } else {
            btn.className = "px-3 py-1 text-xs font-medium rounded text-slate-400 hover:text-white transition";
        }
    });

    const input = document.getElementById('newsInput');
    if (mode === 'text') input.placeholder = "> Awaiting input stream for verification...";
    else if (mode === 'url') input.placeholder = "> Enter Target URL for Deep Scan...";
    else if (mode === 'global') input.placeholder = "> Enter Query Parameters for Global Monitoring...";
}

async function analyze() {
    const input = document.getElementById('newsInput').value;
    const btn = document.getElementById('analyzeBtn');
    const spinner = document.getElementById('spinner');

    if (!input) return;

    btn.disabled = true;
    spinner.classList.remove('hidden');

    let endpoint = '/api/predict';
    let payload = { text: input };

    if (currentMode === 'global') {
        endpoint = '/api/predict-from-api';
        payload = { query: input };
    } else if (currentMode === 'url') {
        endpoint = '/api/predict-from-url';
        payload = { url: input };
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (res.status === 401 || res.status === 422) {
            logout();
            return;
        }

        const data = await res.json();

        if (!res.ok) throw new Error(data.msg || "Request Failed");

        if (currentMode === 'global') {
            const resultCount = data.results ? data.results.length : 0;
            // Render Global Results with Synthesis
            renderGlobalResults(data.results || [], data.synthesis);
            document.getElementById('resultCard').classList.remove('hidden'); // Unhide parent container
            document.getElementById('xaiSection').classList.add('hidden');
            document.getElementById('globalResults').classList.remove('hidden');

            document.getElementById('resultTitle').textContent = "Global Intelligence Report";
            document.getElementById('resultDesc').textContent = `Found ${resultCount} relevant sources`;
            document.getElementById('confScore').textContent = "--";

        } else {
            document.getElementById('globalResults').classList.add('hidden');
            document.getElementById('resultCard').classList.remove('hidden'); // Unhide parent container for text analysis

            // Standard Single Result
            const isReal = data.prediction === 'REAL';

            // Title & Desc
            document.getElementById('resultTitle').textContent = data.display_status;
            document.getElementById('resultDesc').textContent = data.note;
            document.getElementById('resultTitle').className = `text-2xl font-bold mb-1 ${isReal ? 'text-teal-400' : 'text-red-400'}`;

            // Status Bar
            document.getElementById('statusIndicator').className = `h-1 w-full ${isReal ? 'bg-teal-500' : 'bg-red-500'}`;

            // Confidence
            const conf = Math.round(data.confidence);
            document.getElementById('confScore').textContent = `${conf}%`;
            document.getElementById('confScore').className = `text-3xl font-bold ${isReal ? 'text-teal-400' : 'text-red-400'} mr-3`;

            // Update Chart
            updateConfChart(conf, isReal);

            // AI Reasoning Section
            const dynamicContent = document.getElementById('dynamicContent');
            // Clear previous global results or old content
            const xaiSection = document.getElementById('xaiSection');

            // Insert Reasoning Block
            let reasoningHtml = `
                <div id="reasoningBlock" class="mb-6 relative overflow-hidden rounded-xl border border-sky-200 bg-sky-50 shadow-lg shadow-sky-500/10">
                    <div class="absolute inset-0 bg-gradient-to-r from-sky-500/5 to-teal-500/5 pointer-events-none"></div>
                    <div class="p-5 relative z-10">
                        <div class="flex items-center mb-3">
                             <div class="p-1.5 bg-sky-500/10 rounded-lg mr-3">
                                 <i data-lucide="brain-circuit" class="w-5 h-5 text-sky-600"></i>
                             </div>
                             <h4 class="text-xs font-bold text-sky-700 uppercase tracking-widest">AI Insight & Analysis</h4>
                        </div>
                        <p class="text-base text-slate-700 leading-relaxed font-medium">
                            ${data.reasoning || "Analysis complete. Integrity verified against known linguistic patterns."}
                        </p>
                    </div>
                </div>

                <!-- Feedback Section -->
                <div id="feedbackSection" class="mb-6 flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                    <span class="text-sm text-slate-400">Do you agree with this analysis?</span>
                    <div class="flex space-x-3">
                        <button onclick="sendFeedback(true)" class="flex items-center space-x-2 px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/20 transition text-xs font-bold uppercase tracking-wider">
                            <i data-lucide="thumbs-up" class="w-4 h-4"></i> <span>Agree</span>
                        </button>
                        <button onclick="sendFeedback(false)" class="flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition text-xs font-bold uppercase tracking-wider">
                            <i data-lucide="thumbs-down" class="w-4 h-4"></i> <span>Disagree</span>
                        </button>
                    </div>
                </div>
            `;

            // Clean up old reasoning block if exists
            const oldReasoning = document.getElementById('reasoningBlock');
            if (oldReasoning) oldReasoning.remove();

            // Clean up old feedback section if exists
            const oldFeedback = document.getElementById('feedbackSection');
            if (oldFeedback) oldFeedback.remove();

            // Insert before XAI Section
            xaiSection.insertAdjacentHTML('beforebegin', reasoningHtml);

            // XAI Rendering
            // const xaiSection = document.getElementById('xaiSection'); // Already got ref
            if (data.contributing_words && data.contributing_words.length > 0) {
                const xaiDiv = document.getElementById('xaiContainer');
                xaiDiv.innerHTML = data.contributing_words.map(w =>
                    `<span class="px-2 py-1 rounded text-xs font-bold border ${w.score > 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-teal-500/10 text-teal-400 border-teal-500/20'}">
                        ${w.word}
                    </span>`
                ).join('');
                xaiSection.classList.remove('hidden');
            } else {
                xaiSection.classList.add('hidden');
            }

            if (window.lucide) lucide.createIcons();

            // Store logId on card for feedback
            document.getElementById('resultCard').dataset.logId = data.log_id;
            window.lastLogId = data.log_id;
        }

    } catch (e) {
        const msg = e.message.toLowerCase();
        if (msg.includes("signature verification failed") || msg.includes("token has expired")) {
            logout();
        } else {
            alert("System Error: " + e.message);
        }
    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
    }
}

function renderGlobalResults(results, synthesis) {
    const container = document.getElementById('globalResults');
    if (!results || results.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm italic">No relevant global news found.</p>';
        return;
    }

    let html = '';

    // 1. AI Synthesis Section (Analysis)
    if (synthesis) {
        html += `
        <div class="mb-4 bg-sky-50 border border-sky-200 p-4 rounded-xl shadow-sm">
            <h4 class="text-xs font-bold text-sky-700 uppercase tracking-widest mb-2 flex items-center">
                <i data-lucide="bot" class="w-3 h-3 mr-2"></i> AI Synthesis
            </h4>
            <p class="text-sm text-slate-700 leading-relaxed font-sans">
                ${synthesis}
            </p>
        </div>
        <p class="text-xs text-slate-500 uppercase font-bold mb-2 pl-1">Everything about it</p>
        `;
    }

    // 2. Articles List
    html += results.map(r => `
        <div class="bg-white p-3 rounded-lg border border-slate-200 flex justify-between items-start hover:bg-slate-50 transition shadow-sm">
            <div>
                 <div class="flex items-center space-x-2">
                    <span class="text-[10px] font-bold text-sky-600 uppercase tracking-wider">${r.source}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${r.prediction === 'REAL' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}">${r.badge}</span>
                 </div>
                 <h4 class="text-sm font-medium text-slate-700 mt-1 leading-snug">${r.title}</h4>
            </div>
            <div class="text-right ml-4">
                 <span class="text-xs font-bold ${r.prediction === 'REAL' ? 'text-teal-600' : 'text-red-500'}">${Math.round(r.confidence)}%</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // re-init icons for the new synthesis icon
    if (window.lucide) lucide.createIcons();
}

async function sendFeedback(agree) {
    const card = document.getElementById('resultCard');
    // Fallback to window var if dataset missing (for safety)
    const logId = card.dataset.logId || window.lastLogId;
    const feedbackSection = document.getElementById('feedbackSection');

    if (agree) {
        if (feedbackSection) {
            feedbackSection.innerHTML = `
                <div class="flex items-center text-teal-400 space-x-2 w-full justify-center">
                    <i data-lucide="check-circle" class="w-5 h-5"></i>
                    <span class="font-medium">Feedback recorded. Model weights updated.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
        return;
    }

    const correction = prompt("You disagreed. Is this content REAL or FAKE?", "REAL");
    if (!correction) return;

    try {
        await fetch(`${API_BASE}/api/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                log_id: logId,
                user_correction: correction.toUpperCase()
            })
        });

        if (feedbackSection) {
            feedbackSection.innerHTML = `
                <div class="flex items-center text-blue-400 space-x-2 w-full justify-center">
                    <i data-lucide="shield-alert" class="w-5 h-5"></i>
                    <span class="font-medium">Dispute logged. Sent for admin review.</span>
                </div>
            `;
            if (window.lucide) lucide.createIcons();
        }
    } catch (e) {
        alert("Failed to submit feedback: " + e.message);
    }
}

async function loadHistory() {
    const list = document.getElementById('historyList');
    if (!list) return; // Guard clause if not on dashboard
    const res = await fetch(`${API_BASE}/api/user/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 422) {
        logout();
        return;
    }

    const logs = await res.json();

    const totalEl = document.getElementById('totalScans');
    if (totalEl) totalEl.textContent = logs.length;

    list.innerHTML = logs.map(log => {
        const isReal = log.prediction_result === 'REAL';
        // Contextual Icon Logic
        let icon = "📰";
        const txt = log.text_content.toLowerCase();
        if (txt.includes("india") || txt.includes("delhi")) icon = "🇮🇳";
        else if (txt.includes("tech") || txt.includes("google")) icon = "💻";
        else if (txt.includes("law") || txt.includes("court")) icon = "⚖️";
        else if (txt.includes("money") || txt.includes("economy")) icon = "💰";

        return `
        <div class="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition group cursor-pointer relative overflow-hidden shadow-sm">
             <!-- ID Badge background -->
             <div class="absolute left-0 top-0 bottom-0 w-1 ${isReal ? 'bg-teal-500' : 'bg-red-500'}"></div>
             
             <div class="flex items-center space-x-3 w-full pl-2">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg shadow-sm border border-slate-200">
                    ${icon}
                </div>
                <div class="truncate flex-1 mr-3">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[10px] text-slate-500 font-mono">${new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isReal ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-red-50 text-red-600 border border-red-100'}">${log.prediction_result}</span>
                    </div>
                    <p class="text-xs text-slate-700 truncate group-hover:text-blue-600 transition font-medium">${log.text_content}</p>
                </div>
             </div>
        </div>`;
    }).join('');
}

// --- Admin Logic ---

async function loadAdminStats() {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 422) {
        logout();
        return;
    }
    const stats = await res.json();

    document.getElementById('adminTotal').textContent = stats.total_scans;
    document.getElementById('adminFakeRate').textContent = `${stats.fake_percentage}%`;
    document.getElementById('adminUsers').textContent = stats.active_users;
}

async function loadDisputes() {
    const res = await fetch(`${API_BASE}/api/admin/disputes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status === 401 || res.status === 422) {
        logout();
        return;
    }
    const disputes = await res.json();

    document.getElementById('disputeCount').textContent = disputes.length;

    const tbody = document.getElementById('disputeTableBody');
    if (tbody) {
        tbody.innerHTML = disputes.map(d => `
            <tr class="hover:bg-white/5 transition">
                <td class="px-6 py-4 truncate max-w-xs">${d.original_text}</td>
                <td class="px-6 py-4 text-red-400">${d.model_pred}</td>
                <td class="px-6 py-4 text-green-400">${d.user_claim}</td>
                <td class="px-6 py-4">
                    <button class="text-blue-400 hover:text-white underline">Retrain</button>
                </td>
            </tr>
        `).join('');
    }
}

// Admin View Switching
function loadRetrainView() {
    const container = document.getElementById('mainContent');
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-6 text-white">Model Retraining</h2>
        <div class="glass-panel p-8 rounded-xl max-w-2xl">
            <div class="flex items-start space-x-4">
                <div class="p-3 bg-blue-500/10 rounded-lg">
                     <i data-lucide="cpu" class="w-8 h-8 text-blue-400"></i>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-slate-100">Live Model Pipeline</h3>
                    <p class="text-sm text-slate-400 mt-1 mb-4">
                        Triggering a retrain will construct a new vectorized model using the latest labeled dataset and feedback loop entries. 
                        This process runs in the background.
                    </p>
                    <div class="flex items-center space-x-4 mt-6">
                        <button onclick="triggerRetrain()" id="retrainBtn" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-blue-600/20 transition flex items-center">
                            <i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i> Start Training Sequence
                        </button>
                        <span id="retrainStatus" class="text-sm text-slate-400 italic"></span>
                    </div>
                </div>
            </div>
            
            <div class="mt-8 border-t border-white/5 pt-6">
                <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Pipeline Configuration</h4>
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-slate-900/50 p-3 rounded border border-white/5">
                        <span class="block text-xs text-slate-500">Algorithm</span>
                        <span class="block text-sm font-mono text-slate-300">LogisticRegression (LibLinear)</span>
                    </div>
                    <div class="bg-slate-900/50 p-3 rounded border border-white/5">
                        <span class="block text-xs text-slate-500">Vectorizer</span>
                        <span class="block text-sm font-mono text-slate-300">TF-IDF (1-2 ngrams)</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

async function triggerRetrain() {
    const btn = document.getElementById('retrainBtn');
    const status = document.getElementById('retrainStatus');

    btn.disabled = true;
    btn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Initializing...`;

    try {
        const res = await fetch(`${API_BASE}/api/admin/retrain`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (res.ok) {
            status.textContent = data.msg;
            status.className = "text-sm text-teal-400 font-medium italic";
            btn.innerHTML = `<i data-lucide="check" class="w-4 h-4 mr-2"></i> Sequence Started`;
        } else {
            throw new Error(data.msg);
        }
    } catch (e) {
        alert("Error: " + e.message);
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="refresh-cw" class="w-4 h-4 mr-2"></i> Retry`;
    }
}


async function loadUserManagementView() {
    const container = document.getElementById('mainContent');
    container.innerHTML = '<div class="flex items-center justify-center h-64"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>'; // Loading state

    try {
        const res = await fetch(`${API_BASE}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();

        container.innerHTML = `
            <h2 class="text-2xl font-bold mb-6 text-white">User Management</h2>
            <div class="glass-panel rounded-xl overflow-hidden">
                <table class="w-full text-left text-sm text-slate-400">
                    <thead class="bg-white/5 text-slate-200 uppercase text-xs font-bold">
                        <tr>
                            <th class="px-6 py-4">Username</th>
                            <th class="px-6 py-4">Role</th>
                            <th class="px-6 py-4">Created At</th>
                            <th class="px-6 py-4 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        ${users.map(u => `
                        <tr class="hover:bg-white/5 transition">
                            <td class="px-6 py-4 font-medium text-white">${u.username}</td>
                             <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-300'}">
                                    ${u.role}
                                </span>
                            </td>
                            <td class="px-6 py-4 font-mono text-xs">${u.created_at}</td>
                            <td class="px-6 py-4 text-right">
                                <span class="flex items-center justify-end text-teal-400 text-xs font-bold uppercase">
                                    <span class="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2"></span> Active
                                </span>
                            </td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (e) {
        container.innerHTML = `<p class="text-red-400">Error loading users: ${e.message}</p>`;
    }
}


function analyzeTicker(url) {
    setMode('url');
    document.getElementById('newsInput').value = url;
    // Auto-trigger analysis
    analyze();
}

async function initNewsTicker() {
    try {
        const res = await fetch(`${API_BASE}/api/live-news`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 422) {
            logout();
            return;
        }
        const articles = await res.json();

        const wrapper = document.getElementById('newsTicker');
        if (!articles || articles.length === 0) return;

        wrapper.innerHTML = articles.map(art => `
            <div class="swiper-slide flex items-center justify-between px-4 w-full h-full">
                <div class="flex items-center space-x-3 overflow-hidden cursor-pointer w-4/5" onclick="analyzeTicker('${art.link}')">
                    <span class="relative flex h-2 w-2 flex-shrink-0">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span class="text-[10px] font-bold text-red-500 uppercase tracking-widest flex-shrink-0">LIVE</span>
                    <span class="text-slate-400 text-[10px] uppercase border-r border-slate-300 pr-2 mr-2 flex-shrink-0">${art.source}</span>
                    <span class="text-sm font-medium text-slate-700 truncate hover:text-sky-600 transition">${art.title}</span>
                </div>
                <button onclick="analyzeTicker('${art.link}')" class="flex-shrink-0 ml-4 text-[10px] bg-sky-50 hover:bg-sky-100 text-sky-600 px-3 py-1 rounded border border-sky-200 transition whitespace-nowrap font-medium shadow-sm">
                    Verify Now
                </button>
            </div>
        `).join('');

        new Swiper(".mySwiper", {
            direction: "vertical",
            loop: true,
            autoplay: {
                delay: 2500, // Faster ticker
                disableOnInteraction: false,
            },
            allowTouchMove: false
        });

    } catch (e) {
        console.error("News Feed Error", e);
    }
}
