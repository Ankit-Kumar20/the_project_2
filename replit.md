# TravelFlow - AI-Powered Travel Itinerary Planner

## Overview

TravelFlow is a Next.js application that generates visual travel itineraries using AI. The app creates interactive flow diagrams showing day-by-day travel plans with locations, activities, and connections. Users can manipulate their itineraries through a natural language chatbot that restructures the entire trip graph based on their requests.

**Core Features:**
- AI-generated travel itineraries with real-time web data (via Exa AI)
- Interactive ReactFlow diagrams showing trip progression
- Natural language chatbot for graph manipulation
- Google Maps integration for each location
- PDF export functionality
- Persistent storage with automatic saving

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** Next.js 15 (Pages Router) with React 19

**Key UI Libraries:**
- ReactFlow 11 - Interactive flow diagrams for travel visualization
- Motion (Framer Motion) - Animations and transitions
- Phosphor Icons - Icon system
- Tailwind CSS 4 - Utility-first styling with custom CSS variables

**Design System:**
- Black & white wireframe aesthetic
- CSS custom properties for theme switching (light/dark mode)
- Responsive design with mobile-first approach
- No shadows or gradients - clean, high-contrast interface

**State Management:**
- React hooks (useState, useCallback, useEffect)
- ReactFlow's built-in state management for nodes/edges
- Session state via Better Auth client
- Theme context for dark/light mode

**Key Pages:**
- `/` - Landing page with authentication
- `/dashboard` - Trip list and management
- `/canvas` - Interactive trip visualization and editing

### Backend Architecture

**Runtime:** Node.js with Next.js API Routes

**Database Layer:**
- PostgreSQL database (via Neon serverless)
- Drizzle ORM for type-safe queries
- Schema includes: users, sessions, accounts, trips, verification

**Authentication:**
- Better Auth library for session management
- Google OAuth integration
- Email/password authentication
- Session-based auth with secure token storage

**AI Integration:**
- OpenAI GPT-4o-mini for natural language processing
- Exa AI for real-time travel information retrieval
- Structured output using Zod schemas
- Two primary AI workflows:
  1. Trip generation (from user inputs)
  2. Graph restructuring (from chatbot queries)

**API Architecture Pattern:**
- RESTful endpoints under `/api/*`
- JSON request/response format
- Session validation middleware
- Error handling with appropriate HTTP status codes

**Key Endpoints:**
- `POST /api/trips/create` - Generate new trip with AI
- `GET /api/trips/[id]` - Retrieve trip data
- `PATCH /api/trips/[id]` - Update trip (auto-save)
- `DELETE /api/trips/delete` - Remove trip
- `POST /api/chatbot/graph-command` - Natural language graph manipulation
- `POST /api/enhance-pdf-details` - Enrich trip data for PDF export
- `POST /api/distance` - Google Maps distance calculations

### Data Storage Solutions

**Primary Database:**
- PostgreSQL hosted on Neon
- Connection pooling via `postgres` library
- Drizzle ORM with type-safe schema definitions

**Schema Design:**

1. **User Table** - Better Auth standard user data
2. **Session Table** - Active user sessions with tokens
3. **Account Table** - OAuth provider connections
4. **Trips Table** - Core trip data structure:
   - Metadata: name, dates, travellers, preferences
   - Graph data: stored as JSON text (nodes and edges)
   - User relationship via foreign key
   - Timestamps for created/updated tracking

**Data Persistence Strategy:**
- Debounced auto-save (1.5 second delay)
- Complete graph replacement on each save
- No incremental updates - entire JSON structure replaced
- Optimistic UI updates with async persistence

### Core Design Patterns

**1. Complete JSON Restructuring (Chatbot)**

Instead of incremental commands, the chatbot receives the entire graph JSON, restructures it completely, and returns a new graph:

```
Database → Graph JSON → User Query → LLM Restructures → New Graph JSON → Database
```

This simplifies state management and ensures consistency.

**2. Node ID = Day Number Synchronization**

All nodes maintain strict ID-to-day mapping:
- Day 1 location has ID "1"
- Day 2 location has ID "2"
- When removing nodes, all subsequent nodes are renumbered

This ensures graph integrity and simplifies edge management.

**3. Custom ReactFlow Components**

- Custom node component with Google Maps integration
- Custom edge component with distance display
- Post-processing to ensure all nodes use `custom` type

**4. Debounced Auto-Save**

Graph changes trigger a debounced save function that prevents excessive database writes while ensuring data persistence.

### Authentication and Authorization

**Provider:** Better Auth with Drizzle adapter

**Supported Methods:**
- Google OAuth (primary)
- Email/password (enabled but unused in UI)

**Session Management:**
- 7-day session expiration
- Token-based authentication
- Session refresh every 24 hours
- Secure HTTP-only cookies

**Authorization Pattern:**
- All trip endpoints validate session
- User can only access their own trips
- Database queries filter by `userId`

## External Dependencies

### Third-Party APIs

**OpenAI API** (`@ai-sdk/openai`, `ai`)
- Model: GPT-4o-mini
- Purpose: Trip generation and chatbot responses
- Structured output using Zod schemas
- Rate limiting considerations: Standard OpenAI limits

**Exa AI** (`exa-js`)
- Purpose: Real-time travel information retrieval
- Searches web for attraction details, recommendations
- Used during trip generation to enrich location data
- Provides up-to-date travel content

**Google Maps API**
- Distance Matrix API for travel distances
- Maps Search API for location links
- Requires API key in environment

### Database Service

**Neon PostgreSQL**
- Serverless Postgres database
- Connection via `@neondatabase/serverless`
- Auto-scaling and connection pooling
- Environment variable: `DATABASE_URL`

### Authentication Service

**Better Auth** (`better-auth`)
- OAuth integration (Google)
- Session management
- Requires:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `BETTER_AUTH_SECRET`
  - `BETTER_AUTH_TRUSTED_ORIGINS`

### Required Environment Variables

```
DATABASE_URL=<neon-postgres-connection-string>
OPENAI_API_KEY=<openai-api-key>
EXA_API_KEY=<exa-api-key>
GOOGLE_MAPS_API_KEY=<google-maps-api-key>
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
BETTER_AUTH_SECRET=<random-secret-string>
BETTER_AUTH_TRUSTED_ORIGINS=<comma-separated-urls>
NEXT_PUBLIC_BETTER_AUTH_URL=<auth-base-url>
```

### Build Dependencies

- TypeScript for type safety
- ESLint for code quality
- Drizzle Kit for database migrations
- PostCSS for CSS processing