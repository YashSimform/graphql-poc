import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class CreatePostInput {
  @Field(() => String, { description: 'Post title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Author user ID; if omitted, uses the current logged-in user from JWT',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  authorId?: string;
}
