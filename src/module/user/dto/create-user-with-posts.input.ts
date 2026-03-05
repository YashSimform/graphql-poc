import { InputType, Field } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';
import { NestedCreatePostInput } from './nested-create-post.input';

@InputType()
export class CreateUserWithPostsInput {
  @Field(() => CreateUserInput, { description: 'User data' })
  user: CreateUserInput;

  @Field(() => [NestedCreatePostInput], {
    nullable: true,
    description: 'Optional posts to create with the user (in same transaction)',
  })
  posts?: NestedCreatePostInput[];
}
