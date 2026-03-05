import { InputType, Field } from '@nestjs/graphql';
import { CreatePostInput } from './create-post.input';
import { NestedCreateCommentInput } from './nested-create-comment.input';

@InputType()
export class CreatePostWithCommentsInput {
  @Field(() => CreatePostInput, { description: 'Post data' })
  post: CreatePostInput;

  @Field(() => [NestedCreateCommentInput], {
    nullable: true,
    description:
      'Optional comments to create with the post (in same transaction)',
  })
  comments?: NestedCreateCommentInput[];
}
