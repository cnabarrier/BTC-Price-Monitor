# BTC Price Monitor

A modern, responsive web application that monitors Bitcoin (BTC) price in USD with real-time data from reputable sources.

## Features

- **Real-time BTC Price**: Current Bitcoin price in USD updated every 60 seconds
- **24h Price Change**: Percentage change over the last 24 hours
- **24h Range**: High and low prices for the last 24 hours
- **Market Cap**: Total Bitcoin market capitalization
- **BTC Dominance**: Bitcoin's market dominance percentage
- **Fear & Greed Index**: Sentiment indicator for cryptocurrency market
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, dark-themed interface with smooth animations

## Data Sources

- **Bitcoin Price & Market Data**: [CoinGecko API](https://www.coingecko.com/en/api) (Free, no key required)
- **Fear & Greed Index**: [Alternative.me API](https://alternative.me/crypto/fear-and-greed-index/)

## Technologies

- HTML5
- CSS3 (with CSS Grid and Flexbox)
- Vanilla JavaScript (ES6+)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cnabarrier/BTC-Price-Monitor.git
```

2. Navigate to the project directory:
```bash
cd BTC-Price-Monitor
```

3. Open `index.html` in your web browser

## Usage

The application automatically fetches and updates data every 60 seconds. You can also manually refresh the data by clicking the refresh button (⟳) next to the "Last updated" timestamp.

## Project Structure

```
BTC-Price-Monitor/
├── index.html      # Main HTML file
├── styles.css      # Styling and responsive design
├── script.js       # JavaScript functionality and API integration
└── README.md       # This file
```

## Future Enhancements

- Dark mode / Light mode toggle
- Price alerts and notifications
- Historical price charts
- Multiple currency support
- Local storage for preferences
- Additional data points and indicators

## License

This project is open source and available for personal and educational use.

## Contributing

Feel free to submit issues and enhancement requests!
