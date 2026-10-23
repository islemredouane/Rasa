// Phone bottom bar: Home · Board · Departments · Contact (a floating pill, like YouTube and Instagram).
// - A highlight pill slides to the selected item (filled icon, white label).
// - "Departments" opens a sheet listing every department.
// - A scrollbar on the screen's right edge (like the desktop one) replaces the hidden page scrollbar.
// To add a department, add it to DEPARTMENTS below — no page needs editing.
(function () {
  const DEPARTMENTS = [
    { href: "/literature", icon: "menu_book", label: "Literature" },
    { href: "/art", icon: "palette", label: "Art" },
    { href: "/music", icon: "music_note", label: "Music" },
    { href: "/chess", icon: "chess", label: "Chess" },
    { href: "/activities", icon: "sports_esports", label: "Activities" },
    { href: "/charity", icon: "volunteer_activism", label: "Charity" },
  ];
  // Pages that belong to a department (libraries are part of Literature).
  const DEPARTMENT_PAGES = DEPARTMENTS.map((d) => d.href).concat(["/literature/arabic", "/literature/english", "/literature/french"]);

  const toggle = document.querySelector("[data-dept-toggle]");
  const row = document.querySelector("[data-nav-row]");
  if (!toggle || !row) return;

  const bar = toggle.closest(".fixed");
  const pill = row.querySelector("[data-nav-pill]");
  const items = [...row.querySelectorAll("[data-nav]")];
  const toggleIcon = toggle.querySelector(".material-symbols-outlined");

  // Current page as a clean path: "/", "/events", "/literature/arabic" (works with or without ".html").
  const page = location.pathname.replace(/\.html$/, "").replace(/\/index$/, "/").replace(/(.)\/$/, "$1") || "/";
  const isHome = page === "/";
  const isCurrent = (href) => href === page;

  // ---------- Departments sheet ----------
  const tiles = DEPARTMENTS.map((d) => {
    const active = isCurrent(d.href);
    return `
      <a href="${d.href}" ${active ? 'aria-current="page"' : ""}
        class="flex flex-col items-center justify-center gap-2 rounded-2xl py-4 px-2 border transition
               ${active ? "border-primary/60 bg-primary/10 text-primary" : "border-white/5 bg-white/5 text-white/80 hover:text-primary hover:border-primary/40"}">
        <span class="material-symbols-outlined text-[28px]">${d.icon}</span>
        <span class="text-xs font-semibold tracking-wide">${d.label}</span>
      </a>`;
  }).join("");

  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden opacity-0 pointer-events-none transition-opacity duration-300";

  const sheet = document.createElement("div");
  sheet.id = "deptSheet";
  sheet.setAttribute("role", "dialog");
  sheet.setAttribute("aria-label", "Departments");
  sheet.className = "fixed inset-x-4 mx-auto max-w-[22rem] z-40 md:hidden translate-y-full opacity-0 pointer-events-none transition-all duration-300 " +
    "rounded-[32px] border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl px-5 pt-3 pb-5 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]";
  sheet.innerHTML = `
    <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20"></div>
    <div class="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/50 text-center font-display">Departments</div>
    <div class="grid grid-cols-3 gap-3">${tiles}</div>`;
  document.body.append(overlay, sheet);

  // ---------- Sliding highlight ----------
  let selected = null;

  function select(key) {
    selected = key;
    const item = items.find((el) => el.dataset.nav === key);
    for (const el of items) {
      const on = el === item;
      el.classList.toggle("text-white", on);
      el.classList.toggle("text-white/60", !on);
      el.querySelector(".material-symbols-outlined").style.fontVariationSettings = on ? "'FILL' 1" : "";
      if (el.tagName === "A") on ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current");
    }
    if (!pill) return;
    if (!item) { pill.style.opacity = "0"; return; }
    const inset = 4;
    pill.style.width = item.offsetWidth - inset * 2 + "px";
    pill.style.transform = `translateX(${item.offsetLeft + inset}px)`;
    pill.style.opacity = "1";
  }

  // Which item matches where the visitor is right now.
  let lockUntil = 0;
  function pageKey() {
    if (DEPARTMENT_PAGES.includes(page)) return "departments";
    if (page === "/events") return "events";
    if (!isHome) return null;
    // the FAQ sits right above the contact form, so both light up "Contact"
    const contact = document.getElementById("faq") || document.getElementById("contact");
    const team = document.getElementById("team");
    const line = window.innerHeight * 0.5;
    if (contact && contact.getBoundingClientRect().top < line) return "contact";
    const events = document.getElementById("events");
    if (team && team.getBoundingClientRect().top < line) return "board";
    if (events && events.getBoundingClientRect().top < line) return "events";
    return "home";
  }

  // Off the homepage the Events tab opens the full page; on the homepage it scrolls to the section.
  if (!isHome) items.find((el) => el.dataset.nav === "events")?.setAttribute("href", "/events");

  // Place the pill without animating on first paint.
  if (pill) {
    pill.style.transition = "none";
    select(pageKey());
    requestAnimationFrame(() => requestAnimationFrame(() => (pill.style.transition = "")));
  } else {
    select(pageKey());
  }

  for (const el of items) {
    if (el === toggle) continue;
    el.addEventListener("click", () => {
      lockUntil = Date.now() + 1000; // let the smooth scroll finish before the scroll-spy takes over again
      select(el.dataset.nav);
    });
  }

  // ---------- Sheet open / close ----------
  function placeSheet() {
    sheet.style.bottom = (bar ? Math.round(window.innerHeight - bar.getBoundingClientRect().top + 8) : 0) + "px";
  }

  function setOpen(open) {
    placeSheet();
    toggle.setAttribute("aria-expanded", String(open));
    if (toggleIcon) toggleIcon.textContent = open ? "close" : "grid_view";
    for (const el of [overlay, sheet]) {
      el.classList.toggle("opacity-0", !open);
      el.classList.toggle("pointer-events-none", !open);
    }
    sheet.classList.toggle("translate-y-full", !open);
    document.body.style.overflow = open ? "hidden" : "";
    select(open ? "departments" : pageKey());
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  overlay.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false);
  });

  // ---------- Scrollbar + scroll-spy ----------
  // The page scrollbar is hidden on phones, so this fixed overlay takes its place with the desktop scrollbar's
  // look (8px, #333 thumb, orange when held). It floats over the page, so it never pushes the content sideways.
  const rail = document.createElement("div");
  rail.setAttribute("aria-hidden", "true");
  rail.className = "fixed right-0 top-0 bottom-0 w-2 z-40 md:hidden pointer-events-none transition-opacity duration-200";
  const thumb = document.createElement("div");
  thumb.className =
    "absolute right-0 top-0 w-2 rounded-[4px] bg-[#333] pointer-events-auto touch-none transition-colors duration-200 " +
    "before:content-[''] before:absolute before:inset-y-0 before:-left-4 before:right-0";
  rail.append(thumb);
  document.body.append(rail);
  if (bar) bar.classList.add("overflow-hidden");

  function metrics() {
    const height = document.documentElement.scrollHeight;
    const view = window.innerHeight;
    const max = Math.max(height - view, 0);
    const size = max > 0 ? Math.max(44, Math.round((view * view) / height)) : 0;
    return { max, size, travel: view - size };
  }

  function updateScrollbar() {
    const { max, size, travel } = metrics();
    rail.style.opacity = max > 0 ? "1" : "0";
    thumb.style.height = size + "px";
    thumb.style.transform = `translateY(${max > 0 ? Math.round((Math.min(window.scrollY, max) / max) * travel) : 0}px)`;
  }

  // Drag the thumb to scroll (touch or mouse).
  let drag = null;
  const hold = (on) => {
    thumb.classList.toggle("bg-primary", on);
    thumb.classList.toggle("bg-[#333]", !on);
  };
  thumb.addEventListener("pointerdown", (e) => {
    drag = { y: e.clientY, top: window.scrollY };
    try { thumb.setPointerCapture(e.pointerId); } catch { /* synthetic pointer: fine */ }
    hold(true);
    e.preventDefault();
  });
  thumb.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const m = metrics();
    if (m.travel <= 0) return;
    window.scrollTo({ top: drag.top + (e.clientY - drag.y) * (m.max / m.travel), behavior: "instant" });
  });
  const release = () => { drag = null; hold(false); };
  thumb.addEventListener("pointerup", release);
  thumb.addEventListener("pointercancel", release);

  // The page height changes as images load and sections open.
  if ("ResizeObserver" in window) new ResizeObserver(updateScrollbar).observe(document.body);
  window.addEventListener("load", updateScrollbar);

  let ticking = false;
  function onScroll() {
    updateScrollbar();
    const sheetOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isHome && !sheetOpen && Date.now() > lockUntil) {
      const key = pageKey();
      if (key !== selected) select(key);
    }
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", () => { placeSheet(); select(selected); onScroll(); });
  onScroll();
})();
