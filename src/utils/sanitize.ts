/**
 * Sanitizes a string for use as a filename or directory name.
 * - Normalizes special characters (é -> e, à -> a, etc.)
 * - Replaces non-alphanumeric characters with hyphens
 * - Collapses multiple hyphens
 * - Removes leading/trailing hyphens
 * - Limits length
 */
export function sanitizeFilename(input: string, maxLength: number = 100): string {
  if (!input) {
    return "";
  }

  return input
    // Normalize Unicode characters (NFD = Normalized Form Decomposed)
    // This separates base characters from diacritics (accents)
    .normalize("NFD")
    // Remove diacritics (accents) - keep only base characters
    .replace(/[\u0300-\u036f]/g, "")
    // Convert to lowercase
    .toLowerCase()
    // Replace non-alphanumeric characters (except spaces) with hyphens
    .replace(/[^a-z0-9\s]/g, "-")
    // Replace spaces with hyphens
    .replace(/\s+/g, "-")
    // Collapse multiple consecutive hyphens into a single hyphen
    .replace(/-+/g, "-")
    // Remove leading and trailing hyphens
    .replace(/^-|-$/g, "")
    // Limit length
    .substring(0, maxLength)
    // Remove trailing hyphen if truncation created one
    .replace(/-$/, "");
}

