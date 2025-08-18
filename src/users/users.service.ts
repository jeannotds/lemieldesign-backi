import { Injectable } from '@nestjs/common';
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



}