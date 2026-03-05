import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  MaxLength,
} from '../../../common/validation/validators';

@InputType()
export class UpdatePostInput {
  @Field(() => String, { nullable: true, description: 'Post title' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Title must not exceed 200 characters' })
  title?: string;

  @Field(() => String, { nullable: true, description: 'Post content' })
  @IsOptional()
  @IsString()
  content?: string;
}
