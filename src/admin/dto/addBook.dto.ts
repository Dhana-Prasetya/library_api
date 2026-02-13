import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, MaxLength, Min } from 'class-validator';

export enum BookGenre { // dont change
    FICTION = 'fiction',
    NON_FICTION = 'non-Fiction'
}

export enum BookBorrowableStatus { // dont change
    BORROWABLE = 'true',
    NOT_BORROWABLE = 'false'
}

export class addBookDto {
    @IsString({ message: 'Title must be a string' })
    @MaxLength(500, { message: 'Title is too long' })
    title: string;

    @IsString({ message: 'Author name must be a string' })
    @MaxLength(255, { message: 'Author name is too long' })
    author: string;

    @IsString({ message: 'Genre must be a string' })
    @IsEnum(BookGenre, {
        message: 'Valid genres are: ' + Object.values(BookGenre).join(', '),
    })
    genre: string;

    @IsString({ message: 'Description must be a string' })
    description: string;

    @Type(() => Number) // Convert to number
    @IsInt({ message: 'Quantity must be an integer number' })
    @Min(1, { message: 'Quantity must be at least 1' })
    quantity: number;

    @IsEnum(BookBorrowableStatus, {
        message: 'Valid borrowable status are: ' + Object.values(BookBorrowableStatus).join(', '),
    }) borrowable: string;
}