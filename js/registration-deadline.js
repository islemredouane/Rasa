// Registration deadline: a live countdown on /registrations, a "closes" note on the homepage badge.
// When the deadline passes, the page switches itself to a "closed" state (no redeploy needed).
// To change the date, edit DEADLINE below (ISO time with the Algiers offset, +01:00).
(() => {
  const DEADLINE = Date.parse("2026-10-29T00:00:00+01:00"); // midnight at the end of 28 Oct 2026

  const box = document.querySelector("[data-reg-countdown]");
  const badges = document.querySelectorAll("[data-reg-badge]");
  const ctas = document.querySelectorAll("[data-reg-cta]");
  const pad = (n) => String(n).padStart(2, "0");
  let closed = false;

  function closeRegistrations() {
    closed = true;
    ctas.forEach((el) => el.classList.add("hidden"));
    badges.forEach((el) => (el.textContent = "Registrations closed"));
    document.querySelectorAll("[data-reg-closed-text]").forEach((el) => (el.textContent = el.dataset.regClosedText));
    if (box) {
      box.querySelector("[data-reg-live]")?.classList.add("hidden");
      box.querySelector("[data-reg-closed]")?.classList.remove("hidden");
    }
  }

  function tick() {
    const left = DEADLINE - Date.now();
    if (left <= 0) return closeRegistrations();
    const s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (box) {
      const set = (k, v) => { const el = box.querySelector(`[data-reg-${k}]`); if (el) el.textContent = v; };
      set("d", pad(d)); set("h", pad(h)); set("m", pad(m)); set("s", pad(sec));
      box.querySelector("[data-reg-days]")?.classList.toggle("hidden", d === 0);
    }
    badges.forEach((el) => (el.textContent = d > 0 ? `Registrations close in ${d}d ${h}h` : `Closes tonight · ${h}h ${pad(m)}m left`));
    if (!closed) setTimeout(tick, 1000);
  }
  tick();
})();
