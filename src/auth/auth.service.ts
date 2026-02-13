import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    // inject jwtService to sign tokens
    constructor(private readonly jwtService: JwtService) { }

    async generateToken(payload: any) {
        // using secret and options defined in AuthModule
        return this.jwtService.sign(payload);
    }

    // login validation method
    async login(user: any) {
        const payload = { username: user.email, sub: user.id };
        return {
            access_token: await this.generateToken(payload),
        };
    }
}