# Implementation roadmap — V1

## Delivery principles
**Confirmed baseline:** the repository currently builds a local Vite demo only; current `npm run check` is a production Vite build, not a test suite. **Recommendation:** avoid a big-bang rewrite by replacing one boundary at a time behind an isolated staging environment. No phase introduces unapproved AI admission, public images, or a dependency on full-wardrobe scanning. The phases below are ordered for one developer; each is a releasable/testable slice.

## Phase 0 — Approved architecture record and foundation
**Scope:** approve these four documents; select hosting/auth/database/storage/queue after written pricing, DPA, region, OAuth, and operational comparison; add TypeScript/application skeleton and test harness only after approval. **Dependencies:** provider accounts/decision. **Risks:** premature vendor lock-in. **Done:** an architecture decision record identifies providers, data region, secrets, costs, ownership model, and rollback. **Tests:** review checklist and empty app build/type/lint/unit command. This is V1 foundation.

## Phase 1 — Hebrew-first shell and locale contract
**Scope:** route shell, Hebrew default/English, `dir`, logical CSS tokens, Israel formats, original visual tokens, RTL visual-test fixtures. No cloud images/AI. **Dependencies:** Phase 0. **Risks:** translated-but-broken RTL. **Done:** mobile Today/Wardrobe/Outfits/Profile placeholders mirror and read correctly in both locales. **Tests:** component locale tests, keyboard/a11y scan, 320/375/430 screenshot review in RTL/LTR.

## Phase 2 — Cloud identity and tenant boundary
**Scope:** Google/Apple OAuth, user/identity/profile/onboarding-progress records, secure session/CSRF/rate limits, server actor context. **Dependencies:** Phase 0, OAuth credentials. **Risks:** Apple callback/policy and tenant leaks. **Done:** two test users cannot read/mutate each other; onboarding resumes; email provider interface exists but no UI. **Tests:** auth integration/E2E, authorization matrix, session/CSRF/rate-limit tests.

## Phase 3 — Core schema, deletion primitives, and audit
**Scope:** migration-managed PostgreSQL schema for users/preferences/consents/media/wardrobe groups/instances plus audit and deletion requests; backups/restore runbook. **Dependencies:** Phase 2. **Risks:** irreversible model errors. **Done:** schema constraints enforce tenant and approved-item invariants; a test account purge records stages. **Tests:** migration forward/rollback in ephemeral DB, transaction/constraint tests, restore drill.

## Phase 4 — Private upload and media lifecycle
**Scope:** private storage, signed upload/view flow, image signature/dimension validation, media/source records, retention scheduler stub, secure processing derivative. **Dependencies:** Phases 2–3. **Risks:** unsafe upload/public URL/cache leaks. **Done:** authenticated user uploads one selected image; only its owner receives short-lived view access; rejected invalid files never reach worker processing. **Tests:** upload corpus (bad magic/oversize/pixel bomb), signed-URL expiry/tenant tests, object cleanup test.

## Phase 5 — Basic trusted wardrobe CRUD
**Scope:** manual item addition, group/instance model, structured editable metadata, archive/restore/delete, mobile Wardrobe/item details, sparse states. **Dependencies:** Phases 1–4. **Risks:** confusing quantity/group wording. **Done:** a user manually creates, edits, archives/restores, and deletes one group with multiple physical instances; archived item is excluded from eligibility query. **Tests:** CRUD API/tenant E2E, accessibility/RTL screens, delete dependency tests.

## Phase 6 — Durable detection job infrastructure
**Scope:** queue/worker, job tables/leases/idempotency/cancel/retry/dead letter, encrypted secrets, cost ledger and job status API. Initially use a deterministic fake detector. **Dependencies:** Phases 3–4. **Risks:** double processing/restart loss. **Done:** worker crash/restart and duplicate enqueue process a source once; cancel and retry are observable. **Tests:** queue lease/idempotency/timeout/retry tests, fake-provider contract tests, trace/cost metrics checks.

## Phase 7 — Multi-item detection and review queue
**Scope:** selected daily/multi-item source upload, verified vision/segmentation provider integration, candidate crops/metadata/confidence, review UI, reject/report/reanalyze quota. Do not add optional visualization. **Dependencies:** Phase 6 and provider evaluation. **Risks:** poor crop quality, AI hallucination/cost. **Done:** one source yields multiple candidates; each can be crop/metadata edited and no candidate creates a wardrobe item before explicit approval. **Tests:** golden-image provider eval, confidence routing, approval gate integration, Hebrew review usability test.

## Phase 8 — Duplicate resolution and provenance
**Scope:** hash/embedding retrieval, nearest approved same-user groups, decision UI/transactions/sightings, correction history. **Dependencies:** Phase 7, vector capability. **Risks:** false merge of identical-looking garments. **Done:** test fixture supports same instance, three identical instances, and visually similar different item; every case is user-decided/reversible. **Tests:** retrieval precision/recall target evaluation, tenant isolation, three decision transaction tests, correction regression.

## Phase 9 — Daily outfit and gradual selected-photo import
**Scope:** Today capture, daily image/wear context; selected browser photo batches, pause/resume/reject/delete-by-batch, photo self-confirmation prompt. **Dependencies:** Phases 4, 7–8. **Risks:** implying platform-wide access and complex batch recovery. **Done:** user selects specific photos, stops/resumes, removes photos/candidates, and deletes an import batch with impact preview. **Tests:** browser picker contract, batch state/cancellation tests, source purge tests, mobile E2E.

## Phase 10 — Structured metadata completion and availability
**Scope:** taxonomy UI, user-confirmed versus AI confidence/provenance, season/warmth/formality/style, condition/availability and optional laundry-state feature flag. **Dependencies:** Phases 5, 7. **Risks:** onerous form and overconfident labels. **Done:** unknown is valid, edits preserve evidence, unavailable/damaged/dirty items are excluded by one canonical eligibility service. **Tests:** enum/validation/property tests, eligibility matrix, Hebrew label review.

## Phase 11 — Rule-based outfits
**Scope:** weather adapter with consent/location/date selection, candidate templates/filtering/diversity, outfit save/edit/replace/required/excluded/favorite/worn history. **Dependencies:** Phase 10. **Risks:** sparse wardrobes and invalid combinations. **Done:** recommendations use only eligible approved items and provide deterministic reasons/fallback; manual outfit works without weather. **Tests:** exhaustive eligibility fixtures, weather/context rule tests, no-invented-ID contract, RTL E2E.

## Phase 12 — AI ranking, explanations, and feedback
**Scope:** bounded valid-candidate ranker, schema validation, explanation/alternatives, score dimensions, explicit feedback and transparent personalized signals. **Dependencies:** Phase 11 and ranker eval. **Risks:** fabricated items/explanations, costs. **Done:** ranker receives/returns only supplied IDs; outage/quota falls back to deterministic order; user can reset feedback signals. **Tests:** prompt/schema adversarial tests, explanation faithfulness eval, fallback/cost cap tests, privacy withdrawal test.

## Phase 13 — Statistics and cautious gap insights
**Scope:** item/physical counts, distributions, wear/recent/availability views, evidence-labelled rule-based gap observations. **Dependencies:** Phases 10–12. **Risks:** subjective shopping advice stated as fact. **Done:** stats reconcile with instances/history; insights show evidence, are dismissible, and contain no purchase mandate. **Tests:** aggregation/reconciliation tests, empty/sparse states, copy review.

## Phase 14 — PWA, privacy completion, and operational hardening
**Scope:** installability, static-shell offline state, no private shared cache, consent/settings/media dashboards, account deletion worker, export-request design, quotas/alerts/dashboards/backup restore. **Dependencies:** all media/auth phases. **Risks:** stale private data, incomplete purge, unseen costs. **Done:** offline state is honest; account deletion passes end-to-end purge test; dashboards report per-user costs/queue health; alerts fire in staging. **Tests:** service-worker cache tests, deletion chaos test, quota/rate-limit test, restore drill, security review.

## Phase 15 — Private-beta readiness and Hebrew RTL QA
**Scope:** invite controls, support/runbooks, metrics/evaluation thresholds, accessibility/manual RTL QA, incident/cost kill switches, privacy/legal/asset-license review. **Dependencies:** Phases 1–14. **Risks:** insufficient evaluation and one-developer support load. **Done:** beta checklist signed: authorization pen-test/review, provider failure drill, model evaluation baseline, Hebrew copy/layout review on target phones, legal notices/provenance inventory, rollback plan. **Tests:** full E2E smoke, load/queue test at beta cap, WCAG audit, multilingual visual regression, production-readiness exercise.

## Post-V1 experiments (not prerequisites)
Google Photos integration only after current API/permission/product review; email fallback; consented optional visualization; native wrapper; custom learned ranker; video wardrobe scan. A video experiment may sample user-selected key frames rather than all frames, must disclose that folded/obscured garments make physical identity and details unreliable, cap cost, compare against a manually labelled ground truth, require review for every candidate, and stop if accuracy/cost fails gates.

## Exact first implementation task after approval
**Create a TypeScript, Hebrew-first application shell with a locale/`dir` contract and automated RTL/LTR visual smoke test for an empty Today screen.** It is small, low-risk, independently testable, does not move personal data or introduce cloud/vendor commitments, and establishes the non-negotiable layout boundary before reusing UI code. Definition: default `he-IL`, switchable `en`, localized date/°C examples, `dir="rtl"`/`ltr`, logical CSS only in new shell, and screenshots at 375px passing manual Hebrew review.
