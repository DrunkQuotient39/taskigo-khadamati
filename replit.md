# Taskego (Khadamati) - Full-Stack Service Platform

## Overview

Taskego is a bilingual local service platform that connects clients with service providers for various needs like cleaning, plumbing, delivery, and maintenance. The application features a modern React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **Styling**: Tailwind CSS with custom Khadamati theme (blue/yellow color scheme)
- **UI Components**: Radix UI primitives with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite for development and build process
- **Animation**: Framer Motion for transitions and animations
- **Internationalization**: Custom i18n system with English/Arabic support and RTL layout

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication system (roles: client, provider, admin)
- **API Design**: RESTful endpoints with proper error handling
- **Development**: Hot reload with Vite middleware integration

### Database Schema
- **Users**: Multi-role system (client, provider, admin) with profile management
- **Service Categories**: Hierarchical service organization with bilingual support
- **Services**: Provider-offered services with pricing, availability, and ratings
- **Bookings**: Service appointment system with status tracking
- **Reviews**: Rating and feedback system
- **Notifications**: Real-time user notifications

## Key Components

### Frontend Components
- **Navigation**: Responsive header with language switcher and mobile menu
- **Service Management**: Service grid with filtering, search, and sorting
- **Booking System**: Multi-step booking process with form validation
- **Dashboard**: Separate dashboards for providers and admin users
- **Common Components**: Reusable UI elements like scroll reveal, animated counters, floating chat

### Backend Services
- **Storage Layer**: Abstracted data access with interface-based design
- **Route Handlers**: Organized API endpoints for different features
- **Middleware**: Request logging, error handling, and authentication

### UI System
- **Design System**: Consistent component library with Tailwind CSS
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Accessibility**: ARIA labels and keyboard navigation support
- **Theme**: Custom color palette with CSS variables for theming

## Data Flow

1. **Client Requests**: Browser sends requests to Express server
2. **API Processing**: Express routes handle business logic and data validation
3. **Database Operations**: Drizzle ORM executes SQL queries against PostgreSQL
4. **Response Formatting**: Structured JSON responses sent to frontend
5. **State Management**: TanStack Query caches and synchronizes server state
6. **UI Updates**: React components re-render based on state changes

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod validation
- **UI Libraries**: Radix UI primitives, Lucide React icons, date-fns for dates
- **Development**: Vite, TypeScript, Tailwind CSS, PostCSS
- **Query Management**: TanStack Query for server state management

### Backend Dependencies
- **Core**: Express.js, TypeScript, Node.js
- **Database**: Drizzle ORM, PostgreSQL (via @neondatabase/serverless)
- **Development**: tsx for TypeScript execution, esbuild for production builds
- **Session Management**: connect-pg-simple for PostgreSQL sessions

### Database
- **Provider**: Neon Database (PostgreSQL)
- **ORM**: Drizzle with PostgreSQL dialect
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Environment-based DATABASE_URL configuration

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with hot reload
- **Backend**: tsx with nodemon-like behavior for auto-restart
- **Database**: Neon Database cloud PostgreSQL instance
- **Integration**: Vite middleware serves frontend through Express in development

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild compiles TypeScript to ESM format in `dist/`
- **Deployment**: Single Node.js process serves both API and static files
- **Database**: Production PostgreSQL connection via DATABASE_URL

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate dev, build, and start commands
- **Static Assets**: Express serves built frontend from dist/public directory

### Key Architectural Decisions

1. **Monorepo Structure**: Client, server, and shared code in single repository for easier development and deployment
2. **TypeScript Throughout**: End-to-end type safety from database to frontend
3. **Shared Schema**: Common type definitions between frontend and backend via shared directory
4. **Database-First**: Drizzle schema defines the data model with generated TypeScript types
5. **Component-Based UI**: Reusable components with consistent design system
6. **Internationalization**: Built-in bilingual support with RTL layout for Arabic
7. **Modern Stack**: Latest versions of React, TypeScript, and tooling for optimal developer experience