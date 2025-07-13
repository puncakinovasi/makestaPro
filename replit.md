# Replit.md - Makesta Project

## Overview

This is a comprehensive Event Management System called "Makesta" built with a modern full-stack architecture. The application provides role-based functionality for three types of users: participants (peserta), instructors (pemateri), and organizers (panitia). It handles event registration, material management, attendance tracking, grading, and certificate generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Authentication Credentials
- Admin/Panitia: username: "admin" or "panitia", password: "password123"
- Pemateri: username: "pemateri", password: "password123"
- Peserta: username: "peserta", password: "password123"

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: React Query (@tanstack/react-query) for server state
- **UI Components**: Radix UI components with custom styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESNext modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with bcrypt for password hashing
- **File Uploads**: Multer for handling file uploads
- **Database Provider**: Neon Database (serverless PostgreSQL)

## Key Components

### Authentication System
- JWT-based authentication with role-based access control
- Three user roles: peserta (participant), pemateri (instructor), panitia (organizer)
- Password hashing with bcryptjs
- Token-based authorization middleware

### Database Schema
- **Users**: Core user information with role assignment
- **Participants**: Extended profile for event participants
- **Instructors**: Instructor profiles with specializations
- **Materials**: File management for learning materials
- **Attendance Sessions**: Session management for attendance tracking
- **Attendance Records**: Individual attendance tracking
- **Grades**: Participant evaluation system
- **Certificates**: Digital certificate generation

### Role-Based Dashboards
- **Participant Dashboard**: View materials, attend sessions, track progress
- **Instructor Dashboard**: Manage attendance sessions, view participants
- **Organizer Dashboard**: Full administrative control, manage all entities

### File Management
- File upload functionality with size limits (10MB)
- Material download tracking with increment counters
- Secure file serving with authentication

## Data Flow

1. **User Registration/Login**: Users register with role assignment, authenticate via JWT
2. **Role-Based Access**: Different dashboard views based on user role
3. **Material Management**: Organizers upload materials, participants download
4. **Attendance Tracking**: Instructors create sessions, participants mark attendance
5. **Evaluation**: Grading system with certificate generation

## External Dependencies

### Frontend Dependencies
- React ecosystem (React, React DOM, React Router via Wouter)
- UI components from Radix UI
- Form handling with React Hook Form and Zod validation
- Styling with Tailwind CSS and class-variance-authority
- Icons from Lucide React

### Backend Dependencies
- Express.js for API server
- Drizzle ORM with PostgreSQL dialect
- Authentication libraries (jsonwebtoken, bcryptjs)
- File upload handling (multer)
- Database connection via Neon serverless

### Development Dependencies
- TypeScript for type safety
- Vite for build tooling
- ESLint and other development tools
- Replit-specific plugins for development environment

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- Express server with TypeScript compilation via tsx
- Database migrations handled by Drizzle Kit
- Environment variables for database connection

### Production Build
- Frontend: Vite build process generating static assets
- Backend: esbuild bundling for Node.js deployment
- Database: Neon serverless PostgreSQL (automatically provisioned)
- File storage: Local filesystem (uploads directory)

### Configuration
- Shared TypeScript configuration across frontend/backend
- Path aliases for clean imports (@, @shared, @assets)
- PostCSS configuration for Tailwind processing
- Drizzle configuration for database schema management

The application follows a monorepo structure with shared schema definitions, making it easy to maintain type safety across the full stack while providing a comprehensive event management solution.

## Recent Updates (July 2025)
- ✅ Complete authentication system with role-based access control
- ✅ Fully functional admin dashboard with all CRUD operations
- ✅ Participant data export functionality with CSV download
- ✅ Material management with file upload/download capabilities
- ✅ Grade management system with validation
- ✅ Certificate generation for participants
- ✅ Attendance tracking system for instructors
- ✅ Complete API routes for all entities
- ✅ Working delete functionality for materials and instructors
- ✅ Real-time data updates with React Query
- ✅ Responsive design with Tailwind CSS
- ✅ PostgreSQL database with full relations