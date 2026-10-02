import { randomBytes, createHash } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity.js';
import { toUserResponse } from '../users/dto/user-response.dto.js';
import type { UserResponseDto } from '../users/dto/user-response.dto.js';
import { USER_USERNAME_MAX_LENGTH } from '../users/constants/users.constants.js';
import { Email } from '../emails/entities/email.entity.js';
import { EmailType } from '../emails/enums/email-type.enum.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import type { AuthResponseDto, MessageResponseDto } from './dto/auth-response.dto.js';
import {
  AUTH_BCRYPT_SALT_ROUNDS,
  AUTH_GENERIC_FORGOT_PASSWORD_MESSAGE,
  AUTH_RESET_TOKEN_BYTES,
  AUTH_RESET_TOKEN_TTL_MS,
} from './constants/auth.constants.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Email)
    private readonly emailsRepository: Repository<Email>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with that email already exists');
    }

    const username = await this.generateUsername(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, AUTH_BCRYPT_SALT_ROUNDS);

    const user = await this.usersRepository.save(
      this.usersRepository.create({
        fname: dto.fname,
        lname: dto.lname,
        phone: dto.phone,
        email: dto.email,
        username,
        password: hashedPassword,
      }),
    );

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async me(userId: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return toUserResponse(user);
  }

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<MessageResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    const currentPasswordMatches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!currentPasswordMatches) {
      throw new BadRequestException('Current password is incorrect');
    }

    if (dto.newPassword === dto.currentPassword) {
      throw new BadRequestException('New password must be different from the current password');
    }

    user.password = await bcrypt.hash(dto.newPassword, AUTH_BCRYPT_SALT_ROUNDS);
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<MessageResponseDto> {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });

    if (user) {
      const rawToken = randomBytes(AUTH_RESET_TOKEN_BYTES).toString('hex');
      user.passwordResetTokenHash = this.hashToken(rawToken);
      user.passwordResetTokenExpiresAt = new Date(Date.now() + AUTH_RESET_TOKEN_TTL_MS);
      await this.usersRepository.save(user);

      await this.emailsRepository.save(
        this.emailsRepository.create({
          user,
          order: null,
          recipientEmail: user.email,
          type: EmailType.PASSWORD_RESET,
          sentAt: new Date(),
        }),
      );

      // No SMTP/email-dispatch integration exists in this codebase yet.
      // The Email row above is the audit record; this log is a stand-in until one is wired up.
      console.log(`Password reset link for ${user.email}: /reset-password?token=${rawToken}`);
    }

    return { message: AUTH_GENERIC_FORGOT_PASSWORD_MESSAGE };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<MessageResponseDto> {
    const tokenHash = this.hashToken(dto.token);
    const user = await this.usersRepository.findOne({
      where: { passwordResetTokenHash: tokenHash },
    });

    if (!user || !user.passwordResetTokenExpiresAt) {
      throw new BadRequestException('Invalid or expired reset link');
    }

    if (user.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Reset link has expired, please request a new one');
    }

    const newPasswordMatchesCurrent = await bcrypt.compare(dto.newPassword, user.password);
    if (newPasswordMatchesCurrent) {
      throw new BadRequestException('New password must be different from the current password');
    }

    user.password = await bcrypt.hash(dto.newPassword, AUTH_BCRYPT_SALT_ROUNDS);
    user.passwordResetTokenHash = null;
    user.passwordResetTokenExpiresAt = null;
    await this.usersRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponseDto> {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return { accessToken, user: toUserResponse(user) };
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async generateUsername(email: string): Promise<string> {
    const base =
      email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, USER_USERNAME_MAX_LENGTH) || 'user';

    let candidate = base;
    let suffix = 1;

    while (await this.usersRepository.findOne({ where: { username: candidate } })) {
      suffix += 1;
      candidate = `${base}${suffix}`.slice(0, USER_USERNAME_MAX_LENGTH);
    }

    return candidate;
  }
}
