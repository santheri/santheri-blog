import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Compass, BookOpen, Layers } from 'lucide-react';

export default function NotFoundPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/writing?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="content-wrap" id="not-found-container" style={{ paddingBottom: '120px' }}>
      {/* Back Link */}
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link" id="link-notfound-back-home">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <div style={{ maxWidth: '680px', margin: '40px auto 0', textAlign: 'center' }}>
        <p className="eyebrow" style={{ letterSpacing: '0.2em' }} id="notfound-eyebrow">
          404 · PAGE NOT FOUND
        </p>

        <h1 
          className="page-hero-title" 
          id="notfound-title"
          style={{ fontSize: 'clamp(36px, 5vw, 56px)', margin: '16px 0 20px', lineHeight: 1.15 }}
        >
          The page you're looking for seems to have wandered off.
        </h1>

        <p 
          style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '18px', 
            lineHeight: 1.6, 
            marginBottom: '36px' 
          }}
          id="notfound-description"
        >
          The essay, note, or link you followed may have been moved, renamed, or perhaps never existed at all.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch} 
          style={{ 
            display: 'flex', 
            maxWidth: '460px', 
            margin: '0 auto 40px', 
            gap: '10px' 
          }}
          id="notfound-search-form"
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '14px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
            <input
              type="text"
              placeholder="Search stories & essays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '40px', fontSize: '14px' }}
              id="notfound-search-input"
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0 20px', fontSize: '14px' }}>
            Search
          </button>
        </form>

        {/* Quick Navigation Cards */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '16px',
            textAlign: 'left'
          }}
        >
          <Link 
            to="/writing" 
            className="notebook-card" 
            style={{ 
              margin: 0, 
              padding: '20px', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            id="notfound-link-writing"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#2563eb' }}>
              <Compass size={16} />
              <strong style={{ fontSize: '14px' }}>Explore Writing</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Browse all essays across Technology, Travel, and Life.
            </p>
          </Link>

          <Link 
            to="/notes" 
            className="notebook-card" 
            style={{ 
              margin: 0, 
              padding: '20px', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            id="notfound-link-notes"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#047857' }}>
              <BookOpen size={16} />
              <strong style={{ fontSize: '14px' }}>Field Notes</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Short reflections, quotes, and thoughts in progress.
            </p>
          </Link>

          <Link 
            to="/projects" 
            className="notebook-card" 
            style={{ 
              margin: 0, 
              padding: '20px', 
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            id="notfound-link-projects"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: '#b45309' }}>
              <Layers size={16} />
              <strong style={{ fontSize: '14px' }}>Projects</strong>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Open-source software, prototypes, and builds.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
