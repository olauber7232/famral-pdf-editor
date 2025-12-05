# Famral PDF Editor

## Overview

Famral PDF Editor is a browser-based PDF editing application that enables users to edit, sign, annotate, merge, split, compress, protect, and convert PDF documents entirely in the browser. The application provides a comprehensive suite of PDF manipulation tools with a modern, user-friendly interface built using React and TypeScript.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR (Hot Module Replacement)
- **Wouter** for lightweight client-side routing instead of React Router
- **Zustand** for state management, providing a simple and efficient alternative to Redux

**UI Component Library**
- **shadcn/ui** components built on top of Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom theme configuration
- Custom fonts: Inter (sans-serif) and Outfit (headings) from Google Fonts
- Component styling follows the "new-york" variant from shadcn/ui

**PDF Processing**
- **pdf.js** (pdfjs-dist) for rendering and extracting text from PDF documents
- **pdf-lib** for creating, modifying, and manipulating PDF documents
- Custom utilities for PDF operations (merge, split, compress, convert, protect)
- Canvas-based rendering for displaying PDF pages as images
- Text extraction and overlay system for editable text elements

**State Management Architecture**
- Centralized store using Zustand (`client/src/lib/store.ts`)
- Manages file state, PDF pages, layers, active tools, and editable elements
- Layer system for organizing different element types (text, image, shape, annotation)
- Support for both original PDF text and user-added elements

**Editor Features**
- **Canvas-based editing**: React Draggable for moveable elements
- **Tool system**: Select, text, sign, draw, image, and annotation tools
- **Panel-based workflows**: Dedicated panels for compress, protect, convert, and page tools
- **Inline text editing**: Real-time text modification with formatting options
- **Signature support**: Draw or upload signatures using react-signature-canvas
- **Drawing tools**: Pen, eraser, shapes (line, rectangle, circle)
- **Annotation tools**: Highlight, strikethrough, underline, squiggle, redaction

### Backend Architecture

**Server Framework**
- **Express.js** for HTTP server and API routing
- Node.js with ESM (ES Modules) support
- TypeScript compilation for type safety

**Development Environment**
- Vite dev server middleware integration for hot reloading in development
- Custom error overlay plugin for runtime error display
- Replit-specific plugins for development banner and cartographer

**Session Management**
- Express session middleware setup (prepared for future use)
- In-memory session storage with connect-pg-simple configured for PostgreSQL

**Build Process**
- Custom build script (`script/build.ts`) using esbuild for server bundling
- Selective dependency bundling to reduce cold start times
- Separate client and server build outputs

### Data Storage Solutions

**Database Configuration**
- **Drizzle ORM** configured with PostgreSQL dialect
- Schema defined in `shared/schema.ts` with user authentication structure
- Migration support via drizzle-kit
- Database credentials managed through environment variables

**Storage Interface**
- Abstract storage interface (`IStorage`) for potential multiple backends
- In-memory storage implementation (`MemStorage`) for development
- User CRUD operations with UUID-based identifiers

**Client-Side Storage**
- LocalStorage for tracking download limits (5 downloads per day)
- File state managed in Zustand store, not persisted

### Design Patterns

**Component Organization**
- Feature-based organization: editor components separated by functionality
- Shared UI components in `client/src/components/ui`
- Layout components (Navbar, Footer) for consistent site structure
- Page-level components for routing

**Type Safety**
- Shared types between client and server in `shared/` directory
- Zod schemas for runtime validation using drizzle-zod
- TypeScript strict mode enabled

**Error Handling**
- Toast notifications for user feedback using shadcn/ui toast
- Custom error modal overlay in development
- API error handling with status code checking

**Code Reusability**
- Custom hooks for common patterns (useToast, useIsMobile)
- Utility functions (cn for className merging)
- Shared PDF utility functions for various operations

## External Dependencies

### Third-Party Services

**CDN Resources**
- Google Fonts for Inter and Outfit typefaces
- Famral favicon hosted at famral.com

**PDF Libraries**
- pdfjs-dist worker configuration using local worker file
- Note: Previous CORS issues with CDN-hosted workers resolved by using local worker

### Development Tools

**Replit Integration**
- `@replit/vite-plugin-runtime-error-modal` for development error display
- `@replit/vite-plugin-cartographer` for code navigation
- `@replit/vite-plugin-dev-banner` for development environment indicator
- Custom meta images plugin for OpenGraph image handling on Replit deployments

### UI Component Dependencies

**Radix UI Primitives** (comprehensive set)
- Dialog, Dropdown Menu, Popover, Tooltip, Toast
- Accordion, Tabs, Collapsible, Navigation Menu
- Form controls: Checkbox, Radio Group, Select, Slider, Switch
- Avatar, Aspect Ratio, Scroll Area, Separator

**Additional Libraries**
- TanStack Query (React Query) for data fetching and caching
- class-variance-authority for component variant management
- cmdk for command palette functionality
- date-fns for date manipulation
- file-saver for client-side file downloads
- JSZip for creating zip archives
- react-draggable for moveable UI elements
- react-dropzone for file upload (if used)
- react-signature-canvas for signature capture

### Database & ORM

- @neondatabase/serverless for PostgreSQL connections
- Drizzle ORM with PostgreSQL adapter
- connect-pg-simple for PostgreSQL session storage

### Build & Development

- esbuild for fast server bundling
- Vite with React and Tailwind plugins
- PostCSS with Tailwind CSS and Autoprefixer
- tsx for TypeScript execution in development