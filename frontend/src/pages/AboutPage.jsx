import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="reading-wrap" id="about-page-container" style={{ paddingBottom: '120px' }}>
      <div style={{ paddingTop: '50px' }}>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back home
        </Link>
      </div>

      <section style={{ paddingTop: '60px' }}>
        <p className="eyebrow">ABOUT</p>
        <h1 className="hero-title" style={{ fontSize: 'clamp(48px, 7vw, 80px)', marginBottom: '50px' }}>
          A little bit about me.
        </h1>

        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', lineHeight: '1.7', color: 'var(--text-main)' }}>
          <p style={{ marginBottom: '30px' }}>
            I'm Santheri, a software engineer who likes building things,
            learning things I don't understand yet, and occasionally
            disappearing somewhere new.
          </p>

          <p style={{ marginBottom: '30px' }}>
            I currently work in software and spend a lot of my time
            exploring AI, agent systems, and the many interesting problems
            that come with building resilient technology.
          </p>

          <p style={{ marginBottom: '30px' }}>
            Outside of work, I write, travel, take photographs, read,
            and collect thoughts that I probably should have written down
            earlier.
          </p>

          <p style={{ marginBottom: '30px' }}>
            This website is where I keep some of those things — organized neatly into 
            <strong> Travel</strong>, <strong>Technology</strong>, and <strong>Life</strong>.
          </p>

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
