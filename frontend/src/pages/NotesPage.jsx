import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Search, Copy, Check, X, Maximize2 } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    loadNotes();
  }, []);

  // Keyboard shortcut (ESC) to dismiss modal popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedNote(null);
      }
    };
    if (selectedNote) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedNote]);

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

  const handleCopyNote = (note, e) => {
    if (e) e.stopPropagation();
    const textToCopy = `"${note.thought}" — Santheri (${note.title})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.thought && n.thought.toLowerCase().includes(q))
    );
  });

  return (
    <div className="content-wrap" id="notes-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link" id="link-back-home">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <section className="hero-section" style={{ padding: '24px 0 32px', maxWidth: '850px' }}>
        <p className="eyebrow">THE NOTEBOOK · FIELD NOTES & OBSERVATIONS</p>
        <h1 className="page-hero-title" style={{ margin: '12px 0 0' }}>
          Small thoughts & field notes.
        </h1>
        <p style={{ fontSize: '18px', color: '#55534e', marginTop: '14px', lineHeight: '1.6' }}>
          Unpolished ideas, lessons learned mid-build, and quick observations on software, AI, and deliberate living.
        </p>

        {/* Search & Filter Toolbar for scalable reading */}
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '999px',
            padding: '8px 16px',
            width: '100%',
            maxWidth: '380px'
          }}>
            <Search size={15} style={{ color: '#77736b' }} />
            <input
              type="text"
              placeholder="Search through notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '14px',
                width: '100%',
                color: 'var(--text-main)'
              }}
              aria-label="Filter field notes"
            />
          </div>

          <span style={{ fontSize: '13px', color: '#77736b', fontWeight: '500' }}>
            {filteredNotes.length} {filteredNotes.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </section>

      {/* Grid of Notes */}
      <section className="feed-section" style={{ paddingTop: '10px' }}>
        {loading ? (
          <div style={{ padding: '40px 0', color: '#77736b' }}>Loading field notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div style={{ padding: '40px 0', color: '#77736b', fontFamily: 'var(--font-serif)', fontSize: '19px' }}>
            No notes found matching "{searchQuery}".
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                onClick={() => setSelectedNote(note)}
                style={{
                  background: 'var(--bg-surface)',
                  padding: '28px 26px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-light)',
                  borderLeft: '4px solid var(--text-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                  cursor: 'pointer'
                }}
                className="notebook-card note-card-interactive"
                id={`note-card-${note.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedNote(note);
                  }
                }}
                title="Click to open note in popup window"
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.12em', color: '#77736b', textTransform: 'uppercase' }}>
                      {formatDate(note.created_at || note.date)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyNote(note, e)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedId === note.id ? '#047857' : '#77736b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        padding: '3px 6px',
                        borderRadius: '4px'
                      }}
                      title="Copy quote"
                    >
                      {copiedId === note.id ? (
                        <>
                          <Check size={12} /> <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: '500', lineHeight: '1.3', marginBottom: '12px', color: 'var(--text-main)' }}>
                    {note.title}
                  </h2>

                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '17px',
                    lineHeight: '1.65',
                    color: '#44423d',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {note.thought}
                  </p>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                    <Maximize2 size={12} /> Read note
                  </span>
                  <BookOpen size={13} style={{ color: '#99948c' }} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Note Reader Modal Popup Window */}
      {selectedNote && (
        <div
          className="note-modal-backdrop"
          onClick={() => setSelectedNote(null)}
          id="note-modal-overlay"
        >
          <div
            className="note-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-modal-title"
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', color: '#77736b', textTransform: 'uppercase' }}>
                  {formatDate(selectedNote.created_at || selectedNote.date)}
                </span>
                <span className="post-font-badge">FIELD NOTE</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={(e) => handleCopyNote(selectedNote, e)}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-light)',
                    color: copiedId === selectedNote.id ? '#047857' : 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontWeight: '500'
                  }}
                  title="Copy quote"
                >
                  {copiedId === selectedNote.id ? (
                    <>
                      <Check size={13} /> <span>Copied quote!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> <span>Copy quote</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedNote(null)}
                  style={{
                    background: 'var(--bg-subtle)',
                    border: 'none',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.15s ease'
                  }}
                  aria-label="Close note popup"
                  id="btn-close-note-modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Note Content */}
            <h2 id="note-modal-title" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: '500',
              lineHeight: '1.25',
              marginBottom: '24px',
              color: 'var(--text-main)'
            }}>
              {selectedNote.title}
            </h2>

            <div style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(18px, 2.5vw, 21px)',
              lineHeight: '1.75',
              color: '#2d2b27',
              whiteSpace: 'pre-wrap',
              marginBottom: '36px',
              paddingLeft: '18px',
              borderLeft: '3px solid var(--text-main)'
            }}>
              {selectedNote.thought}
            </div>

            {/* Footer */}
            <div style={{
              paddingTop: '20px',
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
                onClick={() => setSelectedNote(null)}
                className="btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
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
