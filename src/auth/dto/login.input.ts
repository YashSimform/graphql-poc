import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from '../../common/validation/validators';
import {
  EMAIL_REGEX,
  PASSWORD_STRENGTH_REGEX,
} from '../../common/validation/validation-patterns';

@InputType()
export class LoginInput {
  @Field(() => String, { description: 'User email' })
  @IsEmail({ message: 'Must be a valid email address' })
  @Matches(EMAIL_REGEX, {
    message: 'Email must include a valid domain with a top-level domain (e.g. user@example.com)',
  })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field(() => String, { description: 'User password' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(PASSWORD_STRENGTH_REGEX, {
    message:
      'Password must contain at least 1 number and 1 special character',
  })
  password: string;
}
