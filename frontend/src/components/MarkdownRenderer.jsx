import React from 'react';

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;

  // Split by double newline into blocks
  const blocks = content.split(/\n\s*\n/);

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
          {match[1]}
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(renderFormatting(text.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : renderFormatting(text);
  };

  const renderFormatting = (text) => {
    // Bold: **text**
    const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      // Inline code: `code`
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((subPart, j) => {
        if (subPart.startsWith('`') && subPart.endsWith('`')) {
          return <code key={`${i}-${j}`}>{subPart.slice(1, -1)}</code>;
        }
        return subPart;
      });
    });
  };

  return (
    <div className={`article-body ${className}`}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();

        // Image: ![alt](url)
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          return (
            <figure key={index} style={{ margin: '36px 0', textAlign: 'center' }}>
              <img
                src={imgMatch[2]}
                alt={imgMatch[1]}
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

        // Heading 2: ## Title
        if (trimmed.startsWith('## ')) {
          return <h2 key={index}>{renderInline(trimmed.replace(/^##\s+/, ''))}</h2>;
        }

        // Heading 3: ### Title
        if (trimmed.startsWith('### ')) {
          return <h3 key={index}>{renderInline(trimmed.replace(/^###\s+/, ''))}</h3>;
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
        return <p key={index}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}
