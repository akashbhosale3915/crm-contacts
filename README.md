# CRM Contact Workspace

A full-stack contact workspace built with React, TypeScript, Express, and MongoDB.

## Run locally

Requirements: Node.js and a running MongoDB instance.

```powershell
npm install
npm run seed
npm run dev
```

The client runs through Vite (normally at `http://localhost:5173`) and the API runs at `http://localhost:3000`. `MONGO_URI` and `PORT` are optional environment variables that can also be set in a local `.env` file. If `MONGO_URI` is omitted, the server and seed command connect to `mongodb://127.0.0.1:27017/crm`. Each `npm run seed` invocation inserts 50 new demonstration contacts. It does not clear or check existing records, so running it repeatedly appends another batch; a generated email collision with the unique email index can cause an insert to fail. Seeded email addresses use the reserved `.test` domain.

## Features

- Browse, search by name/email/phone, filter by tag and company, sort by name or created date, and paginate through backend results.
- Create and view contacts; edit contact fields and add or remove tags.
- Assign tags to multiple selected contacts.
- View the latest 20 contact activity records.
- Validate inputs, enforce optional unique email addresses, and detect stale updates with optimistic concurrency.

## Data model and API

Contacts have first/last name, optional email, phone, company, a string-array of tags, and created/updated timestamps. MongoDB stores contacts and activity records; an optional email has a sparse unique index. Activity records contain a contact ID, timestamp, type (`CONTACT_UPDATED`, `TAG_ADDED`, or `TAG_REMOVED`), and optional details.

Shared TypeScript contracts live in `packages/shared/src/index.d.ts`. The API supports contact list retrieval, tag discovery, individual contact retrieval, create/update, bulk tag assignment, and recent activity retrieval. List search, filtering, sorting, and pagination run on the server.

## Project structure

- `packages/client/src/pages/ContactsPage.tsx` coordinates list state, URL sharing, theme, and dialogs.
- `packages/client/src/components/contacts/` contains the list filters and responsive contact-list presentation.
- `packages/client/src/hooks/useContacts.ts` owns contact-list loading, errors, request cancellation, and refresh state.
- `packages/client/src/services/` centralizes the HTTP client and typed contact API methods.
- `packages/server/src/app.ts` configures Express middleware and route registration; `server.ts` connects MongoDB, starts the listener, and handles shutdown.
- `packages/server/src/routes/`, `controllers/`, and `services/` separate endpoint declarations, HTTP parsing/response handling, and contact business/data operations.
- `packages/server/src/middleware/` contains not-found and centralized error handling.

## Technical decisions

- MongoDB persistence with Mongoose schemas and a sparse unique index for optional email.
- List query parameters are allowlisted and validated; regex search/filter values are escaped, and page size is capped at 100.
- Contact edits submit the observed Mongoose `__v`. The server rejects stale versions with HTTP 409 and Mongoose optimistic concurrency also detects races that happen during save.
- Tag changes made through the edit form are persisted with the contact update and logged as `TAG_ADDED`/`TAG_REMOVED`; bulk assignment only logs contacts whose tag changed.
- Backend request-validation tests run with `npm test` (or `npm test --workspace=server`). Server type-check and frontend build/type-check and lint run with `npm run build --workspace=server`, `npm run build --workspace=client`, and `npm run lint --workspace=client`.

## Known limitations

- No authentication, authorization, contact deletion, or multi-tenant account model is implemented.
- Contact writes and activity logging are separate MongoDB operations rather than a transaction. The default local MongoDB setup may be standalone; use a replica set and a transaction/outbox if atomic activity persistence becomes a requirement.
- Search uses escaped regular expressions; it is suitable for the assignment dataset but needs indexed/search infrastructure for very large datasets.

## Scale considerations

- **Millions of contacts per account:** add account-scoped compound indexes, enforce tenant scoping in every query, optimize search with normalized fields and Atlas Search or a dedicated search service, and consider cursor pagination instead of large offsets.
- **Millions of updates per day:** move activity/audit writes to a durable event pipeline, use MongoDB transactions or an outbox where atomicity is required, and partition/retain activity data by account and time.
- **Frequent searches and filters:** build indexes from measured query patterns, cache safe/high-frequency facets, and use search-specific indexes rather than unindexed regex scans.
- **Many simultaneous users:** keep optimistic version checks, add authentication and authorization, use rate limits and connection pooling, and monitor database latency and conflict rates.

## AI assistance

GitHub Copilot was used to help inspect the assignment and implement typed API/UI workflows. One suggested approach was to combine editing and history in one modal; this was changed to separate contact-detail and activity-history views to match the selected UX.
