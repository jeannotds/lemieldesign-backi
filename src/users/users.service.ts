import { LoginUserDto } from 'src/dto/login-user.dto';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}


  async createUser(createUserDto: CreateUserDto){
    const saltOrRounds = 10;
    const hashPassword = await bcrypt.hash(createUserDto.password, saltOrRounds);  
    
    const createUser = new this.userModel({...createUserDto, password: hashPassword });
    return createUser.save()
  }

  async loginUser(loginUserDto: LoginUserDto) {

    const findUser = await this.userModel.findOne({email: loginUserDto.email});

      if(!findUser) throw new NotFoundException('Mail ou Mot de passe Incorrect');

      const isMatch = await bcrypt.compare(loginUserDto.password, findUser.password);

      if(!isMatch) throw new UnauthorizedException('Mail ou Mot de passe Incorrect');

       const {password, ...userWithoutPassword } = findUser.toObject();

      return userWithoutPassword;

    }


}