# 🔗 TinyLinker - URL Shortener

A modern, production-ready URL shortening application with click analytics, built with React, Express, and PostgreSQL.

![Status](https://img.shields.io/badge/status-ready%20to%20deploy-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🔗 **URL Shortening** - Create short, shareable links
- 🎨 **Custom Short Codes** - Choose your own memorable codes (6-8 characters)
- 📊 **Click Analytics** - Track total clicks and last clicked timestamp
- 🗂️ **Dashboard** - Manage all your links in one place
- 🔍 **Search & Filter** - Find links quickly
- 🗑️ **Soft Delete** - Remove links without losing data
- ⚡ **Real-time Updates** - Instant feedback with React Query
- 🎯 **URL Validation** - Ensures valid URLs and unique codes
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Deploy (5 Minutes)

Deploy to free hosting with free database:

### Option 1: Railway (Recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Click the button above or go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Deploy from your GitHub repo
4. Add `DATABASE_URL` environment variable (get from [neon.tech](https://neon.tech))
5. Done! Your app is live 🎉

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service from your GitHub repo
3. Add `DATABASE_URL` environment variable
4. Deploy!

**📖 Full deployment guide:** See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions.

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend
- **Express.js** - Web framework
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Database (via Neon)
- **Zod** - Runtime validation
- **TypeScript** - Type safety

## 📦 Local Development

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (or Neon account)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tinylinker.git
   cd tinylinker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your DATABASE_URL
   ```

4. **Initialize database:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Health check |
| GET | `/api/links` | Get all links |
| GET | `/api/links/:code` | Get specific link |
| POST | `/api/links` | Create new link |
| DELETE | `/api/links/:code` | Delete link |
| GET | `/:code` | Redirect to target URL |

## 📊 Database Schema

```sql
CREATE TABLE links (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) UNIQUE NOT NULL,
  target_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  total_clicks INTEGER DEFAULT 0 NOT NULL,
  last_clicked TIMESTAMP,
  deleted_at TIMESTAMP
);
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port (default: 3000) | No |

## 📚 Documentation

- [Quick Deploy Guide](QUICK_DEPLOY.md) - 5-minute deployment
- [Full Deployment Guide](DEPLOYMENT.md) - Detailed deployment instructions
- [Setup Guide](SETUP.md) - Local development setup
- [Test Results](TEST_RESULTS.md) - Testing and validation

## 🎯 Deployment Platforms

This app is configured for deployment on:

- ✅ **Railway** - Recommended (easiest setup)
- ✅ **Render** - Great free tier
- ⚠️ **Vercel** - Requires serverless modifications

## 🆓 Free Tier Resources

### Database: Neon
- 0.5 GB storage
- Always active
- No credit card required
- [Sign up](https://neon.tech)

### Hosting: Railway
- $5/month free credit
- ~500 hours runtime
- Auto-deploy on push
- [Sign up](https://railway.app)

### Hosting: Render
- 750 hours/month
- Sleeps after 15 min inactivity
- Auto-deploy on push
- [Sign up](https://render.com)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for production use
- Optimized for free hosting platforms

---

**Ready to deploy?** Check out [QUICK_DEPLOY.md](QUICK_DEPLOY.md) to get started! 🚀

