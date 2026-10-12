import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAboutProfile, getImageUrl } from '../api';
import MarkdownRenderer from '../components/MarkdownRenderer';

const DEFAULT_BIO = `I'm Santheri, a software engineer who likes building things, learning things I don't understand yet, and occasionally disappearing somewhere new.

I currently work in software and spend a lot of my time exploring AI, agent systems, and the many interesting problems that come with building resilient technology.

Outside of work, I write, travel, take photographs, read, and collect thoughts that I probably should have written down earlier.

This website is where I keep some of those things — organized neatly into **Travel**, **Technology**, and **Life**.`;

export default function AboutPage() {
  const [profile, setProfile] = useState({
    headline: 'A little bit about me.',
    bio: DEFAULT_BIO,
    avatar_image: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAbout() {
      try {
        const data = await fetchAboutProfile();
        if (data && data.headline) {
          setProfile(data);
        }
      } catch (err) {
        console.warn('Could not load dynamic about profile, using default:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAbout();
  }, []);

  return (
    <div className="reading-wrap" id="about-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '28px' }}>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <section style={{ paddingTop: '32px' }}>
        <p className="eyebrow">ABOUT</p>
        <h1 className="hero-title" style={{ fontSize: 'clamp(44px, 6vw, 76px)', marginBottom: '36px' }}>
          {profile.headline}
        </h1>

        {/* Profile Picture if uploaded */}
        {profile.avatar_image && (
          <div style={{ marginBottom: '40px' }}>
            <img
              src={getImageUrl(profile.avatar_image)}
              alt="Santheri"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              style={{
                width: '100%',
                maxHeight: '440px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
              }}
              id="about-avatar-image"
            />
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '21px', lineHeight: '1.75', color: 'var(--text-main)' }}>
          <MarkdownRenderer content={profile.bio} />

          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--border-light)' }}>
            <Link to="/writing" className="btn-primary" style={{ display: 'inline-flex' }}>
              Read my stories →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
