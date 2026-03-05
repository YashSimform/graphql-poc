import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { GqlAuthGuard } from './auth.guard';
import { GqlJwtAuthGuard } from './gql-jwt-auth.guard';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'jwt-secret-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    GqlAuthGuard,
    GqlJwtAuthGuard,
  ],
  exports: [AuthService, GqlAuthGuard, GqlJwtAuthGuard],
})
export class AuthModule {}
