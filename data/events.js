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
//   link      optional { href, label } to a page or Instagram post
//   highlight true = shown on the homepage (keep it to 3 per season)
//
// Upcoming events go in RASA_EVENTS.upcoming; when an event is over, move it into its season.

window.RASA_EVENTS = {
  upcoming: [
    {
      id: "open-day-2026",
      title: "RASA's Open Day",
      date: "Date coming soon",
      place: "ESTIN, Amizour",
      tags: ["All departments"],
      icon: "celebration",
      summary:
        "Meet the 2026/27 board, discover every department and find your place in the club. Come curious, leave with a new family.",
      cover: "/images/events/upcoming/open-day-2026/cover.webp",
      link: { href: "https://www.instagram.com/rasa.estin/", label: "Follow for the date" },
    },
  ],

  seasons: [
    {
      id: "2025-26",
      title: "Season 2025/26",
      intro: "Eleven activities across literature, music, chess, heritage and outings: the year RASA grew up.",
      events: [
        {
          id: "welcome-day",
          title: "Welcome Day",
          date: "Oct 2025",
          place: "ESTIN",
          tags: ["All departments"],
          icon: "waving_hand",
          summary:
            "Our first contact with the new students: every department presented, social games and new members recruited.",
          stat: "568 likes on the video",
          cover: null,
          highlight: true,
        },
        {
          id: "movie-night",
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
          title: "Inter-club Yennayer celebration",
          date: "Feb 2026",
          place: "ESTIN",
          tags: ["RASA · LDC · ORIGO", "Amazigh heritage"],
          icon: "festival",
          summary:
            "Tifinagh workshop, “Guess the Word” in Tamazight, a Yennayer quiz, traditional Kabyle dishes and clothes, and music.",
          cover: null,
        },
        {
          id: "movie-night-2",
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
          title: "RASA Chess Cup",
          date: "15–17 Feb 2026",
          place: "ESTIN",
          tags: ["Chess", "100% RASA"],
          icon: "chess",
          summary:
            "Our first chess tournament: three days of games and a champion, Sameur Adel. A new yearly rendezvous was born.",
          stat: "24 players",
          cover: "/images/chess-cup-2026/9.webp",
          link: { href: "chess.html#chess-cup", label: "See the recap" },
          highlight: true,
        },
        {
          id: "tikjda",
          title: "Tikjda trip",
          date: "Apr 2026",
          place: "Tikjda, Bouira",
          tags: ["Outing", "Sinay Travel · Orca club"],
          icon: "landscape",
          summary: "Discovering the Djurdjura mountains together, with the support of Sinay Travel and the Orca club.",
          stat: "651 likes on the video",
          cover: "/images/events/2025-26/tikjda/cover.webp",
          highlight: true,
        },
        {
          id: "communication",
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
