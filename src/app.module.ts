import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './module/user/user.module';
import { PostModule } from './module/post/post.module';
import { CommentModule } from './module/comment/comment.module';
import { formatGraphqlError } from './common/utils/graphql-error.util';
import { GqlLoggingInterceptor } from './common/interceptors/gql-logging.interceptor';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      formatError: formatGraphqlError,
    }),
    UserModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GqlLoggingInterceptor,
    },
  ],
})
export class AppModule {}
