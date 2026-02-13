import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config"; // Import these
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtStrategy } from "./jwt.strategy";
import { AuthService } from "./auth.service";
import { RedisService } from "src/helper/redis.config";

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secret:
                    configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '1h',
                    issuer: 'library_api',
                },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, JwtAuthGuard, RedisService],
    exports: [AuthService, JwtAuthGuard, JwtModule],
})
export class AuthModule { }