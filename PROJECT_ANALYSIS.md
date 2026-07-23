# Wardrobe Project Analysis

## Scope and assessment method

This report documents the repository as it exists at analysis time. I read every tracked source, configuration, workflow, PWA asset, bundled Codex skill, and helper script. The repository is deliberately small: its runnable application is a Vite development/preview server with a React client and two Vite middleware plugins. The `data/` directory is intentionally ignored, so there is no committed sample wardrobe or identity reference to inspect.

## 1. Repository map and technologies

| Area | Files | Responsibility |
| --- | --- | --- |
| Client entry | `index.html`, `src/main.jsx` | Browser document, React 19 root, global stylesheet, production-only service-worker registration. |
| Gallery/editor UI | `src/App.jsx`, `src/styles.css` | Loads the local wardrobe, category filter, gallery, item viewer, browser-only edits/deletes, palette extraction, and colour sampling. |
| Import/review UI | `src/import-flow.jsx`, `src/import-flow.css` | Drag/drop/file/paste importer, setup state, import-job polling, manual approval/rejection/regeneration, metadata editing, and chroma-cleanup review. |
| Image presentation | `src/OptimizedImage.jsx` | Uses `@unpic/react` and local IPX URLs for responsive images where possible; bypasses IPX for data/blob/API URLs. |
| Development-side API | `scripts/import-job-api.mjs` | A Vite middleware implementing JSON endpoints, local job files, OpenAI calls, Sharp image processing, review-stage state machine, and library persistence. |
| Development-side image API | `scripts/responsive-image-api.mjs` | A Vite middleware exposing `/_ipx`, backed only by the local `public/` and built `dist/` folders. |
| Tooling | `vite.config.mjs`, `package.json`, `package-lock.json`, `.github/workflows/ci.yml` | Vite 6, Node 22 CI, React plugin, image middleware registration, and build-only check. |
| PWA shell | `public/sw.js`, `public/manifest.webmanifest`, `public/icon.svg` | Installable shell metadata plus a minimal navigation/image cache. |
| Local automation | `.agents/skills/import-clothes/*`, `.agents/skills/generate-outfits/*` | Codex-operated import and outfit-generation workflows; these are not user-facing browser features. |
| Documentation/configuration | `README.md`, `.env.example`, `CONTRIBUTING.md`, `.gitignore` | Local setup instructions, OpenAI-related environment variables, contribution rules, and protection against committing personal/generated data. |

The application is JavaScript/JSX (no TypeScript), ES modules, React function components/hooks, plain CSS, Node built-ins, Sharp, IPX, and direct `fetch` calls to OpenAI. There is no standalone application server, database, ORM, authentication library, test framework, API client SDK, router, state-management package, or deployment configuration.

## 2. Architecture and runtime boundary

### Browser client

`main.jsx` mounts `App` under `React.StrictMode`. `App` is a single-page gallery with no URL routes. It fetches the wardrobe once from `GET /api/import/wardrobe`, keeps the response in React state, filters it by one of five clothing-part values, and renders images. It mounts `WardrobeImportFlow` permanently so the floating importer is available on every gallery state.

The viewer/editor is client-side. It computes a small palette from visible, non-transparent pixels by drawing the garment image to a canvas; it can also sample a clicked pixel. Saving metadata writes only to browser `localStorage` under `open-wardrobe-edits-v1`. Deleting an imported item additionally calls the middleware deletion endpoint; deleting any item is also remembered in `open-wardrobe-deleted-v1`. Consequently, metadata edits and deletion state are browser/device-specific and are not authoritative server records.

### Vite middleware “backend”

`vite.config.mjs` loads all environment variables, installs React, then installs the image and import middleware plugins. Both plugins declare `apply: "serve"`, which means the core backend behavior is intended for Vite dev-server operation. The import plugin also exposes its handler to preview-server middleware, but build output does not include a deployed server implementation.

The import middleware makes local directories under `WARDROBE_DATA_DIR` (default `data/`):

```text
data/
  jobs/<UUID>/
    job.json
    original.png
    crop.png
    garment-<attempt>-source.png
    garment-<attempt>.png
    modeled-<attempt>.png
  imported/
    import-<UUID>-garment.png
    import-<UUID>-modeled.png
  library.json
  model-reference.png
```

It reads/writes JSON atomically via a temporary file and rename/copy fallback. Job internals (local filenames) are removed before sending a job to the browser. The module-level in-memory `running` map prevents duplicate generation for a given job/stage within one Node process; it does not coordinate multiple processes or machines.

### Data model

A persisted library record has an `id` prefixed `import-`, display metadata (`name`, `part`, primary/secondary colours, `tags`, `palette`), garment/thumbnail URL, optional modeled-image URL, and its import-job UUID. Accepted garment assets and modeled assets are copied into `data/imported/`; transient job inputs and generated attempts stay under `data/jobs/` until a job is rejected or fully completed.

A job contains normalized metadata and three stages:

1. **crop** — immediately created in `review` after model detection and server-side bounding-box crop;
2. **garment** — starts `pending`, then `queued`/`processing`, `review`, `approved`, `rejected`, or `failed`;
3. **modeled** — follows the same generated-stage pattern after garment approval.

Stage records also track attempts, prompt overrides, asset URLs, failure source/cleanup URLs, cleanup tolerance/diagnostics, timestamps, error, and decision.

## 3. Current experience from a user’s perspective

1. The user opens a minimal wardrobe gallery. It initially reports its item count and lets the user filter All, Tops, Jackets, Bottoms, Accessories, and Shoes. With no local `library.json`, the gallery is empty and invites an import.
2. Selecting an item opens an overlay editor. If a modeled image exists, it is the editorial hero image with the garment floating over it; otherwise the cutout is the main image. The user can rename an item, recategorize it, edit tags, select colours, use suggested canvas-derived colours, or click the item to sample a colour. They must explicitly save or cancel before closing unsaved changes.
3. The user can delete an item. Imported items are removed from `data/library.json` and their two copied asset files are removed locally. The browser also records the deletion in localStorage.
4. The floating “Add clothes” control accepts file-picker images, dropped image files, and pasted image files. Before importing, it requires a local `.env` API key and local PNG identity reference.
5. After upload, each detected clothing item appears as a crop for review. The user can reject it or approve the crop.
6. Approval begins clean cutout generation. When ready, the user reviews the generated transparent garment and can correct its name/category/colours/tags, reject it, regenerate with a short free-text instruction, or approve it.
7. Garment approval writes the cutout and metadata into the local wardrobe immediately, then starts a modeled editorial image. The modeled image may be reviewed, regenerated, rejected, or approved. Approval attaches the modeled image and completes/removes the transient job.
8. If automatic chroma cleanup fails, the UI offers a local tolerance slider and source/transparent-preview comparison; accepting a satisfactory local cleanup returns the garment to review.

There is no browser page that presents outfit combinations or a lookbook. The gallery only displays individual garments, even though an agent skill can create local outfit files.

## 4. AI pipeline: upload to wardrobe

### A. Upload and detection

The browser reads each selected image with `FileReader` as a data URL and sends JSON to `POST /api/import/jobs`. The server accepts a maximum 25 MiB request body, decodes base64, normalizes EXIF orientation/colour space and converts the input to PNG using Sharp.

The server calls OpenAI’s Responses endpoint directly. The detection prompt asks for every distinct wearable item, one tight bounding box per item in normalized 1000×1000 coordinates, a constrained category, concise name, one/two hex colours, and up to four lowercase tags. It requests strict JSON-schema output with zero to eight items. Returned metadata is normalized again locally: category and colour values are constrained, strings/tags are bounded, and boxes are clamped. The server then writes the normalized original and one padded Sharp crop per detected item, creates a reviewable job per item, and returns `202` with the jobs.

### B. Human crop gate

Detection does **not** automatically make a cutout. The user must approve the crop. Crop rejection removes the complete job directory. Crop approval asynchronously begins the garment stage and the UI polls the job endpoint every 900 ms when a stage is active.

### C. Garment extraction/reconstruction

For a garment stage, the server picks the chroma key that is most distant from the metadata’s primary colour among green, magenta, and cyan. It builds a detailed extraction prompt requesting exactly one front-facing, complete, source-faithful empty product cutout on that perfectly uniform key colour. Any user regeneration instruction is appended.

It sends the crop to `POST <OPENAI_API_BASE_URL>/images/edits` as multipart form data, defaulting to `gpt-image-2`, high quality, PNG, and 1024×1024. The raw keyed result is retained as `garment-N-source.png`. The server removes keyed pixels, feathers/transparently despills near-key pixels, trims/reframes the visible item to a 1024×1024 transparent canvas (88% occupancy), validates residual key-colour spill, and writes the resulting PNG. A strict spill failure preserves the raw source and puts the stage in `failed` so the user can tune local cleanup instead of calling the model again.

### D. Wardrobe persistence and modeled image

Approving a reviewed garment copies its cutout into `data/imported/` and upserts its library record in `data/library.json` immediately. It also begins modeled generation. The modeled generation supplies two images to the Images edit endpoint: the locally configured identity reference first and accepted garment second. Its fixed prompt asks for a horizontal 3:2 editorial image that preserves identity and exact garment fidelity while using neutral supporting clothing. The default output size is 1536×1024.

Approving the modeled result copies it to `data/imported/`, updates the same library record with `modeledImage`, marks the job complete, and removes the transient job directory. A rejected stage deletes the job directory; regenerating a garment or modeled image queues another asynchronous attempt and retains a user-supplied prompt of at most 1,200 characters.

## 5. Outfit generation is separate, local Codex automation

The project does not implement outfit generation in the web app or API. Instead, the tracked `generate-outfits` skill tells a Codex agent to inspect `data/library.json` and `data/imported/`, select unique combinations containing exactly one top and bottom (with optional layer/shoes/accessory), invoke the separate Imagegen capability, visually verify each result, and write `data/outfits.json` plus `data/outfit-images/`. It explicitly warns not to claim the current gallery displays outfits unless an outfit route exists.

Likewise, `import-clothes` is an alternative agent workflow: it inventories local source folders, generates/reviews cutouts and modeled photos outside `data/`, then invokes a deterministic importer. That script validates PNG alpha, derives a stable UUID from garment bytes, copies approved assets to `data/imported/`, and atomically upserts `data/library.json`. The two skills share the local library format but do not call the browser API as part of their normal flow.

## 6. Images, metadata, prompts, and API-call ownership

| Concern | Owner/location | Details |
| --- | --- | --- |
| Uploaded image bytes | Browser `FileReader`; middleware `decodeImage`/`normalizeImage` | Browser creates base64 JSON; server limits request, normalizes orientation/colour space, and saves PNG. |
| Original/crop/generation attempts | `data/jobs/<id>/` via import middleware | Original and crop persist during review; raw keyed garments, accepted cutouts, modeled attempts, and cleanup previews live with the job. |
| Durable garment/modeled assets | `data/imported/` | Copied from approved jobs or the Codex deterministic importer. Served at `/api/import/library/<file>`. |
| Durable wardrobe metadata | `data/library.json` | Local JSON array, atomically rewritten on import/upsert/delete. |
| Temporary import metadata | `job.json` | Includes normalized detection values, bounding box, stage state, prompt override, errors, timestamps, and asset links. |
| Browser-only metadata overrides | `localStorage` in `App.jsx` | Name/category/colours/tags edits and deletion hiding are local to one browser; they are not written back to `library.json`. |
| Detection prompt/schema | `openAIAnalyze` in `scripts/import-job-api.mjs` | Responses API vision prompt plus strict JSON Schema. |
| Garment prompt | exported `buildGarmentPrompt` in import middleware | Uses reviewed metadata and selected chroma key; regeneration direction is appended. |
| Modeled-item prompt | `generate` in import middleware | Fixed identity-preserving horizontal editorial prompt; regeneration direction is appended. |
| Outfit prompt | `.agents/skills/generate-outfits/references/outfit-image-prompt.md` | Used only by Codex/Imagegen local workflow, not by the browser app. |
| OpenAI API credentials/model config | `.env` / process env loaded by Vite | API key never reaches client code; configurable vision/image models, quality, API base URL, model reference, and data directory. |

## 7. Frontend/backend communication contract

All browser/backend communication is same-origin JSON `fetch`; there is no SDK, WebSocket, GraphQL, server-sent events, authentication header, or versioned public API. The client assumes Vite hosts the following endpoints:

| Endpoint | Methods | Browser use |
| --- | --- | --- |
| `/api/import/config` | GET | Determines whether local API key and identity file exist. |
| `/api/import/wardrobe` | GET | Initial gallery load. |
| `/api/import/wardrobe/:importId` | DELETE | Deletes imported durable record and local image assets. |
| `/api/import/library/:file` | GET | Serves a durable PNG. |
| `/api/import/jobs` | GET, POST | Lists unfinished jobs; uploads a base64 image and starts detection. |
| `/api/import/jobs/:uuid` | GET, DELETE | Polls a single job or removes it. |
| `/api/import/jobs/:uuid/metadata` | PATCH/PUT | Saves reviewed garment metadata to the job. |
| `/api/import/jobs/:uuid/stages/:stage/(approve|reject|regenerate)` | POST | Advances/rejects/retries stage. |
| `/api/import/jobs/:uuid/stages/garment/(cleanup-preview|cleanup-accept)` | POST | Runs local cleanup at a requested tolerance. |
| `/api/import/assets/:uuid/:file` | GET | Serves transient crop/job attempt PNGs. |
| `/_ipx/...` | GET | Provides local responsive transforms only for sources handled by IPX. |

The client’s optimistic detail is limited: after garment approval it immediately inserts a constructed item into React state, and after modeled approval it attaches the expected durable image URL. On reload, the durable source of truth is `/api/import/wardrobe`, with browser localStorage overlays applied afterward.

## 8. Production-readiness assessment

### Substantive/reusable foundations

- The UI is responsive, keyboard-aware in the item viewer, has meaningful labels, respects reduced motion in CSS, and provides a minimal PWA manifest and service worker.
- Import work is separated into reviewable stages rather than blindly accepting AI output. It supports retry/regeneration and failure recovery for keyed-background cleanup.
- Inputs and model output are constrained: upload-size cap, JSON parsing errors, schema-guided detection, normalized categories/colours/tags/boxes, UUID-only job routes, basename-based asset paths, atomic JSON writes, and local image normalization.
- Generated images are processed with Sharp rather than trusting a visual key background to be transparent. The deterministic skill importer validates that catalog PNGs contain alpha and visible pixels.
- The key is held in the middleware environment rather than exposed to browser JavaScript. Ignoring `.env` and `data/` avoids accidental commits of personal images/API credentials.
- CI reliably installs locked dependencies and runs the Vite production build.

### Local/demo-only components

- The API is Vite middleware, not a deployable server/API service; the plugin is explicitly `apply: "serve"`.
- Persistence is a single local JSON file and local filesystem folders that are excluded from Git and tied to the machine/container running Vite.
- “Accounts” are absent; all visitors to the same server share the same library, jobs, key, identity reference, and writable data directory.
- Client metadata changes use localStorage, so they neither sync across browsers nor persist in the underlying library; local deletion hiding can mask records despite durable server state.
- The implementation has no browser outfit page/API even though agent-only skills can create outfit files.
- Image optimization only reads local public/build storage; API image URLs intentionally bypass it. The service worker does not cache API responses and only uses cache-on-success for navigation and stale-while-revalidate for IPX images.
- Test coverage is absent: `npm run check` is just `vite build`.

## 9. Limitations blocking a real cloud-based mobile web application

The following are blockers or material gaps, not merely enhancement ideas.

### Hosting, service architecture, and data

1. **No cloud deployable backend.** The import API is embedded in Vite serve middleware and is not shipped by `vite build`; a production host needs a real server/serverless/container worker architecture.
2. **No managed durable storage.** Jobs, personal source photos, garment PNGs, modeled photos, and library metadata depend on local disk. A cloud application needs object storage, a database, retention rules, backups, migrations, and lifecycle cleanup.
3. **No asynchronous durable job queue.** Generation is launched with un-awaited in-process promises and tracked in a module-local `Map`. Server restart recovery is partial and multi-instance operation can race, duplicate work, or lose job coordination.
4. **No multi-user data isolation.** There are no identities, accounts, sessions, authorization checks, tenancy boundaries, quotas, or per-user directories/library ownership.
5. **No secure production secrets management.** The design expects a single developer-provided `.env` key and a locally mounted identity reference. It lacks cloud secrets integration, key rotation, per-user billing/entitlements, and a design for users to provide their own credentials safely.
6. **No public API hardening.** There is no authentication, CSRF strategy, rate limiting, abuse prevention, concurrency limits, request tracing, CORS policy, audit log, idempotency key, endpoint versioning, or monitoring/alerting.
7. **No robust data consistency/concurrency control.** Whole-file JSON read/modify/write can lose updates from concurrent requests/processes, and asset copy/database update is not a transaction. Browser localStorage overlays produce conflicting sources of truth.
8. **No production serving strategy for generated assets.** API reads entire image files into memory, hard-codes PNG content type for library assets, uses immutable caching even if a file could be replaced, and lacks signed URLs/CDN/transform pipeline/original-vs-derived asset policy.
9. **No backup, restore, export, deletion-retention, or disaster-recovery design.** Removing data is immediate local filesystem deletion; there is no user export or recovery window.

### Mobile-web experience and reliability

10. **Not offline-capable for its core use case.** The PWA caches only minimal shell/navigation/IPX images and explicitly bypasses `/api/`; imports, gallery data, and jobs are unavailable offline. There is no queued upload/sync/conflict handling.
11. **Large uploads are base64 JSON.** FileReader expands data before transmission and the server has a 25 MiB body limit. There is no direct-to-object-storage upload, multipart/resumable upload, client resizing/compression policy, HEIC strategy, progress measurement, or mobile-network retry.
12. **Background work is unreliable on mobile.** The browser uses 900 ms polling only while open and server generation depends on a live Vite Node process. There are no push notifications, job resumption UX, background sync, or mobile-safe long-running worker semantics.
13. **No comprehensive mobile validation.** There is no automated unit/integration/e2e/accessibility/visual/device/browser test suite; CI only proves the static bundle builds.
14. **No route/deep-link/share model.** The SPA has one screen and no URL-addressable item, wardrobe, import, account, or outfit pages; browser navigation, sharing, indexing, and restoration are limited.
15. **Accessibility needs formal verification.** Although the viewer has labels and focus behavior, modal focus is not trapped, there is no explicit focus restoration, and no audited screen-reader/error/live-region coverage for the full import workflow.

### AI safety, quality, privacy, and commercial operation

16. **No production AI orchestration controls.** Requests go straight to OpenAI synchronously with no provider timeout/retry/backoff policy, circuit breaker, cost accounting, per-user quotas, moderation/safety policy, prompt/model version tracking, or evaluation/quality metrics.
17. **AI output quality is not guaranteed.** Model-detected metadata and generative garment reconstruction can misidentify items, invent/remove construction, colours, logos, or text, and modeled-image generation can drift identity. Human approval helps but does not establish robust automated QA or confidence thresholds.
18. **Sensitive personal imagery has no privacy/compliance implementation.** Identity reference and user photos are retained locally without consent records, access controls, encryption-at-rest/in-transit policy, regional storage controls, privacy notice, data-processing agreements, age handling, or user deletion/export workflow.
19. **No content-security/user-abuse controls.** The app accepts arbitrary `image/*` in the browser, does not validate all input formats before Sharp processing beyond decoding, and has no content moderation/virus scanning/prohibited-content policy.
20. **No observability/support tooling.** Failures are mostly per-job strings; no structured logs, metrics, distributed traces, error reporting, operation dashboard, admin tools, or user-visible job history exists.
21. **No cost/performance controls.** Every generated stage defaults to high-quality model calls; there is no estimate/confirmation, budget guardrail, image deduplication for web upload, caching of inference results, batching/worker scaling, or usage reporting.

### Product completeness

22. **Outfit generation is not part of the mobile web product.** It is an agent skill writing local files, not a secured browser feature; there is no outfits API, UI, persistence schema exposed to the app, or gallery/lookbook route.
23. **Item edits are not server-persisted.** Name/category/colour/tag changes are device-local localStorage overlays. A real product needs authenticated server mutations, conflict resolution, and consistent metadata rendering.
24. **Deletion behavior is incomplete for cloud semantics.** Browser hidden IDs persist independently, server deletion is limited to expected import IDs, and there is no confirmation/recovery/soft-delete/audit policy.
25. **No onboarding/account/payment/legal product layer.** There is no user provisioning, subscription/billing handling, terms/privacy consent, support flow, or analytics/feature flagging.

## 10. Recommended interpretation

This is a thoughtfully implemented local-first prototype for one owner/developer: it demonstrates review-gated AI clothing extraction, transparent catalog cutouts, modeled item previews, and a pleasant mobile-responsive gallery. Its strongest production-oriented ideas are input normalization, staged approvals, local atomic writes, and failure-recovery UI. It should not be described as a deployable multi-user cloud mobile application yet. The next implementation phase should first establish user identity, cloud persistence/object storage, a queue-backed API/worker boundary, secure server-side OpenAI orchestration, server-persisted edits, and real testing/observability before expanding user-facing outfit generation.
