/* eslint-disable prettier/prettier */
import { HttpException, Injectable, NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { USER_ROLE, User} from '../user/entities/user.entity';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private getAllowedApiKeys(): string[] {
    const raw = this.config.get<string>('API_KEYS');
    return (raw || '')
      .split(',')
      .map((k) => k.trim())
      .filter((k) => !!k);
  }

  private extractApiKey(req: Request): string | undefined {
    // Prefer custom header
    const headerKey = (req.headers['x-api-key'] || req.headers['X-API-KEY']) as string | undefined;
    if (headerKey) return headerKey;

    // Fallback to Authorization: ApiKey <key>
    const auth = req.headers.authorization;
    if (auth) {
      const [scheme, credential] = auth.split(' ');
      if (scheme && /^ApiKey$/i.test(scheme) && credential) {
        return credential;
      }
    }
    return undefined;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const allowedKeys = this.getAllowedApiKeys();
    // 1) API Key path
    const apiKey = this.extractApiKey(req);
    if (apiKey && allowedKeys.includes(apiKey)) {
      // Create a short-lived service JWT so existing AuthGuard('jwt') passes
      const serviceUser = {
        _id: 'api-key',
        role: [USER_ROLE.USER],
      };

      const token = this.jwtService.sign(
        { _id: serviceUser._id, role: serviceUser.role },
        { expiresIn: '15m' },
      );

      // Inject Bearer token for downstream Passport JWT guard
      req.headers.authorization = `Bearer ${token}`;
      // Also attach user to request for any middleware/filters
      req.user = { _id: serviceUser._id, role: serviceUser.role } as any;
      return next();
    }

    // 2) JWT path (Authorization: Bearer <jwt>)
    if (req.headers.authorization) {
      const [scheme, credential] = req.headers.authorization.split(' ');
      const token = /^Bearer$/i.test(scheme) ? credential : undefined;
      if (token) {
        try {
          const decoded = this.jwtService.verify(token) as User;
          const { role, _id } = decoded;
          req.user = { role, _id } as any;
        } catch (error) {
          // Back-compat: some clients may send API key as Bearer token
          if (allowedKeys.includes(token)) {
            const serviceUser = {
              _id: 'api-key',
              role: [USER_ROLE.SUPERADMIN],
            };
            const compatToken = this.jwtService.sign(
              { _id: serviceUser._id, role: serviceUser.role },
              { expiresIn: '15m' },
            );
            req.headers.authorization = `Bearer ${compatToken}`;
            req.user = { _id: serviceUser._id, role: serviceUser.role } as any;
            return next();
          } else {
           throw new HttpException("Authentication failed", 440);
          }
        }
      }
    }

    next();
  }
}

