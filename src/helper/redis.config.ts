// redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    async onModuleInit() {
        this.client = createClient({ url: process.env.REDIS_URL });
        await this.client.connect();
    }

    async onModuleDestroy() {
        await this.client.disconnect();
    }

    // Add token jti to blacklist with an expiry (TTL)
    async addToBlacklist(jti: string, expiryInSeconds: number) {
        await this.client.set(jti, 'revoked', {
            EX: expiryInSeconds,
        });
    }

    // Check if token jti exists in blacklist
    async isBlacklisted(jti: string): Promise<boolean> {
        const result = await this.client.get(jti);
        return result !== null;
    }
}