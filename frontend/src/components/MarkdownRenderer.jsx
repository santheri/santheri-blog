import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { getImageUrl } from '../api';

// Initialize Mermaid once
try {
  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    securityLevel: 'loose',
    fontFamily: 'Inter, -apple-system, sans-serif'
  });
} catch (e) {
  console.warn('Failed to initialize mermaid:', e);
}

function MermaidDiagram({ chart }) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function renderChart() {
      try {
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart.trim());
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Diagram syntax error');
        }
      }
    }
    if (chart && chart.trim()) {
      renderChart();
    }
    return () => { isMounted = false; };
  }, [chart]);

  if (error) {
    return (
      <div style={{ margin: '24px 0', padding: '16px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '6px', fontSize: '13px', color: '#991b1b' }}>
        <strong>Mermaid syntax error:</strong> {error}
        <pre style={{ marginTop: '8px', fontSize: '12px', overflowX: 'auto' }}><code>{chart}</code></pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div style={{ margin: '24px 0', padding: '24px', textAlign: 'center', color: '#77736b', background: 'var(--bg-subtle)', borderRadius: '8px', fontSize: '14px' }}>
        Rendering diagram...
      </div>
    );
  }

  return (
    <div
      className="mermaid-wrapper"
      style={{
        margin: '32px 0',
        padding: '24px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: '8px',
        overflowX: 'auto',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Pre-normalize content:
  // 1. Separate images ![alt](url) onto isolated blocks
  let normalized = content.replace(/(^|\n)(!\[[^\]]*\]\([^)]+\))(\n|$)/g, '$1\n\n$2\n\n$3');
  // 2. Separate headings (# Title, ## Title, etc.) from adjacent lines
  normalized = normalized.replace(/(^|\n)(#{1,6}\s+[^\n]+)(\n|$)/g, '$1\n\n$2\n\n$3');
  // 3. Separate lists from preceding non-list lines
  normalized = normalized.replace(/([^\n])\n([-*]|\d+\.)\s+/g, '$1\n\n$2 ');

  const blocks = normalized.split(/\n\s*\n/).filter(b => b.trim().length > 0);

  const renderItalics = (text, keyPrefix = 'it') => {
    if (!text) return null;
    const italicSegments = text.split(/(?<!\*)\*([^*]+)\*(?!\*)/g);
    if (italicSegments.length === 1) return text;

    return italicSegments.map((part, i) => {
      if (i % 2 === 1) {
        return <em key={`${keyPrefix}-${i}`}>{part}</em>;
      }
      return part;
    });
  };

  const renderFormatting = (text) => {
    if (!text) return null;

    // Split by inline code blocks first so backticks aren't touched by bold/italic
    const codeSegments = text.split(/(`[^`]+`)/g);

    return codeSegments.map((segment, segIdx) => {
      if (segment.startsWith('`') && segment.endsWith('`') && segment.length >= 2) {
        return <code key={segIdx}>{segment.slice(1, -1)}</code>;
      }

      // Split by bold **text**
      const boldSegments = segment.split(/(\*\*[^*]+\*\*)/g);
      return boldSegments.map((boldSeg, boldIdx) => {
        if (boldSeg.startsWith('**') && boldSeg.endsWith('**') && boldSeg.length >= 4) {
          const inner = boldSeg.slice(2, -2);
          return <strong key={`${segIdx}-${boldIdx}`}>{renderItalics(inner, `${segIdx}-${boldIdx}`)}</strong>;
        }
        return renderItalics(boldSeg, `${segIdx}-${boldIdx}`);
      });
    });
  };

  const renderTextAndLinks = (text) => {
    if (!text) return '';

    // Handle regular links [text](url) with negative lookbehind (?<!\!) so images aren't hijacked
    const parts = [];
    const linkRegex = /(?<!\!)\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderFormatting(text.slice(lastIndex, match.index)));
      }
      parts.push(
        <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="article-body-link">
          {renderFormatting(match[1])}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(renderFormatting(text.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : renderFormatting(text);
  };

  const renderInline = (text) => {
    if (!text) return '';

    // If an image ![alt](url) exists inside text, render it cleanly as an image figure
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    if (imageRegex.test(text)) {
      const segments = [];
      let lastImgIdx = 0;
      let imgMatch;
      imageRegex.lastIndex = 0;
      while ((imgMatch = imageRegex.exec(text)) !== null) {
        if (imgMatch.index > lastImgIdx) {
          segments.push(renderTextAndLinks(text.slice(lastImgIdx, imgMatch.index)));
        }
        segments.push(
          <figure key={imgMatch.index} style={{ margin: '36px 0', textAlign: 'center' }}>
            <img
              src={getImageUrl(imgMatch[2])}
              alt={imgMatch[1]}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #dedcd6' }}
            />
            {imgMatch[1] && (
              <figcaption style={{ fontSize: '13px', color: '#77736b', marginTop: '8px', fontStyle: 'italic' }}>
                {imgMatch[1]}
              </figcaption>
            )}
          </figure>
        );
        lastImgIdx = imgMatch.index + imgMatch[0].length;
      }
      if (lastImgIdx < text.length) {
        segments.push(renderTextAndLinks(text.slice(lastImgIdx)));
      }
      return segments;
    }

    return renderTextAndLinks(text);
  };

  return (
    <div className={`article-body ${className}`}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        // Horizontal rule: --- or *** or ___
        if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
          return <hr key={index} className="article-hr" style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '40px 0' }} />;
        }

        // Image block: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          return (
            <figure key={index} style={{ margin: '36px 0', textAlign: 'center' }}>
              <img
                src={getImageUrl(imgMatch[2])}
                alt={imgMatch[1]}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #dedcd6' }}
              />
              {imgMatch[1] && (
                <figcaption style={{ fontSize: '13px', color: '#77736b', marginTop: '8px', fontStyle: 'italic' }}>
                  {imgMatch[1]}
                </figcaption>
              )}
            </figure>
          );
        }

        // Code block: ```lang ... ``` or ```mermaid ... ```
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const firstLine = lines[0].trim().toLowerCase();
          const isMermaid = firstLine === '```mermaid';
          const codeContent = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');

          if (isMermaid) {
            return <MermaidDiagram key={index} chart={codeContent} />;
          }

          return (
            <pre key={index}>
              <code>{codeContent}</code>
            </pre>
          );
        }

        // Heading 1: # Title
        if (trimmed.startsWith('# ')) {
          const lines = trimmed.split('\n');
          const headingText = lines[0].replace(/^#\s+/, '');
          const restText = lines.slice(1).join('\n').trim();
          return (
            <React.Fragment key={index}>
              <h2>{renderInline(headingText)}</h2>
              {restText && <p>{renderInline(restText)}</p>}
            </React.Fragment>
          );
        }

        // Heading 2: ## Title
        if (trimmed.startsWith('## ')) {
          const lines = trimmed.split('\n');
          const headingText = lines[0].replace(/^##\s+/, '');
          const restText = lines.slice(1).join('\n').trim();
          return (
            <React.Fragment key={index}>
              <h2>{renderInline(headingText)}</h2>
              {restText && <p>{renderInline(restText)}</p>}
            </React.Fragment>
          );
        }

        // Heading 3: ### Title
        if (trimmed.startsWith('### ')) {
          const lines = trimmed.split('\n');
          const headingText = lines[0].replace(/^###\s+/, '');
          const restText = lines.slice(1).join('\n').trim();
          return (
            <React.Fragment key={index}>
              <h3>{renderInline(headingText)}</h3>
              {restText && <p>{renderInline(restText)}</p>}
            </React.Fragment>
          );
        }

        // Heading 4: #### Title
        if (trimmed.startsWith('#### ')) {
          const lines = trimmed.split('\n');
          const headingText = lines[0].replace(/^####\s+/, '');
          const restText = lines.slice(1).join('\n').trim();
          return (
            <React.Fragment key={index}>
              <h4>{renderInline(headingText)}</h4>
              {restText && <p>{renderInline(restText)}</p>}
            </React.Fragment>
          );
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('> ')) {
          const quoteLines = trimmed.split('\n').map(l => l.replace(/^>\s*/, '')).join(' ');
          return <blockquote key={index}>{renderInline(quoteLines)}</blockquote>;
        }

        // Ordered list: 1. item
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split('\n').filter(l => /^\d+\.\s+/.test(l.trim())).map(l => l.trim().replace(/^\d+\.\s+/, ''));
          return (
            <ol key={index}>
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }

        // Unordered list: - item or * item
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const items = trimmed.split('\n').map(l => l.replace(/^[-*]\s+/, ''));
          return (
            <ul key={index}>
              {items.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Standard paragraph
        const lines = trimmed.split('\n');
        if (lines.length > 1) {
          return (
            <p key={index}>
              {lines.map((line, lineIdx) => (
                <React.Fragment key={lineIdx}>
                  {lineIdx > 0 && <br />}
                  {renderInline(line)}
                </React.Fragment>
              ))}
            </p>
          );
        }

        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}
