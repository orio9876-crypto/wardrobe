# Product specification — V1

## Status, evidence, and decisions
**Confirmed repository facts.** The current product is a local React/Vite gallery with a staged, human-approved import flow; it has no accounts, routes, outfit UI, cloud persistence, or server deployment. `PROJECT_ANALYSIS.md` is the repository baseline for this specification. Existing screenshots and the supplied competitor references are research inputs only, not design assets to reuse.

**Recommendation (V1).** Build a new, Hebrew-first, mobile web product around a *small but trusted approved wardrobe*. A user can obtain value with a few items, add incrementally, and is never asked to scan everything. Every inferred item stays a candidate until explicit approval. The working product name and visual identity are deliberately out of scope; do not retain “Open Wardrobe” branding.

**Assumptions/open questions.** Private beta is invite-only, Israel-first, and supports Hebrew (`he-IL`) and English (`en`) on modern mobile browsers. Confirm provider availability, Apple web OAuth requirements, weather-provider terms, Hebrew font licensing, and Israeli privacy counsel before launch.

## Vision, users, and positioning
**Vision.** A calm personal wardrobe that grows from normal life—today’s outfit, selected photos, a photo of several garments, and manual additions—then turns approved clothes into practical decisions.

**Principles.** Progressive capture; user control before AI action; private by default; useful with a sparse wardrobe; explainable recommendations; Hebrew is designed first, not translated last; accessible premium restraint; deterministic rules before generative judgment; no unsupported claims about wardrobe gaps.

**Primary users.** Israeli adults who want quicker daily decisions, event/travel planning, and a clearer view of existing clothes without an exhausting initial catalog. Secondary users are students, office workers, and people rebuilding a wardrobe. Presentation options (menswear, womenswear, unisex, all) describe requested outfit presentation, not identity.

**Positioning.** “הארון שלך, בקצב שלך” (“your wardrobe, at your pace”): weather-aware, privacy-conscious styling for Israeli routines—office, campus, Friday dinner, family event, wedding, restaurant, beach, travel, hot days, transitional weather, and cold air-conditioned interiors. Use °C, cm/kg, Israel date/time formats and `Asia/Jerusalem`; explain weather uncertainty and let people select a place/date.

## Information architecture and design system
Bottom navigation: **היום** (Today), **הארון שלי** (Wardrobe), central **+ הוספה**, **לוקים** (Outfits), **את/ה** (Profile). Secondary screens use a contextual back control, never rely on swipe alone. Desktop is a responsive expansion of these tasks, not a separate product.

Original design direction: near-black text, warm light-gray canvas, white cards, generous 16–24px spacing, large editorial heading, one restrained accent only for status/selection, and a bottom safe-area primary button. Cards have clear focus/selected states; animation is short, reduced-motion safe, and never the sole status cue. Use logical CSS properties and `dir` at the document root so icons, order, back chevrons, truncation, and dialogs mirror correctly. Review Hebrew in rendered RTL screens at 320px, 375px, and 430px; English is an LTR layout test, not simply reversed strings.

## Core journeys and screen specification

### 1. Entry and onboarding
1. **Welcome/authentication:** Google and Apple buttons, privacy link, language selector. Successful auth creates a resumable profile and moves to the next incomplete step.
2. **Presentation preference:** multi-select Menswear / Womenswear / Unisex / All; skip permitted.
3. **Optional basics:** height (cm), weight (kg), age range, or “מעדיפ/ה לא לענות”. Explain that they are only for sizing and an optional future visualization, never required for matching.
4. **Goals:** multi-select.
5. **Style:** multi-select cards and “No fixed style.” Examples must be original/licensed; V1 may be text-only until examples are cleared.
6. **Optional preferences:** colors, silhouettes, shoes, modesty, temperature sensitivity, formality, and never-wear styles; all skippable.
7. **Value/privacy:** concise benefits and deletion control.
8. **Start wardrobe:** Today’s outfit, choose device photos, photograph several garments, add manually, or empty wardrobe.
9. **Optional body reference:** one full-body photo at most; clear separate consent and Skip.

Persist after each response. Back does not discard saved answers. “Finish later” opens Today with a gentle completion card, never blocks an empty wardrobe.

**Hebrew microcopy (examples).**

| Screen | Copy | Primary / secondary |
|---|---|---|
| Auth | **הארון שלך, בקצב שלך.** מתחילים עם מה שכבר נוח לך לשתף. | `המשך עם Google`, `המשך עם Apple` |
| Presentation | **איזה סוגי לוקים תרצי/ה לראות?** זו רק העדפת הצגה, לא הגדרה שלך. | `המשך`, `אפשר אחר כך` |
| Basics | **כמה פרטים קטנים, רק אם מתאים לך.** גובה ומשקל יכולים לעזור במידות ובהדמיה עתידית. | `שמירה והמשך`, `דלג/י` |
| Goals | **מה הכי יעזור לך עכשיו?** אפשר לבחור יותר מאחד. | `המשך` |
| Style | **איזה סגנון מרגיש לך נכון?** תמיד אפשר לשנות. | `המשך`, `אין לי סגנון קבוע` |
| Preferences | **נלמד גם תוך כדי.** אפשר לבחור רק מה שחשוב לך היום. | `המשך`, `דלג/י לעת עתה` |
| Value | **נבנה רק מה שבאמת שלך.** שום פריט לא נכנס לארון בלי אישור שלך. | `הבנתי, ממשיכים` |
| Start | **לא צריך לצלם את כל הארון היום.** נוסיף פריטים בהדרגה, לפי הקצב שלך. | `צלמי את הלוק של היום`, `התחלה עם ארון ריק` |
| Body reference | **רוצה לשמור תמונת גוף להדמיות עתידיות?** זה לא נדרש להמלצות. אפשר למחוק בכל רגע. | `הוספת תמונה`, `לא עכשיו` |

### 2. Today and daily-outfit flow
Today shows selected/current weather, a “מה ללבוש היום?” action, a recent-look shortcut, review count, and sparse-wardrobe guidance. Capture uses camera or file picker; label the image “daily outfit,” show intent and processing consent, upload one image, then create one candidate per detected garment. User can record the outfit even if they reject every candidate. After review, approved items become eligible; the daily image remains a separate history record. A completed look may be marked worn with date/context.

### 3. Multi-item photo and device-library import
**Multi-item photo:** choose/capture → confirm photo contains separate items → crop/detection progress → candidates → individual review/duplicate decision → batch summary. V1 supports up to a documented beta cap per photo/batch; no automatic admission.

**Device photos:** invoke the browser’s explicit file picker (`accept=image/*`, `multiple`); users select specific files. Do not claim whole-library access, iPhone photo-library access, face indexing, or background scanning. Create a named import batch, show selected thumbnails and remove/reorder controls, optionally ask “האם זו תמונה שלך?” for a likely wearer, then process one batch at a time. Stop pauses/cancels pending work; resume uses persisted batch state; photo and individual-candidate rejection are independent. “Delete this batch” offers source-only deletion or deletion of all items that were first created by it, with impact preview. Google Photos is later only after provider/API/consent validation.

### 4. Detection review and duplicate resolution
Candidate screen shows original context, editable crop, extracted cutout if available, confidence per field, category/color/style metadata, and source. Required actions: Approve, Reject, Delete candidate, “זה לא נכון”, and Re-analyze/regenerate (quota limited). Low-confidence category/crop/color is visibly flagged and cannot bypass review.

Before approval, run duplicate retrieval. Show 1–3 closest **approved** groups with similarity reasons (category, color, pattern/detail, source history) and this question: **“האם זה אותו פריט, עוד עותק זהה, או פריט שונה?”** Choices:
* **זה אותו פריט** — link this sighting to an existing physical instance; no new count.
* **יש לי עוד פריט זהה** — add physical instance to that visual group; quantity rises.
* **זה פריט דומה אבל שונה** — create a new group/instance.
* **לא בטוח/ה** — retain as review-needed, never silently merge.

The item detail permits correcting any past relation. Similarity is assistance, not identity proof.

### 5. Wardrobe, item, and statistics
Wardrobe offers searchable/filterable cards (category, color, season, style, formal level, availability) and filters for active, archive, review, and unavailable. Count labels distinguish **visual products** from **physical items**. Item detail includes main image, source/timeline, group quantity, editable structured metadata, confidence/user-confirmed markers, availability/laundry/condition, wear count, archive/restore/delete, and “report detection error.” Delete confirms effect on outfits/history; archive excludes recommendations but preserves history.

Stats displays approved active items, physical count, categories/subcategories/colors/seasons/styles/formality, identical quantities, most/least/recently worn, not-recently-worn, recently added, and availability statuses. Gap cards are explicitly exploratory: “ייתכן שכדאי לבדוק…” with the evidence and dismiss/feedback—not a purchase instruction. V1 shows descriptive distribution and simple rule-based observations; shopping links and authoritative style verdicts are later.

### 6. Outfit creation and recommendations
**Create:** choose approved active items → required/excluded controls → add occasion/style/formality/date/location weather → save/favorite.

**Ask:** Today / future date, occasion, desired style, formality, weather current or selected, required and excluded items. System generates deterministic valid candidates only from approved, active, available, undamaged, non-dirty (when enabled), preference-compatible items. It displays 3–5 ranked outfits, reasons, weather/context caveat, alternatives per slot, and a “why not?” explanation. User can replace an item, edit/save/favorite, record worn, or feedback (like/dislike; too formal/casual; not my style; color/fit issue; recently worn; works well). Never invent items. Sparse state proposes a manual outfit or a limited outfit with an honest “missing category” explanation.

### 7. Settings, privacy, and deletion
Settings: language/RTL preview, measurement/date settings, weather location consent, presentation/preference controls, AI/image consent, notification preference (later), data exports (later), source/batch management, body-reference management, account deletion. Explain four asset classes: wardrobe source; daily outfits; body reference; generated visualizations. Each has purpose, whether original/derived crop is kept, linked records, and delete action. Account deletion requires reauthentication and a clear completion state; it schedules irreversible purge and signs out.

## States, validation, and accessibility
**Empty:** “הארון עדיין קטן — וזה לגמרי בסדר. אפשר להתחיל מפריט אחד.” Offer four add paths and “Ask for today” only if enough compatible items exist. **Loading:** skeletons retain layout; AI jobs show queued/processing/review not fake percentage. **Progress:** batch N/M, cancel, resume, and completed/needs-review/failed counts. **Permissions:** explain camera/location/file selection before browser prompt; denial gives manual/select alternatives. **Offline:** cached read-only shell and last synced data labelled with timestamp; disable upload, AI, and write actions with retry on reconnect. Do not cache private images into a shared public cache.

Errors distinguish validation, network, provider/temporary failure, quota, and unrecoverable image errors. Retry is idempotent and bounded; user corrections are retained. Validate file type by signature server-side, dimensions/pixels, decoded image safety, upload size/count, crop bounds, text lengths, enum values, duplicate decision target ownership, and all authorization. Skips save `null`/unanswered—not guessed data.

Meet WCAG 2.2 AA: semantic controls, 44×44px targets, visible focus, contrast, labels/errors tied to fields, screen-reader live status, keyboard/reduced-motion support, no color-only status, focus-managed modal/drawer, logical reading order in both directions, localized dates and numerals, and manual crop controls that work without precision dragging.

## Acceptance criteria and scope
**MVP acceptance criteria.** A Hebrew RTL and English LTR user can authenticate; only view their data; add a manual item; upload one daily or multi-item photo; review/edit/reject/retry each candidate; resolve a possible duplicate in all three ways; archive/restore/delete; use only eligible approved items to make/save/wear/favorite a basic weather/context outfit; see core counts; pause/resume/delete a selected-photo batch; manage consent and request account deletion. Every AI candidate records confidence/source and needs approval. Private URLs and server authorization protect images.

**Features explicitly postponed / V1 versus future.** V1 deliberately excludes: full video wardrobe scan, unrestricted/full photo-library scanning, Google Photos integration, autonomous background jobs on devices, native wrappers, email sign-in UI (architecture only), custom-trained fashion models, social sharing, purchase marketplace/affiliate links, and optional body-based visualization/virtual try-on (data/consent plumbing only; visualization is beta/later).
