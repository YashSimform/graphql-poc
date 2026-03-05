import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface GqlContextWithReq {
  req?: { body?: { operationName?: string } };
}

@Injectable()
export class GqlLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('GraphQL');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx: GqlContextWithReq = gqlContext.getContext();
    const operationName =
      ctx?.req?.body?.operationName ?? gqlContext.getHandler().name;

    const handlerName = gqlContext.getHandler().name;
    const operationType = handlerName.startsWith('get') ? 'Query' : 'Mutation';
    this.logger.log(`[${operationType}] ${operationName} called`);

    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(
          `[${operationType}] ${operationName} completed in ${duration}ms`,
        );
      }),
    );
  }
}
