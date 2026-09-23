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

function getLocalizedKey(lang, ru, en, he) {
  if (lang === "he") return he;
  if (lang === "en") return en;
  return ru;
}

function renderHolidayReadings(details, holiday, lang) {
  const readings = Array.isArray(holiday.readings) ? holiday.readings : [];
  const nextContent = document.createDocumentFragment();

  if (!readings.length) {
    const empty = document.createElement("div");
    empty.className = "holiday-reading-empty";
    empty.textContent = lang === "he"
      ? "ליום זה לא נמצאו פרטי קריאה."
      : (lang === "en"
        ? "No reading details were found for these dates."
        : "Для этих дат подробности чтений не найдены.");
    nextContent.append(empty);
    details.replaceChildren(nextContent);
    return;
  }

  readings.forEach((reading) => {
    const row = document.createElement("div");
    row.className = "holiday-reading-row";

    const heading = document.createElement("strong");
    const dateKey = getLocalizedKey(lang, "dateRu", "dateEn", "dateHe");
    const hdateKey = getLocalizedKey(lang, "hdateRu", "hdateEn", "hdateHe");
    heading.textContent = "☀ " + (reading[dateKey] || "") + " • 🌙 " + (reading[hdateKey] || "");

    const torah = document.createElement("span");
    const torahKey = getLocalizedKey(lang, "torahRu", "torahEn", "torahHe");
    const torahLabel = lang === "he" ? "תורה" : (lang === "en" ? "Torah" : "Тора");
    torah.textContent = torahLabel + ": " + (reading[torahKey] || "—");

    const haft = document.createElement("span");
    const haftKey = getLocalizedKey(lang, "haftarahRu", "haftarahEn", "haftarahHe");
    const haftLabel = lang === "he" ? "הפטרה" : (lang === "en" ? "Haftarah" : "Афтара");
    haft.textContent = haftLabel + ": " + (reading[haftKey] || "—");

    row.append(heading, torah, haft);
    nextContent.append(row);
  });

  // Replace only after the complete reading list is built.
  details.replaceChildren(nextContent);
}

function renderWeeklyContent(lang) {
  const data = window.WEEKLY_CONTENT;
  if (!data) return;

  const safeLang = ["ru", "en", "he"].includes(lang) ? lang : "ru";

  const weekLabel = document.getElementById("weekly-week-label");
  const parashaTitle = document.getElementById("weekly-parasha-title");
  const parashaHe = document.getElementById("weekly-parasha-he");
  const parashaDate = document.getElementById("weekly-parasha-date");
  const parashaReference = document.getElementById("weekly-parasha-reference");
  const haftarahReference = document.getElementById("weekly-haftarah-reference");
  const parashaNote = document.getElementById("weekly-parasha-note");
  const holidayList = document.getElementById("weekly-holiday-list");

  const todayDateKey = getLocalizedKey(safeLang, "dateRu", "dateEn", "dateHe");
  const todayHDateKey = getLocalizedKey(safeLang, "hdateRu", "hdateEn", "hdateHe");

  if (weekLabel) {
    const solar = data.today && data.today[todayDateKey] ? data.today[todayDateKey] : "";
    const lunar = data.today && data.today[todayHDateKey] ? data.today[todayHDateKey] : "";
    weekLabel.textContent = "☀ " + solar + " • 🌙 " + lunar;
  }

  if (parashaTitle) {
    parashaTitle.textContent = data.parasha && data.parasha[safeLang] ? data.parasha[safeLang] : "";
  }

  if (parashaHe) {
    parashaHe.hidden = safeLang === "he";
    parashaHe.textContent = safeLang === "he" ? "" : ((data.parasha && data.parasha.he) || "");
  }

  const readingDateKey = getLocalizedKey(safeLang, "dateRu", "dateEn", "dateHe");
  const readingHDateKey = getLocalizedKey(safeLang, "hdateRu", "hdateEn", "hdateHe");
  const torahKey = getLocalizedKey(safeLang, "torahRu", "torahEn", "torahHe");
  const haftarahKey = getLocalizedKey(safeLang, "haftarahRu", "haftarahEn", "haftarahHe");

  if (parashaDate) {
    const solar = data.parasha && data.parasha[readingDateKey] ? data.parasha[readingDateKey] : "";
    const lunar = data.parasha && data.parasha[readingHDateKey] ? data.parasha[readingHDateKey] : "";
    parashaDate.textContent = "☀ " + solar + " • 🌙 " + lunar;
  }

  if (parashaReference) {
    const label = safeLang === "he" ? "תורה" : (safeLang === "en" ? "Torah" : "Тора");
    parashaReference.textContent = label + ": " + ((data.parasha && data.parasha[torahKey]) || "—");
  }

  if (haftarahReference) {
    const label = safeLang === "he" ? "הפטרה" : (safeLang === "en" ? "Haftarah" : "Афтара");
    haftarahReference.textContent = label + ": " + ((data.parasha && data.parasha[haftarahKey]) || "—");
  }

  if (parashaNote) {
    const noteKey = getLocalizedKey(safeLang, "noteRu", "noteEn", "noteHe");
    parashaNote.textContent = (data.parasha && data.parasha[noteKey]) || "";
  }

  if (holidayList) {
    const nextHolidayList = document.createDocumentFragment();

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
      const dateKey = getLocalizedKey(safeLang, "dateRu", "dateEn", "dateHe");
      const hdateKey = getLocalizedKey(safeLang, "hdateRu", "hdateEn", "hdateHe");
      date.textContent = "☀ " + (holiday[dateKey] || "") + " • 🌙 " + (holiday[hdateKey] || "");

      main.append(titleRow, date);

      const actions = document.createElement("div");
      actions.className = "holiday-item-actions";

      const badge = document.createElement("span");
      badge.className = "holiday-badge";
      const badgeKey = getLocalizedKey(safeLang, "badgeRu", "badgeEn", "badgeHe");
      badge.textContent = holiday[badgeKey] || "";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "holiday-readings-btn";
      button.setAttribute("aria-expanded", "false");

      const bookIcon = document.createElement("i");
      bookIcon.className = "fas fa-book-open";
      bookIcon.setAttribute("aria-hidden", "true");

      const buttonText = document.createElement("span");
      buttonText.textContent = safeLang === "he" ? "קריאות" : (safeLang === "en" ? "Readings" : "Чтения");

      const arrowIcon = document.createElement("i");
      arrowIcon.className = "fas fa-chevron-down holiday-readings-chevron";
      arrowIcon.setAttribute("aria-hidden", "true");

      button.append(bookIcon, buttonText, arrowIcon);
      actions.append(badge, button);

      const details = document.createElement("div");
      details.className = "holiday-reading-details";
      details.hidden = true;
      renderHolidayReadings(details, holiday, safeLang);

      button.addEventListener("click", () => {
        const opening = details.hidden;
        details.hidden = !opening;
        button.setAttribute("aria-expanded", opening ? "true" : "false");
      });

      item.append(main, actions, details);
      nextHolidayList.append(item);
    });

    // Atomic swap: if rendering throws, the already visible static calendar remains.
    holidayList.replaceChildren(nextHolidayList);
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
  document.title = (titles && titles[safeLang]) || (titles && titles.ru) || document.title;

  localStorage.setItem("siteLang", safeLang);
  renderWeeklyContent(safeLang);
}

window.addEventListener("weeklyContentUpdated", () => {
  const lang = localStorage.getItem("siteLang") || "ru";
  renderWeeklyContent(lang);
});

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "ru";
  setLanguage(savedLang);

  if (typeof window.loadWeeklyCalendarData === "function") {
    window.loadWeeklyCalendarData().catch(() => {});
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
});