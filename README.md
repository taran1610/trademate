# TradeScope AI

A React-based trading chart analysis application that uses AI to analyze trading charts and help you track your trading decisions and performance.

## Features

- 📊 **AI-Powered Chart Analysis**: Upload trading charts and get AI analysis using Claude (Anthropic API)
- 📈 **Performance Tracking**: Track your trades, wins, losses, and win rates
- 📝 **Trade Journaling**: Log your trading decisions and outcomes
- 📧 **Email Logs**: Automatically email trade logs to yourself
- 📉 **Analytics Dashboard**: Visualize your trading performance with charts and statistics
- 💾 **Local Storage**: All data is stored locally in your browser

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:5173`

### Configuration

1. **Set up Anthropic API Key**:
   - Go to [Anthropic Console](https://console.anthropic.com/) to get your API key
   - Navigate to Settings in the app
   - Enter your API key and save

2. **Configure Email** (Optional):
   - Go to Settings
   - Enter your email address for trade log emails

## Usage

1. **Upload a Chart**: Click "Choose File" on the dashboard and select a trading chart image (PNG, JPG, or SVG)
2. **Review Analysis**: The AI will analyze your chart and provide insights including:
   - Trend direction
   - Swing highs and lows
   - Fair value gaps
   - Break of structure
   - Trading bias (Long/Short/Neutral)
   - Entry zones, stop loss, and take profit levels
3. **Log Your Decision**: Mark whether you took or skipped the trade
4. **Track Outcomes**: For trades you took, mark them as wins or losses
5. **Review Performance**: Check the Performance dashboard to see your statistics and analytics

## Tech Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **Lucide React**: Icons
- **Anthropic Claude API**: AI chart analysis

## Project Structure

```
trademate/
├── src/
│   ├── App.jsx          # Main app wrapper
│   ├── TradeScopeAI.jsx # Main component
│   ├── storage.js       # Local storage API
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind CSS imports
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed hosting instructions.

**Quick Deploy Options:**
- **Vercel** (Recommended): Connect GitHub repo → Auto-deploy
- **Netlify**: Connect GitHub repo → Auto-deploy
- **GitHub Pages**: Use the included GitHub Actions workflow
- **Cloudflare Pages**: Connect GitHub repo → Auto-deploy

All platforms support free hosting with automatic HTTPS and CDN.

## Notes

- All data is stored in your browser's localStorage
- The API key is stored locally and never sent anywhere except to Anthropic's API
- Make sure to keep your API key secure and never commit it to version control

## License

MIT

