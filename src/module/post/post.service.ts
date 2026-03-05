import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Post } from './post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { CreatePostWithCommentsInput } from './dto/create-post-with-comments.input';
import { PostWhereInput } from './inputs/post-where.input';
import { PostOrderByInput } from './inputs/post-order-by.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { PaginatedPosts } from './types/paginated-post.types';
import { SortOrder } from '../user/inputs/user-order-by.input';

type PrismaWhere = Record<string, unknown>;
type PrismaOrderBy = Record<string, string>;

interface PostDelegate {
  findMany(args?: {
    where?: PrismaWhere;
    orderBy?: PrismaOrderBy | PrismaOrderBy[];
    take?: number;
    skip?: number;
    include?: { author?: boolean };
  }): Promise<Post[]>;
  findUnique(args: {
    where: { id: string };
    include?: { author?: boolean };
  }): Promise<Post | null>;
  create(args: {
    data: { title: string; content: string | null; authorId: string };
  }): Promise<Post>;
  update(args: {
    where: { id: string };
    data: { title?: string; content?: string | null };
  }): Promise<Post>;
  delete(args: { where: { id: string } }): Promise<Post>;
  count(args?: { where?: PrismaWhere }): Promise<number>;
}

interface CommentCreateDelegate {
  create(args: {
    data: { content: string; postId: string; authorId: string };
  }): Promise<{ id: string }>;
}

interface PrismaWithPost {
  post: PostDelegate;
  comment: CommentCreateDelegate;
  $transaction: <T>(fn: (tx: PrismaWithPost) => Promise<T>) => Promise<T>;
}

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get post(): PostDelegate {
    return (this.prisma as unknown as PrismaWithPost).post;
  }

  buildWhere(where?: PostWhereInput | null): PrismaWhere | undefined {
    if (!where) return undefined;
    const clauses: PrismaWhere = {};
    if (where.authorId != null) clauses.authorId = where.authorId;
    if (where.title_contains != null) {
      clauses.title = { contains: where.title_contains, mode: 'insensitive' };
    }
    if (Object.keys(clauses).length === 0) return undefined;
    return clauses;
  }

  buildOrderBy(orderBy?: PostOrderByInput | null): PrismaOrderBy | undefined {
    if (!orderBy) return { createdAt: 'desc' };
    const dir = orderBy.direction === SortOrder.asc ? 'asc' : 'desc';
    return { [orderBy.field]: dir };
  }

  async findManyPaginated(
    pagination: PaginationInput,
    where?: PostWhereInput | null,
    orderBy?: PostOrderByInput | null,
  ): Promise<PaginatedPosts> {
    const take = Math.min(Math.max(pagination.take, 1), 100);
    const skip = Math.max(pagination.skip, 0);
    const [items, totalCount] = await Promise.all([
      this.post.findMany({
        where: this.buildWhere(where),
        orderBy: this.buildOrderBy(orderBy),
        take,
        skip,
        include: { author: true },
      }),
      this.post.count({ where: this.buildWhere(where) }),
    ]);
    const hasNextPage = skip + items.length < totalCount;
    return {
      items: items,
      pageInfo: {
        totalCount,
        hasNextPage,
        pageSize: take,
        skip,
      },
    };
  }

  async findOne(id: string): Promise<Post | null> {
    return this.post.findUnique({
      where: { id },
      include: { author: true },
    });
  }

  async findByAuthorId(authorId: string): Promise<Post[]> {
    return this.post.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: { author: true },
    });
  }

  async count(where?: PostWhereInput | null): Promise<number> {
    return this.post.count({ where: this.buildWhere(where) });
  }

  async create(data: CreatePostInput & { authorId: string }): Promise<Post> {
    try {
      return await this.post.create({
        data: {
          title: data.title,
          content: data.content ?? null,
          authorId: data.authorId,
        },
      });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2003') {
          throw new BadRequestException('Author not found.');
        }
      }
      throw new BadRequestException('Failed to create post.');
    }
  }

  async update(id: string, data: UpdatePostInput): Promise<Post> {
    if (data.title === undefined && data.content === undefined) {
      throw new BadRequestException(
        'At least one of title or content must be provided to update.',
      );
    }
    const updateData: { title?: string; content?: string | null } = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    try {
      return await this.post.update({ where: { id }, data: updateData });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2025') {
          throw new NotFoundException(`Post with id "${id}" not found.`);
        }
      }
      this.logger.error(
        'update() failed',
        err instanceof Error ? err : new Error(String(err)),
      );
      throw new BadRequestException('Failed to update post.');
    }
  }

  async remove(id: string): Promise<Post> {
    try {
      return await this.post.delete({ where: { id } });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2025') {
          throw new NotFoundException(`Post with id "${id}" not found.`);
        }
      }
      this.logger.error(
        'remove() failed',
        err instanceof Error ? err : new Error(String(err)),
      );
      throw new BadRequestException('Failed to delete post.');
    }
  }

  async createPostWithComments(
    input: CreatePostWithCommentsInput,
  ): Promise<Post> {
    const authorId = input.post.authorId;
    if (!authorId) {
      throw new BadRequestException(
        'post.authorId is required for createPostWithComments.',
      );
    }
    const prisma = this.prisma as unknown as PrismaWithPost;
    return prisma.$transaction(async (tx) => {
      const post = await tx.post.create({
        data: {
          title: input.post.title,
          content: input.post.content ?? null,
          authorId,
        },
      });
      if (input.comments?.length) {
        for (const c of input.comments) {
          await tx.comment.create({
            data: {
              content: c.content,
              postId: post.id,
              authorId: c.authorId,
            },
          });
        }
      }
      return post;
    });
  }
}
