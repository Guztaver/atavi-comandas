# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Atavi Comandas is a Next.js 16 restaurant order management system with TypeScript, designed for handling dine-in, delivery, and takeout orders. The application features role-based access control (admin, kitchen, delivery), thermal printer integration, and real-time order tracking.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture & Key Patterns

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Better Auth with email/password
- **Styling**: Tailwind CSS 4
- **Thermal Printing**: react-thermal-printer with Web Serial API

### Database Schema
The application uses Drizzle ORM with SQLite. Key tables:
- `users` - Role-based user management (admin, kitchen, delivery)
- `sessions` - Better Auth session management
- `menu_items` - Food, drink, dessert items with availability
- `orders` - Order tracking with status progression
- `order_items` - Line items for orders
- `user_settings` - Client preferences

Database connection is configured in `lib/db/index.ts` with environment-based URL fallback.

### Authentication System
- Uses Better Auth with email/password authentication
- Role-based access control implemented
- Default users created via `createDefaultUsers()` in `lib/auth-config.ts`:
  - admin@atavi.com / admin123
  - kitchen@atavi.com / cozinha123
  - delivery@atavi.com / delivery123
- Auth routes: `/api/auth/[...allauth]`

### Application Structure
```
app/
├── (auth)/login.tsx          # Login page
├── dashboard/                # Admin dashboard pages
│   ├── page.tsx             # Main dashboard
│   ├── menu/                # Menu management
│   ├── orders/              # Order management
│   ├── new-order/           # Order creation
│   ├── printer/             # Printer configuration
│   └── settings/            # App settings
├── kitchen/                  # Kitchen display system
├── delivery/                 # Delivery management
└── api/                     # API routes
    ├── auth/               # Authentication endpoints
    ├── menu/               # Menu CRUD operations
    ├── orders/             # Order management
    └── init-users/         # Default user creation

lib/
├── auth-*.ts               # Authentication configuration
├── db/                     # Database schema and connection
├── printer.service.ts      # Thermal printer service
├── notifications.ts        # Notification system
├── sync.ts                 # Data synchronization
└── config.ts               # Application configuration
```

### Thermal Printer Integration
- Uses `react-thermal-printer` library with Web Serial API
- Service class in `lib/printer.service.ts` manages:
  - Printer connection/disconnection
  - Print queue management with retry logic
  - Configuration persistence in localStorage
  - Status callbacks for UI updates

### Configuration Management
- Central configuration in `lib/config.ts` with environment-based settings
- Database path configurable via `DATABASE_URL` environment variable
- Feature flags for development vs production
- Validation functions for production deployment

### Data Flow Patterns
1. **Order Creation**: Dashboard → API → Database → Kitchen/Delivery views
2. **Status Updates**: Kitchen/Delivery → API → Real-time UI updates
3. **Printer Integration**: Order completion → Print queue → Thermal printer
4. **User Management**: Better Auth → Role-based UI rendering

### Important Implementation Details

#### Environment Variables
- `DATABASE_URL` - SQLite database path (defaults to file:./atavi-comandas.db)
- `NODE_ENV` - Environment mode (development/production)
- `JWT_SECRET` - JWT signing secret for production

#### User Roles & Access Control
- **Admin**: Full access to dashboard, menu, orders, settings
- **Kitchen**: Access to kitchen display for order preparation
- **Delivery**: Access to delivery management interface

#### API Route Patterns
- RESTful endpoints following `/api/{resource}` and `/api/{resource}/[id]` patterns
- Authentication required for all protected routes
- Error handling with appropriate HTTP status codes

#### Component Architecture
- Server Components for static content and data fetching
- Client Components for interactive UI elements (marked with 'use client')
- Custom hooks for data fetching and state management
- Responsive design with mobile-first approach

## Development Notes

### Database Migrations
When modifying the database schema:
1. Update `lib/db/schema.ts` with new table definitions
2. Run database migrations manually or through API endpoints
3. Update TypeScript types in both `types/database.ts` and `types/index.ts`

### Adding New Features
1. Define database schema changes first
2. Create API routes for data operations
3. Build UI components following existing patterns
4. Update type definitions
5. Test with different user roles

### Testing the Printer Integration
The thermal printer feature requires:
- Chrome/Edge browser with Web Serial API support
- Physical thermal printer connection
- HTTPS in production environments
- User permission for serial port access

### Offline Capabilities
The application includes:
- Service Worker registration for PWA functionality
- Local storage for printer configuration
- Hybrid storage mode with API fallback
- Data synchronization services