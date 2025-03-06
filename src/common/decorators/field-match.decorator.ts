import {
   registerDecorator,
   ValidationArguments,
   ValidationOptions,
   ValidatorConstraint,
   ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class FieldMatchConstraint implements ValidatorConstraintInterface {
   validate(
      value: any,
      args?: ValidationArguments,
   ): Promise<boolean> | boolean {
      const relatedPropertyName = args?.constraints[0];
      const relatedValue = (args?.object as any)[relatedPropertyName];
      return value === relatedValue;
   }

   defaultMessage?(args?: ValidationArguments): string {
      return `${args?.property} must match ${args?.constraints[0]}.`;
   }
}

export function FieldMatch(
   property: string,
   validationOptions?: ValidationOptions,
) {
   return function (object: Object, propertyName: string) {
      return registerDecorator({
         target: object.constructor,
         propertyName,
         constraints: [property],
         options: validationOptions,
         validator: FieldMatchConstraint,
      });
   };
}
