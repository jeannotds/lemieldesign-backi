import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('collections')
export class CollectionsController {

  constructor(private readonly collectionsService: CollectionsService){}
  
    // --- Route protégée ---
  // @UseGuards(AuthGuard('jwt'))
  @Post('/add')
  async create(@Body() cretaeCollection: CollectionDto){
    return await this.collectionsService.addCollection(cretaeCollection)
  }

  @Get()
  async get(){
    return await this.collectionsService.getCollections()
  }

}

