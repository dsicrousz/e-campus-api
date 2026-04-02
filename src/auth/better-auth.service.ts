/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Interface pour la réponse de vérification de session
 */
export interface SessionVerificationResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string[];
    [key: string]: any;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    [key: string]: any;
  };
}

/**
 * Service pour communiquer avec le serveur Better Auth centralisé
 */
@Injectable()
export class BetterAuthService {
  private readonly betterAuthUrl: string;

  constructor(private readonly configService: ConfigService) {
    // URL du serveur Better Auth (par défaut sur le port 3100)
    this.betterAuthUrl ='https://authapi.crousz.com';
  }

  /**
   * Vérifie une session auprès du serveur Better Auth
   * @param sessionToken Token de session à vérifier
   * @returns Informations de session et utilisateur
   */
  async verifySession(
    sessionToken: string,
  ): Promise<SessionVerificationResponse> {
    try {
      const response = await fetch(`${this.betterAuthUrl}/api/auth/get-session`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new HttpException(
            'Session invalide ou expirée',
            HttpStatus.UNAUTHORIZED,
          );
        }
        throw new HttpException(
          `Erreur du serveur d'authentification: ${response.statusText}`,
          response.status,
        );
      }

      const data = await response.json();

      // Valider la structure de la réponse
      if (!data.user || !data.session) {
        throw new HttpException(
          'Réponse invalide du serveur d\'authentification',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // Erreur réseau ou autre
      throw new HttpException(
        `Impossible de contacter le serveur d'authentification: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Invalide une session (logout)
   * @param sessionToken Token de session à invalider
   */
  async invalidateSession(sessionToken: string): Promise<void> {
    try {
      const response = await fetch(`${this.betterAuthUrl}/api/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: `better-auth.session_token=${sessionToken}`,
        },
      });

      if (!response.ok && response.status !== 401) {
        throw new HttpException(
          `Erreur lors de la déconnexion: ${response.statusText}`,
          response.status,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        `Impossible de contacter le serveur d'authentification: ${error.message}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
