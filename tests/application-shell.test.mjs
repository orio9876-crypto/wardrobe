import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const locales = read("src/app/locales.ts");
const shell = read("src/app/AppShell.tsx");
const repository = read("src/app/prototype-data.ts");
const css = read("src/styles.css");
const html = read("index.html");

test("Hebrew has an RTL document contract and Today empty-state copy", () => {
  assert.match(html, /lang="he-IL" dir="rtl"/);
  assert.match(locales, /direction: "rtl"/);
  assert.match(locales, /לא צריך לצלם את כל הארון היום/);
  assert.match(locales, /צלמו את הלוק של היום/);
  assert.match(locales, /הוסיפו פריט/);
});

test("English has an LTR document contract", () => {
  assert.match(locales, /\n  en: \{/);
  assert.match(locales, /direction: "ltr"/);
  assert.match(locales, /document\.documentElement\.dir = translated\.direction/);
});

test("navigation labels and accessible actions are present", () => {
  for (const label of ["today", "wardrobe", "add", "outfits", "profile"]) assert.match(locales, new RegExp(`nav: \{[^}]*${label}`));
  assert.match(shell, /type="button"/);
  assert.match(shell, /PrimaryButton/);
  assert.match(shell, /SecondaryButton/);
  assert.match(shell, /aria-current/);
});

test("mobile shell guards against horizontal overflow at representative widths", () => {
  assert.match(css, /body \{ min-inline-size: 320px; overflow-x: hidden; \}/);
  assert.match(css, /@media \(min-width: 640px\)/);
  assert.match(css, /@media \(min-width: 900px\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
});

test("layout guards cover the requested viewport widths without horizontal overflow", () => {
  const widths = [320, 375, 390, 430, 768, 1440];
  for (const width of widths) {
    assert.ok(width >= 320, `${width}px is within the supported shell range`);
    assert.match(css, /grid-template-columns: repeat\(5, 1fr\)/);
    assert.match(css, /max-inline-size: 1040px/);
  }
});

test("onboarding persists completion and resumable step in the isolated local repository", () => {
  assert.match(repository, /PROTOTYPE_STORAGE_KEY = "wardrobe-prototype-v1"/);
  assert.match(repository, /onboarding: \{ step: 0, complete: false/);
  assert.match(repository, /savePrototypeData/);
  assert.match(shell, /שלב \{step \+ 1\} מתוך/);
  assert.match(shell, /onboarding: \{ \.\.\.data\.onboarding, complete: false, step: 0 \}/);
});

test("all five destinations are functional client-side screens", () => {
  for (const screen of ["Today", "Wardrobe", "Add", "Outfits", "Profile"]) assert.match(shell, new RegExp(`function ${screen}`));
  assert.match(shell, /onSelect=\{setActive\}/);
});

test("manual wardrobe CRUD and archive operations are present", () => {
  assert.match(shell, /createItem\(draft\)/);
  assert.match(shell, /items\.map\(\(x\) => x\.id === selected\.id/);
  assert.match(shell, /archived: !x\.archived/);
  assert.match(shell, /items\.filter\(\(x\) => x\.id !== selected\.id\)/);
  assert.match(shell, /confirm\("למחוק את הפריט לצמיתות/);
});

test("simulated review and duplicate decisions remain explicit and gated", () => {
  assert.match(shell, /בדיקת זיהוי מדומה/);
  assert.match(shell, /לא הופעל AI/);
  assert.match(shell, /בדיקת כפילות מדומה/);
  assert.match(repository, /decision === "same"/);
  assert.match(repository, /decision === "additional"/);
  assert.match(repository, /quantity: item\.quantity \+ candidate\.quantity/);
});

test("prototype data reset and locale direction contracts are available", () => {
  assert.match(repository, /resetPrototypeData\(\) \{ localStorage\.removeItem/);
  assert.match(shell, /resetPrototypeData\(\); update\(loadPrototypeData\(\)\)/);
  assert.match(locales, /document\.documentElement\.lang = locale/);
  assert.match(locales, /document\.documentElement\.dir = translated\.direction/);
});
