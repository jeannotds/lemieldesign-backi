import { Body, Controller, Post } from '@nestjs/common';
import { CaracteristicsService } from './caracteristics.service';
import { CreateCaracteristicDto } from 'src/dto/create-caracteristic.dto';

@Controller('caracteristics')
export class CaracteristicsController {
  constructor(private readonly caracteristicsService: CaracteristicsService){}

  @Post('/add')
  async create(@Body() createCaracteristicDto : CreateCaracteristicDto) {
    return this.caracteristicsService.addCaracteristic(createCaracteristicDto);
  }

}