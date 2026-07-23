import { useEffect, useState } from "react";
import { CalendarBlank, CoatHanger, Plus, Sparkle, UserCircle } from "@phosphor-icons/react";
import { applyDocumentLocale, copy, type Locale } from "./locales";
import { Card, EmptyState, PageHeader, PrimaryButton, SecondaryButton, StatusIndicator } from "./ui";

type Destination = "today" | "wardrobe" | "add" | "outfits" | "profile";
const destinations: Destination[] = ["today", "wardrobe", "add", "outfits", "profile"];
const navIcons = { today: CalendarBlank, wardrobe: CoatHanger, add: Plus, outfits: Sparkle, profile: UserCircle };

function LanguageSwitcher({ locale, setLocale }: { locale: Locale; setLocale: (locale: Locale) => void }) {
  const text = copy[locale];
  return <label className="language-switcher"><span>{text.switchLanguage}</span><select value={locale} onChange={(event) => setLocale(event.target.value as Locale)} aria-label={text.switchLanguage}><option value="he-IL">עברית</option><option value="en">English</option></select></label>;
}

function BottomNavigation({ active, locale, onSelect }: { active: Destination; locale: Locale; onSelect: (destination: Destination) => void }) {
  const text = copy[locale];
  return <nav className="bottom-nav" aria-label={locale === "he-IL" ? "ניווט ראשי" : "Primary navigation"}>{destinations.map((destination) => {
    const Icon = navIcons[destination];
    const label = text.nav[destination];
    return <button key={destination} className={`bottom-nav__item ${active === destination ? "is-active" : ""} ${destination === "add" ? "bottom-nav__item--add" : ""}`} type="button" aria-current={active === destination ? "page" : undefined} onClick={() => onSelect(destination)}><Icon aria-hidden="true" weight={destination === "add" ? "bold" : "regular"} /><span>{label}</span></button>;
  })}</nav>;
}

function TodayPage({ locale, onAction }: { locale: Locale; onAction: () => void }) {
  const text = copy[locale];
  return <main className="page today-page"><PageHeader eyebrow={text.eyebrow} title={text.greeting} /><StatusIndicator>{text.statusReady}</StatusIndicator><Card className="today-hero"><EmptyState title={text.title} body={text.body}><PrimaryButton onClick={onAction}>{text.primaryAction}</PrimaryButton><SecondaryButton onClick={onAction}>{text.secondaryAction}</SecondaryButton></EmptyState></Card><Card className="review-card"><div className="review-card__mark" aria-hidden="true">✓</div><div><h2>{text.reviewTitle}</h2><p>{text.reviewBody}</p></div></Card><section className="future-value" aria-labelledby="future-value-title"><p className="eyebrow" id="future-value-title">{text.futureTitle}</p><div className="future-value__grid"><Card><span className="future-value__icon" aria-hidden="true">☼</span><h2>{text.weatherTitle}</h2><p>{text.weatherBody}</p><span className="unavailable">{text.unavailable}</span></Card><Card><span className="future-value__icon" aria-hidden="true">◌</span><h2>{text.statsTitle}</h2><p>{text.statsBody}</p><span className="unavailable">{text.unavailable}</span></Card></div></section></main>;
}

function PlaceholderPage({ destination, locale }: { destination: Exclude<Destination, "today">; locale: Locale }) {
  const text = copy[locale];
  return <main className="page placeholder-page"><PageHeader eyebrow={text.nav[destination]} title={text.placeholderTitle} /><Card><EmptyState title={text.nav[destination]} body={text.placeholderBody} /></Card></main>;
}

export function AppShell() {
  const [locale, setLocale] = useState<Locale>("he-IL");
  const [active, setActive] = useState<Destination>("today");
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => applyDocumentLocale(locale), [locale]);
  const text = copy[locale];
  const selectLocale = (next: Locale) => setLocale(next);
  const content = active === "today" ? <TodayPage locale={locale} onAction={() => setNotice(text.statusAction)} /> : <PlaceholderPage destination={active} locale={locale} />;
  return <div className="app-shell"><div className="app-shell__top"><LanguageSwitcher locale={locale} setLocale={selectLocale} /></div>{content}{notice && <div className="toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label={locale === "he-IL" ? "סגירה" : "Dismiss"}>×</button></div>}<BottomNavigation active={active} locale={locale} onSelect={(destination) => { setActive(destination); setNotice(null); }} /></div>;
}
