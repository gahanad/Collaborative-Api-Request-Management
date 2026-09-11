# API Workspace — Interview Q&A

## How to use this sheet

Speak in first person. Start with what is implemented, then add a short production improvement only when relevant. Do **not** claim an exact throughput, CI/CD, OAuth, uploads, distributed WebSocket support, or full access isolation as already implemented—those are not present in the current source.

---

## Product and problem

### What problem does this project solve?

API Workspace centralizes the API-testing workflow for a team. Instead of sharing URLs, headers, tokens, and request examples through messages, users keep them in a shared workspace with collections, environments, execution history, and activity logs. It also adds presence so teammates can see that others are in the same workspace.

### Why did you build this instead of using Postman?

Postman is a mature product; I was not trying to replace it. I built a focused, smaller version to learn the full system design behind collaborative API tooling: request modelling, JWT security, role-based workspaces, server-side request execution, audit history, and WebSocket collaboration. The goal was to understand and demonstrate the engineering, not compete feature-for-feature.

### Who are the target users?

The initial target is small development teams—backend developers, frontend developers, QA engineers, and students—who need a shared place to save and run HTTP requests. The current single-instance design is appropriate for a small-team MVP rather than a large multi-tenant enterprise rollout.

### What makes it different from Postman, Insomnia, or Swagger?

Swagger/OpenAPI primarily documents and explores an API contract. Postman and Insomnia are mature API clients. My project focuses on a lightweight shared workspace: team membership, collections, environments, server-side execution history, activity records, and real-time collaborator presence. It does not currently implement many mature-client features such as OAuth flows, import/export, scripting, GraphQL, multipart upload, or test assertions.

### Is it a developer tool, SaaS product, or internal enterprise tool?

Today it is a developer-tool MVP. The model could become either a hosted SaaS product or an internal enterprise API workspace, but billing, organizations, deployment isolation, SSO, and operational controls are future work.

### What is the main user journey?

1. A user signs up and logs in.
2. They create or open a workspace.
3. An admin invites teammates and assigns roles.
4. The team creates collections, saved requests, headers, authorization, and environments.
5. A user selects an environment and sends a request.
6. The backend runs the target request, returns the result, persists history, and logs activity.
7. Collaborators see presence snapshots; the intended design also refreshes resources after collaboration events.

### What is the MVP?

The MVP is authenticated shared workspaces with request CRUD, collections, environments and variables, headers/query parameters/authentication settings, individual request execution, collection execution, execution history, activity logs, roles, and basic real-time presence.

### Which feature provides the most business value?

Server-side API execution combined with shared environments and stored history. It gives teams reproducible requests without asking each member to manually recreate URLs, headers, and credentials.

### What did you deliberately not build?

I kept the MVP focused. I did not build OAuth 2.0, GraphQL support, multipart file uploads, cookies, pre-request/test scripts, OpenAPI import/export, scheduled runs, public sharing, SSO, CI/CD, Docker deployment, distributed WebSockets, or a production secrets manager.

### What would you build next after user feedback?

First, I would harden security and reliability: secret management, SSRF protection, timeouts, rate limits, stricter workspace authorization, tests, and migrations. After that, I would prioritize feature feedback—most likely import/export, OAuth, richer response tooling, and scheduled/queued collection runs.

### How could it be monetized?

A sensible SaaS model is a free small-team tier, then paid per-seat or per-workspace plans for shared collections, larger execution quotas, longer history retention, organization controls, SSO, audit export, and private deployment. That is a product proposal, not implemented code.

### Which product metrics would you track?

- Active users and active workspaces: adoption and retention.
- Requests executed/day and collection runs/day: core-feature usage.
- p50/p95 execution latency: user experience and target dependency impact.
- Success/failure split: product reliability and target API health.
- WebSocket connect/reconnect success rate: collaboration reliability.
- History-storage growth: database cost and retention pressure.
- API error rate, queue/concurrency saturation, and authorization denials: operational and security signals.

---

## High-level architecture

### Explain the architecture end to end.

The frontend is a React and TypeScript single-page application served in development by Vite. React Router maps pages, Zustand stores client state, and Axios calls the Spring Boot REST API. Axios attaches the JWT from local storage to protected requests.

The Spring Boot backend has controllers for HTTP endpoints, services for business rules, repositories for JPA persistence, and entities mapped to PostgreSQL. For API execution, the browser calls my backend; the backend validates workspace access, resolves environment variables, and uses Spring WebClient to call the external target API. It stores execution history and activity logs.

For collaboration, the frontend uses STOMP over SockJS. The backend authenticates STOMP CONNECT frames with JWT and checks workspace membership at SUBSCRIBE time. Presence state is maintained in memory and published as snapshots.

### Why React and Spring Boot?

React is suitable for an editor-like UI with many independently updating panels: sidebars, request editor, environment selector, response viewer, and history. TypeScript adds compile-time contracts around request and response data. Spring Boot gave me a cohesive Java backend with MVC, Security, Validation, JPA, WebSocket/STOMP, and WebClient support. It let me build REST, authentication, persistence, and real-time messaging in one consistent ecosystem.

### Why a monolith instead of microservices?

The system is an MVP with tightly related domains and one team/product boundary. A modular monolith is simpler to build, test, deploy, and debug. Premature microservices would add distributed deployment, observability, messaging, network failure, and data-consistency complexity. I would extract execution workers first only when outbound execution load demanded separate scaling.

### How does frontend communicate with backend?

For durable CRUD and execution operations it uses Axios over HTTP REST. `src/services/api.ts` creates one Axios client and attaches `Authorization: Bearer <token>`. For real-time collaboration it uses a STOMP client over SockJS, connecting to `http://localhost:8080/ws` with the JWT as a STOMP CONNECT header.

### Which operations use REST and which use WebSockets?

REST is the authoritative path for signup/login, workspaces, collections, requests, headers, parameters, environments, execution, history, and activity logs. WebSockets are for presence and collaboration notifications. The intended design is “WebSocket tells a client data changed; REST re-fetches canonical data.”

### Why not use WebSockets for everything?

CRUD benefits from request/response semantics, standard HTTP status codes, easy retries, predictable error handling, and clear persistence boundaries. WebSockets are better for server-pushed low-latency events. Using one persistent messaging channel for every CRUD operation would make consistency, retries, request correlation, and debugging harder without adding value.

### How is the backend separated into layers?

Controllers map HTTP paths and extract request/path data. Services implement validation, membership checks, business rules, activity logging, and event publishing. Repositories expose database operations through Spring Data JPA. Entities model persisted tables and relationships. DTOs shape API inputs/outputs so transport contracts are separate from persistence where used.

### What happens after clicking Send?

`RequestEditorHeader` calls `ExecutionStore.executeRequest`, which calls `executionService`, which POSTs to `ApiExecutionController`. `ApiExecutionService` loads and validates workspace, collection, request, environment and membership; resolves variables; builds URL, headers, auth and body; then calls the external target with `WebClient`. It returns target status/body/headers/timing/size, saves execution history, writes activity, and updates the React execution store so `ResponseViewer` can render the result.

### What is the most complex backend flow?

The request-execution flow. It combines authorization, data ownership validation, variable interpolation, URL/query construction, multiple auth modes, outbound HTTP execution, target error handling, response measurement, persistence, activity logging, and collaboration notification.

### Which parts are stateful and stateless?

The React/Zustand stores are browser-tab state. PostgreSQL holds durable user/workspace/request/history data. The REST backend can mostly be treated as stateless because identity is in JWT and durable data is in PostgreSQL. However, the current WebSocket broker, presence maps, online-user maps, and editing locks are stateful in one JVM. That is why the present collaboration design is single-instance.

### What breaks after a backend restart?

Durable PostgreSQL data remains. Existing REST calls can reconnect normally with a valid JWT. But in-memory WebSocket presence, online-user records, sessions, editing locks, and simple-broker subscriptions disappear. Clients must reconnect and resubscribe; transient editing lock information is lost.

---

## Frontend

### Why React instead of Angular or Vue?

I chose React because the application is an interactive editor-style interface. Its component composition and hook model fit panels that own local UI state while Zustand holds shared domain state. Angular or Vue could also solve it; this was a productivity and ecosystem choice, not a claim that React is universally better.

### Why TypeScript?

The app passes nested data across pages, stores, API services, and WebSocket payloads. Types such as `RequestDetail`, `ExecutionResponse`, and workspace/environment contracts catch field mismatches before runtime and make refactoring safer.

### Why Vite?

Vite provides a fast local development server, native module-based development, TypeScript/React support, and a production build command. The source uses it as the frontend toolchain, not as a backend proxy; the Axios base URL is environment-configured.

### Why Zustand instead of Redux?

Zustand kept this project lightweight. Each domain has a focused store—auth, workspace, collection, request, environment, execution, history, and collaboration—without Redux boilerplate. It also lets a component subscribe to just the slice it needs.

### Why not use React Context for all global state?

Context is useful for stable cross-cutting values, but a frequently changing global context can cause broad re-renders and becomes difficult to organize. Zustand provides independent stores and selectors, so a response update need not make unrelated workspace components read new state.

### How is state organized in Zustand?

The stores follow business domains. `authStore` keeps token/authentication state; `WorkspaceStore` keeps list and selected workspace; `CollectionStore` keeps collections and selected collection; `RequestStore` keeps request list, selected request, draft/save state; `EnvironmentStore` keeps environments/variables/selection; `ExecutionStore` keeps latest execution; `HistoryStore` keeps history; `CollaborationStore` keeps WebSocket connection, event, and collaborators.

### How do you prevent unnecessary re-renders?

Components select the pieces they need from a Zustand store instead of consuming every domain globally. For example, `ActiveCollaborators` selects only collaborators, connection state, and error. In a production refinement I would use stable selectors/shallow equality where selecting multiple derived values becomes expensive, and profile large request lists before optimizing.

### How are loading, errors, and empty states handled?

Stores set `loading` and domain `error` values around async calls. Components render loading messages, failure text, or empty placeholders. Examples are “Loading collections…”, “No collections found”, request-side error/empty states, workspace loading, and execution-store error handling. This is implemented per domain rather than with one global error boundary.

### How does login survive page refresh?

The JWT is saved under `localStorage['token']`. `authStore` initializes from that value and `App` calls `initialize()` in an effect. A token's mere presence makes `isAuthenticated` true locally. The server validates it again on protected requests.

### Where is JWT stored? Is local storage safe?

Currently it is stored in local storage for simplicity. This is workable for an MVP but not ideal against XSS because JavaScript can read it. In production I would use short-lived access tokens and secure, HTTP-only, same-site refresh-token cookies, plus strong Content Security Policy and XSS prevention.

### How do protected routes work?

`ProtectedRoute.tsx` reads `isAuthenticated` from `authStore`. If false, it returns React Router `<Navigate to='/' />`; otherwise it renders children. This is only a user-experience gate. The backend still validates the JWT and authorization for every protected operation.

### How do you handle 401?

The Axios response interceptor in `src/services/api.ts` removes stored token/user, alerts the user that the session expired, and navigates with `window.location.href = '/'`. A future refinement would avoid alert and hard navigation in favour of a consistent route/state flow.

### How do you avoid duplicate API calls?

The current code avoids duplicate WebSocket connections by returning early if its STOMP client is active/connected. It disables Send while `ExecutionStore.loading` and disables Save while saving/no changes. It does not yet provide a general idempotency key or request-deduplication mechanism for all HTTP mutations; I would add one for operations where double submission matters.

### Why Axios instead of fetch?

Axios gives a configured base URL, request/response interceptors, JSON defaults, and uniform error objects. The JWT attachment and global 401 handling are centralised in one client instead of repeated in every service. Fetch could also work but requires those conventions to be implemented manually.

### How does Monaco improve body editing?

The project includes `@monaco-editor/react` and `bodyEditor.tsx`, providing an editor-oriented experience for structured request bodies rather than a plain textarea. It is useful for readability and editing JSON-like content. Exact language features/configuration should be described only as present in that component, not assumed beyond source.

### How do you validate before execution?

The Send handler checks selected request, route workspace ID, selected environment, and URL using `validateRequestUrl`. It previews variable resolution. The backend repeats critical validation: membership, resource ownership, environment ownership, unresolved variables, valid URI construction, and supported HTTP method. Server validation is authoritative.

### How would you improve accessibility?

Use semantic buttons and labels consistently, keyboard-operable dialogs, visible focus management, ARIA labels/descriptions for icon controls, escape-to-close modals, focus trapping, colour-independent status indicators, screen-reader announcements for request results/errors, and contrast testing. I would test with keyboard navigation and a screen reader rather than assuming visual UI is sufficient.

### How would you optimize frontend bundle size?

Code-split route-level pages, lazy-load Monaco because it is relatively heavy, audit dependencies, serve hashed build assets with compression/CDN caching, and inspect bundle output. I would measure with a bundle analyser before changing code.

### Where would you use code splitting?

At least dashboard, workspace, activity page, and request-body Monaco editor. The login route is small and should remain immediately available; the workspace editor and activity/history screens are good lazy-load candidates.

### How would you support dark mode?

Use CSS variables or Tailwind theme tokens with light/dark semantic colours, persist a user preference or honour `prefers-color-scheme`, then ensure components no longer hard-code one-off gray/blue values. I would add visual regression checks for both themes.

### How would you make it responsive?

The editor has multiple wide sidebars, so I would preserve a desktop-first workspace but turn sidebars into drawers/tabs on smaller screens, allow horizontal/vertical panel resizing, keep send/save actions reachable, and test touch interactions. A complex API editor should not simply shrink every panel until unusable.

---

## Backend and Spring Boot

### Why Spring Boot?

It provides the integrations this project needs: REST controllers, validation, Spring Security/JWT filter placement, JPA/Hibernate, PostgreSQL configuration, STOMP WebSockets, and `WebClient`. It lets the product use one strongly typed Java backend rather than manually wiring many libraries.

### Explain controller, service, repository and entity layers.

Controllers expose paths and convert HTTP request data to method arguments. Services own business rules: membership checks, role restrictions, object relationships, execution, activity and events. Repositories provide persistence methods, such as `findByEmail` or `findByWorkspaceAndUser`. Entities represent table mappings and relationships. DTOs are used for many input/output shapes so API responses need not always expose entity structure.

### Why DTOs rather than directly returning entities?

DTOs make the external API contract deliberate, avoid accidental recursive/lazy serialization, and prevent sensitive persistence fields from leaking. The project already uses DTOs extensively for login, workspace summaries/details, requests, execution/history, environments, and errors. One improvement is to ensure signup also returns a safe DTO rather than a `User` entity.

### What is dependency injection?

Spring creates and manages application objects (beans) and passes required dependencies through constructors. For example, `ApiExecutionService` receives repositories, activity/event services, and `WebClient`; it does not create them itself. This reduces coupling and makes testing/mocking easier.

### Difference between `@Component`, `@Service`, `@Repository`, and `@RestController`?

All register beans. `@Component` is generic, used for interceptors/listeners. `@Service` communicates business-logic intent. `@Repository` communicates persistence intent and enables persistence exception translation; here repository interfaces extend `JpaRepository`. `@RestController` combines controller behaviour with response-body serialization for REST endpoints.

### Why Spring Data JPA?

It removes repetitive CRUD SQL and lets repository method names express common queries, such as `findByEmail`, `findByWorkspace`, and paginated activity-log queries. Hibernate handles entity mapping, relationships, dirty checking and generated SQL.

### What is Hibernate’s role?

Hibernate is the JPA provider used by Spring Boot in this setup. It maps Java entities to PostgreSQL tables, turns repository operations into SQL, tracks entity changes inside a persistence context, and handles relation loading/cascades. JPA is the abstraction; Hibernate is the implementation doing the work.

### What is lazy loading?

Lazy loading postpones fetching an associated entity/collection until code accesses it. `ApiRequest.collection` and `createdBy` explicitly use `FetchType.LAZY`. It avoids eagerly loading unrelated rows but can create extra database queries or serialization problems if accessed outside a transaction.

### What is the N+1 problem?

It occurs when one query loads N parent records, then lazy access causes one additional query per parent. For example, rendering many requests and reading an association for each could turn one intended list query into N+1 queries. I would inspect SQL/logs, then use projections, fetch joins, entity graphs, or batch fetching for verified hot paths.

### How are transactions managed?

Spring Data repository write methods run within framework transactions as appropriate. The source explicitly marks `WorkspaceService.deleteWorkspace` with `@Transactional` because deleting membership rows, logging, and deleting workspace should succeed or roll back together. I would add `@Transactional` at service boundaries for multi-step durable operations where atomicity matters.

### Where should `@Transactional` be used?

On service methods that must be all-or-nothing and/or need a persistence context across related entity work: workspace deletion, request creation with dependent settings, membership change, environment deletion plus variables, and history cleanup. I would not add it blindly around slow outbound WebClient calls; that can hold database transactions while waiting on a network dependency.

### Why global exception handling?

`GlobalExceptionHandler` centralizes mapping failures to consistent HTTP error shapes rather than every controller duplicating try/catch. The project has `ErrorResponse` and `ValidationErrorResponse`. A future refinement is to replace generic `RuntimeException`s with domain exceptions and consistent error codes/statuses.

### What HTTP status codes does the API return?

Successful controller operations generally return 200 by default or response bodies; exact status varies by controller. Validation errors are handled centrally where configured. The execution controller currently returns HTTP 200 even when the **target API** returns 4xx/5xx, because those target values are placed inside `ApiExecutionResponse`. I would make create endpoints return 201 and ensure clear 400/401/403/404/409/500 semantics through typed exceptions.

### How are request bodies validated?

Controller methods such as signup/login/workspace create use `@Valid` on DTOs. DTO field annotations determine exact constraints. Services also validate ownership, roles, unresolved variables, supported methods and relationships. Validation is layered: shape validation at the boundary, business validation in services.

### How are activity logs paginated?

`ActivityLogRepository` exposes methods returning Spring `Page<ActivityLog>` and takes `Pageable`, sorted by `createdAt` descending. `ActivityLogService` selects a repository query based on optional action/resource filters and maps the page into `ActivityLogPageResponse`.

### How would you version the API?

I would introduce `/api/v1/...` before external consumers depend on the endpoints, document compatibility rules, and maintain v1 while migrating clients to v2 for breaking changes. Header versioning is possible, but path versioning is simpler for this product initially.

### Would you add Swagger/OpenAPI?

Yes. I would add Springdoc OpenAPI, annotate meaningful endpoint and DTO descriptions, expose docs in development/staging, and keep generated OpenAPI as the frontend/integration contract. I would protect or restrict docs in production as appropriate.

### How would you add caching?

I would cache only measured read-heavy, safely invalidatable data—perhaps workspace/collection summaries—with Spring Cache backed by Redis in a multi-instance setup. I would not cache authorization decisions or stale environment secrets casually. Mutation events should evict/update relevant cached keys.

### How do you prevent duplicate request execution?

The current UI disables Send while its execution is loading, but it is not a complete server guarantee. For production I would add an idempotency key per execution submission, record it with a short TTL/result, enforce per-user concurrency limits, and make duplicate requests return the existing result or accepted job ID.

### How would you make an endpoint idempotent?

For writes that must tolerate retry, require a client-generated idempotency key, store `(user/workspace, key, request hash, result/status)` atomically, and return the stored result for repeats. For naturally idempotent updates, use PUT semantics and optionally optimistic versioning/ETags.

### What happens if PostgreSQL is unavailable?

Repository operations fail and the request should return a controlled server error through exception handling. The current code has no visible database failover, retry, or circuit breaker. In production I would use managed PostgreSQL with backups, health checks, connection-pool monitoring, and carefully bounded retries only for transient failures.

### How would you implement retries?

Retries should be selective: safe reads and idempotent operations can use bounded exponential backoff with jitter. I would not blindly retry non-idempotent mutations or external POSTs because that can duplicate side effects. For target APIs, retry only known transient errors with a timeout and a retry budget.

---

## Database

### Why PostgreSQL?

The domain is relational: users belong to workspaces through role-bearing memberships; workspaces own collections/environments; collections own requests; requests own headers, parameters, auth and history. PostgreSQL gives transactions, relationships, constraints, indexing, and reliable query capability for history/audit data.

### Why relational database rather than MongoDB?

Documents could store a request and its settings, but membership authorization, roles, ownership checks, history, activity filters and relationships are central. A relational model makes those associations and transactional updates clearer. MongoDB could be valid for a different design, but PostgreSQL fits this domain naturally.

### Explain the schema.

`users` stores identity and password hash. `workspaces` has creator. `workspace_members` joins user/workspace and stores role/join time. `collections` belong to workspace. `api_requests` belong to collection and creator; headers/query params are child rows, and authorization is a one-to-one child. `environments` belong to workspace and have variable rows. `execution_history` links to a request and executing user. `activity_logs` records user/action/resource and scalar workspace information.

### Explain User, Workspace and WorkspaceMember.

One `User` can join many workspaces and one `Workspace` can have many users. `WorkspaceMember` represents each membership. It contains `workspace_id`, `user_id`, `role`, and `joinedAt`. It is better than a bare many-to-many because membership has business data, especially role.

### Why is WorkspaceMember separate?

Because it models permissions and membership metadata. A direct many-to-many only records the link; this product needs to distinguish ADMIN, EDITOR and VIEWER and record join time. It also makes membership lookup straightforward for service authorization.

### How do roles work?

`WorkspaceRole` is stored as a string enum on `WorkspaceMember`. Services typically find the current caller's membership, reject null membership, and block mutations for `VIEWER`. Workspace invitation checks ADMIN. Role enforcement exists in many nested-resource services; I would make it centralized and apply it consistently to every root workspace route as production hardening.

### What happens when a workspace is deleted?

`WorkspaceService.deleteWorkspace` loads the workspace, explicitly deletes its membership rows, logs deletion, then deletes the workspace inside `@Transactional`. The entity also maps members with cascade/all + orphan removal. The current source does not show cascades from workspace to collections, requests, environments, history, or activity log, so I would not claim all dependent data is deleted correctly without verifying schema/constraints and adding explicit lifecycle policy.

### What happens when a request is deleted?

`ApiRequest` maps headers, query parameters and authorization with `cascade=ALL` and `orphanRemoval=true`, so removing the request through managed JPA lifecycle is intended to remove those child records. Execution-history cascade is not declared on the shown entity; cleanup must be handled explicitly or constrained by database policy. I would verify this in integration tests.

### How is referential integrity maintained?

JPA mappings use `@JoinColumn` foreign-key relationships, and services validate parent-child ownership before operations—for example, collection belongs to workspace and request belongs to collection. Production schema migrations should explicitly define foreign keys, uniqueness, not-null constraints and deletion policy rather than rely only on Hibernate auto-update.

### Which fields should be indexed?

At minimum: unique `users.email`; foreign keys such as `workspace_id`, `collection_id`, `request_id`, `environment_id`; membership composite lookup `(workspace_id, user_id)`; history `(request_id, executed_at DESC)`; activity `(workspace_id, created_at DESC)` plus filter combinations; and possibly `(workspace_id, name)` uniqueness depending product rules.

### Which queries become slow first?

Unbounded execution-history reads and activity logs, large workspace lists, collections with many requests, and relation-heavy lists that trigger N+1 queries. Full response bodies in history also increase I/O and storage pressure.

### How would you index activity logs?

Use a composite b-tree index beginning with workspace and sort key: `(workspace_id, created_at DESC)`. Add `(workspace_id, action, created_at DESC)` and `(workspace_id, resource_type, created_at DESC)` only if measured filters need them. Index design should follow query plans, not guesswork alone.

### How would you index execution history?

Use `(request_id, executed_at DESC)` because history is fetched per request in descending time. If workspace-level history is added, denormalize/index workspace ID or join efficiently based on measured access patterns.

### How would you handle millions of history records?

Set retention limits, page all reads, partition by time when volume warrants it, archive old metadata and large bodies, and move large response payloads to object storage. Keep only bounded/truncated searchable summaries in PostgreSQL. Add quotas per workspace.

### Why store response body in the database?

It makes recent execution history self-contained and useful for debugging without an extra object-store dependency. That is reasonable for small/moderate responses in an MVP.

### Disadvantages of storing large bodies in PostgreSQL?

It makes backups larger, increases table bloat/I/O, slows scans, raises storage cost, may expose sensitive data, and makes retention critical. It also risks a user returning very large target responses.

### How would you archive history?

Use scheduled retention jobs: retain recent rows online, write older bodies/possibly full artifacts to encrypted object storage with lifecycle rules, keep compact metadata/reference rows, and delete according to workspace policy. Legal/audit retention must be explicit.

### What belongs in object storage?

Large response bodies, downloaded files, binary responses, future file-upload artifacts, and large collection-run reports. PostgreSQL should keep metadata, pointers, hashes, timestamps, and limited preview text.

### How would you back up PostgreSQL?

Use a managed service with automated point-in-time recovery, daily snapshots, tested restore drills, encrypted backups and a documented recovery objective. For self-managed PostgreSQL, combine base backups/WAL archiving with offsite encrypted storage and verify restores—not just backup creation.

### How would you handle migrations?

Replace `spring.jpa.hibernate.ddl-auto=update` in production with Flyway or Liquibase versioned migration scripts. Each schema change is reviewed, repeatable across environments, and can be rolled forward safely. `ddl-auto=update` is convenient locally but can make uncontrolled production changes.

---

## Authentication and authorization

### How does signup work?

`UserController.signup` accepts validated `SignupRequest`, calls `UserService.signup`, creates a `User`, BCrypt-encodes the submitted password, checks `UserRepository.findByEmail`, and saves the user. The endpoint is allowed by `SecurityConfig`. I would return a safe user DTO rather than entity data in production.

### How are passwords stored?

Only the BCrypt-encoded value from `PasswordEncoder.encode()` is assigned to `User.password`; the plain password is not intentionally persisted. PostgreSQL stores the hash string.

### Why BCrypt?

BCrypt is deliberately slow and salted, making offline password guessing more expensive than a fast hash. Spring Security's `BCryptPasswordEncoder` also provides `matches()` for comparing a plain login input against the saved hash.

### Why JWT?

JWT gives the frontend a portable signed credential after login. The backend can authenticate REST requests and STOMP CONNECT frames without maintaining a server HTTP session. It fits a SPA plus API setup, though revocation/refresh need additional design for production.

### What is inside the current JWT?

`JwtService.generateToken` sets subject to the user's email, issued-at time, expiration one hour later, and an HS256 signature. No user ID, workspace role, permissions, or custom claims are added in current code. JWT payload is encoded, not encrypted.

### How is JWT validated?

For REST, `JwtAuthenticationFilter` extracts the Bearer value, calls `JwtService.extractUserEmail`, and JJWT verifies signature/expiration with the configured HMAC key. It then queries `UserRepository` and stores a `UsernamePasswordAuthenticationToken` with that User principal in `SecurityContextHolder`. For STOMP, `WebSocketAuthInterceptor` repeats an equivalent process on CONNECT.

### What happens when JWT expires?

JJWT parsing fails; current `extractUserEmail` catches the exception and returns null. REST does not establish SecurityContext authentication, so protected endpoints are denied; frontend Axios removes local credentials when it receives 401. A reconnecting STOMP client fails CONNECT authentication. The client does not currently proactively read token expiration before attempting a request.

### How would you implement refresh tokens?

Issue short-lived access tokens and long-lived, rotating refresh tokens stored hashed server-side with device/session metadata. Keep refresh token in a secure HTTP-only, Secure, SameSite cookie; expose a refresh endpoint that rotates/revokes tokens and detects reuse. Logout deletes/revokes the refresh session.

### How do users log out now?

`authStore.logout` removes `token` and `user` from local storage and resets Zustand authentication state. Because JWT is stateless, the already issued access token remains technically valid until expiration if copied; server-side revocation is a planned production feature.

### What if a token is stolen?

An attacker can impersonate the holder until expiration. I would reduce risk with short expiry, HTTP-only refresh tokens, XSS controls, HTTPS, token rotation, session/device tracking, revocation on suspicious activity, and no sensitive token logging.

### How are endpoints secured?

`SecurityConfig` permits signup/login and `/ws`; it requires authentication for other routes. `JwtAuthenticationFilter` is placed before username/password authentication filter. Resource services then perform business authorization, such as workspace membership and viewer restrictions.

### How are WebSocket connections secured?

The SockJS endpoint is public at the HTTP handshake level, but STOMP CONNECT must have the native Bearer header. `WebSocketAuthInterceptor` validates token, loads User, and attaches a principal. `WorkspaceSubscriptionInterceptor` checks that principal is a member before allowing a plural workspace topic subscription.

### How do you stop a user manually entering another workspace ID?

The correct protection is backend membership/ownership checks, never hidden URLs alone. Many nested services validate membership and parent-child relationships. However, current `WorkspaceService.getAllWorkspace` uses `findAll`, and `getWorkspaceById` shown does not verify membership; I would fix those root reads and use a central authorization helper before claiming full protection.

### How do ADMIN, EDITOR and VIEWER work?

Membership rows hold enum roles. Current mutation services typically reject only `VIEWER`, allowing ADMIN and EDITOR. `WorkspaceService.inviteMember` explicitly requires ADMIN. A robust next step is a reusable permission policy that states exactly which role can read, execute, edit, invite, delete and administer every resource.

### Can a viewer execute requests?

In the shown `ApiExecutionService`, it checks membership but does not reject `VIEWER`. Therefore a viewer can execute a request in the current implementation if they can reach the endpoint. I would document that as current behaviour and decide explicitly whether execution should be allowed for viewer or a separate runner role.

### Can an editor invite users?

No. `WorkspaceService.inviteMember` finds the current user's membership and checks that the role is `ADMIN`; otherwise it throws “Only ADMIN can invite users”.

### Who can delete a workspace?

The intended policy should be ADMIN only. However, `WorkspaceService.deleteWorkspace` in current source loads the workspace and deletes it without a membership/ADMIN check. This is a real authorization gap. I would fix it by requiring membership and `WorkspaceRole.ADMIN` in the service and test non-admin/non-member denial.

### How would you add organization-level roles?

Add `Organization`, `OrganizationMember`, and `OrganizationRole` entities. Workspaces would belong to an organization. Authorization would evaluate organization role plus workspace-specific role, with a clear precedence policy. I would use service-level policy methods or Spring method security, not duplicate checks across controllers.

### How would you audit sensitive actions?

The current `ActivityLog` already records user, action, resource type/name and timestamp for several operations. I would extend it for login failures, membership/role changes, secret changes, execution policy denials, token/session events and workspace deletion. Audit events should be append-only, structured, access-controlled, and avoid storing secret values.

### Is frontend role checking enough?

No. The frontend can hide buttons to improve UX, but any user can construct HTTP requests manually. The backend must authenticate every call and enforce membership/role/ownership at the service boundary.

---

## API execution

### How is final URL constructed?

`ApiExecutionService` loads the saved request URL, replaces `{{variable}}` placeholders from the selected environment, validates no placeholder remains, then uses `UriComponentsBuilder.fromUriString(resolvedUrl)`. It adds enabled saved query parameters and, for query-location API keys, adds that auth parameter too.

### How do environment variables work?

An environment belongs to a workspace and has `EnvironmentVariable` rows. At execution time the service loads them into a map and literally replaces occurrences of `{{key}}` in URL, query key/value, headers, body, and authorization fields. The frontend also previews resolved URL, but backend resolution is what controls execution.

### What happens when a variable is missing?

If a placeholder remains as `{{` or `}}` after replacement, `validateResolvedValue` throws a runtime error identifying the unresolved field. This prevents sending a malformed or unintended target request.

### Why validate unresolved variables?

Without validation, an accidental `{{baseUrl}}` could become an invalid/incorrect URL or leak a misconfigured request to a wrong endpoint. Failing fast gives a clear user error before outbound execution.

### Which HTTP methods are supported?

Backend execution explicitly maps GET, POST, PUT, PATCH and DELETE. The frontend method UI also lists HEAD and OPTIONS, but current backend switch rejects methods outside its five cases. That mismatch should be fixed by either supporting HEAD/OPTIONS end-to-end or removing them from the UI.

### How do query parameters work?

`RequestQueryParam` child records have key, value and enabled flag. During execution only enabled rows are resolved and added with `UriComponentsBuilder.queryParam`. The service rejects blank resolved parameter names.

### How do headers work?

`RequestHeader` child records have key, value and enabled flag. The service loads headers for the saved request and, for each enabled row, resolves variables and calls `httpHeaders.add(resolvedKey, resolvedValue)` on the outbound WebClient request.

### How does Bearer auth work?

If saved authorization has `AuthType.BEARER`, the service resolves bearer token, rejects blank token, and calls `httpHeaders.setBearerAuth(token)`. This is separate from the application's own JWT that protects the browser-to-backend request.

### How does Basic auth work?

For `AuthType.BASIC`, it resolves username/password, validates them, then calls `httpHeaders.setBasicAuth(username, password)` to produce an outbound target `Authorization: Basic ...` header.

### How do API keys work?

For `AuthType.API_KEY`, `apiKeyLocation` decides placement. `QUERY` goes through the URL builder. `HEADER` adds the configured resolved key/value as an outbound request header. This supports target APIs that expect API keys in different locations.

### Why make API-key location configurable?

Different APIs define authentication differently. Some require `X-API-Key` in a header; others use query parameters. Configurable placement makes saved requests reusable without changing source code.

### How is response time measured?

The service records `System.currentTimeMillis()` before outbound execution and after it returns, then stores/returns `end - start`. It is an end-to-end measurement around this service's outbound call, not a precise network-only latency metric.

### How is response size measured?

If response body is non-null, current code uses `response.getBody().getBytes(UTF_8).length`. That measures UTF-8 encoded String bytes, not necessarily raw on-wire compressed bytes or original binary-body size.

### How are target 4xx/5xx responses handled?

`exchangeToMono(clientResponse -> clientResponse.toEntity(String.class))` intentionally converts target 4xx/5xx into a normal `ResponseEntity`. The frontend receives the target status/body/headers in `ApiExecutionResponse`; the application endpoint itself currently responds 200 for that completed execution.

### How do you distinguish target failure from backend failure?

Target HTTP 4xx/5xx means the target responded, so it is returned as a result. Connection/DNS/network errors become `WebClientRequestException` and are wrapped as “Unable to connect to the target server.” Bad URI becomes invalid URL. Other execution exceptions become failure messages. A production API would use typed error envelopes/statuses for clearer client handling.

### What happens if target server is unreachable?

WebClient throws `WebClientRequestException`; service catches it and throws a runtime exception describing inability to connect. The global exception handler determines final HTTP error shape where applicable. No retry is configured.

### How do you handle invalid URLs?

The frontend performs local URL validation. Backend additionally can catch `IllegalArgumentException` during URI/execution setup and returns a wrapped “Invalid request URL” failure. Server validation matters because clients can bypass browser UI.

### How do you stop a request hanging forever?

Current code does not configure an explicit WebClient timeout, so it does not fully prevent that. In production I would configure connection/read/response timeout, maximum response size, cancellation, concurrency limits and circuit breakers. That is a priority reliability gap.

### Are uploads/multipart supported?

Not in current execution code. It assumes JSON content type and String body for POST/PUT/PATCH. Multipart would need dedicated body modelling, content-type selection and streaming/file storage policy.

### Is GraphQL supported?

Not as a distinct feature. A user can send a raw HTTP POST with JSON body to a GraphQL endpoint if configured manually, but there is no GraphQL schema explorer, query editor mode, variables panel, or response tooling.

### Is OAuth 2.0 supported?

No. Current saved target auth modes are NONE, Bearer, Basic and API key. OAuth would need authorization-code/PKCE or client-credential flows, encrypted token storage, refresh handling and consent/security design.

### Are cookies supported?

There is no persistent cookie-jar implementation visible in this backend execution code. Cookies could be manually configured as headers, but target session-cookie management is not implemented.

### Is WebSocket API testing supported?

No. The project's WebSocket code is for its own collaboration channel, not a generic saved WebSocket request client for target APIs.

### Are pre-request scripts or tests supported?

No. There is no sandbox/script runtime, assertion model, or pre/post request hook visible. Collection runner only executes saved requests sequentially and summarizes results.

### Can requests run in parallel?

An individual execution call is synchronous from this service's perspective because it uses `.block()`. Multiple browser requests could reach server concurrently, subject to server resources, but no explicit execution scheduler or safe concurrency quota is implemented. Collection runner itself iterates sequentially.

### Why is collection runner sequential?

`CollectionRunnerService` loops through request list and calls `ApiExecutionService.executeRequest` one at a time. Sequential execution is simpler, gives predictable order, and is safer when later requests conceptually depend on earlier setup. It also means a slow request delays the whole run.

### How would you stop a collection run midway?

The current synchronous endpoint has no cancellation/job ID. I would convert bulk runs into queued jobs with a persisted state, cancellation flag checked between requests, timeouts, and a status/progress endpoint or WebSocket updates.

### How would you retry a failed request?

For single requests, provide an explicit Retry action that creates a new execution history record. For collection runs, define per-request retry policy with max attempts/backoff only for safe transient errors. I would never automatically retry arbitrary non-idempotent POST requests without clear user policy.

### Is arbitrary outbound URL execution safe?

Not by default. It is an SSRF risk: a malicious request could target localhost, private networks, cloud metadata endpoints, or internal services. Production needs strict schemes/ports, DNS/IP resolution checks, private-range and loopback blocks, redirect revalidation, egress controls, request quotas and audit logging.

---

## WebSockets and real-time collaboration

### Why use WebSockets?

Presence and collaboration status should arrive without the browser polling continuously. A persistent duplex channel lets the server push a collaborator snapshot as a user subscribes/disconnects.

### Why STOMP instead of raw WebSocket?

STOMP supplies message commands, headers, subscriptions and destination semantics on top of the transport. Spring's STOMP broker integration makes workspace topics and interceptors easier than manually parsing custom raw WebSocket frames.

### Why SockJS?

SockJS provides fallback transport support and works with Spring's `.withSockJS()` endpoint. It is useful where native WebSocket is unavailable or blocked, while still presenting a similar STOMP client interface.

### What happens when WebSockets are blocked?

SockJS may use a supported fallback transport depending on browser/server/network support. If no transport succeeds, callbacks mark the collaboration store disconnected/error and the client attempts automatic reconnection. Exact fallback selected is runtime/network-dependent.

### Which events are broadcast?

`WorkspacePresenceService` sends `COLLABORATOR_SNAPSHOT` to plural `/topic/workspaces/{id}`. `WorkspaceEventService` can publish workspace resource events, online users, and editing events, but its paths are singular `/topic/workspace/...`. Current frontend subscribes plural only, so normal resource events are not received by that client path until destinations are unified.

### How does a user join a workspace channel?

`WorkspacePage` calls `CollaborationStore.connect(id)`, which calls `websocketService.connect(id, ...)`. After STOMP CONNECT succeeds, client subscribes to `/topic/workspaces/{id}`. `WorkspaceSubscriptionInterceptor` authorizes this subscription and invokes `WorkspacePresenceService.userJoined`.

### How is WebSocket authentication validated?

On STOMP CONNECT, `WebSocketAuthInterceptor` reads the native Authorization header, strips `Bearer `, uses `JwtService` to verify/parse token, loads User by email, creates `UsernamePasswordAuthenticationToken`, and sets it as STOMP accessor user.

### How is a workspace subscription authorized?

On STOMP SUBSCRIBE to plural workspace topic, `WorkspaceSubscriptionInterceptor` validates destination format, gets authenticated User principal, loads workspace, and calls `WorkspaceMemberRepository.findByWorkspaceAndUser`. A missing membership throws access denied, so a valid application JWT is not enough to enter arbitrary workspace topics.

### How do you know who is online?

`WorkspacePresenceService` keeps concurrent in-memory maps from workspace to user IDs, session to workspace, and session to User. On subscription it records session/user; it generates an array of `{userId,userName}` and publishes a collaborator snapshot. The frontend replaces `activeCollaborators` from that snapshot.

### How are editing locks implemented?

`EditingSessionService` stores `requestId -> EditingSession` in a concurrent map and has synchronized acquire/release methods. `WorkspaceWebSocketController` supports `/app/editing`. However, the current shown `websocketService.ts` never sends `/app/editing`, so locks are implemented server-side but not active in the shown client runtime path.

### What happens if user closes browser while editing?

For the active subscription-based presence path, `SessionDisconnectEvent` is handled by `WebSocketPresenceListener`, which removes user/session presence and republishes snapshot. The older `WebSocketEventListener` can also remove editing locks via `SessionRegistryService`, but that requires the unused `/app/join` old flow. Current locks also have no lease/expiry, so stale-lock handling needs improvement.

### What if user opens two tabs?

Presence service stores two session IDs. On a single-tab disconnect, `userLeft` scans remaining sessions for the same user/workspace and does not remove the user from the workspace presence set if another tab remains. This avoids showing the user offline prematurely.

### What happens after network disconnect?

STOMP client's close callback tells `CollaborationStore` it is disconnected and clears collaborator list. Since `reconnectDelay` is 5 seconds and disconnect is not intentional, STOMP attempts reconnect. A new successful subscription reauthenticates and registers presence again.

### How does automatic reconnect work?

The STOMP client is configured with `reconnectDelay: 5000`. It will attempt reconnect after unexpected closure. The source logs intent; exact retry behaviour/backoff is STOMP library behaviour and has not been customized beyond that fixed delay.

### What do heartbeat messages do?

The STOMP client config requests 10-second incoming/outgoing heartbeats. Heartbeats help each side detect a dead connection sooner than waiting indefinitely. They are not application business events and do not persist data.

### How do you avoid duplicate WebSocket connections?

`websocketService.connect` checks whether a client exists and is active or connected, then returns early. It also unsubscribes an old stored subscription during new connection setup. React StrictMode can still make lifecycle behaviour worth testing in development, so production should log/measure concurrent sessions.

### What if WebSocket broker fails?

Clients lose collaboration/presence updates and reconnect attempts occur. REST CRUD/execution is separate and can still work if the application is otherwise healthy. Current simple broker is in the same application JVM, so an app failure takes both backend and broker state down.

### Can current WebSockets run on multiple backend servers?

Not correctly without changes. Spring's simple broker and `ConcurrentHashMap` presence/lock state are local to each JVM. Two users on different instances can have inconsistent presence and events.

### Why does in-memory broker not scale horizontally?

Each server has its own memory. A publish on server A only reaches subscriptions known to A; presence on A cannot see sessions on B. A load balancer alone does not synchronize those independent maps/brokers.

### How would you scale WebSockets?

Use a shared broker such as RabbitMQ or a broker relay for cross-node topic distribution, and store presence/edit locks in Redis with TTL/atomic operations. Put WebSocket-capable application instances behind a load balancer, configure upgrade support and, depending broker/session design, either use sticky sessions or make session routing unnecessary.

### Why Redis or RabbitMQ?

Redis is useful for low-latency shared ephemeral state, TTL-based presence and distributed locks. RabbitMQ is useful for reliable brokered messaging and fan-out across application instances. They solve different problems and can be used together.

### How would you guarantee event ordering?

Define ordering scope, normally per workspace/resource. Include monotonic version or sequence number in durable changes; clients ignore stale events and re-fetch canonical REST state. A broker can preserve order per partition/queue, but global ordering across all events is expensive and usually unnecessary.

### How would you prevent stale edit locks?

Use Redis lock keys with TTL/lease renewal, attach lock owner/session and version, release on disconnect, and make client send heartbeats/renewals. Server must validate ownership on release. A lock should expire safely if a client disappears.

---

## Scale and capacity

### How many users can the app support?

I would not claim an exact measured number because the project has no load-test results. As a single-instance MVP on a hypothetical 2-vCPU/4-GB server, I would initially set conservative operational targets of roughly 50–100 active users, 100–300 WebSocket connections, and 10–20 concurrent outbound executions. Those are starting limits to validate with load testing, not guarantees.

### What is the bottleneck?

Outbound API execution is the main one. It depends on third-party latency and current code calls `.block()`, holding the application request until response. Other limits are database connections/history writes, server memory, WebSocket fan-out, response body sizes, and in-memory single-node state.

### What happens if 1,000 users press Send together?

Without quotas, queued/blocked requests can exhaust servlet threads, memory, outbound sockets, database resources and target-service limits. Current source does not implement an execution queue or concurrency limiter. Production needs per-user/workspace/global concurrency caps, timeouts, response-size limits, rate limits, backpressure, and preferably worker-based execution for high load.

### How does target latency affect capacity?

With synchronous waiting, long target latency occupies execution capacity longer. For example, 20 execution slots with two-second average responses can complete roughly ten responses/second in ideal conditions, but slow tails reduce that sharply. Capacity is determined by latency distribution, not just average request count.

### Why is synchronous execution a concern?

The service uses a reactive `WebClient` API but calls `.block()`, so the request path waits for the external result. Under many slow targets, server request resources are tied up. It is simple for an MVP, but I would isolate/limit executions before high scale.

### How would you make execution asynchronous?

Accept an execution request, persist a job, return `202 Accepted` with job ID, and queue it to worker processes. Workers apply strict policies/timeouts and save result/progress. Frontend polls job status or listens over WebSocket. This separates user-facing CRUD capacity from untrusted external latency.

### How would you scale from 100 to 10,000 users?

First harden one instance and measure. Then horizontally scale stateless REST nodes, use managed PostgreSQL with indexes/read scaling as needed, move broker/presence/locks to shared infrastructure, introduce Redis cache/rate limits, split execution into workers/queues, serve frontend with CDN, add observability and automated capacity testing.

### Vertical or horizontal scaling first?

For a small MVP, vertical scaling is the simplest short-term move after measurement. Horizontal scaling is necessary for availability and larger load, but only after moving in-memory collaboration state to shared services. I would not add replicas before solving that state problem.

### What changes before multiple backend instances?

Replace simple broker with shared broker/broker relay, externalize presence and locks to Redis, use shared configuration/secrets, ensure consistent database migrations, add distributed rate limits, ensure load balancer supports WebSocket upgrades, and remove assumptions that a session/state exists in one JVM.

### How do you load-balance WebSockets? Do you need sticky sessions?

A reverse proxy/load balancer must pass WebSocket upgrade or SockJS traffic correctly. With a shared broker/state architecture, sticky sessions can often be avoided for business state, though a specific SockJS/session setup may still benefit from affinity. I would verify it against chosen broker/proxy rather than assume.

### What should be cached?

Cache measured, non-sensitive, read-heavy data such as workspace/collection summaries, not arbitrary execution results or secrets. Cache invalidation must occur after mutations. Redis is the likely shared cache in a multi-node deployment.

### How would you rate limit?

Use key dimensions: user ID, workspace ID, IP for unauthenticated login/signup, target host, and global execution concurrency. Token-bucket/sliding-window policy in Redis can enforce a reasonable request rate and concurrent execution count. Return 429 with retry information when quota is exceeded.

### How would you stop collection-run abuse?

Apply membership/role policy, max requests per collection, max run duration, per-workspace concurrent run quota, individual execution timeouts, response-size limits, queueing, cancellation and audit logs. Do not let one user trigger unlimited sequential outbound calls.

### How would you load test and with which tools?

Use k6 for HTTP and WebSocket scenarios or Gatling/JMeter for JVM-oriented test suites. Simulate login, workspace reads, request CRUD, target stubs with controlled latencies/errors, execution bursts, collection runs and WebSocket connects/reconnects. Use a test database and target mock server; never load-test arbitrary external production APIs.

### Which metrics matter during load tests?

p50/p95/p99 latency, throughput, error/timeout rate, active connections, execution queue/concurrency, CPU, heap/GC, request threads, outbound connection use, database pool use/slow queries, PostgreSQL CPU/IO/locks, WebSocket reconnects, payload sizes, and target-stub latency.

---

## Deployment and DevOps (planned)

### How would you deploy this?

Build React static assets and serve them through a CDN/static host; containerize Spring Boot API; place it behind HTTPS reverse proxy/load balancer; use managed PostgreSQL; provide environment-specific config and secrets through a secret manager. This is the target production architecture, not currently checked into the repository.

### How would you containerize it?

Use a multi-stage frontend Docker build that runs `npm ci` and `npm run build`, then serves static assets through Nginx or a CDN upload step. Use a multi-stage Java build to run Maven, produce executable jar, then run it in a small JRE image as non-root. Supply configuration via environment variables/secrets, not baked images.

### Would frontend and backend deploy together?

They can be versioned/released together initially, but they should be independently deployable artifacts: static frontend and API service. Clear API versioning/compatibility lets the frontend CDN deploy and backend rollout happen safely without lockstep.

### Where would you host components?

Frontend: CDN-backed static hosting such as S3/CloudFront, Vercel, Netlify, or equivalent. Backend: containers on ECS/Kubernetes/App Service/Cloud Run-like platform depending team cloud. Database: managed PostgreSQL. Exact provider is less important than managed backups, network isolation, observability, and cost fit.

### Would you use managed PostgreSQL?

Yes for production. It provides backups, patching, monitoring, replication options, point-in-time recovery and a lower operational burden. I would still own schema design, indexing, retention and restore testing.

### How would you store secrets?

Use a cloud secret manager/Vault/Kubernetes secret integration, inject secrets at runtime, restrict access by workload identity, rotate regularly, and never commit them. The currently committed JWT/database values must be rotated before any public deployment.

### How would you configure environments/profiles?

Use Spring profiles such as `dev`, `staging`, `prod`, with non-secret defaults in version control and secrets externalized. Frontend uses build/runtime configuration for API URL. CORS, logging level, database URL, broker endpoint and allowed origins all vary by environment.

### How would you configure CORS in production?

Replace localhost-only origin with explicit trusted HTTPS frontend origins per environment. Allow only needed methods/headers; review whether credentials are necessary; do not use wildcard origins with credentials. Apply same origin policy to WebSocket endpoint patterns.

### How would you enable HTTPS?

Terminate TLS at managed load balancer/reverse proxy with managed certificates, redirect HTTP to HTTPS, enable HSTS after validation, and have frontend use `https://` and `wss://`. Internal service traffic policy depends on network architecture.

### What does reverse proxy do?

Nginx/Traefik/load balancer terminates TLS, forwards HTTP to Spring Boot, serves static assets if needed, handles compression/headers/rate limiting, and must correctly support WebSocket upgrade/SockJS routes. It becomes the public edge rather than exposing application ports directly.

### What health checks would you add?

Spring Boot Actuator liveness/readiness endpoints, plus dependency-aware readiness for database and broker if collaboration is required. Monitor worker/queue health separately. Do not make liveness fail merely because a third-party target API is temporarily down.

### What would CI/CD do?

On pull request: formatting/lint, TypeScript build, Java compile/test, unit/integration/security scans. On merge: build immutable artifacts/images, publish them, deploy to staging, run smoke/integration checks, require approval if needed, then progressive production rollout. Add migration step with backup/rollback plan.

### Which tests run before deploy?

Frontend lint/typecheck/build, backend unit tests, Spring MVC/security integration tests, repository integration tests against PostgreSQL, WebSocket subscription tests, execution tests against a local mock target, dependency/vulnerability scanning, and end-to-end browser smoke tests.

### How would you roll back?

Keep versioned immutable images/static assets, use blue-green or canary deployment, roll back traffic to prior healthy version, and make database migrations backward-compatible/expand-contract so application rollback remains possible. A backup alone is not a safe instant rollback plan.

### How would you avoid downtime?

Run multiple backend replicas, use readiness checks and rolling/blue-green deployment, drain old connections, make WebSocket clients reconnect, and avoid breaking schema changes in a single release. Static frontend deploys should use content-hashed assets.

### How would you monitor it?

Collect structured logs, metrics and traces. Dashboard HTTP latency/errors, execution timeouts, target-host failures, WebSocket connections/reconnects, JVM heap/GC, database pool/slow queries, queue depth, rate-limit denials and security events. Alert on symptoms that affect users, not every log line.

### How would you back up and rotate secrets?

Use PostgreSQL automated PITR/snapshots plus restore drills. Rotate JWT signing keys with a key-id/overlap strategy so previously issued tokens can be accepted briefly, then retire old key; rotate database passwords via secret manager and rolling application restart/connection-pool renewal.

---

## Testing

### What tests exist currently?

The repository contains the default `ApiWorkspaceApplicationTests` context test. There is no substantial automated unit/integration/end-to-end test suite visible. The frontend production build succeeds; that is not the same as behavioural test coverage.

### Unit vs integration vs end-to-end tests?

Unit tests isolate one class/function with mocks, for example variable resolution. Integration tests start real Spring components and often a test PostgreSQL instance to verify security/JPA/controller interaction. End-to-end tests drive the browser against deployed-like frontend/backend and validate complete user flows.

### What would you test first?

Authorization and execution safety: non-member denial, viewer mutation denial, admin-only delete/invite, parent-child ownership validation, JWT valid/expired/invalid paths, variable replacement, headers/query/auth assembly, target errors, timeout behaviour and SSRF policy. These have highest security/business risk.

### How would you test JWT authentication?

Use MockMvc or Spring integration tests: login returns a valid token; token accesses protected endpoint; missing/invalid/expired/tampered token is denied; token for deleted user is denied; authorization header handling is correct. Test expected 401/403 response contracts.

### How would you test roles/workspace isolation?

Seed users/workspaces/membership in a test database. Assert non-member cannot read/modify/subscribe; VIEWER cannot mutate; EDITOR can perform intended edits but cannot invite/delete workspace; ADMIN can manage membership. Test every endpoint, including root workspace list/detail—not only nested resources.

### How would you test WebSocket events?

Use Spring's WebSocket/STOMP test client against a running test server: CONNECT with valid/invalid token, subscribe as member/non-member, verify snapshot payload, disconnect cleanup, and resource event destination. Add a regression test requiring server publish destination to match frontend subscription destination.

### How would you test variable replacement?

Unit-test null values, multiple variables, repeated variables, unresolved placeholders, body/URL/header/query/auth substitutions, disabled params, blank keys and values containing braces. Then integration-test an execution against a mock HTTP server to verify final received URL/header/body.

### How would you test external execution safely?

Use WireMock, MockWebServer or a local controlled HTTP server. It can return success, 4xx/5xx, delay, malformed response and connection failures without calling public APIs. Verify exact outbound request shape and stored execution history.

### How would you test timeout/retry?

Mock target delays beyond configured timeout and verify bounded failure, no leaked resources and correct history/error. For retries, assert only eligible transient/idempotent cases retry the configured count and non-idempotent target writes do not retry blindly.

### How would you test collection runner?

Seed ordered requests pointing to mock target endpoints. Verify sequential order, success/failure counts, per-request results, continuation policy after one failure, activity record and permissions. Later, test cancellation/queue state after asynchronous redesign.

### How would you test error handling?

Send malformed DTOs, missing IDs, ownership violations, duplicate signup, invalid URL, unresolved variable, upstream failure and database failure simulations. Assert stable status code, safe error body, no secret/stack trace leakage, and frontend error rendering.

### How would you test repositories?

Use `@DataJpaTest` with PostgreSQL-compatible Testcontainers for relationship/cascade/query/pagination behaviour. Avoid relying only on in-memory database because PostgreSQL behaviour/SQL differs.

### Which mocking framework?

JUnit 5 with Mockito for unit tests, Spring Boot test/MockMvc for web/security tests, Testcontainers PostgreSQL for persistence integration, and WireMock/MockWebServer for outbound HTTP. Playwright or Cypress is suitable for browser E2E tests.

### How would you test at scale?

Use k6/Gatling with stub target services and realistic database size. Exercise mixed reads/writes/executions/WebSockets, step load gradually, observe p95/p99/error/saturation metrics, locate bottlenecks, tune, and repeat. Never fabricate a capacity number without that evidence.

---

## Security

### Biggest risks in current app?

Committed database/JWT secrets; JWT secret printed to logs; arbitrary outbound URL SSRF; no explicit outbound timeout/response limit/rate limit; plaintext target authorization fields in entity storage; incomplete root workspace authorization; local-storage tokens; broad generic runtime errors/logging; in-memory collaboration state; and absent visible retention/redaction policy for histories.

### Why not keep secrets in `application.properties`?

Version-controlled secrets can leak through git history, backups, screenshots and forks. Rotation becomes harder, and developers/environments share sensitive values. Use a secret manager and environment/workload identity instead; rotate values already committed.

### How should API tokens be stored?

Avoid storing them when possible; use environment variables or external secret references. If product needs stored target credentials, encrypt values at rest using envelope encryption/KMS, restrict decryption by workspace authorization, mask them in responses/logs/history, audit access, and rotate/delete them safely.

### Should authorization fields be encrypted at rest?

Yes for production because Bearer tokens, Basic passwords and API keys are secrets. Current entity fields are ordinary strings/TEXT; that is a gap to address with application-level encryption or a secrets manager reference model.

### How would you prevent SSRF?

Parse/validate URL, allow only `http/https`, resolve DNS and reject loopback/link-local/private/reserved addresses, recheck every redirect, restrict ports/hosts/egress at network layer, block metadata endpoints, limit DNS rebinding, cap concurrency/body/time, audit execution and apply tenant quotas. Application validation alone should be backed by network egress controls.

### How would you prevent XSS?

Never inject unsanitized HTML, use React's default escaping, avoid `dangerouslySetInnerHTML`, sanitize any rich content, validate URLs, apply Content Security Policy, minimize third-party scripts, protect tokens from JS with HTTP-only cookies, and test reflected/stored fields such as names/descriptions/response display.

### How would you prevent CSRF?

Current JWT header-based API disables CSRF, which is common when credentials are not automatically sent by browsers. If using cookie-based refresh/auth endpoints, use SameSite cookies plus CSRF token/origin checks. CORS is not a replacement for CSRF protection.

### How does JPA help prevent SQL injection?

Derived repository methods and parameterized JPA queries bind values rather than concatenating user input into SQL. It reduces SQL injection risk, but it does not secure native SQL built unsafely, dynamic query construction, XSS, SSRF or authorization bugs.

### How would you protect login against brute force?

Rate limit by IP/account, add progressive backoff, track failed attempts, temporarily lock or challenge suspicious attempts, use secure password policies, monitor credential-stuffing patterns, and return generic invalid-credential messages rather than revealing whether email exists.

### How would you rate limit signup/login?

Use a distributed Redis token bucket keyed by IP and normalized account identifier. Keep thresholds conservative, return 429 with retry delay, log abuse, and consider CAPTCHA only after suspicious patterns—not as the primary control.

### How do you secure CORS?

Use explicit trusted HTTPS origins per environment, allow only necessary methods/headers, avoid wildcard origins when credentials are used, and apply comparable restrictions to WebSocket endpoint origins. Current source permits only local Vite origin, which is correct for development but not deployment.

### How would you enforce HTTPS?

TLS terminate at trusted edge/load balancer, redirect HTTP, use HSTS when ready, set secure cookies, and use `wss://` for collaboration. Do not expose sensitive API traffic over plain HTTP in production.

### How do you prevent token leakage in logs?

Never log JWTs, authorization headers, secrets, passwords, API keys or resolved target URLs containing secrets. Remove current debug prints of JWT secret/authorization header. Configure log redaction filters and audit code reviews for secret-bearing fields.

### How would you mask sensitive history?

Redact Authorization/Cookie/Set-Cookie and configured secret headers; scrub known query secret keys; truncate bodies; allow workspace policies for capture; encrypt artifacts; and show masked values in UI. Do not store raw request credentials in history unless strictly necessary and protected.

### Should execution history store authorization headers?

No, not raw credentials. Store only a marker such as auth type or redacted header name/value. Execution history is for reproducibility/debugging, not a second secret vault.

### How would you handle deleted users and their history?

Define a retention policy. Usually preserve audit attribution as anonymized immutable actor ID/name, or use a tombstoned user rather than hard-deleting row that foreign keys reference. Delete personal data as required, retain only legally justified audit records, and document the policy.

### How would you comply with privacy requirements?

Data inventory/classification, purpose/retention limits, encrypted transport/storage, least-privilege access, export/delete workflows, audit logs, data-processing agreements, regional storage where required, incident response, and no unnecessary capture of target API payloads that may contain personal data.

---

## Trade-offs and code gaps

### Why relational DB, monolith, REST+WebSocket, JWT, Zustand, WebClient, simple broker?

Relational DB fits membership and ownership. A monolith keeps MVP complexity manageable. REST is authoritative for durable data while WebSocket is for push/presence. JWT suits SPA/API identity, Zustand gives lightweight client stores, WebClient is Java's outbound HTTP client, and Spring simple broker is fast to prototype. Each choice has a scaling trade-off, and I have identified where it changes at production scale.

### Why execute target APIs from backend rather than browser?

Backend execution lets the product persist history/activity, apply workspace authorization, resolve shared environments, avoid browser CORS restrictions, and provide one policy/control point. It also creates SSRF/security responsibility, so a production version must heavily restrict outbound execution.

### What would you redesign if starting again?

I would define a consistent authorization policy first, introduce DTOs for every public response, use Flyway and environment-based secrets from day one, standardize websocket topic names and event schemas, isolate execution with timeout/SSRF policy, and write integration tests alongside each feature.

### What is technical debt?

Inconsistent singular/plural WebSocket topic paths; two overlapping presence/online-user implementations; generic `RuntimeException` and `System.out.println`; hard-coded secrets/local URLs; root workspace access gaps; no timeout/SSRF guard; `ddl-auto=update`; minimal tests; and in-memory collaboration state. I would resolve security/correctness debt before adding broad features.

### Hardest part?

The hardest part was coordinating a persisted REST model with real-time collaboration: authentication is not enough because subscriptions also need workspace membership authorization, and presence has to handle multiple browser tabs/disconnects. It taught me to distinguish durable state from ephemeral connection state.

### Biggest limitations today?

It is a local/single-instance MVP. WebSocket state is not distributed, normal event topic wiring needs alignment, external execution needs security/timeouts, and test/deployment/observability foundations are incomplete.

### What did you learn?

I learned that a feature like “Send API request” crosses many layers: frontend state, transport auth, service authorization, entity ownership, external networking, failure handling, persistence and real-time notification. I also learned to identify and prioritise production hardening rather than treating a working demo as production-ready.

### Why hardcoded credentials/JWT secret? Why is that bad?

They were development shortcuts, not a defensible production choice. The correct action is to remove them from source, rotate them, inject secrets at runtime and prevent secret logging. I would state this directly rather than rationalize it.

### Why is `ddl-auto=update` unsafe in production?

It lets Hibernate modify schema implicitly at startup, which can cause uncontrolled drift and does not provide reviewed, reproducible migration history or safe rollback. Flyway/Liquibase makes changes explicit and repeatable.

### Why no execution timeout?

It is an MVP omission. It is risky because target API latency can hold resources indefinitely. I would configure it before public deployment along with response-size and concurrency limits.

### Why store complete response bodies without retention?

It was useful for the first debugging-focused MVP, but not a scalable long-term policy. I would enforce size/retention/masking, archive large artifacts, and give workspaces storage quotas.

### Why not in-memory maps across multiple servers?

Memory belongs to one JVM. Horizontal replicas cannot see each other's sessions/locks/presence. Redis/shared broker are required before claiming HA/multi-node collaboration.

### Why need workspace listing filtering and admin delete check?

Authentication only identifies caller. Workspace resource access must also verify caller membership and role. Current root list/detail/delete source paths need that check consistently; this is a concrete authorization fix I would make immediately.

### Why environment-specific CORS?

Localhost is correct only for development. Production must accept only the deployed frontend domain(s), otherwise either real clients fail or origins are opened too widely.

### Why central error codes and structured logs?

Typed domain errors give frontend/users stable action-oriented responses and help monitoring. Structured logs make events queryable by request/workspace/user/correlation ID. Generic runtime exceptions and console output are difficult to support safely at scale.

### Why asynchronous collection workers at scale?

Long sequential runs should not occupy interactive HTTP request capacity. A queue/worker design supports concurrency limits, progress, cancellation, retries, durable job status and isolation from target API slowness.

### Strong response when challenged on gaps

“That is a valid production gap. I built the working MVP first, then identified hardening priorities from the architecture: rotate and externalize secrets, add SSRF and timeout controls, enforce every authorization boundary, add automated tests/migrations, normalize WebSocket events, and externalize real-time state before horizontal scaling.”

---

## Behavioural answers

### Tell me about a design decision.

“I chose REST as the source of truth and WebSockets for real-time notification/presence. Persistent resources need clear CRUD, validation and retry semantics, while presence needs server push. That separation keeps the client from treating transient socket events as the database of record.”

### Tell me about a trade-off.

“I used a modular monolith with Spring's simple broker to reduce MVP complexity. The trade-off is that collaboration state is single-instance. I accepted it for local/small-team validation and documented Redis/shared-broker migration as the scaling boundary.”

### How did you debug frontend/backend integration?

“I trace the request through a deterministic chain: browser Network tab, Axios service endpoint, controller mapping, service validation, repository data, and response shape. For WebSockets I compare the exact subscribed destination with the exact server publish destination. That process revealed the current singular/plural topic mismatch.”

### How did you handle unclear requirements?

“I reduced them to a concrete user policy and made the assumption visible. For example, role design means defining who may read, edit, invite, delete and execute; if policy is unclear, I avoid hiding it in UI behaviour and make it a backend rule to confirm.”

### If you had one more week?

“I would spend it on production safety rather than new UI: remove/rotate secrets, add outbound URL SSRF policy and timeouts, fix topic wiring and root authorization, create integration tests for JWT/roles/execution, and introduce Flyway migrations.”

### Did you work alone or with a team?

Use your truthful situation. If solo: “I built it independently, which meant I owned product scoping, frontend/backend integration and design decisions. I compensated by treating service boundaries and tests/review checklists as if the code had to be handed to another engineer.” Do not invent team members.

### How did you prioritize?

“I prioritised the vertical slice that proves the product: authenticate, create workspace/collection/request, configure environment, execute request, preserve history, then add collaboration. That ensured each new feature connected to a usable workflow instead of producing isolated screens.”

### How did you ensure quality?

“I used typed frontend contracts, validation, service-level relationship checks, JWT security, and built the frontend successfully. I am also candid that automated backend coverage is currently minimal; my next quality step is integration tests around authorization and execution.”

### Biggest failure/limitation?

“The biggest limitation is treating initial real-time and execution design as production-ready would be wrong. I found a normal event topic mismatch and identified missing distributed state/security controls. The important learning was to surface those issues early and turn them into a prioritized hardening plan.”

### What are you most proud of?

“The end-to-end execution flow. It is not just a CRUD request record: it validates workspace ownership, resolves shared environment variables, applies multiple auth modes, makes an outbound call, records history and activity, and returns a useful response to the editor.”

---

## Rapid-fire definitions

| Question | Interview answer |
|---|---|
| What is JWT? | A signed token carrying claims, used here to identify the user on later REST and STOMP requests. It is signed, not encrypted. |
| What is BCrypt? | A slow, salted password-hashing algorithm used to store passwords safely and verify login input. |
| What is CORS? | Browser policy controlling whether one web origin may call another. Server must explicitly allow trusted frontend origins. |
| What is SSRF? | Server-Side Request Forgery: attacker-controlled URL makes backend call internal/private resources. Relevant because this app executes target URLs. |
| What is WebSocket? | A persistent duplex browser/server communication channel after connection setup. |
| What is STOMP? | A messaging protocol over WebSocket/SockJS with commands and named destinations such as `/topic`. |
| What is SockJS? | A WebSocket-like transport layer with fallbacks for incompatible networks/browsers. |
| What is JPA? | Java persistence specification used to map entities and access relational data. |
| What is Hibernate? | The JPA implementation that maps entities, tracks changes and generates SQL here. |
| What is lazy loading? | Loading an associated entity/collection only when accessed, instead of immediately with parent. |
| What is an index? | A database data structure that speeds selected lookups/sorts at the cost of write/storage overhead. |
| What is a transaction? | An all-or-nothing unit of database work with consistency/isolation guarantees. |
| What is DTO? | Data Transfer Object: a deliberate API input/output shape separate from persistence entity. |
| What is REST? | HTTP resource-oriented API style using paths, methods and status codes. |
| What is idempotency? | Repeating an operation has the same intended effect as doing it once; useful for safe retries. |
| What is rate limiting? | Enforcing a bounded request/concurrency budget per key such as user/IP/workspace. |
| What is reverse proxy? | Edge server that receives public traffic and forwards it to application services, often handling TLS/routing. |
| What is horizontal scaling? | Running multiple application instances behind a load balancer. |
| What is a message broker? | Infrastructure that routes/publishes messages between producers and subscribers across services/instances. |
| What is Redis used for? | Shared cache, rate limits, ephemeral presence/session data, queues/locks depending design. |
| What is CI/CD? | Automated integration/testing/building and safe delivery/deployment pipeline. |
| What is database migration? | Versioned, reviewed schema evolution scripts such as Flyway/Liquibase migrations. |
| What is API gateway? | A managed/edge entry point for routing, auth, rate limits and policy across APIs. |
| What is load testing? | Simulating realistic concurrency/traffic to measure latency, throughput and saturation. |
| What is a health check? | Endpoint/signal showing whether a process is alive and ready to serve traffic. |
| What is observability? | Ability to understand system behaviour from logs, metrics and traces. |
