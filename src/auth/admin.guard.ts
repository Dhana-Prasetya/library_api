import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Get the required roles from the metadata
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!requiredRoles) return true;

        // Get the user from the request (attached by JwtStrategy)
        const { user } = context.switchToHttp().getRequest();

        // Check if the user's role matches one of the required roles
        const hasPermission = requiredRoles.includes(user.role);

        if (!hasPermission) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        return hasPermission;
    }
}