// 1 November quiz (quiz.html): 10 questions about the Algerian war of liberation.
// To change a question, edit QUESTIONS below. `answer` is the index of the right option in `options`.
(() => {
  const SECONDS = 20; // time per question
  const RING = 97.4; // circumference of the r=15.5 progress circles

  const QUESTIONS = [
    {
      q: "في أي تاريخ اندلعت الثورة التحريرية الجزائرية؟",
      options: ["8 ماي 1945", "1 نوفمبر 1954", "20 أوت 1955", "19 مارس 1962"],
      answer: 1,
      note: "اندلعت الثورة في منتصف الليل بين 31 أكتوبر و1 نوفمبر 1954 بعمليات مسلحة في عدة مناطق من البلاد.",
    },
    {
      q: "ما اسم الجبهة التي أُعلن عن ميلادها في بيان أول نوفمبر؟",
      options: ["جبهة التحرير الوطني", "حركة انتصار الحريات الديمقراطية", "جمعية العلماء المسلمين الجزائريين", "الاتحاد الديمقراطي للبيان الجزائري"],
      answer: 0,
      note: "أعلن بيان أول نوفمبر عن ميلاد جبهة التحرير الوطني وجناحها العسكري جيش التحرير الوطني.",
    },
    {
      q: "كم كان عدد المناضلين الذين اجتمعوا في جوان 1954 وقرروا تفجير الثورة؟",
      options: ["6", "9", "22", "30"],
      answer: 2,
      note: "عُرف هذا الاجتماع بـ«مجموعة 22»، وانعقد بحي المدنية (كلوس صالمبي) بالعاصمة، ومنه تشكّلت قيادة «مجموعة الستة» التي أشرفت على التحضير للثورة.",
    },
    {
      q: "من كان قائد منطقة الأوراس (المنطقة الأولى) عند اندلاع الثورة؟",
      options: ["مصطفى بن بولعيد", "ديدوش مراد", "كريم بلقاسم", "رابح بيطاط"],
      answer: 0,
      note: "كان مصطفى بن بولعيد قائد المنطقة الأولى (الأوراس) وأحد القادة الستة الذين فجّروا الثورة.",
    },
    {
      q: "من قاد هجومات الشمال القسنطيني في 20 أوت 1955؟",
      options: ["عميروش آيت حمودة", "زيغود يوسف", "سي الحواس", "علي لابوانت"],
      answer: 1,
      note: "قاد زيغود يوسف هذه الهجومات الشعبية، التي أخرجت الثورة من الأرياف وربطتها بالشعب أكثر.",
    },
    {
      q: "أين انعقد مؤتمر الصومام يوم 20 أوت 1956؟",
      options: ["جبال الأوراس (باتنة)", "وادي الصومام (بجاية)", "تلمسان", "قسنطينة"],
      answer: 1,
      note: "انعقد المؤتمر بوادي الصومام في ولاية بجاية، ووضع الأسس التنظيمية والسياسية للثورة.",
    },
    {
      q: "من صاحب المقولة الشهيرة: «ألقوا بالثورة إلى الشارع، سيحتضنها الشعب»؟",
      options: ["أحمد زبانة", "ديدوش مراد", "العربي بن مهيدي", "محمد بوضياف"],
      answer: 2,
      note: "تُنسب هذه المقولة إلى العربي بن مهيدي، قائد المنطقة الخامسة (وهران) وأحد القادة الستة، واستشهد سنة 1957.",
    },
    {
      q: "من هي المجاهدة التي حُكم عليها بالإعدام سنة 1957 وأصبحت رمزاً عالمياً للنضال ضد الاستعمار؟",
      options: ["حسيبة بن بوعلي", "جميلة بوحيرد", "زهرة ظريف", "فاطمة نسومر"],
      answer: 1,
      note: "جميلة بوحيرد اعتُقلت سنة 1957 وتعرضت للتعذيب وحُكم عليها بالإعدام، فتحرّك الرأي العام العالمي لنصرتها ولم يُنفَّذ الحكم، وأُفرج عنها مع الاستقلال سنة 1962.",
    },
    {
      q: "من ترأس الحكومة المؤقتة للجمهورية الجزائرية عند إعلانها في 19 سبتمبر 1958؟",
      options: ["أحمد بن بلة", "فرحات عباس", "بن يوسف بن خدة", "حسين آيت أحمد"],
      answer: 1,
      note: "أُعلن عن الحكومة المؤقتة بالقاهرة يوم 19 سبتمبر 1958، وكان فرحات عباس أول رئيس لها.",
    },
    {
      q: "ما هو تاريخ عيد الاستقلال الذي تحتفل به الجزائر؟",
      options: ["19 مارس 1962", "8 ماي 1962", "5 جويلية 1962", "1 نوفمبر 1962"],
      answer: 2,
      note: "بعد استفتاء تقرير المصير يوم 1 جويلية 1962 استعادت الجزائر سيادتها، وتحتفل بالاستقلال يوم 5 جويلية.",
    },
  ];

  const LETTERS = ["أ", "ب", "ج", "د"];
  const $ = (sel) => document.querySelector(sel);
  const screens = { start: $('[data-screen="start"]'), quiz: $('[data-screen="quiz"]'), result: $('[data-screen="result"]') };
  const el = {
    name: $("#playerName"), num: $("[data-q-num]"), total: $("[data-q-total]"), score: $("[data-score]"), progress: $("[data-progress]"),
    timer: $("[data-timer]"), ring: $("[data-timer-ring]"), question: $("[data-question]"), options: $("[data-options]"),
    feedback: $("[data-feedback]"), fbTitle: $("[data-feedback-title]"), fbText: $("[data-feedback-text]"),
    next: $("[data-next]"), nextLabel: $("[data-next-label]"),
  };
  el.total.textContent = QUESTIONS.length;

  let index, points, correct, totalTime, results, locked, deadline, tick, shuffled;

  const shuffle = (list) => {
    const a = list.map((v, i) => [v, i]);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a; // [[text, originalIndex], ...]
  };

  const show = (name) => {
    for (const [k, s] of Object.entries(screens)) s.hidden = k !== name;
    screens[name].classList.remove("pop");
    void screens[name].offsetWidth;
    screens[name].classList.add("pop");
    window.scrollTo({ top: 0 });
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    return `${String(m).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  };

  function start() {
    index = 0; points = 0; correct = 0; totalTime = 0; results = [];
    el.score.textContent = "0";
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    const item = QUESTIONS[index];
    locked = false;
    el.num.textContent = index + 1;
    el.progress.style.width = (index / QUESTIONS.length) * 100 + "%";
    el.question.textContent = item.q;
    el.feedback.classList.add("hidden");
    el.next.classList.add("hidden");
    el.next.classList.remove("flex");
    shuffled = shuffle(item.options);
    el.options.innerHTML = "";
    shuffled.forEach(([text], i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opt w-full text-start flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 font-bold";
      b.innerHTML = `<span class="size-8 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-sm"></span><span class="flex-1 leading-snug"></span><span class="material-symbols-outlined text-[22px] hidden" data-mark></span>`;
      b.children[0].textContent = LETTERS[i];
      b.children[1].textContent = text;
      b.addEventListener("click", () => answer(i));
      el.options.append(b);
    });
    startTimer();
  }

  function startTimer() {
    clearInterval(tick);
    deadline = Date.now() + SECONDS * 1000;
    const draw = () => {
      const left = Math.max(0, (deadline - Date.now()) / 1000);
      el.timer.textContent = Math.ceil(left);
      el.ring.style.strokeDashoffset = String(RING * (1 - left / SECONDS));
      el.ring.style.stroke = left <= 5 ? "#ef4444" : "#ea6a1f";
      if (left <= 0) { clearInterval(tick); answer(-1); }
    };
    draw();
    tick = setInterval(draw, 100);
  }

  function answer(choice) {
    if (locked) return;
    locked = true;
    clearInterval(tick);
    const item = QUESTIONS[index];
    const left = Math.max(0, (deadline - Date.now()) / 1000);
    totalTime += SECONDS - left;
    const picked = choice >= 0 ? shuffled[choice][1] : -1;
    const ok = picked === item.answer;
    let gained = 0;
    if (ok) { gained = 100 + Math.round((left / SECONDS) * 50); points += gained; correct++; }
    results.push(ok);
    el.score.textContent = points;

    [...el.options.children].forEach((b, i) => {
      b.disabled = true;
      const isRight = shuffled[i][1] === item.answer;
      const mark = b.querySelector("[data-mark]");
      if (isRight) { b.classList.add("is-right"); mark.textContent = "check_circle"; mark.classList.remove("hidden"); mark.classList.add("text-green-400"); }
      else if (i === choice) { b.classList.add("is-wrong"); mark.textContent = "cancel"; mark.classList.remove("hidden"); mark.classList.add("text-red-400"); }
      else b.classList.add("is-dim");
    });

    el.fbTitle.textContent = ok ? `إجابة صحيحة! +${gained} نقطة` : choice < 0 ? "انتهى الوقت!" : "إجابة خاطئة";
    el.fbTitle.className = "font-extrabold " + (ok ? "text-green-400" : "text-red-400");
    el.fbText.textContent = item.note;
    el.feedback.classList.remove("hidden");
    el.nextLabel.textContent = index === QUESTIONS.length - 1 ? "اعرض النتيجة" : "السؤال التالي";
    el.next.classList.remove("hidden");
    el.next.classList.add("flex");
    el.next.focus({ preventScroll: true });
    el.next.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function finish() {
    el.progress.style.width = "100%";
    const name = el.name.value.trim();
    const n = QUESTIONS.length;
    const tiers = [
      [n, "علامة كاملة! أنت مؤرخ الثورة", "ذاكرتك التاريخية رائعة، فخورون بك."],
      [8, "ممتاز! معرفتك قوية", "أنت قريب جداً من العلامة الكاملة."],
      [5, "جيد، واصل القراءة", "تعرف الكثير عن الثورة، وبقليل من المراجعة ستتفوق."],
      [0, "بداية جميلة", "تاريخ ثورتنا يستحق أن نعرف المزيد عنه، جرّب مرة أخرى."],
    ];
    const [, title, text] = tiers.find(([min]) => correct >= min);
    $("[data-result-name]").textContent = name ? `أحسنت يا ${name}` : "";
    $("[data-result-correct]").textContent = correct;
    $("[data-result-title]").textContent = title;
    $("[data-result-text]").textContent = text;
    $("[data-result-points]").textContent = points;
    $("[data-result-time]").textContent = fmtTime(totalTime);
    const dots = $("[data-result-dots]");
    dots.innerHTML = results.map((ok) => `<span class="size-2.5 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}"></span>`).join("");
    const ring = $("[data-result-ring]");
    ring.style.strokeDashoffset = String(RING);
    show("result");
    requestAnimationFrame(() => requestAnimationFrame(() => (ring.style.strokeDashoffset = String(RING * (1 - correct / n)))));
  }

  async function share() {
    const name = el.name.value.trim();
    const text = `${name ? name + ": " : ""}حصلتُ على ${correct}/${QUESTIONS.length} (${points} نقطة) في مسابقة أول نوفمبر من نادي راسا هل تتحدّاني؟`;
    const url = location.href.split("#")[0];
    const label = $("[data-share-label]");
    try {
      if (navigator.share) await navigator.share({ title: "مسابقة أول نوفمبر", text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); label.textContent = "تم نسخ النتيجة"; setTimeout(() => (label.textContent = "شارك نتيجتك"), 2000); }
    } catch { /* share dismissed */ }
  }

  $("[data-start]").addEventListener("click", start);
  el.name.addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
  el.next.addEventListener("click", () => { index++; index < QUESTIONS.length ? renderQuestion() : finish(); });
  $("[data-restart]").addEventListener("click", () => { show("start"); });
  $("[data-share]").addEventListener("click", share);
  document.addEventListener("keydown", (e) => {
    if (screens.quiz.hidden) return;
    if (!locked && /^[1-4]$/.test(e.key)) answer(Number(e.key) - 1);
    else if (locked && (e.key === "Enter" || e.key === " ") && document.activeElement !== el.next) { e.preventDefault(); el.next.click(); }
  });
})();
