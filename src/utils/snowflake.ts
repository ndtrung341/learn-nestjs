/**
 * Options for configuring the Snowflake ID generator
 */
type SnowflakeOptions = {
   /** Custom epoch timestamp in milliseconds */
   epoch?: number;
   /** Number of bits allocated for machine ID */
   machineBits?: number;
   /** Number of bits allocated for sequence number */
   sequenceBits?: number;
   /** ID of this machine/instance (must be unique) */
   machineId?: number;
};

/**
 * Snowflake ID Generator
 *
 * A distributed unique ID generator inspired by Twitter's Snowflake.
 * Generates 64-bit IDs with the following structure:
 * - 1 bit: Reserved (always 0)
 * - 41+ bits: Timestamp (milliseconds since epoch)
 * - X bits: Machine ID (configurable)
 * - Y bits: Sequence number (configurable)
 */
export class Snowflake {
   /** Starting timestamp (epoch) in milliseconds */
   readonly epoch: number;
   /** Number of bits allocated for machine ID */
   readonly machineBits: number;
   /** Number of bits allocated for sequence number */
   readonly sequenceBits: number;

   /** Maximum possible machine ID value */
   readonly maxMachineId: number;
   /** Maximum possible sequence value */
   readonly maxSequence: number;

   /** Number of bits to shift timestamp left */
   readonly timestampShift: number;
   /** Number of bits to shift machine ID left */
   readonly machineIdShift: number;

   /** ID of this machine/instance */
   private readonly machineId: number;
   /** Timestamp of last ID generation */
   private lastTimestamp: number = -1;
   /** Sequence counter within the same millisecond */
   private sequence: number = 0;

   /**
    * Creates a new Snowflake ID generator
    * @param options Configuration options
    */
   constructor(options: SnowflakeOptions = {}) {
      const {
         epoch = new Date('2024-01-01T00:00:00Z').getTime(),
         machineBits = 10,
         sequenceBits = 12,
         machineId = 1,
      } = options;

      this.epoch = epoch;
      this.machineBits = machineBits;
      this.sequenceBits = sequenceBits;

      this.maxMachineId = (1 << machineBits) - 1;
      this.maxSequence = (1 << sequenceBits) - 1;

      this.timestampShift = machineBits + sequenceBits;
      this.machineIdShift = sequenceBits;

      if (machineId < 0 || machineId > this.maxMachineId) {
         throw new Error(
            `Machine ID must be between 0 and ${this.maxMachineId}`,
         );
      }

      this.machineId = machineId;
   }

   /**
    * Generates the next unique ID
    * @returns A BigInt Snowflake ID
    */
   nextId(): bigint {
      let timestamp = Date.now();

      // Handle clock regression
      if (timestamp < this.lastTimestamp) {
         throw new Error('Clock moved backwards');
      }

      // Handle multiple IDs in the same millisecond
      if (timestamp === this.lastTimestamp) {
         // Increment sequence counter
         this.sequence = (this.sequence + 1) & this.maxSequence;
         // If sequence overflows, wait until next millisecond
         if (this.sequence === 0) {
            timestamp = this.waitNextMillis();
         }
      } else {
         // Reset sequence for new millisecond
         this.sequence = 0;
      }

      this.lastTimestamp = timestamp;

      // Compose ID from components using BigInt to handle 64-bit values properly
      return (
         (BigInt(timestamp - this.epoch) << BigInt(this.timestampShift)) |
         (BigInt(this.machineId) << BigInt(this.machineIdShift)) |
         BigInt(this.sequence)
      );
   }

   /**
    * Generates the next unique ID as a string
    * @returns A string representation of the Snowflake ID
    */
   nextIdString(): string {
      return this.nextId().toString();
   }

   /**
    * Waits until the next millisecond arrives
    */
   private waitNextMillis(): number {
      let timestamp = Date.now();
      while (timestamp <= this.lastTimestamp) {
         timestamp = Date.now();
      }
      return timestamp;
   }

   /**
    * Extracts the components from a Snowflake ID
    */
   decompose(id: bigint): {
      timestamp: Date;
      machineId: number;
      sequence: number;
   } {
      const timestamp = Number(id >> BigInt(this.timestampShift)) + this.epoch;
      const machineId = Number(
         (id >> BigInt(this.machineIdShift)) & BigInt(this.maxMachineId),
      );
      const sequence = Number(id & BigInt(this.maxSequence));

      return {
         timestamp: new Date(timestamp),
         machineId,
         sequence,
      };
   }
}
