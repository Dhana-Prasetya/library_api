import { PrismaService } from '../src/prisma.service.js';
import * as bcrypt from 'bcrypt';

async function main() {

    try {
        const prisma = new PrismaService();

        const fullname: string = prompt('Enter admin fullname: ')
        const email: string = prompt('Enter admin email: ')
        const password: string = prompt('Enter admin password: ')

        const hashedPassword: string = await bcrypt.hash(password, 10);

        const queryResult = await prisma.users.create({
            data: { fullname, email, role: 'admin', password: hashedPassword }
        });

        delete queryResult.password;

        console.log('Admin user created:', queryResult);
    } catch (error) {
        console.error('Error registering admin user', error);
    }
}