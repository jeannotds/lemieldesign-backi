import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'helpers/jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{name: User.name, schema: UserSchema}]), 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'SECRET_KEY_CHANGE_ME', // à mettre dans .env
      signOptions: { expiresIn: '30d' },
    }),],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
