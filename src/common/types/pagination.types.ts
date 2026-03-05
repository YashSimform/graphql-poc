import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class PageInfo {
  @Field(() => Int, { description: 'Total number of items' })
  totalCount: number;

  @Field(() => Boolean, { description: 'Whether there are more items' })
  hasNextPage: boolean;

  @Field(() => Int, { description: 'Current page size (take)' })
  pageSize: number;

  @Field(() => Int, { description: 'Number of items skipped' })
  skip: number;
}
