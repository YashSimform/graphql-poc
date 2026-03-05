import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Post } from './post.entity';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';
import { CommentService } from '../comment/comment.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { CreatePostWithCommentsInput } from './dto/create-post-with-comments.input';
import { PostWhereInput } from './inputs/post-where.input';
import { PostOrderByInput } from './inputs/post-order-by.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { PaginatedPosts } from './types/paginated-post.types';
import { GqlJwtAuthGuard } from '../../auth/gql-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Resolver(() => Post)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
  ) {}

  @Query(() => PaginatedPosts, {
    name: 'postsPaginated',
    description: 'List posts with filtering, sorting, and pagination',
  })
  @UseGuards(GqlJwtAuthGuard)
  postsPaginated(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('where', { nullable: true }) where?: PostWhereInput,
    @Args('orderBy', { nullable: true }) orderBy?: PostOrderByInput,
  ) {
    return this.postService.findManyPaginated(
      pagination ?? { take: 10, skip: 0 },
      where ?? undefined,
      orderBy ?? undefined,
    );
  }

  @Query(() => Post, { nullable: true, description: 'Get post by ID' })
  @UseGuards(GqlJwtAuthGuard)
  async post(@Args('id', { type: () => ID }) id: string) {
    const post = await this.postService.findOne(id);
    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found.`);
    }
    return post;
  }

  @ResolveField(() => User, { nullable: true, name: 'author' })
  author(@Parent() post: Post) {
    return this.userService.findOne(post.authorId);
  }

  @ResolveField(() => [Comment], { name: 'comments' })
  comments(@Parent() post: Post) {
    return this.commentService.findByPostId(post.id);
  }

  @Mutation(() => Post, { description: 'Create a new post' })
  @UseGuards(GqlJwtAuthGuard)
  createPost(
    @Args('data') data: CreatePostInput,
    @CurrentUser() currentUser?: User | null,
  ) {
    const authorId = data.authorId ?? currentUser?.id;
    if (!authorId) {
      throw new BadRequestException(
        'authorId is required, or you must be logged in.',
      );
    }
    return this.postService.create({ ...data, authorId });
  }

  @Mutation(() => Post, {
    name: 'updatePost',
    description: 'Update a post by ID',
  })
  @UseGuards(GqlJwtAuthGuard)
  updatePost(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdatePostInput,
  ) {
    return this.postService.update(id, data);
  }

  @Mutation(() => Post, {
    name: 'deletePost',
    description: 'Delete a post by ID (cascades to comments)',
  })
  @UseGuards(GqlJwtAuthGuard)
  deletePost(@Args('id', { type: () => ID }) id: string) {
    return this.postService.remove(id);
  }

  @Mutation(() => Post, {
    description: 'Create a post and optional comments in a single transaction',
  })
  @UseGuards(GqlJwtAuthGuard)
  createPostWithComments(@Args('input') input: CreatePostWithCommentsInput) {
    return this.postService.createPostWithComments(input);
  }
}
