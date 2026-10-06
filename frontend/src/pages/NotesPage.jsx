import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenTool } from 'lucide-react';
import { fetchNotes } from '../api';

const DEFAULT_NOTES = [
  {
    id: 'default-1',
    created_at: '2026-10-04T12:00:00Z',
    title: 'The illusion of immediate comprehension',
    thought: 'Reading about an architecture pattern gives you the feeling of knowing it. Building it and watching edge cases break at 2 AM is when you actually understand it.'
  },
  {
    id: 'default-2',
    created_at: '2026-09-28T12:00:00Z',
    title: 'Why agents need constrained memory, not infinite context',
    thought: 'Expanding the context window is like giving someone a bigger desk. It helps, but if their filing system is broken, more space just means more clutter.'
  },
  {
    id: 'default-3',
    created_at: '2026-09-19T12:00:00Z',
    title: 'Field note: Telangana backroads',
    thought: 'The moment you lose 5G signal on country roads, your attention shifts outward. The trees look sharper, the air smells like damp soil, and you realize how much background mental bandwidth connectivity consumes.'
  },
  {
    id: 'default-4',
    created_at: '2026-09-10T12:00:00Z',
    title: 'On building software with taste',
    thought: 'Speed and features are cheap. Restraint, clarity, and thoughtful typography are expensive because they require deliberate decisions about what NOT to build.'
  }
];

export default function NotesPage() {
  const [notes, setNotes] = useState(DEFAULT_NOTES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      if (Array.isArray(data) && data.length > 0) {
        setNotes(data);
      }
    } catch (err) {
      console.warn('Could not load dynamic notes from backend, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Field Note';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

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

        {loading ? (
          <div style={{ padding: '40px 0', color: '#77736b' }}>Loading field notes...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {notes.map((note) => (
              <div
                key={note.id}
                style={{
                  background: 'var(--bg-muted)',
                  padding: '35px 30px',
                  borderRadius: '6px',
                  borderLeft: '4px solid var(--text-main)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.1em', color: '#77736b' }}>
                    {formatDate(note.created_at || note.date)}
                  </span>
                  <BookOpen size={14} style={{ color: '#77736b' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: '400', marginBottom: '12px' }}>
                  {note.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', lineHeight: '1.6', color: '#333', whiteSpace: 'pre-wrap' }}>
                  {note.thought}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

