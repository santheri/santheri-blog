import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPost, getImageUrl } from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPost(slug);
        setPost(data);
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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

  const articleFontClass = `font-${post.font_style || 'serif'}`;

  return (
    <article className={`article-page ${articleFontClass}`} id="article-page">
      <div className="reading-wrap">
        <div className="article-header-area">
          <Link to="/writing" className="back-link" id="back-to-writing-link">
            <ArrowLeft size={16} /> Back to writing
          </Link>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#77736b', fontSize: '14px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={15} />
              <span>{post.reading_time || '4 min read'}</span>
            </span>
          </div>
        </div>

        {/* Featured Cover Picture if uploaded */}
        {post.cover_image && (
          <img
            src={getImageUrl(post.cover_image)}
            alt={post.title}
            className="article-cover-img"
            id="article-cover-image"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
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
