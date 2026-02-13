import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class passwordDto {

    @IsNotEmpty({ message: 'Password required' })
    @IsString()
    @MaxLength(255)
    password: string;
}