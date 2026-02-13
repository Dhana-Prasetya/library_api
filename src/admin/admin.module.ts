import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RedisService } from 'src/helper/redis.config';


@Module({
    imports: [AuthModule],
    controllers: [AdminController],
    providers: [AdminService, PrismaService, RedisService]
})
export class AdminModule {

}
