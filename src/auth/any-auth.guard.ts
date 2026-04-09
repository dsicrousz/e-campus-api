/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { BetterAuthGuard } from './better-auth.guard';
import { CompteAuthGuard } from './compte-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AnyAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly betterAuthGuard: BetterAuthGuard,
    private readonly compteAuthGuard: CompteAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const preferCompte = this.shouldPreferCompte(request);

    if (preferCompte) {
      try {
        return this.compteAuthGuard.canActivate(context);
      } catch (_) {
        // fallback below
      }
      return this.tryBetterAuth(context);
    }

    try {
      const ok = await this.betterAuthGuard.canActivate(context);
      if (ok) {
        (request as any).authType = 'better-auth';
      }
      return ok;
    } catch (_) {
      // fallback below
    }

    try {
      return this.compteAuthGuard.canActivate(context);
    } catch (_) {
      throw new UnauthorizedException('Authentification requise');
    }
  }

  private async tryBetterAuth(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const ok = await this.betterAuthGuard.canActivate(context);
      if (ok) {
        (request as any).authType = 'better-auth';
      }
      return ok;
    } catch (_) {
      throw new UnauthorizedException('Authentification requise');
    }
  }

  private shouldPreferCompte(request: Request): boolean {
    const cookieHeader = request.headers.cookie || '';
    const hasBetterAuthCookie = cookieHeader.includes('better-auth.session_token=') || cookieHeader.includes('__Secure-better-auth.session_token="');
    const hasCustomSessionHeader = !!request.headers['x-session-token'];

    if (hasBetterAuthCookie || hasCustomSessionHeader) return false;

    const authHeader = request.headers.authorization;
    if (!authHeader) return false;
    const [scheme] = authHeader.split(' ');
    return !!scheme && /^Bearer$/i.test(scheme);
  }
}
