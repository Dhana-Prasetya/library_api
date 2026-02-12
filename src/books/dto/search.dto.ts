import { IsOptional } from 'class-validator';
import { PaginationDto } from '../../general_dto/pagination.dto';

export class SearchBooksDto extends PaginationDto {
    @IsOptional()
    title?: string;
}