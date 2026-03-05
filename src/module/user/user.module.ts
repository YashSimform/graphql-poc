import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PostModule } from '../post/post.module';
import { CommentModule } from '../comment/comment.module';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => PostModule),
    forwardRef(() => CommentModule),
  ],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
