import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import {
   EmailAlreadyExistsException,
   EmailAlreadyVerifiedException,
   InvalidVerificationTokenException,
} from '@common/exceptions/auth.exception';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUserDto } from './dto/update-user.dto';
import { SessionEntity } from './entities/session.entity';
import ms from 'ms';
import dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
   constructor(
      private configService: ConfigService,
      @InjectRepository(UserEntity)
      private userRepository: Repository<UserEntity>,
      @InjectRepository(SessionEntity)
      private sessionRepository: Repository<SessionEntity>,
   ) {}

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

   async update(id: string, dto: UpdateUserDto) {
      const user = await this.userRepository.findOneBy({ id });
      return await this.userRepository.save({ ...user, ...dto });
   }

   async findOneByEmail(email: string) {
      return this.userRepository.findOneBy({ email });
   }

   async findOneById(id: string) {
      return this.userRepository.findOneBy({ id });
   }

   async verify(token: string) {
      const user = await this.userRepository.findOneBy({ verifyToken: token });

      if (!user) {
         throw new InvalidVerificationTokenException();
      }

      if (user.isVerified) {
         throw new EmailAlreadyVerifiedException();
      }

      if (new Date() > user.verifyExpires!) {
         throw new InvalidVerificationTokenException();
      }

      return this.userRepository.update(user.id, {
         verifyToken: undefined,
         verifyExpires: undefined,
         isVerified: true,
      });
   }

   async createSession(userId: string) {
      const expiresIn = +ms(this.configService.get('jwt.refreshExpires')!);

      const session = this.sessionRepository.create({
         userId,
         jti: uuidv4(),
         expiresIn,
      });
      return this.sessionRepository.save(session);
   }

   async updateSession(sessionId: string, jti: string) {
      const session = await this.sessionRepository.findOneBy({ id: sessionId });

      if (!session || session.invalid || session.jti !== jti) {
         if (session) {
            await this.sessionRepository.update(session.id, { invalid: true });
         }
         throw new UnauthorizedException();
      }

      session.jti = uuidv4();
      return this.sessionRepository.save(session);
   }

   async removeSession(sessionId: string) {
      return this.sessionRepository.delete({ id: sessionId });
   }
}
