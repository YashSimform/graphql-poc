/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- GqlExecutionContext.getContext() is untyped */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

@Injectable()
export class GqlAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const request = gqlContext.req;
    const authHeader = request?.headers?.authorization;
    const expectedKey = process.env.AUTH_API_KEY;

    if (!expectedKey) {
      return true;
    }

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header.');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (token !== expectedKey) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (request) request.user = { authenticated: true };
    return true;
  }
}
