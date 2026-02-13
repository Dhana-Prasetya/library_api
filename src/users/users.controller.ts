import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRegisterDataDto } from './dto/userRegisterData.dto';
import { UserLoginDataDto } from '../general_dto/userLoginData.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SerialIdDto } from 'src/general_dto/serial_id.dto';
import { passwordDto } from 'src/general_dto/password.dto';
import { PaginationDto } from 'src/general_dto/pagination.dto';

@Controller('user')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('register')
    async registerUser(@Body() body: UserRegisterDataDto) {
        const result = await this.usersService.registerUser(body.fullname, body.email, body.password);
        return result;

    }

    @Post('login')
    async loginUser(@Body() body: UserLoginDataDto) {
        const result = await this.usersService.loginUser(body.email, body.password);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    async logout() {

    }

    @UseGuards(JwtAuthGuard)
    @Get('borrowed-books-list')
    async borrowedBooksList(@Req() req, @Query() query: PaginationDto) {
        const userId = req.user.id;
        const result = await this.usersService.borrowedBooksList(userId, query.page, query.limit);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Post('borrow-book/:id')
    async borrowBook(@Req() req, @Param() param: SerialIdDto) {
        const userId = req.user.id;
        const result = await this.usersService.borrowBook(userId, param.id);
        return result;
    }

    @UseGuards(JwtAuthGuard)
    @Patch('return-book/:id')
    async returnBook(@Req() req, @Param() param: SerialIdDto) {
        const userId = req.user.id;
        const result = await this.usersService.returnBook(userId, param.id);
        return result;

    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete-account')
    async deleteAccount(@Req() req, @Body() body: passwordDto) {
        const userId = req.user.id;
        const result = await this.usersService.deleteAccount(userId, body.password);
        return result;
    }
}
