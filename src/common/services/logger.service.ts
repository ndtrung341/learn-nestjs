import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  constructor(@Inject(INQUIRER) private parentClass: object) {}

  log(message: any) {
    console.log(`[${this.parentClass?.constructor?.name}]`, message);
  }
}
