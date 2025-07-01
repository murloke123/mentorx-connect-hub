# Mentora Ai Platform

## Overview

Mentora Ai is a comprehensive mentoring platform that connects experienced mentors with learners through courses, exclusive materials, and personalized mentoring sessions. The platform features a modern tech stack with React frontend, Express.js backend, Supabase database, and Stripe payment integration.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with Tailwind CSS styling
- **State Management**: TanStack React Query for server state management
- **Authentication**: Supabase Auth integration
- **Payment UI**: Stripe checkout integration with custom forms

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL via Supabase with direct SQL queries
- **Payment Processing**: Stripe API with connected accounts for marketplace functionality
- **File Storage**: Supabase Storage for course materials and documents
- **Environment Management**: Centralized configuration system

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Supabase
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage buckets for images, documents, and course content
- **Session Management**: PostgreSQL session store with connect-pg-simple

## Key Components

### User Management System
- **Roles**: Admin, Mentor, and Mentorado (Student) with distinct permissions
- **Profiles**: Extended user profiles with categories, bio, and social media integration
- **Authentication**: Email/password authentication with automatic profile creation

### Course Management System
- **Course Creation**: Rich course builder with modules and content support
- **Content Types**: Video (external), rich text, and PDF content support
- **Landing Pages**: Dynamic landing page builder for course marketing
- **Enrollment System**: Free and paid course enrollment with progress tracking

### Payment and Monetization
- **Stripe Integration**: Connected accounts for direct mentor payments
- **Marketplace Model**: Platform fee structure with automatic splits
- **Document Verification**: KYC compliance with document upload and verification
- **Checkout Flow**: Secure payment processing with enrollment automation

### Content Delivery
- **Course Player**: Progressive course player with lesson tracking
- **Module Organization**: Hierarchical content structure (Course → Module → Content)
- **Progress Tracking**: Student progress monitoring and completion certificates

## Data Flow

### User Registration Flow
1. User completes registration form with role selection
2. Supabase Auth creates user account
3. Profile record created in profiles table
4. Mentors automatically get Stripe connected account creation initiated
5. Email verification and role-specific dashboard access

### Course Purchase Flow
1. Student selects course and initiates checkout
2. Stripe checkout session created with mentor's connected account
3. Payment processed with platform fee deduction
4. Enrollment record created in matriculas table
5. Student gains access to course content

### Content Management Flow
1. Mentor creates course with basic information
2. Modules are added with ordering system
3. Content items are added to modules (video, text, PDF)
4. Course is published and becomes available for enrollment

## External Dependencies

### Core Services
- **Supabase**: Database, authentication, and file storage
- **Stripe**: Payment processing and marketplace functionality
- **Replit**: Hosting and deployment platform

### Frontend Libraries
- **UI Components**: Radix UI primitives with shadcn/ui styling
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Tabler Icons and Lucide React
- **Animations**: Framer Motion for micro-interactions
- **Confetti**: Canvas-confetti for celebration effects

### Backend Dependencies
- **Database ORM**: Direct Supabase client queries
- **File Processing**: Native Node.js file handling
- **Security**: Environment-based configuration with validation

## Deployment Strategy

### Environment Configuration
- **Development**: Local development with environment variables
- **Production**: Replit deployment with automatic PostgreSQL database
- **Health Checks**: `/health` endpoint for deployment monitoring
- **Port Configuration**: Configured for port 5000 as required by Autoscale

### Build Process
- **Frontend**: Vite build process with TypeScript compilation
- **Backend**: ESBuild bundling for optimized server deployment
- **Static Assets**: Served from dist/public directory

### Security Measures
- **HTTPS Enforcement**: Automatic HTTPS redirects in production
- **Security Headers**: Comprehensive security headers implementation
- **Environment Validation**: Required environment variables validation
- **CORS Configuration**: Proper cross-origin request handling

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```