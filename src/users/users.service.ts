import { LoginUserDto } from 'src/dto/login-user.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>, 
  private jwtService: JwtService,
){}


  async createUser(createUserDto: CreateUserDto){
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);  

    const newUser = new this.userModel({ ...createUserDto, password: hashPassword });

    const savedUser = await newUser.save();

    const token = this.jwtService.sign({ sub: savedUser._id, email: savedUser.email, username: savedUser.username });

    const { password, ...userWithoutPassword } = savedUser.toObject();

    return {
      access_token: token,
      user: userWithoutPassword,
    };


  }

  async loginUser(loginUserDto: LoginUserDto) {

    const findUser = await this.userModel.findOne({email: loginUserDto.email});

      if(!findUser) throw new NotFoundException('Mail ou Mot de passe Incorrect');

      const isMatch = await bcrypt.compare(loginUserDto.password, findUser.password);

      if(!isMatch) throw new UnauthorizedException('Mail ou Mot de passe Incorrect');

      const token = this.jwtService.sign({ sub: findUser._id, email: findUser.email, username: findUser.username});

      const {password, ...userWithoutPassword } = findUser.toObject();

      return {
          access_token: token,
          user: userWithoutPassword,
        };
      }


}