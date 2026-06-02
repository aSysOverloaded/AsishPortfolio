/* ==========================================================================
   RETRO MODAL COMPONENT (PARCHMENT): DYNAMIC SCROLL CONTAINER
   ========================================================================== */

"use client";

import React, { useState } from "react";
import { portfolioData } from "../../portfolio/portfolioData";

interface ParchmentModalProps {
  active: boolean;
  title: string;
  contentKey: string;
  onClose: () => void;
}

export default function ParchmentModal({
  active,
  title,
  contentKey,
  onClose,
}: ParchmentModalProps) {
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mMsg, setMMsg] = useState("");

  if (!active) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Message sent by ${mName}! Captain Asish has received your avian scroll!`);
    setMName("");
    setMEmail("");
    setMMsg("");
    onClose();
  };

  const renderContent = () => {
    switch (contentKey) {
      case "about": {
        const { story, philosophy } = portfolioData.about;
        return (
          <>
            <p className="scroll-story">&ldquo;{story}&rdquo;</p>
            <h4 style={{ fontFamily: "Cinzel", marginBottom: "6px", fontWeight: 700 }}>Philosophical Creed:</h4>
            <p style={{ lineHeight: 1.5, fontSize: "0.95rem" }}>{philosophy}</p>
          </>
        );
      }
      case "skills": {
        return (
          <div style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}>
            {portfolioData.skills.map((s, idx) => (
              <div key={idx} style={{ marginBottom: "12px", borderBottom: "1px dashed rgba(46,28,16,0.15)", paddingBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontFamily: "Cinzel" }}>
                  <span>{s.name}</span>
                  <span style={{ color: "#8c510a" }}>{s.level}% Mastery</span>
                </div>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.3, color: "#444", marginTop: "2px" }}>{s.description}</p>
              </div>
            ))}
          </div>
        );
      }
      case "experience": {
        return (
          <div style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}>
            {portfolioData.experience.map((e, idx) => (
              <div key={idx} style={{ marginBottom: "16px", borderLeft: "2.5px solid var(--color-wood-light)", paddingLeft: "12px" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "#8c510a" }}>{e.year}</span>
                <h4 style={{ fontFamily: "Cinzel", fontWeight: 700, margin: "2px 0" }}>{e.role}</h4>
                <div style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#555", marginBottom: "4px" }}>{e.company}</div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.4, color: "#3e2d20" }}>{e.description}</p>
              </div>
            ))}
          </div>
        );
      }
      case "projects": {
        return (
          <div className="scroll-projects-list" style={{ maxHeight: "45vh", overflowY: "auto", paddingRight: "8px" }}>
            {portfolioData.projects.map((p, idx) => (
              <div key={idx} className="scroll-project-item">
                <div className="scroll-project-header">
                  <span className="scroll-project-title">{p.title}</span>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {p.tech.map((t, tIdx) => (
                      <span key={tIdx} className="scroll-project-tech">{t}</span>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.4, color: "#444" }}>{p.description}</p>
                <div className="scroll-project-links">
                  <a className="scroll-link" href={p.github} target="_blank" rel="noopener noreferrer">View Code 🐙</a>
                  <a className="scroll-link" href={p.live} target="_blank" rel="noopener noreferrer">Live Vessel ⚓</a>
                </div>
              </div>
            ))}
          </div>
        );
      }
      case "contact": {
        const { email, github, linkedin } = portfolioData.contact;
        return (
          <>
            <p style={{ marginBottom: "1rem", lineHeight: 1.4 }}>Stand fast! Fill this scroll parchment dispatch to send a direct avian pigeon message to Captain Asish, or trace standard tracks:</p>
            <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", justifyContent: "center", fontFamily: "Cinzel", fontWeight: 700 }}>
              <a className="scroll-link" href={`mailto:${email}`}>Email Dispatch</a>
              <a className="scroll-link" href={github} target="_blank" rel="noopener noreferrer">GitHub</a>
              <a className="scroll-link" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
            
            <form onSubmit={handleContactSubmit} className="scroll-form">
              <div className="form-group">
                <label className="form-label" htmlFor="m-name">Recruiter Name</label>
                <input 
                  className="form-input" 
                  id="m-name" 
                  type="text" 
                  placeholder="e.g. Admiral Nelson" 
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="m-email">Vessel Email Address</label>
                <input 
                  className="form-input" 
                  id="m-email" 
                  type="email" 
                  placeholder="nelson@navy.mil" 
                  value={mEmail}
                  onChange={(e) => setMEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="m-msg">Message Dispatch</label>
                <textarea 
                  className="form-textarea" 
                  id="m-msg" 
                  rows={3} 
                  placeholder="Ahoy Captain! I have a high stakes mission..." 
                  value={mMsg}
                  onChange={(e) => setMMsg(e.target.value)}
                  required 
                />
              </div>
              <button className="form-submit" type="submit">DISPATCH MESSAGE</button>
            </form>
          </>
        );
      }
      case "victory": {
        return (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "1.05rem", lineHeight: 1.5, marginBottom: "1.2rem", fontWeight: 700, fontFamily: "Cinzel" }}>
              Ahoy, Legendary Recruiter!
            </p>
            <p style={{ lineHeight: 1.4, marginBottom: "1.2rem", fontSize: "0.95rem" }}>
              You have braved the platform chasms, climbed the mainmast ladders, harvested all the glowing skill gems, and unlocked the <strong>5 legendary treasures</strong> of Captain Asish!
            </p>
            <p style={{ lineHeight: 1.4, marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Your recruitment name is now recorded in the chronicles of the high seas. You may transition to the professional <strong>Classic Portfolio Mode</strong> to review Asish's credentials, or remain on the ship deck to celebrate!
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button 
                onClick={() => {
                  onClose();
                  const event = new CustomEvent("switch-to-classic");
                  window.dispatchEvent(event);
                }} 
                className="form-submit" 
                style={{ cursor: "pointer", flex: 1, padding: "8px 12px", fontFamily: "Cinzel", fontWeight: 700 }}
              >
                CLASSIC PORTFOLIO
              </button>
              <button 
                onClick={onClose} 
                className="form-submit" 
                style={{ cursor: "pointer", flex: 1, padding: "8px 12px", fontFamily: "Cinzel", fontWeight: 700, background: "#7a543b", border: "1.5px solid #2e1c10" }}
              >
                STAY ON DECK
              </button>
            </div>
          </div>
        );
      }
      default:
        return <p>Mysterious scroll coordinates...</p>;
    }
  };

  return (
    <div className={`modal-overlay active`} role="dialog" aria-modal="true">
      <div className="parchment-scroll" role="document">
        <button onClick={onClose} className="parchment-close" aria-label="Close Scroll modal">X</button>
        <h2 className="parchment-title">{title}</h2>
        <div className="scroll-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
