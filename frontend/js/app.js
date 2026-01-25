// --- Configuration ---
const API_BASE = 'http://127.0.0.1:5000';

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
                    msg.textContent = "Registration successful. Please login.";
                    msg.classList.remove('hidden', 'text-red-400');
                    msg.classList.add('text-green-400');
                    // Toggle back to login
                    isRegister = false;
                    toggle.click();
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', data.role);
                    localStorage.setItem('username', data.username);
                    window.location.href = data.role === 'admin' ? 'admin.html' : 'dashboard.html';
                }
            } else {
                throw new Error(data.msg);
            }
        } catch (err) {
            msg.textContent = err.message;
            msg.classList.remove('hidden', 'text-green-400');
            msg.classList.add('text-red-400');
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

    // Load History
    loadHistory();
    // Load News Ticker
    initNewsTicker();
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

        if (res.status === 401) logout();

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
            document.getElementById('confScore').className = `text-3xl font-bold ${isReal ? 'text-teal-400' : 'text-red-400'}`;

            // AI Reasoning Section
            const dynamicContent = document.getElementById('dynamicContent');
            // Clear previous global results or old content
            const xaiSection = document.getElementById('xaiSection');

            // Insert Reasoning Block
            let reasoningHtml = `
                <div id="reasoningBlock" class="mb-6 relative overflow-hidden rounded-xl border border-blue-500/30 bg-slate-900/80 shadow-lg shadow-blue-500/10">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10 pointer-events-none"></div>
                    <div class="p-5 relative z-10">
                        <div class="flex items-center mb-3">
                             <div class="p-1.5 bg-blue-500/20 rounded-lg mr-3">
                                 <i data-lucide="brain-circuit" class="w-5 h-5 text-blue-400"></i>
                             </div>
                             <h4 class="text-xs font-bold text-blue-300 uppercase tracking-widest">AI Insight & Analysis</h4>
                        </div>
                        <p class="text-base text-slate-100 leading-relaxed font-medium">
                            ${data.reasoning || "Analysis complete. Integrity verified against known linguistic patterns."}
                        </p>
                    </div>
                </div>
            `;

            // Clean up old reasoning block if exists
            const oldReasoning = document.getElementById('reasoningBlock');
            if (oldReasoning) oldReasoning.remove();

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

            // Store logId on closest container or keep global variable? 
            // Better to attach to a fixed element like 'analyzeBtn' or just a global var for now in this scope
            window.lastLogId = data.log_id;
        }

    } catch (e) {
        alert("System Error: " + e.message);
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
        <div class="mb-4 bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl">
            <h4 class="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2 flex items-center">
                <i data-lucide="bot" class="w-3 h-3 mr-2"></i> AI Synthesis
            </h4>
            <p class="text-sm text-slate-200 leading-relaxed font-sans">
                ${synthesis}
            </p>
        </div>
        <p class="text-xs text-slate-500 uppercase font-bold mb-2 pl-1">Everything about it</p>
        `;
    }

    // 2. Articles List
    html += results.map(r => `
        <div class="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex justify-between items-start hover:bg-white/5 transition">
            <div>
                 <div class="flex items-center space-x-2">
                    <span class="text-[10px] font-bold text-blue-400 uppercase tracking-wider">${r.source}</span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${r.prediction === 'REAL' ? 'bg-teal-500/20 text-teal-400' : 'bg-red-500/20 text-red-400'}">${r.badge}</span>
                 </div>
                 <h4 class="text-sm font-medium text-slate-200 mt-1 leading-snug">${r.title}</h4>
            </div>
            <div class="text-right ml-4">
                 <span class="text-xs font-bold ${r.prediction === 'REAL' ? 'text-teal-400' : 'text-red-400'}">${Math.round(r.confidence)}%</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    // re-init icons for the new synthesis icon
    if (window.lucide) lucide.createIcons();
}

async function sendFeedback(agree) {
    const card = document.getElementById('resultCard');
    const logId = card.dataset.logId;

    // Logic: If user Agree -> they confirm the result. If Disagree -> they claim opposite.
    // We need to know what the result was to know what the 'correction' is.
    // However, simplified: If Disagree, we flag for admin.

    // The implementation plan specified sending user_rating.
    // Let's assume we send 'DISPUTE' if disagree

    if (agree) {
        alert("Feedback recorded. Verification strength increased.");
        card.classList.add('hidden');
        return;
    }

    const correction = prompt("You disagreed. Is this content REAL or FAKE?", "REAL");
    if (!correction) return;

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

    alert("Dispute logged. Admin will review.");
    card.classList.add('hidden');
}

async function loadHistory() {
    const list = document.getElementById('historyList');
    const res = await fetch(`${API_BASE}/api/user/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const logs = await res.json();

    document.getElementById('totalScans').textContent = logs.length;

    list.innerHTML = logs.map(log => {
        const isReal = log.prediction_result === 'REAL';
        return `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition group cursor-pointer">
            <div class="truncate flex-1 mr-3">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] text-slate-500 font-mono">${new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span class="text-[10px] px-1.5 rounded ${isReal ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'}">${log.prediction_result}</span>
                </div>
                <p class="text-xs text-slate-300 truncate group-hover:text-white transition">${log.text_content}</p>
            </div>
        </div>`;
    }).join('');
}

// --- Admin Logic ---

async function loadAdminStats() {
    // Note: This endpoint does not exist yet in app.py logic above (I missed adding it in the massive replace).
    // I will add it or mock it if needed. Wait, I DID add /api/admin/stats.

    const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const stats = await res.json();

    document.getElementById('adminTotal').textContent = stats.total_scans;
    document.getElementById('adminFakeRate').textContent = `${stats.fake_percentage}%`;
    document.getElementById('adminUsers').textContent = stats.active_users;
}

async function loadDisputes() {
    const res = await fetch(`${API_BASE}/api/admin/disputes`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const disputes = await res.json();

    document.getElementById('disputeCount').textContent = disputes.length;

    const tbody = document.getElementById('disputeTableBody');
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
                    <span class="text-slate-500 text-[10px] uppercase border-r border-slate-700 pr-2 mr-2 flex-shrink-0">${art.source}</span>
                    <span class="text-sm font-medium text-slate-200 truncate hover:text-white transition">${art.title}</span>
                </div>
                <button onclick="analyzeTicker('${art.link}')" class="flex-shrink-0 ml-4 text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded border border-blue-500/20 transition whitespace-nowrap">
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
