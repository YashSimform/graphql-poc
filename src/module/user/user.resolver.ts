import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import {
  UseGuards,
  UsePipes,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { User } from './user.entity';
import { Post } from '../post/post.entity';
import { UserService } from './user.service';
import { PostService } from '../post/post.service';
import { CreateUserInput } from './dto/create-user.input';
import { CreateUserWithPostsInput } from './dto/create-user-with-posts.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserWhereInput } from './inputs/user-where.input';
import { UserOrderByInput } from './inputs/user-order-by.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { PaginatedUsers } from './types/paginated-user.types';
import { AggregationCounts } from '../../common/types/aggregation.types';
import { CommentService } from '../comment/comment.service';
import { GqlJwtAuthGuard } from '../../auth/gql-jwt-auth.guard';

@Resolver(() => User)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UserResolver {
  constructor(
    private readonly userService: UserService,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}

  @Query(() => [User], { name: 'users', description: 'List all users' })
  @UseGuards(GqlJwtAuthGuard)
  getUsers() {
    return this.userService.findAll();
  }

  @Query(() => PaginatedUsers, {
    name: 'usersPaginated',
    description: 'List users with filtering, sorting, and pagination',
  })
  @UseGuards(GqlJwtAuthGuard)
  usersPaginated(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
    @Args('where', { nullable: true }) where?: UserWhereInput,
    @Args('orderBy', { nullable: true }) orderBy?: UserOrderByInput,
  ) {
    return this.userService.findManyPaginated(
      pagination ?? { take: 10, skip: 0 },
      where ?? undefined,
      orderBy ?? undefined,
    );
  }

  @Query(() => User, { nullable: true, description: 'Get user by ID' })
  @UseGuards(GqlJwtAuthGuard)
  async getUser(@Args('id', { type: () => ID }) id: string) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found.`);
    }
    return user;
  }

  @Query(() => AggregationCounts, {
    name: 'aggregationCounts',
    description: 'Aggregated counts for users, posts, and comments',
  })
  @UseGuards(GqlJwtAuthGuard)
  async aggregationCounts(): Promise<AggregationCounts> {
    const [userCount, postCount, commentCount] = await Promise.all([
      this.userService.count(undefined),
      this.postService.count(undefined),
      this.commentService.count(),
    ]);
    return { userCount, postCount, commentCount };
  }

  @ResolveField(() => [Post], { name: 'posts' })
  posts(@Parent() user: User) {
    return this.postService.findByAuthorId(user.id);
  }

  @Mutation(() => User, { description: 'Create a new user' })
  // @UseGuards(GqlJwtAuthGuard)
  createUser(@Args('data') data: CreateUserInput) {
    return this.userService.create(data);
  }

  @Mutation(() => User, {
    description:
      'Create a user and optionally nested posts in a single transaction',
  })
  @UseGuards(GqlJwtAuthGuard)
  createUserWithPosts(@Args('input') input: CreateUserWithPostsInput) {
    return this.userService.createUserWithPosts(input);
  }

  @Mutation(() => User, { description: 'Update user by ID' })
  @UseGuards(GqlJwtAuthGuard)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateUserInput,
  ) {
    return this.userService.update(id, data);
  }

  @Mutation(() => User, { description: 'Delete user by ID' })
  @UseGuards(GqlJwtAuthGuard)
  deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.remove(id);
  }
}
