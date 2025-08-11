import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

@Injectable()
export class UsersService {

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>){}


  createUser(createUserDto: CreateUserDto){
    const createUser = new this.userModel(createUserDto);
    console.log('createUser : ',createUser)
    return createUser.save()
  }

}