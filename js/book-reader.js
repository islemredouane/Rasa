// Library pages: books open in an in-page reader instead of a new Google Drive tab.
//
//   - Any link to a Google Drive file (drive.google.com/file/d/<id>/...) opens the reader;
//     clicking a book's cover does too. Ctrl/⌘/middle-click still opens Drive in a new tab,
//     and without JavaScript the links work as plain links.
//   - Desktop: a floating panel over a blurred backdrop. Phone: a full-screen sheet.
//   - Header: cover, title, author, Open in Drive, fullscreen, Download, close.
//   - Close with ✕, Esc, a click on the backdrop, or the browser's Back button.
//   - The Drive file must be shared as "Anyone with the link".
(function () {
  const DRIVE_FILE = /^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/;
  const links = [...document.querySelectorAll("a[href]")].filter((a) => DRIVE_FILE.test(a.href));
  if (!links.length) return;

  // Keyframes for the loading bar (Tailwind has no indeterminate-progress animation).
  const style = document.createElement("style");
  style.textContent = `
    @keyframes rasa-reader-bar { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
    .rasa-reader-bar { animation: rasa-reader-bar 1.3s cubic-bezier(.4,0,.2,1) infinite; }
    @media (prefers-reduced-motion: reduce) { .rasa-reader-bar { animation: none; } #bookReader * { transition: none !important; } }`;
  document.head.append(style);

  const btn =
    "size-9 rounded-full inline-flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  const root = document.createElement("div");
  root.id = "bookReader";
  root.className = "fixed inset-0 z-[100] hidden items-end sm:items-center justify-center sm:p-6";
  root.innerHTML = `
    <div data-backdrop class="absolute inset-0 bg-black/75 backdrop-blur-xl opacity-0 transition-opacity duration-300"></div>

    <section data-panel role="dialog" aria-modal="true" aria-labelledby="bookReaderTitle"
      class="relative flex flex-col w-full sm:max-w-6xl h-[100dvh] sm:h-[92vh] overflow-hidden
             sm:rounded-[28px] border border-white/10 bg-[#0d0d0d]
             shadow-[0_40px_120px_rgba(0,0,0,0.85)]
             opacity-0 translate-y-8 sm:translate-y-4 sm:scale-[0.97] transition-all duration-300 ease-out">

      <header class="relative flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 border-b border-white/[0.07]
                     bg-gradient-to-b from-white/[0.05] to-transparent">
        <div data-cover class="hidden sm:block w-[72px] aspect-[16/10] shrink-0 rounded-lg bg-cover bg-center ring-1 ring-white/15 shadow-lg"></div>
        <span data-icon class="sm:hidden size-10 shrink-0 rounded-xl bg-primary/15 text-primary inline-flex items-center justify-center">
          <span class="material-symbols-outlined text-[22px]">auto_stories</span>
        </span>
        <div class="flex-1 min-w-0">
          <h2 id="bookReaderTitle" dir="auto" class="text-white font-display font-bold text-base sm:text-xl leading-tight truncate"></h2>
          <p id="bookReaderAuthor" dir="auto" class="mt-0.5 text-primary text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold truncate"></p>
        </div>

        <div class="hidden sm:flex items-center gap-0.5 p-1 rounded-full bg-white/[0.04] border border-white/10">
          <a data-open target="_blank" rel="noopener" class="${btn}" title="Open in Google Drive" aria-label="Open in Google Drive">
            <span class="material-symbols-outlined text-[19px]">open_in_new</span>
          </a>
          <button type="button" data-fullscreen class="${btn}" title="Full screen" aria-label="Full screen">
            <span class="material-symbols-outlined text-[20px]">fullscreen</span>
          </button>
        </div>
        <a data-download target="_blank" rel="noopener"
          class="inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-5 rounded-full bg-primary hover:bg-orange-500 text-black text-sm font-bold transition-all hover:shadow-[0_0_24px_rgba(234,106,31,0.45)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <span class="material-symbols-outlined text-[19px]">download</span><span class="hidden sm:inline">Download</span>
        </a>
        <button type="button" data-close aria-label="Close the book"
          class="size-10 shrink-0 rounded-full bg-white/10 hover:bg-white hover:text-black text-white inline-flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>

      <div class="relative flex-1 bg-[#202124]">
        <iframe data-frame title="Book" class="absolute inset-0 w-full h-full border-0" allow="fullscreen" allowfullscreen></iframe>

        <div data-loading class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-[#0d0d0d] overflow-hidden transition-opacity duration-500">
          <div data-blur class="absolute inset-0 bg-cover bg-center scale-125 blur-3xl opacity-25"></div>
          <div data-big-cover class="relative w-56 sm:w-72 aspect-[16/10] rounded-2xl bg-cover bg-center ring-1 ring-white/15 shadow-[0_30px_80px_rgba(0,0,0,0.7)]"></div>
          <div class="relative text-center px-6">
            <p class="text-white/50 text-xs uppercase tracking-[0.3em] font-semibold">Opening</p>
            <p data-loading-title dir="auto" class="mt-2 text-white font-display font-bold text-xl sm:text-2xl"></p>
          </div>
          <div class="relative h-1 w-40 rounded-full bg-white/10 overflow-hidden">
            <div class="rasa-reader-bar h-full w-2/5 rounded-full bg-primary"></div>
          </div>
        </div>
      </div>

      <footer class="hidden sm:flex items-center justify-center gap-2 py-2 border-t border-white/[0.06] text-[11px] text-white/35">
        <kbd class="px-1.5 py-0.5 rounded border border-white/15 font-sans">Esc</kbd> to close
        <span class="text-white/20">·</span> Reading in the Rasa library
      </footer>
    </section>`;
  document.body.append(root);

  const $ = (sel) => root.querySelector(sel);
  const backdrop = $("[data-backdrop]");
  const panel = $("[data-panel]");
  const frame = $("[data-frame]");
  const loading = $("[data-loading]");
  const titleEl = $("#bookReaderTitle");
  const authorEl = $("#bookReaderAuthor");
  const closeBtn = $("[data-close]");
  const fsBtn = $("[data-fullscreen]");

  let opener = null;
  let isOpen = false;

  // The book's card: nearest ancestor holding both the title and the cover image
  // (falls back to the nearest one holding the title).
  function cardOf(el) {
    let withTitle = null;
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      if (!node.querySelector("h3")) continue;
      withTitle ??= node;
      if (node.querySelector('[style*="background-image"]')) return node;
    }
    return withTitle;
  }
  const coverOf = (card) => card?.querySelector('[style*="background-image"]');

  function setCover(url) {
    for (const el of root.querySelectorAll("[data-cover],[data-blur],[data-big-cover]")) {
      el.style.backgroundImage = url || "";
    }
    $("[data-cover]").classList.toggle("sm:block", !!url);
    $("[data-icon]").classList.toggle("sm:hidden", !!url);
  }

  frame.addEventListener("load", () => {
    if (!frame.getAttribute("src")) return;
    loading.style.opacity = "0";
    setTimeout(() => isOpen && (loading.style.display = "none"), 500);
  });

  function open(link) {
    const id = link.href.match(DRIVE_FILE)[1];
    const card = cardOf(link);
    const title = card?.querySelector("h3")?.textContent.trim() || "Book";
    titleEl.textContent = title;
    $("[data-loading-title]").textContent = title;
    authorEl.textContent = card?.querySelector("h3 + p")?.textContent.trim() || "";
    setCover(coverOf(card)?.style.backgroundImage);
    $("[data-open]").href = link.href;
    const dl = card?.querySelector('a[href*="export=download"]');
    $("[data-download]").href = dl ? dl.href : `https://drive.google.com/uc?export=download&id=${id}`;

    loading.style.display = "";
    loading.style.opacity = "1";
    frame.src = `https://drive.google.com/file/d/${id}/preview`;

    opener = document.activeElement;
    isOpen = true;
    root.classList.remove("hidden");
    root.classList.add("flex");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        backdrop.classList.remove("opacity-0");
        panel.classList.remove("opacity-0", "translate-y-8", "sm:translate-y-4", "sm:scale-[0.97]");
      })
    );
    closeBtn.focus({ preventScroll: true });
    history.pushState({ bookReader: true }, "");
  }

  function close(fromHistory) {
    if (!isOpen) return;
    isOpen = false;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    backdrop.classList.add("opacity-0");
    panel.classList.add("opacity-0", "translate-y-8", "sm:translate-y-4", "sm:scale-[0.97]");
    setTimeout(() => {
      root.classList.add("hidden");
      root.classList.remove("flex");
      frame.removeAttribute("src");
    }, 300);
    document.body.style.overflow = "";
    opener?.focus?.({ preventScroll: true });
    if (!fromHistory && history.state?.bookReader) history.back();
  }

  const opensNewTab = (e) => e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1;
  for (const link of links) {
    link.addEventListener("click", (e) => {
      if (opensNewTab(e)) return;
      e.preventDefault();
      open(link);
    });
    // The cover of the book opens it too.
    const cover = coverOf(cardOf(link));
    if (cover && !cover.dataset.readerBound) {
      cover.dataset.readerBound = "1";
      cover.classList.add("cursor-pointer");
      cover.setAttribute("role", "button");
      cover.setAttribute("tabindex", "0");
      cover.setAttribute("aria-label", `Read ${cardOf(link)?.querySelector("h3")?.textContent.trim() || "this book"}`);
      cover.addEventListener("click", () => open(link));
      cover.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(link);
        }
      });
    }
  }

  closeBtn.addEventListener("click", () => close(false));
  backdrop.addEventListener("click", () => close(false));
  fsBtn.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else panel.requestFullscreen?.().catch(() => {});
  });
  document.addEventListener("fullscreenchange", () => {
    fsBtn.querySelector(".material-symbols-outlined").textContent = document.fullscreenElement ? "fullscreen_exit" : "fullscreen";
  });

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") return close(false);
    if (e.key === "Tab") {
      // keep keyboard focus inside the reader
      const items = [...panel.querySelectorAll("a[href],button,iframe")].filter((el) => el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener("popstate", () => close(true));
})();
