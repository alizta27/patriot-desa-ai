# Patriot Desa - AI Consultation Platform

## Overview

Patriot Desa is an AI-powered consultation platform designed specifically for Indonesian villages (desa). The application serves as a digital assistant for village officials (aparatur desa), village facilitators (pendamping), village-owned enterprises (BUMDes), and the general public to manage and develop villages through AI-driven consultations.

The platform is built as a modern Single Page Application (SPA) with a chat interface for AI interactions, user role management, subscription-based access tiers, and an admin dashboard for system management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- **React 18** with **TypeScript** for type-safe component development
- **Vite** as the build tool and development server for fast HMR and optimized production builds
- **React Router v6** (BrowserRouter) for client-side routing and navigation

**UI Layer:**
- **shadcn/ui** component library built on Radix UI primitives for accessible, customizable components
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Lucide React** for consistent iconography throughout the application
- Custom color system with HSL variables supporting light/dark themes

**State Management:**
- **Zustand** for lightweight global state management (global UI state, plan/subscription state)
- **React Query (TanStack Query v5)** for server state management, caching, and data synchronization
- Local component state with React hooks for UI-specific concerns

**Key Design Patterns:**
- Component composition with shadcn/ui's flexible architecture
- Custom hooks for reusable logic (useDeviceType, useSubscription, useIsMobile)
- Provider pattern for React Query and tooltip context
- Route-based code organization with feature-specific pages

### Backend & Data Layer

**Authentication & Database:**
- **Supabase** as the primary backend service providing:
  - PostgreSQL database for structured data storage
  - Built-in authentication with email/password
  - Row Level Security (RLS) for data access control
  - Real-time subscriptions capabilities

**Server Integration:**
- **Neon Database** with serverless PostgreSQL (connection pooling via `@neondatabase/serverless`)
- **Drizzle ORM** for type-safe database queries and schema management
- Server-side database configuration in `server/db.ts`

**API Communication:**
- Axios-based API service layer (`src/lib/api.ts`) with:
  - Automatic authentication header injection via interceptors
  - Centralized error handling
  - Supabase Edge Functions integration for serverless backend logic

**Data Models:**
- User profiles with role-based categorization (aparatur, pendamping, bumdes, umum)
- Chat system with conversation history and AI message storage
- Subscription management (free vs premium tiers) with expiry tracking
- Pre-registration system for early access
- Activity logging for admin oversight

### Application Features

**User Journey:**
1. **Authentication Flow:** Login/signup → Role selection (onboarding) → Main chat interface
2. **Role-Based Access:** Users categorized as village officials, facilitators, BUMDes members, or general public
3. **Tiered Access:** Free users (limited queries) vs Premium subscribers (unlimited access)
4. **AI Chat Interface:** Real-time conversation with AI assistant, markdown rendering, chat history management

**Admin Dashboard (Redesigned October 2025):**
- Modern responsive layout with left sidebar navigation and top header
- **Dashboard Page:** Analytics cards, user growth chart, query distribution pie chart, role statistics
- **User Management (Kelola Pengguna):** Modern data table with search, role badges, usage quota progress bars, user actions
- **Activity Logs (Aktivitas):** Timeline view with categorized activities, Indonesian timestamps
- **Settings (Pengaturan):** System configuration (site name, query limits, subscription price), feature toggles
- Built with React Query and mock API layer (`src/lib/mockApi.ts`, `src/hooks/queries/admin.ts`)
- Dark mode support throughout (light/dark/system themes)
- Mobile-responsive with hamburger menu and collapsible sidebar
- All UI text in Bahasa Indonesia

**Subscription System:**
- **Midtrans** payment gateway integration for Indonesian market
- Subscription status checking and expiry management
- Upgrade flow with payment token generation
- Server-side subscription validation via Supabase Edge Functions

### Routing Structure

**Public Routes:**
- `/` - Landing page with feature showcase and pre-registration
- `/login` - Authentication (login/signup tabs)
- `/about` - Platform information
- `/privacy-policy`, `/cookies-policy`, `/terms-of-use` - Legal pages

**Protected Routes:**
- `/onboarding` - Role selection for new users
- `/chat` - Main AI chat interface with sidebar navigation
- `/subscription` - Premium upgrade and payment flow

**Admin Routes:**
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Overview and analytics
- `/admin/users` - User management
- `/admin/activity` - Activity logs
- `/admin/settings` - System configuration

### External Dependencies

**Third-Party Services:**
- **Supabase** - Backend-as-a-Service (authentication, PostgreSQL database, edge functions)
- **Neon Database** - Serverless PostgreSQL with WebSocket support
- **Midtrans** - Payment gateway for subscription processing (sandbox environment)

**Key Libraries:**
- **React Query (@tanstack/react-query)** - Server state management and caching
- **Drizzle ORM** - Type-safe database operations
- **Axios** - HTTP client with interceptors
- **Zustand** - Lightweight state management
- **React Hook Form + Zod** - Form handling and validation
- **React Markdown** - Rendering AI responses with markdown support
- **date-fns** - Date manipulation and formatting
- **Sonner** - Toast notifications
- **Embla Carousel** - Carousel/slider components

**Development Tools:**
- TypeScript with relaxed strictness for gradual typing
- ESLint with React hooks and TypeScript plugins
- Vite with SWC for fast compilation
- Tailwind CSS with PostCSS for processing

### Architectural Decisions

**Why Supabase:**
- Provides integrated authentication, database, and serverless functions in one platform
- PostgreSQL offers robust relational data modeling for user profiles, chats, and subscriptions
- Built-in RLS enables secure, user-scoped data access
- Real-time capabilities support future chat enhancements

**Why React Query:**
- Automatic caching reduces unnecessary network requests
- Optimistic updates improve perceived performance
- Built-in retry logic and error handling
- DevTools for debugging server state

**Why Zustand over Redux:**
- Minimal boilerplate for UI state management
- TypeScript-friendly API
- DevTools integration for debugging
- Suitable for the app's relatively simple global state needs

**Why Mock API for Admin:**
- Allows frontend development without complete backend implementation
- Easier testing and prototyping of admin features
- Clear contract definition for future backend integration

**Design System Approach:**
- HSL color variables enable dynamic theming
- Shadcn/ui provides unstyled, accessible primitives
- Tailwind utilities allow rapid UI development
- Custom color tokens maintain brand consistency (primary orange #ED9C23)