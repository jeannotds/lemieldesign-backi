import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CaracteristicsService } from './caracteristics.service';
import { CreateCaracteristicDto } from 'src/dto/create-caracteristic.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('caracteristics')
export class CaracteristicsController {
  constructor(private readonly caracteristicsService: CaracteristicsService){}

  @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async create(@Body() createCaracteristicDto : CreateCaracteristicDto) {
    return await this.caracteristicsService.addCaracteristic(createCaracteristicDto);
  }

  @Get()
  async get() {
    return this.caracteristicsService.getCaracteristic();
  }

}