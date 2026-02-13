import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from 'src/helper/redis.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly configService: ConfigService, private readonly redisService: RedisService) {
        // call super first, and pass the config value directly into it
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // accessing configService, passed as an argument to the constructor
            secretOrKey: configService.get<string>('JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: any, payload: any) {
        const authHeader = req.get('Authorization');
        if (!authHeader) {
            throw new UnauthorizedException('Missing authorization header');
        }

        const jti = payload?.jti;
        if (!jti) {
            throw new UnauthorizedException('Missing token identifier');
        }

        const blacklisted = await this.redisService.isBlacklisted(jti);
        if (blacklisted) {
            throw new UnauthorizedException('Token has been revoked');
        }
        return { id: payload.id, username: payload.username, role: payload.role, jti, exp: payload?.exp };
    }
}