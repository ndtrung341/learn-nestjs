import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  comparePassword,
  hashPassword,
} from 'src/common/helpers/password.helper';
import {
  EmailAlreadyExistsException,
  InvalidPasswordException,
  UserNotFoundException,
} from 'src/common/exceptions/domain.exception';
import { plainToClass } from 'class-transformer';
import { UserDto } from 'src/users/dto/user.dto';
import { MailService } from 'src/mail/mail.service';
import { ProviderToken } from 'src/common/constants/provider-token';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    @Inject(ProviderToken.MAIL_SERVICE_ALIAS) private mailService: MailService,
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

    await this.mailService.sendMail(
      user.email,
      'Welcome to Our App',
      `Hi ${user.fullName}. Have a nice day.`,
    );

    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);

    if (!user) {
      throw new UserNotFoundException();
    }

    const isPasswordValid = await comparePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    return plainToClass(UserDto, user, { excludeExtraneousValues: true });
  }
}
