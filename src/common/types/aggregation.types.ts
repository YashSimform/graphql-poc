import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class AggregationCounts {
  @Field(() => Int, { description: 'Total number of users' })
  userCount: number;

  @Field(() => Int, { description: 'Total number of posts' })
  postCount: number;

  @Field(() => Int, { description: 'Total number of comments' })
  commentCount: number;
}
