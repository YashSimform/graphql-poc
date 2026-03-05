import { ObjectType, Field } from '@nestjs/graphql';
import { Post } from '../post.entity';
import { PageInfo } from '../../../common/types/pagination.types';

@ObjectType()
export class PaginatedPosts {
  @Field(() => [Post])
  items: Post[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
