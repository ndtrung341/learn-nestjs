import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import { SessionEntity } from '../entities/session.entity';

import {
   SessionBlacklistedException,
   SessionInvalidException,
   SessionNotFoundException,
} from '@exceptions/auth.exception';

import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

import { createCacheKey } from '@utils/cache';
import { CACHE_KEY } from '@constants/app.constants';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SessionsService {
   constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      @InjectRepository(SessionEntity)
      private sessionRepository: Repository<SessionEntity>,
   ) {}

   /**
    * Create a new user session.
    */
   async createSession(userId: string, expiresIn: number) {
      const session = this.sessionRepository.create({
         userId,
         token: uuidv4(),
         expiresIn,
      });

      return this.sessionRepository.save(session);
   }

   /*
    * Rotate a session every refresh token
    */
   async rotateSession(session: SessionEntity) {
      session.token = uuidv4();
      return this.sessionRepository.save(session);
   }

   /**
    * Remove a session by ID.
    */
   async deleteSession(sessionId: string) {
      const result = await this.sessionRepository.delete({ id: sessionId });
      if (result.affected === 0) {
         throw new SessionNotFoundException();
      }
      return result;
   }

   /**
    * Remove expired or invalid sessions every day at 6 AM.
    */
   @Cron('0 06 * * *')
   async cleanupExpiredSessions() {
      this.sessionRepository
         .createQueryBuilder()
         .delete()
         .where('invalid = :invalid', { invalid: true })
         .orWhere("NOW() > updated_at + (expires_in * INTERVAL '1 ms')")
         .execute();
   }

   /**
    * Check if a session is blacklisted.
    */
   async isSessionBlacklisted(sessionId: string) {
      const result = await this.cacheManager.get<boolean>(
         createCacheKey(CACHE_KEY.SESSION_BLACKLIST, sessionId),
      );

      return Boolean(result);
   }

   /**
    * Invalidate a session and adds it to the blacklist
    */
   async blacklistSession(session: SessionEntity) {
      const ttl = session.expiresIn - dayjs().diff(session.updatedAt, 'ms');
      await this.sessionRepository.update(session.id, { invalid: true });
      await this.cacheManager.set(
         createCacheKey(CACHE_KEY.SESSION_BLACKLIST, session.id),
         true,
         ttl,
      );
   }

   /**
    * Check if a session is valid and active.
    */
   async validateSession(sessionId: string, token: string) {
      if (await this.isSessionBlacklisted(sessionId)) {
         throw new SessionBlacklistedException();
      }

      const session = await this.sessionRepository.findOneBy({ id: sessionId });
      if (!session) {
         throw new SessionNotFoundException();
      }

      if (session.invalid || session.token !== token) {
         await this.blacklistSession(session);
         throw new SessionInvalidException();
      }

      return session;
   }

   /**
    * Validate and rotate new session if valid.
    */
   async validateAndRotateSession(sessionId: string, token: string) {
      const session = await this.validateSession(sessionId, token);

      return this.rotateSession(session);
   }
}
