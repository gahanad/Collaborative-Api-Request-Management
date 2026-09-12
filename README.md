# 🚀 API Workspace

A full-stack API development platform for **creating, organizing, executing, and managing API requests within shared workspaces**.

The platform provides functionality similar to API development tools such as Postman, while adding **workspace-based collaboration, environment management, execution history, activity tracking, and real-time updates**.

---

## ✨ Features

### 🔐 Authentication & Security

* JWT-based authentication
* Secure password hashing using BCrypt
* Protected API endpoints
* Workspace-level authorization
* Backend-side authorization checks
* CORS configuration
* Environment-based secret management

### 👥 Workspace Management

* Create and manage workspaces
* Add and manage workspace members
* Workspace-level role-based access
* In-app workspace invitations
* Accept or reject invitations
* Workspace activity tracking

### 📁 API Request Management

* Organize requests using collections
* Create API requests
* View all requests
* View individual request details
* Update requests
* Delete requests
* Duplicate requests
* Configure:

  * HTTP methods
  * URLs
  * Headers
  * Query parameters
  * Request bodies

### ⚡ API Execution

* Execute HTTP requests directly from the workspace
* Dynamic request execution using Spring WebClient
* Backend-based request execution
* View API responses and execution details

### 🌱 Environment Variables

* Manage reusable environment variables
* Support configuration such as:

  * Base URLs
  * API keys
  * Authentication tokens
  * Request parameters
* Reuse variables across API requests

### 📜 Execution History

* Maintain a history of executed API requests
* View previous request configurations
* Store API responses
* Track execution details

### 📋 Activity Logs

Track important workspace activities, including:

* Workspace changes
* Member-related actions
* Request-related actions
* Other workspace activities

### 🤝 Real-Time Collaboration

* Real-time workspace updates
* Spring WebSocket
* STOMP messaging
* SockJS support
* Workspace-specific topics

### 📱 Responsive UI

* Responsive web interface
* Modern React-based UI
* Tailwind CSS styling

---

# 🌐 Live Demo

### Frontend

**https://api-workspace-frontend.vercel.app**

---

# 🏗️ Architecture

```text
┌─────────────────────────────────────┐
│           React Frontend            │
│                                     │
│  TypeScript + Vite + Tailwind CSS  │
│  Axios + STOMP.js + SockJS         │
└──────────────────┬──────────────────┘
                   │
             REST API / WebSocket
                   │
                   ▼
┌─────────────────────────────────────┐
│          Spring Boot API            │
│                                     │
│  Authentication                     │
│  Workspaces                         │
│  Collections                        │
│  API Requests                       │
│  Environment Variables              │
│  Execution History                  │
│  Activity Logs                      │
│  WebSocket Collaboration            │
└──────────────────┬──────────────────┘
                   │
              JPA / JDBC
                   │
                   ▼
┌─────────────────────────────────────┐
│          PostgreSQL Database        │
│              Supabase               │
└─────────────────────────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

| Technology       | Purpose                        |
| ---------------- | ------------------------------ |
| **React**        | UI development                 |
| **TypeScript**   | Type-safe frontend development |
| **Vite**         | Frontend build tooling         |
| **Tailwind CSS** | Styling and responsive UI      |
| **Axios**        | HTTP communication             |
| **STOMP.js**     | WebSocket messaging            |
| **SockJS**       | WebSocket fallback support     |

## Backend

| Technology           | Purpose                          |
| -------------------- | -------------------------------- |
| **Java 21**          | Backend development              |
| **Spring Boot**      | Backend framework                |
| **Spring Security**  | Authentication and authorization |
| **Spring Data JPA**  | Database access                  |
| **JWT**              | Stateless authentication         |
| **BCrypt**           | Password hashing                 |
| **Spring WebClient** | Dynamic API execution            |
| **WebSocket**        | Real-time communication          |
| **STOMP**            | WebSocket messaging protocol     |
| **Maven**            | Dependency management and build  |

## Database & Infrastructure

| Technology     | Purpose                  |
| -------------- | ------------------------ |
| **PostgreSQL** | Relational database      |
| **Supabase**   | Hosted PostgreSQL        |
| **Docker**     | Backend containerization |

## Deployment

| Component        | Platform     |
| ---------------- | ------------ |
| Frontend         | **Vercel**   |
| Backend          | **Render**   |
| Database         | **Supabase** |
| Containerization | **Docker**   |

---

# 📂 Project Structure

```text
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
```

---

# 🔐 Authentication

The application uses **JWT-based authentication** combined with **BCrypt password hashing**.

### Authentication Flow

```text
┌──────────────────────┐
│   User Registration   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Password Hashing     │
│      BCrypt          │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     User Login       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    JWT Generated     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ JWT Sent with        │
│ API Requests         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ JWT Authentication   │
│       Filter         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Protected Resources  │
└──────────────────────┘
```

Passwords are **never stored in plain text**.

---

# 👥 Workspace Management

Users can create workspaces and collaborate with other users.

### Workspace Capabilities

* 🏢 Workspace creation
* 👤 Member management
* 🛡️ Workspace-level authorization
* 📩 Member invitations
* ✅ Accept invitations
* ❌ Reject invitations
* 📋 Activity tracking

---

# 📩 Workspace Invitation Flow

```text
┌─────────────────────────────┐
│    Workspace Owner/Admin    │
└──────────────┬──────────────┘
               │
               ▼
       ┌───────────────┐
       │ Invite Member │
       └───────┬───────┘
               │
               ▼
       ┌────────────────┐
       │ Enter User     │
       │ Email          │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Create         │
       │ Invitation     │
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │ Invited User   │
       │ Receives Invite│
       └───────┬────────┘
               │
          ┌────┴────┐
          ▼         ▼
      ┌───────┐  ┌────────┐
      │Accept │  │ Reject │
      └───┬───┘  └────────┘
          │
          ▼
┌─────────────────────────────┐
│ Workspace Member Added      │
└─────────────────────────────┘
```

---

# 🤝 Real-Time Collaboration

Real-time collaboration is implemented using **Spring WebSocket with STOMP and SockJS**.

### Communication Flow

```text
┌──────────────────┐
│   React Client   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  STOMP / SockJS  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Spring WebSocket │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Workspace Topic  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Connected Workspace      │
│ Members                  │
└──────────────────────────┘
```

This allows workspace-related updates to be communicated to connected members in real time without requiring continuous manual refreshes.

---

# 📁 API Request Management

API requests are organized into **collections**, allowing users to structure and manage related APIs within a workspace.

Each API request can contain:

* 🌐 HTTP method
* 🔗 URL
* 📋 Headers
* 🔍 Query parameters
* 📝 Request body

### Supported Operations

| Operation          | Supported |
| ------------------ | :-------: |
| Create Request     |     ✅     |
| View Requests      |     ✅     |
| View Request by ID |     ✅     |
| Update Request     |     ✅     |
| Delete Request     |     ✅     |
| Duplicate Request  |     ✅     |
| Execute Request    |     ✅     |

---

# ⚡ API Execution

The backend uses **Spring WebClient** to dynamically execute configured HTTP requests.

### Execution Flow

```text
┌──────────────────────┐
│    Frontend User     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Request Configuration│
│                      │
│ Method               │
│ URL                  │
│ Headers              │
│ Query Params         │
│ Body                 │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Spring Boot       │
│       Backend        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Spring WebClient  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Target API      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Response       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    React Frontend    │
└──────────────────────┘
```

External API requests are executed through the **backend**, rather than directly from the browser.

This provides a centralized execution layer and avoids relying on browser-side cross-origin behavior for target APIs.

---

# 🌱 Environment Variables

The platform supports reusable environment variables for API configuration.

### Example Use Cases

```text
BASE_URL
API_KEY
AUTH_TOKEN
USER_ID
REQUEST_PARAMETER
```

For example:

```text
{{BASE_URL}}/users/{{USER_ID}}
```

This makes it possible to reuse the same request configuration across different environments.

### Benefits

* ♻️ Reusable configuration
* 🔄 Easy environment switching
* 🔐 Avoid hardcoding sensitive values
* ⚙️ Simplified API configuration

---

# 📜 Execution History

The system maintains execution history for previously executed API requests.

Execution history provides visibility into:

* 📌 Executed requests
* 🌐 Request configuration
* 📥 API responses
* ⏱️ Execution details
* 📊 Previous API executions

This allows users to review and inspect previous API interactions.

---

# 📋 Activity Logs

Workspace activity logs provide visibility into important actions performed within a workspace.

Examples include:

* 🏢 Workspace changes
* 👥 Member-related actions
* 📁 Collection changes
* 🔗 API request actions
* ⚙️ Other workspace activities

This provides an audit trail of important workspace operations.

---

# 🛡️ Security

The application implements multiple security mechanisms.

### Authentication

* JWT-based authentication
* BCrypt password hashing
* Protected API endpoints

### Authorization

* Workspace-level authorization
* Backend authorization checks
* Member access validation

### Application Security

* CORS configuration
* Environment-based secrets
* No hardcoded credentials
* Sensitive configuration excluded from source control

Sensitive credentials such as database passwords and JWT secrets are stored using environment variables and are **not committed to GitHub**.

---

# 🚀 Getting Started

## Prerequisites

Make sure the following are installed:

* **Java 21+**
* **Node.js**
* **Git**
* **Maven**
* **PostgreSQL** (if running a local database)

---

## 1. Clone the Repository

```bash
git clone <repository-url>

cd API_Workspace
```

---

# 2. Configure the Backend

Navigate to the backend directory:

```bash
cd backend/api-workspace
```

Configure the required environment variables:

```env
DATABASE_URL=
DATABASE_USER=
DATABASE_PASSWORD=
JWT_SECRET=
```

---

# 3. Start the Backend

### Linux / macOS

```bash
./mvnw spring-boot:run
```

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

The backend will run on:

```text
http://localhost:8080
```

---

# 4. Configure the Frontend

Navigate to the frontend:

```bash
cd frontend/api-workspace-ui
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

# 5. Install Dependencies

```bash
npm install
```

---

# 6. Start the Frontend

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

---

# 🌐 Deployment

The application is deployed using a cloud-based architecture.

```text
┌──────────────────────┐
│      React App       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Vercel         │
│      Frontend        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Render         │
│   Spring Boot API    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Supabase        │
│     PostgreSQL       │
└──────────────────────┘
```

### Deployment Stack

| Component        | Platform |
| ---------------- | -------- |
| Frontend         | Vercel   |
| Backend          | Render   |
| Database         | Supabase |
| Containerization | Docker   |

Production configuration is managed using environment variables instead of hardcoded credentials.

---

# 🔧 Environment Configuration

## Frontend

```env
VITE_API_BASE_URL=<backend-url>
```

## Backend

```env
DATABASE_URL=<database-url>
DATABASE_USER=<database-user>
DATABASE_PASSWORD=<database-password>
JWT_SECRET=<jwt-secret>
```

> ⚠️ **Never commit secrets, database credentials, JWT secrets, or production environment files to GitHub.**

---

# 🐳 Docker

The backend includes a Dockerfile for containerized deployment.

```text
backend/
└── api-workspace/
    └── Dockerfile
```

Docker provides a consistent runtime environment for deploying the Spring Boot backend.

---

# 📈 Future Improvements

The following features can be added in future versions:

* 📥 API collection import/export
* 📤 API collection sharing
* 📖 OpenAPI / Swagger integration
* 🔍 Advanced request comparison
* 🛡️ More granular workspace permissions
* 📨 Email-based workspace invitations
* 🧪 Enhanced API testing and automation
* 🤖 Automated API test suites
* 📊 Advanced execution analytics
* 🔄 Request versioning
* 🤝 Enhanced real-time collaboration
* 📨 Scalable message broker for large-scale collaboration
* ⚡ Improved distributed execution architecture

---

# 🎯 Project Highlights

This project demonstrates practical experience with:

* **Full-stack application development**
* **REST API design**
* **JWT authentication**
* **Spring Security**
* **Role/workspace-based authorization**
* **Relational database design**
* **API request execution**
* **WebSocket-based real-time communication**
* **STOMP messaging**
* **Environment configuration**
* **Docker containerization**
* **Cloud deployment**
* **React + TypeScript frontend development**

---

# 👩‍💻 Author

**Gahana D.**

Built as a full-stack project to explore **API development platforms, backend architecture, authentication, authorization, API execution, and real-time collaboration**.
