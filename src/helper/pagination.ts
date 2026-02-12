import type { PrismaService } from '../prisma.service.js';

// interface for the function parameters
interface PaginationArgs {
    page: number;
    limit: number;
    table: string;
}

// interface for the return object
interface PaginationResult {
    skip: number;
    total: number;
    totalPages: number;
}

async function pagination(
    prisma: PrismaService,
    { page, limit, table }: PaginationArgs
): Promise<PaginationResult> {
    const skip: number = (page - 1) * limit;

    const total: number = await prisma[table].count();
    const totalPages: number = Math.ceil(total / limit);

    return {
        skip,
        total,
        totalPages
    };
}

export default pagination;