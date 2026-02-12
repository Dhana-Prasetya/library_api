import { Injectable } from '@nestjs/common';
import pagination from 'src/helper/pagination';

import { PrismaService } from '../prisma.service.js';
const prisma = new PrismaService();

import response from 'src/helper/response';

interface PaginationResult {
    skip: number;
    total: number;
    totalPages: number;
}

@Injectable()
export class BooksService {

    async getBooksPaginated(page: string, limit: string) {

        const pageInt: number = Number(page);
        const limitInt: number = Number(limit);

        const { skip, total, totalPages } = await pagination({ pageInt, limitInt, table: 'books' });

        const payload: object = await prisma.books.findMany({
            skip,
            take: limitInt,
            orderBy: { id: "asc" },
        });

        return response(payload, 200, 'Paginated books fetched successfully');

    }

    searchBooksPaginated(title: string) {

    }

    booksDetails(id: string) {

    }
}
