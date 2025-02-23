import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  comparePassword,
  hashPassword,
} from 'src/common/helpers/password.helper';
import {
  EmailAlreadyExists,
  EmailAlreadyVerified,
  EmailNotVerified,
  InvalidCredentials,
  InvalidVerificationToken,
  MailSendFailed,
} from 'src/common/exceptions/domain.exception';
import { plainToClass } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';
import { MailService } from 'src/mail/mail.service';
import { ProviderToken } from 'src/common/constants/provider-token';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {
  private verificationTokens: Map<string, string> = new Map();

  constructor(
    private userService: UsersService,
    @Inject(ProviderToken.MAIL_SERVICE_ALIAS) private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new EmailAlreadyExists();
    }

    const passwordHash = await hashPassword(registerDto.password);
    const user = await this.userService.create({
      ...registerDto,
      password: passwordHash,
    });

    await this.sendVerificationEmail(user);

    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    const isValid =
      !!user && (await comparePassword(loginDto.password, user.password));
    if (!isValid) {
      throw new InvalidCredentials();
    }

    if (!user.verified) {
      throw new EmailNotVerified();
    }

    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async verifyEmail(token: string) {
    const userId = this.verificationTokens.get(token);
    const user = userId ? await this.userService.findById(+userId) : null;

    if (!user) {
      throw new InvalidVerificationToken();
    }

    if (user.verified) {
      throw new EmailAlreadyVerified();
    }

    user.verified = true;
    this.verificationTokens.delete(token);
  }

  private async sendVerificationEmail(user: any): Promise<void> {
    const token = nanoid(6);
    this.verificationTokens.set(token, user.id.toString());

    try {
      await this.mailService.sendMail(
        user.email,
        'Verify Your Email',
        `Hi ${user.fullName}. Please verify your email by clicking this link: 
      http://localhost:3000/auth/verify/${token}`,
      );
    } catch (error) {
      this.verificationTokens.delete(token);
      throw new MailSendFailed();
    }
  }
}
