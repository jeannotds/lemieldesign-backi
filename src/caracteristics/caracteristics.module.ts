import { Module } from '@nestjs/common';
import { CaracteristicsController } from './caracteristics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Caracteristic, CaracteristicSchema } from 'src/schemas/caracteristic.schema';
import { CaracteristicsService } from './caracteristics.service';

@Module({
  imports: [
      MongooseModule.forFeature([{name: Caracteristic.name, schema: CaracteristicSchema}]),
    ],
  controllers: [CaracteristicsController],
  providers: [CaracteristicsService],
  exports: [CaracteristicsService],
})
export class CaracteristicsModule {}
