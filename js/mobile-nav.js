// Phone bottom bar: "Departments" opens a sheet listing every department.
// To add a department, add it to DEPARTMENTS below — no page needs editing.
(function () {
  const DEPARTMENTS = [
    { href: "literature.html", icon: "menu_book", label: "Literature" },
    { href: "art.html", icon: "palette", label: "Art" },
    { href: "music.html", icon: "music_note", label: "Music" },
    { href: "chess.html", icon: "chess", label: "Chess" },
    { href: "gaming.html", icon: "sports_esports", label: "Activities" },
    { href: "charity.html", icon: "volunteer_activism", label: "Charity" },
  ];

  const toggle = document.querySelector("[data-dept-toggle]");
  if (!toggle) return;

  const page = location.pathname.split("/").pop() || "index.html";
  const current = (href) => href === page || href.replace(".html", "") === page;

  const tiles = DEPARTMENTS.map((d) => {
    const active = current(d.href);
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
  sheet.className = "fixed inset-x-0 z-40 md:hidden translate-y-full opacity-0 pointer-events-none transition-all duration-300 " +
    "rounded-t-[20px] border border-b-0 border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl px-5 pt-3 pb-5 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]";
  sheet.innerHTML = `
    <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20"></div>
    <div class="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/50 text-center font-display">Departments</div>
    <div class="grid grid-cols-3 gap-3">${tiles}</div>`;

  document.body.append(overlay, sheet);

  const bar = toggle.closest(".fixed");
  const icon = toggle.querySelector(".material-symbols-outlined");

  function place() {
    sheet.style.bottom = (bar ? bar.offsetHeight : 0) + "px";
  }

  function setOpen(open) {
    place();
    toggle.setAttribute("aria-expanded", String(open));
    if (icon) icon.textContent = open ? "close" : "grid_view";
    toggle.classList.toggle("text-primary", open);
    for (const el of [overlay, sheet]) {
      el.classList.toggle("opacity-0", !open);
      el.classList.toggle("pointer-events-none", !open);
    }
    sheet.classList.toggle("translate-y-full", !open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  overlay.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false);
  });
  window.addEventListener("resize", place);
})();
