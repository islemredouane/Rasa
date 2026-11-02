// 1 November quiz: 10 questions about the Algerian war of liberation, operated from a big screen.
// To change a question, edit QUESTIONS below. `answer` is the index of the right option in `options`.
(() => {
  const SECONDS = 30; // time per question
  const RING = 97.4; // circumference of the r=15.5 progress circles

  const QUESTIONS = [
    {
      q: "في أي تاريخ بالضبط اندلعت الثورة التحريرية الجزائرية؟",
      options: ["8 ماي 1945", "1 نوفمبر 1954", "20 أوت 1955", "19 مارس 1962"],
      answer: 1,
      note: "اندلعت الثورة في منتصف الليل بين 31 أكتوبر و1 نوفمبر 1954 بعمليات مسلحة منسّقة في عدة مناطق من البلاد في آنٍ واحد.",
    },
    {
      q: "كم كان عدد المناضلين الذين اجتمعوا سراً في جوان 1954 وقرروا تفجير الثورة؟",
      options: ["6 مناضلين", "9 مناضلين", "22 مناضلاً", "54 مناضلاً"],
      answer: 2,
      note: "عُرف هذا الاجتماع بـ«مجموعة 22»، وانعقد بحي المدنية (كلوس صالمبي) بالعاصمة، ومنه تشكّلت «مجموعة الستة» التي أشرفت على التحضير للثورة وحدّدت موعد الاندلاع.",
    },
    {
      q: "من قاد هجومات الشمال القسنطيني الشعبية في 20 أوت 1955؟",
      options: ["عميروش آيت حمودة", "زيغود يوسف", "سي الحواس", "علي لابوانت"],
      answer: 1,
      note: "قاد زيغود يوسف هذه الهجومات الواسعة التي أخرجت الثورة من طابعها الريفي وربطتها بالشعب الجزائري في المدن والأرياف على حدٍّ سواء.",
    },
    {
      q: "من صاحب المقولة الشهيرة: «ألقوا بالثورة إلى الشارع، سيحتضنها الشعب»؟",
      options: ["أحمد زبانة", "ديدوش مراد", "العربي بن مهيدي", "محمد بوضياف"],
      answer: 2,
      note: "تُنسب هذه المقولة الخالدة إلى العربي بن مهيدي، أحد القادة الستة وقائد المنطقة الخامسة (وهران)، الذي اعتُقل واستشهد في ظروف غامضة سنة 1957.",
    },
    {
      q: "من ترأس الحكومة المؤقتة للجمهورية الجزائرية لحظة إعلانها في 19 سبتمبر 1958؟",
      options: ["أحمد بن بلة", "فرحات عباس", "بن يوسف بن خدة", "حسين آيت أحمد"],
      answer: 1,
      note: "أُعلن عن الحكومة المؤقتة بالقاهرة يوم 19 سبتمبر 1958، وكان فرحات عباس أول رئيس لها، قبل أن يخلفه بن يوسف بن خدة لاحقاً.",
    },
    {
      q: "أين كُتبت كلمات النشيد الوطني الجزائري «قسماً» لأول مرة؟",
      options: ["في المهجر بالقاهرة", "في سجن بربروس بالجزائر العاصمة", "في مؤتمر الصومام بوادي الصومام", "في تونس العاصمة"],
      answer: 1,
      note: "كتب الشاعر مفدي زكريا كلمات «قسماً» داخل سجن بربروس (سركاجي) بالجزائر العاصمة وقيل إنه كتبها بدمه على الجدران. وضع لها الموسيقى لاحقاً المؤلف المصري محمد الفوزي.",
    },
    {
      q: "في 22 أكتوبر 1956، اعترض الجيش الفرنسي طائرة مدنية مغربية واعتقل خمسة قادة من جبهة التحرير. من كان ضمن القادة المعتقلين؟",
      options: ["العربي بن مهيدي", "أحمد بن بلة", "كريم بلقاسم", "عبان رمضان"],
      answer: 1,
      note: "بن بلة وبوضياف وآيت أحمد وخيضر والأشرف كانوا على متن طائرة DC-3 من الرباط إلى تونس، فأجبرها الجيش الفرنسي على الهبوط بالجزائر. تُعدّ هذه أول عملية قرصنة جوية مدنية في التاريخ الحديث.",
    },
    {
      q: "ما المبدأ الجوهري الذي أرسى عبان رمضان في مؤتمر الصومام 1956 وأثار صراعاً داخلياً حاداً؟",
      options: ["أولوية الكفاح المسلح على العمل السياسي", "أولوية السياسي على العسكري وأولوية الداخل على الخارج", "توحيد القيادة في يد الحكومة المؤقتة بالقاهرة", "تفويض القيادة الكاملة لجيش التحرير الوطني"],
      answer: 1,
      note: "أرسى عبان رمضان مبدأَي «أولوية السياسي على العسكري» و«أولوية الداخل على الخارج»، مما أثار حفيظة قادة الخارج وأسهم في الصراعات الداخلية التي أودت بحياته لاحقاً.",
    },
    {
      q: "كيف موّلت جبهة التحرير الوطني عملياتها في السنوات الأولى من الثورة قبل تدفق الدعم العربي الكبير؟",
      options: ["بيع الأراضي الزراعية في الريف الجزائري", "«ضريبة الثورة» المفروضة على المهاجرين الجزائريين في فرنسا", "القروض المصرفية عبر وسطاء سويسريين", "مصادرة أموال المستوطنين الفرنسيين في الجزائر"],
      answer: 1,
      note: "كان كل مهاجر جزائري في فرنسا ملزماً بدفع «ضريبة الثورة» تحت إشراف شبكات جبهة التحرير، مما وفّر تمويلاً ضخماً مبكراً لشراء السلاح من السوق السوداء الأوروبية.",
    },
    {
      q: "ما اسم الحاجز الكهربائي المحصّن الذي أقامته فرنسا عام 1957 على الحدود التونسية لعزل جيش التحرير الوطني؟",
      options: ["خط شال", "خط موريس", "خط ماجينو", "خط لاكوست"],
      answer: 1,
      note: "خط موريس (Ligne Morice) سُمّي باسم وزير الدفاع الفرنسي أندريه موريس؛ سياج كهربائي بـ5000 فولت وطوله 460 كلم على الحدود التونسية، مدعوم بحقول ألغام وأجهزة رادار لعزل إمدادات السلاح عن الداخل.",
    },
  ];

  const LETTERS = ["أ", "ب", "ج", "د"];
  const $ = (sel) => document.querySelector(sel);
  const screens = { start: $('[data-screen="start"]'), quiz: $('[data-screen="quiz"]'), result: $('[data-screen="result"]') };
  const el = {
    num: $("[data-q-num]"), total: $("[data-q-total]"), score: $("[data-score]"), segs: $("[data-segs]"),
    left: $("[data-top-left]"), right: $("[data-top-right]"),
    timerBox: $("[data-timer-box]"), timer: $("[data-timer]"), ring: $("[data-timer-ring]"),
    question: $("[data-question]"), options: $("[data-options]"),
    slot: $("[data-slot]"), fbTitle: $("[data-fb-title]"), fbText: $("[data-fb-text]"),
    next: $("[data-next]"), nextLabel: $("[data-next-label]"),
  };
  el.total.textContent = QUESTIONS.length;
  el.segs.innerHTML = QUESTIONS.map(() => "<span></span>").join("");

  let index, correct, results, locked, deadline, tick, shuffled;

  // ---------- sound (synthesised in the browser, no audio files) ----------
  let audio = null, muted = false;
  const ctx = () => {
    if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } }
    if (audio.state === "suspended") audio.resume();
    return audio;
  };
  function tone(freq, at, dur, type = "triangle", vol = 0.22, slideTo) {
    const a = ctx();
    if (!a || muted) return;
    const t = a.currentTime + at;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  const sounds = {
    right: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.32)),
    wrong: () => { tone(220, 0, 0.32, "sawtooth", 0.16, 110); tone(165, 0.22, 0.45, "sawtooth", 0.16, 82); },
    win: () => [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(f, i * 0.13, i === 6 ? 0.9 : 0.28, "triangle", 0.25)),
    done: () => [392, 330, 262].forEach((f, i) => tone(f, i * 0.18, 0.4, "triangle", 0.18)),
    tick: () => tone(880, 0, 0.06, "square", 0.05),
  };

  // ---------- confetti ----------
  const cv = $("#fx"), c2 = cv.getContext("2d");
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#ea6a1f", "#ffb74d", "#ffffff", "#22c55e", "#fde68a"];
  let parts = [], raf = 0, dpr = 1;
  function sizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    c2.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  function burst(x, y, n, { spread = Math.PI * 2, angle = -Math.PI / 2, power = 1 } = {}) {
    if (still) return;
    const unit = remPx();
    for (let i = 0; i < n; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = (0.5 + Math.random()) * 1.3 * unit * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        w: (0.5 + Math.random() * 0.6) * unit * 0.7, h: (0.3 + Math.random() * 0.4) * unit * 0.7, c: COLORS[(Math.random() * COLORS.length) | 0], life: 1 });
    }
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function frame() {
    c2.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40);
    for (const p of parts) {
      p.vy += 0.045 * remPx(); p.vx *= 0.985; p.vy *= 0.985;
      p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.006;
      c2.save(); c2.translate(p.x, p.y); c2.rotate(p.r); c2.globalAlpha = Math.max(0, Math.min(1, p.life * 2));
      c2.fillStyle = p.c; c2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c2.restore();
    }
    raf = parts.length ? requestAnimationFrame(frame) : 0;
    if (!raf) c2.clearRect(0, 0, innerWidth, innerHeight);
  }

  // ---------- feedback on an answer ----------
  const flashEl = $("[data-flash]");
  function flash(kind) { flashEl.className = "flash"; void flashEl.offsetWidth; flashEl.classList.add(kind); }
  function shakeSlide() { const s = $(".slide"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake"); }
  function react(ok, tile) {
    if (ok) {
      sounds.right();
      flash("ok");
      const r = tile.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 90, { power: 1.15 });
      el.score.classList.remove("bump"); void el.score.offsetWidth; el.score.classList.add("bump");
    } else {
      sounds.wrong();
      flash("bad");
      shakeSlide();
    }
  }
  const muteBtn = $("[data-mute]");
  function toggleMute() {
    muted = !muted;
    muteBtn.querySelector(".material-symbols-outlined").textContent = muted ? "volume_off" : "volume_up";
    if (!muted) sounds.tick();
  }

  const shuffle = (list) => {
    const a = list.map((v, i) => [v, i]);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a; // [[text, originalIndex], ...]
  };

  const show = (name) => {
    for (const [k, s] of Object.entries(screens)) s.classList.toggle("on", k === name);
    const playing = name === "quiz";
    el.left.classList.toggle("hide", !playing);
    el.right.classList.toggle("hide", !playing);
    el.segs.classList.toggle("off", !playing);
  };

  // Shrink text a little until it fits its box, so a long question, answer or note never overflows the slide.
  const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize);
  function fit(node, boxHeightRem, minRem) {
    node.style.fontSize = "";
    let size = parseFloat(getComputedStyle(node).fontSize) / remPx();
    while (node.getBoundingClientRect().height > boxHeightRem * remPx() && size > minRem) {
      size *= 0.95;
      node.style.fontSize = size + "rem";
    }
  }
  const fitQuestion = () => fit(el.question, 9.6, 2.2);
  const fitOptions = () => [...el.options.querySelectorAll(".txt")].forEach((n) => fit(n, 5.6, 1.5));
  const fitNote = () => { fit(el.fbText, 5.0, 1.2); };

  const paintSegs = () => {
    [...el.segs.children].forEach((s, i) => {
      s.className = i < results.length ? (results[i] ? "ok" : "bad") : i === index && !locked ? "now" : "";
    });
  };

  function start() {
    index = 0; correct = 0; results = [];
    el.score.textContent = "0";
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    const item = QUESTIONS[index];
    locked = false;
    el.num.textContent = index + 1;
    el.question.textContent = item.q;
    el.slot.className = "slot";
    el.options.classList.remove("answered");
    el.timerBox.classList.remove("low");
    shuffled = shuffle(item.options);
    el.options.innerHTML = "";
    shuffled.forEach(([text], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt";
      b.innerHTML = `<span class="ltr"></span><span class="txt"></span><span class="mk material-symbols-outlined"></span>`;
      b.children[0].textContent = LETTERS[i];
      b.children[1].textContent = text;
      b.addEventListener("click", () => answer(i));
      el.options.append(b);
    });
    paintSegs();
    fitQuestion();
    fitOptions();
    startTimer();
  }

  let lastTick = 0;
  function startTimer() {
    clearInterval(tick);
    lastTick = 0;
    deadline = Date.now() + SECONDS * 1000;
    const draw = () => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      el.timer.textContent = Math.ceil(left);
      el.ring.style.strokeDashoffset = String(RING * (1 - left / SECONDS));
      el.ring.style.stroke = left <= 5 ? "#ef4444" : "#ea6a1f";
      el.timerBox.classList.toggle("low", left <= 5 && left > 0);
      if (left <= 5 && left > 0 && Math.ceil(left) !== lastTick) { lastTick = Math.ceil(left); sounds.tick(); }
      if (left <= 0) { clearInterval(tick); answer(-1); }
    };
    draw();
    tick = setInterval(draw, 100);
  }

  function answer(choice) {
    if (locked) return;
    locked = true;
    clearInterval(tick);
    el.timerBox.classList.remove("low");
    const item = QUESTIONS[index];
    const picked = choice >= 0 ? shuffled[choice][1] : -1;
    const ok = picked === item.answer;
    if (ok) correct++;
    results.push(ok);
    el.score.textContent = correct;

    [...el.options.children].forEach((b, i) => {
      b.disabled = true;
      const isRight = shuffled[i][1] === item.answer;
      const mark = b.querySelector(".mk");
      if (isRight) { b.classList.add("right"); mark.textContent = "check_circle"; }
      else if (i === choice) { b.classList.add("wrong"); mark.textContent = "cancel"; }
      else b.classList.add("dim");
    });

    react(ok, el.options.children[ok ? shuffled.findIndex(([, o]) => o === item.answer) : 0]);
    el.fbTitle.textContent = ok ? "إجابة صحيحة!" : choice < 0 ? "انتهى الوقت!" : "إجابة خاطئة";
    el.fbText.textContent = item.note;
    el.slot.className = "slot done " + (ok ? "good" : "bad");
    el.options.classList.add("answered");
    el.nextLabel.textContent = index === QUESTIONS.length - 1 ? "اعرض النتيجة" : "السؤال التالي";
    paintSegs();
    fitNote();
    el.next.focus({ preventScroll: true });
  }

  function finish() {
    const n = QUESTIONS.length;
    const tiers = [
      [n, "علامة كاملة! ذاكرة تاريخية لا تخطئ", "أحسنتم، أنتم أوفياء لذاكرة الثورة التحريرية وتاريخ الجزائر."],
      [8, "أداء متميّز", "إلمامكم بتاريخ الثورة التحريرية يستحق كل التقدير."],
      [5, "نتيجة جيدة", "لديكم قاعدة معرفية طيبة عن الثورة، وفي تاريخنا دائماً ما يستحق الاكتشاف."],
      [0, "محاولة مشرّفة", "تاريخ ثورتنا غني بالتفاصيل، والإلمام به مسؤولية نتشاركها جميعاً."],
    ];
    const [, title, text] = tiers.find(([min]) => correct >= min);
    $("[data-result-correct]").textContent = correct;
    $("[data-result-title]").textContent = title;
    $("[data-result-text]").textContent = text;
    $("[data-result-dots]").innerHTML = results.map((ok) => `<span class="${ok ? "ok" : "bad"}"></span>`).join("");
    const ring = $("[data-result-ring]");
    ring.style.strokeDashoffset = String(RING);
    show("result");
    if (correct >= 8) {
      sounds.win(); flash("ok");
      burst(innerWidth * 0.12, innerHeight * 0.95, 110, { angle: -Math.PI / 3, spread: 0.9, power: 1.9 });
      burst(innerWidth * 0.88, innerHeight * 0.95, 110, { angle: (-2 * Math.PI) / 3, spread: 0.9, power: 1.9 });
    } else if (correct >= 5) { sounds.right(); burst(innerWidth / 2, innerHeight * 0.4, 60); }
    else sounds.done();
    requestAnimationFrame(() => requestAnimationFrame(() => (ring.style.strokeDashoffset = String(RING * (1 - correct / n)))));
  }

  muteBtn.addEventListener("click", toggleMute);
  // ---------- fullscreen ----------
  const fsBtn = $("[data-fullscreen]");
  const fsIcon = fsBtn.querySelector(".material-symbols-outlined");
  function updateFsIcon() {
    const inFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    fsIcon.textContent = inFs ? "fullscreen_exit" : "fullscreen";
    fsBtn.title = inFs ? "خروج من الشاشة الكاملة (F)" : "شاشة كاملة (F)";
    fsBtn.setAttribute("aria-label", fsBtn.title);
  }
  function toggleFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    } else {
      const el = document.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    }
  }
  fsBtn.addEventListener("click", toggleFullscreen);
  document.addEventListener("fullscreenchange", updateFsIcon);
  document.addEventListener("webkitfullscreenchange", updateFsIcon);
  $("[data-start]").addEventListener("click", () => { ctx(); start(); });
  el.next.addEventListener("click", () => { index++; index < QUESTIONS.length ? renderQuestion() : finish(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "m" || e.key === "M") { toggleMute(); return; }
    if (e.key === "f" || e.key === "F") { toggleFullscreen(); return; }
    if (screens.start.classList.contains("on") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ctx(); start(); return; }
    if (screens.result.classList.contains("on") && (e.key === "r" || e.key === "R")) { show("start"); return; } // host shortcut: back to the start screen
    if (!screens.quiz.classList.contains("on")) return;
    if (!locked && /^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
    else if (locked && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); el.next.click(); }
  });
  show("start");
  document.fonts?.ready.then(() => { if (screens.quiz.classList.contains("on")) { fitQuestion(); fitOptions(); } });
})();
