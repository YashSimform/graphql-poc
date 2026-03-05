/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- GqlExecutionContext.getContext() is untyped */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Use in resolvers to get the current user from the GraphQL context.
 * Example: @CurrentUser() user: AuthPayload
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): unknown => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    return gqlContext.req?.user ?? null;
  },
);
