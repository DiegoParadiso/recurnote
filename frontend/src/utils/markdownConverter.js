
// Helper to escape HTML characters
const escapeHtml = (unsafe) => {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Helper to unescape HTML characters
const unescapeHtml = (safe) => {
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "'");
};

export const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    let html = markdown;

    // Escape HTML first to prevent XSS and interference
    html = escapeHtml(html);

    // Replace newlines with <br>
    // Replace newlines with <br>
    html = html.replace(/\n/g, '<br>');

    // Bold (**text**) -> <b>text</b>
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Italic (*text*) -> <i>text</i>
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');

    // Strikethrough (~~text~~) -> <s>text</s>
    html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

    // Underline (__text__) -> <u>text</u>
    html = html.replace(/__(.*?)__/g, '<u>$1</u>');

    // Highlight (==text==) -> <mark>text</mark>
    html = html.replace(/==(.*?)==/g, '<mark style="background-color: #fef08a; color: black; padding: 0 2px; border-radius: 2px;">$1</mark>');

    // Code (`text`) -> <code>text</code>
    html = html.replace(/`(.*?)`/g, '<code style="background: rgba(150,150,150,0.2); padding: 2px 4px; border-radius: 4px; font-family: monospace;">$1</code>');

    // Link ([text](url)) -> <a href="url">text</a>
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">$1</a>');

    return html;
};

export const htmlToMarkdown = (html) => {
    if (!html) return '';

    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Helper to traverse and convert
    const traverse = (node) => {
        let text = '';

        for (const child of node.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                const tagName = child.tagName.toLowerCase();
                const content = traverse(child);

                switch (tagName) {
                    case 'br':
                        // If br is the last child of a block element, it might be ignored by browser, but let's keep it simple
                        text += '\n';
                        break;
                    case 'div':
                    case 'p':
                        // Block element. Add newline before if not empty text so far.
                        if (text.length > 0 && !text.endsWith('\n')) text += '\n';

                        // If content is just a newline (from br), don't add another one if we already added one?
                        // Actually, <div><br></div> should be ONE newline if it's an empty line.
                        // If we added \n before, and content is \n. We get \n\n.
                        // That's an empty line. Correct.

                        // But if <div>Line 1</div><div>Line 2</div>
                        // Line 1. \n. Line 2. -> Line 1\nLine 2. Correct.

                        text += content;
                        break;
                    case 'b':
                    case 'strong':
                        text += `**${content}**`;
                        break;
                    case 'i':
                    case 'em':
                        text += `*${content}*`;
                        break;
                    case 's':
                    case 'strike':
                    case 'del':
                        text += `~~${content}~~`;
                        break;
                    case 'u':
                        text += `__${content}__`;
                        break;
                    case 'mark':
                        text += `==${content}==`;
                        break;
                    case 'code':
                        text += `\`${content}\``;
                        break;
                    case 'a':
                        const href = child.getAttribute('href');
                        text += `[${content}](${href})`;
                        break;
                    default:
                        text += content;
                }
            }
        }
        return text;
    };

    let markdown = traverse(tempDiv);

    // Unescape HTML entities
    // markdown = unescapeHtml(markdown); 
    // Actually, traverse(textContent) already handles entities mostly, but let's be safe if we need to.

    // Clean up excessive newlines if any
    // markdown = markdown.replace(/\n\n+/g, '\n');

    return markdown;
};

export const stripMarkdown = (markdown) => {
    if (!markdown) return '';
    // Remove links but keep text: [text](url) -> text
    let text = markdown.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove other markers: **, __, ~~, ==, *, `
    text = text.replace(/(\*\*|__|~~|==|\*|`)/g, '');
    return text;
};
