import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { nullable: true, description: 'User full name' })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name must be at least 1 character' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Unique email address' })
  @IsOptional()
  @IsEmail({ message: 'Must be a valid email address' })
  email?: string;
}
