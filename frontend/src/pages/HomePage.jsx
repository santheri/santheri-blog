import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../api';
import { ArrowRight, Sparkles } from 'lucide-react';
import NewsletterSubscribe from '../components/NewsletterSubscribe';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchPosts();
        setPosts(data.slice(0, 5));
      } catch (err) {
        console.error('Error fetching latest posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
    <div className="content-wrap" id="home-page-container">
      {/* Hero Section */}
      <section className="hero-section" id="hero-section">
        <p className="eyebrow">SOFTWARE · AI · LIFE</p>
        <h1 className="hero-title">
          Hi, I'm Santheri.
        </h1>
        <p className="hero-subtext">
          I build software, explore AI, travel when I get the chance,
          and write things down so I don't forget them.
        </p>

        <div className="hero-actions">
          <Link to="/about" className="btn-primary" id="btn-hero-about">
            About me <ArrowRight size={16} />
          </Link>
          <Link to="/projects" className="btn-secondary" id="btn-hero-projects">
            View projects →
          </Link>
        </div>
      </section>

      {/* Latest Writing */}
      <section className="feed-section" id="latest-writing-section">
        <div className="feed-header">
          <h2 className="feed-title">Latest writing</h2>
          <Link to="/writing" className="btn-secondary" id="link-view-all-writing">
            View all stories →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '40px 0', color: '#77736b' }}>Loading latest stories...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '40px 0', color: '#77736b' }}>No posts published yet.</div>
        ) : (
          <div className="posts-list" id="home-posts-list">
            {posts.map((post) => (
              <article key={post.id} className="post-item-row" id={`post-row-${post.id}`}>
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

                  <h3 className={`post-item-title font-${post.font_style || 'serif'}`}>
                    <Link to={`/writing/${post.slug || post.id}`} id={`post-title-link-${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>

                  {post.description && (
                    <p className="post-item-desc">{post.description}</p>
                  )}
                </div>

                <div className="post-date-col">
                  <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                  <span style={{ fontSize: '12px', color: '#949088' }}>{post.reading_time || '3 min'}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Subscription */}
      <NewsletterSubscribe />

      {/* From The Notebook */}
      <section className="notebook-card" id="notebook-preview-card">
        <p className="eyebrow">FROM THE NOTEBOOK</p>
        <h2>
          Small thoughts, things I'm learning, and everything in between.
        </h2>
        <Link to="/notes" className="btn-primary" id="btn-explore-notebook" style={{ display: 'inline-flex' }}>
          Explore the notebook →
        </Link>
      </section>
    </div>
  );
}
