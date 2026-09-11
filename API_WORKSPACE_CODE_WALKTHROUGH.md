# API Workspace — Source-grounded code walkthrough

**Scope and evidence.** This document follows the files present under `frontend/api-workspace-ui` and `backend/api-workspace`. It deliberately distinguishes **[MY CODE]** (something visible in this repository) from **[FRAMEWORK/SYSTEM]** (normal browser, Vite, Spring, database, or network behaviour). Where the repository is internally inconsistent or a feature is configured but unused, that is called out rather than repaired in the explanation.

## 0. Executive runtime map

```text
Browser tab
  -> http://localhost:5173  -> Node/Vite development server
  -> index.html -> /src/main.tsx -> React root -> App routes
  -> Axios REST requests (JWT header) ------------------------------+
  -> SockJS/STOMP frames (JWT native CONNECT header) ---------------+|
                                                                   ||
Spring Boot JVM / embedded servlet server (normally :8080)         ||
  SecurityFilterChain -> JwtAuthenticationFilter -> Controller -> Service
  -> Repository -> Hibernate/JPA -> PostgreSQL                      ||
  -> WebClient -> target HTTP/HTTPS API                             ||
  STOMP inbound interceptors -> simple in-memory broker             ||
                                                                   ||
REST response <-----------------------------------------------------+|
STOMP MESSAGE <------------------------------------------------------+ 
  -> Zustand state update -> components subscribed to that slice render
```

`frontend/api-workspace-ui/vite.config.ts` does **not** configure an API proxy. `frontend/api-workspace-ui/src/services/api.ts` obtains Axios's base URL from `VITE_API_BASE_URL`; its actual value is not visible in this source tree. The WebSocket client, however, is hard-coded to `http://localhost:8080/ws` in `src/services/websocketService.ts`.

---

## 1. “I type http://localhost:5173 in the browser”

### 1.1 Address, process, and first network exchange

**WHO:** browser, then the Vite Node process.

**[SYSTEM]** `localhost` is a hostname normally resolved by the OS hosts configuration to a loopback address (`127.0.0.1` for IPv4 and/or `::1` for IPv6). It identifies the same computer, not a public server. `5173` is the TCP port on which the Vite development server normally listens. A port lets the OS route a connection to a particular listening process on one IP address.

**[MY CODE]** `frontend/api-workspace-ui/package.json` defines `npm run dev` as `vite`; it does not explicitly set a port, so `5173` is Vite's usual development default. The exact process currently listening is not visible from source; after `npm run dev`, it is normally a Node.js process hosting Vite.

**[SYSTEM]** The browser resolves `localhost`, opens a TCP connection to the selected loopback address and port, and sends an HTTP request such as `GET / HTTP/1.1`. Vite returns HTML. Because this is local loopback traffic, it normally never leaves the computer's network interface.

### 1.2 Initial HTML and modules

**WHO:** `frontend/api-workspace-ui/index.html`.

**WHAT:** Vite serves this document for `/` in development. It contains:

```html
<div id="root"></div>
<script type="module" src="/src/main.tsx"></script>
```

The root `<div>` is initially empty. The browser sees the module script, requests `/src/main.tsx`, and Vite transforms TypeScript/TSX and follows its imports on demand. In a Vite dev session, this is module-by-module development serving, not necessarily one production bundle. `npm run build` instead runs `tsc -b && vite build`, creating a deployable static build.

### 1.3 React start and routes

**WHO:** `frontend/api-workspace-ui/src/main.tsx`.

**INPUT:** `document.getElementById("root")`.

**PROCESS:** `ReactDOM.createRoot(...).render(<React.StrictMode><App/></React.StrictMode>)` creates React's client root and renders `App`.

**DETAIL:** `StrictMode` is development tooling. React may intentionally mount/render and re-run effects in ways that expose unsafe side effects during development. It is not a second production application instance.

**WHO:** `frontend/api-workspace-ui/src/App.tsx`.

`App` first selects `initialize` from `authStore` and calls it in a `useEffect`. It creates a `BrowserRouter` and defines these routes:

| Path | Element | Gate |
|---|---|---|
| `/` | `Login` | `PublicRoute` |
| `/signup` | `Signup` | `PublicRoute` |
| `/dashboard` | `Dashboard` | `ProtectedRoute` |
| `/workspaces/:workspaceId` | `WorkspacePage` | `ProtectedRoute` |
| `/workspaces/:workspaceId/activity` | `WorkspaceActivityPage` | **No `ProtectedRoute` in this file** |

`BrowserRouter` reads the browser location and chooses the matching route. `ProtectedRoute.tsx` reads `isAuthenticated` from Zustand and redirects to `/` if false. `PublicRoute.tsx` redirects an authenticated user to `/dashboard`.

### 1.4 Authentication before and after login

**WHO:** `frontend/api-workspace-ui/src/store/authStore.ts`.

The store is constructed with `token: localStorage.getItem("token")` and `isAuthenticated: !!localStorage.getItem("token")`. `App`'s `initialize()` repeats that read. There is no JWT expiry check or `/me` validation in this code. Therefore React knows “logged in” only because a token string exists in local storage; it does **not** have a separately stored user object here, although logout and Axios's 401 handler also remove a `user` key if another part of the app wrote one.

**WHY:** browser `localStorage` survives page refreshes for the origin. This is convenient, but source-visible code does not protect a local-storage JWT from an XSS compromise.

---

## 2. Frontend map: actual responsibilities and call chains

### 2.1 Layout and component ownership

| File/family | Actual responsibility |
|---|---|
| `src/pages/Login/Login.tsx`, `Signup/Signup.tsx` | Form UI; Login calls store action then navigates. |
| `src/pages/Dashboard/Dashboard.tsx` | Dashboard UI; it consumes workspace actions (not the browser entry point). |
| `src/pages/Workspace/WorkspacePage.tsx` | Route-level coordinator: loads workspace/collections/environments, opens collaboration connection, reacts to `latestEvent`. |
| `src/components/workspace/*` | Collection and request sidebars, cards, menus, activity panel and modals. |
| `src/components/requests/*` | Request configuration/editor, headers, params, auth, body, response, history and dialogs. |
| `src/components/environment/*` | Environment selection, environment CRUD UI and variable CRUD UI. |
| `src/components/collaboration/activeCollaborators.tsx` | Connection status plus collaborator avatars/count. |
| `src/store/*` | Zustand stores for each business domain. |
| `src/services/*` | Thin Axios endpoint adapters; no business state is stored here. |
| `src/types/*` | Compile-time TypeScript contracts only; no runtime requests or persistence. |
| `src/utils/environmentResolver.ts`, `requestValidation.ts`, `apiError.ts` | Client-side convenience validation/resolution/error formatting; server remains authoritative. |

### 2.2 Axios chain

**WHO:** `src/services/api.ts`.

It creates one Axios instance. Before every request, the request interceptor reads `localStorage.getItem("token")` and, when present, assigns `config.headers.Authorization = "Bearer " + token`. On response error `401`, its response interceptor removes `token` and `user`, shows `alert("Session expired. Please login again.")`, and sets `window.location.href = "/"`.

All domain services import that instance. Examples:

```text
WorkspaceStore.fetchWorkspaceById
 -> workspaceService.getWorkspaceById
 -> api.get('/workspaces/{id}')

CollectionStore.createCollection
 -> collectionService.createCollection
 -> api.post('/workspaces/collection/{workspaceId}/createCollection', body)

ExecutionStore.executeRequest
 -> executionService.executeRequest
 -> api.post('/workspaces/{w}/collections/{c}/requests/{r}/execute/{e}')
```

Axios resolves its promise with `response.data`; stores call Zustand `set(...)`; components which selected the changed slice re-render. Service functions do not themselves trigger rendering.

### 2.3 Workspace Page — actual mount order

**WHO:** `src/pages/Workspace/WorkspacePage.tsx` when route `/workspaces/:workspaceId` wins.

1. `useParams()` returns `workspaceId` as a **string**.
2. On the data-loading effect, it converts the string with `Number`, calls `fetchWorkspaceById(id)`, `fetchCollections(id)`, and `fetchEnvironments(id)`, without awaiting between them. Those three REST requests may overlap. On cleanup it clears selected workspace, collections and all environment state.
3. A separate effect calls `connectCollaboration(id)` and cleanup calls `disconnectCollaboration()`.
4. A third effect watches `latestEvent`. For the same numeric workspace: `COLLECTION` calls `fetchCollections`; `ENVIRONMENT` or `VARIABLE` calls `fetchEnvironments`; `REQUEST` calls `fetchRequests` only when event data has `sourceCollectionId` and/or `targetCollectionId`.
5. While workspace store `loading` is true it renders “Loading...”. Once `selectedWorkspace` is present it renders `CollectionsSidebar`, `EnvironmentManager`, `RequestsSidebar`, and `RequestEditor`.

**Important actual limitation:** `WorkspaceEventService` creates `WorkspaceEvent` with `action`, `resourceType`, `resourceName`, `username`, and time; its shown constructor has no workspace ID or source/target collection IDs. `WorkspacePage` expects `latestEvent.workspaceId`, `sourceCollectionId`, and `targetCollectionId`. The compatibility of those fields cannot be established from the shown DTO/service code; for ordinary backend events, the refresh logic may not run as intended.

### 2.4 Selection-to-editor chain

`collectionSidebar.tsx` maps `collections` and calls `CollectionStore.selectCollection(collection)`. `requestsSidebar.tsx` has an effect that, after a collection selection, calls its request-store fetch. Clicking a request calls its selection handler (which invokes `fetchRequestById` and associated header/query/history actions in the omitted middle portion of that file). `RequestStore` stores `selectedRequest`; `requestEditor.tsx` reads it. No selected request means the editor intentionally renders its “Select a request” placeholder. A selected request renders `RequestEditorHeader`, tab editor, `ResponseViewer`, and, when route and collection IDs exist, `HistoryPanel`.

### 2.5 Draft and execution chain

`requestEditorHeader.tsx` changes method/URL by calling `RequestStore.updateRequestDraft`, not an immediate backend request. Its Save button calls `saveRequest(workspaceId, selectedRequest.collection.id)`. Send requires a selected request, numeric workspace ID, and selected environment. It locally calls `validateRequestUrl`, then:

```text
RequestEditorHeader.handleSend
 -> ExecutionStore.executeRequest
 -> executionService.executeRequest
 -> Axios POST execute endpoint
 -> on success ExecutionStore.response changes
 -> ResponseViewer (which consumes that store) can render it
 -> HistoryStore.fetchHistory runs afterwards
```

`resolveEnvironmentVariables` and `findUnresolvedVariables` are used in the header for preview/error display. The backend independently resolves and validates variables; browser preview does not authorize or change the outgoing backend call.

---

## 3. Login: exact application code path

### 3.1 Browser to Axios

**WHO:** `src/pages/Login/Login.tsx`.

`handleLogin` prevents the native form navigation, puts its local `loading` state true, and calls `authStore.login({ email, password })`. On success it calls `navigate('/dashboard')`; on failure it displays `err.response?.data?.message ?? 'Login Failed'`.

**WHO:** `src/store/authStore.ts` -> `src/services/authService.ts`.

The service sends `POST /users/login` with JSON shaped by `LoginRequest` (the fields used are email and password). It returns the backend response data. Store `login` requires `response.token`, writes that exact string as local-storage `token`, and sets `{ token, isAuthenticated: true }`.

### 3.2 Backend login code

**WHO:** `backend/api-workspace/src/main/java/api_workspace/config/SecurityConfig.java`.

`/users/login` and `/users/signup` are `permitAll`; the JWT filter still runs but finds no Bearer header and continues. Controller method `UserController.login` receives validated `LoginRequest` and calls `UserService.login`.

**WHO:** `service/UserService.java`.

1. `userRepository.findByEmail(request.getEmail())` derives a JPA query from the method name.
2. If null, it throws `RuntimeException("User not found")`.
3. `passwordEncoder.matches(plainInput, exists.getPassword())` compares the submitted password with the BCrypt hash stored on `User`.
4. It calls `jwtService.generateToken(exists.getEmail())` and returns `new LoginResponse(token)`.

**WHO:** `service/JwtService.java`.

It creates a JJWT token with subject = user email, `iat` = now, `exp` = one hour after now, and uses an HMAC signing key made by UTF-8 encoding `jwt.secret` configured in `application.properties`. It explicitly signs with `HS256`. A JWT is signed, not encrypted: its header/payload are base64url encoded and readable by anyone holding it; the signature detects modification. The source adds no custom role/user-id claims. Expiration is validated by JJWT parsing; `extractUserEmail` catches all exceptions and returns null.

**Security fact directly visible in code:** `JwtService.extractUserEmail` prints the configured JWT secret. `application.properties` has a committed secret and PostgreSQL password. Both should be rotated; this is not a production-safe configuration.

### 3.3 Signup

`UserController.signup` calls `UserService.signup`: it creates `User`, BCrypt-encodes the supplied password, checks `findByEmail`, then persists it. The controller returns the entity, so whether password serialization is exposed depends on Jackson defaults/no getter visibility; `User` has Lombok getters. This needs explicit response DTO/masking in a production version.

---

## 4. Normal authenticated REST request: create collection

Use `POST /workspaces/collection/{workspaceId}/createCollection` as a concrete path.

**WHO:** a create dialog under `src/components/workspace/createCollectionModal.tsx` (opened by `collectionSidebar.tsx`).

**CHAIN:** dialog -> `CollectionStore.createCollection(workspaceId, request)` -> `collectionService.createCollection` -> shared Axios -> HTTP network -> Spring security -> `CollectionController` -> `CollectionService` -> repositories/JPA -> PostgreSQL -> JSON response -> store refresh -> React list render.

**[SYSTEM] Spring request handling:** The embedded web server is brought up by `ApiWorkspaceApplication.main()` calling `SpringApplication.run`. This repository does not explicitly name Tomcat; Spring Boot's web MVC starter normally supplies an embedded servlet server, but exact active server implementation/configuration should be verified from running dependencies/logs.

**WHO:** `JwtAuthenticationFilter.doFilterInternal`.

For non-`/ws` requests, it reads HTTP `Authorization`. Missing/not-Bearer header simply continues the filter chain. A Bearer value uses `substring(7)`, parses email through `JwtService`, queries `UserRepository.findByEmail`, and creates a `UsernamePasswordAuthenticationToken` whose principal is the project `User`, whose credentials are null, and whose only authority is `USER`. It places it in `SecurityContextHolder`. The filter is inserted before Spring's `UsernamePasswordAuthenticationFilter` in `SecurityConfig`.

**WHY:** `SecurityFilterChain` is the ordered gate in front of MVC controller dispatch. `.anyRequest().authenticated()` rejects a request without an authentication established by a filter. This code has no custom authentication entry point visible, so exact error body for unauthenticated requests is framework/default behaviour plus `GlobalExceptionHandler` only if applicable. An invalid JWT becomes `email == null`, no Authentication is installed, and the protected endpoint is denied later.

**WHO:** `Controller/CollectionController.java` and `service/CollectionService.java`.

The controller delegates. The service obtains `Authentication` from `SecurityContextHolder`, casts its principal to `User`, validates workspace and membership using `WorkspaceRepository` and `WorkspaceMemberRepository.findByWorkspaceAndUser`, then disallows `VIEWER` mutations. It creates/updates/deletes using JPA repositories and emits activity/realtime events where implemented.

**[SYSTEM] JPA:** repository calls result in Hibernate SQL appropriate to the operation, using the configured PostgreSQL datasource. Exact SQL is dynamically generated and not fully visible in source; `spring.jpa.show-sql=true` asks Hibernate to log it.

**Authentication vs authorization:** authentication asks “which user is this?” (JWT -> `User` principal). Authorization asks “may that user do this?” Here, first Spring's authenticated gate runs; then many services separately enforce workspace membership/`VIEWER` role. A valid JWT alone does not make a user a member.

---

## 5. Entity and relational model

### 5.1 Source-visible mappings

| Java entity / source | Table and important mapping |
|---|---|
| `entity/User.java` | `users`; generated `id`; unique `email`; inverse `@OneToMany(mappedBy="user") workspaceMemberships`, JSON ignored. |
| `entity/Workspace.java` | `workspaces`; `created_by` many-to-one `User`; inverse collection of members with `cascade=ALL`, `orphanRemoval=true`; `@CreatedDate createdAt`. |
| `entity/WorkspaceMember.java` | `workspace_members`; generated id; owning many-to-one `workspace_id` and `user_id`; enum `role` stored as string; `joinedAt` set in constructor. |
| `entity/Collection.java` | `collections`; `workspace_id` and `created_by` many-to-one; `@PrePersist` sets createdAt. It imports auditing types but has no `@EntityListeners` shown. |
| `entity/ApiRequest.java` | `api_requests`; method enum stored string; `collection_id` and `created_by`; inverse headers/query params one-to-many cascade+orphan removal; inverse one-to-one authorization cascade+orphan removal; auditing entity listener. |
| `entity/RequestHeader.java` | `request_header`; owning many-to-one `request_id`; enabled defaults true. |
| `entity/RequestQueryParam.java` | `request_query_params`; owning many-to-one `request_id`; enabled defaults true. |
| `entity/Authorization.java` | `request_authorizations`; auth-type enum; owning `@OneToOne @JoinColumn(name="request_id")`. |
| `entity/Environment.java` | default table name (no `@Table`); owning `workspace_id`; inverse variable list cascade+orphanRemoval. |
| `entity/EnvironmentVariable.java` | default table; owning `environment_id`; key/value. |
| `entity/ExecutionHistory.java` | `execution_history`; `request_id`, `executed_by`, status/body/time/executedAt. |
| `entity/ActivityLog.java` | `activity_logs`; stores `workspaceId`/`workspaceName` as scalar values and `user_id` relation, action/resource enums as strings. |

### 5.2 Why WorkspaceMember exists

The project uses a join entity rather than direct JPA `@ManyToMany` because membership carries data: `role` and `joinedAt`. Example rows:

```text
users:              (7, 'Gahana', 'g@example.com', BCryptHash)
workspaces:         (12, 'Payments', ..., created_by=7)
workspace_members:  (31, workspace_id=12, user_id=7, role='ADMIN', joined_at=...)
                    (32, workspace_id=12, user_id=9, role='VIEWER', joined_at=...)
```

`WorkspaceMember` owns both foreign keys because it has `@JoinColumn`; `User.workspaceMemberships` and `Workspace.members` are inverse sides, identified by `mappedBy`. `cascade=ALL, orphanRemoval=true` on `Workspace.members` means operations through that parent collection can cascade/remove children. `WorkspaceService.deleteWorkspace` also explicitly calls `deleteByWorkspace` before deletion. Actual cascade SQL order remains Hibernate behaviour.

**Auditing caution:** `ApiWorkspaceApplication` has `@EnableJpaAuditing`, enabling auditing infrastructure. `Workspace` and `ApiRequest` declare `@EntityListeners(AuditingEntityListener.class)` and `@CreatedDate`/`@LastModifiedDate`. No `AuditorAware` bean is visible, so automatic “who created it” is not configured; services explicitly set creator where needed. `Collection` uses `@PrePersist` for its timestamp.

---

## 6. Workspace loading and interaction

When `/workspaces/12` mounts, the page issues:

```text
GET /workspaces/12                    -> WorkSpaceController.getWorkspaceById
GET /workspaces/collection/12/getAllcollections -> CollectionController
GET /workspaces/12/environments       -> EnvironmentController
```

The first uses `WorkspaceStore.fetchWorkspaceById`; collection and environment data go into their respective stores. `CollectionsSidebar` merely renders existing store data; it does not fetch initially. Selection drives `RequestsSidebar` effect, which requests collection-specific list data. Request selection drives request/header/query/history reads, and `RequestEditor` renders from that selected state.

**Actual authorization caveat:** `WorkspaceService.getAllWorkspace()` calls `workspaceRepository.findAll()`, and `getWorkspaceById` loads by ID without a membership check in the shown source. Several nested-resource services do check membership. These root workspace reads need hardening before claiming complete workspace isolation.

---

## 7. API execution — browser to backend versus backend to target

### 7.1 Boundary A: browser -> this application

**WHO:** `RequestEditorHeader.handleSend` -> `ExecutionStore` -> `executionService`.

The browser sends **one authenticated POST to this Spring Boot API**. It does not use WebClient and does not call the target URL directly. The exact endpoint is:

```text
POST /workspaces/{workspaceId}/collections/{collectionId}/requests/{requestId}/execute/{environmentId}
Authorization: Bearer <project JWT>
```

`Controller/ApiExecutionController.java` extracts all four path variables and calls `ApiExecutionService.executeRequest(...)`.

### 7.2 My `ApiExecutionService` code

**WHO:** `backend/.../service/ApiExecutionService.java`.

**INPUT:** IDs from path and authenticated `User` principal from `SecurityContextHolder`.

**PROCESS:**

1. Loads Workspace, Collection and ApiRequest and verifies collection -> workspace and request -> collection ownership.
2. Finds `WorkspaceMember` and rejects non-members.
3. Loads Environment and validates it belongs to workspace.
4. Loads environment variables, builds `Map<key,value>`, and performs literal `{{key}}` replacement. Any remaining `{{` or `}}` causes a runtime exception.
5. Builds a `UriComponentsBuilder` from resolved stored URL and adds enabled saved query params. It maps stored `HttpMethodType` only for GET/POST/PUT/PATCH/DELETE. The frontend offers HEAD and OPTIONS, but this service's switch rejects unsupported types; that is a real mismatch.
6. Loads `Authorization`; API-key query auth is added to the URI. It builds a `WebClient` request, applies JSON body only for POST/PUT/PATCH, then adds enabled saved headers. Bearer, Basic, or header API key are applied according to saved auth.
7. Calls `exchangeToMono(clientResponse -> clientResponse.toEntity(String.class)).block()`.
8. Measures elapsed milliseconds and UTF-8 byte length. It writes `ExecutionHistory` with status/body/time/user/time stamp, logs an activity, sends a workspace event, and returns `ApiExecutionResponse` containing status/body/headers/time/size.

### 7.3 Boundary B: Spring Boot -> target API

`config/WebClientConfig.java` defines a default `WebClient.builder().build()` bean. This is separate from browser Axios. WebClient is the Java client that actually makes the external request from the backend JVM. `.exchangeToMono(...).block()` turns its reactive result into a synchronous wait in this service method. No response/connect timeout, outbound destination allowlist, response size limit, retry, or redirect policy is visible in the configuration.

**[SYSTEM] below the code:** for an HTTPS URL, the JVM HTTP client implementation obtains DNS information (unless an IP literal was supplied), opens a socket via the OS, establishes TCP, performs TLS certificate/key negotiation, serializes HTTP method/URL/headers/body, and receives response data back through TCP/TLS/OS buffers. Those kernel/socket implementation details are not represented in this repository; this is standard network behaviour. `WebClient` turns the response into Spring's `ResponseEntity<String>`, which the service turns into DTO data.

**Error semantics visible here:** the use of `exchangeToMono(...toEntity...)` deliberately treats target HTTP 4xx/5xx as ordinary response entities rather than throwing. `WebClientRequestException` becomes “Unable to connect...”; illegal URLs become “Invalid request URL”; other exceptions become “Request execution failed...”. A target API that never answers can hold the request because no explicit timeout appears.

### 7.4 Return and render

Controller wraps response DTO in HTTP 200. Axios resolves it. `ExecutionStore` sets `response`, `loading:false`, `error:null`; any `ResponseViewer` selector render sees the new state. Then `handleSend` asks `HistoryStore` to re-fetch the saved history.

---

## 8. WebSocket/STOMP: actual configuration and exact flow

### 8.1 Terminology

**[SYSTEM] WebSocket** is a persistent full-duplex browser/server connection after an HTTP upgrade (or a fallback transport when SockJS chooses one). **STOMP** is the text-frame messaging protocol layered over it; it supplies commands such as CONNECT, SUBSCRIBE and SEND plus destinations. **SockJS** provides fallback transports for environments without native WebSocket and a compatible client/server handshake mechanism.

**[MY CODE]** `config/WebSocketConfig.java`:

- Registers endpoint `/ws`, permits `http://localhost:5173`, and calls `.withSockJS()`.
- Uses application destination prefix `/app`: messages sent by a client to `/app/join` map to `@MessageMapping("/join")`.
- Enables Spring's in-memory simple broker for `/topic`: server publishing to a `/topic/...` destination is distributed to local subscriptions.
- installs `WebSocketAuthInterceptor` and `WorkspaceSubscriptionInterceptor` on the client inbound channel.

### 8.2 Client connection

**WHO:** `src/services/websocketService.ts`, invoked by `CollaborationStore.connect` from `WorkspacePage`.

It reads local-storage token, constructs STOMP `Client` with `webSocketFactory: () => new SockJS('http://localhost:8080/ws')`, five-second reconnect delay, 10 second heartbeat config/connection timeout, and STOMP native CONNECT header `Authorization: Bearer <token>`. On connection it subscribes to exactly:

```text
/topic/workspaces/{workspaceId}
```

It does **not** send `/app/join` or `/app/editing` anywhere in this service. Therefore `WorkspaceWebSocketController.joinWorkspace` and `.editingRequest` are configured controller methods but are not used by the current shown browser client path.

Representative conceptual STOMP frames (headers/details vary by library):

```text
CONNECT
Authorization:Bearer eyJ...
accept-version:1.2
heart-beat:10000,10000

SUBSCRIBE
id:sub-0
destination:/topic/workspaces/12

MESSAGE
destination:/topic/workspaces/12
content-type:application/json

{"type":"COLLABORATOR_SNAPSHOT", ...}
```

HTTP/SockJS handshake setup, native WebSocket upgrade, and STOMP CONNECT are distinct stages. The HTTP/SockJS request initially reaches `/ws`; STOMP CONNECT is then a protocol message handled by Spring's messaging channel, not a normal MVC REST controller call.

### 8.3 WebSocket authentication

**WHO:** `config/WebSocketAuthInterceptor.java`.

On a STOMP CONNECT, it gets native `Authorization`, demands `Bearer `, extracts/parses using the same `JwtService`, loads `User` by email, creates a `UsernamePasswordAuthenticationToken`, and attaches it through `accessor.setUser(authentication)`. This becomes the STOMP session principal. It is separate from `JwtAuthenticationFilter` because the HTTP filter explicitly skips servlet paths beginning `/ws`, and inbound STOMP frames need per-message channel handling after the handshake.

### 8.4 Subscription authorization and presence

**WHO:** `config/WorkspaceSubscriptionInterceptor.java`.

For only STOMP `SUBSCRIBE` commands whose destination begins `/topic/workspaces/`, it rejects blank/non-numeric/non-positive/multi-segment IDs, verifies `accessor.getUser()` is authenticated with a `User` principal, loads workspace, checks `WorkspaceMemberRepository.findByWorkspaceAndUser`, then invokes `WorkspacePresenceService.userJoined(sessionId, workspaceId, currentUser)`. Thus an otherwise valid JWT for a user outside workspace 1 fails before subscription with an access-denied exception.

**WHO:** `service/WorkspacePresenceService.java`.

It has local JVM maps:

```text
workspaceUsers:     workspaceId -> set of user IDs
sessionWorkspaces:  STOMP session ID -> workspace ID
sessionUsers:       STOMP session ID -> User
```

For workspace 1 with Gahana (id 7) and Puneeth (id 9), conceptually:

```text
workspaceUsers     { 1: {7, 9} }
sessionWorkspaces  { "sA": 1, "sB": 1 }
sessionUsers       { "sA": User(7,Gahana), "sB": User(9,Puneeth) }
```

`userJoined` verifies membership again, inserts maps, and only publishes a snapshot if that user ID was newly added. `publishCollaboratorSnapshot` scans sessions to reconstruct `{userId,userName}` objects and `convertAndSend`s a `COLLABORATOR_SNAPSHOT` to `/topic/workspaces/{id}`. On disconnect, `WebSocketPresenceListener` calls `handleDisconnect`; `userLeft` avoids declaring a user absent if another session/tab for same user/workspace still exists, then sends a new snapshot.

### 8.5 Collaboration store and UI

**WHO:** `src/store/CollaborationStore.ts`.

`connect` clears collaborator state, asks `websocketService` to connect, and provides callbacks. For every received parsed JSON event, it appends to `events`, sets `latestEvent`, and only for type `COLLABORATOR_SNAPSHOT` replaces `activeCollaborators` with `event.collaborators ?? []`. `COLLABORATOR_JOINED` and `COLLABORATOR_LEFT` do **not** alter that array; they only record events. The actual presence service shown emits snapshots, not JOINED/LEFT events, so snapshots are the active mechanism.

`ActiveCollaborators.tsx` subscribes to `activeCollaborators`, `connected`, `error`. It maps the first five entries using `userId` as React key and renders the uppercase first character of `userName`—not multi-letter initials or generated image avatars. It shows `+N` over five and length-based “collaborator(s)”. Green means `connected`; yellow says “Reconnecting...” for any false state, including initial/no-token/error states.

### 8.6 Critical destination mismatch

There are two destination styles in actual backend code:

```text
Presence snapshots: WorkspacePresenceService -> /topic/workspaces/{id}  (plural)
Normal events:      WorkspaceEventService    -> /topic/workspace/{id}   (singular)
Online/edit events: WorkspaceEventService    -> /topic/workspace/{id}/... (singular)
```

The frontend subscribes only to plural `/topic/workspaces/{id}` and `WorkspaceSubscriptionInterceptor` protects only that plural root topic. Therefore, based on this source, collaborators receive presence snapshots but **do not subscribe to the normal event destination** that collection/request/environment services publish. The desired “User 2 creates collection -> User 1 refreshes list” chain is configured in `WorkspacePage` but is not actually completed by the current destination wiring. This must be normalized before claiming live data synchronization works.

### 8.7 Other configured/unused paths

- `Controller/WorkspaceWebSocketController.java` supports `/app/join` (old `SessionRegistryService`/`OnlineUserService`) and `/app/editing` locks, but current `websocketService.ts` neither publishes to either destination nor subscribes to their singular topic destinations.
- `listener/WebSocketEventListener.java` handles disconnect for that older registry/online-user/edit-lock flow. It can run on `SessionDisconnectEvent`, but current subscription-based presence is managed by `WebSocketPresenceListener` and `WorkspacePresenceService`.
- `config/WorkspacePresenceSubscriptionHandler.java` listens for subscription and calls `publishCollaboratorSnapshot` a second time in addition to `WorkspaceSubscriptionInterceptor` calling `userJoined`, which itself can publish. Duplicate snapshots are possible.
- All broker, editing lock and presence maps are in memory. They do not synchronize across JVM instances; restart clears them. `EditingSessionService` additionally locks only by request ID, has no expiry, and releases by ID/name-based events.

---

## 9. End-to-end scenario simulator

### Scenario 1 — browser opens
Browser -> Vite `:5173` -> `index.html` -> `main.tsx` -> React StrictMode/App -> auth store reads local storage -> BrowserRouter -> public/protected route -> page component. No backend request is forced by `App` itself.

### Scenario 2 — user logs in
`Login.handleLogin` -> auth store -> auth service -> Axios POST `/users/login` -> `SecurityConfig` permits endpoint -> `UserController.login` -> `UserService.login` -> `UserRepository.findByEmail` -> BCrypt `matches` -> `JwtService.generateToken` -> `LoginResponse` -> local storage token + Zustand -> `navigate('/dashboard')`.

### Scenario 3 — workspace opens
Protected route permits based on local token presence -> `WorkspacePage` derives path ID -> three REST reads begin -> stores fill -> sidebars render -> collaboration store opens SockJS/STOMP -> CONNECT auth -> plural workspace SUBSCRIBE membership check -> presence snapshot -> active collaborator UI renders.

### Scenario 4 — collection created
Modal -> collection store -> Axios POST -> HTTP JWT authentication -> `CollectionController`/`CollectionService` membership + viewer check -> JPA save -> activity/event publishing. Originator store re-fetches collections. **Remote auto-refresh currently has the singular/plural topic mismatch described above.**

### Scenario 5 — API request created
New request modal -> request store -> `requestService.createRequest` -> `ApiRequestController` -> `ApiRequestService` validates collection/workspace/member/role, writes request, produces event. Local request list refreshes through store logic; remote event delivery has same mismatch.

### Scenario 6 — request edited
Header/body/auth/param components update local request/header/param-specific store state; Save performs corresponding REST mutation. Server checks membership/role in its services. The code shown has no current client publish of the editing-lock `/app/editing` message.

### Scenario 7 — request executed
Header Send -> `ExecutionStore` -> execution POST -> `ApiExecutionController` -> `ApiExecutionService` loads/validates/synthesizes request -> backend `WebClient` reaches target -> response/history/activity -> HTTP DTO -> response Zustand -> `ResponseViewer`; history fetch follows.

### Scenario 8 — two users open same workspace
Each has a STOMP session; each plural subscription is authenticated and membership-authorized; `WorkspacePresenceService` has two session map entries and publishes a snapshot to plural topic. Both client stores replace their collaborator list.

### Scenario 9 — User 2 changes collection
Database mutation and `WorkspaceEventService.sendEvent` happen if method invokes it. That service publishes singular `/topic/workspace/{id}`, while current clients subscribe plural `/topic/workspaces/{id}`. Therefore server message is not delivered to current client subscription; expected `latestEvent` list refresh is not reached unless unshown code subscribes elsewhere.

### Scenario 10 — User 2 refreshes
The old browser disconnect event removes/recalculates presence; new page reconnects and subscribes. Because `userLeft` checks other same-user sessions, a brief disconnect/reconnect can produce snapshot transitions. Exact timing is race-dependent.

### Scenario 11 — non-member subscribes
JWT connects successfully if valid, but SUBSCRIBE reaches `WorkspaceSubscriptionInterceptor`, lookup returns no `WorkspaceMember`, interceptor throws `AccessDeniedException`, and the broker should not allow topic subscription.

### Scenario 12 — token expiry
REST: JJWT parsing returns null; no security authentication is set; protected API is denied and Axios reacts only when it receives status 401. WebSocket: reconnect CONNECT fails `WebSocketAuthInterceptor` with invalid token; the client callback stores an error/reconnecting UI. Exact STOMP error framing is framework behaviour.

### Scenario 13 — transport disconnect/reconnect
STOMP client's `onWebSocketClose` invokes store disconnected callback; because `reconnectDelay=5000` and disconnect was not intentional, client attempts reconnect. On a successful new subscription, presence is registered again and snapshot emitted.

---

## 10. Runtime, processes and lower-level network

### Directly visible from this project

- A browser runs the React client.
- Vite is started by Node through `npm run dev`.
- Spring Boot starts a JVM process through `ApiWorkspaceApplication.main`.
- PostgreSQL endpoint configured is `localhost:5432/api_workspace`.
- Browser REST goes to whatever `VITE_API_BASE_URL` resolves to; browser WebSocket is explicitly `localhost:8080/ws`.
- Spring's outbound `WebClient` executes external HTTP operations.

### Standard behaviour, not a source-level claim

A browser, Node process, JVM, and PostgreSQL server are separate OS processes. They communicate over loopback/network sockets. A TCP connection has a client IP/ephemeral source port and a target IP/listening port. HTTPS adds TLS above TCP. DNS translates a hostname such as `api.example.com` to an address before connecting. TCP carries ordered bytes; HTTP structures request/response messages; packets are handled by the OS network stack. The repository does not set exact server thread counts, OS socket options, TLS versions, DNS cache policy, container runtime, or PostgreSQL process settings, so none should be asserted in an interview as project facts.

`ApiExecutionService` uses a reactive API but calls `.block()`. Do not describe it as an end-to-end non-blocking pipeline: source makes the request-handling path wait for the outbound response. Exact thread names/counts are not configured or visible.

---

## 11. Dependency graphs

```text
WorkspacePage.tsx
  -> WorkspaceStore.fetchWorkspaceById -> workspaceService -> api.ts -> /workspaces/{id}
  -> CollectionStore.fetchCollections -> collectionService -> api.ts -> CollectionController -> CollectionService
  -> EnvironmentStore.fetchEnvironments -> environmentService -> api.ts -> EnvironmentController -> EnvironmentService
  -> CollaborationStore.connect -> websocketService -> SockJS /ws -> STOMP interceptors

RequestEditorHeader.tsx
  -> ExecutionStore.executeRequest -> executionService -> api.ts
  -> ApiExecutionController -> ApiExecutionService
  -> Workspace/Collection/Request/Environment/headers/params/auth repositories
  -> WebClient -> target API
  -> ExecutionHistoryRepository + ActivityLogService + WorkspaceEventService

Browser STOMP /topic/workspaces/{id}
  -> WebSocketConfig
  -> WebSocketAuthInterceptor (CONNECT)
  -> WorkspaceSubscriptionInterceptor (SUBSCRIBE)
  -> WorkspacePresenceService -> SimpMessagingTemplate
  -> websocketService parse JSON -> CollaborationStore.set -> ActiveCollaborators render
```

---

## 12. Interview-ready explanations

### 30 seconds
“API Workspace is a collaborative API testing tool. React and TypeScript provide the workspace UI, Zustand holds client domain state, and Axios calls a Spring Boot/PostgreSQL backend secured with JWT. Users save requests, environments, headers and auth, then the backend uses WebClient to execute the configured request and stores response history. STOMP over SockJS provides workspace presence.”

### 1 minute
“I separated normal persistence from real-time signalling. REST handles durable CRUD—workspaces, collections, requests, environments and history. The React editor holds unsaved draft changes, then stores persist through Axios with a JWT interceptor. On Send, the browser calls my backend, not the target API. The backend verifies membership, resolves environment placeholders, applies query parameters, headers and auth, then WebClient makes the outbound request and records the result. For collaboration, the server authenticates STOMP CONNECT frames with the same JWT and checks workspace membership at SUBSCRIBE time. The current version is a single-instance MVP; I would normalize topic paths and move in-memory broker/presence state to a shared broker/Redis before horizontal scaling.”

### Common follow-up answers grounded in this source

| Question | Accurate answer |
|---|---|
| Why Spring Boot? | It gives this project MVC REST endpoints, Spring Security/JPA integration, validation, WebSocket/STOMP support and a Java WebClient in one JVM application. |
| Why PostgreSQL? | The model is relational: memberships, ownership and request children require foreign-key-style relationships and audit/history queries. |
| Why WorkspaceMember? | It represents membership attributes—role and joined time—which a bare many-to-many cannot model cleanly. |
| Why JWT and BCrypt? | BCrypt stores password hashes; JWT lets later REST/STOMP requests identify a user without a server HTTP session. The JWT subject is email and expires in one hour in this code. |
| Why WebClient? | Browser Axios calls this product's backend. The backend needs a Java HTTP client to call the user-configured external target from the server. That client is WebClient. |
| Why REST plus WebSocket? | REST remains the authoritative data read/write path; WebSocket is for timely collaboration/presence signalling. Current intended event-refresh path needs destination consistency fixed. |
| What happens on disconnect? | STOMP reconnect attempts after five seconds; `WebSocketPresenceListener` removes session state and snapshot-publishes presence. |
| Main production gaps? | Rotate exposed secrets; validate all workspace root access; prevent SSRF; configure outbound timeouts/rate limits/response limits; add tests/migrations; externalize broker/presence state; normalize singular/plural topics. |

---

## 13. What is not present or cannot be concluded

- No Docker, CI/CD, cloud deployment, migration tool, monitoring or load-test configuration is present.
- No explicit outbound timeout, rate limiting, SSRF guard, secret manager, response-body retention policy, or encryption at rest is present.
- No actual browser request trace, SQL log, running process list, packet capture, or database schema output is supplied, so exact runtime port bindings, generated SQL, thread counts, response status details and network packet layout cannot be concluded from source.
- The frontend build succeeds; Maven wrapper testing could not be run in the restricted PowerShell environment used for inspection, so this document does not claim backend tests passed.
