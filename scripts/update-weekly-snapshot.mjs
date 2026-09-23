import fs from "node:fs/promises";

globalThis.localStorage = {
  getItem() { return null; },
  setItem() {}
};

globalThis.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options && options.detail;
  }
};

globalThis.window = {
  __SNAPSHOT_BUILD__: true,
  WEEKLY_CONTENT: null,
  setTimeout(fn, delay) {
    // Keep short request timeouts, but do not leave long sunset timers running in CI.
    return delay <= 5000 ? setTimeout(fn, delay) : 0;
  },
  clearTimeout(id) {
    if (id) clearTimeout(id);
  },
  dispatchEvent() {}
};

const source = await fs.readFile("weekly-content.js", "utf8");
(0, eval)(source);

if (typeof window.loadWeeklyCalendarData !== "function") {
  throw new Error("weekly-content.js did not expose loadWeeklyCalendarData");
}

const data = await window.loadWeeklyCalendarData();

if (
  !data ||
  data.source !== "hebcal" ||
  !data.today ||
  !data.parasha ||
  !Array.isArray(data.holidays)
) {
  throw new Error("Hebcal returned incomplete data; preserving the previous snapshot");
}

const snapshot = {
  ...data,
  source: "local-snapshot",
  snapshotUpdatedAt: new Date().toISOString()
};

await fs.writeFile(
  "weekly-snapshot.json",
  JSON.stringify(snapshot, null, 2) + "\n",
  "utf8"
);

console.log(
  "Updated weekly snapshot:",
  snapshot.today.dateEn,
  "—",
  snapshot.parasha.en
);
