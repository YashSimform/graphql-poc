import { CreateUserInput } from './dto/create-user.input';
import { CreateUserWithPostsInput } from './dto/create-user-with-posts.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserWhereInput } from './inputs/user-where.input';
import { UserOrderByInput } from './inputs/user-order-by.input';
import { PaginationInput } from '../../common/inputs/pagination.input';
import { PaginatedUsers } from './types/paginated-user.types';
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from './user.entity';
import { SortOrder } from './inputs/user-order-by.input';

interface CreateData {
  name: string;
  email: string;
  password?: string;
}

type PrismaWhere = Record<string, unknown>;
type PrismaOrderBy = Record<string, string>;

interface UserDelegate {
  create(args: { data: CreateData }): Promise<User>;
  findMany(args?: {
    where?: PrismaWhere;
    orderBy?: PrismaOrderBy | PrismaOrderBy[];
    take?: number;
    skip?: number;
  }): Promise<User[]>;
  findUnique(args: { where: { id: string } }): Promise<User | null>;
  update(args: { where: { id: string }; data: UpdateUserInput }): Promise<User>;
  delete(args: { where: { id: string } }): Promise<User>;
  count(args?: { where?: PrismaWhere }): Promise<number>;
}

interface PostCreateDelegate {
  create(args: {
    data: { title: string; content: string | null; authorId: string };
  }): Promise<{ id: string }>;
}

interface PrismaWithUser {
  user: UserDelegate;
  post: PostCreateDelegate;
  $transaction: <T>(fn: (tx: PrismaWithUser) => Promise<T>) => Promise<T>;
}

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private get user(): UserDelegate {
    return (this.prisma as unknown as PrismaWithUser).user;
  }

  async create(data: CreateUserInput): Promise<User> {
    const createData: CreateData = { name: data.name, email: data.email };
    if (data.password) {
      createData.password = await bcrypt.hash(data.password, 10);
    }
    try {
      return await this.user.create({ data: createData });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string; meta?: { target?: string[] } };
        if (e.code === 'P2002') {
          const field = e.meta?.target?.[0] ?? 'field';
          throw new ConflictException(
            `User with this ${field} already exists.`,
          );
        }
      }
      throw new BadRequestException('Failed to create user.');
    }
  }

  async findAll(): Promise<User[]> {
    return this.user.findMany();
  }

  buildWhere(where?: UserWhereInput | null): PrismaWhere | undefined {
    if (!where) return undefined;
    const clauses: PrismaWhere = {};
    if (where.email_contains != null) {
      clauses.email = { contains: where.email_contains, mode: 'insensitive' };
    }
    if (where.name_contains != null) {
      clauses.name = { contains: where.name_contains, mode: 'insensitive' };
    }
    if (where.email_equals != null) {
      clauses.email = where.email_equals;
    }
    if (Object.keys(clauses).length === 0) return undefined;
    return clauses;
  }

  buildOrderBy(orderBy?: UserOrderByInput | null): PrismaOrderBy | undefined {
    if (!orderBy) return { createdAt: 'desc' };
    const dir = orderBy.direction === SortOrder.asc ? 'asc' : 'desc';
    return { [orderBy.field]: dir };
  }

  async findManyPaginated(
    pagination: PaginationInput,
    where?: UserWhereInput | null,
    orderBy?: UserOrderByInput | null,
  ): Promise<PaginatedUsers> {
    const take = Math.min(Math.max(pagination.take, 1), 100);
    const skip = Math.max(pagination.skip, 0);
    const [items, totalCount] = await Promise.all([
      this.user.findMany({
        where: this.buildWhere(where),
        orderBy: this.buildOrderBy(orderBy),
        take,
        skip,
      }),
      this.user.count({ where: this.buildWhere(where) }),
    ]);
    const hasNextPage = skip + items.length < totalCount;
    return {
      items,
      pageInfo: {
        totalCount,
        hasNextPage,
        pageSize: take,
        skip,
      },
    };
  }

  async count(where?: UserWhereInput | null): Promise<number> {
    return this.user.count({ where: this.buildWhere(where) });
  }

  async createUserWithPosts(input: CreateUserWithPostsInput): Promise<User> {
    const prisma = this.prisma as unknown as PrismaWithUser;
    return prisma.$transaction(async (tx) => {
      const createData: CreateData = {
        name: input.user.name,
        email: input.user.email,
      };
      if (input.user.password) {
        createData.password = await bcrypt.hash(input.user.password, 10);
      }
      const user = await tx.user.create({ data: createData });
      if (input.posts?.length) {
        for (const p of input.posts) {
          await tx.post.create({
            data: {
              title: p.title,
              content: p.content ?? null,
              authorId: user.id,
            },
          });
        }
      }
      return user;
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.user.findUnique({ where: { id } });
    return user;
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    if (data.name === undefined && data.email === undefined) {
      throw new BadRequestException(
        'At least one of name or email must be provided to update.',
      );
    }
    try {
      return await this.user.update({ where: { id }, data });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2025') {
          throw new NotFoundException(`User with id "${id}" not found.`);
        }
        if (e.code === 'P2002') {
          throw new ConflictException('A user with this email already exists.');
        }
      }
      throw new BadRequestException('Failed to update user.');
    }
  }

  async remove(id: string): Promise<User> {
    try {
      return await this.user.delete({ where: { id } });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2025') {
          throw new NotFoundException(`User with id "${id}" not found.`);
        }
      }
      throw new BadRequestException('Failed to delete user.');
    }
  }
}
