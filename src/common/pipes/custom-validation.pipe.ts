import { BaseException } from '@common/exceptions/base.exception';
import {
   PipeTransform,
   ArgumentMetadata,
   HttpStatus,
   Injectable,
} from '@nestjs/common';
import { camelToSnake } from '@utils/string';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

/**
 * Custom validation pipe that validates incoming data against DTO classes
 * and formats validation errors with snake_case property names.
 */
@Injectable()
export class CustomValidationPipe implements PipeTransform {
   async transform(value: any, { metatype }: ArgumentMetadata) {
      if (!metatype || !this.shouldValidate(metatype)) {
         return value;
      }

      const object = plainToInstance(metatype, value, {
         enableImplicitConversion: true,
      });

      const errors = await validate(object, {
         whitelist: true,
         forbidNonWhitelisted: true,
         // stopAtFirstError: true,
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
      const types: Function[] = [String, Boolean, Number, Array, Object, Date];
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
            console.log(error.constraints);
            const message = Object.values(error.constraints || {})[0];
            formattedErrors[path] = this.formatErrorMessage(
               error.property,
               message,
            );
         }
      }

      return formattedErrors;
   }

   /**
    * Format error message to use snake_case property names
    */
   private formatErrorMessage(propertyName: string, message: string): string {
      const snakeCaseProperty = camelToSnake(propertyName);

      // Only replace the property name if it appears as a whole word
      return message.replace(
         new RegExp(`\\b${propertyName}\\b`, 'g'),
         snakeCaseProperty,
      );
   }
}
