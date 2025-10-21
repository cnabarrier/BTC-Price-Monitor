// API Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=1';
const FEAR_GREED_HISTORY_API = 'https://api.alternative.me/fng/?limit=370';

// Refresh interval in milliseconds (60 seconds)
const REFRESH_INTERVAL = 60000;

// DOM Elements
const btcPriceEl = document.getElementById('btcPrice');
const priceChange24hEl = document.getElementById('priceChange24h');
const btcDominanceEl = document.getElementById('btcDominance');
const fearGreedValueEl = document.getElementById('fearGreedValue');
const fearGreedLabelEl = document.getElementById('fearGreedLabel');
const high24hEl = document.getElementById('high24h');
const low24hEl = document.getElementById('low24h');
const marketCapEl = document.getElementById('marketCap');
const lastUpdatedEl = document.getElementById('lastUpdated');
const refreshBtn = document.getElementById('refreshBtn');
const statusIndicator = document.getElementById('statusIndicator');
const themeToggleBtn = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
const fearGreedGaugeEl = document.getElementById('fearGreedGauge');
const toggleBtns = document.querySelectorAll('.toggle-btn');

// State
let lastUpdateTime = null;
let autoRefreshInterval = null;
let fearGreedHistory = [];
let currentView = 'overview';
let currentFearGreedValue = 0;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('BTC Price Monitor initialized');
    initializeTheme();
    fetchAllData();
    startAutoRefresh();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    refreshBtn.addEventListener('click', () => {
        refreshBtn.style.animation = 'none';
        setTimeout(() => {
            refreshBtn.style.animation = 'spin 0.6s ease-in-out';
            fetchAllData();
        }, 10);
    });

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // View toggle buttons
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentView = e.target.dataset.view;
            toggleBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const gaugeView = document.querySelector('.gauge-view');
            const timelineView = document.querySelector('.timeline-view');

            if (currentView === 'overview') {
                gaugeView.style.display = 'block';
                timelineView.style.display = 'none';
            } else {
                gaugeView.style.display = 'none';
                timelineView.style.display = 'flex';
            }
        });
    });
}

// Fetch all data
async function fetchAllData() {
    try {
        setStatus('loading');
        const [btcData, dominanceData, fearGreedData] = await Promise.all([
            fetchBTCData(),
            fetchBTCDominance(),
            fetchFearGreedIndex()
        ]);

        if (btcData) updateBTCPrice(btcData);
        if (dominanceData) updateBTCDominance(dominanceData);
        if (fearGreedData) {
            updateFearGreedDisplay(fearGreedData);
            fetchFearGreedHistory();
        }

        updateLastUpdated();
        setStatus('active');
    } catch (error) {
        console.error('Error fetching data:', error);
        setStatus('error');
    }
}

// Fetch BTC Price Data from CoinGecko
async function fetchBTCData() {
    try {
        const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            return data[0];
        }
        return null;
    } catch (error) {
        console.error('Error fetching BTC data:', error);
        return null;
    }
}

// Fetch BTC Dominance from CoinGecko
async function fetchBTCDominance() {
    try {
        const url = `${COINGECKO_API}/global`;
        const response = await fetch(url);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        const dominance = data.data?.market_cap_percentage?.btc;
        if (dominance === undefined || dominance === null) {
            return null;
        }
        return dominance;
    } catch (error) {
        console.error('Error fetching BTC dominance:', error);
        return null;
    }
}

// Fetch Fear & Greed Index from Alternative.me
async function fetchFearGreedIndex() {
    try {
        const response = await fetch(FEAR_GREED_API);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.data[0];
    } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
        return null;
    }
}

// Fetch Fear & Greed History
async function fetchFearGreedHistory() {
    try {
        const response = await fetch(FEAR_GREED_HISTORY_API);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        fearGreedHistory = data.data || [];
        updateTimelineDisplay();
    } catch (error) {
        console.error('Error fetching Fear & Greed history:', error);
    }
}

// Update BTC Price Display
function updateBTCPrice(btcData) {
    if (!btcData) return;

    const price = btcData.current_price;
    btcPriceEl.textContent = formatCurrency(price);

    const change24h = btcData.price_change_percentage_24h;
    priceChange24hEl.textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
    priceChange24hEl.classList.remove('negative');
    if (change24h < 0) {
        priceChange24hEl.classList.add('negative');
    }

    if (btcData.high_24h) {
        high24hEl.textContent = `$${formatCurrency(btcData.high_24h)}`;
    }
    if (btcData.low_24h) {
        low24hEl.textContent = `$${formatCurrency(btcData.low_24h)}`;
    }

    if (btcData.market_cap) {
        marketCapEl.textContent = formatMarketCap(btcData.market_cap);
    }
}

// Update BTC Dominance Display
function updateBTCDominance(dominanceData) {
    if (dominanceData === null || dominanceData === undefined) return;

    const btcDominance = typeof dominanceData === 'number' ? dominanceData : parseFloat(dominanceData);

    if (isNaN(btcDominance)) {
        return;
    }

    btcDominanceEl.textContent = `${btcDominance.toFixed(2)}%`;
}

// Update Fear & Greed Display
function updateFearGreedDisplay(fearGreedData) {
    if (!fearGreedData) return;

    const value = parseInt(fearGreedData.value);
    const classification = fearGreedData.value_classification;

    currentFearGreedValue = value;
    fearGreedValueEl.textContent = value;
    fearGreedLabelEl.textContent = classification;

    // Render gauge
    renderGauge(value);
}

// Render Gauge SVG
function renderGauge(value) {
    const svg = fearGreedGaugeEl;
    svg.innerHTML = ''; // Clear previous

    const centerX = 100;
    const centerY = 100;
    const radius = 70;

    // Define segments
    const segments = [
        { name: 'EXTREME FEAR', start: 0, end: 25, className: 'gauge-segment-extreme-fear' },
        { name: 'FEAR', start: 25, end: 46, className: 'gauge-segment-fear' },
        { name: 'NEUTRAL', start: 46, end: 54, className: 'gauge-segment-neutral' },
        { name: 'GREED', start: 54, end: 75, className: 'gauge-segment-greed' },
        { name: 'EXTREME GREED', start: 75, end: 100, className: 'gauge-segment-extreme-greed' }
    ];

    // Draw segments
    segments.forEach((segment, index) => {
        const startAngle = 180 - (segment.start * 1.8);
        const endAngle = 180 - (segment.end * 1.8);
        const path = createArcPath(centerX, centerY, radius, startAngle, endAngle);

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('class', `gauge-segment ${segment.className}`);
        svg.appendChild(pathEl);

        // Add label
        const labelAngle = 180 - ((segment.start + segment.end) / 2 * 1.8);
        const labelRad = (labelAngle * Math.PI) / 180;
        const labelX = centerX + (radius + 18) * Math.cos(labelRad);
        const labelY = centerY + (radius + 18) * Math.sin(labelRad);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('class', 'gauge-label');
        text.textContent = segment.name;
        svg.appendChild(text);
    });

    // Draw ticks
    for (let i = 0; i <= 100; i += 25) {
        const angle = 180 - (i * 1.8);
        const rad = (angle * Math.PI) / 180;

        const x1 = centerX + (radius - 5) * Math.cos(rad);
        const y1 = centerY + (radius - 5) * Math.sin(rad);
        const x2 = centerX + (radius + 5) * Math.cos(rad);
        const y2 = centerY + (radius + 5) * Math.sin(rad);

        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', x1);
        tick.setAttribute('y1', y1);
        tick.setAttribute('x2', x2);
        tick.setAttribute('y2', y2);
        tick.setAttribute('class', 'gauge-tick');
        svg.appendChild(tick);
    }

    // Draw needle
    const needleAngle = 180 - (value * 1.8);
    const needleRad = (needleAngle * Math.PI) / 180;
    const needleLength = radius - 10;
    const needleX = centerX + needleLength * Math.cos(needleRad);
    const needleY = centerY + needleLength * Math.sin(needleRad);

    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', centerX);
    needle.setAttribute('y1', centerY);
    needle.setAttribute('x2', needleX);
    needle.setAttribute('y2', needleY);
    needle.setAttribute('class', 'gauge-needle');
    svg.appendChild(needle);

    // Draw center dot
    const centerDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerDot.setAttribute('cx', centerX);
    centerDot.setAttribute('cy', centerY);
    centerDot.setAttribute('r', '6');
    centerDot.setAttribute('class', 'gauge-center-dot');
    svg.appendChild(centerDot);
}

// Create Arc Path
function createArcPath(centerX, centerY, radius, startDeg, endDeg) {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
}

// Update Timeline Display
function updateTimelineDisplay() {
    if (fearGreedHistory.length === 0) return;

    const prev = fearGreedHistory[1] || null;
    const week = fearGreedHistory[7] || null;
    const month = fearGreedHistory[30] || null;
    const year = fearGreedHistory[365] || null;

    updateTimelineItem('Previous close', prev, 'timelinePrevLabel', 'timelinePrevValue');
    updateTimelineItem('1 week ago', week, 'timelineWeekLabel', 'timelineWeekValue');
    updateTimelineItem('1 month ago', month, 'timelineMonthLabel', 'timelineMonthValue');
    updateTimelineItem('1 year ago', year, 'timelineYearLabel', 'timelineYearValue');
}

// Update Timeline Item
function updateTimelineItem(label, data, labelId, valueId) {
    const labelEl = document.getElementById(labelId);
    const valueEl = document.getElementById(valueId);

    if (!data) {
        if (valueEl) valueEl.textContent = '--';
        if (labelEl) labelEl.textContent = '--';
        return;
    }

    const value = parseInt(data.value);
    const classification = data.value_classification;

    if (labelEl) labelEl.textContent = classification;
    if (valueEl) {
        valueEl.textContent = value;
        valueEl.className = 'sentiment-badge ' + getSentimentBadgeClass(value);
    }
}

// Get Sentiment Badge Class
function getSentimentBadgeClass(value) {
    if (value <= 25) return 'badge-extreme-fear';
    if (value <= 46) return 'badge-fear';
    if (value <= 54) return 'badge-neutral';
    if (value <= 75) return 'badge-greed';
    return 'badge-extreme-greed';
}

// Update Last Updated Time
function updateLastUpdated() {
    const now = new Date();
    lastUpdateTime = now;
    lastUpdatedEl.textContent = formatTime(now);
}

// Set Status Indicator
function setStatus(status) {
    if (status === 'active') {
        statusIndicator.classList.add('active');
    } else if (status === 'error') {
        statusIndicator.classList.remove('active');
    } else if (status === 'loading') {
        statusIndicator.classList.remove('active');
    }
}

// Utility Functions
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function formatMarketCap(value) {
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${formatCurrency(value)}`;
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('btc-monitor-theme') || 'dark';
    setTheme(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    if (theme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
    localStorage.setItem('btc-monitor-theme', theme);
    console.log(`Theme set to: ${theme}`);
}

// Auto-refresh
function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);

    autoRefreshInterval = setInterval(() => {
        console.log('Auto-refreshing BTC data...');
        fetchAllData();
    }, REFRESH_INTERVAL);
}

// Cleanup
window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
});

// Add CSS animation for refresh button
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);
