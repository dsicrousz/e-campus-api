/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * DEPRECATED: Ce service utilisait l'ancien système d'authentification local.
 * L'authentification est maintenant gérée par Better Auth (serveur centralisé).
 * Utilisez BetterAuthService et BetterAuthGuard à la place.
 * 
 * Ce service est conservé temporairement pour la compatibilité avec CompteModule
 * qui utilise encore le système JWT pour les comptes étudiants.
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
  ) {}

  /**
   * DEPRECATED: Utilisez Better Auth pour l'authentification des utilisateurs
   */
  async validateUser(username: string, pass: string): Promise<any | null> {
    // Cette méthode n'est plus utilisée - Better Auth gère l'authentification
    throw new Error('validateUser est obsolète - utilisez Better Auth');
  }

  /**
   * Génère un token JWT pour les comptes étudiants uniquement
   * Les utilisateurs (staff) utilisent Better Auth
   */
  login(user) {
    const payload = {
      role: user?.role,
      _id: user?._id,
      iscompte: false,
      sub: user?._id,
    };
    return {
      data: {
        token: this.jwtService.sign(payload),
        id: user?._id,
      },
      statusCode: 200,
    };
  }
}
