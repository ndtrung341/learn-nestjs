export const camelCase = (str: string) => {
   return str
      .replace(/^[A-Z]/, (match) => match.toLowerCase())
      .replace(/[\s-_]+(\w)/g, (_, char) => char.toUpperCase());
};

export const snakeCase = (str: string) => {
   return str.replace(/(?!^)([A-Z])/g, '_$1').toLowerCase();
};

export function slugify(text: string, separator: string = '-'): string {
   return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word chars
      .replace(/[\s_-]+/g, separator) // Replace spaces, underscores, dashes with single dash
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}
