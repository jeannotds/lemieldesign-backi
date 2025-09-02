import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { Collection, CollectionSchema } from 'src/schemas/collection.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collection.name, schema: CollectionSchema}])
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}
