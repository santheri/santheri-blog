import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenTool } from 'lucide-react';

const NOTES = [
  {
    date: '04 Oct 2026',
    title: 'The illusion of immediate comprehension',
    thought: 'Reading about an architecture pattern gives you the feeling of knowing it. Building it and watching edge cases break at 2 AM is when you actually understand it.'
  },
  {
    date: '28 Sep 2026',
    title: 'Why agents need constrained memory, not infinite context',
    thought: 'Expanding the context window is like giving someone a bigger desk. It helps, but if their filing system is broken, more space just means more clutter.'
  },
  {
    date: '19 Sep 2026',
    title: 'Field note: Telangana backroads',
    thought: 'The moment you lose 5G signal on country roads, your attention shifts outward. The trees look sharper, the air smells like damp soil, and you realize how much background mental bandwidth connectivity consumes.'
  },
  {
    date: '10 Sep 2026',
    title: 'On building software with taste',
    thought: 'Speed and features are cheap. Restraint, clarity, and thoughtful typography are expensive because they require deliberate decisions about what NOT to build.'
  }
];

export default function NotesPage() {
  return (
    <div className="reading-wrap" id="notes-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '50px' }}>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <section style={{ paddingTop: '60px' }}>
        <p className="eyebrow">THE NOTEBOOK</p>
        <h1 className="hero-title" style={{ fontSize: 'clamp(44px, 6.5vw, 76px)', marginBottom: '30px' }}>
          Small thoughts & field notes.
        </h1>
        <p style={{ fontSize: '20px', color: '#55534e', marginBottom: '50px' }}>
          Unpolished ideas, lessons learned mid-build, and quick observations on software and life.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {NOTES.map((note, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-muted)',
                padding: '35px 30px',
                borderRadius: '6px',
                borderLeft: '4px solid var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', color: '#77736b' }}>
                  {note.date}
                </span>
                <BookOpen size={14} style={{ color: '#77736b' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '400', marginBottom: '12px' }}>
                {note.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', lineHeight: '1.6', color: '#333' }}>
                {note.thought}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
