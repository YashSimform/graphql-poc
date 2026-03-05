import { InputType, Field } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { Allow } from '../../../common/validation/validators';
import { SortOrder } from '../../user/inputs/user-order-by.input';

export enum PostOrderByField {
  title = 'title',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

registerEnumType(PostOrderByField, { name: 'PostOrderByField' });

@InputType()
export class PostOrderByInput {
  @Allow()
  @Field(() => PostOrderByField, { defaultValue: PostOrderByField.createdAt })
  field: PostOrderByField = PostOrderByField.createdAt;

  @Allow()
  @Field(() => SortOrder, { defaultValue: SortOrder.desc })
  direction: SortOrder = SortOrder.desc;
}
