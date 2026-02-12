import { Injectable, InternalServerErrorException } from '@nestjs/common';
import response from 'src/helper/response';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async registerUser(fullname: string, email: string, password: string) {
        try {

            const hashedPassword: string = await bcrypt.hash(password, 10);

            const queryResult: object = await this.prisma.users.create({
                data: { fullname, email, role: 'user', password: hashedPassword }
            });

            const data: object = { fullname, email }

            const payload: object = { results: data };

            return response(payload, 200, 'User registered successfully');

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async loginUser(email: string, password: string) {
        try {

            const queryResult = await this.prisma.users.findUnique({
                where: {
                    email: email,
                },
                select: {
                    id: true,
                    email: true,
                    password: true,
                    role: true,
                },
            });

            const validation: boolean = await bcrypt.compare(password, queryResult.password);

            if (!validation) {
                throw new Error('INVALID_CREDENTIALS');
            }

            if (!queryResult) {
                throw new Error('NOT_FOUND');
            }

        } catch (error) {
            console.error(error);
            if (error.message === 'NOT_FOUND') {
                return response(null, 404, 'User not found');
            }
            if (error.message === 'INVALID_CREDENTIALS') {
                return response(null, 401, 'Invalid password or email');
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async borrowedBooksList() {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }


    async borrowBook() {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async returnBook() {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async deleteAccount() {
        try {

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }
}
