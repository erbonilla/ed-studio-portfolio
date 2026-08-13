export const portfolioContent = {
  hero: {
    name: "Edgar Bonilla G.",
    role: "UI/UX Designer",
    domains: "Health · Wellness · Fitness · Endurance",
    location: "Costa Rica · Remote worldwide",
    /*
     * The single most decision-relevant fact for the visitor this page is for,
     * and it previously appeared only in the menu overlay and at the very
     * bottom of Contact — past the whole scroll sequence. Same claim as
     * `contact.availability[0]`; keep the two in step.
     */
    availability: "Open to full-time roles",
    headline: ["Designing", "clarity", "into motion."],
    close: ["Built for people", "in motion."],
    support:
      "Accessible digital products shaped with systems thinking, visual precision, and a bias for momentum.",
  },
  /*
   * Shown at the moment of decision. Every line here is already true elsewhere
   * on the site or in PRODUCT.md — no response-time promise, because none is
   * known. Do not add one.
   */
  contact: {
    availability: [
      { label: "Seeking", value: "Full-time UI/UX roles" },
      { label: "Location", value: "Zarcero, Costa Rica · remote worldwide" },
      { label: "Hours", value: "UTC−6, no daylight saving" },
      { label: "Languages", value: "English / Español" },
    ],
  },
  about: {
    lead: "I turn complex systems into clear, usable momentum.",
    leadLines: ["I turn", "complex", "systems into", "clear, usable", "momentum."],
    paragraphs: [
      "I’m Edgar Bonilla, a UI/UX designer focused on health, wellness, fitness, and endurance—spaces where confusing flows and inaccessible details carry real consequences. I connect research, interface design, and systems thinking to move teams from ambiguity to confident decisions.",
      "Accessibility is built in from the first sketch, not saved for the audit. I work in English and Spanish, collaborate remotely across disciplines, and use AI-assisted workflows with human review to accelerate the work without lowering the bar.",
    ],
    signals: ["WCAG 2.2 AA mindset", "English / Spanish", "Remote-ready", "End-to-end practice"],
  },
  expertise: {
    intro:
      "From the first unanswered question to the system a team can scale, every discipline serves the same goal: make the experience easier to trust and use.",
    areas: [
      {
        title: "UX Research",
        description:
          "Grounding decisions in evidence, with methods that respect the sensitivity of health-adjacent contexts.",
        capabilities: ["Interviews + usability testing", "Actionable synthesis", "Bilingual research"],
      },
      {
        title: "UI Design",
        description:
          "Type-led, disciplined interfaces where hierarchy, contrast, and rhythm carry the experience.",
        capabilities: ["Accessible visual systems", "Purposeful interaction", "Real-world usability"],
      },
      {
        title: "Design Systems",
        description:
          "Tokens, components, and documentation that keep quality coherent as teams and products scale.",
        capabilities: ["Token architecture", "Component specifications", "Adoption documentation"],
      },
      {
        title: "AI Workflows",
        description:
          "Human-led design pipelines that automate repetition, strengthen QA, and protect creative judgment.",
        capabilities: ["Prompt-to-component", "Design-to-code tokens", "Accessibility QA loops"],
      },
    ],
  },
} as const;
