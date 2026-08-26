
/**
 * Generates a URL-friendly slug from a string.
 * Converts to lowercase, removes non-alphanumeric characters, and replaces spaces with hyphens.
 * @param text The text to slugify
 * @returns The generated slug
 */
export function generateSlug(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
}
