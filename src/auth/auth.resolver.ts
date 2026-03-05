import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthPayload } from './auth.types';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { Public } from '../common/decorators/public.decorator';

@Resolver(() => AuthPayload)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload, {
    description: 'Login with email and password, returns JWT access token',
  })
  @Public()
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.authService.login(input.email, input.password);
  }
}
