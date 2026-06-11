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
  achievements: string[];
  contact: Contact;
}

export const portfolioData: PortfolioData = {
  personalInfo: {
    name: "Asish Panda",
    title: "Software Engineer at UiPath",
    subTitle: "TypeScript | React | Angular | Node.js | Generative AI",
    avatar: "assets/claw_portrait.png",
    bio: "Software Engineer at UiPath building high-scale automated systems, interactive web applications, and generative AI features. LeetCode Knight and competitive programmer.",
    location: "Bengaluru, India",
    resumeLink: "#"
  },
  
  about: {
    story: "Ahoy! I'm Asish Panda, a Software Engineer at UiPath who specializes in building end-to-end full stack web applications and automated systems. My programming journey is driven by solving complex algorithmic challenges and engineering rich, secure user interfaces. Much like Captain Claw navigating the high seas, I enjoy steering complex frontends, building robust API backends, and debugging deep asynchronous performance bottlenecks.",
    philosophy: "I believe that software engineering should merge high-performance design, rigorous security, and robust automation. From optimizing large-file asynchronous transfers to preventing XSS vulnerabilities and automating QA workflows, I build applications that are fast, secure, and resilient."
  },

  skills: [
    { name: "JavaScript / TypeScript", category: "Hard Skills", level: 95, color: "#3178c6", description: "Dynamic and strongly-typed programming, full-stack application development." },
    { name: "React / Next.js", category: "Hard Skills", level: 95, color: "#61dafb", description: "RSC rendering, state design, Monaco Editor custom integrations." },
    { name: "Angular & RxJS", category: "Hard Skills", level: 90, color: "#c2185b", description: "Enterprise frontend rendering, custom UI controls, and platform migrations." },
    { name: "Node.js / Express", category: "Hard Skills", level: 93, color: "#8cc84b", description: "Scalable backend orchestration, API design, and asynchronous workflows." },
    { name: "Generative AI & LLMs", category: "Hard Skills", level: 92, color: "#a855f7", description: "LLM-based orchestration (Autopilot), prompt design, and AI-driven UI generation." },
    { name: "DevOps Automation", category: "Hard Skills", level: 92, color: "#f68536", description: "Automated test execution in CI/CD pipelines, Jira/Slack ticket creation, and failure triage." },
    { name: "PostgreSQL & MongoDB", category: "Hard Skills", level: 88, color: "#4db33d", description: "Relational and document database schema design, indexing, and high efficiency." },
    { name: "REST APIs & Microservices", category: "Hard Skills", level: 90, color: "#ff6c37", description: "Highly scalable API designs, licensing APIs, and asynchronous payload executions." },
    { name: "Auth & Security", category: "Hard Skills", level: 90, color: "#ffd700", description: "DOMPurify-based XSS block sanitization and token expiry standardizations." }
  ],

  projects: [
    {
      id: "job-tracker",
      title: "Job Tracker",
      role: "Lead Creator",
      tech: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Vercel", "Chrome Extension"],
      description: "A full-stack job tracking web app that scrapes job postings and automates job application organizing, complete with browser extensions and passwordless auth.",
      highlights: [
        "Built Next.js App Router full-stack app leveraging React Server Components for optimal load performance.",
        "Created a Chrome extension that extracts LinkedIn/Indeed/Naukri job metadata and deep-links into the dashboard.",
        "Implemented Supabase passwordless Magic Link authentication and RLS policies for complete user data isolation."
      ],
      github: "https://github.com/aSysOverloaded/JobTracker",
      live: "https://example.com"
    },
    {
      id: "autopilot-escalations",
      title: "Autopilot for Agent Escalations",
      role: "Core Engineer",
      tech: ["React", "Angular", "Node.js", "Generative AI", "LLMs"],
      description: "An AI-powered automation workflow generator that translates natural language requests into operational workflow forms in real time.",
      highlights: [
        "Architected end-to-end system including LLM orchestration backend and dynamic rendering frontend.",
        "Reduced manual development effort by 90% through automated UI form generation pipelines."
      ],
      github: "",
      live: ""
    }
  ],

  experience: [
    {
      year: "July 2024 - Present",
      role: "Software Engineer SE1",
      company: "UiPath",
      description: "Architecting LLM orchestration engines (Autopilot for Escalations), Monaco Editor rich-text integrations with DOMPurify sanitization, automated Slack/Jira QA test reporting, and RxJS unified auth platform migrations."
    },
    {
      year: "Feb 2024 - July 2024",
      role: "Software Engineering Winter Intern",
      company: "UiPath",
      description: "Contributed to legacy system migrations to modern VB-based structures aligned with UiPath Studio, and designed/implemented Autopilot Apps Licensing APIs for enterprise request tracking."
    },
    {
      year: "May 2023 - July 2023",
      role: "Software Engineering Summer Intern",
      company: "UiPath",
      description: "Optimized App Action APIs (Import, Export, Clone) using asynchronous Node.js loops, resolving large payload failures (>60MB) and improving execution reliability."
    }
  ],

  education: [
    {
      degree: "Bachelor of Technology",
      field: "Electronics and Instrumentation Engineering",
      institution: "National Institute of Technology Rourkela",
      year: "2020 - 2024",
      description: "Graduated with a CGPA of 8.30/10."
    }
  ],

  achievements: [
    "Earned the title of Knight with 1864 rating in LeetCode (top 5% worldwide).",
    "Secured an AIR 160 Global Rank 864 out of 23k+ participants in LeetCode Biweekly 88.",
    "Attained the rank of Codeforces Specialist with maximum rating of 1494."
  ],
  
  contact: {
    email: "asishpandda@gmail.com",
    github: "https://github.com/aSysOverloaded",
    linkedin: "https://www.linkedin.com/in/asishpanda-ap/",
    twitter: "https://x.com/aSys_Overloaded"
  }
};
