import { Module } from '@nestjs/common';
import { CaracteristicsController } from './caracteristics.controller';
import { CaracteristicsService } from './caracteristics.service';

@Module({
  controllers: [CaracteristicsController],
  providers: [CaracteristicsService]
})
export class CaracteristicsModule {}
