import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Code2 } from 'lucide-react';

const PROJECTS = [
  {
    number: '01',
    category: 'AI · AGENT PLATFORM',
    title: 'AI Agent Platform',
    description: 'A platform for creating autonomous agents, multi-step workflows and tools while exploring the possibilities of agent-based software systems.',
    tags: ['AI Agents', 'Python', 'FastAPI', 'LangChain', 'TypeScript']
  },
  {
    number: '02',
    category: 'RAILWAY · REAL-TIME SYSTEM',
    title: 'Railway Safety System',
    description: 'A real-time railway monitoring system designed to detect abnormal conditions, speed variations and improve railway track safety.',
    tags: ['Node.js', 'WebSockets', 'Leaflet Maps', 'FRMCS', 'Telemetry']
  },
  {
    number: '03',
    category: 'WEB APPLICATION',
    title: 'Bloglite',
    description: 'A lightweight blogging platform built while exploring clean backend design, SQLAlchemy, secure authentication, and social reading features.',
    tags: ['FastAPI', 'SQLAlchemy', 'Neon PostgreSQL', 'React']
  },
  {
    number: '04',
    category: 'DATA · MACHINE LEARNING',
    title: 'Customer Segmentation Engine',
    description: 'A data analysis project utilizing RFM analysis and market basket algorithms to understand consumer behaviour patterns at scale.',
    tags: ['Python', 'Pandas', 'Apriori', 'Power BI', 'Scikit-Learn']
  }
];

export default function ProjectsPage() {
  return (
    <div className="content-wrap" id="projects-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link">
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
              padding: '50px 0',
              display: 'grid',
              gridTemplateColumns: '80px 1fr',
              gap: '40px'
            }}
            id={`project-item-${project.number}`}
          >
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: '#77736b' }}>
              {project.number}
            </div>

            <div>
              <p className="eyebrow" style={{ color: '#2563eb', marginBottom: '8px' }}>
                {project.category}
              </p>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: '400', margin: '8px 0 16px' }}>
                {project.title}
              </h2>
              <p style={{ fontSize: '18px', color: '#55534e', lineHeight: '1.6', maxWidth: '680px', marginBottom: '20px' }}>
                {project.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      border: '1px solid #c9c6be',
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: '2px',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
