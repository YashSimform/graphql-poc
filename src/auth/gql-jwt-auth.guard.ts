import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator';

interface GqlContextWithReq {
  req?: unknown;
}

@Injectable()
export class GqlJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext): unknown {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext: GqlContextWithReq = ctx.getContext();
    return gqlContext.req;
  }

  canActivate(
    context: ExecutionContext,
  ): ReturnType<typeof AuthGuard.prototype.canActivate> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context) as ReturnType<
      typeof AuthGuard.prototype.canActivate
    >;
  }
}
