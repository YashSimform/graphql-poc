import {
  Allow as AllowBase,
  IsEmail as IsEmailBase,
  IsNotEmpty as IsNotEmptyBase,
  IsOptional as IsOptionalBase,
  IsString as IsStringBase,
  IsUUID as IsUUIDBase,
  MaxLength as MaxLengthBase,
  MinLength as MinLengthBase,
} from 'class-validator';

type PropertyDecoratorFn = (
  target: object,
  propertyKey: string | symbol,
) => void;

export const IsEmail = IsEmailBase as (options?: {
  message?: string;
}) => PropertyDecoratorFn;
export const IsNotEmpty = IsNotEmptyBase as (options?: {
  message?: string;
}) => PropertyDecoratorFn;
export const IsOptional = IsOptionalBase as () => PropertyDecoratorFn;
export const IsString = IsStringBase as () => PropertyDecoratorFn;
export const IsUUID = IsUUIDBase as (
  version?: string,
  options?: { message?: string },
) => PropertyDecoratorFn;
export const MaxLength = MaxLengthBase as (
  length: number,
  options?: { message?: string },
) => PropertyDecoratorFn;
export const MinLength = MinLengthBase as (
  length: number,
  options?: { message?: string },
) => PropertyDecoratorFn;

/** Use to whitelist properties for ValidationPipe (forbidNonWhitelisted) when no other validator needed. */
export const Allow = AllowBase as () => PropertyDecoratorFn;
