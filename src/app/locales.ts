export const locales = ["he-IL", "en"] as const;
export type Locale = (typeof locales)[number];

export type Copy = {
  direction: "rtl" | "ltr";
  languageName: string;
  nav: { today: string; wardrobe: string; add: string; outfits: string; profile: string };
  greeting: string;
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: string;
  secondaryAction: string;
  reviewTitle: string;
  reviewBody: string;
  futureTitle: string;
  weatherTitle: string;
  weatherBody: string;
  statsTitle: string;
  statsBody: string;
  unavailable: string;
  placeholderTitle: string;
  placeholderBody: string;
  statusReady: string;
  statusAction: string;
  switchLanguage: string;
};

export const copy: Record<Locale, Copy> = {
  "he-IL": {
    direction: "rtl",
    languageName: "עברית",
    nav: { today: "היום", wardrobe: "הארון", add: "הוספה", outfits: "לוקים", profile: "פרופיל" },
    greeting: "בוקר טוב",
    eyebrow: "הארון שלך, בקצב שלך",
    title: "לא צריך לצלם את כל הארון היום.",
    body: "מתחילים מפריט אחד או מלוק אחד. עם הזמן נבנה כאן ארון שמכיר את מה שכבר יש לך.",
    primaryAction: "צלמו את הלוק של היום",
    secondaryAction: "הוסיפו פריט",
    reviewTitle: "אתם תמיד מחליטים",
    reviewBody: "שום פריט שזוהה לא ייכנס לארון בלי האישור שלכם.",
    futureTitle: "מה יחכה כאן בהמשך",
    weatherTitle: "לוקים לפי מזג האוויר",
    weatherBody: "כשתוסיפו כמה פריטים, נוכל לעזור להתלבש לפי היום שלכם.",
    statsTitle: "תמונת מצב לארון",
    statsBody: "תוכלו לראות צבעים, קטגוריות והרגלי לבישה — רק מה שבחרתם לשמור.",
    unavailable: "ייפתח אחרי שמוסיפים פריטים",
    placeholderTitle: "בקרוב כאן",
    placeholderBody: "המסך הזה מוכן לשלב הבא של בניית הארון שלכם.",
    statusReady: "הארון מוכן להתחלה",
    statusAction: "הפעולה הזו תחובר בשלב הבא. בינתיים, הארון מתחיל בקצב שלכם.",
    switchLanguage: "שפת תצוגה",
  },
  en: {
    direction: "ltr",
    languageName: "English",
    nav: { today: "Today", wardrobe: "Wardrobe", add: "Add", outfits: "Outfits", profile: "Profile" },
    greeting: "Good morning",
    eyebrow: "Your wardrobe, at your pace",
    title: "You do not need to photograph everything today.",
    body: "Start with one item or one look. Over time, this becomes a wardrobe built around what you already own.",
    primaryAction: "Photograph today’s look",
    secondaryAction: "Add an item",
    reviewTitle: "You stay in control",
    reviewBody: "No detected item is added to your wardrobe without your approval.",
    futureTitle: "What will become available",
    weatherTitle: "Weather-aware outfits",
    weatherBody: "Once you add a few items, we can help you dress for your day.",
    statsTitle: "Your wardrobe picture",
    statsBody: "See colors, categories, and wear habits—only from items you choose to keep.",
    unavailable: "Available after you add items",
    placeholderTitle: "Coming soon",
    placeholderBody: "This space is ready for the next stage of building your wardrobe.",
    statusReady: "Your wardrobe is ready to begin",
    statusAction: "This action will connect in the next step. For now, your wardrobe grows at your pace.",
    switchLanguage: "Display language",
  },
};

export function applyDocumentLocale(locale: Locale) {
  const translated = copy[locale];
  document.documentElement.lang = locale;
  document.documentElement.dir = translated.direction;
}
