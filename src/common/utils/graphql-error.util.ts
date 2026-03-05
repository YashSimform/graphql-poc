import { GraphQLError } from 'graphql';
import { HttpStatus } from '@nestjs/common';

function getNestStatus(original: unknown): number | undefined {
  if (original && typeof original === 'object' && 'getStatus' in original) {
    return (original as { getStatus(): number }).getStatus();
  }
  if (original && typeof original === 'object' && 'statusCode' in original) {
    return (original as { statusCode: number }).statusCode;
  }
  return undefined;
}

function getNestResponse(original: unknown): unknown {
  if (original && typeof original === 'object' && 'getResponse' in original) {
    return (original as { getResponse(): unknown }).getResponse();
  }
  if (original && typeof original === 'object' && 'response' in original) {
    return (original as { response: unknown }).response;
  }
  return undefined;
}

const PRISMA_CODE_MAP: Record<string, { status: number; message: string }> = {
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'A record with this value already exists.',
  },
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found.' },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Foreign key constraint failed.',
  },
};

function getMessageFromNestResponse(response: unknown): string {
  if (response && typeof response === 'object' && 'message' in response) {
    const msg = (response as { message: unknown }).message;
    return Array.isArray(msg) ? msg.join('; ') : String(msg);
  }
  if (
    response !== null &&
    response !== undefined &&
    typeof response === 'object'
  ) {
    return 'Bad request';
  }
  return typeof response === 'string' ? response : 'Bad request';
}

export function formatGraphqlError(error: GraphQLError): GraphQLError {
  const original = error.originalError as
    | undefined
    | { code?: string; response?: unknown; statusCode?: number };
  const prismaCode = original?.code;
  const mapped = prismaCode ? PRISMA_CODE_MAP[prismaCode] : null;
  const nestStatus = getNestStatus(original);
  const nestResponse = getNestResponse(original);
  const nestMessage = nestResponse
    ? getMessageFromNestResponse(nestResponse)
    : null;

  const statusCode =
    (error.extensions?.statusCode as number) ??
    nestStatus ??
    mapped?.status ??
    HttpStatus.INTERNAL_SERVER_ERROR;
  const message = nestMessage ?? mapped?.message ?? error.message;
  const code =
    (error.extensions?.code as string) ??
    prismaCode ??
    (statusCode === 401
      ? 'UNAUTHENTICATED'
      : statusCode === 403
        ? 'FORBIDDEN'
        : statusCode === 404
          ? 'NOT_FOUND'
          : statusCode === 409
            ? 'CONFLICT'
            : statusCode >= 500
              ? 'INTERNAL_SERVER_ERROR'
              : 'BAD_REQUEST');

  return new GraphQLError(message, {
    extensions: {
      code,
      statusCode,
      ...(error.extensions && typeof error.extensions === 'object'
        ? error.extensions
        : {}),
    },
    originalError: error.originalError,
    nodes: error.nodes,
    path: error.path,
    source: error.source,
    positions: error.positions,
  });
}
