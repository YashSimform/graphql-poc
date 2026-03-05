import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { CommentService } from './comment.service';
import { CommentResolver } from './comment.resolver';

@Module({
  imports: [AuthModule],
  providers: [CommentService, CommentResolver],
  exports: [CommentService],
})
export class CommentModule {}
