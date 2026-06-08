/* ==========================================================================
   CLASSIC PORTFOLIO SITE VIEW: HIGH FIDELITY LAYOUT COMPONENT
   ========================================================================== */

"use client";

import React, { useEffect, useState } from "react";
import { portfolioData } from "../../portfolio/portfolioData";

interface ClassicPortfolioProps {
  onToggleGame: () => void;
}

export default function ClassicPortfolio({ onToggleGame }: ClassicPortfolioProps) {
  const [animateBars, setAnimateBars] = useState(false);
  const [cName, setCName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cMsg, setCMsg] = useState("");

  useEffect(() => {
    // Trigger progress bars slide animation upon component mounting
    const timer = setTimeout(() => {
      setAnimateBars(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Ahoy, ${cName}! Your dispatch has been sent successfully. Captain Asish will get in touch at ${cEmail}!`);
    setCName("");
    setCEmail("");
    setCMsg("");
  };

  const { name, subTitle, bio, avatar } = portfolioData.personalInfo;
  const { story, philosophy } = portfolioData.about;
  const { email, github, linkedin, twitter } = portfolioData.contact;

  return (
    <div id="classic-portfolio" className="view-section active" style={{ overflowY: "auto" }}>
      
      {/* 1. Navigation Header */}
      <nav className="classic-nav" aria-label="Main Navigation">
        <span className="classic-logo">CAPTAIN ASISH</span>
        <ul className="classic-nav-links">
          <li className="classic-nav-link"><a href="#about">About</a></li>
          <li className="classic-nav-link"><a href="#skills">Skills</a></li>
          <li className="classic-nav-link"><a href="#projects">Projects</a></li>
          <li className="classic-nav-link"><a href="#experience">Experience</a></li>
          <li className="classic-nav-link"><a href="#education">Education</a></li>
          <li className="classic-nav-link"><a href="#contact">Contact</a></li>
        </ul>
        <button onClick={onToggleGame} className="classic-toggle-btn">PLAY GAME</button>
      </nav>

      {/* 2. Hero Section */}
      <header className="classic-hero">
        <div className="hero-portrait-wrap">
          <img className="hero-portrait" src={`/${avatar}`} alt={`${name} portrait`} />
        </div>
        <span className="hero-subtitle">{subTitle}</span>
        <h2 className="hero-name">{name}</h2>
        <p className="hero-bio">{bio}</p>
      </header>

      {/* 3. About Section */}
      <section id="about" className="classic-section" aria-labelledby="about-heading">
        <div className="section-header">
          <h2 id="about-heading">About Me</h2>
          <span className="section-header-line"></span>
        </div>
        <div className="about-grid">
          <div className="about-text">
            <p>{story}</p>
          </div>
          <div className="about-card">
            <h3 className="about-card-title">Development Philosophy</h3>
            <p>{philosophy}</p>
          </div>
        </div>
      </section>

      {/* 4. Skills Section */}
      <section id="skills" className="classic-section" aria-labelledby="skills-heading">
        <div className="section-header">
          <h2 id="skills-heading">Super Skills</h2>
          <span className="section-header-line"></span>
        </div>
        <div className="skills-grid">
          {portfolioData.skills.map((s, idx) => (
            <div key={idx} className="skill-card">
              <div className="skill-card-top">
                <span className="skill-name">{s.name}</span>
                <span className="skill-level-dial" style={{ color: s.color }}>{s.level}%</span>
              </div>
              <div className="skill-bar-bg">
                <div 
                  className="skill-bar-fill" 
                  style={{ 
                    backgroundColor: s.color,
                    width: animateBars ? `${s.level}%` : "0%"
                  }}
                ></div>
              </div>
              <p className="skill-description">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Projects Section */}
      <section id="projects" className="classic-section" aria-labelledby="projects-heading">
        <div className="section-header">
          <h2 id="projects-heading">Treasure Ledger (Projects)</h2>
          <span className="section-header-line"></span>
        </div>
        <div className="projects-grid">
          {portfolioData.projects.map((p, idx) => (
            <div key={idx} className="project-card">
              <div className="project-card-body">
                <h3 className="project-title">{p.title}</h3>
                <span className="scroll-project-tech" style={{ alignSelf: "flex-start", marginBottom: "0.5rem" }}>{p.role}</span>
                <p className="project-desc">{p.description}</p>
                <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", opacity: 0.8, marginBottom: "0.5rem", lineHeight: 1.5 }}>
                  {p.highlights.map((h, hIdx) => (
                    <li key={hIdx}>{h}</li>
                  ))}
                </ul>
                <div className="project-tech-tags">
                  {p.tech.map((t, tIdx) => (
                    <span key={tIdx} className="project-tag">{t}</span>
                  ))}
                </div>
                <div className="project-links">
                  <a href={p.github} className="project-link" target="_blank" rel="noopener noreferrer">Code (GitHub) →</a>
                  <a href={p.live} className="project-link" target="_blank" rel="noopener noreferrer">Live Demo →</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Experience Section */}
      <section id="experience" className="classic-section" aria-labelledby="experience-heading">
        <div className="section-header">
          <h2 id="experience-heading">Chronicles of Battle</h2>
          <span className="section-header-line"></span>
        </div>
        <div className="timeline">
          {portfolioData.experience.map((e, idx) => (
            <div key={idx} className="timeline-item">
              <span className="timeline-dot"></span>
              <div className="timeline-year">{e.year}</div>
              <h3 className="timeline-role">{e.role}</h3>
              <div className="timeline-company">{e.company}</div>
              <p className="timeline-description">{e.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5. Education Section */}
      <section id="education" className="classic-section" aria-labelledby="education-heading">
        <div className="section-header">
          <h2 id="education-heading">Academy Training (Education)</h2>
          <span className="section-header-line"></span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {portfolioData.education.map((edu, idx) => (
            <div key={idx} className="skill-card" style={{ borderLeft: "3.5px solid #8c510a", paddingLeft: "15px", background: "rgba(255,255,255,0.02)" }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#8c510a" }}>{edu.year}</span>
              <h3 style={{ fontFamily: "Cinzel", fontWeight: 700, margin: "4px 0 2px 0", fontSize: "1.1rem" }}>{edu.degree}</h3>
              <div style={{ fontSize: "0.85rem", fontStyle: "italic", opacity: 0.8, marginBottom: "2px" }}>{edu.field}</div>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, marginBottom: "8px" }}>{edu.institution}</div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.45, opacity: 0.9 }}>{edu.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Contact Section */}
      <section id="contact" className="classic-section" aria-labelledby="contact-heading">
        <div className="section-header">
          <h2 id="contact-heading">Send a Message</h2>
          <span className="section-header-line"></span>
        </div>
        <div className="contact-container">
          <div className="contact-info">
            <p className="contact-info-text">Have a challenging mission or web development opportunity? Reach out via this form or through my standard coordination channels!</p>
            <div className="contact-methods">
              <div className="contact-method-item">
                <div className="contact-icon-box">✉️</div>
                <div className="contact-method-details">
                  <h4>Email</h4>
                  <p><a href={`mailto:${email}`} style={{ color: "inherit", textDecoration: "none" }}>{email}</a></p>
                </div>
              </div>
              <div className="contact-method-item">
                <div className="contact-icon-box">🐙</div>
                <div className="contact-method-details">
                  <h4>GitHub</h4>
                  <p><a href={github} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>github.com/profile</a></p>
                </div>
              </div>
              <div className="contact-method-item">
                <div className="contact-icon-box">💼</div>
                <div className="contact-method-details">
                  <h4>LinkedIn</h4>
                  <p><a href={linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>linkedin.com/in/profile</a></p>
                </div>
              </div>
              <div className="contact-method-item">
                <div className="contact-icon-box">🐦</div>
                <div className="contact-method-details">
                  <h4>Twitter</h4>
                  <p><a href={twitter} target="_blank" rel="noopener noreferrer" style={{ color: "inherit", textDecoration: "none" }}>twitter.com/profile</a></p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="contact-form-card">
            <form onSubmit={handleContactSubmit} className="classic-form">
              <div className="form-group">
                <label htmlFor="contact-name" className="form-label">Recruiter / Client Name</label>
                <input 
                  id="contact-name" 
                  className="form-input" 
                  type="text" 
                  placeholder="e.g. Captain Red-tail" 
                  value={cName}
                  onChange={(e) => setCName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email" className="form-label">Dispatch Email</label>
                <input 
                  id="contact-email" 
                  className="form-input" 
                  type="email" 
                  placeholder="e.g. redtail@cove.com" 
                  value={cEmail}
                  onChange={(e) => setCEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-msg" className="form-label">Message Details</label>
                <textarea 
                  id="contact-msg" 
                  className="form-textarea" 
                  rows={4} 
                  placeholder="Ahoy! Let's build a new vessel together..." 
                  value={cMsg}
                  onChange={(e) => setCMsg(e.target.value)}
                  required 
                />
              </div>
              <button className="form-submit" type="submit">SEND MESSAGE</button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
