import * as bcrypt from 'bcryptjs';

export const hash = async (value: string) => {
   const salt = await bcrypt.genSalt(10);
   return bcrypt.hash(value, salt);
};

export const verify = async (value: string, hashedValue: string) => {
   return bcrypt.compare(value, hashedValue);
};
