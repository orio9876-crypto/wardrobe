/** Browser-only repository for the validation prototype. Replace this module with API calls later. */
export type WardrobeItem = { id: string; name: string; category: string; color: string; season: string; style: string; quantity: number; image?: string; createdAt: string; archived: boolean };
export type OnboardingAnswers = { presentation?: string; goals?: string[]; style?: string[]; start?: string; heightCm?: number; weightKg?: number; age?: number };
export type Onboarding = { step: number; complete: boolean; answers: OnboardingAnswers };
export type PrototypeData = { onboarding: Onboarding; items: WardrobeItem[]; favorites: string[] };

export const PROTOTYPE_STORAGE_KEY = "wardrobe-prototype-v1";
const initial = (): PrototypeData => ({ onboarding: { step: 0, complete: false, answers: {} }, items: [], favorites: [] });
const numberInRange = (value: unknown, min: number, max: number) => typeof value === "number" && Number.isFinite(value) && value >= min && value <= max ? value : undefined;

export function loadPrototypeData(): PrototypeData {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(PROTOTYPE_STORAGE_KEY) || "null");
    if (!parsed || typeof parsed !== "object") return initial();
    const stored = parsed as Partial<PrototypeData>;
    const oldAnswers = stored.onboarding?.answers && typeof stored.onboarding.answers === "object" ? stored.onboarding.answers as Record<string, unknown> : {};
    const items = Array.isArray(stored.items) ? stored.items.filter((item): item is WardrobeItem => !!item && typeof item === "object" && typeof (item as WardrobeItem).id === "string" && typeof (item as WardrobeItem).name === "string") : [];
    const favorites = Array.isArray(stored.favorites) ? stored.favorites.filter((id): id is string => typeof id === "string") : [];
    return { onboarding: { step: Math.max(0, Math.min(7, Number(stored.onboarding?.step) || 0)), complete: Boolean(stored.onboarding?.complete), answers: {
      presentation: typeof oldAnswers.presentation === "string" ? oldAnswers.presentation : undefined,
      goals: Array.isArray(oldAnswers.goals) ? oldAnswers.goals.filter((x): x is string => typeof x === "string") : undefined,
      style: Array.isArray(oldAnswers.style) ? oldAnswers.style.filter((x): x is string => typeof x === "string") : undefined,
      start: typeof oldAnswers.start === "string" ? oldAnswers.start : undefined,
      heightCm: numberInRange(oldAnswers.heightCm, 140, 220), weightKg: numberInRange(oldAnswers.weightKg, 25, 350), age: numberInRange(oldAnswers.age, 13, 120)
    } }, items, favorites };
  } catch { return initial(); }
}
export function savePrototypeData(data: PrototypeData) { localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(data)); }
export function resetPrototypeData() { localStorage.removeItem(PROTOTYPE_STORAGE_KEY); }
export function createItem(fields: Omit<WardrobeItem, "id" | "createdAt" | "archived">): WardrobeItem { return { ...fields, id: crypto.randomUUID(), createdAt: new Date().toISOString(), archived: false }; }
export function resolveDuplicate(items: WardrobeItem[], candidate: WardrobeItem, decision: "same" | "additional" | "different", matchId?: string) { if (decision === "same") return items; if (decision === "additional" && matchId) return items.map((item) => item.id === matchId ? { ...item, quantity: item.quantity + candidate.quantity } : item); return [...items, candidate]; }
