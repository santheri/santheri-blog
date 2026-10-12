import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

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

const PROJECTS = [
  {
    number: '01',
    category: 'AI · AGENT PLATFORM',
    title: 'AI Agent Platform',
    description: 'A platform for creating autonomous agents, multi-step workflows and tools while exploring the possibilities of agent-based software systems.',
    tags: ['AI Agents', 'Python', 'FastAPI', 'LangChain', 'TypeScript'],
    githubUrl: 'https://github.com/santheri/ai-agent-platform'
  },
  {
    number: '02',
    category: 'RAILWAY · REAL-TIME SYSTEM',
    title: 'Railway Safety System',
    description: 'A real-time railway monitoring system designed to detect abnormal conditions, speed variations and improve railway track safety.',
    tags: ['Node.js', 'WebSockets', 'Leaflet Maps', 'FRMCS', 'Telemetry'],
    githubUrl: 'https://github.com/santheri/railway-safety-system'
  },
  {
    number: '03',
    category: 'WEB APPLICATION',
    title: 'Personal Blog Engine',
    description: 'A lightweight blogging platform built while exploring clean backend design, SQLAlchemy, Neon PostgreSQL, secure authentication, and editorial typography.',
    tags: ['FastAPI', 'SQLAlchemy', 'Neon PostgreSQL', 'React', 'Vite'],
    githubUrl: 'https://github.com/santheri/santheri-blog'
  },
  {
    number: '04',
    category: 'DATA · MACHINE LEARNING',
    title: 'Customer Segmentation Engine',
    description: 'A data analysis project utilizing RFM analysis and market basket algorithms to understand consumer behaviour patterns at scale.',
    tags: ['Python', 'Pandas', 'Apriori', 'Power BI', 'Scikit-Learn'],
    githubUrl: 'https://github.com/santheri/customer-segmentation-engine'
  }
];

export default function ProjectsPage() {
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
      </section>

      <section className="feed-section" style={{ paddingTop: 0 }}>
        {PROJECTS.map((project) => (
          <article
            key={project.number}
            style={{
              borderTop: '1px solid var(--border-light)',
              padding: '44px 0',
              display: 'grid',
              gridTemplateColumns: '70px 1fr',
              gap: '30px'
            }}
            id={`project-item-${project.number}`}
            className="project-row-item"
          >
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#99948c' }}>
              {project.number}
            </div>

            <div>
              <p className="eyebrow" style={{ color: '#2563eb', marginBottom: '8px' }}>
                {project.category}
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', fontWeight: '400', margin: '6px 0 14px' }}>
                {project.title}
              </h2>
              <p style={{ fontSize: '17px', color: '#55534e', lineHeight: '1.6', maxWidth: '680px', marginBottom: '18px' }}>
                {project.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      border: '1px solid #d5d2ca',
                      padding: '4px 10px',
                      fontSize: '12px',
                      borderRadius: '3px',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.githubUrl && (
                <div>
                  <a
                    href={project.githubUrl}
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
                    id={`btn-github-${project.number}`}
                  >
                    <GithubIcon size={15} />
                    <span>View Repository →</span>
                  </a>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
