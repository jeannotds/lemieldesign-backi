// import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
// import { CollectionDto } from 'src/dto/create-collection.dto';
// import { CollectionsService } from './collections.service';
// import { AuthGuard } from '@nestjs/passport';

// @Controller('collections')
// export class CollectionsController {

//   constructor(private readonly collectionsService: CollectionsService){}
  
//     // --- Route protégée ---
//     //
//   @UseGuards(AuthGuard('jwt'))
//   @Post('/add')
//   async create(@Body() cretaeCollection: CollectionDto, @Req() req){
//     return await this.collectionsService.addCollection(cretaeCollection)
//   }

//   @Get()
//   async get(){
//     return await this.collectionsService.getCollections()
//   }

// }

import { 
  Body, 
  Controller, 
  Get, 
  Post, 
  UploadedFile, 
  UseGuards, 
  UseInterceptors 
} from '@nestjs/common';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { CollectionsService } from './collections.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // --- Route protégée ---
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('image')) // "image" doit être le champ dans le form-data
  @Post('/add')
  async create(
    @Body() createCollection: CollectionDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return await this.collectionsService.addCollection(createCollection, file);
  }

  @Get()
  async get() {
    return await this.collectionsService.getCollections();
  }
}
