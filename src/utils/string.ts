export const snakeToCamel = (str: string): string =>
   str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

export const camelToSnake = (str: string): string =>
   str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export function slugify(text: string): string {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, dashes with single dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}
