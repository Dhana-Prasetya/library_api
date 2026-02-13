import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserLoginDataDto } from 'src/general_dto/userLoginData.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminGuard } from 'src/auth/admin.guard';
import { PaginationDto } from 'src/general_dto/pagination.dto';
import { addBookDto } from './dto/addBook.dto';
import { EditBookDataDto } from './dto/editBookData.dto';
import { SerialIdDto } from 'src/general_dto/serial_id.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('login')
    async loginUser(@Body() body: UserLoginDataDto) {
        const result = await this.adminService.loginAdmin(body.email, body.password);
        return result;
    }

    @SetMetadata('roles', ['admin']) // tells the 'AdminGuard' what to look for
    @UseGuards(JwtAuthGuard)
    @Patch('logout')
    async logout(@Req() req) {
        const result = await this.adminService.logout(req.user?.jti, req.user?.exp);
        return result;
    }

    @SetMetadata('roles', ['admin'])
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Get('borrowed-books-list')
    async borrowedBooksList(@Query() query: PaginationDto) {
        const result = await this.adminService.borrowedBookList(query.page, query.limit);
        return result;
    }

    @SetMetadata('roles', ['admin'])
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Post('add-book')
    async addBook(@Body() body: addBookDto) {
        const result = await this.adminService.addBook(body.title, body.author, body.genre, body.description, body.quantity, body.borrowable);
        return result;
    }

    @SetMetadata('roles', ['admin'])
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Patch('update-book/:id')
    async updateBook(@Param() param: SerialIdDto, @Body() body: EditBookDataDto) {
        const result = await this.adminService.updateBook(param.id, body.title, body.author, body.genre, body.description, body.quantity, body.borrowable);
        return result;
    }

    @SetMetadata('roles', ['admin'])
    @UseGuards(JwtAuthGuard, AdminGuard)
    @Delete('delete-book/:id')
    async deleteBook(@Param() param: SerialIdDto) {
        const result = await this.adminService.deleteBook(param.id);
        return result;
    }

}
