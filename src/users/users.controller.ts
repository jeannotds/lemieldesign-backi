import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';
import { JwtAuthGuard } from 'helpers/jwt-auth.guard';

@Controller('users')
export class UsersController {

  constructor(private readonly userService: UsersService){}

  @Post('/signup')
  signup(@Body() createUserDto: CreateUserDto){
    return this.userService.createUser(createUserDto);
  }

  @Post('/login')
  signin(@Body() loginUserDto: LoginUserDto){
    return this.userService.loginUser(loginUserDto);
  }

    // --- Route protégée ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    console.log("req : ", req.user)
    
    // req.user contient ce que retourne validate() dans JwtStrategy
    return { message: 'Route protégée', user: req.user };
  }


}
