function renderWeeklyContent(lang) {
  const data = window.WEEKLY_CONTENT;
  if (!data) return;

  const safeLang = lang === "en" ? "en" : "ru";

  const weekLabel = document.getElementById("weekly-week-label");
  const parashaTitle = document.getElementById("weekly-parasha-title");
  const parashaHe = document.getElementById("weekly-parasha-he");
  const parashaReference = document.getElementById("weekly-parasha-reference");
  const parashaNote = document.getElementById("weekly-parasha-note");
  const holidayList = document.getElementById("weekly-holiday-list");

  if (weekLabel) {
    const dateText = data.weekLabel?.[safeLang] || "";
    const hebrewDate = data.weekLabel?.he || "";
    weekLabel.textContent = hebrewDate ? dateText + " • " + hebrewDate : dateText;
  }

  if (parashaTitle) {
    parashaTitle.textContent = data.parasha?.[safeLang] || "";
  }

  if (parashaHe) {
    parashaHe.textContent = data.parasha?.he || "";
  }

  if (parashaReference) {
    parashaReference.textContent = safeLang === "en"
      ? (data.parasha?.referenceEn || "")
      : (data.parasha?.referenceRu || "");
  }

  if (parashaNote) {
    parashaNote.textContent = safeLang === "en"
      ? (data.parasha?.noteEn || "")
      : (data.parasha?.noteRu || "");
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

      const hebrew = document.createElement("span");
      hebrew.className = "holiday-hebrew";
      hebrew.lang = "he";
      hebrew.dir = "rtl";
      hebrew.textContent = holiday.he || "";

      titleRow.append(title, hebrew);

      const date = document.createElement("span");
      date.className = "holiday-date";
      date.textContent = safeLang === "en"
        ? (holiday.dateEn || "")
        : (holiday.dateRu || "");

      main.append(titleRow, date);

      const badge = document.createElement("span");
      badge.className = "holiday-badge";
      badge.textContent = safeLang === "en"
        ? (holiday.badgeEn || "")
        : (holiday.badgeRu || "");

      item.append(main, badge);
      holidayList.append(item);
    });
  }
}

function setLanguage(lang) {
  const safeLang = lang === "en" ? "en" : "ru";
  document.body.classList.remove("lang-ru", "lang-en");
  document.body.classList.add("lang-" + safeLang);

  const ru = document.getElementById("btn-ru");
  const en = document.getElementById("btn-en");
  if (ru) ru.classList.toggle("active", safeLang === "ru");
  if (en) en.classList.toggle("active", safeLang === "en");

  document.documentElement.lang = safeLang;
  document.title = safeLang === "ru"
    ? "Источники Надежды — благотворительная помощь в Беэр-Шеве"
    : "Streams of Hope — Charity Support in Beersheba";

  localStorage.setItem("siteLang", safeLang);
  renderWeeklyContent(safeLang);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "ru";
  setLanguage(savedLang);

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
});
