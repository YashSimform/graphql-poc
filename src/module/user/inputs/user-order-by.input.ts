import { InputType, Field } from '@nestjs/graphql';
import { registerEnumType } from '@nestjs/graphql';
import { Allow } from '../../../common/validation/validators';

export enum UserOrderByField {
  name = 'name',
  email = 'email',
  createdAt = 'createdAt',
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

registerEnumType(UserOrderByField, { name: 'UserOrderByField' });
registerEnumType(SortOrder, { name: 'SortOrder' });

@InputType()
export class UserOrderByInput {
  @Allow()
  @Field(() => UserOrderByField, { defaultValue: UserOrderByField.createdAt })
  field: UserOrderByField = UserOrderByField.createdAt;

  @Allow()
  @Field(() => SortOrder, { defaultValue: SortOrder.desc })
  direction: SortOrder = SortOrder.desc;
}
