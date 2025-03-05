import {
   CallHandler,
   ExecutionContext,
   Injectable,
   NestInterceptor,
} from '@nestjs/common';
import { camelToSnake, snakeToCamel } from '@utils/string';
import { map } from 'rxjs';

/**
 * Interceptor that transforms request/response data between snake_case and camelCase
 * - Transforms request body from snake_case to camelCase
 * - Transforms response data from camelCase to snake_case
 */
@Injectable()
export class CaseFormatInterceptor implements NestInterceptor {
   intercept(context: ExecutionContext, next: CallHandler<any>) {
      const request = context.switchToHttp().getRequest();

      // Transform request body from snake_case to camelCase
      if (request.body) {
         request.body = this.transformKeys(request.body, snakeToCamel);
      }

      // Transform response from camelCase to snake_case
      return next
         .handle()
         .pipe(map((data) => this.transformKeys(data, camelToSnake)));
   }

   private transformKeys(data: any, transformer: (str: string) => string) {
      if (!data || typeof data !== 'object') {
         return data;
      }

      if (Array.isArray(data)) {
         data.map((item) => this.transformKeys(item, transformer));
      }

      return Object.entries(data).reduce((acc, [key, val]) => {
         return {
            ...acc,
            [transformer(key)]: this.transformKeys(val, transformer),
         };
      }, {});
   }
}
