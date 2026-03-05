import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../user.entity';
import { PageInfo } from '../../../common/types/pagination.types';

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  items: User[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;
}
