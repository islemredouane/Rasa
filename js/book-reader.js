// Library pages: "Read" opens the book inside the site, in a full-screen reader overlay,
// instead of sending the visitor to Google Drive in a new tab.
//   - Works with any link to a Google Drive file (drive.google.com/file/d/<id>/...).
//   - The Drive file must be shared as "Anyone with the link" (it already is for the books).
//   - Close with ✕, Esc, or the browser's Back button. Without JavaScript the links still work.
(function () {
  const DRIVE_FILE = /^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/;
  const links = [...document.querySelectorAll("a[href]")].filter((a) => DRIVE_FILE.test(a.href));
  if (!links.length) return;

  const rtl = document.documentElement.dir === "rtl";
  const overlay = document.createElement("div");
  overlay.id = "bookReader";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "bookReaderTitle");
  overlay.className = "fixed inset-0 z-[100] hidden flex-col bg-black/95 backdrop-blur-sm";
  overlay.innerHTML = `
    <div class="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-white/10 bg-black/60">
      <span class="material-symbols-outlined text-primary text-[26px] shrink-0">menu_book</span>
      <div class="flex-1 min-w-0">
        <p id="bookReaderTitle" class="text-white font-bold font-display truncate"></p>
        <p id="bookReaderAuthor" class="text-primary text-[11px] uppercase tracking-widest font-semibold truncate"></p>
      </div>
      <a id="bookReaderOpen" target="_blank" rel="noopener" title="Open in Google Drive"
        class="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-white/15 hover:border-primary hover:text-primary text-white/80 text-xs font-bold transition">
        <span class="material-symbols-outlined text-[18px]">open_in_new</span>Open in Drive
      </a>
      <a id="bookReaderDownload" target="_blank" rel="noopener" title="Download"
        class="inline-flex items-center justify-center gap-1.5 h-10 px-3 sm:px-4 rounded-full bg-primary hover:bg-orange-500 text-black text-xs font-bold transition">
        <span class="material-symbols-outlined text-[18px]">download</span><span class="hidden sm:inline">Download</span>
      </a>
      <button type="button" id="bookReaderClose" aria-label="Close the book"
        class="size-10 shrink-0 rounded-full bg-white/10 hover:bg-primary text-white flex items-center justify-center transition">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="relative flex-1 bg-[#111]">
      <div id="bookReaderLoading" class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-white/60 text-sm">
        <span class="material-symbols-outlined text-primary text-[40px] animate-pulse">auto_stories</span>
        Opening the book…
      </div>
      <iframe id="bookReaderFrame" title="Book reader" class="relative w-full h-full border-0" allow="autoplay; fullscreen" allowfullscreen></iframe>
    </div>`;
  if (rtl) overlay.querySelector("div").dir = "rtl";
  document.body.append(overlay);

  const frame = overlay.querySelector("#bookReaderFrame");
  const loading = overlay.querySelector("#bookReaderLoading");
  const titleEl = overlay.querySelector("#bookReaderTitle");
  const authorEl = overlay.querySelector("#bookReaderAuthor");
  const openEl = overlay.querySelector("#bookReaderOpen");
  const downloadEl = overlay.querySelector("#bookReaderDownload");
  const closeBtn = overlay.querySelector("#bookReaderClose");
  // (style, not the hidden attribute: Tailwind's `flex` class would override [hidden])
  frame.addEventListener("load", () => frame.getAttribute("src") && (loading.style.display = "none"));

  let opener = null;

  // The book's card: the nearest ancestor that contains a title (h3).
  function cardOf(link) {
    let el = link.parentElement;
    while (el && el !== document.body && !el.querySelector("h3")) el = el.parentElement;
    return el && el !== document.body ? el : null;
  }

  function open(link) {
    const id = link.href.match(DRIVE_FILE)[1];
    const card = cardOf(link);
    titleEl.textContent = card?.querySelector("h3")?.textContent.trim() || "Book";
    authorEl.textContent = card?.querySelector("h3 + p")?.textContent.trim() || "";
    openEl.href = link.href;
    const dl = card?.querySelector('a[href*="export=download"]');
    downloadEl.href = dl ? dl.href : `https://drive.google.com/uc?export=download&id=${id}`;
    loading.style.display = "";
    frame.src = `https://drive.google.com/file/d/${id}/preview`;
    opener = link;
    overlay.classList.remove("hidden");
    overlay.classList.add("flex");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
    history.pushState({ bookReader: true }, "");
  }

  function close(fromHistory) {
    if (overlay.classList.contains("hidden")) return;
    overlay.classList.add("hidden");
    overlay.classList.remove("flex");
    frame.removeAttribute("src");
    document.body.style.overflow = "";
    opener?.focus();
    if (!fromHistory && history.state?.bookReader) history.back();
  }

  for (const link of links) {
    link.addEventListener("click", (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return; // let "open in new tab" work
      e.preventDefault();
      open(link);
    });
  }
  closeBtn.addEventListener("click", () => close(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close(false);
  });
  // Back button (or swipe back on phones) closes the reader instead of leaving the page.
  window.addEventListener("popstate", () => close(true));
})();
