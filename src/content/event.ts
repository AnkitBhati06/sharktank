/**
 * Single source of truth for Shark Tank IIITV 2026.
 *
 * Every component reads from this file. To change a date, a rule, a contact or
 * the registration link, edit it here and redeploy. Nothing event-specific is
 * hard-coded in the components.
 *
 * Text fields may use **double asterisks** for bold and _underscores_ for the
 * red italic accent used in headings. Dates are ISO strings in IST (+05:30).
 */

/* ------------------------------------------------------------------ */
/* Editable settings                                                   */
/* ------------------------------------------------------------------ */

export const config = {
  siteUrl: "https://sharktank.iiitvecell.in", // the live address (used for link previews)
  registrationUrl: "", // [PLACEHOLDER] Google Form link, e.g. "https://forms.gle/..."
  prizePool: "", // [PLACEHOLDER] e.g. "₹50,000"
  round1Deadline: "2026-10-22T23:59:00+05:30",
  instagram: "https://www.instagram.com/iiitvadodara_ecell/",
  contacts: [
    { name: "Ankit Bhati", role: "Secretary, E-Cell", phone: "" }, // [PLACEHOLDER]
    { name: "Harshil Dodia", role: "Junior Secretary, E-Cell", phone: "" }, // [PLACEHOLDER]
  ] as Contact[],
};

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Contact = { name: string; role: string; phone: string };

export type DiveId = 1 | 2 | 3 | 4;

export type Dive = {
  id: DiveId;
  number: string;
  title: string;
  meta: string;
  hook: string;
  /** Label before the window in the card ("Window" or "Date"). */
  windowLabel: string;
  windowText: string;
  start: string;
  end: string;
  depth: number;
  depthText: string;
  windowLength: string;
  format: string;
  rules: string[];
  /** Short line for the mobile depth ladder. */
  ladderNote: string;
  /** Short caption for the chart station. */
  chartNote: string;
};

export type ScheduleItem = {
  time: string;
  title: string;
  detail: string;
  place: string;
  kind: "pitch" | "break" | "normal";
};

export type RuleTab = { id: string; label: string; prefix: string; items: string[] };
export type Faq = { q: string; a: string };
export type Chapter = { id: string; no: string; name: string };

/* ------------------------------------------------------------------ */
/* Event                                                               */
/* ------------------------------------------------------------------ */

export const event = {
  name: "Shark Tank IIITV",
  year: 2026,
  edition: "The Descent",
  organiser: "E-Cell, IIIT Vadodara",
  organiserShort: "E-Cell · IIIT Vadodara",
  venue: "Indian Institute of Information Technology, Vadodara",
  venueShort: "IIIT Vadodara",
  mapsUrl: "https://maps.google.com/?q=IIIT+Vadodara",
  instagramHandle: "@iiitvadodara_ecell",
  reportingRoom: "Room 9001",
  pitchRoom: "Conference Room 9005",
  /** Expedition range used by the chart (start of Dive 01 to start of the finale). */
  rangeStart: "2026-10-18T00:00:00+05:30",
  rangeEnd: "2026-11-01T00:00:00+05:30",
  heroDates: { from: "18 Oct", to: "01 Nov" },
  heroStatus: {
    open: "Registrations open · 2026",
    round1Closed: "Dive 01 closed · Finale 1 Nov",
    complete: "Expedition 2026 complete",
  },
  heroSub: "Grand Finale · IIIT Vadodara",
  heroNote: "Free entry · Teams of 1–4 · Open to other colleges",
  pitchSeconds: 300,
  qaSeconds: 180,
  finaleDay: { day: "01", month: "11", label: "1 November" },
};

export const chapters: Chapter[] = [
  { id: "top", no: "00", name: "The porthole" },
  { id: "statement", no: "01", name: "The expedition" },
  { id: "logs", no: "02", name: "Dive logs" },
  { id: "chart", no: "03", name: "The chart" },
  { id: "fieldday", no: "04", name: "Field day" },
  { id: "sealed", no: "05", name: "Sealed files" },
  { id: "register", no: "06", name: "Register" },
  { id: "rules", no: "07", name: "Rules & FAQ" },
  { id: "crew", no: "08", name: "The crew" },
  { id: "end", no: "09", name: "End of log" },
];

export const menu = [
  { href: "#statement", label: "The expedition" },
  { href: "#logs", label: "Dive logs" },
  { href: "#chart", label: "The jury" },
  { href: "#fieldday", label: "Field day · 01 Nov" },
  { href: "#rules", label: "Rules & FAQ" },
  { href: "#register", label: "Register" },
];

export const statement = {
  label: "The expedition",
  lead: "For two weeks this October, the tank opens to student founders from campuses beyond ours. Builders, thinkers and makers with an idea worth defending.",
  body: "**Shark Tank IIITV** is the startup pitching competition of E-Cell, IIIT Vadodara. This year it runs as an expedition through four depths: **a pitch deck, a video pitch, the finalist call** and **a live grand finale** in front of the jury. Each dive is harder than the last. Only the strongest ideas come back up.",
};

export const diveLogsIntro = {
  kicker: "Four dives · One tank",
  heading: "Dive logs.",
  lead: "Every round is a dive, and every dive goes deeper. Read the log before you jump.",
};

export const dives: Dive[] = [
  {
    id: 1,
    number: "01",
    title: "The Shallows",
    meta: "Round 01 · Pitch deck · Online",
    hook: "Send the deck. Everyone gets wet.",
    windowLabel: "Window",
    windowText: "18–22 Oct",
    start: "2026-10-18T00:00:00+05:30",
    end: "2026-10-22T23:59:00+05:30",
    depth: 100,
    depthText: "−100 m",
    windowLength: "5 days",
    format: "PDF deck",
    rules: [
      "PDF only, **10–12 slides** max.",
      "Cover problem, solution, target market, business model, competition and team.",
      "Name it **TeamName_CollegeName.pdf**.",
      "Closes **22 Oct, 11:59 PM IST**. No late entries.",
    ],
    ladderNote: "18–22 Oct · Pitch deck",
    chartNote: "18–22 OCT · ROUND 1",
  },
  {
    id: 2,
    number: "02",
    title: "The Drop-off",
    meta: "Round 02 · Video pitch · Online",
    hook: "One take. Three minutes. The floor falls away.",
    windowLabel: "Window",
    windowText: "24–27 Oct",
    start: "2026-10-24T00:00:00+05:30",
    end: "2026-10-27T23:59:00+05:30",
    depth: 400,
    depthText: "−400 m",
    windowLength: "4 days",
    format: "3-min video",
    rules: [
      "Only teams **shortlisted from Round 1**.",
      "**3 minutes** max.",
      "At least **one founder on camera**.",
      "**Unlisted YouTube or Google Drive** link with view access.",
    ],
    ladderNote: "24–27 Oct · Video pitch",
    chartNote: "24–27 OCT · ROUND 2",
  },
  {
    id: 3,
    number: "03",
    title: "The Trench",
    meta: "Results · By email",
    hook: "Finalists surface. Everyone else stays in the dark.",
    windowLabel: "Date",
    windowText: "29 Oct",
    start: "2026-10-29T00:00:00+05:30",
    end: "2026-10-29T23:59:00+05:30",
    depth: 700,
    depthText: "−700 m",
    windowLength: "1 day",
    format: "Email",
    rules: [
      "Finalists **announced on 29 Oct**.",
      "Every finalist team is **contacted by email**.",
      "Check your inbox and spam folder that day.",
    ],
    ladderNote: "29 Oct · Finalists",
    chartNote: "29 OCT · FINALISTS",
  },
  {
    id: 4,
    number: "04",
    title: "The Tank",
    meta: "Grand Finale · Offline · IIIT Vadodara",
    hook: "Five minutes. One room. No screen to hide behind.",
    windowLabel: "Date",
    windowText: "01 Nov",
    start: "2026-11-01T00:00:00+05:30",
    end: "2026-11-01T23:59:00+05:30",
    depth: 1000,
    depthText: "−1000 m",
    windowLength: "1 day",
    format: "Live, 5 + 3",
    rules: [
      "Report at **Room 9001, 9–10 AM**, with your college ID.",
      "**5 min** pitch, **3 min** jury Q&A.",
      "Pitches in **Conference Room 9005**.",
      "Bring your deck on a **pen drive** and email it a day before.",
    ],
    ladderNote: "01 Nov · Grand Finale",
    chartNote: "01 NOV · FINALE",
  },
];

export const chartCopy = {
  kicker: "Plate II · The expedition chart",
  heading: "Fourteen days, _a thousand metres._",
  caption: "Fig. A · Depth of each dive against the calendar, drawn to scale",
  range: "18 OCT → 01 NOV 2026",
};

export const specimen = {
  label: "Fig. 01 · The jury, annotated",
  aside: "Specimen observed at every finale",
  notes: [
    { pin: "A", label: "A · The eye", title: "Sees through vague problems.", text: "Show who is hurting and how badly, in one slide." },
    { pin: "B", label: "B · The fin", title: "Cuts through big numbers.", text: "A real market you can reach beats a huge one you cannot." },
    { pin: "C", label: "C · The bite", title: "Three minutes of questions.", text: "Know your numbers, your competition and why your team wins." },
  ],
};

export const fieldDay = {
  kicker: "Dive 04 · Field day",
  where: "IIIT Vadodara",
  whereSub: "Grand Finale · Run of show",
  schedule: [
    { time: "09:00 – 10:00 AM", title: "Reporting", detail: "Finalist teams check in. Carry your college ID.", place: "Room 9001", kind: "normal" },
    { time: "10:20 AM – 01:00 PM", title: "Pitching, session one", detail: "Live pitches followed by jury Q&A.", place: "Conference Room 9005", kind: "pitch" },
    { time: "01:00 – 01:30 PM", title: "Break", detail: "Come up for air.", place: "—", kind: "break" },
    { time: "01:30 – 03:00 PM", title: "Pitching, session two", detail: "The remaining teams pitch to the jury.", place: "Conference Room 9005", kind: "pitch" },
  ] as ScheduleItem[],
  clock: {
    kicker: "Instrument · Pitch clock",
    heading: "Can you say it in _five minutes?_",
    lead: "This is the gauge finalists pitch against. Teal is your five minutes. When the needle crosses into red, the jury has three minutes of questions. Rehearse against it.",
  },
};

export const sealed = {
  kicker: "Sealed files",
  heading: "Some things _surface later._",
  prize: {
    tab: "FILE 01",
    label: "Prize pool",
    title: "What the winners take home.",
    sealedNote: "Sealed for now. E-Cell will announce the prize pool before the finale.",
    openNote: "Total prize pool for Shark Tank IIITV 2026.",
    denied: "Access denied · Declassified before 01 Nov",
  },
  jury: {
    tab: "FILE 02",
    label: "The jury",
    title: "Who sits in Conference Room 9005.",
    note: "Finalists pitch to the jury on 1 November. Names will be revealed closer to the day.",
    denied: "Access denied · Declassified before 01 Nov",
  },
};

export const register = {
  kicker: "Dive 01 closes · 22 Oct 2026 · 11:59 PM IST",
  heading: "Air left to _jump in._",
  closedHeading: "Dive 01 _has closed._",
  steps: [
    { label: "Step 01", title: "Register your team", text: "Fill the registration form. 1 to 4 students per team." },
    { label: "Step 02", title: "Send your deck", text: "18–22 Oct. PDF, named TeamName_CollegeName.pdf." },
    { label: "Step 03", title: "Watch your inbox", text: "Shortlisted teams get Round 2 details by email." },
  ],
  cta: "Open the registration form",
  ctaSoon: "Registration form opens soon",
  note: "Only for students outside IIIT Vadodara.",
  noteSoon: "The form link will appear here. Only for students outside IIIT Vadodara.",
};

export const rules = {
  kicker: "Rules of the expedition",
  heading: "Know the _water._",
  tabs: [
    {
      id: "general",
      label: "General",
      prefix: "G",
      items: [
        "Teams can have **1 to 4 members**. Members may be from different colleges.",
        "All members must be **currently enrolled students** with a valid college ID.",
        "One person can be part of **only one team**.",
        "The idea must be **original**. Plagiarism leads to disqualification.",
        "The **jury's decision is final** and binding.",
        "Organisers may change rules or schedule. Updates go out by email.",
      ],
    },
    {
      id: "dive01",
      label: "Dive 01",
      prefix: "R1",
      items: [
        "Pitch deck in **PDF format** only.",
        "**10–12 slides** maximum.",
        "Cover problem, solution, target market, business model, competition and team.",
        "Name the file **TeamName_CollegeName.pdf**.",
        "No submissions after **22 Oct, 11:59 PM**.",
      ],
    },
    {
      id: "dive02",
      label: "Dive 02",
      prefix: "R2",
      items: [
        "Only teams **shortlisted in Round 1** take part.",
        "Video length **3 minutes maximum**.",
        "At least one member must **appear on camera**.",
        "Share as an **unlisted YouTube or Google Drive** link with view access.",
        "Submit between **24 and 27 Oct 2026**.",
      ],
    },
    {
      id: "finale",
      label: "Finale",
      prefix: "F",
      items: [
        "Report at **Room 9001 by 10:00 AM** with your college ID.",
        "**5 minutes to pitch + 3 minutes Q&A** per team.",
        "Bring your deck on a **pen drive** and email it a day before.",
        "Pitching order is shared on the day.",
        "Teams absent when called may be disqualified.",
      ],
    },
  ] as RuleTab[],
};

export const faq = {
  kicker: "Questions from the shallow end",
  heading: "Ask before _you jump._",
  items: [
    { q: "Who can take part?", a: "Currently enrolled students from colleges other than IIIT Vadodara. Every member needs a valid college ID." },
    { q: "How big can a team be?", a: "1 to 4 members, and members may come from different colleges. One person can be in only one team." },
    { q: "Does it cost anything?", a: "No. Entry is free." },
    { q: "What do I submit in Dive 01?", a: "A PDF pitch deck of 10–12 slides covering problem, solution, target market, business model, competition and team, named TeamName_CollegeName.pdf, between 18 and 22 Oct 2026 (11:59 PM IST)." },
    { q: "What is Dive 02?", a: "Shortlisted teams submit a video pitch of up to 3 minutes with at least one member on camera, as an unlisted YouTube or Google Drive link, between 24 and 27 Oct 2026." },
    { q: "When are finalists announced?", a: "On 29 Oct 2026, by email." },
    { q: "What happens on finale day?", a: "On 1 Nov 2026, finalists report at Room 9001 between 9 and 10 AM, then pitch live in Conference Room 9005: 5 minutes of pitch and 3 minutes of jury Q&A. Bring your deck on a pen drive and email it a day before." },
  ] as Faq[],
};

export const crew = {
  kicker: "Radio the crew",
  heading: "Lost at sea? _Reach us._",
  venueLabel: "Finale venue",
  venueNote: "Reporting in Room 9001 · Pitches in Conference Room 9005",
  phoneMissing: "Number to be added",
};

export const ending = {
  label: "Log closes · See you at −1000 m",
};

export const seo = {
  title: "Shark Tank IIITV 2026 · The Expedition Logbook",
  description: "Four dives. One tank. Grand Finale at IIIT Vadodara on 1 November 2026.",
};
