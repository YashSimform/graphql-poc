import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Comment } from './comment.entity';
import { CreateCommentInput } from './dto/create-comment.input';

interface CommentDelegate {
  create(args: {
    data: { content: string; postId: string; authorId?: string };
  }): Promise<Comment>;
  findMany(args: {
    where: { postId: string };
    orderBy?: { createdAt: string };
  }): Promise<Comment[]>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
}

interface PrismaWithComment {
  comment: CommentDelegate;
}

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get comment(): CommentDelegate {
    return (this.prisma as unknown as PrismaWithComment).comment;
  }

  async create(data: CreateCommentInput): Promise<Comment> {
    try {
      this.logger.log(`createComment called with: ${JSON.stringify(data)}`);
      return await this.comment.create({
        data: {
          content: data.content,
          postId: data.postId,
          authorId: data.authorId,
        },
      });
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        const e = err as { code: string };
        if (e.code === 'P2003') {
          throw new BadRequestException('Post or author not found.');
        }
      }
      throw new BadRequestException('Failed to create comment.');
    }
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async count(): Promise<number> {
    return this.comment.count({});
  }
}
