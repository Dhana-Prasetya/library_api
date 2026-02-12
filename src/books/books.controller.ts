import { Controller, Get, Param, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { PaginationDto } from 'src/general_dto/pagination.dto';
import { SearchBooksDto } from './dto/search.dto';
import { SerialIdDto } from 'src/general_dto/serial_id.dto';

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
    async searchBooksPaginated(@Query() query: SearchBooksDto) {
        const result = await this.booksService.searchBooksPaginated(query.title, query.page, query.limit);
        return result;
    }

    @Get('details/:id')
    @UsePipes(new ValidationPipe({ transform: true }))
    async booksDetails(@Param() param: SerialIdDto) {
        const result = await this.booksService.booksDetails(param.id);
        return result;
    }
}
