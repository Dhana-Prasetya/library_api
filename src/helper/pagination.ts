import { PrismaService } from '../prisma.service.js';
const prisma = new PrismaService();

// interface for the function parameters
interface PaginationArgs {
    pageInt: number;
    limitInt: number;
    table: string;
}

// interface for the return object
interface PaginationResult {
    skip: number;
    total: number;
    totalPages: number;
}

async function pagination({ pageInt, limitInt, table }: PaginationArgs): Promise<PaginationResult> {
    const skip: number = (pageInt - 1) * limitInt;

    const total: number = await prisma[table].count();
    const totalPages: number = Math.ceil(total / limitInt);

    return {
        skip,
        total,
        totalPages
    };
}

export default pagination;