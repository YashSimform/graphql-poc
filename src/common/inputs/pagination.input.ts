import { InputType, Field, Int } from '@nestjs/graphql';
import { Allow } from '../validation/validators';

@InputType()
export class PaginationInput {
  @Allow()
  @Field(() => Int, { defaultValue: 10, description: 'Max items to return' })
  take: number = 10;

  @Allow()
  @Field(() => Int, { defaultValue: 0, description: 'Number of items to skip' })
  skip: number = 0;
}
