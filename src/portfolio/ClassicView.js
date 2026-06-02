/* ==========================================================================
   CLASSIC WEB PORTFOLIO RENDERER: PORTFOLIO DATA BINDING CONTROLLER
   ========================================================================== */

import { portfolioData } from "../../portfolioData.js";

class ClassicViewManager {
  constructor() {
    this.initialized = false;
  }

  // Populate all sections dynamically from portfolioData
  init() {
    if (this.initialized) return;

    this.renderHero();
    this.renderAbout();
    this.renderSkills();
    this.renderProjects();
    this.renderExperience();
    this.renderContactInfo();
    this.setupContactForm();

    this.initialized = true;
  }

  renderHero() {
    const { name, subTitle, bio, avatar } = portfolioData.personalInfo;
    
    const portraitElement = document.querySelector(".hero-portrait");
    if (portraitElement) portraitElement.src = avatar;

    const subtitleElement = document.getElementById("hero-subtitle-field");
    if (subtitleElement) subtitleElement.textContent = subTitle;

    const nameElement = document.getElementById("hero-name-field");
    if (nameElement) nameElement.textContent = name;

    const bioElement = document.getElementById("hero-bio-field");
    if (bioElement) bioElement.textContent = bio;
  }

  renderAbout() {
    const { story, philosophy } = portfolioData.about;

    const storyElement = document.getElementById("about-story-field");
    if (storyElement) {
      // Split story by paragraphs if needed
      storyElement.innerHTML = `
        <p>${story}</p>
      `;
    }

    const philosophyElement = document.getElementById("about-philosophy-field");
    if (philosophyElement) philosophyElement.textContent = philosophy;
  }

  renderSkills() {
    const container = document.getElementById("skills-container-field");
    if (!container) return;

    container.innerHTML = "";

    portfolioData.skills.forEach(skill => {
      const card = document.createElement("div");
      card.className = "skill-card";
      card.innerHTML = `
        <div class="skill-card-top">
          <span class="skill-name">${skill.name}</span>
          <span class="skill-level-dial" style="color: ${skill.color}">${skill.level}%</span>
        </div>
        <div class="skill-bar-bg">
          <div class="skill-bar-fill" data-level="${skill.level}" style="background-color: ${skill.color}"></div>
        </div>
        <p class="skill-description">${skill.description}</p>
      `;
      container.appendChild(card);
    });
  }

  // Trigger animations for skill bars
  animateSkillBars() {
    const bars = document.querySelectorAll(".skill-bar-fill");
    bars.forEach(bar => {
      const targetLevel = bar.getAttribute("data-level");
      // Delay slightly for CSS transitions to take effect
      setTimeout(() => {
        bar.style.width = `${targetLevel}%`;
      }, 150);
    });
  }

  // Reset skill bars back to 0 width (for re-entry)
  resetSkillBars() {
    const bars = document.querySelectorAll(".skill-bar-fill");
    bars.forEach(bar => {
      bar.style.width = "0%";
    });
  }

  renderProjects() {
    const container = document.getElementById("projects-container-field");
    if (!container) return;

    container.innerHTML = "";

    portfolioData.projects.forEach(project => {
      const card = document.createElement("div");
      card.className = "project-card";
      
      // Generate tech tags html
      const tagsHtml = project.tech
        .map(t => `<span class="project-tag">${t}</span>`)
        .join("");

      // Highlight list html
      const highlightsHtml = project.highlights
        .map(h => `<li>${h}</li>`)
        .join("");

      card.innerHTML = `
        <div class="project-card-body">
          <h3 class="project-title">${project.title}</h3>
          <span class="scroll-project-tech" style="align-self: flex-start; margin-bottom: 0.5rem;">${project.role}</span>
          <p class="project-desc">${project.description}</p>
          <ul style="padding-left: 1.2rem; font-size: 0.85rem; opacity: 0.8; margin-bottom: 0.5rem; line-height: 1.5;">
            ${highlightsHtml}
          </ul>
          <div class="project-tech-tags">
            ${tagsHtml}
          </div>
          <div class="project-links">
            <a href="${project.github}" class="project-link" target="_blank" rel="noopener">Code (GitHub) →</a>
            <a href="${project.live}" class="project-link" target="_blank" rel="noopener">Live Demo →</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderExperience() {
    const timeline = document.getElementById("experience-timeline-field");
    if (!timeline) return;

    timeline.innerHTML = "";

    portfolioData.experience.forEach(exp => {
      const item = document.createElement("div");
      item.className = "timeline-item";
      item.innerHTML = `
        <span class="timeline-dot"></span>
        <div class="timeline-year">${exp.year}</div>
        <h3 class="timeline-role">${exp.role}</h3>
        <div class="timeline-company">${exp.company}</div>
        <p class="timeline-description">${exp.description}</p>
      `;
      timeline.appendChild(item);
    });
  }

  renderContactInfo() {
    const container = document.getElementById("contact-methods-field");
    if (!container) return;

    container.innerHTML = "";

    const { email, github, linkedin, twitter } = portfolioData.contact;

    const channels = [
      { name: "Email", value: email, url: `mailto:${email}`, icon: "✉️" },
      { name: "GitHub", value: "github.com/profile", url: github, icon: "🐙" },
      { name: "LinkedIn", value: "linkedin.com/in/profile", url: linkedin, icon: "💼" },
      { name: "Twitter", value: "twitter.com/profile", url: twitter, icon: "🐦" }
    ];

    channels.forEach(ch => {
      const item = document.createElement("div");
      item.className = "contact-method-item";
      item.innerHTML = `
        <div class="contact-icon-box">${ch.icon}</div>
        <div class="contact-method-details">
          <h4>${ch.name}</h4>
          <p><a href="${ch.url}" target="_blank" rel="noopener" style="color: inherit; text-decoration: none;">${ch.value}</a></p>
        </div>
      `;
      container.appendChild(item);
    });
  }

  setupContactForm() {
    const form = document.getElementById("portfolio-contact-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value;
      const email = document.getElementById("contact-email").value;
      const message = document.getElementById("contact-msg").value;

      // Simulated dynamic response overlay
      alert(`Ahoy, ${name}! Your dispatch has been sent successfully. Captain Asish will get in touch at ${email}!`);
      
      // Reset form
      form.reset();
    });
  }
}

export const ClassicView = new ClassicViewManager();
