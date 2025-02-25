import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { nanoid } from 'nanoid';

@Injectable({ scope: Scope.REQUEST })
export class ApiTrackerService {
   private requestId: string;
   private startTime: number;
   private endTime?: number;
   private status: 'pending' | 'success' | 'failed';

   constructor(@Inject(REQUEST) private request: Request) {
      this.requestId = nanoid(6);
      console.log(`🔍 New API tracker created - Request ID: ${this.requestId}`);
   }

   startTrack() {
      this.startTime = Date.now();
      this.status = 'pending';
   }

   endTrack(success: boolean) {
      this.endTime = Date.now();
      this.status = success ? 'success' : 'failed';
   }

   getRequestMetrics() {
      return {
         id: this.requestId,
         method: this.request.method,
         path: this.request.path,
         duration: (this.endTime ?? Date.now()) - this.startTime,
         status: this.status,
      };
   }
}
