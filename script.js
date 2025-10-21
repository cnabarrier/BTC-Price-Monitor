// API Configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_API = 'https://api.alternative.me/fng/?limit=1';
const FEAR_GREED_HISTORY_API = 'https://api.alternative.me/fng/?limit=370';

// CORS Proxy for local file:// protocol (only used when needed)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

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
        const url = `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=bitcoin&order=market_cap_desc&per_page=1&page=1&sparkline=false&price_change_percentage=24h`;
        const fetchUrl = window.location.protocol === 'file:' ? CORS_PROXY + url : url;

        const response = await fetch(fetchUrl);

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
        const url = `${COINGECKO_API}/global`;
        const fetchUrl = window.location.protocol === 'file:' ? CORS_PROXY + url : url;

        const response = await fetch(fetchUrl);

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
        const fetchUrl = window.location.protocol === 'file:' ? CORS_PROXY + FEAR_GREED_API : FEAR_GREED_API;
        const response = await fetch(fetchUrl);

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
        const fetchUrl = window.location.protocol === 'file:' ? CORS_PROXY + FEAR_GREED_HISTORY_API : FEAR_GREED_HISTORY_API;
        const response = await fetch(fetchUrl);

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
    if (!fearGreedData) return;

    const value = parseInt(fearGreedData.value);
    const classification = fearGreedData.value_classification;

    fearGreedValueEl.textContent = value;
    fearGreedLabelEl.textContent = classification;

    // Update slider knob position (0-100 maps to 0-100% width)
    const knobEl = document.getElementById('sliderKnob');
    if (knobEl) {
        const knobTrack = knobEl.parentElement;
        const trackWidth = knobTrack.offsetWidth;
        const knobPosition = (value / 100) * (trackWidth - 24); // 24px is knob width
        knobEl.style.left = `calc(${value}% - 12px)`; // Center the knob
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
