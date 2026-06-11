/* ==========================================================================
   PORTFOLIO STRONGLY-TYPED DATA LAYER: CAPTAIN CLAW NEXT.JS MIGRATION
   ========================================================================== */

export interface Skill {
  name: string;
  category: "Hard Skills" | "Soft Skills";
  level: number;
  color: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  role: string;
  tech: string[];
  description: string;
  highlights: string[];
  github: string;
  live: string;
}

export interface Experience {
  year: string;
  role: string;
  company: string;
  description: string;
}

export interface PersonalInfo {
  name: string;
  title: string;
  subTitle: string;
  avatar: string;
  bio: string;
  location: string;
  resumeLink: string;
}

export interface About {
  story: string;
  philosophy: string;
}

export interface Contact {
  email: string;
  github: string;
  linkedin: string;
  twitter: string;
}

export interface Education {
  degree: string;
  field: string;
  institution: string;
  year: string;
  description: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  about: About;
  skills: Skill[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  contact: Contact;
}

export const portfolioData: PortfolioData = {
  personalInfo: {
    name: "Asish",
    title: "Full Stack Web Developer",
    subTitle: "Interactive UI Engineer & Digital Craftsman",
    avatar: "assets/claw_portrait.png",
    bio: "I build responsive, immersive, and high-fidelity web experiences. Combining deep expertise in modern web technologies with creative design, I turn complex requirements into interactive digital adventures.",
    location: "India",
    resumeLink: "#"
  },
  
  about: {
    story: "Ahoy! I'm Asish, a software developer who specializes in crafting exceptional digital experiences. My coding journey is fueled by a desire to push the boundaries of standard user interfaces. Much like Captain Claw searching for the Amulet of Nine Lives, I am constantly on a quest to master new technologies, solve challenging architectural puzzles, and deliver clean, performant code.",
    philosophy: "I believe that websites shouldn't just be viewed—they should be experienced. By blending standard software engineering principles with playful design, micro-interactions, and visual storytelling, I create software that leaves a lasting impression."
  },

  skills: [
    { name: "React / Angular", category: "Hard Skills", level: 95, color: "#61dafb", description: "Production-grade frontend, real-time UI." },
    { name: "TypeScript / Node.js", category: "Hard Skills", level: 93, color: "#3178c6", description: "Full-stack, APIs, middlewares." },
    { name: "LLMs & Generative AI", category: "Hard Skills", level: 90, color: "#a855f7", description: "Orchestration, AI-driven UI generation." },
    { name: "Test automation", category: "Hard Skills", level: 88, color: "#10b981", description: "Playwright, WebDriver.io, Karma." },
    { name: "Databases", category: "Hard Skills", level: 85, color: "#22c55e", description: "PostgreSQL, MySQL, MongoDB." },
    { name: "Security & auth", category: "Hard Skills", level: 87, color: "#f97316", description: "XSS prevention, OAuth, session flows." },
    { name: "Ownership", category: "Soft Skills", level: 100, color: "#a855f7", description: "Led end-to-end features solo." },
    { name: "Cross-team collaboration", category: "Soft Skills", level: 100, color: "#3178c6", description: "Coordinated changes across 4 teams." },
    { name: "Problem solving", category: "Soft Skills", level: 100, color: "#10b981", description: "Top 5% on LeetCode globally." },
    { name: "Fast ramp-up", category: "Soft Skills", level: 100, color: "#f7df1e", description: "Picked up complex RxJS codebase quickly." },
    { name: "Initiative", category: "Soft Skills", level: 100, color: "#ec4899", description: "Researched competitors, defined scope." }
  ],

  projects: [
    {
      id: "loot-ledger",
      title: "Loot Ledger",
      role: "Lead Developer",
      tech: ["React", "Node.js", "PostgreSQL", "TailwindCSS"],
      description: "A gamified financial dashboard tracking transactions, investments, and budgets. Features custom SVG charts, goal tracking progress meters, and dynamic animated milestones resembling leveling up in retro RPGs.",
      highlights: [
        "Architected scalable relational database schemas with high indexing efficiency.",
        "Created an interactive visual goal system that boosts user savings consistency by 25%.",
        "Implemented real-time CSV import parsing and automatic categorization."
      ],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      id: "cove-chat",
      title: "Cove Chat",
      role: "Full Stack Engineer",
      tech: ["HTML5 Canvas", "WebSockets", "Node.js", "Express"],
      description: "A real-time, interactive virtual hangout space where users customize custom pixel-art avatars and walk around a virtual docks map, chatting with others nearby via positional WebSocket connections.",
      highlights: [
        "Designed high-performance custom spatial coordinate partitioning.",
        "Built instant state synchronization matching client latency to under 35ms.",
        "Integrated secure cookie-based session management and state handling."
      ],
      github: "https://github.com",
      live: "https://example.com"
    },
    {
      id: "claw-engine",
      title: "The Claw Engine",
      role: "Creator",
      tech: ["Vanilla JS", "HTML5 Canvas", "Web Audio API"],
      description: "A lightweight, custom 2D collision and physics platformer framework built from scratch in vanilla JS. Featuring frame-rate independent updates, sprite map slicing, and programmatic synthesized sound effects.",
      highlights: [
        "Engineered an AABB collision resolver handles diagonal slopes and vertical moving platforms.",
        "Optimized sprite rendering pipeline pushing 60fps on mobile browser viewports.",
        "Coded dynamic programmatic sound effects avoiding large audio download footprints."
      ],
      github: "https://github.com",
      live: "https://example.com"
    }
  ],

  experience: [
    {
      year: "2024 - Present",
      role: "Senior Full Stack Engineer",
      company: "Buccaneer Tech Labs",
      description: "Leading frontend development of high-traffic consumer interfaces. Mentoring developers, designing internal state systems, and optimizing loading speed by 40%."
    },
    {
      year: "2022 - 2024",
      role: "Web Developer",
      company: "Cove Digital Agency",
      description: "Developed and shipped 15+ high-fidelity responsive websites. Integrated micro-animations and smooth scroll interactions, increasing landing page engagement metrics by 30%."
    }
  ],

  education: [
    {
      degree: "Bachelor of Technology",
      field: "Computer Science & Engineering",
      institution: "Valiant Maritime Institute of Technology",
      year: "2018 - 2022",
      description: "Graduated with honors. Specialized in Web Systems architectures, interactive computer graphics, and modular engineering. This academic foundation provided the rope to cross complex chasms of technical debt!"
    }
  ],
  
  contact: {
    email: "asish@example.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com"
  }
};
