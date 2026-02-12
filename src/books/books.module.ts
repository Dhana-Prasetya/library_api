import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { PrismaService } from '../prisma.service.js';

@Module({
  providers: [PrismaService, BooksService],
  controllers: [BooksController]
})
export class BooksModule { }
