// API Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=1';

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

// State
let lastUpdateTime = null;
let autoRefreshInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('BTC Price Monitor initialized');
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
        if (fearGreedData) updateFearGreedIndex(fearGreedData);

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
            `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_high_low_24h=true`
        );

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.bitcoin;
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
        return data.data.btc_market_cap_percentage;
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

// Update BTC Price Display
function updateBTCPrice(btcData) {
    if (!btcData) return;

    // Price
    const price = btcData.usd;
    btcPriceEl.textContent = formatCurrency(price);

    // 24h Change
    const change24h = btcData.usd_24h_change;
    const changeElement = priceChange24hEl;

    changeElement.textContent = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;
    changeElement.classList.remove('negative');
    if (change24h < 0) {
        changeElement.classList.add('negative');
    }

    // 24h High/Low
    if (btcData.usd_24h_high) {
        high24hEl.textContent = `$${formatCurrency(btcData.usd_24h_high)}`;
    }
    if (btcData.usd_24h_low) {
        low24hEl.textContent = `$${formatCurrency(btcData.usd_24h_low)}`;
    }

    // Market Cap
    if (btcData.usd_market_cap) {
        marketCapEl.textContent = formatMarketCap(btcData.usd_market_cap);
    }
}

// Update BTC Dominance Display
function updateBTCDominance(dominanceData) {
    if (!dominanceData) return;

    const btcDominance = dominanceData.btc || 0;
    btcDominanceEl.textContent = `${btcDominance.toFixed(2)}%`;
}

// Update Fear & Greed Index Display
function updateFearGreedIndex(fearGreedData) {
    if (!fearGreedData) return;

    const value = parseInt(fearGreedData.value);
    const classification = fearGreedData.value_classification;

    fearGreedValueEl.textContent = value;
    fearGreedLabelEl.textContent = classification;

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
