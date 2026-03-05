import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Post {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => ID)
  authorId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
