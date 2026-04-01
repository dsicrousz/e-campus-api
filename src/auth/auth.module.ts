import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { CompteModule } from '../compte/compte.module';
import { BetterAuthGuard } from './better-auth.guard';
import { BetterAuthService } from './better-auth.service';
import { CompteAuthGuard } from './compte-auth.guard';
import { AnyAuthGuard } from './any-auth.guard';
import { WsBetterAuthGuard } from './ws-better-auth.guard';

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule,
    CompteModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => {
        return {
          secret: config.get('JWT_SECRET'),
          signOptions: { expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, BetterAuthGuard, BetterAuthService, CompteAuthGuard, AnyAuthGuard, WsBetterAuthGuard],
  exports: [AuthService, BetterAuthService, BetterAuthGuard, CompteAuthGuard, AnyAuthGuard, WsBetterAuthGuard],
})
export class AuthModule {}
