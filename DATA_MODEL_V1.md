# Data model — V1

## Conventions and invariants
**Recommendation.** Use PostgreSQL UUID primary keys, `owner_user_id` on every user-private root and denormalized tenant-owned child where useful, UTC timestamps plus locale/time-zone fields, versioned enums/taxonomies, `created_at/updated_at/created_by/updated_by`, optimistic `row_version`, `deleted_at`, and `purge_state`. Object storage keys—not URLs—are persistent. Server computes ownership, audit fields, hashes, confidence, scores, and lifecycle state; user edits labelled fields, notes, choices, and preferences. IDs below are illustrative, not migrations.

**Global rules.** A recommendation joins only active `wardrobe_item_instances` in approved groups. AI candidate data is never eligible. A visual group can have many physical instances; quantity is a derived count, never a guessed duplicate count. Permanent deletion is asynchronous and auditable. Source images, daily outfits, body references, and generated outputs are separate media purposes.

## Identity, preferences, consent
| Entity | Purpose / important fields | ownership, relationships, lifecycle & deletion | sensitivity / editable |
|---|---|---|---|
| `users` | Account: id, status, preferred_locale, timezone, beta/quota flags, created/deleted/purge fields | owns all data; created after auth, disabled then purged on account deletion | high; server status/IDs, user locale |
| `auth_identities` | OAuth subject/provider, encrypted provider metadata, verified email hint, last login | many → user; revoke tokens/session on unlink/delete; provider subject server-only | high; server-managed except unlink request |
| `user_profiles` | presentation preferences, optional height_cm/weight_kg/age_range | 1:1 user; null values are valid; purge with user | sensitive; user editable, derived units server-normalized |
| `user_preferences` | temperature sensitivity, formality, footwear, dislike/refusal/modesty settings, weather location consent | 1:1/current version; history optional | sensitive preference; user editable |
| `style_preferences` | normalized style/color/silhouette preference rows with strength/source | many → user; can be withdrawn | sensitive inference; explicit user fields and server confidence/source |
| `onboarding_progress` | step keys, completed/skipped timestamps, version, resume route | 1:1/current state; remove with user | low; server timestamps, user answers |
| `consent_records` | purpose, policy version, locale, scope, granted/withdrawn timestamp, evidence | many → user; immutable audit, retained per legal policy even after withdrawal | high; server timestamp/IP minimization; user grants/withdraws |

## Wardrobe and media
| Entity | Purpose / important fields | ownership, relationships, lifecycle & deletion | sensitivity / editable |
|---|---|---|---|
| `wardrobe_item_groups` | Visual product grouping: name, canonical image asset, category/subcategory, status `candidate/approved/archived/rejected/deleted`, taxonomy/pipeline version | user-owned; has instances, attributes, source links; approval requires review; soft delete then purge | private; user labels/status; server approval/audit |
| `physical_item_instances` | One owned physical object: group_id, instance label, availability, condition, laundry state, acquired/retired dates | many → group; same sighting adds no instance; identical item creates one; archive/delete affects eligibility/history policy | private; user state, server IDs |
| `item_quantities` | Optional materialized count/group stock summary: group_id, active/archived count, recalculated_at | 1:1 group derived from instances, never source of truth | low; server-only |
| `item_style_attributes` | versioned field/value records: colors, pattern, material, fit, silhouette, length, style, season, warmth, formality, prominence, modesty, brand, size; value source, confidence, confirmed_at | many → group/possibly instance for condition-specific fields; supersede not overwrite evidence | private; AI/server confidence and provenance; user can confirm/edit |
| `item_availability_history` | availability/condition/laundry changes, reason/date | many → instance; preserves recommendation explanation | private; user edits, server audit |
| `media_assets` | common asset registry: object_key, purpose, mime/dimensions/hash, processing derivative_of, encryption/storage class, retention/purge fields | owner and one purpose-specific parent; signed only after auth | very high for originals/body; server object metadata, user deletion |
| `source_images` | wardrobe evidence: media_asset_id, capture/import purpose, source type manual/device/multi-item/daily/future, selected_at, source hash | belongs user/import batch; links candidates and approved groups through join; delete cascade/preserve choice | high; source selection user, server hashes |
| `daily_outfit_images` | daily image: media asset, worn date/context, detection source, retention selection | belongs user; optionally links outfit history | high; user date/context/delete, server metadata |
| `body_reference_images` | separately consented optional visualization reference, orientation/quality status | belongs user; no core recommendation relation; revoke/delete invalidates generation | extremely high; user upload/delete, server quality/consent status |
| `generated_images` | generated cutout/editorial/visualization: media asset, generator/pipeline/version, input refs, label | belongs user and group/outfit; must declare whether visual-only; delete independently | high; server provenance, user delete |

## Import, detection, and review
| Entity | Purpose / important fields | ownership, relationships, lifecycle & deletion | sensitivity / editable |
|---|---|---|---|
| `import_batches` | explicit selected photo operation: name, source channel, state, selected/processed counts, cancel/resume/retention | user owns many source images/jobs; one active beta; delete-by-batch impact record | high; user name/cancel/delete, server counters |
| `detection_jobs` | durable worker job: source/batch, type, status, lease/idempotency key, attempts, provider, pipeline, cost, errors, timestamps | user-derived; creates candidates; cancel requests honored at safe checkpoints; purged per retention | high; server-managed except cancel/retry request |
| `detected_item_candidates` | unapproved result: source, crop/mask assets, bounding geometry, normalized proposed metadata, confidence JSON, status, pipeline/raw-response ref | owned via source/user; has review and duplicate candidates; approve creates group/instance transaction | high; user corrects proposal/crop; server confidence |
| `review_queue_entries` | explicit ordering/state/reason (low confidence, extraction failure, duplicate ambiguity), assigned user only | 1:1 candidate/current; resolved/rejected/deleted retained as audit summary | high; server state, user decision |
| `candidate_duplicate_matches` | retrieval evidence: candidate, matched group/instance, embedding/hash/metadata component scores, threshold/version | many → candidate, tenant restricted, expires/recomputes | high; server-only scores |
| `duplicate_resolution_decisions` | user answer `same_instance/identical_new_instance/similar_different/unsure`, selected target, rationale, reversible/superseded fields | candidate → target; creates sighting/instance/group; correction supersedes decision, never silently erases evidence | high; user decision, server audit |
| `item_sightings` | evidence that a source/candidate depicts an existing physical instance, crop/source relation/date | many → instance; created only by same-item decision | high; server relation, user may correct |

## Outfits, weather, learning
| Entity | Purpose / important fields | ownership, relationships, lifecycle & deletion | sensitivity / editable |
|---|---|---|---|
| `outfits` | saved composition: name, occasion/style/formality, favorite, origin manual/recommendation, status | user owns many outfit items/history; soft delete, preserve historic snapshot | private; user fields, server provenance |
| `outfit_items` | slot/order, group_id and optionally instance_id, required flag, metadata snapshot | many → outfit; active composition validates eligibility; historic snapshots remain after item archive/deletion | private; user order/choice, server validation |
| `outfit_history` | worn/scheduled event: outfit snapshot, worn_at/local zone, context/notes | many → outfit/user; delete/edit policy explicit | sensitive behavioral; user editable/delete, server audit |
| `outfit_recommendation_requests` | constraints, requested date/location, excluded/required IDs, request state, algorithm version | user owns many candidate sets; expire/purge raw inputs on retention plan | sensitive preference/location; user constraints, server context/version |
| `recommendation_candidates` | generated valid outfit snapshot, rank/status/explanation | many → request; only eligible item snapshot; retained for feedback/audit | private; server-generated, user save/reject |
| `candidate_scores` | general, personal, context, weather, confidence, deterministic eligibility/rejection explanation, ranker version | 1:1/many score dimensions → candidate; immutable versioned evaluation | inferred sensitive preference; server-only |
| `user_outfit_feedback` | feedback type, target outfit/candidate/items, optional text, explicitness | user-owned; withdrawal deletes/deactivates associated signal | sensitive; user editable/delete |
| `personal_style_signals` | derived preference weights/features, source feedback/event, decay/version/consent | many → user; recomputable and delete on feedback/account removal | inferred sensitive; server-generated, user can inspect/reset |
| `weather_contexts` | provider/location granularity consent, forecast/observed temp °C, feels-like, rain/wind, fetched_at | referenced by request/history; TTL/cache and delete precise location where requested | location-sensitive; server values, user selects location/date |

## Relationships and lifecycle transactions
`users` → all roots. `import_batch` → `source_image` → `detection_job` → `candidate` → `review` and optional duplicate matches. **Approval transaction:** confirm candidate ownership/status; resolve duplicate; either create group+instance, add instance, or sighting; attach candidate/source evidence; mark candidate approved; write audit; enqueue only non-essential derived work. It never runs automatically. Outfit creation/recommendation validates active eligibility at request time and records snapshots so history remains intelligible without reviving deleted assets.

## Soft deletion, purge, audit, retention
All user-visible destructive actions create `deletion_requests` (target type/id, scope, requested/confirmed/started/completed/failed timestamps, reason, retention deadline, provider purge confirmation) plus append-only `audit_events` (actor, action, target, before/after redacted diff, correlation ID). Soft deletion immediately hides the resource and removes recommendation eligibility; a worker revokes signed URLs, deletes derivatives/objects, handles dependencies, and marks `purged` only after verification. Account deletion cascades all tenant roots, sessions, OAuth linkage, jobs, asset objects and derived data, subject to disclosed backup/legal exceptions. Backups expire on documented schedule rather than being silently treated as immediate erasure.

## Indexes and constraints
Unique `(provider, provider_subject)` identities; unique user/content hash where dedupe is policy-safe; indexes on ownership/status/updated dates, job lease/status, batch state, outfit history date, and a tenant-filtered vector index for group embeddings. Check constraints enforce valid enums, `approved` before active instance, one media purpose parent, crop coordinates in range, group/instance tenant match, and no recommendation candidate item outside its request’s validated set. Partition/TTL expensive job/audit raw records as volume demands.
