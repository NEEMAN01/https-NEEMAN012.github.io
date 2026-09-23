(function () {
  "use strict";

  var manifest = window.GALLERY_MANIFEST || { categories: {} };
  var GITHUB_TREE_URL = "https://api.github.com/repos/NEEMAN01/https-NEEMAN012.github.io/git/trees/main?recursive=1";

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
    var primary = entries.filter(function (item) { return item.kind !== "legacy"; });

    if (primary.length) {
      return primary.sort(sortNewestFirst);
    }

    return entries
      .filter(function (item) { return !/-gallery(?:-|\.|$)/i.test(item.name || ""); })
      .sort(function (a, b) {
        var aOverview = /overview/i.test(a.name || "") ? 1 : 0;
        var bOverview = /overview/i.test(b.name || "") ? 1 : 0;
        if (aOverview !== bOverview) return bOverview - aOverview;
        return (b.name || "").localeCompare(a.name || "");
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
    container.replaceChildren();

    if (!items.length) {
      var empty = document.createElement("div");
      empty.className = "gallery-auto-empty";
      empty.innerHTML =
        '<i class="fas fa-images" aria-hidden="true"></i>' +
        '<span data-lang="ru">Фотографии появятся здесь после добавления в галерею.</span>' +
        '<span data-lang="en">Photos will appear here after they are added to the gallery.</span>' +
        '<span data-lang="he" lang="he" dir="rtl">התמונות יופיעו כאן לאחר שיוספו לגלריה.</span>';
      container.append(empty);
      return;
    }

    var grid = document.createElement("div");
    grid.className = "gallery-auto-grid";

    items.forEach(function (item, index) {
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

      var cue = document.createElement("span");
      cue.className = "gallery-auto-open";
      cue.innerHTML = '<i class="fas fa-up-right-from-square" aria-hidden="true"></i>';

      media.append(img, cue);
      link.append(media, createCaption(item, category));
      grid.append(link);
    });

    container.append(grid);
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

  function classifyPath(path) {
    var file = basename(path);
    var s = stem(file);
    var hasStandardDate = /^\d{4}-\d{2}(?:-\d{2})?(?:-|_|$)/.test(s);
    var legacy = !hasStandardDate && /(^|[-_])(overview|gallery|main)([-_]|$)/i.test(s);
    return {
      path: path,
      name: file,
      kind: legacy ? "legacy" : "photo",
      added: ""
    };
  }

  async function refreshManifestFromGitHub() {
    try {
      var response = await fetch(GITHUB_TREE_URL, {
        headers: { "Accept": "application/vnd.github+json" },
        cache: "no-store",
        credentials: "omit"
      });
      if (!response.ok) throw new Error("GitHub gallery index request failed: " + response.status);

      var data = await response.json();
      var categories = {};

      (data.tree || []).forEach(function (entry) {
        if (entry.type !== "blob") return;
        if (!/^assets\/galleries\/[^/]+\/[^/]+$/i.test(entry.path || "")) return;
        if (!/\.(jpe?g|png|webp|gif)$/i.test(entry.path)) return;

        var parts = entry.path.split("/");
        var category = parts[2];
        if (!categories[category]) categories[category] = [];
        categories[category].push(classifyPath(entry.path));
      });

      if (Object.keys(categories).length) {
        manifest = {
          version: 2,
          generatedAt: new Date().toISOString(),
          categories: categories
        };
        window.GALLERY_MANIFEST = manifest;
        renderAll();
      }
    } catch (error) {
      console.warn("Live gallery index unavailable; using the local gallery manifest.", error);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    refreshManifestFromGitHub();
  });
  window.addEventListener("siteLanguageChanged", renderAll);
})();