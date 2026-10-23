// Rasa PWA: registers the service worker and offers to install the app.
//   Chrome / Edge / Android: a small "Install the Rasa app" card when the browser allows it.
//   iPhone / iPad Safari: a one-time tip (Share → Add to Home Screen), since iOS has no install prompt.
// Dismissing the card hides it for 14 days. Nothing is shown inside the installed app.
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => console.warn("Service worker not registered:", err));
    });
  }

  const DISMISS_KEY = "rasa-install-dismissed";
  const DISMISS_DAYS = 14;

  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (standalone) return;

  function dismissedRecently() {
    try {
      const t = Number(localStorage.getItem(DISMISS_KEY));
      return t && Date.now() - t < DISMISS_DAYS * 864e5;
    } catch {
      return false;
    }
  }
  function rememberDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* storage unavailable: the card simply shows again next visit */
    }
  }

  let card = null;

  function bottomOffset() {
    const bar = document.querySelector("[data-nav-row]")?.closest(".fixed");
    const visible = bar && getComputedStyle(bar).display !== "none";
    // the bar floats above the bottom edge, so measure from its top, not from its height
    return (visible ? Math.round(window.innerHeight - bar.getBoundingClientRect().top) : 0) + 12;
  }

  function showCard({ title, text, action }) {
    if (card || dismissedRecently()) return;
    card = document.createElement("div");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", title);
    card.className =
      "fixed z-[60] left-4 right-4 mx-auto max-w-[22rem] md:mx-0 md:max-w-none md:left-auto md:right-6 md:w-[360px] glass-panel rounded-2xl p-4 flex items-center gap-3 " +
      "border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] bg-black/80 backdrop-blur-xl " +
      "transition-all duration-300 opacity-0 translate-y-4";
    card.style.bottom = bottomOffset() + "px";
    card.innerHTML = `
      <img src="/icons/icon-192.png" alt="" class="size-12 rounded-xl shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-white font-bold text-sm">${title}</p>
        <p class="text-white/60 text-xs leading-snug mt-0.5">${text}</p>
      </div>
      ${action ? `<button type="button" data-install class="shrink-0 h-9 px-4 rounded-full bg-primary hover:bg-orange-500 text-black text-sm font-bold transition">${action}</button>` : ""}
      <button type="button" data-close aria-label="Close" class="shrink-0 size-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 flex items-center justify-center transition">
        <span class="material-symbols-outlined text-[20px]">close</span>
      </button>`;
    document.body.append(card);
    requestAnimationFrame(() => card.classList.remove("opacity-0", "translate-y-4"));
    card.querySelector("[data-close]").addEventListener("click", () => {
      rememberDismiss();
      hideCard();
    });
    window.addEventListener("resize", () => card && (card.style.bottom = bottomOffset() + "px"));
    return card;
  }

  function hideCard() {
    if (!card) return;
    const el = card;
    card = null;
    el.classList.add("opacity-0", "translate-y-4");
    setTimeout(() => el.remove(), 300);
  }

  // Chrome, Edge, Samsung Internet, Android
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const el = showCard({
      title: "Install the Rasa app",
      text: "Events, the board and every department, one tap away. Works offline.",
      action: "Install",
    });
    el?.querySelector("[data-install]")?.addEventListener("click", async () => {
      hideCard();
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
  });
  window.addEventListener("appinstalled", hideCard);

  // iPhone / iPad Safari
  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
  if (isIOS && isSafari) {
    window.addEventListener("load", () =>
      setTimeout(
        () =>
          showCard({
            title: "Add Rasa to your Home Screen",
            text: "Tap the Share button, then “Add to Home Screen”.",
          }),
        2500
      )
    );
  }
})();
