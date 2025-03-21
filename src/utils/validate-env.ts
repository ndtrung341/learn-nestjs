import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

function validateEnv<T extends object>(
   config: Record<string, any>,
   envVariablesClass: ClassConstructor<T>,
) {
   const validatedConfig = plainToInstance(envVariablesClass, config, {
      enableImplicitConversion: true,
   });

   const erroos = validateSync(validatedConfig, {
      skipMissingProperties: false,
   });

   if (erroos.length) {
      throw new Error(erroos.toString());
   }

   return validatedConfig;
}

export default validateEnv;
