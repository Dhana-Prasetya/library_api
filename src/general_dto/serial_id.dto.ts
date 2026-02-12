import { IsInt, Min, Max, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class SerialIdDto {
    @Type(() => Number)
    @IsDefined({ message: 'ID is required' })
    @IsInt({ message: 'ID must be an integer' })
    @Min(1, { message: 'Minimum ID value is 1' })
    @Max(1000, { message: 'Maximum ID value is 1000' })
    id: number;
}