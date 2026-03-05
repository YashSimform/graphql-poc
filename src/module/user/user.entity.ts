import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from '../post/post.entity';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => [Post], {
    nullable: true,
    description: 'Posts by this user (use field resolver)',
  })
  posts?: Post[];
}
