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
            updateFearGreedDisplay();
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
            // Fetch historical data for timeline
            fetchFearGreedHistory();
        }

        updateLastUpdated();
        setStatus('active');
    } catch (error) {
        console.error('Error fetching data:', error);
        setStatus('error');
        showError('Failed to fetch data. Retrying...');
    }
}

// Fetch BTC Price Data from CoinGecko
async function fetchBTCData() {
    try {
        const response = await fetch(
            `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data[0];
    } catch (error) {
        console.error('Error fetching BTC data:', error);
        return null;
    }
}

// Fetch BTC Dominance from CoinGecko
async function fetchBTCDominance() {
    try {
        const response = await fetch(
            `${COINGECKO_API}/global`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        // CoinGecko /global endpoint returns market_cap_percentage with btc property
        const dominance = data.data?.market_cap_percentage?.btc;
        if (dominance === undefined || dominance === null) {
            console.warn('BTC dominance data not available');
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
    } catch (error) {
        console.error('Error fetching Fear & Greed history:', error);
    }
}

// Update BTC Price Display
function updateBTCPrice(btcData) {
    if (!btcData) return;

    // Price
    const price = btcData.current_price;
    btcPriceEl.textContent = formatCurrency(price);

    // 24h Change
    const change24h = btcData.price_change_percentage_24h;
    const changeElement = priceChange24hEl;

    changeElement.textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
    changeElement.classList.remove('negative');
    if (change24h < 0) {
        changeElement.classList.add('negative');
    }

    // 24h High/Low
    if (btcData.high_24h) {
        high24hEl.textContent = `$${formatCurrency(btcData.high_24h)}`;
    }
    if (btcData.low_24h) {
        low24hEl.textContent = `$${formatCurrency(btcData.low_24h)}`;
    }

    // Market Cap
    if (btcData.market_cap) {
        marketCapEl.textContent = formatMarketCap(btcData.market_cap);
    }
}

// Update BTC Dominance Display
function updateBTCDominance(dominanceData) {
    if (dominanceData === null || dominanceData === undefined) return;

    // dominanceData is the percentage value from CoinGecko /global API
    const btcDominance = typeof dominanceData === 'number' ? dominanceData : parseFloat(dominanceData);

    if (isNaN(btcDominance)) {
        console.warn('Invalid BTC dominance value:', dominanceData);
        return;
    }

    btcDominanceEl.textContent = `${btcDominance.toFixed(2)}%`;
}

// Update Fear & Greed Display
function updateFearGreedDisplay(fearGreedData) {
    if (!fearGreedData && currentView === 'overview') return;

    if (currentView === 'overview') {
        displayGaugeOverview(fearGreedData);
    } else {
        displayTimelineView();
    }
}

// Display Gauge Overview
function displayGaugeOverview(fearGreedData) {
    const value = parseInt(fearGreedData.value);
    const classification = fearGreedData.value_classification;

    fearGreedValueEl.textContent = value;
    fearGreedLabelEl.textContent = classification;

    // Render gauge
    renderFearGreedGauge(value);
}

// Render Fear & Greed Gauge
function renderFearGreedGauge(value) {
    const svg = fearGreedGaugeEl;
    svg.innerHTML = ''; // Clear previous gauge

    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    const startAngle = 180; // Left side (π radians)
    const endAngle = 0; // Right side

    // Create segment groups
    const segments = [
        { name: 'Extreme Fear', range: [0, 25], className: 'gauge-extreme-fear', startDeg: 180, endDeg: 144 },
        { name: 'Fear', range: [25, 46], className: 'gauge-fear', startDeg: 144, endDeg: 110.4 },
        { name: 'Neutral', range: [46, 54], className: 'gauge-neutral', startDeg: 110.4, endDeg: 93.6 },
        { name: 'Greed', range: [54, 75], className: 'gauge-greed', startDeg: 93.6, endDeg: 39.6 },
        { name: 'Extreme Greed', range: [75, 100], className: 'gauge-extreme-greed', startDeg: 39.6, endDeg: 0 }
    ];

    // Draw segments
    segments.forEach(segment => {
        const path = createArcPath(centerX, centerY, radius, segment.startDeg, segment.endDeg);
        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('class', `gauge-segment ${segment.className}`);
        pathEl.setAttribute('fill-opacity', '1');
        svg.appendChild(pathEl);
    });

    // Draw tick marks and labels
    drawTickMarks(svg, centerX, centerY, radius);

    // Draw needle
    const needleAngle = 180 - (value * 1.8); // Map 0-100 to 180-0 degrees
    const needleLength = radius - 15;
    const needleEndX = centerX + needleLength * Math.cos((needleAngle * Math.PI) / 180);
    const needleEndY = centerY + needleLength * Math.sin((needleAngle * Math.PI) / 180);

    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', centerX);
    needle.setAttribute('y1', centerY);
    needle.setAttribute('x2', needleEndX);
    needle.setAttribute('y2', needleEndY);
    needle.setAttribute('class', 'gauge-needle');
    needle.setAttribute('id', 'fearGreedNeedle');
    svg.appendChild(needle);

    // Draw center hub
    const hubCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hubCircle.setAttribute('cx', centerX);
    hubCircle.setAttribute('cy', centerY);
    hubCircle.setAttribute('r', '8');
    hubCircle.setAttribute('class', 'gauge-hub-circle');
    svg.appendChild(hubCircle);
}

// Create Arc Path for gauge segment
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

// Draw tick marks
function drawTickMarks(svg, centerX, centerY, radius) {
    const tickRadius = radius + 10;
    const labelRadius = radius + 25;

    // Draw 5-point increments
    for (let i = 0; i <= 100; i += 5) {
        const angle = 180 - (i * 1.8); // Map to degrees
        const rad = (angle * Math.PI) / 180;

        // Every 25 points, draw longer tick and label
        if (i % 25 === 0) {
            const x1 = centerX + (radius - 8) * Math.cos(rad);
            const y1 = centerY + (radius - 8) * Math.sin(rad);
            const x2 = centerX + (radius + 8) * Math.cos(rad);
            const y2 = centerY + (radius + 8) * Math.sin(rad);

            const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            tick.setAttribute('x1', x1);
            tick.setAttribute('y1', y1);
            tick.setAttribute('x2', x2);
            tick.setAttribute('y2', y2);
            tick.setAttribute('class', 'gauge-ticks');
            svg.appendChild(tick);

            // Add label
            const labelX = centerX + labelRadius * Math.cos(rad);
            const labelY = centerY + labelRadius * Math.sin(rad);
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('class', 'gauge-tick-label');
            text.textContent = i;
            svg.appendChild(text);
        }
    }
}

// Display Timeline View
function displayTimelineView() {
    const timelineContainer = document.querySelector('.timeline-container');
    if (!timelineContainer) return;

    // Get specific historical points
    const current = fearGreedHistory[0]; // Today
    const prevClose = fearGreedHistory[1]; // Yesterday
    const oneWeekAgo = fearGreedHistory[7]; // 1 week
    const oneMonthAgo = fearGreedHistory[30]; // 1 month
    const oneYearAgo = fearGreedHistory[365]; // 1 year (or closest available)

    // Update timeline items
    updateTimelineItem(document.getElementById('fearGreedPrevious'), prevClose);
    updateTimelineItem(document.getElementById('fearGreed1Week'), oneWeekAgo);
    updateTimelineItem(document.getElementById('fearGreed1Month'), oneMonthAgo);
    updateTimelineItem(document.getElementById('fearGreed1Year'), oneYearAgo);
}

// Update Timeline Item
function updateTimelineItem(element, data) {
    if (!element || !data) {
        if (element) element.innerHTML = '<span class="timeline-value-text">--</span>';
        return;
    }

    const value = parseInt(data.value);
    const classification = data.value_classification;
    const badgeClass = getSentimentBadgeClass(value);

    element.innerHTML = `
        <span class="timeline-value-text">${value}</span>
        <span class="sentiment-badge ${badgeClass}">${classification}</span>
    `;
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

// Show Error Message
function showError(message) {
    console.warn(message);
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
