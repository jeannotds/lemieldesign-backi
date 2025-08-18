import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginUserDto } from 'src/dto/login-user.dto';

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


}
