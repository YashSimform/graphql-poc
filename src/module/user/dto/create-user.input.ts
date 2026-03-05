import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from '../../../common/validation/validators';

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
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Password for login (min 6 characters); required for login flow',
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;
}
