# API Workspace

A full-stack API development platform for creating, organizing, executing, and managing API requests within shared workspaces.

## ✨ Features

- 🔐 JWT-based authentication
- 🔑 Secure password hashing using BCrypt
- 👥 Workspace creation and member management
- 📩 In-app workspace invitations
- 📁 Collection-based API request organization
- 🔗 Create, view, update, delete, and duplicate API requests
- ⚡ Execute HTTP requests directly from the workspace
- 🌱 Environment variable management
- 📜 API execution history
- 📋 Workspace activity logs
- 🤝 Real-time collaboration using WebSockets
- 🛡️ Workspace-level authorization
- 📱 Responsive web interface

---

## 🌐 Live Demo

**Frontend:** https://api-workspace-frontend.vercel.app

**Backend:** https://api-workspace-backend.onrender.com

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│       React Frontend         │
│  TypeScript + Vite +         │
│       Tailwind CSS           │
└──────────────┬───────────────┘
               │
       REST API / WebSocket
               │
               ▼
┌──────────────────────────────┐
│       Spring Boot API        │
│                              │
│  Authentication              │
│  Workspaces                  │
│  Collections                 │
│  API Requests                │
│  Environment Variables       │
│  Execution History           │
│  Activity Logs               │
│  WebSocket Collaboration     │
└──────────────┬───────────────┘
               │
            JPA / JDBC
               │
               ▼
┌──────────────────────────────┐
│      PostgreSQL Database     │
│           Supabase           │
└──────────────────────────────┘
```
🛠️ Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
Axios
STOMP.js
SockJS
Backend
Java 21
Spring Boot
Spring Security
Spring Data JPA
JWT
BCrypt
Spring WebClient
WebSocket
STOMP
Maven
Database & Infrastructure
PostgreSQL
Supabase
Docker
Deployment
Vercel — Frontend
Render — Backend
Supabase — Database
📂 Project Structure
API_Workspace/
│
├── backend/
│   └── api-workspace/
│       ├── src/
│       ├── pom.xml
│       ├── mvnw
│       ├── mvnw.cmd
│       └── Dockerfile
│
├── frontend/
│   └── api-workspace-ui/
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
│
└── README.md
🔐 Authentication

The application uses JWT-based authentication with BCrypt password hashing.

User Registration
       │
       ▼
Password Hashed using BCrypt
       │
       ▼
User Login
       │
       ▼
JWT Generated
       │
       ▼
JWT Sent with API Requests
       │
       ▼
JWT Authentication Filter
       │
       ▼
Protected Resources

Passwords are never stored in plain text.

👥 Workspace & Collaboration

Users can create workspaces and manage workspace members.

Workspace functionality includes:

Workspace creation
Workspace member management
Workspace-level authorization
In-app member invitations
Accepting and rejecting invitations
Workspace activity tracking
Invitation Flow
Workspace Owner / Admin
          │
          ▼
     Invite Member
          │
          ▼
    Enter User Email
          │
          ▼
   Create Invitation
          │
          ▼
Invited User Sees Invite
          │
      ┌───┴───┐
      ▼       ▼
   Accept   Reject
      │
      ▼
Workspace Member Added
🤝 Real-Time Collaboration

Real-time workspace collaboration is implemented using Spring WebSocket with STOMP and SockJS.

React Client
     │
     ▼
STOMP / SockJS
     │
     ▼
Spring WebSocket
     │
     ▼
Workspace Topic
     │
     ▼
Connected Workspace Members

This allows workspace-related updates to be communicated between connected users in real time.

📁 API Request Management

API requests are organized using collections.

Each request can contain:

HTTP method
URL
Headers
Query parameters
Request body

Supported operations include:

Create Request
View Requests
View Request by ID
Update Request
Delete Request
Duplicate Request
Execute Request
⚡ API Execution

The backend uses Spring WebClient to execute HTTP requests dynamically.

Frontend
   │
   ▼
Request Configuration
   │
   ▼
Spring Boot Backend
   │
   ▼
Spring WebClient
   │
   ▼
Target API
   │
   ▼
Response
   │
   ▼
Frontend

External API requests are executed through the backend rather than directly from the browser.

🌱 Environment Variables

The platform supports environment variables for reusable API configuration.

Examples include:

Base URLs
API keys
Tokens
Request parameters

This allows API requests to be configured once and reused across different environments.

📜 Execution History

The system maintains API execution history to keep track of previously executed requests.

Execution history provides visibility into:

Executed requests
Request configuration
API responses
Execution details
📋 Activity Logs

Workspace activity logs provide visibility into important workspace actions.

Examples include:

Workspace changes
Member-related actions
Request-related actions
Other workspace activities
🛡️ Security

The application implements multiple security mechanisms:

JWT-based authentication
BCrypt password hashing
Protected API endpoints
Workspace-level authorization
CORS configuration
Environment-based secrets
Backend-side authorization checks

Sensitive credentials are stored using environment variables and are not committed to the repository.

🚀 Getting Started
Prerequisites

Make sure the following are installed:

Java 21+
Node.js
PostgreSQL
Git
Maven
1. Clone the Repository
git clone <repository-url>
cd API_Workspace
2. Configure the Backend

Navigate to the backend:

cd backend/api-workspace

Configure the required environment variables:

DATABASE_URL=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET=
3. Start the Backend
Linux / macOS
./mvnw spring-boot:run
Windows
.\mvnw.cmd spring-boot:run

The backend runs on:

http://localhost:8080
4. Configure the Frontend

Navigate to the frontend:

cd frontend/api-workspace-ui

Create a .env file:

VITE_API_BASE_URL=http://localhost:8080
5. Install Dependencies
npm install
6. Start the Frontend
npm run dev

The frontend will be available at:

http://localhost:5173
🌐 Deployment

The application is deployed using:

Frontend
   │
   ▼
 Vercel
   │
   ▼
Spring Boot Backend
   │
   ▼
 Render
   │
   ▼
PostgreSQL
   │
   ▼
Supabase
Deployment Stack
Component	Platform
Frontend	Vercel
Backend	Render
Database	Supabase
Containerization	Docker

Production configuration is managed through environment variables rather than hardcoded credentials.

🔧 Environment Configuration
Frontend
VITE_API_BASE_URL=<backend-url>
Backend
DATABASE_URL=<database-url>
DATABASE_USER=<database-user>
DATABASE_PASSWORD=<database-password>
JWT_SECRET=<jwt-secret>

Never commit secrets or database credentials to GitHub.

📌 Future Improvements
API collection import/export
OpenAPI / Swagger integration
Advanced request comparison
More granular workspace permissions
Scalable message broker for large-scale collaboration
Enhanced API testing and automation
Additional workspace collaboration features
