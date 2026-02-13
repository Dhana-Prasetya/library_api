import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module';
import { RedisService } from 'src/helper/redis.config';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, RedisService]
})
export class UsersModule { }
