// Single source of truth for everything the site says about Kaiuf.
// Derived from CONTENT.md. Anything marked TODO is a placeholder to replace before shipping.

export type BrandColor = "blue" | "red" | "yellow" | "green";

export const site = {
  name: "Kaiuf",
  fullName: "Kaiuf M",
  title: "Kaiuf M — Engineer by curiosity",
  description:
    "Kaiuf M — CSE (AI & ML) student building AI systems, RAG assistants, AR/VR experiences and games.",
  descriptor: "AI / ML engineer & creative technologist",
  // TODO: replace placeholders with real handles.
  email: "hello@example.com",
  github: "https://github.com/kaiuf3011",
  linkedin: "https://linkedin.com/in/your-handle",
  resume: "/Kaiuf_M_Resume.pdf",
  basedIn: "Coimbatore, India",
  // TODO: confirm this is true. Set to null to hide the status row entirely.
  status: "Open to internships and freelance" as string | null,
  portrait: { src: "/images/kaiuf.jpg", alt: "Portrait of Kaiuf", width: 610, height: 690 },
};

export const about = {
  who: "Kaiuf M is a Computer Science Engineering student specialising in Artificial Intelligence & Machine Learning at Rathinam Global Deemed to be University, building AI systems, immersive experiences and games that connect software with the real world.",
  definition:
    "An engineer by curiosity and a builder by instinct, who turns ambitious ideas into working prototypes — and isn't afraid to break them to find out why.",
  manifesto: [
    ["Most people wait until they feel ready.", "I build to get ready."],
    ["The best way to learn engineering is to build things.", "Then break them — on purpose."],
    ["Understand why it failed. Make it better.", "Repeat until it's real."],
  ] as const,
  stats: [
    { value: "10+", label: "Hackathons" },
    { value: "2", label: "SIH projects" },
    { value: "9.04", label: "CGPA" },
    { value: "6", label: "Featured builds" },
  ],
  education: {
    degree: "B.E. Computer Science & Engineering (AI & ML)",
    school: "Rathinam Global Deemed to be University",
    cgpa: "9.04 / 10",
    // TODO: graduation year
    expected: null as string | null,
  },
};

export type Section = { id: string; heading: string; body: string[]; flow?: string[] };

export type Project = {
  slug: string;
  name: string;
  /** Result title line, the way a search result would phrase it. */
  title: string;
  category: string;
  color: BrandColor;
  status: string;
  badge?: string;
  tags: string[];
  /** Extra search keywords that aren't visible as tags. */
  keywords: string[];
  snippet: string;
  outcome: string;
  facts: { label: string; value: string }[];
  sections: Section[];
  photo?: { src: string; alt: string; width: number; height: number };
  cta: string;
  // TODO: real links (demo, code). Empty means the sitelink is hidden.
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "aphelion-ai",
    name: "Aphelion AI",
    title: "Aphelion AI — space-weather intelligence from Aditya-L1",
    category: "AI and data",
    color: "blue",
    status: "In development",
    tags: ["Python", "Time-series", "AI/ML", "Data visualization"],
    keywords: ["space", "weather", "solar", "xray", "x-ray", "isro", "aditya", "solexs", "hel1os", "dashboard", "ai", "ml", "data"],
    snippet:
      "Space-weather intelligence from India's Aditya-L1 mission: a modular pipeline turning solar X-ray data (SoLEXS & HEL1OS) into insight, with a mission-control dashboard.",
    outcome: "A modular pipeline that turns raw solar X-ray flux into something a human can read.",
    facts: [
      { label: "Status", value: "In development" },
      { label: "Stack", value: "Python, time-series analysis, AI/ML" },
      { label: "Data", value: "SoLEXS & HEL1OS, Aditya-L1" },
    ],
    sections: [
      {
        id: "overview",
        heading: "What it is",
        body: [
          "Aphelion AI is a space-weather intelligence platform built on solar X-ray data from India's Aditya-L1 mission. It reads instrument data from SoLEXS and HEL1OS and turns it into insight a person can act on.",
        ],
      },
      {
        id: "built",
        heading: "What I'm building",
        body: [
          "A modular pipeline with three stages: historical data retrieval, time-series feature engineering, and a mission-control dashboard on top.",
        ],
        flow: ["Historical retrieval", "Feature engineering", "Mission-control dashboard"],
      },
      {
        id: "next",
        heading: "Where it's at",
        body: ["In active development. The pipeline is modular on purpose, so each stage can be swapped as the models improve."],
      },
    ],
    cta: "View project",
    links: [],
  },
  {
    slug: "rgu-ai-assistant",
    name: "RGU AI Assistant",
    title: "RGU AI Assistant — a university assistant that answers, not guesses",
    category: "AI and RAG",
    color: "red",
    status: "Prototype",
    tags: ["TypeScript", "Node.js", "ChromaDB", "Fuse.js", "LLM APIs"],
    keywords: ["rag", "retrieval", "chatbot", "assistant", "university", "llm", "vector", "search", "ai", "agents", "intent"],
    snippet:
      "A university assistant that answers from a real knowledge base, not guesses. Exact-match routing and keyword retrieval stopped short acronyms from pulling up the wrong documents.",
    outcome: "Fixed retrieval contamination from short acronyms with an exact-match router ahead of vector search.",
    facts: [
      { label: "Status", value: "Prototype" },
      { label: "Stack", value: "TypeScript, Node.js, ChromaDB, Fuse.js" },
      { label: "Type", value: "Retrieval-augmented generation" },
    ],
    sections: [
      {
        id: "flow",
        heading: "How a query flows",
        body: ["Every question passes through five stages before anything is generated."],
        flow: ["User query", "Intent classifier", "Exact-match router", "Hybrid retrieval (ChromaDB + Fuse.js)", "Grounded LLM answer"],
      },
      {
        id: "problem",
        heading: "The problem",
        body: [
          "Pure semantic search was contaminating results. Short acronyms, like department and course codes, matched the wrong documents because embeddings treat them as near-synonyms. Students got confident answers about the wrong program.",
        ],
      },
      {
        id: "built",
        heading: "What I built",
        body: [
          "An exact-match routing layer that catches known entities and acronyms before vector search, plus sparse keyword retrieval through Fuse.js blended with ChromaDB results.",
          "Conversation state carries context between turns, and a fallback path responds honestly when retrieval confidence is low.",
        ],
      },
      {
        id: "result",
        heading: "Result",
        // TODO: add before/after accuracy numbers from your tests.
        body: ["Acronym queries now route to the right documents instead of their nearest embedding neighbours. Before-and-after accuracy numbers are being written up."],
      },
    ],
    cta: "Explore architecture",
    links: [],
  },
  {
    slug: "jharkhand-safety-ar",
    name: "Jharkhand Safety AR",
    title: "Jharkhand Safety AR — see the hazard before it hurts anyone",
    category: "XR and vision",
    color: "yellow",
    status: "Prototype",
    badge: "SIH 2026",
    tags: ["Python", "FastAPI", "Computer vision", "AR/VR"],
    keywords: ["ar", "vr", "xr", "safety", "industrial", "hazard", "ppe", "vision", "camera", "training", "3d", "sih", "hackathon", "immersive"],
    snippet:
      "Industrial safety training that shows the hazard before it hurts anyone: AR hazard detection, camera-based recognition and interactive VR scenarios.",
    outcome: "An immersive safety-training system built for Smart India Hackathon 2026.",
    facts: [
      { label: "Status", value: "Prototype" },
      { label: "Stack", value: "Python, FastAPI, computer vision" },
      { label: "Built for", value: "Smart India Hackathon 2026" },
    ],
    sections: [
      {
        id: "overview",
        heading: "What it is",
        body: [
          "An immersive training system for industrial safety. Instead of reading about hazards, trainees see them flagged in their own surroundings.",
        ],
      },
      {
        id: "built",
        heading: "What it combines",
        body: ["Three pieces work together."],
        flow: ["AR hazard identification", "Camera-based visual recognition", "Interactive VR scenarios"],
      },
    ],
    cta: "View project",
    links: [],
  },
  {
    slug: "seismora",
    name: "Seismora",
    title: "Seismora — portable contouring for prosthetic socket inserts",
    category: "Hardware",
    color: "green",
    status: "Prototype",
    badge: "SIH 2025 finalist",
    tags: ["Hardware", "Product design", "3D printing"],
    keywords: ["prosthetic", "prosthetics", "assistive", "device", "3d", "printing", "sih", "hackathon", "finalist", "socket", "medical"],
    snippet:
      "A compact, portable device for contouring the soft inserts of 3D-printed prosthetic sockets — practical engineering in service of assistive technology.",
    outcome: "Taken all the way to the Smart India Hackathon 2025 grand finale.",
    facts: [
      { label: "Status", value: "Prototype" },
      { label: "Areas", value: "Assistive tech, hardware, 3D printing" },
      { label: "Recognition", value: "SIH 2025 national finalist" },
    ],
    photo: {
      src: "/images/sih25-prototype.jpg",
      alt: "Seismora soft-insert prototypes on the team's table at the SIH 2025 finale",
      width: 768,
      height: 1024,
    },
    sections: [
      {
        id: "overview",
        heading: "What it is",
        body: [
          "A compact, portable device for contouring the soft inserts of 3D-printed prosthetic sockets. Practical engineering in service of assistive technology.",
        ],
      },
      {
        id: "result",
        heading: "Result",
        body: [
          "The team presented working prototypes at the Smart India Hackathon 2025 grand finale as national finalists.",
        ],
      },
    ],
    cta: "View project",
    links: [],
  },
  {
    slug: "the-knight",
    name: "The Knight",
    title: "The Knight — a 2D platformer where the jump feels right",
    category: "Games",
    color: "blue",
    status: "Completed",
    tags: ["Unity", "C#", "2D physics", "Level design"],
    keywords: ["game", "games", "unity", "platformer", "csharp", "c#", "gamedev", "physics", "3d", "play"],
    snippet:
      "A 2D platformer in Unity & C#: movement, collisions, level design, and all the small details that make a jump feel right.",
    outcome: "A finished platformer, and a small playable homage right on this page.",
    facts: [
      { label: "Status", value: "Completed" },
      { label: "Stack", value: "Unity, C#" },
      { label: "Focus", value: "Movement, collisions, level design" },
    ],
    sections: [
      {
        id: "overview",
        heading: "What it is",
        body: [
          "A 2D platformer built in Unity and C#. The work lives in the small stuff: player movement, collision handling, and level design.",
        ],
      },
      {
        id: "play",
        heading: "Try the feel",
        body: ["The canvas above is a tiny browser homage to the original. Arrow keys or A/D to move, Space or W to jump."],
      },
    ],
    cta: "Watch gameplay",
    links: [],
  },
  {
    slug: "mbbs-study-assistant",
    name: "MBBS Study Assistant",
    title: "MBBS AI Study Assistant — a study partner built on your own textbooks",
    category: "AI and EdTech",
    color: "red",
    status: "In development",
    tags: ["Python", "FastAPI", "Vector DB", "PWA"],
    keywords: ["medical", "mbbs", "study", "flashcards", "tutor", "rag", "edtech", "ai", "agents", "education"],
    snippet:
      "An AI study partner for medical students, built on their own textbooks. Planned: document Q&A, an AI tutor, flashcard generation and case-based practice.",
    outcome: "A RAG study platform for medical students, in development.",
    facts: [
      { label: "Status", value: "In development" },
      { label: "Stack", value: "Python, FastAPI, vector DB, PWA" },
      { label: "For", value: "Medical students" },
    ],
    sections: [
      {
        id: "overview",
        heading: "What it is",
        body: ["An AI study partner for medical students that answers from their own textbooks, not the open internet."],
      },
      {
        id: "next",
        heading: "What's planned",
        body: ["The roadmap, in order of build."],
        flow: ["Document Q&A", "AI tutor", "Flashcard generation", "Case-based practice"],
      },
    ],
    cta: "Follow progress",
    links: [],
  },
];

export type Milestone = {
  id: string;
  when: string;
  title: string;
  detail: string;
  kind: "experience" | "project" | "win";
  photo?: string;
};

// Ordered as a route. Undated items carry a descriptive "when" instead of a guessed date.
export const journey: Milestone[] = [
  { id: "start", when: "Day one", title: "B.E. CSE (AI & ML) begins", detail: "Rathinam Global Deemed to be University. CGPA 9.04 and counting.", kind: "experience" },
  { id: "hackathons", when: "Ongoing", title: "10+ hackathons", detail: "Prototype, pitch, ship, against the clock.", kind: "experience" },
  { id: "sih25", when: "2025", title: "SIH 2025 national finalist", detail: "Took Seismora to the grand finale.", kind: "win", photo: "/images/sih25-team.jpg" },
  { id: "tedx", when: "Community", title: "Moderator at TEDxRTC", detail: "Kept the conversation alive between speakers and audience.", kind: "experience", photo: "/images/tedx.jpg" },
  { id: "ggj", when: "2026", title: "Global Game Jam 2026", detail: "A weekend of building games at the Kerala site.", kind: "project", photo: "/images/ggj-2026.jpg" },
  { id: "sih26", when: "May 2026", title: "Best Performing Team", detail: "SIH 2026 IDE Bootcamp, Thiagarajar College of Engineering, Madurai.", kind: "win", photo: "/images/sih-2026-win.jpg" },
  { id: "now", when: "Now", title: "Building in public", detail: "Aphelion AI, the MBBS study assistant, and a game-dev community for student builders.", kind: "project" },
];

export type SkillNote = { id: string; title: string; color: BrandColor | "white"; items: string[] };

export const skills: SkillNote[] = [
  { id: "ai", title: "AI & machine learning", color: "blue", items: ["RAG", "LLM integration", "Intent classification", "Vector search", "Data processing"] },
  { id: "lang", title: "Languages", color: "yellow", items: ["Python", "Java", "JavaScript", "TypeScript", "C#"] },
  { id: "web", title: "Web & full-stack", color: "green", items: ["React", "Node.js", "Express", "FastAPI", "Tailwind CSS"] },
  { id: "infra", title: "Data & infra", color: "white", items: ["ChromaDB", "Redis", "Docker", "Git & GitHub", "REST APIs"] },
  { id: "xr", title: "Immersive & games", color: "red", items: ["Unity", "AR / VR", "Blender", "3D scanning", "Vuforia", "ARCore / ARKit"] },
  { id: "next", title: "Currently levelling up", color: "yellow", items: ["AI agents", "Computer vision", "Shaders"] },
];

export const techTicker = [
  "Python", "TypeScript", "JavaScript", "Java", "C#", "React", "Node.js", "FastAPI",
  "ChromaDB", "Redis", "Docker", "Unity", "Blender", "ARCore", "Vuforia",
];

export type Photo = { src: string; alt: string; caption: string; width: number; height: number; tag: string };

export const photos: Photo[] = [
  { src: "/images/sih-2026-win.jpg", alt: "Kaiuf and the team with the Best Performing Team trophy at Thiagarajar College of Engineering, Madurai", caption: "SIH 2026, Best Performing Team", width: 1182, height: 666, tag: "Wins" },
  { src: "/images/sih25-team.jpg", alt: "Kaiuf with the SIH 2025 team and mentors at the finale venue", caption: "SIH 2025, the finale crew", width: 1024, height: 768, tag: "Wins" },
  { src: "/images/sih25-prototype.jpg", alt: "Team around the Seismora prototypes", caption: "Seismora prototypes on the table", width: 768, height: 1024, tag: "Builds" },
  { src: "/images/tedx.jpg", alt: "Kaiuf on stage at TEDxRTC", caption: "On stage at TEDxRTC", width: 310, height: 552, tag: "Stage" },
  { src: "/images/ggj-2026.jpg", alt: "Global Game Jam 2026 at the Kerala site", caption: "Global Game Jam 2026, Kerala", width: 1024, height: 768, tag: "Builds" },
  { src: "/images/sih25-crew.jpg", alt: "Selfie with the SIH 2025 team in yellow team shirts", caption: "Team yellow", width: 1024, height: 768, tag: "Wins" },
  { src: "/images/kaiuf-mountain.jpg", alt: "Kaiuf somewhere above the clouds", caption: "Somewhere above the clouds", width: 1182, height: 666, tag: "Outside" },
  { src: "/images/kaiuf-lost.jpg", alt: "Kaiuf outdoors", caption: "Lost, on purpose", width: 1182, height: 666, tag: "Outside" },
];

export const experience = [
  { category: "Community", title: "Moderator at TEDxRTC", detail: "Keeping the conversation alive between speakers and audience." },
  { category: "Hackathons", title: "Technical contributor on hackathon teams", detail: "Prototype, pitch, ship — against the clock. 10+ events." },
  { category: "Game jam", title: "Global Game Jam 2026, Kerala", detail: "A weekend of building games with a team." },
  { category: "Initiative", title: "Founding a game-dev community", detail: "Where ambitious ideas become playable experiences. In development." },
  { category: "Beyond the code", title: "Always tinkering", detail: "Game mechanics, automotive & engine tech, 3D worlds, emerging AI tools — and experimental builds with friends." },
];

export type Faq = { q: string; a: string; action?: "compose" | "skills" | "rgu" };

export const peopleAlsoAsk: Faq[] = [
  { q: "What does Kaiuf study?", a: "B.E. Computer Science & Engineering, specialising in AI & Machine Learning, at Rathinam Global Deemed to be University. Current CGPA: 9.04." },
  { q: "Has Kaiuf won any hackathons?", a: "Yes. Best Performing Team at the SIH 2026 IDE Bootcamp (Thiagarajar College of Engineering, Madurai, May 2026), and national finalist at Smart India Hackathon 2025 with Seismora. 10+ hackathons in total." },
  { q: "How did the RGU assistant stop giving wrong answers?", a: "Short acronyms were matching the wrong documents in pure vector search. Kaiuf added an exact-match router ahead of retrieval and blended keyword search (Fuse.js) with ChromaDB, plus an honest fallback when confidence is low.", action: "rgu" },
  { q: "What does Kaiuf use to build games and XR?", a: "Unity and C#, Blender, AR/VR with Vuforia and ARCore/ARKit, and 3D scanning. Also: Global Game Jam 2026 in Kerala.", action: "skills" },
  { q: "How do I work with Kaiuf?", a: "Open the compose window and say hi. Internships, freelance projects and hackathon teams are all good reasons.", action: "compose" },
];

export const heroQueries = [
  "kaiuf hackathon wins",
  "kaiuf ai agents that actually work",
  "is kaiuf available for hire",
  "kaiuf games and 3d",
  "kaiuf resume",
];

export const suggestions = [
  "kaiuf projects",
  "kaiuf hackathon wins",
  "kaiuf ai agents that actually work",
  "is kaiuf available for hire",
  "kaiuf games and 3d",
  "kaiuf resume",
  "kaiuf rag assistant",
  "kaiuf photos",
  "kaiuf journey",
  "kaiuf skills",
  "ask kaiuf anything",
  "kaiuf cgpa",
  "contact kaiuf",
  ...projects.map((p) => p.name.toLowerCase()),
];

export const relatedSearches = [
  "kaiuf rag assistant",
  "kaiuf sih 2026",
  "kaiuf unity games",
  "kaiuf space weather ai",
  "kaiuf photos",
  "kaiuf skills",
];
