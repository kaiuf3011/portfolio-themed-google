// Resume copy, from the resume section of CONTENT.md. Contact details come from content/site.ts.

export const resume = {
  headline: "AI / ML Engineer in progress · Full-Stack · XR & Games",
  summary:
    "Computer Science Engineering student specialising in AI & Machine Learning (CGPA 9.04) who learns by building. Experienced in retrieval-augmented generation, full-stack development and immersive tech; SIH 2025 national finalist, Best Performing Team at the SIH 2026 IDE Bootcamp, and a veteran of 10+ hackathons.",
  // TODO: phone number. Null hides it.
  phone: null as string | null,
  education: {
    degree: "B.E. Computer Science & Engineering — Artificial Intelligence & Machine Learning",
    school: "Rathinam Global Deemed to be University",
    detail: "CGPA 9.04 / 10",
  },
  projects: [
    {
      slug: "rgu-ai-assistant",
      title: "RGU AI Assistant — RAG university assistant",
      status: "Prototype",
      bullets: [
        "Built a conversational assistant that answers student queries from a structured institutional knowledge base using retrieval-augmented generation.",
        "Fixed retrieval contamination from short acronyms with an exact-match routing layer ahead of vector search, blending sparse (Fuse.js) and semantic (ChromaDB) retrieval.",
        "Added intent classification and routing, conversation-state management, and honest fallbacks when retrieval confidence is low.",
      ],
      stack: ["TypeScript", "Node.js", "ChromaDB", "Fuse.js", "LLM APIs"],
    },
    {
      slug: "seismora",
      title: "SEISMORA — portable soft-insert contouring device",
      status: "SIH 2025 Finalist",
      bullets: [
        "Co-developed a compact, portable device for contouring the soft inserts of 3D-printed prosthetic sockets; presented working prototypes at the SIH 2025 grand finale.",
      ],
      stack: ["Assistive tech", "Hardware prototyping", "Product design", "3D printing"],
    },
    {
      slug: "jharkhand-safety-ar",
      title: "Jharkhand Safety AR — AR / VR industrial safety training",
      status: "SIH 2026 · Prototype",
      bullets: ["Immersive safety-training system combining AR hazard identification, camera-based visual recognition and interactive VR scenarios."],
      stack: ["Python", "FastAPI", "Computer vision", "AR/VR"],
    },
    {
      slug: "aphelion-ai",
      title: "Aphelion AI — space-weather intelligence platform",
      status: "In development",
      bullets: [
        "Modular pipeline analysing solar X-ray data (SoLEXS, HEL1OS) from India's Aditya-L1 mission: historical retrieval, time-series feature engineering and a mission-control dashboard.",
      ],
      stack: ["Python", "Time-series", "AI/ML", "Data visualization"],
    },
    {
      slug: "the-knight",
      title: "The Knight — 2D platformer",
      status: "Completed",
      bullets: ["Unity / C# platformer covering player movement, collision handling and level design."],
      stack: ["Unity", "C#"],
    },
  ],
  achievements: [
    { title: "Best Performing Team", detail: "SIH 2026 IDE Bootcamp, Thiagarajar College of Engineering, Madurai (May 2026)", color: "#fbbc04" },
    { title: "National Finalist", detail: "Smart India Hackathon 2025, with SEISMORA", color: "#34a853" },
    { title: "Participant", detail: "Global Game Jam 2026, Kerala", color: "#4285f4" },
    { title: "10+ hackathons", detail: "Prototyping and pitching under tight deadlines", color: "#ea4335" },
  ],
  leadership: [
    { title: "Moderator, TEDxRTC", detail: "Moderated sessions and coordinated speaker–audience conversation" },
    { title: "Founder (in progress)", detail: "Game-development community for student builders" },
  ],
  skills: [
    { area: "AI / ML", items: "RAG, LLM integration, intent classification, vector search, data processing", tint: "#d2e3fc" },
    { area: "Languages", items: "Python, Java, JavaScript, TypeScript, C#", tint: "#feefc3" },
    { area: "Web", items: "React, Node.js, Express, FastAPI, Tailwind CSS", tint: "#ceead6" },
    { area: "Data & Infra", items: "ChromaDB, Redis, Docker, Git & GitHub, REST APIs", tint: "#f1f3f4" },
    { area: "Immersive", items: "Unity, AR / VR, Vuforia, ARCore / ARKit, Blender, 3D scanning", tint: "#fad2cf" },
    { area: "Learning", items: "AI agents, computer vision, shaders", tint: "#feefc3" },
  ],
};
