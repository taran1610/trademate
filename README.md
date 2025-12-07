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
- Supabase account (free tier works great!)

### Installation

1. Install dependencies:

```bash
npm install
```

2. **Set up Supabase** (Required for multi-user):

   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions
   - Create a Supabase project
   - Run the database schema
   - Add credentials to `.env.local`

3. Start the development server:

```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Configuration

1. **Supabase Setup** (Required):

   - Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Creates user accounts, database, and secure storage
   - Enables multi-user support for your friends!

2. **Set up Anthropic API Key** (Server-Side):

   - See [SETUP.md](./SETUP.md) for detailed instructions
   - API key is stored as an environment variable (never in browser)
   - For Vercel/Netlify: Add `ANTHROPIC_API_KEY` in platform settings
   - For local dev: Create `.env.local` with your API key

3. **Configure Email** (Optional):
   - Go to Settings in the app
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
│   ├── App.jsx              # Main app wrapper
│   ├── TradeScopeAI.jsx    # Main component
│   ├── components/
│   │   └── Auth.jsx         # Authentication UI
│   ├── lib/
│   │   ├── supabase.js      # Supabase client
│   │   └── storage.js       # Unified storage (Supabase + localStorage)
│   ├── storage.js           # Legacy localStorage (backward compat)
│   ├── main.jsx             # Entry point
│   └── index.css            # Tailwind CSS imports
├── supabase/
│   └── schema.sql           # Database schema
├── api/
│   └── analyze.js           # Vercel serverless function (secure API proxy)
├── netlify/
│   └── functions/
│       └── analyze.js       # Netlify serverless function (secure API proxy)
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

## 🔒 Security

- **API keys are stored server-side** as environment variables (never in browser)
- All API calls go through secure serverless functions
- **User authentication** via Supabase (email/password or magic links)
- **Database with Row Level Security** - users only see their own data
- **Automatic backups** via Supabase
- Falls back to localStorage if Supabase isn't configured
- See [SETUP.md](./SETUP.md) for secure API key configuration
- See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for database setup

## License

MIT
