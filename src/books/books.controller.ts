import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @Get('all')
    async getBooksPaginated(@Query('page') page: string, @Query('limit') limit: string) {
        const result = await this.booksService.getBooksPaginated(page, limit);
        return this.booksService.getBooksPaginated(page, limit);
    }

    @Get('search')
    searchBooksPaginated(@Query('title') title: string) {
        return this.booksService.searchBooksPaginated(title);
    }

    @Get('details')
    booksDetails(@Param('id') id: string) {
        return this.booksService.booksDetails(id);
    }
}
