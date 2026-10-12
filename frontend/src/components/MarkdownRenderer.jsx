import React from 'react';
import { getImageUrl } from '../api';

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split by double newline into blocks
  const blocks = content.split(/\n\s*\n/);

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

  const renderInline = (text) => {
    if (!text) return '';

    // Handle links [text](url)
    const parts = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
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

        // Heading 1: # Title (mapped to h2 in body for SEO semantic hierarchy)
        if (trimmed.startsWith('# ')) {
          return <h2 key={index}>{renderInline(trimmed.replace(/^#\s+/, ''))}</h2>;
        }

        // Heading 2: ## Title
        if (trimmed.startsWith('## ')) {
          return <h2 key={index}>{renderInline(trimmed.replace(/^##\s+/, ''))}</h2>;
        }

        // Heading 3: ### Title
        if (trimmed.startsWith('### ')) {
          return <h3 key={index}>{renderInline(trimmed.replace(/^###\s+/, ''))}</h3>;
        }

        // Heading 4: #### Title
        if (trimmed.startsWith('#### ')) {
          return <h4 key={index}>{renderInline(trimmed.replace(/^####\s+/, ''))}</h4>;
        }

        // Blockquote: > Quote
        if (trimmed.startsWith('> ')) {
          const quoteLines = trimmed.split('\n').map(l => l.replace(/^>\s*/, '')).join(' ');
          return <blockquote key={index}>{renderInline(quoteLines)}</blockquote>;
        }

        // Code block: ```lang ... ```
        if (trimmed.startsWith('```')) {
          const lines = trimmed.split('\n');
          const codeContent = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
          return (
            <pre key={index}>
              <code>{codeContent}</code>
            </pre>
          );
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
