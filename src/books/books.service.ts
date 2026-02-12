import { Injectable, InternalServerErrorException } from '@nestjs/common';
import pagination from 'src/helper/pagination';

import { PrismaService } from '../prisma.service.js';

import response from 'src/helper/response';


@Injectable()
export class BooksService {
    constructor(private readonly prisma: PrismaService) { }

    async getBooksPaginated(page: number, limit: number) { // default pagination values

        try {

            const { skip, total, totalPages } = await pagination(this.prisma, { page, limit, table: 'books' });

            const queryResult: object = await this.prisma.books.findMany({
                skip,
                take: limit,
                orderBy: { id: "asc" },
            });

            const payload: object = { page, limit, total, totalPages, results: queryResult };

            return response(payload, 200, 'Paginated books fetched successfully');
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }

    }

    async searchBooksPaginated(title: string) {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async booksDetails(id: string) {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }
}
