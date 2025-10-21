// API Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=1';
const FEAR_GREED_API_HISTORICAL = 'https://api.alternative.me/fng/?limit=370'; // ~1 year of data

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

// State
let lastUpdateTime = null;
let autoRefreshInterval = null;

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
}

// Fetch all data
async function fetchAllData() {
    try {
        setStatus('loading');
        const [btcData, dominanceData, fearGreedData, fearGreedHistorical] = await Promise.all([
            fetchBTCData(),
            fetchBTCDominance(),
            fetchFearGreedIndex(),
            fetchFearGreedHistorical()
        ]);

        if (btcData) updateBTCPrice(btcData);
        if (dominanceData) updateBTCDominance(dominanceData);
        if (fearGreedData) updateFearGreedIndex(fearGreedData);
        if (fearGreedHistorical) updateFearGreedTimeline(fearGreedHistorical);

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
        return data[0]; // Returns array with single bitcoin object
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

// Fetch historical Fear & Greed Index data
async function fetchFearGreedHistorical() {
    try {
        const response = await fetch(FEAR_GREED_API_HISTORICAL);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.data; // Returns array of historical data
    } catch (error) {
        console.error('Error fetching historical Fear & Greed Index:', error);
        return null;
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

// Update Fear & Greed Index Display
function updateFearGreedIndex(fearGreedData) {
    if (!fearGreedData) return;

    const value = parseInt(fearGreedData.value);
    const classification = fearGreedData.value_classification;

    fearGreedValueEl.textContent = value;
    fearGreedLabelEl.textContent = classification;

    // Render the gauge
    renderFearGreedGauge(value);

    // Color code the fear and greed index
    updateFearGreedColor(value);
}

// Color code Fear & Greed Index
function updateFearGreedColor(value) {
    const fearGreedCard = fearGreedValueEl.closest('.card');
    if (!fearGreedCard) return;

    fearGreedCard.style.borderColor = 'var(--border-color)';

    if (value <= 25) {
        fearGreedCard.style.borderTopColor = '#e74c3c'; // Red
    } else if (value <= 46) {
        fearGreedCard.style.borderTopColor = '#f39c12'; // Orange
    } else if (value <= 54) {
        fearGreedCard.style.borderTopColor = '#f1c40f'; // Yellow
    } else if (value <= 75) {
        fearGreedCard.style.borderTopColor = '#27ae60'; // Light Green
    } else {
        fearGreedCard.style.borderTopColor = '#2ecc71'; // Green
    }
}

// Update Fear & Greed Timeline
function updateFearGreedTimeline(historicalData) {
    if (!historicalData || !Array.isArray(historicalData)) return;

    // Helper function to find data by days ago
    const findDataByDaysAgo = (daysAgo) => {
        // The API returns data sorted by date (most recent first)
        // Index 0 is today, index 1 is yesterday, etc.
        if (daysAgo < historicalData.length) {
            return historicalData[daysAgo];
        }
        return null;
    };

    // Helper function to format timeline value
    const formatTimelineValue = (data) => {
        if (!data) return '--';
        const value = parseInt(data.value);
        const classification = data.value_classification;
        return `${classification} (${value})`;
    };

    // Update timeline items
    const previousClose = findDataByDaysAgo(1); // Yesterday
    const oneWeekAgo = findDataByDaysAgo(7); // 7 days ago
    const oneMonthAgo = findDataByDaysAgo(30); // 30 days ago
    const oneYearAgo = findDataByDaysAgo(365); // 365 days ago

    document.getElementById('fearGreedPrevious').textContent = formatTimelineValue(previousClose);
    document.getElementById('fearGreed1Week').textContent = formatTimelineValue(oneWeekAgo);
    document.getElementById('fearGreed1Month').textContent = formatTimelineValue(oneMonthAgo);
    document.getElementById('fearGreed1Year').textContent = formatTimelineValue(oneYearAgo);

    // Color code timeline items based on sentiment
    colorCodeTimelineItem('fearGreedPrevious', previousClose);
    colorCodeTimelineItem('fearGreed1Week', oneWeekAgo);
    colorCodeTimelineItem('fearGreed1Month', oneMonthAgo);
    colorCodeTimelineItem('fearGreed1Year', oneYearAgo);
}

// Color code timeline item based on value
function colorCodeTimelineItem(elementId, data) {
    if (!data) return;

    const element = document.getElementById(elementId);
    if (!element) return;

    const value = parseInt(data.value);
    const parent = element.closest('.timeline-item');
    if (!parent) return;

    let color = '#f7931a'; // Default

    if (value <= 25) {
        color = '#e74c3c'; // Extreme Fear - Red
    } else if (value <= 46) {
        color = '#f39c12'; // Fear - Orange
    } else if (value <= 54) {
        color = '#f1c40f'; // Neutral - Yellow
    } else if (value <= 75) {
        color = '#27ae60'; // Greed - Light Green
    } else {
        color = '#2ecc71'; // Extreme Greed - Green
    }

    parent.style.borderLeftColor = color;
}

// Render the semi-circular Fear & Greed gauge
function renderFearGreedGauge(value) {
    const svg = document.getElementById('fearGreedGauge');
    if (!svg) return;

    // Clear existing content
    svg.innerHTML = '';

    const centerX = 100;
    const centerY = 100;
    const radius = 80;
    const strokeWidth = 20;

    // Define gauge segments: [startValue, endValue, color, label]
    const segments = [
        { start: 0, end: 25, color: '#e74c3c', label: 'Extreme Fear' },
        { start: 25, end: 46, color: '#f39c12', label: 'Fear' },
        { start: 46, end: 54, color: '#f1c40f', label: 'Neutral' },
        { start: 54, end: 75, color: '#27ae60', label: 'Greed' },
        { start: 75, end: 100, color: '#2ecc71', label: 'Extreme Greed' }
    ];

    // Create gauge segments
    segments.forEach(segment => {
        const startAngle = valueToAngle(segment.start);
        const endAngle = valueToAngle(segment.end);
        const path = createArcPath(centerX, centerY, radius, startAngle, endAngle);

        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', path);
        pathElement.setAttribute('fill', 'none');
        pathElement.setAttribute('stroke', segment.color);
        pathElement.setAttribute('stroke-width', strokeWidth);
        pathElement.setAttribute('stroke-linecap', 'round');
        pathElement.setAttribute('class', 'gauge-segment');

        // Add title for accessibility
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${segment.label}: ${segment.start}-${segment.end}`;
        pathElement.appendChild(title);

        svg.appendChild(pathElement);
    });

    // Draw needle
    const needleAngle = valueToAngle(value);
    const needleLength = radius - strokeWidth / 2;
    const needleEndX = centerX + needleLength * Math.cos(needleAngle);
    const needleEndY = centerY + needleLength * Math.sin(needleAngle);

    // Needle line
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', centerX);
    needle.setAttribute('y1', centerY);
    needle.setAttribute('x2', needleEndX);
    needle.setAttribute('y2', needleEndY);
    needle.setAttribute('stroke', '#f7931a');
    needle.setAttribute('stroke-width', '3');
    needle.setAttribute('stroke-linecap', 'round');
    needle.setAttribute('class', 'gauge-needle');
    svg.appendChild(needle);

    // Needle center circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', centerY);
    circle.setAttribute('r', '6');
    circle.setAttribute('fill', '#f7931a');
    svg.appendChild(circle);

    // Add segment labels
    const labelRadius = radius + 15;
    segments.forEach(segment => {
        const midValue = (segment.start + segment.end) / 2;
        const midAngle = valueToAngle(midValue);
        const labelX = centerX + labelRadius * Math.cos(midAngle);
        const labelY = centerY + labelRadius * Math.sin(midAngle);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX);
        text.setAttribute('y', labelY);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.setAttribute('font-size', '8');
        text.setAttribute('font-weight', '600');
        text.textContent = segment.label.split(' ')[segment.label.split(' ').length - 1]; // Last word only
        svg.appendChild(text);
    });
}

// Convert value (0-100) to angle in radians for semi-circle
function valueToAngle(value) {
    // Map 0-100 to π (180°) to 0 (for left-to-right arc)
    // Starting from left (π radians) to right (0 radians)
    return Math.PI - (value / 100) * Math.PI;
}

// Create SVG arc path
function createArcPath(centerX, centerY, radius, startAngle, endAngle) {
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;

    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
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
    // Could be enhanced to show error UI
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
