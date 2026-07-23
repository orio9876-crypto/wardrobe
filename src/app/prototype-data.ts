/** Browser-only repository for the validation prototype. Replace this module with API calls later. */
export type WardrobeItem = { id: string; name: string; category: string; color: string; season: string; style: string; quantity: number; image?: string; createdAt: string; archived: boolean };
export type Onboarding = { step: number; complete: boolean; answers: Record<string, string | string[]> };
export type PrototypeData = { onboarding: Onboarding; items: WardrobeItem[]; favorites: string[] };

export const PROTOTYPE_STORAGE_KEY = "wardrobe-prototype-v1";
const initial = (): PrototypeData => ({ onboarding: { step: 0, complete: false, answers: {} }, items: [], favorites: [] });

export function loadPrototypeData(): PrototypeData {
  try { const stored = localStorage.getItem(PROTOTYPE_STORAGE_KEY); return stored ? { ...initial(), ...JSON.parse(stored) } : initial(); } catch { return initial(); }
}
export function savePrototypeData(data: PrototypeData) { localStorage.setItem(PROTOTYPE_STORAGE_KEY, JSON.stringify(data)); }
export function resetPrototypeData() { localStorage.removeItem(PROTOTYPE_STORAGE_KEY); }
export function createItem(fields: Omit<WardrobeItem, "id" | "createdAt" | "archived">): WardrobeItem {
  return { ...fields, id: crypto.randomUUID(), createdAt: new Date().toISOString(), archived: false };
}
export function resolveDuplicate(items: WardrobeItem[], candidate: WardrobeItem, decision: "same" | "additional" | "different", matchId?: string) {
  if (decision === "same") return items;
  if (decision === "additional" && matchId) return items.map((item) => item.id === matchId ? { ...item, quantity: item.quantity + candidate.quantity } : item);
  return [...items, candidate];
}
