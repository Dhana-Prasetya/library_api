import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import response from 'src/helper/response';
import { PrismaService } from '../prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import pagination from 'src/helper/pagination';
import { RedisService } from 'src/helper/redis.config';
// import { PrismaClient } from 'generated/prisma/client.js';

@Injectable()
export class UsersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) { }

    async registerUser(fullname: string, email: string, password: string) {
        try {

            const hashedPassword: string = await bcrypt.hash(password, 10);

            const queryResult = await this.prisma.users.create({
                data: { fullname, email, role: 'user', password: hashedPassword }
            });

            delete queryResult.password;
            delete queryResult.role;

            const payload: object = { results: queryResult };

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
            return response(null, 200, 'User logged out successfully');
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async borrowedBooksList(userId: string, page: number, limit: number) {
        try {

            const { skip, total, totalPages } = await pagination(this.prisma, { page, limit, table: 'books_borrowment' });


            const queryResult = await this.prisma.books_borrowment.findMany({
                where: {
                    user_id: userId,
                },
                select: {
                    id: true,
                    borrowment_date: true,
                    returned_status: true,
                    books: {
                        select: {
                            id: true,
                            title: true,
                            description: true,
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { id: "desc" },
            })

            const payload: object = { page, limit, total, totalPages, results: queryResult };
            return response(payload, 200, 'Borrowed books retrieved successfully');
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }


    async borrowBook(userId: string, id: number) {
        try {

            const prismaTransaction = await this.prisma.$transaction(async (tx) => {

                const activeBorrowments = await tx.books_borrowment.findMany({
                    where: {
                        user_id: userId,
                        returned_status: false,
                    },
                    select: { book_id: true }
                });

                if (activeBorrowments.length >= 3) {
                    throw new Error('BORROWMENT_LIMIT_REACHED');
                }

                const isAlreadyBorrowed = activeBorrowments.some(b => b.book_id === id);
                if (isAlreadyBorrowed) {
                    throw new Error('ALREADY_BORROWED');
                }

                const deductBookStock = await tx.books.update({
                    where: { id: id, borrowable: true },
                    data: {
                        quantity: {
                            decrement: 1
                        }
                    }
                })

                if (!deductBookStock) {
                    throw new Error('BOOK_NOT_BORROWABLE');
                }

                const queryResult = await tx.books_borrowment.create({
                    data: {
                        book_id: id,
                        user_id: userId,
                    }, select: {
                        books: {
                            select: {
                                title: true,
                                author: true,
                                genre: true,
                            }
                        }

                    }
                });

                return queryResult;

            }, {
                // isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable, // reference error
                timeout: 7000,
            }
            );

            const payload: object = { results: prismaTransaction };

            return response(payload, 200, 'Book borrowed successfully');


        } catch (error) {
            console.error(error);
            if (error.message === 'ALREADY_BORROWED') {
                throw new ConflictException(response(null, 409, 'You have already borrowed this book'));
            }
            if (error.message === 'BORROWMENT_LIMIT_REACHED') {
                throw new ForbiddenException(response(null, 403, 'You have reached the borrowment limit of 3 books'));
            }
            if (error.message === 'BOOK_NOT_BORROWABLE') {
                throw new ConflictException(response(null, 409, 'This book is not borrowable'));
            }
            if (error.code === 'P2003') {
                throw new NotFoundException(response(null, 404, 'Book not found'));
            }
            if (error.message.includes('23514')) { // check constraint violation
                throw new ConflictException(response(null, 409, 'No more stock available for this book'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async returnBook(userId: string, id: number) {
        try {

            const isBorrowed = await this.prisma.books_borrowment.findFirst({
                where: {
                    user_id: userId,
                    book_id: id,
                    returned_status: false,
                }, select: { id: true }
            })

            if (!isBorrowed) {
                throw new Error('NOT_BORROWED');
            }

            const prismaTransaction = await this.prisma.$transaction(async (tx) => {

                const queryResult = await tx.books.update({
                    where: { id: id },
                    data: {
                        // Update book stock
                        quantity: {
                            increment: 1
                        },
                        // Update borrowment record
                        books_borrowment: {
                            update: {
                                where: {
                                    id: isBorrowed.id,
                                    book_id: id,
                                    user_id: userId,
                                },
                                data: {
                                    returned_status: true
                                }
                            }
                        }
                    }
                })

                if (!queryResult) {
                    throw new Error('BOOK_NOT_EXIST');
                }

                return queryResult;

            }, {
                // isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable, // reference error
                timeout: 7000,
            }
            );

            const payload: object = { results: prismaTransaction };

            return response(payload, 200, 'Book returned successfully');

        } catch (error) {
            console.error(error);
            if (error.message === 'NOT_BORROWED') {
                throw new ConflictException(response(null, 409, 'You have not borrowed this book'));
            }
            if (error.message === 'BOOK_NOT_EXIST') {
                throw new NotFoundException(response(null, 404, 'Book not found'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }

    async deleteAccount(userId: string, password: string) {
        try {

            const prismaTransaction = await this.prisma.$transaction(async (tx) => {

                const queryResult = await tx.users.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        password: true,
                        books_borrowment: {
                            select: {
                                returned_status: true,
                            },
                            where: {
                                returned_status: false,
                            }
                        }
                    },
                });

                if (queryResult.books_borrowment.length >= 1) {
                    throw new Error('ACTIVE_BORROWMENTS_EXIST');
                }

                if (!queryResult) {
                    throw new Error('NOT_FOUND');
                }

                const validation: boolean = await bcrypt.compare(password, queryResult.password);

                if (!validation) {
                    throw new Error('WRONG_PASSWORD');
                }

                const deleteUserAccount = await tx.users.delete({
                    where: { id: userId }, select: {
                        fullname: true,
                        email: true,
                    }
                })

                return deleteUserAccount;

            }, {
                timeout: 7000,
            })

            const payload: object = { results: prismaTransaction };

            return response(payload, 200, 'User account deleted successfully');


        } catch (error) {
            console.error(error);
            if (error.message === 'ACTIVE_BORROWMENTS_EXIST') {
                throw new ForbiddenException(response(null, 403, 'You have active borrowments. Please return all borrowed books before deleting your account'));
            }
            if (error.message === 'NOT_FOUND') {
                throw new NotFoundException(response(null, 404, 'User not found'));
            }
            if (error.message === 'WRONG_PASSWORD') {
                throw new UnauthorizedException(response(null, 401, 'Incorrect password'));
            }
            throw new InternalServerErrorException(
                response(null, 500, 'Internal server error')
            );
        }
    }
}
