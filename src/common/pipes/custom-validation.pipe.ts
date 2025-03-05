import { BaseException } from '@common/exceptions/base.exception';
import { PipeTransform, ArgumentMetadata, HttpStatus } from '@nestjs/common';
import { camelToSnake } from '@utils/string';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Custom validation pipe that validates incoming data against DTO classes
 * and formats validation errors with snake_case property names.
 */
export class CustomValidationPipe implements PipeTransform {
   async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.shouldValidate(metatype)) {
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

   private shouldValidate(metatype: Function) {
      const types: Function[] = [Object, Number, String, Boolean, Array];
      return !types.includes(metatype);
   }

   private formatErrors(errors: ValidationError[], parentPath = '') {
      const formattedErrors: Record<string, string> = {};

      for (const error of errors) {
         const property = camelToSnake(error.property);
         const path = parentPath ? `${parentPath}.${property}` : property;

         if (error.children?.length) {
            Object.assign(
               formattedErrors,
               this.formatErrors(error.children, path),
            );
         } else {
            formattedErrors[path] = this.formatErrorMessage(error);
         }
      }

      return formattedErrors;
   }

   private formatErrorMessage(error: ValidationError): string {
      // Get the first constraint message
      const message = Object.values(error.constraints || {})[0];

      // Replace camelCase property name with snake_case in the message
      const propertyName = error.property;
      const snakeCaseProperty = camelToSnake(propertyName);

      // Only replace the property name if it appears as a whole word
      return message.replace(
         new RegExp(`\\b${propertyName}\\b`, 'g'),
         snakeCaseProperty,
      );
   }
}
