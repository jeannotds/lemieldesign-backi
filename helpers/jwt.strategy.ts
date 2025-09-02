import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Récupère le token du header Authorization
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY_CHANGE_ME',
      // SECRET_KEY_LEMIELDESIGN
    });
  }

  async validate(payload: any) {
    // payload = { sub: userId, email: userEmail }
    return { userId: payload.sub, email: payload.email, username: payload.username }; // sera disponible via @Req() ou @Request()
  }
}
