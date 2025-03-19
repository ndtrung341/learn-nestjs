import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import { UserEntity } from './entities/user.entity';
import { SessionEntity } from './entities/session.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import {
   EmailAlreadyExistsException,
   EmailAlreadyVerifiedException,
   InvalidVerificationTokenException,
   SessionBlacklistedException,
   SessionInvalidException,
   SessionNotFoundException,
} from '@common/exceptions/auth.exception';

import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import ms from 'ms';

import { createCacheKey } from '@utils/cache';
import { CACHE_KEY } from '@constants/app.constants';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UsersService {
   constructor(
      private configService: ConfigService,
      @InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>,
      @InjectRepository(SessionEntity)
      private sessionRepository: Repository<SessionEntity>,
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
   ) {}

   /**
    * Create a new user with a verification token.
    */
   async create(dto: CreateUserDto) {
      const existingUser = await this.findOneByEmail(dto.email);
      if (existingUser) {
         throw new EmailAlreadyExistsException();
      }
      const verifyToken = uuidv4();
      const verifyExpires = new Date();
      verifyExpires.setMinutes(verifyExpires.getMinutes() + 2);
      const newUser = this.userRepository.create({
         ...dto,
         verifyToken,
         verifyExpires,
      });
      return this.userRepository.save(newUser);
   }

   /**
    * Update user details.
    */
   async update(id: string, dto: UpdateUserDto) {
      const user = await this.userRepository.findOneBy({ id });
      return await this.userRepository.save({ ...user, ...dto });
   }

   /**
    * Find a user by email.
    */
   async findOneByEmail(email: string) {
      return this.userRepository.findOne({
         where: { email },
      });
   }

   /**
    * Find a user by ID.
    */
   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }

   /**
    * Verify a user's email using a token.
    */
   async verify(token: string) {
      const user = await this.userRepository.findOneBy({ verifyToken: token });
      if (!user) {
         throw new InvalidVerificationTokenException();
      }
      if (user.isVerified) {
         throw new EmailAlreadyVerifiedException();
      }
      if (dayjs().isAfter(user.verifyExpires)) {
         throw new InvalidVerificationTokenException();
      }
      return this.userRepository.update(user.id, {
         verifyToken: undefined,
         verifyExpires: undefined,
         isVerified: true,
      });
   }

   /**
    * Create a new user session.
    */
   async createSession(userId: string) {
      const expiresIn = +ms(
         this.configService.getOrThrow('jwt.refreshExpires'),
      );

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
   async removeSession(sessionId: string) {
      return this.sessionRepository.delete({ id: sessionId });
   }

   /**
    * Removes expired or invalid sessions every day at 6 AM.
    */
   @Cron('0 06 * * *')
   async removeExpiredSessions() {
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
      await this.cacheManager.set<boolean>(
         createCacheKey(CACHE_KEY.SESSION_BLACKLIST, session.id),
         true,
         ttl,
      );
   }

   /**
    * Check if a session is valid and active.
    */
   async checkSessionValidity(sessionId: string, token: string) {
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
}
