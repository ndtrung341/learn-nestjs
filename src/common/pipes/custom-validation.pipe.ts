import { BaseException } from '@common/exceptions/base.exception';
import { PipeTransform, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

export class CustomValidationPipe implements PipeTransform {
   async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.toValidate(metatype)) {
         return value;
      }

      const object = plainToInstance(metatype, value);
      const errors = await validate(object, {
         whitelist: true,
         forbidNonWhitelisted: true,
      });

      if (errors.length > 0) {
         throw new BaseException(
            'Validation failed',
            HttpStatus.BAD_REQUEST,
            'VALIDATION_ERROR',
            this.formatErrors(errors),
         );
      }

      return object;
   }

   private toValidate(metatype: Function) {
      const types: Function[] = [Object, Number, String, Boolean, Array];
      return !types.includes(metatype);
   }

   private formatErrors(errors: ValidationError[], parent = '') {
      const result: Record<string, any> = {};

      for (const err of errors) {
         const field = parent ? `${parent}.${err.property}` : err.property;
         if (!err.children?.length) {
            result[field] = Object.values(err.constraints || {})[0];
         } else {
            Object.assign(result, this.formatErrors(err.children, field));
         }
      }

      return result;
   }
}
