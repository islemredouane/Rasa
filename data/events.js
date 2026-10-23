// RASA events — the single list behind events.html and the homepage "Events" section.
//
// To add an event: copy one block inside the right season, edit the fields, save.
//   id        short unique name, used for the photo folder: /images/events/<season>/<id>/
//   title     event name
//   date      text shown on the card ("12 Feb 2026", "Nov–Dec 2025", ...)
//   place     where it happened
//   tags      small labels (department, partner clubs, ...)
//   icon      Material Symbols icon shown when there is no photo yet
//   summary   one or two sentences
//   stat      optional highlight, e.g. "24 players"
//   cover     optional photo path; leave null until a photo exists
//   coverFit  optional "contain" to show the whole image (logos, mascot) instead of cropping
//   coverPosition optional object-position, e.g. "center 20%"
//   link      optional { href, label } to a page or Instagram post
//   highlight true = shown on the homepage (keep it to 3 per season)
//   start/end machine-readable date for search engines: "2026-02", "2026-02-15" or "2026-02-12T20:30:00+01:00"
//   notAnEvent true = not listed as an Event in structured data (e.g. year-round communication)
//
// After editing, run:  node scripts/build.mjs   (updates SEO data, pre-rendered HTML and the sitemap)
//
// Upcoming events go in RASA_EVENTS.upcoming (leave it empty when nothing is announced); when an event is over,
// move it into its season. A season that is over gets  ended: true  (the FAQ quotes the latest ended season).

window.RASA_EVENTS = {
  upcoming: [],

  seasons: [
    {
      id: "2026-27",
      title: "Season 2026/27",
      intro: "The new board's first year: it opened with a Welcome Day for about 200 students.",
      events: [
        {
          id: "welcome-day-2026",
          start: "2026-10-19T16:30:00+01:00",
          title: "RASA's Welcome Day",
          date: "19 Oct 2026",
          place: "Salle de théâtre, ESTIN",
          tags: ["All departments", "Welcome Day"],
          icon: "waving_hand",
          summary:
            "The 2026/27 season opened with our Welcome Day: about 200 students met the new board, discovered every department, enjoyed games and performances, and found their place in the Rasa community.",
          stat: "About 200 attendees",
          cover: "/images/events/2026-27/welcome-day/cover.webp",
          coverPosition: "center",
          link: { href: "/registrations", label: "Join the Rasa family" },
          highlight: true,
        },
      ],
    },
    {
      id: "2025-26",
      ended: true,
      title: "Season 2025/26",
      intro: "Eleven activities across literature, music, chess, heritage and outings: the year RASA grew up.",
      events: [
        {
          id: "welcome-day",
          start: "2025-10",
          title: "Welcome Day",
          date: "Oct 2025",
          place: "ESTIN",
          tags: ["All departments"],
          icon: "waving_hand",
          summary:
            "Our first contact with the new students: every department presented, social games and new members recruited.",
          stat: "659 likes on the video",
          cover: "/images/events/2025-26/welcome-day/cover.webp",
          link: { href: "https://www.instagram.com/rasa.estin/reel/DP4PbizDB-x/", label: "Watch reel" },
          highlight: true,
        },
        {
          id: "movie-night",
          start: "2025-10",
          title: "Movie Night",
          date: "Oct 2025",
          place: "ESTIN",
          tags: ["Relaxation"],
          icon: "movie",
          summary:
            "A horror film chosen by the students themselves in an Instagram poll, to breathe before exam season.",
          cover: "/images/events/2025-26/movie-night/cover.webp",
        },
        {
          id: "sila",
          start: "2025-10",
          title: "Algiers International Book Fair (SILA)",
          date: "Oct 2025",
          place: "Algiers",
          tags: ["Literature"],
          icon: "menu_book",
          summary:
            "A cultural trip to SILA: visiting the stands, meeting authors and publishers, and bringing books home.",
          cover: "/images/events/2025-26/sila/cover.webp",
        },
        {
          id: "1-november",
          start: "2025-11",
          title: "1 November commemoration",
          date: "Nov 2025",
          place: "ESTIN",
          tags: ["100% RASA", "Heritage"],
          icon: "flag",
          summary:
            "Speeches on the meaning of the Revolution of 1 November 1954 and heritage music, in a solemn atmosphere.",
          cover: "/images/events/2025-26/1-november/cover.webp",
        },
        {
          id: "speaking-club",
          start: "2025-11",
          end: "2025-12",
          title: "Speaking Club",
          date: "Nov–Dec 2025",
          place: "ESTIN",
          tags: ["English & French", "3 sessions"],
          icon: "record_voice_over",
          summary:
            "Guided discussions in English and French to build confidence, communication and public speaking.",
          cover: "/images/events/2025-26/speaking-club/cover.webp",
        },
        {
          id: "yennayer",
          start: "2026-02",
          title: "Inter-club Yennayer celebration",
          date: "Feb 2026",
          place: "ESTIN",
          tags: ["RASA · LDC · ORIGO", "Amazigh heritage"],
          icon: "festival",
          summary:
            "Tifinagh workshop, “Guess the Word” in Tamazight, a Yennayer quiz, traditional Kabyle dishes and clothes, and music.",
          cover: "/images/events/2025-26/yennayer/cover.webp",
        },
        {
          id: "movie-night-2",
          start: "2026-02",
          title: "Movie Night: Dune",
          date: "Feb 2026",
          place: "ESTIN",
          tags: ["Relaxation"],
          icon: "movie",
          summary: "A second movie night, with Dune: Part One on the big screen.",
          cover: "/images/events/2025-26/movie-night-2/cover.webp",
        },
        {
          id: "qa3da-musicale",
          start: "2026-02-12T20:30:00+01:00",
          title: "Qa3da Musicale",
          date: "12 Feb 2026",
          place: "RASA room",
          tags: ["Music", "with LDC"],
          icon: "music_note",
          summary: "An open musical evening in our room to decompress after a heavy week.",
          cover: "/images/events/2025-26/qa3da-musicale/cover.webp",
        },
        {
          id: "chess-cup",
          start: "2026-02-15",
          end: "2026-02-17",
          title: "RASA Chess Cup",
          date: "15–17 Feb 2026",
          place: "ESTIN",
          tags: ["Chess", "100% RASA"],
          icon: "chess",
          summary:
            "Our first chess tournament: three days of games and a champion, Sameur Adel. A new yearly rendezvous was born.",
          stat: "24 players",
          cover: "/images/chess-cup-2026/9.webp",
          link: { href: "/chess#chess-cup", label: "See the recap" },
          highlight: true,
        },
        {
          id: "tikjda",
          start: "2026-04",
          title: "Tikjda trip",
          date: "Apr 2026",
          place: "Tikjda, Bouira",
          tags: ["Outing", "Sinay Travel · Orca club"],
          icon: "landscape",
          summary: "Discovering the Djurdjura mountains together, with the support of Sinay Travel and the Orca club.",
          stat: "656 likes on the video",
          cover: "/images/events/2025-26/tikjda/cover.webp",
          link: { href: "https://www.instagram.com/rasa.estin/reel/DW_1HyADGjc/", label: "Watch reel" },
          highlight: true,
        },
        {
          id: "communication",
          notAnEvent: true,
          title: "Wishes & year retrospective",
          date: "All year",
          place: "Instagram",
          tags: ["Communication", "Multimedia"],
          icon: "campaign",
          summary:
            "Ramadan, 8 March and Eid el-Fitr wishes, and a retrospective video thanking every member of the team.",
          cover: null,
        },
      ],
    },
  ],
};
