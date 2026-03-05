import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { UserModule } from '../user/user.module';
import { CommentModule } from '../comment/comment.module';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';

@Module({
  imports: [
    AuthModule,
    forwardRef(() => UserModule),
    forwardRef(() => CommentModule),
  ],
  providers: [PostService, PostResolver],
  exports: [PostService],
})
export class PostModule {}
