import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import response from 'src/helper/response';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pagination from 'src/helper/pagination';
import { genre_enum } from 'generated/prisma/enums';
import { RedisService } from 'src/helper/redis.config';

@Injectable()
export class AdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,

    ) { }

    async loginAdmin(email: string, password: string) {
        try {
            const queryResult = await this.prisma.users.findUnique({
                where: {
                    email: email,
                },
                select: {
                    id: true,
                    fullname: true,
                    email: true,
                    password: true,
                    role: true,
                },
            });

            if (!queryResult) {
                throw new Error('NOT_FOUND');
            }

            const validation: boolean = await bcrypt.compare(password, queryResult.password);

            if (!validation) {
                throw new Error('INVALID_CREDENTIALS');
            }

            delete queryResult.password;

            const generateJti: string = uuidv4(); // Unique identifier for the token

            const jwtSecret =
                this.configService.get<string>('JWT_SECRET')

            const token: string = this.jwtService.sign(
                {
                    id: queryResult.id,
                    username: queryResult.fullname,
                    role: queryResult.role,
                    jti: generateJti,
                },
                { secret: jwtSecret },
            );

            const payload: object = { results: queryResult, accessToken: token }
            return response(payload, 200, 'User logged in successfully');


        } catch (error) {
            console.error(error);
            if (error.message === 'NOT_FOUND') {
                throw new NotFoundException(response(null, 404, 'User not found'));
            }
            if (error.message === 'INVALID_CREDENTIALS') {
                throw new UnauthorizedException(response(null, 401, 'Invalid password or email'))
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async logout(jti: string, exp?: number) {
        if (!jti) {
            throw new UnauthorizedException(response(null, 401, 'Missing token identifier'));
        }

        try {
            let ttlSeconds = 3600;
            if (typeof exp === 'number') {
                const nowSeconds = Math.floor(Date.now() / 1000);
                ttlSeconds = Math.max(exp - nowSeconds, 1);
            }

            await this.redisService.addToBlacklist(jti, ttlSeconds);
            return response(null, 200, 'Admin logged out successfully');
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async borrowedBookList(page: number, limit: number) {
        try {

            const { skip, total, totalPages } = await pagination(this.prisma, { page, limit, table: 'books_borrowment' });

            const queryResult: object = await this.prisma.books_borrowment.findMany({
                skip,
                take: limit,
                orderBy: { id: "desc" }, // latest borrowment first
            });

            const payload: object = { page, limit, total, totalPages, results: queryResult };

            return response(payload, 200, 'Borrowed books list fetched successfully');

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async addBook(title: string, author: string, genre: string, description: string, quantity: number, borrowable: string) {
        try {

            let borrowableValue: boolean = true // default value
            if (borrowable === 'false') {
                borrowableValue = false
            }

            const queryResult = await this.prisma.books.create({
                data: {
                    title: title,
                    author: author,
                    genre: genre as genre_enum, // Tell TS that genre is of type genre_enum
                    description: description,
                    quantity: quantity,
                    borrowable: borrowableValue
                },
            })

            const payload: object = { results: queryResult };

            return response(payload, 201, 'Book added successfully');

        } catch (error) {
            console.error(error);
            if (error.code === 'P2002') {
                throw new ConflictException(response(null, 409, 'A book with this title already exists'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async updateBook(id: number, title?: string, author?: string, genre?: string, description?: string, quantity?: number, borrowable?: string) { // optional body fields
        try {

            let borrowableValue: boolean = null // default value
            if (borrowable) {
                if (borrowable === 'true') {
                    borrowableValue = true
                } else if (borrowable === 'false') {
                    borrowableValue = false
                }
            }

            // Prepare the data object with only the fields that are provided
            const updatedData = Object.fromEntries(
                Object.entries({ title, author, genre, description, quantity, borrowable: borrowableValue }).filter(([_, value]) => value !== null && value !== undefined)
            );

            const prismaTransaction = await this.prisma.$transaction(async (tx) => {
                // Check if book exists first
                const existingBook = await tx.books.findUnique({
                    where: { id: id },
                });

                if (!existingBook) {
                    throw new Error('BOOK_NOT_FOUND');
                }

                const queryResult = await tx.books.update({
                    where: { id: id },
                    data: updatedData
                })
                return queryResult;
            }, {
                // isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable, // reference error
                timeout: 7000,
            })

            const payload: object = { results: prismaTransaction };
            return response(payload, 200, 'Book updated successfully');

        } catch (error) {
            console.error(error);
            if (error.message === 'BOOK_NOT_FOUND') {
                throw new NotFoundException(response(null, 404, 'Book not found'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async deleteBook(id: number) {
        try {

            const prismaTransaction = await this.prisma.$transaction(async (tx) => {

                const borrowedBook = await tx.books_borrowment.findFirst({
                    where: { book_id: id, returned_status: false },
                })

                if (borrowedBook) {
                    throw new Error('BOOK_BORROWED');
                }

                const deletedBook = await tx.books.delete({
                    where: { id: id },
                })

                return deletedBook;

            }, {
                // isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable, // reference error
                timeout: 7000,
            })

            const payload: object = { results: prismaTransaction };
            return response(payload, 200, 'Book deleted successfully');

        } catch (error) {
            console.error(error);
            if (error.message === 'BOOK_BORROWED') {
                throw new ConflictException(response(null, 409, 'Cannot delete book that is currently borrowed'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }
}
