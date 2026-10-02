import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestWithOptionalUser } from '../guards/jwt-auth.guard.js';

export const OptionalCurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithOptionalUser>();
    return request.user;
  },
);
