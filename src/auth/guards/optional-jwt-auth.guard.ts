import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RequestWithOptionalUser } from './jwt-auth.guard.js';

// Missing token -> anonymous (request.user stays undefined). Present-but-invalid
// token -> still rejected, same as JwtAuthGuard. Used where login is optional
// (e.g. guest checkout) but a bad token shouldn't be silently downgraded to guest.
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithOptionalUser>();
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

    if (!token) {
      return true;
    }

    try {
      request.user = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }
}
