import { ObjectType, Field } from '@nestjs/graphql';
import { User } from '../module/user/user.entity';

@ObjectType()
export class AuthPayload {
  @Field(() => String, { description: 'JWT access token' })
  accessToken: string;

  @Field(() => User, { description: 'Authenticated user' })
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
