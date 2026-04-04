/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { BetterAuthService } from './better-auth.service';

/**
 * Guard pour vérifier les sessions Better Auth
 * Vérifie la session via le serveur d'authentification centralisé
 */
@Injectable()
export class BetterAuthGuard implements CanActivate {
  private readonly logger = new Logger(BetterAuthGuard.name);

  constructor(private readonly betterAuthService: BetterAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Debug: log headers reçus
    this.logger.debug(`Cookie header: ${request.headers.cookie || 'NONE'}`);
    this.logger.debug(`Authorization header: ${request.headers.authorization || 'NONE'}`);
    this.logger.debug(`X-Session-Token header: ${request.headers['x-session-token'] || 'NONE'}`);
    
    // Extraire le token de session depuis les cookies ou headers
    const sessionToken = this.extractSessionToken(request);

    if (!sessionToken) {
      this.logger.warn('No session token found in request');
      throw new UnauthorizedException('Session token manquant');
    }
    
    this.logger.debug(`Session token found: ${sessionToken.substring(0, 10)}...`);

    try {
      // Vérifier la session auprès du serveur Better Auth
      const session = await this.betterAuthService.verifySession(sessionToken);

      if (!session || !session.user) {
        throw new UnauthorizedException('Session invalide ou expirée');
      }

      // Attacher les informations utilisateur à la requête
      request.user = session.user;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Échec de vérification de session: ${error.message}`,
      );
    }
  }

  /**
   * Extrait le token de session depuis les cookies ou headers
   */
  private extractSessionToken(request: Request): string | undefined {
    // 1. Vérifier dans les cookies (comportement par défaut de Better Auth)
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
      // Parser les cookies pour extraire better-auth.session_token
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Support both secure (HTTPS) and non-secure cookie names
      const sessionToken = cookies['__Secure-better-auth.session_token'] || cookies['better-auth.session_token'];
      if (sessionToken) {
        return sessionToken;
      }
    }

    // 2. Vérifier dans le header Authorization (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const [scheme, token] = authHeader.split(' ');
      // Reject 'null', 'undefined', or empty tokens
      if (scheme && /^Bearer$/i.test(scheme) && token && token !== 'null' && token !== 'undefined') {
        return token;
      }
    }

    // 3. Vérifier dans un header custom
    const customHeader = request.headers['x-session-token'] as string;
    if (customHeader) return customHeader;

    return undefined;
  }
}
