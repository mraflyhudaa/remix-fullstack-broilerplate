# Remix Fullstack Boilerplate Setup

## Prerequisites

- Node.js (v18+)
- PostgreSQL or MySQL database
- Package manager (npm, yarn, or pnpm)

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### For PostgreSQL:

```bash
# Install PostgreSQL if not already installed
# Create a database
createdb your_database_name

# Update your .env file with the connection string
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
```

#### For MySQL:

```bash
# Install MySQL if not already installed
# Create a database
mysql -u root -p
CREATE DATABASE your_database_name;

# Update your .env file with the connection string
DATABASE_URL="mysql://username:password@localhost:3306/your_database_name"
```

### 3. Environment Variables

```bash
cp .env.example .env
# Edit .env with your database credentials and generate a session secret
```

### 4. Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database (optional)
npm run db:seed
```

### 5. Development

```bash
# Start development server
npm run dev
```

## Key Features

### 🗄️ Database Integration

- **Prisma ORM** for type-safe database operations
- **PostgreSQL/MySQL** support
- Migrations and seeding scripts
- Connection pooling and optimization

### 🔐 Authentication

- Password hashing with bcrypt
- Session-based authentication
- Protected routes and middleware
- User management utilities

### 🚀 Server Setup

- **Express.js** custom server
- **Vite** for fast development
- **TypeScript** throughout
- Asset optimization and caching

### 📁 Project Structure

```
├── app/
│   ├── lib/
│   │   ├── auth.server.ts      # Authentication utilities
│   │   ├── db.server.ts        # Database client
│   │   └── session.server.ts   # Session management
│   ├── routes/                 # Remix routes
│   └── ...
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── server.ts                 # Express server
└── vite.config.ts           # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database

## Database Schema

The boilerplate includes:

- **Users** table with authentication
- **Posts** table with user relationships
- Timestamps and proper indexing

## API Routes

### Remix Routes

- All standard Remix routing patterns
- Server-side rendering and data loading
- Form handling and mutations

### Express API Routes

- `/api/health` - Health check endpoint
- Custom API endpoints alongside Remix routes

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure your production database
3. Build the application: `npm run build`
4. Start the server: `npm start`

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
