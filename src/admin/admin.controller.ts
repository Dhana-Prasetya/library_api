import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UserLoginDataDto } from 'src/general_dto/userLoginData.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Post('login')
    async loginUser(@Body() body: UserLoginDataDto) {
        // const result = await this.adminService.loginUser(body.email, body.password);
        // return result;
    }

    @Get('borrowed-books-list')
    async borrowedBooksList() { }

    @Post('add-book')
    async addBook() { }

    @Patch('update-book/:id')
    async updateBook() { }

    @Delete('delete-book/:id')
    async deleteBook() { }

}
