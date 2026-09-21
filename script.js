const PAGE_TITLES = {
  "index.html": {
    "ru": "Источники Надежды — благотворительная помощь в Беэр-Шеве",
    "en": "Streams of Hope — Charity Support in Beersheba",
    "he": "מקורות התקווה — סיוע צדקה בבאר שבע"
  },
  "gallery.html": {
    "ru": "Галерея — Источники Надежды",
    "en": "Gallery — Streams of Hope",
    "he": "גלריה — מקורות התקווה"
  },
  "repatriants-gallery.html": {
    "ru": "Галерея репатриантов — Источники Надежды",
    "en": "Repatriants Gallery — Streams of Hope",
    "he": "גלריית העולים החדשים — מקורות התקווה"
  },
  "canteen-gallery.html": {
    "ru": "Галерея столовой — Источники Надежды",
    "en": "Canteen Gallery — Streams of Hope",
    "he": "גלריית בית התמחוי — מקורות התקווה"
  },
  "college-gallery.html": {
    "ru": "Галерея колледжа — Источники Надежды",
    "en": "College Gallery — Streams of Hope",
    "he": "גלריית המכללה — מקורות התקווה"
  },
  "holocaust-survivors-gallery.html": {
    "ru": "Пережившие Холокост — Галерея",
    "en": "Holocaust Survivors — Gallery",
    "he": "ניצולי השואה — גלריה"
  },
  "holidays-gallery.html": {
    "ru": "Праздники — Галерея",
    "en": "Holidays — Gallery",
    "he": "חגים — גלריה"
  },
  "friends-gallery.html": {
    "ru": "Галерея наших друзей — Источники Надежды",
    "en": "Our Friends Gallery — Streams of Hope",
    "he": "גלריית החברים שלנו — מקורות התקווה"
  },
  "documents.html": {
    "ru": "Документы и обращения — Источники Надежды",
    "en": "Documents & Appeals — Streams of Hope",
    "he": "מסמכים ופניות — מקורות התקווה"
  },
  "needs-of-war-03-2026.html": {
    "ru": "Нужды войны — Источники Надежды",
    "en": "Needs of War — Streams of Hope",
    "he": "צרכי המלחמה — מקורות התקווה"
  }
};

function renderWeeklyContent(lang) {
  const data = window.WEEKLY_CONTENT;
  if (!data) return;

  const safeLang = ["ru", "en", "he"].includes(lang) ? lang : "ru";

  const weekLabel = document.getElementById("weekly-week-label");
  const parashaTitle = document.getElementById("weekly-parasha-title");
  const parashaHe = document.getElementById("weekly-parasha-he");
  const parashaReference = document.getElementById("weekly-parasha-reference");
  const parashaNote = document.getElementById("weekly-parasha-note");
  const holidayList = document.getElementById("weekly-holiday-list");

  if (weekLabel) {
    const dateText = data.weekLabel?.[safeLang] || "";
    const hebrewDate = data.weekLabel?.heDate || "";
    weekLabel.textContent = hebrewDate ? dateText + " • " + hebrewDate : dateText;
  }

  if (parashaTitle) {
    parashaTitle.textContent = data.parasha?.[safeLang] || "";
  }

  if (parashaHe) {
    parashaHe.hidden = safeLang === "he";
    parashaHe.textContent = safeLang === "he" ? "" : (data.parasha?.he || "");
  }

  if (parashaReference) {
    const key = safeLang === "he" ? "referenceHe" : (safeLang === "en" ? "referenceEn" : "referenceRu");
    parashaReference.textContent = data.parasha?.[key] || "";
  }

  if (parashaNote) {
    const key = safeLang === "he" ? "noteHe" : (safeLang === "en" ? "noteEn" : "noteRu");
    parashaNote.textContent = data.parasha?.[key] || "";
  }

  if (holidayList) {
    holidayList.replaceChildren();

    (data.holidays || []).forEach((holiday) => {
      const item = document.createElement("div");
      item.className = "holiday-item";

      const main = document.createElement("div");
      main.className = "holiday-main";

      const titleRow = document.createElement("div");
      titleRow.className = "holiday-title-row";

      const title = document.createElement("strong");
      title.textContent = holiday[safeLang] || "";
      titleRow.append(title);

      if (safeLang !== "he") {
        const hebrew = document.createElement("span");
        hebrew.className = "holiday-hebrew";
        hebrew.lang = "he";
        hebrew.dir = "rtl";
        hebrew.textContent = holiday.he || "";
        titleRow.append(hebrew);
      }

      const date = document.createElement("span");
      date.className = "holiday-date";
      const dateKey = safeLang === "he" ? "dateHe" : (safeLang === "en" ? "dateEn" : "dateRu");
      date.textContent = holiday[dateKey] || "";

      main.append(titleRow, date);

      const badge = document.createElement("span");
      badge.className = "holiday-badge";
      const badgeKey = safeLang === "he" ? "badgeHe" : (safeLang === "en" ? "badgeEn" : "badgeRu");
      badge.textContent = holiday[badgeKey] || "";

      item.append(main, badge);
      holidayList.append(item);
    });
  }
}

function setLanguage(lang) {
  const safeLang = ["ru", "en", "he"].includes(lang) ? lang : "ru";

  document.body.classList.remove("lang-ru", "lang-en", "lang-he");
  document.body.classList.add("lang-" + safeLang);

  ["ru", "en", "he"].forEach((code) => {
    const button = document.getElementById("btn-" + code);
    if (button) button.classList.toggle("active", safeLang === code);
  });

  document.documentElement.lang = safeLang;
  document.documentElement.dir = safeLang === "he" ? "rtl" : "ltr";

  const page = window.location.pathname.split("/").pop() || "index.html";
  const titles = PAGE_TITLES[page] || PAGE_TITLES["index.html"];
  document.title = titles?.[safeLang] || titles?.ru || document.title;

  localStorage.setItem("siteLang", safeLang);
  renderWeeklyContent(safeLang);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "ru";
  setLanguage(savedLang);

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
});
