# CRM Contact Workspace

A full-stack contact workspace built with React, TypeScript, Express, and MongoDB.

## Run locally

Requirements: Node.js and a running MongoDB instance.

```powershell
npm install
npm run seed
npm run dev
```

The client runs through Vite (normally at `http://localhost:5173`) and proxies `/api` requests to the backend at `http://localhost:8000`. Set `API_PROXY_TARGET` in the client environment to use a different backend URL. `MONGO_URI` and `PORT` are optional environment variables that can also be set in a local `.env` file. If `MONGO_URI` is omitted, the server and seed command connect to `mongodb://127.0.0.1:27017/crm`. Each `npm run seed` invocation inserts 50 new demonstration contacts. It does not clear or check existing records, so a collision with an existing unique email can cause an insert to fail. Seeded email addresses use the contact's first and last names with `fake.com`, `test.com`, `new.com`, or `droidtech.in` domains, and phone numbers are generated as 10-digit strings.

## Production

Run `npm run build` to create the frontend and backend production outputs. Configure Nginx (or another web server) to serve `packages/client/dist` and proxy `/api` requests to the backend. Set production `MONGO_URI` and `PORT`, then run `npm start` from the repository root to start the compiled backend. Use a process manager such as systemd or PM2 to keep it running and restart it after reboots; the frontend is static files and does not need a Node dev server.

## GitHub Actions

The client and server have separate workflows under `.github/workflows/`. On pushes and pull requests targeting `main`, client changes build only the client, and server changes test and build only the server. Changes to shared contracts or root dependency manifests and lockfile trigger both relevant workflows. Both jobs use the root `package-lock.json` with `npm ci`; setup-node caches npm's package download cache keyed by that lockfile. Pushes to `main` deploy only the changed app to EC2 over SSH: the client workflow syncs its built static files, and the server workflow syncs compiled output, installs production dependencies, and restarts the `crm-api` PM2 process. Pull requests do not deploy.

Configure these GitHub repository secrets for deployment: `EC2_HOST` (the EC2 public IP or DNS name), `EC2_USER` (for example, `ubuntu`), `EC2_SSH_PRIVATE_KEY` (the deployment key's private key), and `EC2_KNOWN_HOSTS` (the verified SSH host-key line for that host). The EC2 user must be able to write to `/var/www/crm-contacts`, and PM2 must have a process named `crm-api`. Keep SSH ingress restricted; GitHub-hosted runner IPs are not static, so consider a self-hosted runner or AWS Systems Manager if you cannot safely allow the runner connections.

## Features

- Browse, search by name/email/phone, filter by tag and company, sort by name or created date, and paginate through backend results.
- Create and view contacts; edit contact fields and add or remove tags.
- Assign tags to multiple selected contacts.
- View the latest 20 contact activity records.
- Validate inputs, enforce optional unique email addresses and exactly 10-digit phone numbers, and detect stale updates with optimistic concurrency.

## Data model and API

Contacts have first/last name, optional email, phone, company, a string-array of tags, and created/updated timestamps. MongoDB stores contacts and activity records; an optional email has a sparse unique index. Activity records contain a contact ID, timestamp, type (`CONTACT_UPDATED`, `TAG_ADDED`, or `TAG_REMOVED`), and optional details.

Shared TypeScript contracts live in `packages/shared/src/index.d.ts`. The API supports contact list retrieval, tag discovery, individual contact retrieval, create/update, bulk tag assignment, and recent activity retrieval. List search, filtering, sorting, and pagination run on the server. Phone numbers must contain exactly 10 digits.

## Project structure

- `packages/client/src/pages/ContactsPage.tsx` coordinates list state, URL sharing, theme, and dialogs.
- `packages/client/src/components/contacts/` contains the filters, contact dialogs, and list composition; `components/contacts/list/` separates desktop table, mobile cards, feedback, pagination, row actions, and tag presentation.
- `packages/client/src/components/layout/ContactsHeader.tsx` contains the workspace header and theme controls.
- `packages/client/src/hooks/useContacts.ts` owns contact-list loading, errors, request cancellation, and refresh state.
- `packages/client/src/hooks/useContactListNavigation.ts` synchronizes list state with the URL and browser history.
- `packages/client/src/services/` centralizes the HTTP client and typed contact API methods.
- `packages/server/src/app.ts` configures Express middleware and route registration; `server.ts` connects MongoDB, starts the listener, and handles shutdown.
- `packages/server/src/routes/`, `controllers/`, and `services/` separate endpoint declarations, HTTP parsing/response handling, and contact business/data operations.
- `packages/server/src/middleware/` contains not-found and centralized error handling.
- `packages/server/src/validation/` groups contact input, list-query, and bulk-tag parsers; `validation.ts` re-exports the validation API.
- `packages/client/src/styles/` separates global/theme foundations, dialog styles, workspace styles, and scrollbar styling; `src/index.css` imports them.

## Technical decisions

- MongoDB persistence with Mongoose schemas and a sparse unique index for optional email.
- List query parameters are allowlisted and validated; regex search/filter values are escaped, and page size is capped at 100.
- Contact edits submit the observed Mongoose `__v`. The server rejects stale versions with HTTP 409 and Mongoose optimistic concurrency also detects races that happen during save.
- Tag changes made through the edit form are persisted with the contact update and logged as `TAG_ADDED`/`TAG_REMOVED`; bulk assignment only logs contacts whose tag changed.
- Backend request-validation tests run with `npm test` (or `npm test --workspace=server`). Run `npm run build` from the repository root to build both workspaces concurrently; the client and server outputs are written to `packages/client/dist` and `packages/server/dist`. Run `npm start` to start the compiled backend after building. Run `npm run lint --workspace=client` for frontend linting.

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
