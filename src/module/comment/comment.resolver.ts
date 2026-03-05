import { Resolver, Mutation, Args } from '@nestjs/graphql';
import {
  BadRequestException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Comment } from './comment.entity';
import { CommentService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { GqlJwtAuthGuard } from '../../auth/gql-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../user/user.entity';

@Resolver(() => Comment)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Mutation(() => Comment, { description: 'Create a new comment' })
  @UseGuards(GqlJwtAuthGuard)
  createComment(
    @Args('data') data: CreateCommentInput,
    @CurrentUser() currentUser?: User | null,
  ) {
    const authorId = data.authorId ?? currentUser?.id;
    if (!authorId) {
      throw new BadRequestException(
        'authorId is required, or you must be logged in.',
      );
    }
    return this.commentService.create({ ...data, authorId });
  }
}
