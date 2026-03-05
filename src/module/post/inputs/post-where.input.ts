import { InputType, Field } from '@nestjs/graphql';
import { Allow } from '../../../common/validation/validators';

@InputType()
export class PostWhereInput {
  @Allow()
  @Field(() => String, { nullable: true, description: 'Filter by author ID' })
  authorId?: string;

  @Allow()
  @Field(() => String, {
    nullable: true,
    description: 'Title contains (case-insensitive)',
  })
  title_contains?: string;
}
