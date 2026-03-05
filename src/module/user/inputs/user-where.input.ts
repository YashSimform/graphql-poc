import { InputType, Field } from '@nestjs/graphql';
import { Allow } from '../../../common/validation/validators';

@InputType()
export class UserWhereInput {
  @Allow()
  @Field(() => String, {
    nullable: true,
    description: 'Email contains (case-insensitive)',
  })
  email_contains?: string;

  @Allow()
  @Field(() => String, {
    nullable: true,
    description: 'Name contains (case-insensitive)',
  })
  name_contains?: string;

  @Allow()
  @Field(() => String, { nullable: true, description: 'Exact email match' })
  email_equals?: string;
}
