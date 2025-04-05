import { Injectable } from '@nestjs/common';
import { Snowflake } from '@utils/snowflake';

@Injectable()
export class SnowflakeService {
   private readonly _sf: Snowflake;

   constructor() {
      this._sf = new Snowflake({
         epoch: new Date('2025-01-01T00:00:00Z').getTime(),
         machineBits: 4,
         sequenceBits: 10,
         machineId: 1,
      });
   }

   generate() {
      return this._sf.nextId();
   }
}
