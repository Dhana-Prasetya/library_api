import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number) // Convert to number
    @IsInt({ message: 'Page must be an integer if provided' })
    @Min(1, { message: 'Minimum page value are 1 if provided' })
    page?: number = 1; // Default value is 1

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Limit must be an integer if provided' })
    @Min(1, { message: 'Minimum limit value are 1 if provided' })
    @Max(30, { message: 'Maximum limit value are 30 if provided' })
    limit?: number = 10; // Default value is 10
}