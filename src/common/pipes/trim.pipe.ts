import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
   transform(value: any, metadata: ArgumentMetadata) {
      console.log(value);

      if (typeof value === 'string') {
         return value.trim();
      }
      return value;
   }
}
