(function () {
  "use strict";

  var manifest = window.GALLERY_MANIFEST || { categories: {} };

  var CATEGORY_LABELS = {
    repatriants: { ru: "Репатрианты", en: "Repatriates", he: "עולים חדשים" },
    canteen: { ru: "Столовая", en: "Canteen", he: "בית תמחוי" },
    holocaust: { ru: "Пережившие Холокост", en: "Holocaust Survivors", he: "ניצולי השואה" },
    college: { ru: "Колледж", en: "College", he: "מכללה" },
    holidays: { ru: "Праздники", en: "Holidays", he: "חגים" },
    friends: { ru: "Наши друзья", en: "Our Friends", he: "החברים שלנו" }
  };

  var WORDS = {
    help: { ru: "Помощь", en: "Help", he: "סיוע" },
    support: { ru: "Поддержка", en: "Support", he: "תמיכה" },
    care: { ru: "Забота", en: "Care", he: "דאגה" },
    community: { ru: "Община", en: "Community", he: "קהילה" },
    meal: { ru: "Питание", en: "Meal", he: "ארוחה" },
    meals: { ru: "Питание", en: "Meals", he: "ארוחות" },
    food: { ru: "Питание", en: "Food", he: "מזון" },
    family: { ru: "Семья", en: "Family", he: "משפחה" },
    group: { ru: "Группа", en: "Group", he: "קבוצה" },
    faith: { ru: "Вера", en: "Faith", he: "אמונה" },
    friendship: { ru: "Дружба", en: "Friendship", he: "חברות" },
    supporters: { ru: "Друзья и партнёры", en: "Supporters", he: "תומכים ושותפים" },
    christian: { ru: "Христианский", en: "Christian", he: "נוצרי" },
    leadership: { ru: "Лидерство", en: "Leadership", he: "מנהיגות" },
    university: { ru: "Университет", en: "University", he: "אוניברסיטה" },
    rosh: { ru: "Рош", en: "Rosh", he: "ראש" },
    hashanah: { ru: "ха-Шана", en: "Hashanah", he: "השנה" },
    baptism: { ru: "Крещение", en: "Baptism", he: "טבילה" }
  };

  var MONTHS_RU = [
    "", "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря"
  ];
  var MONTHS_EN = [
    "", "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function currentLang() {
    if (document.body.classList.contains("lang-he")) return "he";
    if (document.body.classList.contains("lang-en")) return "en";
    return "ru";
  }

  function basename(path) {
    return String(path || "").split("/").pop() || "";
  }

  function stem(path) {
    return basename(path).replace(/\.[^.]+$/, "");
  }

  function parseDateFromName(name) {
    var s = stem(name);
    var m = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?(?:-|_|$)/);
    if (!m) return null;
    return {
      year: Number(m[1]),
      month: Number(m[2]),
      day: m[3] ? Number(m[3]) : null,
      prefix: m[0]
    };
  }

  function formatDate(date, lang) {
    if (!date) return "";
    if (lang === "he") {
      return date.day
        ? date.day + "." + String(date.month).padStart(2, "0") + "." + date.year
        : String(date.month).padStart(2, "0") + "/" + date.year;
    }
    if (lang === "en") {
      return date.day
        ? date.day + " " + MONTHS_EN[date.month] + " " + date.year
        : MONTHS_EN[date.month] + " " + date.year;
    }
    return date.day
      ? date.day + " " + MONTHS_RU[date.month] + " " + date.year
      : MONTHS_RU[date.month] + " " + date.year;
  }

  function humanize(item, category, lang) {
    var name = stem(item.name || item.path || "");
    var date = parseDateFromName(name);
    if (date) name = name.slice(date.prefix.length);

    name = name
      .replace(/[_]+/g, "-")
      .replace(/-(?:0?\d{1,3})$/g, "")
      .replace(new RegExp("(^|-)" + category + "(-|$)", "gi"), "-")
      .replace(/^-+|-+$/g, "");

    var categoryLabel = (CATEGORY_LABELS[category] && CATEGORY_LABELS[category][lang]) || category;
    var tokens = name ? name.split("-").filter(Boolean) : [];
    var translated = tokens.map(function (token) {
      var key = token.toLowerCase();
      if (WORDS[key]) return WORDS[key][lang] || WORDS[key].en;
      return token.charAt(0).toUpperCase() + token.slice(1);
    });

    var title = translated.join(" ").trim();
    if (!title) title = categoryLabel;

    var generic = tokens.length === 1 && ["help", "support", "care"].indexOf(tokens[0].toLowerCase()) !== -1;
    if (generic) title = title + " • " + categoryLabel;

    return {
      title: title,
      date: formatDate(date, lang)
    };
  }

  function isDisplayable(item) {
    return item && item.path && /\.(jpe?g|png|webp|gif)$/i.test(item.path);
  }

  function sortNewestFirst(a, b) {
    var aDate = parseDateFromName(a.name || a.path || "");
    var bDate = parseDateFromName(b.name || b.path || "");

    if (aDate && bDate) {
      var ak = aDate.year * 10000 + aDate.month * 100 + (aDate.day || 0);
      var bk = bDate.year * 10000 + bDate.month * 100 + (bDate.day || 0);
      if (ak !== bk) return bk - ak;
    } else if (aDate) {
      return -1;
    } else if (bDate) {
      return 1;
    }

    var da = a.added || "";
    var db = b.added || "";
    if (da !== db) return db.localeCompare(da);
    return (b.name || "").localeCompare(a.name || "");
  }

  function chooseItems(category) {
    var entries = ((manifest.categories || {})[category] || []).filter(isDisplayable);

    // Automatic galleries keep old files permanently unless they are manually
    // deleted from the repository. New dated photos are placed first.
    return entries
      .filter(function (item) {
        // Skip only tiny helper thumbnails named "*-gallery.jpg".
        // Full-size old photos, overview sheets and collages stay visible.
        return !/-gallery(?:-|\.|$)/i.test(item.name || "");
      })
      .sort(function (a, b) {
        var aLegacy = a.kind === "legacy" ? 1 : 0;
        var bLegacy = b.kind === "legacy" ? 1 : 0;
        if (aLegacy !== bLegacy) return aLegacy - bLegacy;
        return sortNewestFirst(a, b);
      });
  }

  function createCaption(item, category) {
    var caption = document.createElement("div");
    caption.className = "gallery-auto-caption";

    ["ru", "en", "he"].forEach(function (lang) {
      var meta = humanize(item, category, lang);
      var wrap = document.createElement("span");
      wrap.setAttribute("data-lang", lang);
      if (lang === "he") {
        wrap.lang = "he";
        wrap.dir = "rtl";
      }

      var title = document.createElement("strong");
      title.textContent = meta.title;
      wrap.append(title);

      if (meta.date) {
        var date = document.createElement("small");
        date.textContent = meta.date;
        wrap.append(date);
      }
      caption.append(wrap);
    });

    return caption;
  }

  function renderGallery(container) {
    var category = container.getAttribute("data-gallery-category");
    var items = chooseItems(category);

    // Progressive enhancement: never erase the static HTML fallback unless
    // the complete enhanced gallery has been built successfully.
    if (!items.length) return;

    var grid = document.createElement("div");
    grid.className = "gallery-auto-grid";

    var hasRegular = items.some(function (item) { return item.kind !== "legacy"; });
    var archiveDividerAdded = false;

    items.forEach(function (item, index) {
      if (item.kind === "legacy" && hasRegular && !archiveDividerAdded) {
        var divider = document.createElement("div");
        divider.className = "gallery-auto-archive-divider";
        divider.innerHTML =
          '<i class="fas fa-box-archive" aria-hidden="true"></i>' +
          '<span data-lang="ru">Архивные коллажи — нажмите, чтобы открыть</span>' +
          '<span data-lang="en">Archived collages — tap to open</span>' +
          '<span data-lang="he" lang="he" dir="rtl">קולאז׳ים מהארכיון — לחצו לפתיחה</span>';
        grid.append(divider);
        archiveDividerAdded = true;
      }

      var link = document.createElement("a");
      link.className = "gallery-auto-card";
      if (item.kind === "legacy") link.classList.add("is-legacy");
      link.href = item.path;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("aria-label", "Open " + basename(item.path));

      var media = document.createElement("div");
      media.className = "gallery-auto-media";

      var img = document.createElement("img");
      img.src = item.path;
      img.alt = humanize(item, category, currentLang()).title;
      img.loading = index < 2 ? "eager" : "lazy";
      img.decoding = "async";

      if (item.kind === "legacy") {
        var archiveBadge = document.createElement("span");
        archiveBadge.className = "gallery-auto-archive-badge";
        archiveBadge.innerHTML =
          '<span data-lang="ru">Архив</span>' +
          '<span data-lang="en">Archive</span>' +
          '<span data-lang="he" lang="he" dir="rtl">ארכיון</span>';
        media.append(archiveBadge);
      }

      var cue = document.createElement("span");
      cue.className = "gallery-auto-open";
      cue.innerHTML = '<i class="fas fa-up-right-from-square" aria-hidden="true"></i>';

      media.append(img, cue);
      link.append(media, createCaption(item, category));
      grid.append(link);
    });

    // Atomic swap: if anything above throws, the original static gallery stays visible.
    container.replaceChildren(grid);
  }

  function updateCategoryPreviews() {
    document.querySelectorAll("[data-gallery-preview]").forEach(function (img) {
      var category = img.getAttribute("data-gallery-preview");
      var items = chooseItems(category);
      if (!items.length) return;
      img.src = items[0].path;
      img.removeAttribute("width");
      img.removeAttribute("height");
    });
  }

  function renderAll() {
    document.querySelectorAll(".gallery-auto[data-gallery-category]").forEach(renderGallery);
    updateCategoryPreviews();
  }

  // Gallery content is read only from the local manifest.
  // This keeps the public site independent from api.github.com.

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
  });
  window.addEventListener("siteLanguageChanged", renderAll);
})();