import { Body, Controller, Post } from '@nestjs/common';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { CollectionsService } from './collections.service';

@Controller('collections')
export class CollectionsController {

  constructor(private readonly collectionsService: CollectionsService){}
  

  @Post('/add')
  async create(@ Body() cretaeCollection: CollectionDto){
    return this.collectionsService.addCollection(cretaeCollection)

  }

}

