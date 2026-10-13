// Rasa site build: SEO / AEO metadata, pre-rendered events, FAQ, sitemap and llms.txt.
//
//   node scripts/build.mjs
//
// Run it after editing data/events.js, the board on index.html, the FAQ below or a page's
// <title>/<meta name="description">. It rewrites only the generated blocks:
//   <!-- seo:start --> … <!-- seo:end -->            in every page's <head>
//   <!-- prerender:start --> … <!-- prerender:end -->  inside the events containers
//   <!-- faq:start --> … <!-- faq:end -->              the homepage FAQ section
// It also versions CSS/JS links (?v=<content hash>) and the service worker, and regenerates
// sitemap.xml (with images), llms.txt and llms-full.txt. No dependencies; Node 18+.
// Run scripts/build-css.mjs first when Tailwind classes changed.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE = "https://rasa-off.vercel.app";
const TODAY = new Date().toLocaleDateString("en-CA"); // local date, YYYY-MM-DD
const ORG_ID = `${SITE}/#organization`;
const WEBSITE_ID = `${SITE}/#website`;

// ---------------------------------------------------------------- pages
// path: clean URL · og: image in images/og/ · crumbs: breadcrumb trail after Home · type: schema.org page type
const PAGES = [
  { file: "index.html", path: "/", og: "default", type: "WebPage" },
  { file: "events.html", path: "/events", og: "events", type: "CollectionPage", crumbs: [["Events", "/events"]] },
  { file: "literature.html", path: "/literature", og: "literature", dept: "Literature", crumbs: [["Literature", "/literature"]] },
  { file: "literature/arabic.html", path: "/literature/arabic", og: "arabic", library: "ar", type: "CollectionPage", crumbs: [["Literature", "/literature"], ["Arabic Library", "/literature/arabic"]] },
  { file: "literature/english.html", path: "/literature/english", og: "english", library: "en", type: "CollectionPage", crumbs: [["Literature", "/literature"], ["English Library", "/literature/english"]] },
  { file: "literature/french.html", path: "/literature/french", og: "french", library: "fr", type: "CollectionPage", crumbs: [["Literature", "/literature"], ["French Library", "/literature/french"]] },
  { file: "art.html", path: "/art", og: "art", dept: "Art", crumbs: [["Art", "/art"]] },
  { file: "music.html", path: "/music", og: "music", dept: "Music", crumbs: [["Music", "/music"]] },
  { file: "chess.html", path: "/chess", og: "chess", dept: "Chess", crumbs: [["Chess", "/chess"]] },
  { file: "activities.html", path: "/activities", og: "activities", dept: "Activities", crumbs: [["Activities", "/activities"]] },
  { file: "charity.html", path: "/charity", og: "charity", dept: "Charity", crumbs: [["Charity", "/charity"]] },
  { file: "recruitment.html", path: "/recruitment", og: "recruitment", crumbs: [["Join the Core Team", "/recruitment"]] },
  { file: "noregistrations.html", path: "/noregistrations", og: "default", noindex: true },
];
// Pages outside PAGES that still get versioned asset links.
const EXTRA_PAGES = ["offline.html", "404.html"];

const DEPARTMENTS = [
  ["Literature Department", "/literature"],
  ["Art Department", "/art"],
  ["Music Department", "/music"],
  ["Chess Department", "/chess"],
  ["Activities Department", "/activities"],
  ["Charity Department", "/charity"],
];

const ADDRESS = { "@type": "PostalAddress", addressLocality: "Amizour", addressRegion: "Béjaïa", addressCountry: "DZ" };
const GEO = { "@type": "GeoCoordinates", latitude: 36.66364687538598, longitude: 4.909960575296492 };
const ESTIN_PLACE = {
  "@type": "Place",
  name: "ESTIN — École Supérieure en Sciences et Technologies de l'Informatique et du Numérique",
  address: ADDRESS,
  geo: GEO,
};

// ---------------------------------------------------------------- helpers
const file = (f) => path.join(ROOT, f);
function load(f) {
  const raw = fs.readFileSync(file(f), "utf8");
  return { crlf: raw.includes("\r\n"), s: raw.replace(/\r\n/g, "\n") };
}
function save(f, s, crlf) {
  fs.writeFileSync(file(f), crlf ? s.replace(/\n/g, "\r\n") : s);
}
const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const text = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const url = (p) => SITE + p;
const hash = (buf) => crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);

// Last commit date of a file (YYYY-MM-DD); today if it has uncommitted changes.
// lastmod / dateModified then only move when a page really changes.
function git(args) {
  try {
    return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}
const modified = (f) => (git(["status", "--porcelain", "--", f]) ? TODAY : git(["log", "-1", "--format=%cs", "--", f]) || TODAY);

function replaceBlock(s, start, end, content, where) {
  const re = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (re.test(s)) return s.replace(re, `${start}${content}${end}`);
  if (!where) throw new Error(`missing block ${start}`);
  return where(s, `${start}${content}${end}`);
}

// ---------------------------------------------------------------- data
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(file("data/events.js"), "utf8"), sandbox);
vm.runInContext(fs.readFileSync(file("js/events.js"), "utf8"), sandbox);
const EVENTS = sandbox.window.RASA_EVENTS;
const RENDER = sandbox.window.RasaEvents;

// Current board, read from the homepage cards (single source of truth).
const home = load("index.html");
const boardHtml = home.s.slice(home.s.indexOf('id="membersScroll"'), home.s.indexOf('id="pastBoardScroll"'));
const BOARD = [...boardHtml.matchAll(/<h3[^>]*>\s*([^<]+?)\s*<\/h3>\s*<p[^>]*>([^<]+)<\/p>/g)].map((m) => ({
  name: decode(m[1]),
  role: decode(m[2]),
}));
const byRole = (r) => BOARD.find((m) => m.role.toLowerCase() === r)?.name;

const season = EVENTS.seasons[0];
const eventCount = season.events.length;

// ---------------------------------------------------------------- FAQ (visible on the homepage + FAQPage schema)
const FAQ = [
  [
    "What is Rasa Club?",
    `Rasa is the cultural and artistic club of ESTIN (École Supérieure en Sciences et Technologies de l'Informatique et du Numérique) in Amizour, Béjaïa, Algeria. It was created by students to ease the pressure of studies with a space for literature, art, music, chess, games and cultural exchange. Its motto is “Feel the emotion. Live the expression.”`,
  ],
  [
    "Where is Rasa Club located?",
    "At ESTIN in Amizour, Béjaïa. The club room is on the ground floor of the ESTIN library, where many of its meetings and evenings take place.",
  ],
  [
    "What departments does Rasa have?",
    `Six departments: <a href="/literature">Literature</a>, <a href="/art">Art</a>, <a href="/music">Music</a>, <a href="/chess">Chess</a>, <a href="/activities">Activities</a> and <a href="/charity">Charity</a>, supported by the Multimedia, Communication, Logistics and Human Resources teams.`,
  ],
  [
    "Who leads Rasa Club in 2026/27?",
    `The 2026/27 board is led by president ${byRole("president")}, with ${byRole("vice president")} as vice president and ${byRole("secretary")} as secretary. <a href="/#team">Meet the whole board</a>.`,
  ],
  [
    "What events does Rasa organise?",
    `Each season includes a Welcome Day, movie nights, a trip to the Algiers International Book Fair (SILA), the 1 November commemoration, the Speaking Club in English and French, the Yennayer celebration, musical evenings, the RASA Chess Cup and outings such as Tikjda. The club ran ${eventCount} activities in ${season.title.replace("Season ", "")}. <a href="/events">See all events</a>.`,
  ],
  [
    "What is the RASA Chess Cup?",
    `Rasa's chess tournament. The first edition took place at ESTIN from 15 to 17 February 2026 with 24 players; Sameur Adel won, ahead of Boukendoul Mahdi and Lahmar Mouaiz. <a href="/chess#chess-cup">Read the recap</a>.`,
  ],
  [
    "How can I join Rasa?",
    `Follow <a href="https://www.instagram.com/rasa.estin/" target="_blank" rel="noopener">@rasa.estin</a> on Instagram for every call. For 2026/27 the club is recruiting graphic designers and an external relations member for its core team: <a href="/recruitment">apply here</a>.`,
  ],
  [
    "What does Rasa's Charity Department do?",
    `It runs solidarity campaigns with accredited associations, starting with support for children with cancer, plus causes such as blood donation, Ramadan solidarity and winter clothing collections. Rasa never collects money online. <a href="/charity">Learn more</a>.`,
  ],
  [
    "How can I contact Rasa Club?",
    `By email at <a href="mailto:rasa@estin.dz">rasa@estin.dz</a>, on Instagram at <a href="https://www.instagram.com/rasa.estin/" target="_blank" rel="noopener">@rasa.estin</a>, or with the <a href="/#contact">contact form</a> on this website.`,
  ],
];

// ---------------------------------------------------------------- structured data
const ORG_REF = { "@type": "Organization", "@id": ORG_ID, name: "Rasa Club", url: SITE + "/", logo: url("/icons/icon-512.png") };

const ORGANIZATION = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "Rasa Club",
  alternateName: ["RASA", "Club culturel RASA", "Rasa ESTIN"],
  description:
    "Rasa is the cultural and artistic student club of ESTIN in Amizour, Béjaïa, Algeria: literature, art, music, chess, activities and charity.",
  url: SITE + "/",
  logo: { "@type": "ImageObject", url: url("/icons/icon-512.png"), width: 512, height: 512 },
  image: url("/images/og/default.jpg"),
  slogan: "Feel the emotion. Live the expression.",
  keywords: "Rasa Club, club culturel ESTIN, ESTIN Béjaïa, student club Algeria, literature, art, music, chess, charity",
  knowsAbout: ["Literature", "Reading and book fairs", "Visual art", "Music", "Chess", "Games and student activities", "Charity and solidarity", "Amazigh culture and Yennayer", "Student life at ESTIN"],
  areaServed: [{ "@type": "City", name: "Béjaïa" }, { "@type": "Country", name: "Algeria" }],
  email: "rasa@estin.dz",
  foundingDate: "2024",
  address: ADDRESS,
  location: ESTIN_PLACE,
  sameAs: ["https://www.instagram.com/rasa.estin/", "https://www.linkedin.com/company/rasa-club/"],
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "École Supérieure en Sciences et Technologies de l'Informatique et du Numérique (ESTIN)",
    alternateName: "ESTIN",
    address: ADDRESS,
  },
  subOrganization: DEPARTMENTS.map(([name, p]) => ({ "@type": "Organization", name: `Rasa ${name}`, url: url(p) })),
  member: BOARD.map((m) => ({
    "@type": "OrganizationRole",
    roleName: m.role,
    startDate: "2026",
    member: { "@type": "Person", name: m.name },
  })),
  contactPoint: { "@type": "ContactPoint", email: "rasa@estin.dz", contactType: "general enquiries", availableLanguage: ["en", "fr", "ar"] },
};

// ---------------------------------------------------------------- page-specific structured data
// A department, with its managers from the board.
function departmentNode(page) {
  const managers = BOARD.filter((m) => new RegExp(`\\b${page.dept}\\b`, "i").test(m.role));
  return {
    "@type": "Organization",
    "@id": `${url(page.path)}#department`,
    name: `Rasa ${page.dept} Department`,
    url: url(page.path),
    parentOrganization: { "@id": ORG_ID },
    ...(managers.length
      ? { member: managers.map((m) => ({ "@type": "OrganizationRole", roleName: m.role, startDate: "2026", member: { "@type": "Person", name: m.name } })) }
      : {}),
  };
}

// The books of a library page, read from the page's own cards.
function libraryBooks(html, page) {
  const books = [];
  const re = /<h3\b[^>]*>([\s\S]*?)<\/h3>\s*<p\s+class="text-primary[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  for (const m of html.matchAll(re)) {
    const before = html.slice(0, m.index);
    const cover = [...before.matchAll(/background-image:\s*url\((['"]?)(.*?)\1\)/g)].pop();
    const read = html.slice(m.index).match(/href="(https:\/\/drive\.google\.com\/file\/d\/[^"]+)"/);
    const coverPath = cover ? cover[2].replace(/\\'/g, "'").replace(/\\ /g, " ") : null;
    books.push({
      "@type": "Book",
      name: decode(text(m[1])),
      author: { "@type": "Person", name: decode(text(m[2])) },
      inLanguage: page.library,
      ...(coverPath ? { image: url(encodeURI(coverPath)) } : {}),
      ...(read ? { url: read[1].split("?")[0] } : {}),
      provider: { "@id": ORG_ID },
    });
  }
  return books;
}

// The RASA Chess Cup and its podium, for the chess page.
function chessCupNode() {
  const e = EVENTS.seasons.flatMap((s) => s.events).find((x) => x.id === "chess-cup");
  if (!e) return null;
  return {
    "@type": "SportsEvent",
    "@id": `${SITE}/chess#chess-cup`,
    name: "RASA Chess Cup 2026",
    description: "First edition of Rasa's chess tournament at ESTIN: 24 players over three days. Champion Sameur Adel, 2nd Boukendoul Mahdi, 3rd Lahmar Mouaiz.",
    sport: "Chess",
    startDate: e.start,
    endDate: e.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: ESTIN_PLACE,
    image: url(e.cover),
    organizer: { "@id": ORG_ID },
    url: `${SITE}/chess#chess-cup`,
  };
}

const WEBSITE = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE + "/",
  name: "Rasa Club",
  alternateName: ["RASA", "Rasa Club ESTIN Béjaïa"],
  inLanguage: "en",
  publisher: { "@id": ORG_ID },
};

const FAQ_PAGE = {
  "@type": "FAQPage",
  "@id": `${SITE}/#faq`,
  mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: text(a) } })),
};

function eventPlace(place) {
  if (/algiers/i.test(place)) return { "@type": "Place", name: "Algiers International Book Fair (SILA)", address: { "@type": "PostalAddress", addressLocality: "Algiers", addressCountry: "DZ" } };
  if (/tikjda/i.test(place)) return { "@type": "Place", name: "Tikjda", address: { "@type": "PostalAddress", addressLocality: "Tikjda", addressRegion: "Bouira", addressCountry: "DZ" } };
  return ESTIN_PLACE;
}

function eventItems() {
  const items = [];
  for (const s of EVENTS.seasons) {
    for (const e of s.events) {
      if (e.notAnEvent || !e.start) continue;
      items.push({
        "@type": "Event",
        "@id": `${SITE}/events#event-${e.id}`,
        name: e.title,
        description: e.summary,
        startDate: e.start,
        ...(e.end ? { endDate: e.end } : {}),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: eventPlace(e.place),
        ...(e.cover ? { image: url(e.cover) } : {}),
        organizer: { "@id": ORG_ID },
        url: `${SITE}/events#event-${e.id}`,
      });
    }
  }
  return { "@type": "ItemList", "@id": `${SITE}/events#list`, name: "Rasa Club events", itemListElement: items.map((ev, i) => ({ "@type": "ListItem", position: i + 1, item: ev })) };
}

function breadcrumb(page) {
  const trail = [["Home", "/"], ...(page.crumbs || [])];
  return {
    "@type": "BreadcrumbList",
    "@id": `${url(page.path)}#breadcrumb`,
    itemListElement: trail.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: url(p === "/" ? "/" : p) })),
  };
}

// ---------------------------------------------------------------- head block
function headBlock(page, title, description, html) {
  const pageUrl = url(page.path);
  const image = url(`/images/og/${page.og}.jpg`);
  const graph = [
    {
      "@type": page.type || "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      description,
      inLanguage: "en",
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": ORG_ID },
      primaryImageOfPage: { "@type": "ImageObject", url: image, width: 1200, height: 630 },
      dateModified: modified(page.file),
      ...(page.crumbs ? { breadcrumb: { "@id": `${pageUrl}#breadcrumb` } } : {}),
    },
  ];
  if (page.path === "/") graph.push(ORGANIZATION, WEBSITE, FAQ_PAGE);
  else graph.push(ORG_REF);
  if (page.crumbs) graph.push(breadcrumb(page));
  if (page.path === "/events") graph.push(eventItems());
  if (page.dept) graph.push(departmentNode(page));
  if (page.path === "/chess") graph.push(chessCupNode());
  if (page.library) {
    const books = libraryBooks(html, page);
    if (books.length)
      graph.push({
        "@type": "ItemList",
        "@id": `${url(page.path)}#books`,
        name: title,
        numberOfItems: books.length,
        itemListElement: books.map((b, i) => ({ "@type": "ListItem", position: i + 1, item: b })),
      });
  }

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2).replace(/<\//g, "<\\/");
  const robots = page.noindex ? "noindex, follow" : "index, follow, max-image-preview:large, max-snippet:-1";
  return `
    <link rel="canonical" href="${pageUrl}" />
    <meta name="robots" content="${robots}" />
    <meta name="author" content="Rasa Club" />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Rasa Club" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${attr(title)}" />
    <meta property="og:description" content="${attr(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:alt" content="${attr(title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${attr(title)}" />
    <meta name="twitter:description" content="${attr(description)}" />
    <meta name="twitter:image" content="${image}" />
    <meta name="twitter:image:alt" content="${attr(title)}" />
    <script type="application/ld+json">
${json}
    </script>
    `;
}

// ---------------------------------------------------------------- FAQ section (homepage)
function faqSection() {
  const items = FAQ.map(
    ([q, a]) => `
          <details class="group glass-card rounded-2xl px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left">
              <h3 class="text-white font-bold text-lg font-display">${q}</h3>
              <span class="material-symbols-outlined text-primary transition-transform duration-300 group-open:rotate-45 group-[.is-closing]:!rotate-0 shrink-0">add</span>
            </summary>
            <p class="mt-4 text-gray-400 leading-relaxed [&_a]:text-primary [&_a]:font-bold hover:[&_a]:underline">${a}</p>
          </details>`
  ).join("");
  return `
  <div class="pt-12 pb-12 md:pt-16 md:pb-16 relative bg-black scroll-mt-20" id="faq">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-sm font-bold text-primary tracking-[0.2em] uppercase mb-4 flex items-center justify-center gap-3">
          <span class="h-px w-8 bg-primary"></span>
          Good to know
          <span class="h-px w-8 bg-primary"></span>
        </h2>
        <p class="text-4xl md:text-5xl font-display font-bold text-white text-center mb-12">Frequently asked questions</p>
        <div class="space-y-4">${items}
        </div>
      </div>
    </div>
    <script>
      // Smooth open/close: animate the card's height and fade the answer instead of the instant toggle.
      (() => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)");
        const ease = "cubic-bezier(.22,.61,.36,1)";
        document.querySelectorAll("#faq details").forEach((el) => {
          const summary = el.querySelector("summary");
          const answer = summary.nextElementSibling;
          let grow = null, fade = null;
          const closedHeight = () => {
            const cs = getComputedStyle(el);
            return summary.offsetHeight + ["paddingTop", "paddingBottom", "borderTopWidth", "borderBottomWidth"]
              .reduce((h, k) => h + parseFloat(cs[k]), 0);
          };
          summary.addEventListener("click", (e) => {
            if (reduce.matches || !el.animate) return;
            e.preventDefault();
            const from = el.offsetHeight;
            const opening = !el.open || el.classList.contains("is-closing");
            grow && grow.cancel();
            fade && fade.cancel();
            el.style.overflow = "hidden";
            el.classList.toggle("is-closing", !opening);
            if (opening) el.open = true;
            const to = opening ? el.offsetHeight : closedHeight();
            const duration = Math.min(420, 220 + Math.abs(to - from) * 0.6);
            grow = el.animate({ height: [from + "px", to + "px"] }, { duration, easing: ease });
            fade = answer.animate(
              opening ? { opacity: [0, 1], transform: ["translateY(-6px)", "none"] }
                      : { opacity: [1, 0], transform: ["none", "translateY(-6px)"] },
              { duration: opening ? duration : duration * 0.7, easing: ease, fill: opening ? "none" : "forwards" }
            );
            grow.onfinish = () => {
              grow = null;
              el.style.overflow = "";
              if (!opening) {
                el.open = false;
                el.classList.remove("is-closing");
                fade && fade.cancel();
                fade = null;
              }
            };
          });
        });
      })();
    </script>
  </div>
  `;
}

// ---------------------------------------------------------------- run
// ---------------------------------------------------------------- asset versions
// Every local CSS/JS file referenced by the pages gets ?v=<hash of its content>, so browsers can cache
// it for a long time and still get the new file as soon as it changes.
const assetVersion = new Map();
function versioned(ref) {
  const clean = ref.split("?")[0];
  if (!assetVersion.has(clean)) {
    const f = file(clean.replace(/^\//, ""));
    assetVersion.set(clean, fs.existsSync(f) ? hash(fs.readFileSync(f)) : null);
  }
  const v = assetVersion.get(clean);
  return v ? `${clean}?v=${v}` : ref;
}
const versionAssets = (html) =>
  html
    .replace(/(<script\b[^>]*\bsrc=")(\/(?:js|data)\/[^"]+\.js)(?:\?v=[^"]*)?(")/g, (_, a, ref, b) => a + versioned(ref) + b)
    .replace(/(<link\b[^>]*\bhref=")(\/css\/[^"]+\.css)(?:\?v=[^"]*)?(")/g, (_, a, ref, b) => a + versioned(ref) + b)
    // favicons: browsers cache them very hard, so a changed icon needs a new URL
    .replace(/(<link\b[^>]*\bhref=")(\/favicon\.ico|\/icons\/(?:favicon-\d+|apple-touch-icon)\.png)(?:\?v=[^"]*)?(")/g, (_, a, ref, b) => a + versioned(ref) + b);

const pageImages = new Map(); // page path -> image URLs, for the image sitemap
const libraryCatalogue = new Map(); // library path -> books, for llms-full.txt

const results = [];
for (const page of PAGES) {
  const { s: original, crlf } = load(page.file);
  let s = original;
  const title = decode(s.match(/<title>([\s\S]*?)<\/title>/)[1].trim());
  const description = decode(s.match(/<meta name="description" content="([^"]*)"/)[1]);

  s = replaceBlock(s, "<!-- seo:start -->", "<!-- seo:end -->", headBlock(page, title, description, s), (src, block) => {
    const anchor = src.match(/\n([ \t]*)<meta name="apple-mobile-web-app-status-bar-style"[^>]*>/);
    if (!anchor) throw new Error(`${page.file}: no anchor for the SEO block`);
    const at = anchor.index + anchor[0].length;
    return src.slice(0, at) + `\n${anchor[1]}${block}` + src.slice(at);
  });

  // pre-rendered events (crawlers that don't run JavaScript still see them)
  for (const [selector, render] of [
    ["data-events-upcoming", RENDER.upcomingHTML],
    ["data-events-seasons", RENDER.seasonsHTML],
    ["data-events-home", RENDER.homeHTML],
  ]) {
    const re = new RegExp(`(<div[^>]*${selector}[^>]*>)(?:<!-- prerender:start -->[\\s\\S]*?<!-- prerender:end -->)?(</div>)`);
    if (re.test(s)) s = s.replace(re, (_, open, close) => `${open}<!-- prerender:start -->${render()}<!-- prerender:end -->${close}`);
  }

  if (page.path === "/") {
    s = replaceBlock(s, "<!-- faq:start -->", "<!-- faq:end -->", faqSection(), (src, block) => {
      const anchor = "  <!-- ✅ Footer -->";
      if (!src.includes(anchor)) throw new Error("index.html: footer anchor not found");
      return src.replace(anchor, `${block}\n\n${anchor}`);
    });
  }

  s = versionAssets(s);

  // images on the page (img src and inline background images), for the image sitemap
  const imgs = new Set([url(`/images/og/${page.og}.jpg`)]);
  for (const m of s.matchAll(/<img\b[^>]*\bsrc="(\/(?:images|icons)\/[^"?]+)"/g)) imgs.add(url(encodeURI(m[1])));
  for (const m of s.matchAll(/background-image:\s*url\((['"]?)(\/images\/.*?)\1\)/g)) imgs.add(url(encodeURI(m[2].replace(/\\'/g, "'").replace(/\\ /g, " "))));
  pageImages.set(page.path, [...imgs].filter((u) => !/\/icons\//.test(u)).slice(0, 60));
  if (page.library) libraryCatalogue.set(page.path, libraryBooks(s, page));

  if (s !== original) save(page.file, s, crlf);
  results.push(`${page.file.padEnd(22)} ${s !== original ? "updated" : "unchanged"}`);
}

for (const extra of EXTRA_PAGES) {
  if (!fs.existsSync(file(extra))) continue;
  const { s: original, crlf } = load(extra);
  const s = versionAssets(original);
  if (s !== original) save(extra, s, crlf);
  results.push(`${extra.padEnd(22)} ${s !== original ? "updated" : "unchanged"}`);
}

// ---------------------------------------------------------------- service worker
// Precache the versioned CSS/JS URLs and derive VERSION from everything precached,
// so installed apps update by themselves after each deploy (no manual bump).
{
  const { s: original, crlf } = load("sw.js");
  let sw = original.replace(/"(\/(?:css|js|data)\/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"/g, (_, ref) => `"${versioned(ref)}"`);
  const list = sw.match(/const PRECACHE_URLS = \[([\s\S]*?)\];/)[1];
  const fingerprint = hash(
    [...list.matchAll(/"([^"]+)"/g)]
      .map(([, u]) => {
        const f = file((u === "/" ? "index" : u.split("?")[0].replace(/^\//, "")) + (/\.[a-z0-9]+$/i.test(u.split("?")[0]) ? "" : ".html"));
        return fs.existsSync(f) ? fs.readFileSync(f) : u;
      })
      .join("|")
  );
  sw = sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "rasa-${fingerprint}";`);
  if (sw !== original) save("sw.js", sw, crlf);
  results.push(`${"sw.js".padEnd(22)} ${sw !== original ? `updated (rasa-${fingerprint})` : "unchanged"}`);
}

// sitemap.xml — real last-modified dates from git, plus the images of each page
const xml = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${PAGES.filter((p) => !p.noindex)
  .map(
    (p) => `  <url>
    <loc>${url(p.path)}</loc>
    <lastmod>${modified(p.file)}</lastmod>
    <changefreq>${p.path === "/" || p.path === "/events" ? "weekly" : "monthly"}</changefreq>
    <priority>${p.path === "/" ? "1.0" : p.path === "/events" ? "0.9" : "0.7"}</priority>
${(pageImages.get(p.path) || []).map((i) => `    <image:image><image:loc>${xml(i)}</image:loc></image:image>`).join("\n")}
  </url>`
  )
  .join("\n")}
</urlset>
`;
fs.writeFileSync(file("sitemap.xml"), sitemap);

// llms.txt — a plain summary for AI assistants and answer engines (https://llmstxt.org)
const llms = `# Rasa Club

> Rasa is the cultural and artistic student club of ESTIN (École Supérieure en Sciences et Technologies de l'Informatique et du Numérique) in Amizour, Béjaïa, Algeria. Motto: “Feel the emotion. Live the expression.”

Rasa was created by students to ease the pressure of studies with a space for literature, art, music, chess, games, charity and cultural exchange. The club room is on the ground floor of the ESTIN library. Contact: rasa@estin.dz · Instagram @rasa.estin.

## Pages

- [Home](${SITE}/): about the club, events, the 2026/27 board, FAQ and contact form
- [Events](${SITE}/events): upcoming events and every activity of past seasons
- [Literature](${SITE}/literature): reading, book fairs, the Speaking Club, English/French/Arabic libraries
- [Art](${SITE}/art): drawings, paper quilling and members' artwork
- [Music](${SITE}/music): musical evenings and instruments
- [Chess](${SITE}/chess): training and the RASA Chess Cup
- [Activities](${SITE}/activities): games and tournaments
- [Charity](${SITE}/charity): solidarity campaigns with accredited associations
- [Join the core team](${SITE}/recruitment): open positions for 2026/27

## Board 2026/27

${BOARD.map((m) => `- ${m.name}: ${m.role}`).join("\n")}

## Upcoming

${EVENTS.upcoming.map((e) => `- ${e.title} (${e.date}, ${e.place}): ${e.summary}`).join("\n") || "- Nothing announced yet."}

## ${season.title} (${eventCount} activities)

${season.events.map((e) => `- ${e.title}: ${e.date}, ${e.place}. ${e.summary}${e.stat ? ` (${e.stat})` : ""}`).join("\n")}

## FAQ

${FAQ.map(([q, a]) => `### ${q}\n\n${text(a)}`).join("\n\n")}
`;
fs.writeFileSync(file("llms.txt"), llms);

// llms-full.txt — the complete knowledge file: every page, the whole board, every event with its details,
// the Chess Cup results and the library catalogue.
const byDept = (d) => BOARD.filter((m) => new RegExp(`\\b${d}\\b`, "i").test(m.role)).map((m) => m.name);
const pageList = PAGES.filter((p) => !p.noindex).map((p) => {
  const { s: html } = load(p.file);
  const t = decode(html.match(/<title>([\s\S]*?)<\/title>/)[1].trim());
  const d = decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
  return `### ${t}\n\nURL: ${url(p.path)}\n\n${d}`;
});
const llmsFull = `# Rasa Club — full guide

> Rasa is the cultural and artistic student club of ESTIN (École Supérieure en Sciences et Technologies de l'Informatique et du Numérique) in Amizour, Béjaïa, Algeria. Motto: “Feel the emotion. Live the expression.” Website: ${SITE}/ · Email: rasa@estin.dz · Instagram: @rasa.estin

This file is the long version of ${SITE}/llms.txt, for AI assistants and answer engines that want the full context.
Generated by scripts/build.mjs on ${TODAY}.

## About the club

Rasa was created by students to ease the pressure of studies by giving the student community a cultural, musical and convivial space: reading, music, art, games of thought and cultural exchange. The club room is on the ground floor of the ESTIN library, where many of its meetings and evenings take place. Rasa works with other ESTIN clubs (LDC, ORIGO) and has had outside support (Sinay Travel, the Orca club).

## Departments

${DEPARTMENTS.map(([name, p]) => {
  const d = name.replace(" Department", "");
  const m = byDept(d);
  return `- [${name}](${url(p)})${m.length ? `: managers ${m.join(", ")}` : ""}`;
}).join("\n")}
- Support teams: Multimedia (${byDept("Multimedia").join(", ")}), Communication (${byDept("Communication").join(", ")}), Logistics (${byDept("Logistics").join(", ")}), Human Resources (${byDept("Human Resources").join(", ")})

## Board 2026/27

${BOARD.map((m) => `- ${m.name}: ${m.role}`).join("\n")}

## Upcoming

${EVENTS.upcoming.map((e) => `- **${e.title}** — ${e.date}, ${e.place}. ${e.summary}`).join("\n") || "- Nothing announced yet."}

${EVENTS.seasons
  .map(
    (sn) => `## ${sn.title} (${sn.events.length} activities)

${sn.intro || ""}

${sn.events
  .map((e) => `- **${e.title}** — ${e.date}, ${e.place}${e.tags?.length ? ` (${e.tags.join(", ")})` : ""}. ${e.summary}${e.stat ? ` ${e.stat}.` : ""}`)
  .join("\n")}`
  )
  .join("\n\n")}

## RASA Chess Cup 2026

First edition of the club's chess tournament, at ESTIN from 15 to 17 February 2026, with 24 players and registrations from 8 to 14 February. Winners announced on 18 February 2026: champion Sameur Adel, 2nd Boukendoul Mahdi, 3rd Lahmar Mouaiz. Details: ${SITE}/chess#chess-cup

## Charity

The Charity Department runs solidarity campaigns with accredited associations (Algerian law 12-06), starting with support for children with cancer, plus blood donation, Ramadan solidarity, winter clothing, back-to-school supplies and health awareness. Rasa never collects money online; donations go through the partner association. Details: ${SITE}/charity

## Libraries

${[...libraryCatalogue.entries()]
  .map(([p, books]) => `### ${PAGES.find((x) => x.path === p).crumbs.at(-1)[0]} (${url(p)})

${books.map((b) => `- ${b.name} — ${b.author.name}`).join("\n")}`)
  .join("\n\n")}

Books open in an in-page reader on the website (Google Drive viewer) and can be downloaded.

## Pages

${pageList.join("\n\n")}

## FAQ

${FAQ.map(([q, a]) => `### ${q}\n\n${text(a)}`).join("\n\n")}

## Contact

- Email: rasa@estin.dz
- Instagram: https://www.instagram.com/rasa.estin/
- LinkedIn: https://www.linkedin.com/company/rasa-club/
- Contact form: ${SITE}/#contact
`;
fs.writeFileSync(file("llms-full.txt"), llmsFull);

console.log(results.join("\n"));
console.log(`sitemap.xml: ${PAGES.filter((p) => !p.noindex).length} URLs, ${[...pageImages.values()].reduce((n, l) => n + l.length, 0)} images · llms.txt + llms-full.txt · board: ${BOARD.length} · events: ${eventCount}`);
