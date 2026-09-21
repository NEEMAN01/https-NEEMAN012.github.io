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
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("siteLang") || "ru";
  setLanguage(savedLang);

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
});
