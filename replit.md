# TinyLink - URL Shortener with Click Analytics

## Overview

TinyLink is a production-quality URL shortening application that enables users to create short, shareable links and track their click statistics. The application provides a clean dashboard interface for managing shortened URLs, detailed analytics for each link, and real-time click tracking.

**Core Features:**
- Create shortened URLs with optional custom short codes
- View and manage all links in a searchable dashboard
- Track click statistics including total clicks and last clicked timestamp
- Detailed individual link statistics page
- Soft-delete functionality for link management
- URL validation and duplicate short code prevention

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React 18 with Vite build tooling
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query v5) for server state management
- **UI Framework:** Radix UI primitives with shadcn/ui component system
- **Styling:** TailwindCSS with custom design tokens following Material Design + Linear-inspired minimalism
- **Form Handling:** React Hook Form with Zod validation via @hookform/resolvers
- **Type Safety:** TypeScript with strict mode enabled

**Design System:**
- Typography: Inter font family for all text
- Component library based on shadcn/ui "new-york" style variant
- Custom color system using HSL variables for theme consistency
- Spacing follows Tailwind's standard scale (2, 4, 6, 8, 12, 16, 24 units)
- Border radius customization: lg (9px), md (6px), sm (3px)
- Focus on data clarity, generous whitespace, and scannable layouts

**Key Frontend Patterns:**
- Component co-location in `/client/src/components/ui`
- Page-level components in `/client/src/pages`
- Shared utilities in `/client/src/lib`
- Custom hooks in `/client/src/hooks`
- Path aliases configured for clean imports (@/, @shared/, @assets/)

### Backend Architecture

**Framework:** Express.js on Node.js
- **Database ORM:** Drizzle ORM for type-safe database operations
- **API Design:** RESTful endpoints following conventional HTTP methods
- **Request Handling:** Standard Express middleware stack with JSON body parsing
- **Error Handling:** Centralized error responses with appropriate HTTP status codes
- **Logging:** Custom request/response logging with timestamp formatting

**API Endpoints:**
- `GET /healthz` - System health check
- `GET /api/links` - Retrieve all non-deleted links
- `GET /api/links/:code` - Retrieve specific link by short code
- `POST /api/links` - Create new shortened link (with optional custom code)
- `DELETE /api/links/:code` - Soft-delete link by short code
- `GET /:code` - Public redirect endpoint (increments click count)

**Server Architecture Patterns:**
- Separation of development (`index-dev.ts`) and production (`index-prod.ts`) entry points
- Development mode uses Vite middleware for HMR
- Production mode serves pre-built static assets
- Database connection pooling via Neon serverless driver with WebSocket support
- Storage abstraction layer (`IStorage` interface) for potential database swapping

### Data Storage

**Database:** PostgreSQL (configured for Neon serverless)
- **Schema Management:** Drizzle Kit for migrations
- **Connection:** @neondatabase/serverless with connection pooling
- **WebSocket Support:** Required for Neon serverless connectivity

**Database Schema (`links` table):**
```
- id: UUID (primary key, auto-generated)
- code: VARCHAR(8) (unique, not null) - The short code identifier
- targetUrl: TEXT (not null) - The original long URL
- createdAt: TIMESTAMP (default now, not null)
- totalClicks: INTEGER (default 0, not null)
- lastClicked: TIMESTAMP (nullable)
- deletedAt: TIMESTAMP (nullable) - Soft delete marker
```

**Data Validation:**
- Short codes: 6-8 alphanumeric characters (enforced via Zod schema)
- Target URLs: Valid URL format validation
- Unique constraint on short codes prevents duplicates

**Storage Strategy:**
- Soft deletes via `deletedAt` timestamp (data retention for analytics)
- Click tracking updates both `totalClicks` counter and `lastClicked` timestamp
- Query filtering excludes soft-deleted records (`WHERE deletedAt IS NULL`)

### Build and Development

**Development Mode:**
- Vite dev server with HMR for instant feedback
- TypeScript type checking separate from build process
- Source maps enabled for debugging
- Custom error overlay plugin for runtime errors

**Production Build:**
- Client: Vite builds to `dist/public` with optimized assets
- Server: esbuild bundles server code to `dist/index.js` with ESM format
- External package references (not bundled)
- Environment-based configuration via NODE_ENV

**Build Commands:**
- `npm run dev` - Start development server with HMR
- `npm run build` - Build both client and server for production
- `npm run start` - Run production build
- `npm run check` - TypeScript type checking only
- `npm run db:push` - Push Drizzle schema changes to database

## External Dependencies

### Core Runtime Dependencies

**Frontend Libraries:**
- `react` & `react-dom` (v18) - UI framework
- `wouter` - Lightweight routing (alternative to React Router)
- `@tanstack/react-query` (v5) - Server state management and caching
- `react-hook-form` - Form state management
- `zod` - Runtime type validation and schema definition
- `@hookform/resolvers` - Integration between React Hook Form and Zod
- `date-fns` - Date formatting and manipulation

**UI Component Libraries:**
- `@radix-ui/*` - Unstyled, accessible component primitives (18+ packages)
- `lucide-react` - Icon library
- `class-variance-authority` - Variant-based component styling
- `clsx` & `tailwind-merge` - Conditional className utilities
- `cmdk` - Command palette component
- `embla-carousel-react` - Carousel functionality
- `vaul` - Drawer component
- `input-otp` - OTP input component
- `recharts` - Chart library
- `react-day-picker` - Date picker
- `react-resizable-panels` - Resizable panel layouts

**Backend Libraries:**
- `express` - Web application framework
- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - Neon PostgreSQL serverless driver
- `ws` - WebSocket client (required for Neon)
- `drizzle-zod` - Generate Zod schemas from Drizzle tables
- `connect-pg-simple` - PostgreSQL session store (included but not actively used)

**Build Tools:**
- `vite` & `@vitejs/plugin-react` - Build tooling and dev server
- `esbuild` - Server bundling
- `typescript` & `tsx` - Type system and TypeScript execution
- `tailwindcss` & `autoprefixer` - CSS framework and processing
- `drizzle-kit` - Database migration tooling

**Development Tools:**
- `@replit/vite-plugin-*` - Replit-specific development enhancements
- Source map support for debugging

### Database Service

**Neon PostgreSQL:**
- Serverless PostgreSQL database platform
- Connection via `DATABASE_URL` environment variable
- WebSocket-based connectivity for serverless environments
- Automatic connection pooling

### Deployment Platform

**Expected Deployment:**
- Designed for deployment on Replit or similar Node.js hosting
- Static asset serving in production mode
- Environment variable configuration required:
  - `DATABASE_URL` - PostgreSQL connection string
  - `NODE_ENV` - Environment identifier (development/production)

### Design Assets

**Google Fonts:**
- Inter (weights: 400, 500, 600, 700) - Primary UI font
- JetBrains Mono (weights: 400, 500, 600) - Monospace font for code display