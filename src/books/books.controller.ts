import { Body, Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { PaginationDto } from 'src/general_dto/pagination.dto';

@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @Get('all')
    @UsePipes(new ValidationPipe({ transform: true })) // to auto-transform query params to desired types
    async getBooksPaginated(@Query() query: PaginationDto) {
        const result = await this.booksService.getBooksPaginated(query.page, query.limit);
        return result;
    }

    @Get('search')
    @UsePipes(new ValidationPipe({ transform: true }))
    async searchBooksPaginated(@Query('title') title: string, @Query() query: PaginationDto) {
        const result = await this.booksService.searchBooksPaginated(title);
        return result;
    }

    @Get('details/:id')
    async booksDetails(@Param('id') id: string) {
        const result = await this.booksService.booksDetails(id);
        return result;
    }
}
