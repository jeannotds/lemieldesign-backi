import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Récupère le token du header Authorization
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_CHANGE_ME',
    });
  }

  async validate(payload: any) {
    // payload = { sub: userId, email: userEmail }
    return { userId: payload.sub, email: payload.email }; // sera disponible via @Req() ou @Request()
  }
}
