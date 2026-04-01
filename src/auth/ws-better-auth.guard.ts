import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { BetterAuthService } from './better-auth.service';

@Injectable()
export class WsBetterAuthGuard implements CanActivate {
  constructor(private readonly betterAuthService: BetterAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const handshake = client.handshake;

    // Extraire le token depuis les headers ou query params
    const sessionToken = this.extractSessionToken(handshake);

    if (!sessionToken) {
      client.disconnect();
      return false;
    }

    try {
      const session = await this.betterAuthService.verifySession(sessionToken);
      if (!session || !session.user) {
        client.disconnect();
        return false;
      }

      // Attacher l'utilisateur au client pour usage ultérieur
      client.user = session.user;
      return true;
    } catch (error) {
      client.disconnect();
      return false;
    }
  }

  private extractSessionToken(handshake: any): string | undefined {
    // 1. Vérifier dans les cookies
    const cookieHeader = handshake.headers?.cookie;
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key && value) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, string>);

      const sessionToken = cookies['better-auth.session_token'];
      if (sessionToken) return sessionToken;
    }

    // 2. Vérifier dans le header Authorization
    const authHeader = handshake.headers?.authorization;
    if (authHeader) {
      const [scheme, token] = authHeader.split(' ');
      if (scheme && /^Bearer$/i.test(scheme) && token) {
        return token;
      }
    }

    // 3. Vérifier dans les query params
    const queryToken = handshake.query?.token as string;
    if (queryToken) return queryToken;

    // 4. Vérifier dans un header custom
    const customHeader = handshake.headers?.['x-session-token'] as string;
    if (customHeader) return customHeader;

    return undefined;
  }
}
