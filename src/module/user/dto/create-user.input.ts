import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from '../../../common/validation/validators';
import {
  EMAIL_REGEX,
  PASSWORD_STRENGTH_REGEX,
} from '../../../common/validation/validation-patterns';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'User full name' })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name must be at least 1 character' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @Field(() => String, { description: 'Unique email address' })
  @IsEmail({ message: 'Must be a valid email address' })
  @Matches(EMAIL_REGEX, {
    message: 'Email must include a valid domain with a top-level domain (e.g. user@example.com)',
  })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field(() => String, {
    description:
      'Password for the account (minimum 8 characters, must contain at least 1 number and 1 special character)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(PASSWORD_STRENGTH_REGEX, {
    message:
      'Password must contain at least 1 number and 1 special character',
  })
  password: string;
}
