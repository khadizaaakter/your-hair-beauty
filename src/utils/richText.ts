const ALLOWED_TAGS = new Set([
    'P',
    'BR',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'UL',
    'OL',
    'LI',
]);

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const normalizeLineBreaks = (value: string): string =>
    value
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('');

export const sanitizeRichTextHtml = (value?: string | null): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
        return normalizeLineBreaks(raw);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${raw}</div>`, 'text/html');
    const root = doc.body.firstElementChild as HTMLElement | null;
    if (!root) return '';

    const sanitizeNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
            return escapeHtml(node.textContent || '');
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const element = node as HTMLElement;
        const tagName = element.tagName.toUpperCase();
        const children = Array.from(element.childNodes).map(sanitizeNode).join('');

        if (!ALLOWED_TAGS.has(tagName)) {
            return children;
        }

        if (tagName === 'BR') {
            return '<br />';
        }

        const normalizedTag = tagName.toLowerCase();
        return `<${normalizedTag}>${children}</${normalizedTag}>`;
    };

    return Array.from(root.childNodes).map(sanitizeNode).join('').trim();
};

export const richTextToPlainText = (value?: string | null): string =>
    String(value || '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li)>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]{2,}/g, ' ')
        .trim();
