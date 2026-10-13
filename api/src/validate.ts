export const LIMITS = { title: 120, post: 5000, comment: 1000 };

/** Trimmed text of 1..max characters, or an error message for the 400. */
export function text(value: unknown, field: string, max: number): { value: string } | { error: string } {
    const v = typeof value === "string" ? value.trim() : "";
    if (!v) return { error: `${field} is required` };
    if (v.length > max) return { error: `${field} is too long (max ${max} characters)` };
    return { value: v };
}
