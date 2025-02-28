import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

enum LogType {
   LOG = 'LOG',
   ERROR = 'ERROR',
   WARN = 'WARN',
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
   private readonly context: string;
   private readonly colors = {
      LOG: '\x1b[94m',
      ERROR: '\x1b[31m',
      WARN: '\x1b[33m',
      CONTEXT: '\x1b[95m',
      RESET: '\x1b[0m',
   } as const;

   constructor(@Inject(INQUIRER) parentClass: object) {
      this.context = parentClass?.constructor?.name ?? 'UnknownContext';
   }

   private print(type: LogType, data: any[]) {
      const typeColor = this.colors[type];
      const contextColor = this.colors.CONTEXT;
      const resetColor = this.colors.RESET;
      const context = this.context;

      const prefix = `${typeColor}[${type}] ${contextColor}[${context}]${resetColor}`;

      console[type.toLowerCase()](prefix, ...data);
   }

   info(...args: any[]) {
      this.print(LogType.LOG, args);
   }

   error(...args: any[]) {
      this.print(LogType.ERROR, args);
   }

   warn(...args: any[]) {
      this.print(LogType.WARN, args);
   }
}
