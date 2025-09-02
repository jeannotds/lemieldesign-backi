import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCaracteristicDto } from 'src/dto/create-caracteristic.dto';
import { Caracteristic, CaracteristicDocument } from 'src/schemas/caracteristic.schema';

@Injectable()
export class CaracteristicsService {
  constructor(@InjectModel(Caracteristic.name) private caracteristicModel: Model<CaracteristicDocument>){}
  

  async addCaracteristic(createCaracteristicDto: CreateCaracteristicDto)  {
    const createCaracteristic = new this.caracteristicModel(createCaracteristicDto)
    const saveCaracteristic = createCaracteristic.save()
    return saveCaracteristic;
  }

  async getCaracteristic()  {
    const caracteristics = await this.caracteristicModel.find()
    return caracteristics;
  }

}
