# Remix Fullstack Boilerplate Setup

## Prerequisites

- Node.js (v20+)
- PostgreSQL database (local or Docker)
- Package manager (pnpm recommended)

## Installation Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Database Setup

#### For PostgreSQL (local install):

```bash
# Install PostgreSQL if not already installed
# Create a database
createdb your_database_name

# Create and fill .env with the connection string and session secret
# See required keys below
```

#### For PostgreSQL (Docker):

```bash
docker compose up -d db
```

### 3. Environment Variables

Required environment variables:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/remix_boiler?schema=public"
SESSION_SECRET="a-very-long-random-string"
```

### 4. Database Migration

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed the database (optional)
pnpm db:seed
```

### 5. Development

```bash
# Start development server
pnpm dev
```

## Key Features

### 🗄️ Database Integration

- **Prisma ORM** for type-safe database operations
- **PostgreSQL/MySQL** support
- Migrations and seeding scripts
- Connection pooling and optimization

### 🔐 Authentication

- Password hashing with bcrypt
- Session-based authentication (secure cookie)
- Protected routes via `requireUserId`
- Auth utilities: register, login, logout

### 🚀 App Setup

- Remix + Vite
- TypeScript throughout
- TailwindCSS with design tokens and dark mode
- Minimal shadcn/ui primitives (Button) and Theme Toggle

### 📁 Project Structure

```
├── app/
│   ├── components/
│   │   ├── theme-toggle.tsx
│   │   └── ui/button.tsx
│   ├── lib/
│   │   ├── auth.server.ts      # Authentication utilities
│   │   ├── db.server.ts        # Prisma client
│   │   ├── env.server.ts       # Env validation (zod)
│   │   └── session.server.ts   # Session management
│   ├── routes/
│   │   ├── _index.tsx
│   │   ├── api.health.ts       # /api/health
│   │   ├── dashboard.tsx       # protected
│   │   ├── login.tsx
│   │   ├── logout.tsx
│   │   └── register.tsx
│   └── root.tsx
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── docker-compose.yml          # Postgres
├── Dockerfile                  # App image
└── vite.config.ts
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:seed` - Seed the database

## Database Schema

The boilerplate includes:

- `User`, `Session`, and `Post` models
- Unique constraints and helpful indexes

## API Routes

### Remix Routes

- All standard Remix routing patterns
- Server-side rendering and data loading
- Form handling and mutations

### Health Route

- `/api/health` - Health check endpoint (DB connectivity)

## Production Deployment

### Docker Compose (App + Postgres)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Environment variables used in compose:

- `DATABASE_URL` (points to `db` service)
- `SESSION_SECRET`

### Manual Docker build/run

```bash
docker build -t remix-fullstack:prod .
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/remix_boiler?schema=public \
  -e SESSION_SECRET=change-me \
  remix-fullstack:prod
```

## Next Steps

1. Customize the database schema in `prisma/schema.prisma`
2. Add authentication routes (`/login`, `/register`)
3. Implement protected routes
4. Add more API endpoints as needed
5. Configure deployment (Docker, Vercel, etc.)

## Troubleshooting

### Database Connection Issues

- Verify database is running
- Check connection string format
- Ensure database exists and user has permissions

### Build Issues

- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all environment variables are set
