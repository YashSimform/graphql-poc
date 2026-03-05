import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class CreateCommentInput {
  @Field(() => String, { description: 'Comment content' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(2000, { message: 'Content must not exceed 2000 characters' })
  content: string;

  @Field(() => String, { description: 'Post ID' })
  @IsUUID('4', { message: 'Post ID must be a valid UUID' })
  postId: string;

  @Field(() => String, {
    nullable: true,
    description:
      'Author user ID; if omitted, uses the current logged-in user from JWT',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  authorId?: string;
}
