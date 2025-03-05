export const snakeToCamel = (str: string): string =>
   str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());

export const camelToSnake = (str: string): string =>
   str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
