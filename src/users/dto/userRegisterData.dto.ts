import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserRegisterDataDto {

    @IsNotEmpty({ message: 'Full name required' })
    @IsString()
    @MaxLength(255, { message: 'Full name must not exceed 255 characters' })
    @MinLength(4, { message: 'Full name must be at least 4 characters long' })
    fullname: string;


    @IsEmail({}, { message: 'Valid email address required' })
    @IsNotEmpty({ message: 'Email address required' })
    @IsString()
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    @Transform(({ value }) => value?.toLowerCase().trim()) // Lowercase and remove spaces
    email: string;

    @IsNotEmpty({ message: 'Password required' })
    @MaxLength(255, { message: 'Password must not exceed 255 characters' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}