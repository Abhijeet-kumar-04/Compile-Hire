# CompileHire Server Application

This directory contains the Express Node.js backend for CompileHire. It acts as the secure intermediary between the client application and the PostgreSQL database, validating all incoming requests via Clerk authentication tokens.

## Core Technologies

*   **Node.js & Express.js:** The core runtime and web framework handling API routing and middleware.
*   **Prisma ORM:** A next-generation Object-Relational Mapper used to define the database schema and execute type-safe queries.
*   **PostgreSQL:** The primary relational database, hosted via Neon Tech.
*   **Clerk Backend SDK:** Middleware utilized to verify JWT tokens passed from the client application, ensuring secure API endpoints.
*   **CORS:** Configured to allow secure cross-origin requests from the specified Next.js client domain.

## Database Schema Architecture

```mermaid
erDiagram
    User ||--o{ Interview : "completes"
    User {
        string id PK "Clerk User ID"
        string email
        string name
        datetime createdAt
    }
    Interview {
        string id PK
        string userId FK
        string title
        string code
        string feedback
        int score
        datetime createdAt
    }
```

## Directory Structure

```text
server/
├── prisma/                 # Database configuration
│   ├── schema.prisma       # Prisma schema definitions
│   └── migrations/         # SQL migration history
├── src/
│   ├── index.js            # Main server entry point & route definitions
│   └── ...                 # Additional API controllers/services
├── .env                    # Local environment variables
└── package.json            # Server dependencies and scripts
```

## Environment Configuration

To run the server application locally, you must create a `.env` file in the root of the `server` directory with the following variables:

```env
# Server Port Configuration
PORT=5000

# Prisma Database Connection
DATABASE_URL="postgresql://user:password@host/database"

# Clerk Authentication Verification
CLERK_SECRET_KEY=your_clerk_secret_key
```

## API Endpoints

All endpoints require a valid Bearer token provided by Clerk in the `Authorization` header.

*   `GET /api/history` - Retrieves all completed interviews for the authenticated user.
*   `POST /api/save-interview` - Saves a new interview session record to the database for the authenticated user.

## Scripts

*   `npm run dev`: Starts the Node.js server using `nodemon` on `localhost:5000`.
*   `npx prisma studio`: Opens the Prisma Studio GUI to view and modify database records.
*   `npx prisma db push`: Pushes the current Prisma schema state to the connected database.
