// Renders RASA events from data/events.js (in the browser, and in scripts/build.mjs for pre-rendering) into:
//   [data-events-upcoming]  upcoming events (events page)
//   [data-events-seasons]   one timeline per season (events page)
//   [data-events-home]      homepage teaser: next event (if any) + highlights
(function () {
  const data = window.RASA_EVENTS;
  if (!data) return;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const isExternal = (href) => /^https?:\/\//.test(href);

  function linkButton(link, primary) {
    if (!link) return "";
    const ext = isExternal(link.href) ? ' target="_blank" rel="noopener"' : "";
    const cls = primary
      ? "bg-primary hover:bg-orange-500 text-black hover:shadow-[0_0_24px_rgba(234,106,31,0.45)]"
      : "border border-white/15 hover:border-primary hover:text-primary text-white";
    return `<a href="${esc(link.href)}"${ext}
      class="inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-bold font-display transition-all ${cls}">
      ${esc(link.label)}<span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>`;
  }

  function media(e, sizeClass) {
    // The icon shows while the photo loads (or if it fails) and is removed once the photo is in.
    const fallback = `<span data-fallback class="material-symbols-outlined text-primary/70 ${sizeClass}">${esc(e.icon || "event")}</span>`;
    // "contain" images (logos, mascot on black) blend into the card instead of showing a dark box
    const fit = e.coverFit === "contain" ? "object-contain p-4 mix-blend-lighten" : "object-cover";
    const pos = e.coverPosition ? ` style="object-position: ${esc(e.coverPosition)}"` : "";
    const img = e.cover
      ? `<img src="${esc(e.cover)}" alt="${esc(e.title)}" loading="lazy" decoding="async"
           class="absolute inset-0 w-full h-full ${fit} transition-transform duration-700 group-hover:scale-105"${pos}
           onload="this.parentElement.querySelector('[data-fallback]')?.remove()"
           onerror="this.remove()"/>`
      : "";
    return fallback + img;
  }

  function card(e, n) {
    const tags = (e.tags || [])
      .map((t) => `<span class="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300">${esc(t)}</span>`)
      .join("");
    return `
      <article id="event-${esc(e.id)}" class="group glass-card rounded-3xl overflow-hidden flex flex-col scroll-mt-28">
        <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 via-white/[0.03] to-transparent flex items-center justify-center">
          ${media(e, "text-[64px]")}
          <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur text-white text-xs font-bold">${esc(e.date)}</span>
          ${n ? `<span class="absolute top-4 right-4 size-9 rounded-full bg-primary text-black text-sm font-bold font-display flex items-center justify-center">${String(n).padStart(2, "0")}</span>` : ""}
        </div>
        <div class="p-6 flex flex-col flex-1">
          <div class="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-widest">
            <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>${esc(e.place)}
          </div>
          <h3 class="mt-2 text-white font-bold text-xl font-display leading-snug">${esc(e.title)}</h3>
          <p class="mt-2 text-gray-400 text-sm leading-relaxed flex-1">${esc(e.summary)}</p>
          ${tags ? `<div class="mt-4 flex flex-wrap gap-2">${tags}</div>` : ""}
          ${e.stat || e.link ? `<div class="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            ${e.stat ? `<span class="inline-flex items-center gap-1.5 text-primary text-sm font-bold"><span class="material-symbols-outlined text-[18px]">trending_up</span>${esc(e.stat)}</span>` : "<span></span>"}
            ${e.link ? `<a href="${esc(e.link.href)}"${isExternal(e.link.href) ? ' target="_blank" rel="noopener"' : ""} class="inline-flex items-center gap-1 text-sm font-bold text-white hover:text-primary transition-colors">${esc(e.link.label)}<span class="material-symbols-outlined text-[18px]">arrow_forward</span></a>` : ""}
          </div>` : ""}
        </div>
      </article>`;
  }

  function upcomingCard(e) {
    return `
      <article class="group glass-card rounded-[2rem] overflow-hidden grid grid-cols-1 lg:grid-cols-5 border border-primary/30 shadow-[0_0_40px_rgba(234,106,31,0.12)]">
        <div class="relative lg:col-span-2 min-h-[220px] overflow-hidden bg-gradient-to-br from-primary/30 via-primary/5 to-transparent flex items-center justify-center">
          ${media(e, "text-[88px]")}
        </div>
        <div class="lg:col-span-3 p-7 sm:p-10 flex flex-col justify-center">
          <div class="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-bold tracking-[0.25em] uppercase">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Upcoming
          </div>
          <h3 class="mt-4 text-3xl sm:text-4xl font-display font-bold text-white">${esc(e.title)}</h3>
          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-gray-300 text-sm">
            <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[18px]">calendar_month</span>${esc(e.date)}</span>
            <span class="inline-flex items-center gap-1.5"><span class="material-symbols-outlined text-primary text-[18px]">location_on</span>${esc(e.place)}</span>
          </div>
          <p class="mt-4 text-gray-400 leading-relaxed">${esc(e.summary)}</p>
          ${e.link ? `<div class="mt-6">${linkButton(e.link, true)}</div>` : ""}
        </div>
      </article>`;
  }

  // ----- Page sections (also used by scripts/build.mjs to pre-render the HTML) -----
  function upcomingHTML() {
    return data.upcoming.length
      ? data.upcoming.map(upcomingCard).join("")
      : `<p class="text-center text-gray-400">No event announced yet. Follow <a class="text-primary font-bold" href="https://www.instagram.com/rasa.estin/" target="_blank" rel="noopener">@rasa.estin</a> to be the first to know.</p>`;
  }

  function seasonsHTML() {
    return data.seasons
      .map(
        (s) => `
        <section id="season-${esc(s.id)}" class="scroll-mt-28">
          <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <h2 class="text-3xl sm:text-4xl font-display font-bold text-white">${esc(s.title)}</h2>
              <div class="mt-3 h-1 w-16 bg-primary rounded-full"></div>
              ${s.intro ? `<p class="mt-4 text-gray-400 max-w-2xl">${esc(s.intro)}</p>` : ""}
            </div>
            <span class="text-sm text-gray-500 uppercase tracking-widest">${s.events.length} ${s.events.length === 1 ? "activity" : "activities"}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            ${s.events.map((e, i) => card(e, i + 1)).join("")}
          </div>
        </section>`
      )
      .join("");
  }

  function homeHTML() {
    const next = data.upcoming[0];
    const highlights = data.seasons.flatMap((s) => s.events.filter((e) => e.highlight)).slice(0, 3);
    return `
      ${next ? upcomingCard(next) : ""}
      ${highlights.length ? `
        <div class="${next ? "mt-14 " : ""}flex items-end justify-between gap-4 mb-8">
          <h3 class="text-2xl sm:text-3xl font-display font-bold text-white">Highlights</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">${highlights.map((e) => card(e)).join("")}</div>` : ""}
      <div class="mt-8 md:mt-10 flex justify-center">
        <a href="/events" class="inline-flex items-center gap-2 h-14 px-10 rounded-full bg-white text-black hover:bg-primary hover:text-white font-bold font-display transition-all hover:shadow-[0_0_24px_rgba(234,106,31,0.45)]">
          See all events<span class="material-symbols-outlined text-[20px]">arrow_forward</span>
        </a>
      </div>`;
  }

  window.RasaEvents = { upcomingHTML, seasonsHTML, homeHTML };
  if (typeof document === "undefined") return; // running in the build script

  // The HTML is pre-rendered at build time for crawlers; the browser re-renders it from the latest data.
  const fill = (selector, html) => {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html();
  };
  fill("[data-events-upcoming]", upcomingHTML);
  fill("[data-events-seasons]", seasonsHTML);
  fill("[data-events-home]", homeHTML);
})();
