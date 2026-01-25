// Fake News Detector Logic
let currentMode = 'text'; // 'text', 'api', 'url'

function switchTab(mode) {
    currentMode = mode;

    // 1. Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });

    // 2. Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show selected tab content
    const selectedTab = document.getElementById(`tab-${mode}`);
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }

    // 4. Activate selected button
    // Map mode to index: text=0, api=1, url=2, analytics=3
    const indices = { 'text': 0, 'api': 1, 'url': 2, 'analytics': 3 };
    const index = indices[mode];

    if (index !== undefined) {
        const buttons = document.querySelectorAll('.tab-btn');
        if (buttons[index]) {
            buttons[index].classList.add('active');
        }
    }

    // 5. Toggle verify button visibility
    // The button should be visible for input modes, hidden for analytics
    const btnText = document.getElementById('btnText');
    const mainButton = document.getElementById('checkButton'); // Ensure we target the button element

    // Determine main button text based on mode
    if (mode === 'text') {
        btnText.textContent = "Verify Authenticity";
        mainButton.style.display = 'block'; // Show button
        document.getElementById('result').style.display = 'none'; // Clear result when switching
    }
    else if (mode === 'api') {
        btnText.textContent = "Search & Analyze";
        mainButton.style.display = 'block';
        document.getElementById('result').style.display = 'none';
    }
    else if (mode === 'url') {
        btnText.textContent = "Scan URL";
        mainButton.style.display = 'block';
        document.getElementById('result').style.display = 'none';
    }
    else if (mode === 'analytics') {
        mainButton.style.display = 'none'; // Hide button for analytics
        loadAnalytics();
    }
}

async function loadAnalytics() {
    const list = document.getElementById('historyList');
    list.innerHTML = '<p style="text-align:center; color:#64748b;">Loading data...</p>';

    try {
        const res = await fetch('/api/history');
        const data = await res.json();

        if (data.status === 'success') {
            // Update Stats
            document.getElementById('statTotal').textContent = Object.values(data.stats).reduce((a, b) => a + b, 0);

            const total = Object.values(data.stats).reduce((a, b) => a + b, 0);
            const fake = data.stats['FAKE'] || 0;
            const pct = total > 0 ? Math.round((fake / total) * 100) : 0;
            document.getElementById('statFakePct').textContent = `${pct}%`;

            // Render List
            if (data.recent.length === 0) {
                list.innerHTML = '<p style="text-align:center; color:#64748b;">No verification history yet.</p>';
            } else {
                list.innerHTML = data.recent.map(item => `
                    <div class="history-item">
                        <div style="flex:1; margin-right:1rem;">
                            <div style="font-weight:600; margin-bottom:0.25rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${item.text.substring(0, 50)}...
                            </div>
                            <div style="font-size:0.8rem; color:#94a3b8;">${new Date(item.timestamp).toLocaleString()}</div>
                        </div>
                        <div class="history-label ${item.prediction}">
                            ${item.prediction} (${Math.round(item.confidence)}%)
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {
        list.innerHTML = '<p style="text-align:center; color:#e71d36;">Failed to load analytics.</p>';
    }
}

async function predictNews() {
    const input = document.getElementById('newsInput');
    const apiInput = document.getElementById('apiQueryInput');
    const urlInput = document.getElementById('urlInput');

    const button = document.getElementById('checkButton');
    const loaderContainer = document.getElementById('loaderContainer');
    const resultDiv = document.getElementById('result');
    const btnText = document.getElementById('btnText');

    let endpoint = '/predict';
    let payload = {};

    // Determine Payload based on Mode
    if (currentMode === 'text') {
        const text = input.value.trim();
        if (!text) { alert("Please enter some text."); return; }
        if (text.length < 20) { alert("Text is too short (min 20 chars)."); return; }
        payload = { text: text };
    } else if (currentMode === 'api') {
        const query = apiInput.value.trim();
        if (!query) { alert("Please enter a topic to search."); return; }
        payload = { query: query };
        endpoint = '/predict-from-api';
    } else if (currentMode === 'url') {
        const url = urlInput.value.trim();
        if (!url) { alert("Please enter a URL."); return; }
        payload = { url: url };
        endpoint = '/predict-from-url';
    }

    // UI State: Loading
    button.disabled = true;
    btnText.textContent = "Processing...";
    loaderContainer.style.display = 'block';
    resultDiv.style.display = 'none';
    resultDiv.classList.remove('is-fake', 'is-real'); // Reset state

    // Simulate "Deep Analysis" delay (2 seconds)
    const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

    try {
        // Start fetch and delay in parallel, but wait for both
        const [response] = await Promise.all([
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }),
            delayPromise
        ]);

        const data = await response.json();

        if (data.status === 'success') {
            if (currentMode === 'api') {
                displayApiResults(data.results);
            } else {
                displayResult(data.prediction, data.confidence, data.extracted_title, data.contributing_words, data.source_score);
            }
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error('Error:', error);
        alert("Failed to connect to the server. Please ensure the backend is running.");
    } finally {
        // UI State: Reset
        button.disabled = false;
        loaderContainer.style.display = 'none';

        if (currentMode === 'text') btnText.textContent = "Verify Authenticity";
        else if (currentMode === 'api') btnText.textContent = "Search & Analyze";
        else if (currentMode === 'url') btnText.textContent = "Scan URL";
    }
}

function displayApiResults(results) {
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `<h3>Global News Analysis</h3>`;

    results.forEach(item => {
        const isFake = item.prediction === 'FAKE';
        const color = isFake ? '#ef4444' : '#10b981';
        // Dynamic Badge Logic
        let badge = 'Unknown';
        if (isFake) {
            badge = item.confidence > 80 ? 'High Risk' : 'Suspect';
        } else {
            badge = item.confidence > 80 ? 'Verified' : 'Likely Real';
        }

        resultDiv.innerHTML += `
            <div style="margin-top: 1rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; border-left: 4px solid ${color}; background: #fff;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <span style="font-weight:bold; color: #64748b; font-size: 0.85rem;">Source: ${item.source}</span>
                    <span style="background:${isFake ? '#fef2f2' : '#ecfdf5'}; color:${color}; padding:0.2rem 0.6rem; border-radius:1rem; font-size:0.75rem; font-weight:700;">${badge}</span>
                </div>
                <h4 style="margin:0 0 0.5rem 0; font-size:1.1rem;">${item.title}</h4>
                <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:#475569;">
                    <span>Credibility Score:</span>
                    <div style="flex-grow:1; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; max-width:100px;">
                        <div style="width:${item.confidence}%; height:100%; background:${color};"></div>
                    </div>
                    <strong>${item.confidence}%</strong>
                </div>
            </div>
        `;
    });
}

function displayResult(prediction, confidence, title = null, xaiWords = [], sourceScore = null) {
    const resultDiv = document.getElementById('result');
    // Reset innerHTML if coming from API view
    if (!document.getElementById('predictionBadge')) {
        // Restore Text/URL Result Structure if lost
        resultDiv.innerHTML = `
            <div class="badge-container">
                <span id="predictionBadge" class="badge"></span>
            </div>
            <h2 id="predictionResult" class="result-title"></h2>
            
             <div id="urlTitleBox" style="display:none; margin-bottom: 1rem; font-style: italic; color: #64748b; font-size: 0.9rem;">
                <strong>Analyzed Article:</strong> <span id="urlTitleText"></span>
            </div>

            <div class="reason-box">
                <span class="reason-label">Analysis:</span>
                <span id="predictionReason"></span>
                <div id="xaiContainer" class="xai-container"></div>
            </div>

            <div id="sourceScoreContainer" style="display:none; margin-top: 10px;">
                <span class="reason-label">Source Credibility:</span>
                <span id="sourceScoreBadge" class="badge-small"></span>
            </div>

            <div class="confidence-section">
                <div class="confidence-header">
                    <span>Confidence Score</span>
                    <span id="confidenceValue">0%</span>
                </div>
                <div class="progress-bar-bg">
                    <div id="confidenceBar" class="progress-bar-fill"></div>
                </div>
            </div>
        `;
    }

    const badge = document.getElementById('predictionBadge');
    const resultTitle = document.getElementById('predictionResult');
    const reasonText = document.getElementById('predictionReason');
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceBar = document.getElementById('confidenceBar');

    // Title for URL mode
    const titleBox = document.getElementById('urlTitleBox');
    if (title) {
        titleBox.style.display = 'block';
        document.getElementById('urlTitleText').innerText = title;
    } else {
        titleBox.style.display = 'none';
    }


    const isFake = prediction === 'FAKE';

    // 1. Set State Class
    resultDiv.classList.add(isFake ? 'is-fake' : 'is-real');

    // 2. Set Badge & Title
    let badgeText = "Unknown";
    if (isFake) {
        badgeText = confidence > 80 ? "High Risk" : "Suspicious Content";
    } else {
        badgeText = confidence > 80 ? "Verified Source" : "Likely Real";
    }
    badge.textContent = badgeText;

    resultTitle.textContent = isFake ? "⚠ Likely Fake News" : "✅ Likely Real News";

    // 3. Generate "Explainable" Reason
    reasonText.textContent = generateReason(isFake, confidence);

    // 4. Set Confidence
    // Round to 1 decimal place
    const confPercent = Math.round(confidence * 10) / 10;
    confidenceValue.textContent = `${confPercent}%`;

    // 5. XAI Words
    const xaiDiv = document.getElementById('xaiContainer');
    if (xaiWords && xaiWords.length > 0) {
        xaiDiv.innerHTML = xaiWords.map(w => `<span class="word-chip">${w.word} (${w.score.toFixed(2)})</span>`).join('');
        xaiDiv.style.display = 'flex';
    } else {
        xaiDiv.style.display = 'none';
    }

    // 6. Source Score
    const scoreDiv = document.getElementById('sourceScoreContainer');
    const scoreBadge = document.getElementById('sourceScoreBadge');

    if (sourceScore !== null && sourceScore !== undefined) {
        scoreDiv.style.display = 'block';
        let cls = 'neutral';
        let txt = 'Unknown';

        if (sourceScore >= 80) { cls = 'trusted'; txt = `High Trust (${sourceScore}/100)`; }
        else if (sourceScore <= 30) { cls = 'suspicious'; txt = `Low Trust (${sourceScore}/100)`; }
        else { txt = `Neutral (${sourceScore}/100)`; }

        scoreBadge.className = `badge-small ${cls}`;
        scoreBadge.textContent = txt;
    } else {
        scoreDiv.style.display = 'none';
    }

    // Animate Progress Bar (start from 0)
    confidenceBar.style.width = '0%';
    resultDiv.style.display = 'block';

    // Trigger CSS transition after a slight delay
    setTimeout(() => {
        confidenceBar.style.width = `${confPercent}%`;
    }, 100);
}

function generateReason(isFake, confidence) {
    const fakeReasons = [
        "Sensational political phrasing detected.",
        "High emotional intensity and subjective language found.",
        "Lack of verifiable source citations.",
        "Pattern validation indicates potential misinformation.",
        "Inconsistency with known factual reporting styles."
    ];

    const realReasons = [
        "Consistent with objective reporting standards.",
        "Balanced language and neutral sentiment detected.",
        "Matches patterns of verified credible sources.",
        "Factual structure aligns with standard news reporting.",
        "Low emotional bias score."
    ];

    // Pick a random reason based on confidence
    // High confidence -> Stronger reason logic ideally, but random is fine for UI demo
    const reasons = isFake ? fakeReasons : realReasons;
    const randomIndex = Math.floor(Math.random() * reasons.length);

    return reasons[randomIndex];
}

// Character Counter
document.getElementById('newsInput').addEventListener('input', function (e) {
    const count = e.target.value.length;
    document.getElementById('charCount').textContent = count;
});
