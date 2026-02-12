import { Body, Controller, Delete, Get, Patch, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDataDto } from './dto/userRegisterData.dto';
import { UserLoginDataDto } from './dto/userLoginData.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('user/register')
    @UsePipes(new ValidationPipe({ transform: true }))
    async registerUser(@Body() body: UserRegisterDataDto) {
        const result = await this.usersService.registerUser(body.fullname, body.email, body.password);
        return result;

    }

    @Post('user/login')
    @UsePipes(new ValidationPipe({ transform: true }))
    async loginUser(@Body() body: UserLoginDataDto) {
        const result = await this.usersService.loginUser(body.email, body.password);
        return result;
    }

    @Get('user/borrowed-books-list')
    async borrowedBooksList() {

    }

    @Post('user/borrow-book/:id')
    async borrowBook() {

    }

    @Patch('user/return-book/:id')
    async returnBook() {

    }

    @Delete('user/delete-account')
    async deleteAccount() {

    }
}
