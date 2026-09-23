// Automatic Torah, Haftarah, Hebrew/Gregorian dates and Israel holidays.
// Data source: Hebcal.com web APIs (CC BY 4.0).
// Israel schedule is used. Hebrew "today" changes after sunset in Be'er Sheva.
(function () {
  "use strict";

  var CONFIG = {
    geonameId: 295530,
    timeZone: "Asia/Jerusalem",
    cacheKey: "streamsHopeHebcalAutoV4"
  };

  var MONTHS = {
    "Nisan":   { ru: "Нисана", en: "Nisan", he: "ניסן" },
    "Iyyar":   { ru: "Ияра", en: "Iyyar", he: "אייר" },
    "Sivan":   { ru: "Сивана", en: "Sivan", he: "סיון" },
    "Tamuz":   { ru: "Тамуза", en: "Tamuz", he: "תמוז" },
    "Av":      { ru: "Ава", en: "Av", he: "אב" },
    "Elul":    { ru: "Элула", en: "Elul", he: "אלול" },
    "Tishrei": { ru: "Тишрея", en: "Tishrei", he: "תשרי" },
    "Cheshvan":{ ru: "Хешвана", en: "Cheshvan", he: "חשון" },
    "Kislev":  { ru: "Кислева", en: "Kislev", he: "כסלו" },
    "Tevet":   { ru: "Тевета", en: "Tevet", he: "טבת" },
    "Sh'vat":  { ru: "Швата", en: "Sh'vat", he: "שבט" },
    "Shvat":   { ru: "Швата", en: "Sh'vat", he: "שבט" },
    "Adar":    { ru: "Адара", en: "Adar", he: "אדר" },
    "Adar I":  { ru: "Адара I", en: "Adar I", he: "אדר א׳" },
    "Adar II": { ru: "Адара II", en: "Adar II", he: "אדר ב׳" }
  };

  var BOOKS = {
    "Genesis":     { ru: "Берешит", he: "בראשית" },
    "Exodus":      { ru: "Шмот", he: "שמות" },
    "Leviticus":   { ru: "Ваикра", he: "ויקרא" },
    "Numbers":     { ru: "Бемидбар", he: "במדבר" },
    "Deuteronomy": { ru: "Дварим", he: "דברים" },
    "Joshua":      { ru: "Иегошуа", he: "יהושע" },
    "Judges":      { ru: "Шофтим", he: "שופטים" },
    "I Samuel":    { ru: "Шмуэль I", he: "שמואל א׳" },
    "II Samuel":   { ru: "Шмуэль II", he: "שמואל ב׳" },
    "I Kings":     { ru: "Мелахим I", he: "מלכים א׳" },
    "II Kings":    { ru: "Мелахим II", he: "מלכים ב׳" },
    "Isaiah":      { ru: "Ишаягу", he: "ישעיהו" },
    "Jeremiah":    { ru: "Иеремия", he: "ירמיהו" },
    "Ezekiel":     { ru: "Иезекииль", he: "יחזקאל" },
    "Hosea":       { ru: "Осия", he: "הושע" },
    "Joel":        { ru: "Иоиль", he: "יואל" },
    "Amos":        { ru: "Амос", he: "עמוס" },
    "Obadiah":     { ru: "Овадия", he: "עובדיה" },
    "Jonah":       { ru: "Иона", he: "יונה" },
    "Micah":       { ru: "Михей", he: "מיכה" },
    "Nahum":       { ru: "Наум", he: "נחום" },
    "Habakkuk":    { ru: "Аввакум", he: "חבקוק" },
    "Zephaniah":   { ru: "Софония", he: "צפניה" },
    "Haggai":      { ru: "Аггей", he: "חגי" },
    "Zechariah":   { ru: "Захария", he: "זכריה" },
    "Malachi":     { ru: "Малахия", he: "מלאכי" },
    "Ecclesiastes":{ ru: "Коэлет", he: "קהלת" }
  };

  var HOLIDAYS = {
    "rosh-hashana": { ru: "Рош ха-Шана", en: "Rosh Hashana", he: "ראש השנה" },
    "yom-kippur": { ru: "Йом-Кипур", en: "Yom Kippur", he: "יום כיפור" },
    "sukkot": { ru: "Суккот", en: "Sukkot", he: "סוכות" },
    "shmini-simchat": { ru: "Шмини Ацерет и Симхат Тора", en: "Shmini Atzeret & Simchat Torah", he: "שמיני עצרת ושמחת תורה" },
    "chanukah": { ru: "Ханука", en: "Chanukah", he: "חנוכה" },
    "purim": { ru: "Пурим", en: "Purim", he: "פורים" },
    "pesach": { ru: "Песах", en: "Pesach", he: "פסח" },
    "shavuot": { ru: "Шавуот", en: "Shavuot", he: "שבועות" }
  };

  var FALLBACK = {
    source: "fallback",
    today: {
      dateRu: "23 сентября 2026",
      dateEn: "23 September 2026",
      dateHe: "23 בספטמבר 2026",
      hdateRu: "12 Тишрея 5787",
      hdateEn: "12 Tishrei 5787",
      hdateHe: "י״ב בתשרי תשפ״ז"
    },
    parasha: {
      ru: "Суккот",
      en: "Sukkot",
      he: "סוכות",
      dateRu: "26 сентября 2026",
      dateEn: "26 September 2026",
      dateHe: "26 בספטמבר 2026",
      hdateRu: "15 Тишрея 5787",
      hdateEn: "15 Tishrei 5787",
      hdateHe: "ט״ו בתשרי תשפ״ז",
      torahRu: "Ваикра 22:26–23:44; Бемидбар 29:12–16",
      torahEn: "Leviticus 22:26–23:44; Numbers 29:12–16",
      torahHe: "ויקרא 22:26–23:44; במדבר 29:12–16",
      haftarahRu: "Захария 14:1–21",
      haftarahEn: "Zechariah 14:1–21",
      haftarahHe: "זכריה 14:1–21",
      noteRu: "Расписание чтения для Израиля. Данные обновляются автоматически.",
      noteEn: "Israel reading schedule. Data updates automatically.",
      noteHe: "סדר הקריאה בישראל. הנתונים מתעדכנים אוטומטית."
    },
    holidays: [
      {
        id: "sukkot-2026",
        key: "sukkot",
        ru: "Суккот",
        en: "Sukkot",
        he: "סוכות",
        dateRu: "26 сентября 2026 – 2 октября 2026",
        dateEn: "26 September 2026 – 2 October 2026",
        dateHe: "26 בספטמבר 2026 – 2 באוקטובר 2026",
        hdateRu: "15 Тишрея 5787 – 21 Тишрея 5787",
        hdateEn: "15 Tishrei 5787 – 21 Tishrei 5787",
        hdateHe: "15 תשרי 5787 – 21 תשרי 5787",
        badgeRu: "Ближайший праздник",
        badgeEn: "Upcoming holiday",
        badgeHe: "החג הקרוב",
        readings: [
          {
            dateRu: "26 сентября 2026",
            dateEn: "26 September 2026",
            dateHe: "26 בספטמבר 2026",
            hdateRu: "15 Тишрея 5787",
            hdateEn: "15 Tishrei 5787",
            hdateHe: "15 תשרי 5787",
            torahRu: "Ваикра 22:26–23:44; Бемидбар 29:12–16",
            torahEn: "Leviticus 22:26–23:44; Numbers 29:12–16",
            torahHe: "ויקרא 22:26–23:44; במדבר 29:12–16",
            haftarahRu: "Захария 14:1–21",
            haftarahEn: "Zechariah 14:1–21",
            haftarahHe: "זכריה 14:1–21"
          }
        ]
      },
      {
        id: "shmini-simchat-2026",
        key: "shmini-simchat",
        ru: "Шмини Ацерет и Симхат Тора",
        en: "Shmini Atzeret & Simchat Torah",
        he: "שמיני עצרת ושמחת תורה",
        dateRu: "3 октября 2026",
        dateEn: "3 October 2026",
        dateHe: "3 באוקטובר 2026",
        hdateRu: "22 Тишрея 5787",
        hdateEn: "22 Tishrei 5787",
        hdateHe: "22 תשרי 5787",
        badgeRu: "Следующий праздник",
        badgeEn: "Next holiday",
        badgeHe: "החג הבא",
        readings: [
          {
            dateRu: "3 октября 2026",
            dateEn: "3 October 2026",
            dateHe: "3 באוקטובר 2026",
            hdateRu: "22 Тишрея 5787",
            hdateEn: "22 Tishrei 5787",
            hdateHe: "22 תשרי 5787",
            torahRu: "Дварим 33:1–34:12; Берешит 1:1–2:3; Бемидбар 29:35–30:1; Коэлет 1:1–12:14",
            torahEn: "Deuteronomy 33:1–34:12; Genesis 1:1–2:3; Numbers 29:35–30:1; Ecclesiastes 1:1–12:14",
            torahHe: "דברים 33:1–34:12; בראשית 1:1–2:3; במדבר 29:35–30:1; קהלת 1:1–12:14",
            haftarahRu: "Иегошуа 1:1–18",
            haftarahEn: "Joshua 1:1–18",
            haftarahHe: "יהושע 1:1–18"
          }
        ]
      }
    ]
  };

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function localDateIso() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: CONFIG.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (part) { map[part.type] = part.value; });
    return map.year + "-" + map.month + "-" + map.day;
  }

  function addDays(iso, days) {
    var d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + days);
    return d.getUTCFullYear() + "-" + pad2(d.getUTCMonth() + 1) + "-" + pad2(d.getUTCDate());
  }

  function dayOfWeek(iso) {
    return new Date(iso + "T12:00:00Z").getUTCDay();
  }

  function formatGregorian(iso, lang) {
    var locale = lang === "ru" ? "ru-RU" : (lang === "he" ? "he-IL" : "en-GB");
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(iso + "T12:00:00Z"));
  }

  function parseHDate(hdate) {
    var match = String(hdate || "").match(/^(\d+)\s+(.+?)\s+(\d+)$/);
    if (!match) return null;
    return { day: Number(match[1]), month: match[2], year: Number(match[3]) };
  }

  function formatHDate(parts, lang, hebrewText) {
    if (!parts) return "";
    if (lang === "he" && hebrewText) return hebrewText;
    var month = MONTHS[parts.month] || { ru: parts.month, en: parts.month, he: parts.month };
    if (lang === "ru") return parts.day + " " + month.ru + " " + parts.year;
    if (lang === "he") return parts.day + " " + month.he + " " + parts.year;
    return parts.day + " " + month.en + " " + parts.year;
  }

  function makeDateFields(iso, hdate, hebrewDate) {
    var parsed = typeof hdate === "string" ? parseHDate(hdate) : hdate;
    return {
      dateRu: formatGregorian(iso, "ru"),
      dateEn: formatGregorian(iso, "en"),
      dateHe: formatGregorian(iso, "he"),
      hdateRu: formatHDate(parsed, "ru", hebrewDate),
      hdateEn: formatHDate(parsed, "en", hebrewDate),
      hdateHe: formatHDate(parsed, "he", hebrewDate)
    };
  }

  function translateBooks(text, lang) {
    var result = String(text || "");
    if (lang !== "en") {
      Object.keys(BOOKS).sort(function (a, b) { return b.length - a.length; }).forEach(function (book) {
        result = result.split(book).join(BOOKS[book][lang] || book);
      });
    }
    return result.split("-").join("–");
  }

  function stripParashat(title) {
    return String(title || "").replace(/^Parashat\s+/i, "").trim();
  }

  function holidayFamily(title) {
    var t = String(title || "").toLowerCase();
    if (t.indexOf("erev ") === 0) return null;
    if (t.indexOf("sukkot") !== -1 || t.indexOf("hoshana raba") !== -1) return "sukkot";
    if (t.indexOf("shmini atzeret") !== -1 || t.indexOf("shemini atzeret") !== -1 || t.indexOf("simchat torah") !== -1) return "shmini-simchat";
    if (t.indexOf("rosh hashana") !== -1) return "rosh-hashana";
    if (t.indexOf("yom kippur") !== -1) return "yom-kippur";
    if (t.indexOf("chanukah") !== -1 || t.indexOf("hanukkah") !== -1) return "chanukah";
    if (t.indexOf("purim") !== -1) return "purim";
    if (t.indexOf("pesach") !== -1 || t.indexOf("passover") !== -1) return "pesach";
    if (t.indexOf("shavuot") !== -1) return "shavuot";
    return t.replace(/\s+[ivx]+.*$/i, "").replace(/[^a-z0-9]+/g, "-");
  }

  function holidayName(key, item) {
    if (HOLIDAYS[key]) return HOLIDAYS[key];
    return {
      ru: stripParashat(item.title),
      en: stripParashat(item.title),
      he: item.hebrew || stripParashat(item.title)
    };
  }

  function rangeDate(first, last, lang, field) {
    var a = first[field];
    var b = last[field];
    return a === b ? a : a + " – " + b;
  }

  function readingFromEvent(item) {
    var dateFields = makeDateFields(item.date, item.hdate, item.hebrewDate);
    var l = item.leyning || {};
    return Object.assign({}, dateFields, {
      titleEn: item.title || "",
      titleHe: item.hebrew || "",
      torahRu: translateBooks(l.torah || "", "ru"),
      torahEn: translateBooks(l.torah || "", "en"),
      torahHe: translateBooks(l.torah || "", "he"),
      haftarahRu: translateBooks(l.haftarah || "", "ru"),
      haftarahEn: translateBooks(l.haftarah || "", "en"),
      haftarahHe: translateBooks(l.haftarah || "", "he")
    });
  }

  function buildHolidayGroups(items, todayIso) {
    var groups = {};

    items.forEach(function (item) {
      if (item.category !== "holiday" || item.subcat !== "major") return;
      var key = holidayFamily(item.title);
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    var result = [];
    Object.keys(groups).forEach(function (key) {
      var events = groups[key].sort(function (a, b) { return a.date.localeCompare(b.date); });
      var firstEvent = events[0];
      var lastEvent = events[events.length - 1];
      if (lastEvent.date < todayIso) return;

      var name = holidayName(key, firstEvent);
      var firstFields = makeDateFields(firstEvent.date, firstEvent.hdate, firstEvent.hebrewDate);
      var lastFields = makeDateFields(lastEvent.date, lastEvent.hdate, lastEvent.hebrewDate);
      var isCurrent = firstEvent.date <= todayIso && todayIso <= lastEvent.date;

      result.push({
        id: key + "-" + firstEvent.date,
        key: key,
        ru: name.ru,
        en: name.en,
        he: name.he,
        start: firstEvent.date,
        end: lastEvent.date,
        dateRu: rangeDate(firstFields, lastFields, "ru", "dateRu"),
        dateEn: rangeDate(firstFields, lastFields, "en", "dateEn"),
        dateHe: rangeDate(firstFields, lastFields, "he", "dateHe"),
        hdateRu: rangeDate(firstFields, lastFields, "ru", "hdateRu"),
        hdateEn: rangeDate(firstFields, lastFields, "en", "hdateEn"),
        hdateHe: rangeDate(firstFields, lastFields, "he", "hdateHe"),
        badgeRu: isCurrent ? "Текущий праздник" : "Ближайший праздник",
        badgeEn: isCurrent ? "Current holiday" : "Upcoming holiday",
        badgeHe: isCurrent ? "החג הנוכחי" : "החג הקרוב",
        readings: events.filter(function (ev) {
          return ev.leyning && (ev.leyning.torah || ev.leyning.haftarah);
        }).map(readingFromEvent)
      });
    });

    result.sort(function (a, b) { return a.start.localeCompare(b.start); });
    result = result.slice(0, 2);
    if (result.length > 1 && result[1].start > todayIso) {
      result[1].badgeRu = "Следующий праздник";
      result[1].badgeEn = "Next holiday";
      result[1].badgeHe = "החג הבא";
    }
    return result;
  }

  function findNextShabbatReading(items, todayIso) {
    var candidates = items.filter(function (item) {
      return item.date >= todayIso &&
        dayOfWeek(item.date) === 6 &&
        item.leyning &&
        item.leyning.torah;
    }).sort(function (a, b) { return a.date.localeCompare(b.date); });

    var item = candidates[0];
    if (!item) throw new Error("No upcoming Shabbat reading found");

    var fields = makeDateFields(item.date, item.hdate, item.hebrewDate);
    var key = item.category === "holiday" ? holidayFamily(item.title) : null;
    var names = key ? holidayName(key, item) : {
      ru: stripParashat(item.title),
      en: stripParashat(item.title),
      he: item.hebrew || stripParashat(item.title)
    };

    return Object.assign({}, fields, {
      ru: names.ru,
      en: names.en,
      he: names.he,
      torahRu: translateBooks(item.leyning.torah || "", "ru"),
      torahEn: translateBooks(item.leyning.torah || "", "en"),
      torahHe: translateBooks(item.leyning.torah || "", "he"),
      haftarahRu: translateBooks(item.leyning.haftarah || "", "ru"),
      haftarahEn: translateBooks(item.leyning.haftarah || "", "en"),
      haftarahHe: translateBooks(item.leyning.haftarah || "", "he"),
      noteRu: "Расписание чтения для Израиля. Данные обновляются автоматически по календарю Беэр-Шевы.",
      noteEn: "Israel reading schedule. Data updates automatically using the Be'er Sheva calendar.",
      noteHe: "סדר הקריאה בישראל. הנתונים מתעדכנים אוטומטית לפי לוח באר שבע."
    });
  }

  async function fetchJson(url) {
    var response = await fetch(url, {
      method: "GET",
      credentials: "omit",
      cache: "default",
      headers: { "Accept": "application/json" }
    });
    if (!response.ok) throw new Error("Calendar request failed: " + response.status);
    return response.json();
  }

  async function getToday(todayIso) {
    var zmanimUrl = "https://www.hebcal.com/zmanim?cfg=json&geonameid=" + CONFIG.geonameId + "&date=" + todayIso;
    var zmanim = await fetchJson(zmanimUrl);
    var sunset = zmanim && zmanim.times && zmanim.times.sunset ? new Date(zmanim.times.sunset) : null;
    var afterSunset = sunset ? Date.now() >= sunset.getTime() : false;

    var converterUrl = "https://www.hebcal.com/converter?cfg=json&g2h=1&strict=1&date=" + todayIso;
    if (afterSunset) converterUrl += "&gs=on";
    var h = await fetchJson(converterUrl);

    return Object.assign({}, makeDateFields(todayIso, {
      day: h.hd,
      month: h.hm,
      year: h.hy
    }, h.hebrew), {
      sunsetIso: sunset ? sunset.toISOString() : null,
      afterSunset: afterSunset
    });
  }

  async function buildLiveData() {
    var todayIso = localDateIso();
    var endIso = addDays(todayIso, 120);
    var calendarUrl = "https://www.hebcal.com/hebcal?v=1&cfg=json&start=" + todayIso +
      "&end=" + endIso +
      "&maj=on&s=on&D=on&i=on&leyning=on";

    var results = await Promise.all([
      getToday(todayIso),
      fetchJson(calendarUrl)
    ]);

    var today = results[0];
    var calendar = results[1];
    var items = calendar.items || [];

    return {
      source: "hebcal",
      generatedAt: new Date().toISOString(),
      today: today,
      parasha: findNextShabbatReading(items, todayIso),
      holidays: buildHolidayGroups(items, todayIso)
    };
  }

  function emit() {
    window.dispatchEvent(new CustomEvent("weeklyContentUpdated", {
      detail: window.WEEKLY_CONTENT
    }));
  }

  function readCache() {
    try {
      var raw = localStorage.getItem(CONFIG.cacheKey);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return parsed && parsed.data ? parsed.data : null;
    } catch (e) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      localStorage.setItem(CONFIG.cacheKey, JSON.stringify({
        savedAt: Date.now(),
        data: data
      }));
    } catch (e) {}
  }

  async function loadWeeklyCalendarData() {
    var cached = readCache();
    if (cached) {
      window.WEEKLY_CONTENT = cached;
      emit();
    }

    try {
      var live = await buildLiveData();
      window.WEEKLY_CONTENT = live;
      writeCache(live);
      emit();

      if (live.today && live.today.sunsetIso && !live.today.afterSunset) {
        var wait = new Date(live.today.sunsetIso).getTime() - Date.now() + 65000;
        if (wait > 0 && wait < 18 * 60 * 60 * 1000) {
          window.setTimeout(function () {
            loadWeeklyCalendarData().catch(function () {});
          }, wait);
        }
      }

      return live;
    } catch (error) {
      console.warn("Automatic Torah/holiday update failed; using cached or fallback data.", error);
      if (!cached) {
        window.WEEKLY_CONTENT = FALLBACK;
        emit();
      }
      return window.WEEKLY_CONTENT;
    }
  }

  window.WEEKLY_CONTENT = FALLBACK;
  window.loadWeeklyCalendarData = loadWeeklyCalendarData;
})();