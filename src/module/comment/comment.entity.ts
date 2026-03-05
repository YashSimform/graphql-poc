import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => ID)
  postId: string;

  @Field(() => ID)
  authorId: string;

  @Field(() => Date)
  createdAt: Date;
}
