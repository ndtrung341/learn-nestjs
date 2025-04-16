import { CACHE_KEY } from '@constants/app.constants';
import { format } from 'node:util';

export const createCacheKey = (key: keyof typeof CACHE_KEY, ...args: any[]) => {
   return format(CACHE_KEY[key], ...args);
};
