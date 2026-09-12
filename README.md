# API Workspace

A full-stack collaborative API development platform for creating, organizing, executing, and managing API requests within shared workspaces.

## ✨ Features

- 🔐 JWT-based user authentication
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
- 🛡️ Workspace-level authorization and protected APIs
- 📱 Responsive web interface

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │      React UI        │
                         │  TypeScript + Vite   │
                         │      Tailwind CSS    │
                         └──────────┬───────────┘
                                    │
                         REST API / WebSocket
                                    │
                         ┌──────────▼───────────┐
                         │     Spring Boot      │
                         │       Backend        │
                         │                      │
                         │  Authentication      │
                         │  Workspaces          │
                         │  Collections         │
                         │  API Requests        │
                         │  Environments        │
                         │  Execution History   │
                         │  Activity Logs       │
                         │  WebSocket           │
                         └──────────┬───────────┘
                                    │
                              JPA / JDBC
                                    │
                         ┌──────────▼───────────┐
                         │      PostgreSQL      │
                         │       Supabase       │
                         └──────────────────────┘


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
WebSocket / STOMP
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

The application uses JWT-based authentication.

User Registration
       ↓
Password hashed using BCrypt
       ↓
User Login
       ↓
JWT generated
       ↓
JWT sent with API requests
       ↓
JWT authentication filter
       ↓
Protected resources

Passwords are never stored in plain text.

👥 Workspace & Collaboration

Users can create workspaces and manage workspace members.

Workspace functionality includes:

Workspace creation
Member management
Role-based workspace access
In-app member invitations
Invitation acceptance/rejection
Workspace activity tracking

Real-time collaboration is implemented using Spring WebSocket with STOMP and SockJS.

Client
  ↓
STOMP / SockJS
  ↓
Spring WebSocket
  ↓
Workspace Topic
  ↓
Connected Workspace Members
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
Get Requests
Get Request by ID
Update Request
Delete Request
Duplicate Request
Execute Request
⚡ API Execution

The backend uses Spring WebClient to execute HTTP requests dynamically.

Frontend
   ↓
Request Configuration
   ↓
Spring Boot Backend
   ↓
WebClient
   ↓
Target API
   ↓
Response
   ↓
Frontend

This keeps external API execution on the backend rather than directly exposing the process to the browser.

🌱 Environment Variables

The platform supports environment variables for managing reusable API configuration such as:

Base URLs
API keys
Tokens
Other request parameters

This allows requests to be configured once and reused across different environments.

📜 Execution History & Activity Logs

The system maintains:

API execution history
Workspace activity logs
Request-related actions

This provides visibility into API usage and workspace changes.

🚀 Getting Started
Prerequisites

Make sure you have installed:

Java 21+
Node.js
PostgreSQL
Git
1. Clone the Repository
git clone <repository-url>
cd API_Workspace
2. Start the Backend
cd backend/api-workspace
./mvnw spring-boot:run

On Windows:

.\mvnw.cmd spring-boot:run

Configure the required environment variables:

DATABASE_URL=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET=
3. Start the Frontend
cd frontend/api-workspace-ui
npm install
npm run dev

Configure:

VITE_API_BASE_URL=http://localhost:8080

The frontend will be available at:

http://localhost:5173
🌐 Deployment

The application is deployed using:

Frontend  → Vercel
Backend   → Render
Database  → Supabase PostgreSQL

The backend is containerized using Docker for deployment.

Production configuration is managed through environment variables rather than hardcoded credentials or connection details.

🔒 Security

The application implements:

JWT authentication
BCrypt password hashing
Protected API endpoints
Workspace-level authorization
CORS configuration
Environment-based secrets
Backend-side authorization checks

Sensitive credentials are not committed to the repository.

📌 Future Improvements
API collection import/export
OpenAPI / Swagger integration
Advanced request comparison
More granular workspace permissions
Scalable message broker for large-scale real-time collaboration
Enhanced API testing and automation
📄 License

This project is developed for educational and portfolio purposes.


### One small recommendation

For the GitHub version, I'd put **Live Demo** immediately below the intro:

```markdown
## 🌐 Live Demo

**Frontend:** <your-vercel-url>  
**Backend:** <your-render-url>

And obviously replace <repository-url> and the demo URLs with your actual links.
