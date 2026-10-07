import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchPosts } from '../api';
import { ArrowLeft } from 'lucide-react';

export default function WritingPage() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const activeSearch = searchParams.get('search') || '';

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);
      try {
        const data = await fetchPosts(activeCategory || '', activeSearch);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching writing posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [activeCategory, activeSearch]);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

  return (
    <div className="content-wrap" id="writing-page-container" style={{ paddingBottom: '120px' }}>
      {/* Back to Home Link */}
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link" id="link-back-home">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      {/* Editorial Header */}
      <section className="hero-section" style={{ padding: '24px 0 36px', maxWidth: '850px' }}>
        <p className="eyebrow" id="writing-eyebrow">
          {activeCategory ? activeCategory.toUpperCase() : 'WRITING'}
        </p>

        <h1 className="page-hero-title" id="writing-header-title" style={{ margin: '12px 0 0' }}>
          {activeCategory
            ? `Writing about ${activeCategory.toLowerCase()}.`
            : `Things I've written while trying to understand the world a little better.`}
        </h1>

        {activeSearch && (
          <p style={{ marginTop: '16px', color: '#77736b', fontSize: '16px' }}>
            Showing results for <strong style={{ color: '#171717' }}>"{activeSearch}"</strong>
            {activeCategory && <span> in <strong>{activeCategory}</strong></span>}
          </p>
        )}
      </section>

      {/* Posts Listing */}
      <section className="feed-section" style={{ paddingTop: 0 }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#77736b' }}>
            Loading writing collection...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '60px 0', color: '#77736b', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>
            No articles found {activeCategory ? `in ${activeCategory}` : ''} {activeSearch ? `matching "${activeSearch}"` : ''}.
          </div>
        ) : (
          <div className="posts-list" id="writing-posts-list">
            {posts.map((post) => (
              <article key={post.id} className="post-item-row" id={`article-row-${post.id}`}>
                <div>
                  <div className="post-meta-top">
                    <span className={`post-category-tag ${getCategoryClass(post.category)}`}>
                      {post.category}
                    </span>
                    {post.font_style && (
                      <span className="post-font-badge">
                        {post.font_style} font
                      </span>
                    )}
                  </div>

                  <h2 className={`post-item-title font-${post.font_style || 'serif'}`}>
                    <Link to={`/writing/${post.slug || post.id}`} id={`article-link-${post.id}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {post.description && (
                    <p className="post-item-desc">{post.description}</p>
                  )}
                </div>

                <div className="post-date-col">
                  <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                  <span style={{ fontSize: '12px', color: '#949088' }}>
                    {post.reading_time || '4 min'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
