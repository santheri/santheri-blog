import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, X, Maximize2, BookOpen } from 'lucide-react';
import { fetchProjects } from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';

function GithubIcon({ size = 15, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const DEFAULT_PROJECTS = [
  {
    id: 1,
    number: '01',
    category: 'AI · AGENT PLATFORM',
    title: 'AI Agent Platform',
    description: `A platform for creating autonomous agents, multi-step workflows, and tools while exploring the possibilities of agent-based software systems.

### Core Architecture & Capabilities
- **Multi-step Reasoning Loop**: Orchestrates plan-and-solve execution workflows with human-in-the-loop validation checkpoints.
- **Dynamic Tool Dispatch**: Built with typed interfaces and schema validation to safely integrate external APIs, shell executors, and retrieval systems.
- **Constrained Memory**: Explores structured episodic and working memory models instead of dumping unconstrained context windows.`,
    tags: 'AI Agents, Python, FastAPI, LangChain, TypeScript',
    github_url: 'https://github.com/santheri/ai-agent-platform'
  },
  {
    id: 2,
    number: '02',
    category: 'RAILWAY · REAL-TIME SYSTEM',
    title: 'Railway Safety System',
    description: `A real-time railway monitoring system designed to detect abnormal conditions, speed variations, and track anomalies to improve railway safety.

### System Overview & Highlights
- **High-throughput Telemetry**: Ingests high-frequency sensor readings and GPS pings with real-time geospatial tracking via WebSockets.
- **Geographic Alerting**: Integrates interactive Leaflet maps with dynamic track boundary visualization and automated threshold breach alerts.
- **Reliability First**: Designed to guarantee message delivery even under spotty trackside cellular conditions.`,
    tags: 'Node.js, WebSockets, Leaflet Maps, FRMCS, Telemetry',
    github_url: 'https://github.com/santheri/railway-safety-system'
  },
  {
    id: 3,
    number: '03',
    category: 'WEB APPLICATION',
    title: 'Personal Blog Engine',
    description: `A lightweight, distraction-free publishing platform built while exploring clean backend design, SQLAlchemy, Neon PostgreSQL, secure authentication, and editorial typography.

### Features & Engineering
- **Serverless PostgreSQL**: Backed by Neon.tech serverless cloud database with relational tables for stories, field notes, projects, profiles, and persistent images.
- **Editorial Design System**: Custom typography with warm neutral palettes, responsive modals, live markdown rendering, and zero layout shift.
- **Newsletter Broadcasting**: Integrated subscriber management with background email dispatch and status telemetry.`,
    tags: 'FastAPI, SQLAlchemy, Neon PostgreSQL, React, Vite',
    github_url: 'https://github.com/santheri/santheri-blog'
  },
  {
    id: 4,
    number: '04',
    category: 'DATA · MACHINE LEARNING',
    title: 'Customer Segmentation Engine',
    description: `A data analysis project utilizing RFM analysis and market basket algorithms to understand consumer behaviour patterns at scale.

### Key Analysis & Insights
- **Behavioral Clustering**: Segmented customer cohorts using Recency, Frequency, and Monetary (RFM) modeling to identify retention targets.
- **Market Basket Mining**: Evaluated transaction co-occurrence rules using the Apriori algorithm to uncover cross-sell opportunities.
- **Visual Analytics**: Interactive Power BI dashboards that translate statistical clusters into actionable growth strategies.`,
    tags: 'Python, Pandas, Apriori, Power BI, Scikit-Learn',
    github_url: 'https://github.com/santheri/customer-segmentation-engine'
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await fetchProjects();
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic projects from backend, using defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // Keyboard shortcut (ESC) to dismiss modal popup & body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedProject(null);
      }
    };
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  const getTagsArray = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    return tags.split(',').map((t) => t.trim()).filter(Boolean);
  };

  return (
    <div className="content-wrap" id="projects-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link" id="link-back-home">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <section className="hero-section" style={{ padding: '24px 0 36px', maxWidth: '850px' }}>
        <p className="eyebrow">PORTFOLIO & WORK</p>
        <h1 className="page-hero-title" style={{ margin: '12px 0 0' }}>
          Things I've built, worked on, and learned from.
        </h1>
        <p style={{ fontSize: '18px', color: '#55534e', marginTop: '14px', lineHeight: '1.6' }}>
          Systems, platforms, and open-source explorations spanning artificial intelligence, backend systems, and interactive web tools.
        </p>
      </section>

      <section className="feed-section" style={{ paddingTop: 0 }}>
        {loading && projects.length === 0 ? (
          <div style={{ padding: '60px 0', color: '#77736b', textAlign: 'center' }}>Loading projects...</div>
        ) : (
          projects.map((project, index) => {
            const githubLink = project.github_url || project.githubUrl;
            const liveLink = project.live_url || project.liveUrl;
            const tagsList = getTagsArray(project.tags);
            const displayNumber = project.number || String(index + 1).padStart(2, '0');

            return (
              <article
                key={project.id || index}
                onClick={() => setSelectedProject(project)}
                style={{
                  borderTop: '1px solid var(--border-light)',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '40px'
                }}
                className="project-row project-card-interactive"
                id={`project-card-${project.id || index}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProject(project);
                  }
                }}
                title="Click to open project brief in popup window"
              >
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '24px',
                  color: '#99948c',
                  fontWeight: '400',
                  paddingTop: '4px'
                }}>
                  {displayNumber}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#2563eb',
                      margin: 0
                    }}>
                      {project.category}
                    </p>
                    <span style={{ fontSize: '12px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                      <Maximize2 size={12} /> Read brief
                    </span>
                  </div>

                  <h2 style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '32px',
                    lineHeight: '1.2',
                    marginBottom: '16px',
                    color: 'var(--text-main)',
                    fontWeight: '400'
                  }}>
                    {project.title}
                  </h2>

                  <div style={{
                    fontSize: '17px',
                    lineHeight: '1.65',
                    color: 'var(--text-secondary)',
                    maxWidth: '700px',
                    marginBottom: '22px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {project.description.replace(/#{1,6}\s+/g, '')}
                  </div>

                  {tagsList.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                      {tagsList.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          style={{
                            fontSize: '12px',
                            background: 'var(--bg-subtle)',
                            color: 'var(--text-secondary)',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            border: '1px solid var(--border-light)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProject(project);
                      }}
                      className="btn-secondary"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        padding: '7px 14px',
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}
                    >
                      <BookOpen size={14} />
                      <span>Read Full Brief →</span>
                    </button>

                    {githubLink && (
                      <a
                        href={githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          padding: '7px 14px',
                          borderRadius: '4px'
                        }}
                        id={`btn-github-${displayNumber}`}
                      >
                        <GithubIcon size={15} />
                        <span>Repository</span>
                      </a>
                    )}

                    {liveLink && (
                      <a
                        href={liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn-secondary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          padding: '7px 14px',
                          borderRadius: '4px'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Live Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Project Brief Modal Popup Window */}
      {selectedProject && (
        <div
          className="note-modal-backdrop"
          onClick={() => setSelectedProject(null)}
          id="project-modal-overlay"
        >
          <div
            className="project-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, paddingRight: '12px' }}>
                {selectedProject.number && (
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#99948c', letterSpacing: '0.05em' }}>
                    {selectedProject.number}
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', color: '#2563eb', textTransform: 'uppercase' }}>
                  {selectedProject.category}
                </span>
                <span className="post-font-badge">PROJECT BRIEF</span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: 'none',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease',
                  flexShrink: 0
                }}
                aria-label="Close project brief"
                id="btn-close-project-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Project Title */}
            <h2 id="project-modal-title" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: '400',
              lineHeight: '1.25',
              marginBottom: '16px',
              color: 'var(--text-main)'
            }}>
              {selectedProject.title}
            </h2>

            {/* Tech Stack Badges */}
            {getTagsArray(selectedProject.tags).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '22px' }}>
                {getTagsArray(selectedProject.tags).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      fontSize: '12px',
                      background: 'var(--bg-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Links */}
            {((selectedProject.github_url || selectedProject.githubUrl) || (selectedProject.live_url || selectedProject.liveUrl)) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {(selectedProject.github_url || selectedProject.githubUrl) && (
                  <a
                    href={selectedProject.github_url || selectedProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      padding: '8px 16px',
                      borderRadius: '4px'
                    }}
                  >
                    <GithubIcon size={15} />
                    <span>View GitHub Repository →</span>
                  </a>
                )}

                {(selectedProject.live_url || selectedProject.liveUrl) && (
                  <a
                    href={selectedProject.live_url || selectedProject.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      padding: '8px 16px',
                      borderRadius: '4px'
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>Open Live Demo →</span>
                  </a>
                )}
              </div>
            )}

            {/* Project Brief Markdown Body */}
            <div style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '26px',
              marginBottom: '32px'
            }}>
              <p style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#77736b',
                marginBottom: '16px'
              }}>
                Overview & Technical Brief
              </p>

              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(17px, 2vw, 19px)',
                lineHeight: '1.75',
                color: 'var(--text-main)'
              }}>
                <MarkdownRenderer content={selectedProject.description} />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              paddingTop: '18px',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '13px',
              color: '#77736b'
            }}>
              <span>Press <kbd style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '11px' }}>ESC</kbd> or click outside to dismiss</span>
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="btn-secondary"
                style={{ padding: '7px 18px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

