import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeToNewsletter } from '../api';

export default function NewsletterSubscribe({ 
  title = "Get new stories in your inbox", 
  description = "No spam, no algorithms. Receive an email whenever a new piece is published on Travel, Technology, or Life." 
}) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await subscribeToNewsletter(email.trim());
      setStatus({ 
        type: 'success', 
        message: res.message || "You're subscribed! Check your inbox for confirmation." 
      });
      setEmail('');
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Unable to subscribe right now. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-card" id="newsletter-subscribe-section">
      <div className="newsletter-inner">
        <div className="newsletter-header">
          <p className="eyebrow" style={{ marginBottom: '8px' }}>NEWSLETTER</p>
          <h2 className="newsletter-title">{title}</h2>
          <p className="newsletter-desc">{description}</p>
        </div>

        {status && status.type === 'success' ? (
          <div className="newsletter-feedback success" id="subscription-success-box">
            <Check size={18} className="feedback-icon" />
            <div>
              <strong>Subscribed!</strong>
              <p>{status.message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="newsletter-form" id="newsletter-form">
            <div className="newsletter-input-wrapper">
              <Mail size={16} className="newsletter-icon" />
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="newsletter-input"
                id="newsletter-email-input"
                aria-label="Email address for subscription"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary newsletter-submit-btn"
              id="btn-subscribe"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="spin-icon" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
        )}

        {status && status.type === 'error' && (
          <div className="newsletter-feedback error" id="subscription-error-box">
            <AlertCircle size={16} />
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </section>
  );
}
