import { Module } from '@nestjs/common';
import { CaracteristicsController } from './caracteristics.controller';
import { CaracteristicsService } from './caracteristics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Collection } from 'mongoose';
import { CaracteristiqueSchema } from 'src/schemas/caracteristique.schema';

@Module({
  imports: [
      MongooseModule.forFeature([{name: Collection.name, schema: CaracteristiqueSchema}]),
    ],
  controllers: [CaracteristicsController],
  providers: [CaracteristicsService],
  exports: [CaracteristicsService],
})
export class CaracteristicsModule {}
