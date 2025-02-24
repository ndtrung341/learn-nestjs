import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import { nanoid } from 'nanoid';
import { UsersService } from '@modules/users/users.service';
import { MailService } from '@modules/mail/mail.service';
import { UserDto } from '@modules/users/dto/user.dto';
import { ProviderToken } from '@common/constants/provider-token';
import { comparePassword, hashPassword } from '@utils/password';
import { LoginDto, RegisterDto } from './dto';
import {
  EmailAlreadyExistsException,
  EmailNotVerifiedException,
  InvalidCredentialsException,
  InvalidVerificationTokenException,
} from '@common/exceptions/auth.exception';

@Injectable()
export class AuthService {
  private verificationTokens: Map<string, string> = new Map();

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(ProviderToken.MAIL_SERVICE_ALIAS)
    private readonly mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException();
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

    if (!user || !(await comparePassword(loginDto.password, user.password))) {
      throw new InvalidCredentialsException();
    }

    if (!user.verified) {
      throw new EmailNotVerifiedException();
    }

    const accessToken = await this.jwtService.signAsync({
      id: user.id,
      name: user.fullName,
    });

    return {
      user: plainToClass(UserDto, user, { excludeExtraneousValues: true }),
      accessToken,
    };
  }

  async verifyEmail(token: string) {
    const userId = this.verificationTokens.get(token);
    const user = userId ? await this.userService.findById(+userId) : null;

    if (!user) {
      throw new InvalidVerificationTokenException();
    }

    if (user.verified) {
      throw new EmailAlreadyExistsException();
    }

    await this.userService.update(user.id, { verified: true });
    this.verificationTokens.delete(token);
  }

  private async sendVerificationEmail(user: any): Promise<void> {
    const token = nanoid(6);
    this.verificationTokens.set(token, user.id.toString());

    await this.mailService.sendMail(
      user.email,
      'Verify Your Email',
      `Hi ${user.fullName}. Please verify your email by clicking this link: 
      http://localhost:3000/auth/verify/${token}`,
    );
  }
}
