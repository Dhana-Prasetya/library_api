import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserLoginDataDto {

    @IsEmail({}, { message: 'Valid email address required' })
    @IsNotEmpty({ message: 'Email address required' })
    @IsString()
    @MaxLength(255)
    @Transform(({ value }) => value?.toLowerCase().trim()) // Lowercase and remove spaces
    email: string;

    @IsNotEmpty({ message: 'Password required' })
    @IsString()
    @MaxLength(255)
    password: string;
}