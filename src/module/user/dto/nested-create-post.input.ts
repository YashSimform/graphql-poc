import { InputType, Field } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class NestedCreatePostInput {
  @Field(() => String, { description: 'Post title' })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;
}
