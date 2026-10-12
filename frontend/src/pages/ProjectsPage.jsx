import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchProjects } from '../api';

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
    description: 'A platform for creating autonomous agents, multi-step workflows and tools while exploring the possibilities of agent-based software systems.',
    tags: 'AI Agents, Python, FastAPI, LangChain, TypeScript',
    github_url: 'https://github.com/santheri/ai-agent-platform'
  },
  {
    id: 2,
    number: '02',
    category: 'RAILWAY · REAL-TIME SYSTEM',
    title: 'Railway Safety System',
    description: 'A real-time railway monitoring system designed to detect abnormal conditions, speed variations and improve railway track safety.',
    tags: 'Node.js, WebSockets, Leaflet Maps, FRMCS, Telemetry',
    github_url: 'https://github.com/santheri/railway-safety-system'
  },
  {
    id: 3,
    number: '03',
    category: 'WEB APPLICATION',
    title: 'Personal Blog Engine',
    description: 'A lightweight blogging platform built while exploring clean backend design, SQLAlchemy, Neon PostgreSQL, secure authentication, and editorial typography.',
    tags: 'FastAPI, SQLAlchemy, Neon PostgreSQL, React, Vite',
    github_url: 'https://github.com/santheri/santheri-blog'
  },
  {
    id: 4,
    number: '04',
    category: 'DATA · MACHINE LEARNING',
    title: 'Customer Segmentation Engine',
    description: 'A data analysis project utilizing RFM analysis and market basket algorithms to understand consumer behaviour patterns at scale.',
    tags: 'Python, Pandas, Apriori, Power BI, Scikit-Learn',
    github_url: 'https://github.com/santheri/customer-segmentation-engine'
  }
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(true);

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
                style={{
                  borderTop: '1px solid var(--border-light)',
                  padding: '50px 0',
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  gap: '40px'
                }}
                className="project-row"
                id={`project-card-${project.id || index}`}
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
                  <p style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#2563eb',
                    marginBottom: '10px'
                  }}>
                    {project.category}
                  </p>

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

                  <p style={{
                    fontSize: '17px',
                    lineHeight: '1.65',
                    color: 'var(--text-secondary)',
                    maxWidth: '700px',
                    marginBottom: '22px'
                  }}>
                    {project.description}
                  </p>

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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {githubLink && (
                      <a
                        href={githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
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
                        <span>View Repository →</span>
                      </a>
                    )}

                    {liveLink && (
                      <a
                        href={liveLink}
                        target="_blank"
                        rel="noopener noreferrer"
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
                        <span>Live Demo →</span>
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
