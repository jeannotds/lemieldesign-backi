import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Collection, Model } from 'mongoose';
import { CreateCaracteristicDto } from 'src/dto/create-caracteristic.dto';
import { CaracteristiqueDocument } from 'src/schemas/caracteristique.schema';

@Injectable()
export class CaracteristicsService {
  constructor(@InjectModel(Collection.name) private caracteristicModel: Model<CaracteristiqueDocument>){}
  

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
