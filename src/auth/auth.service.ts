import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../module/user/user.entity';
import type { JwtPayload } from './auth.types';

interface UserWithPassword extends User {
  password?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const raw = await (
      this.prisma as unknown as {
        user: {
          findUnique: (args: unknown) => Promise<UserWithPassword | null>;
        };
      }
    ).user.findUnique({
      where: { email },
    });
    if (!raw || !raw.password) {
      return null;
    }
    const ok = await bcrypt.compare(password, raw.password);
    if (!ok) return null;
    const { password: _password, ...user } = raw;
    void _password;
    return user as User;
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user };
  }

  async findById(id: string): Promise<User | null> {
    const raw = await (
      this.prisma as unknown as {
        user: {
          findUnique: (args: unknown) => Promise<UserWithPassword | null>;
        };
      }
    ).user.findUnique({
      where: { id },
    });
    if (!raw) return null;
    const { password: _password, ...user } = raw;
    void _password;
    return user as User;
  }
}
