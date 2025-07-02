# Mentora Ai Platform

## Visão Geral

Mentora Ai is a comprehensive mentoring and course platform built with React frontend and Express backend. The platform enables mentors to create and sell courses while students can enroll and learn. It features integrated payments through Stripe Connect, content management, user profiles, and a robust dashboard system for different user roles.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: React Router for client-side navigation
- **State Management**: TanStack Query for server state, React state for local UI state
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe Connect for marketplace functionality
- **File Storage**: Supabase Storage for images and documents
- **API Pattern**: RESTful API with /api prefix

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` for type sharing
- **Key Tables**: users, profiles, courses (cursos), modules (modulos), content (conteudos), enrollments (matriculas)
- **User Roles**: admin, mentor, mentorado (student)

## Key Components

### User Management
- **Authentication**: Supabase-based auth with role-based access control
- **Profiles**: Extended user profiles with role-specific data
- **Roles**: Three-tier system (admin, mentor, student) with appropriate permissions

### Course Management
- **Course Creation**: Form-based course creation with Stripe product integration
- **Content Types**: Video (external), rich text, PDF support
- **Module Structure**: Hierarchical content organization (Course -> Modules -> Content)
- **Publishing**: Draft/published states with visibility controls

### Payment System
- **Stripe Connect**: Marketplace model with connected accounts for mentors
- **Product Integration**: Automatic Stripe product/price creation
- **Document Verification**: KYC document upload for mentor verification
- **Transaction Tracking**: Complete payment flow with webhooks

### Content Delivery
- **Course Player**: Progressive content consumption with progress tracking
- **Multiple Formats**: Support for videos, rich text, and PDF content
- **Progress Tracking**: User progress persistence across sessions

## Data Flow

### Course Creation Flow
1. Mentor creates course via form
2. System creates Stripe product (if paid)
3. Course stored in database with Stripe metadata
4. Mentor can add modules and content
5. Course published when ready

### Enrollment Flow
1. Student browses public courses
2. For paid courses: Stripe Checkout session created
3. Payment processed via Stripe Connect
4. Enrollment record created on successful payment
5. Student gains access to course content

### Content Consumption Flow
1. Enrolled student accesses course player
2. Content served based on enrollment status
3. Progress tracked and persisted
4. Completion status updated in real-time

## External Dependencies

### Payment Processing
- **Stripe**: Full integration with Connect for marketplace functionality
- **Webhook Handling**: Automated payment status updates
- **KYC Integration**: Document upload for mentor verification

### Database & Storage
- **Supabase**: Primary database and storage provider
- **PostgreSQL**: Relational database with advanced features
- **File Storage**: Images, documents, and content assets

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Consistent icon system
- **Framer Motion**: Smooth animations and transitions

## Deployment Strategy

### Development Environment
- **Replit Integration**: Native Replit development environment
- **Hot Reloading**: Vite HMR for fast development cycles
- **Database**: PostgreSQL module in Replit

### Production Build
- **Frontend**: Vite build to `dist/public`
- **Backend**: ESBuild compilation for Node.js
- **Serving**: Express serves both API and static files
- **Autoscale**: Replit autoscale deployment target

### Environment Configuration
- **Database**: PostgreSQL connection via `DATABASE_URL`
- **Stripe**: API keys for payment processing
- **Supabase**: Client configuration for auth and storage

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **July 2, 2025**: Corrigido problema crítico de conectividade das APIs do Stripe
  - Identificado e resolvido problema de "Failed to fetch" nas APIs de balance e payouts
  - Alteradas URLs do frontend de absoluta (`http://localhost:5000`) para relativa (`/api/...`)
  - Corrigida arquitetura para usar servidor único que serve frontend e APIs na mesma porta
  - Adicionada configuração CORS para compatibilidade
  - Removidos arquivos de teste temporários
  - Status: APIs do Stripe funcionando corretamente no dashboard do mentor

- **June 26, 2025**: Aplicadas correções críticas de deployment
  - Configurado endpoint `/health` para verificação do servidor
  - Criado sistema de gerenciamento de variáveis de ambiente
  - Configurado PostgreSQL database via Replit
  - Atualizadas configurações do Supabase para usar environment variables
  - Aplicadas correções para Replit Autoscale deployment

## Changelog

Changelog:
- June 26, 2025. Initial setup and deployment fixes applied