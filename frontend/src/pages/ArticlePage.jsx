import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPost, getImageUrl } from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import { ArrowLeft, Clock, Calendar, Type } from 'lucide-react';

const FONT_OPTIONS = [
  { id: 'serif', label: 'Literary Serif', className: 'font-serif' },
  { id: 'sans', label: 'Modern Sans', className: 'font-sans' },
  { id: 'editorial', label: 'Editorial', className: 'font-editorial' },
  { id: 'mono', label: 'Tech Mono', className: 'font-mono' },
  { id: 'minimal', label: 'Poetic Minimal', className: 'font-minimal' },
];

export default function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFont, setActiveFont] = useState('serif');

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPost(slug);
        setPost(data);
        if (data.font_style) {
          setActiveFont(data.font_style);
        }
      } catch (err) {
        setError(err.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug]);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getCategoryClass = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat === 'travel') return 'category-badge-travel';
    if (cat === 'technology') return 'category-badge-technology';
    return 'category-badge-life';
  };

  if (loading) {
    return (
      <div className="reading-wrap" style={{ padding: '120px 0', textAlign: 'center', color: '#77736b' }}>
        Loading article...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="reading-wrap" style={{ padding: '120px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '16px' }}>Article not found</h2>
        <p style={{ color: '#77736b', marginBottom: '24px' }}>
          The article you are looking for might have been moved or removed.
        </p>
        <Link to="/writing" className="btn-primary">
          ← Back to all writing
        </Link>
      </div>
    );
  }

  return (
    <article className={`article-page ${FONT_OPTIONS.find(f => f.id === activeFont)?.className || 'font-serif'}`} id="article-page">
      <div className="reading-wrap">
        <div className="article-header-area">
          <Link to="/writing" className="back-link" id="back-to-writing-link">
            <ArrowLeft size={16} /> Back to writing
          </Link>

          {/* Interactive Reader Typography Switcher */}
          <div className="reader-font-toolbar" id="reader-font-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#77736b' }}>
              <Type size={15} />
              <span>Typography:</span>
            </div>
            <div className="reader-font-controls" id="reader-font-controls">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveFont(f.id)}
                  className={`font-switch-btn ${activeFont === f.id ? 'active' : ''}`}
                  id={`btn-switch-font-${f.id}`}
                  title={`Switch reading font to ${f.label}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <p className={`eyebrow ${getCategoryClass(post.category)}`} style={{ marginBottom: '14px' }}>
            {post.category.toUpperCase()}
          </p>

          <h1 className="article-title" id="article-main-title">
            {post.title}
          </h1>

          {post.description && (
            <p className="article-desc" id="article-description">
              {post.description}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#77736b', fontSize: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              <span>{post.reading_time || '4 min read'}</span>
            </span>
            {post.font_style && (
              <span className="post-font-badge" title="Author's chosen default font">
                Author styling: {post.font_style}
              </span>
            )}
          </div>
        </div>

        {/* Featured Cover Picture if uploaded */}
        {post.cover_image && (
          <img
            src={getImageUrl(post.cover_image)}
            alt={post.title}
            className="article-cover-img"
            id="article-cover-image"
          />
        )}

        {/* Main Article Body */}
        <MarkdownRenderer content={post.content} />

        {/* Post Reader Newsletter Subscription */}
        <div style={{ marginTop: '70px', paddingTop: '40px', borderTop: '1px solid var(--border-light)' }}>
          <NewsletterSubscribe 
            title="Enjoyed this story?" 
            description="Subscribe to get my latest essays, travelogues, and technical notes delivered directly to your inbox." 
          />
        </div>
      </div>
    </article>
  );
}
