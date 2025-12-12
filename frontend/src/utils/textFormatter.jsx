import React from 'react';

// Helper to find the earliest match among multiple regexes
const findFirstMatch = (text, rules) => {
    let bestMatch = null;
    let bestIndex = Infinity;

    for (const [type, regex] of Object.entries(rules)) {
        const match = regex.exec(text);
        if (match && match.index < bestIndex) {
            bestMatch = { type, match };
            bestIndex = match.index;
        }
    }

    return bestMatch;
};

const RULES = {
    bold: /^\*\*([\s\S]+?)\*\*/, // **bold** - Check first to avoid italic capturing
    code: /^`([^`]+)`/, // Code blocks (no nesting)
    link: /^\[([^\]]+)\]\(([^)]+)\)/, // Links [text](url)
    italic: /^\*((?:[^*]|\*\*)+?)\*/, // *italic* (allows ** inside)
    underline: /^__([\s\S]+?)__/, // __underline__
    strike: /^~~([\s\S]+?)~~/, // ~~strike~~
    newline: /^\n/ // Newline
};

const parseText = (text, keyPrefix = '0') => {
    if (!text) return [];

    const elements = [];
    let remaining = text;
    let index = 0;

    while (remaining.length > 0) {
        // Find the nearest match for any rule
        let bestMatch = null;
        let bestType = null;
        let minIndex = Infinity;

        for (const [type, regex] of Object.entries(RULES)) {
            // We need to find the match in the *remaining* string, but not necessarily at the start
            // However, regex.exec only finds the first one.
            // To support "find first occurrence", we can't use ^ anchor in the loop if we search the whole string.
            // But my RULES have ^.
            // Strategy: We iterate through the string? No, that's slow.
            // Better: Use a regex without ^ and find the one with the lowest index.

            const globalRegex = new RegExp(regex.source.replace('^', ''), '');
            const match = globalRegex.exec(remaining);

            if (match && match.index < minIndex) {
                minIndex = match.index;
                bestMatch = match;
                bestType = type;
            }
        }

        if (bestMatch) {
            // 1. Push text before match
            if (minIndex > 0) {
                elements.push(remaining.slice(0, minIndex));
            }

            const key = `${keyPrefix}-${index}`;
            const content = bestMatch[1]; // Inner content

            // 2. Push element
            switch (bestType) {
                case 'newline':
                    elements.push(<br key={key} />);
                    break;
                case 'code':
                    elements.push(<code key={key} style={{ background: 'rgba(150,150,150,0.2)', borderRadius: '4px', fontFamily: 'monospace' }}>{content}</code>);
                    break;
                case 'link':
                    elements.push(
                        <a key={key} href={bestMatch[2]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>
                            {parseText(content, `${key}-link`)}
                        </a>
                    );
                    break;
                case 'bold':
                    elements.push(<strong key={key}>{parseText(content, `${key}-bold`)}</strong>);
                    break;
                case 'underline':
                    elements.push(<u key={key}>{parseText(content, `${key}-u`)}</u>);
                    break;
                case 'strike':
                    elements.push(<s key={key}>{parseText(content, `${key}-s`)}</s>);
                    break;
                case 'italic':
                    elements.push(<em key={key}>{parseText(content, `${key}-em`)}</em>);
                    break;
                default:
                    elements.push(bestMatch[0]);
            }

            // 3. Advance
            remaining = remaining.slice(minIndex + bestMatch[0].length);
            index++;
        } else {
            // No matches found, push remaining text
            elements.push(remaining);
            break;
        }
    }

    return elements;
};

export const formatText = (text) => {
    return parseText(text);
};
