import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class NestedCreateCommentInput {
  @Field(() => String, { description: 'Comment content' })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(2000, { message: 'Content must not exceed 2000 characters' })
  content: string;

  @Field(() => String, { description: 'Author user ID' })
  @IsUUID('4', { message: 'Author ID must be a valid UUID' })
  authorId: string;
}
