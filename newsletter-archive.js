(function () {
  "use strict";

  const REPO = "NEEMAN01/https-NEEMAN012.github.io";
  const BRANCH = "main";
  const list = document.getElementById("newsletter-archive-list");
  if (!list) return;

  const MONTHS = {
    "01": { ru: "Январь", en: "January", he: "ינואר" },
    "02": { ru: "Февраль", en: "February", he: "פברואר" },
    "03": { ru: "Март", en: "March", he: "מרץ" },
    "04": { ru: "Апрель", en: "April", he: "אפריל" },
    "05": { ru: "Май", en: "May", he: "מאי" },
    "06": { ru: "Июнь", en: "June", he: "יוני" },
    "07": { ru: "Июль", en: "July", he: "יולי" },
    "08": { ru: "Август", en: "August", he: "אוגוסט" },
    "09": { ru: "Сентябрь", en: "September", he: "ספטמבר" },
    "10": { ru: "Октябрь", en: "October", he: "אוקטובר" },
    "11": { ru: "Ноябрь", en: "November", he: "נובמבר" },
    "12": { ru: "Декабрь", en: "December", he: "דצמבר" }
  };

  const LEGACY = [
    {
      year: "2026",
      month: "03",
      files: {
        combined: "News Letter 03:26 russ:eng.pdf"
      }
    }
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function encodePath(path) {
    return path.split("/").map(encodeURIComponent).join("/");
  }

  function issueKey(year, month) {
    return year + "-" + month;
  }

  function parseIssueFile(path) {
    const name = path.split("/").pop();
    const match = name.match(/^streams[-_ ]of[-_ ]hope[-_ ](\d{2})[-_ ](\d{4})[-_ ](ru|en|he)\.pdf$/i);
    if (!match) return null;

    const month = match[1];
    const year = match[2];
    const lang = match[3].toLowerCase();

    if (!MONTHS[month]) return null;

    return { year, month, lang, path };
  }

  function mergeIssue(map, issue) {
    const key = issueKey(issue.year, issue.month);
    if (!map.has(key)) {
      map.set(key, { year: issue.year, month: issue.month, files: {} });
    }
    Object.assign(map.get(key).files, issue.files || {});
    if (issue.lang && issue.path) {
      map.get(key).files[issue.lang] = issue.path;
    }
  }

  function collectIssues(tree) {
    const map = new Map();

    LEGACY.forEach((legacy) => mergeIssue(map, legacy));

    (tree || []).forEach((node) => {
      if (node.type !== "blob") return;
      const parsed = parseIssueFile(node.path);
      if (parsed) mergeIssue(map, parsed);
    });

    return Array.from(map.values()).sort((a, b) => {
      return issueKey(b.year, b.month).localeCompare(issueKey(a.year, a.month));
    });
  }

  function languageButton(path, language) {
    const labels = {
      ru: { ru: "Русский PDF", en: "Russian PDF", he: "PDF ברוסית" },
      en: { ru: "Английский PDF", en: "English PDF", he: "PDF באנגלית" },
      he: { ru: "Иврит PDF", en: "Hebrew PDF", he: "PDF בעברית" },
      combined: { ru: "Читать выпуск", en: "Read issue", he: "קריאת הגיליון" }
    };

    const label = labels[language] || labels.combined;
    return '<a class="btn btn-document" href="' + encodePath(path) + '" target="_blank" rel="noopener">' +
      '<i class="fas fa-book-open"></i>' +
      '<span data-lang="ru">' + label.ru + '</span>' +
      '<span data-lang="en">' + label.en + '</span>' +
      '<span data-lang="he" lang="he" dir="rtl">' + label.he + '</span>' +
      '</a>';
  }

  function renderIssue(issue, isNewest) {
    const month = MONTHS[issue.month] || { ru: issue.month, en: issue.month, he: issue.month };
    const ym = issue.month + "/" + issue.year;
    const datetime = issue.year + "-" + issue.month;

    let buttons = "";
    ["ru", "en", "he", "combined"].forEach((lang) => {
      if (issue.files[lang]) buttons += languageButton(issue.files[lang], lang);
    });

    const hasSeveral = ["ru", "en", "he"].filter((lang) => issue.files[lang]).length > 1;

    return '<article class="archive-document-item">' +
      '<div class="archive-document-icon"><i class="fas fa-newspaper"></i></div>' +
      '<div class="archive-document-copy">' +
        '<div class="archive-document-meta">' +
          '<span class="badge badge-document">' +
            '<span data-lang="ru">' + (isNewest ? "Новый выпуск" : "Выпуск газеты") + '</span>' +
            '<span data-lang="en">' + (isNewest ? "New issue" : "Newsletter issue") + '</span>' +
            '<span data-lang="he" lang="he" dir="rtl">' + (isNewest ? "גיליון חדש" : "גיליון העיתון") + '</span>' +
          '</span>' +
          '<time datetime="' + datetime + '">' + ym + '</time>' +
        '</div>' +
        '<h2>' +
          '<span data-lang="ru">Выпуск ' + ym + '</span>' +
          '<span data-lang="en">' + escapeHtml(month.en) + " " + issue.year + ' Issue</span>' +
          '<span data-lang="he" lang="he" dir="rtl">גיליון ' + ym + '</span>' +
        '</h2>' +
        '<p>' +
          '<span data-lang="ru">' + (hasSeveral ? 'Выпуск доступен на нескольких языках.' : 'Выпуск газеты «Источники Надежды» доступен для чтения.') + '</span>' +
          '<span data-lang="en">' + (hasSeveral ? 'This issue is available in several languages.' : 'This Streams of Hope issue is available to read.') + '</span>' +
          '<span data-lang="he" lang="he" dir="rtl">' + (hasSeveral ? 'הגיליון זמין במספר שפות.' : 'גיליון ״מקורות התקווה״ זמין לקריאה.') + '</span>' +
        '</p>' +
        '<div class="archive-document-actions">' + buttons + '</div>' +
      '</div>' +
    '</article>';
  }

  function render(issues) {
    if (!issues.length) return;
    list.innerHTML = issues.map((issue, index) => renderIssue(issue, index === 0)).join("");
  }

  async function loadArchive() {
    try {
      const response = await fetch(
        "https://api.github.com/repos/" + REPO + "/git/trees/" + BRANCH + "?recursive=1",
        { headers: { "Accept": "application/vnd.github+json" } }
      );
      if (!response.ok) throw new Error("GitHub archive request failed: " + response.status);

      const data = await response.json();
      render(collectIssues(data.tree));
    } catch (error) {
      console.warn("Automatic newsletter archive update failed; keeping the built-in archive.", error);
    }
  }

  loadArchive();
})();