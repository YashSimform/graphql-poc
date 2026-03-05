import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a resolver method as public (no auth required).
 * Use when the whole resolver is protected but some queries should be public.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
