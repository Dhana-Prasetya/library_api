import { PrismaService } from '../src/prisma.service';
import * as bcrypt from 'bcrypt';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import 'dotenv/config';

async function main() {

    try {
        const prisma = new PrismaService();

        const rl = readline.createInterface({ input, output });

        console.log('Registering new admin user...');

        const fullname: string = await rl.question('Enter admin fullname: ')

        if (!fullname || fullname.length < 4 || fullname.length > 255 || typeof fullname !== 'string') {
            throw new Error('Full name must be string between 4 and 255 characters long');
        }

        const email: string = await rl.question('Enter admin email: ')

        if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error('Valid email address required and must not exceed 255 characters');
        }

        let password: string = await rl.question('Enter admin password: ')

        rl.close();

        if (!password || password.length < 8 || password.length > 255) {
            throw new Error('Password must be between 8 and 255 characters long');
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);

        const queryResult = await prisma.users.create({
            data: { fullname, email, role: 'admin', password: hashedPassword }
        });

        delete queryResult.password;

        console.log('Admin user created:', queryResult);

        return;
    } catch (error) {
        console.error('Error registering admin user', error);
    }
}

main()