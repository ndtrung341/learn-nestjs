import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { camelCase, snakeCase } from '@utils/string';
import { map } from 'rxjs';

/**
 * Interceptor that transforms request/response data between snake_case and camelCase
 * - Transforms request body from snake_case to camelCase
 * - Transforms response data from camelCase to snake_case
 */
@Injectable()
export class CamelSnakeInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler<any>) {
      const request = context.switchToHttp().getRequest();

      // Transform request body from snake_case to camelCase
      if (request.body) {
         request.body = this.transformKeys(request.body, camelCase);
      }

      // Transform response from camelCase to snake_case
      return next
         .handle()
         .pipe(map((data) => this.transformKeys(data, snakeCase)));
   }

   private transformKeys(data: any, transformer: (str: string) => string) {
      if (!data || typeof data !== 'object' || data instanceof Date) {
         return data;
      }

      if (Array.isArray(data)) {
         return data.map((item) => this.transformKeys(item, transformer));
      }

      return Object.entries(data).reduce((acc, [key, val]) => {
         return {
            ...acc,
            [transformer(key)]: this.transformKeys(val, transformer),
         };
      }, {});
   }
}
