import { Body, Controller, Get, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService){}

  // @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images')) // 'images' = nom du champ dans le form-data
  @Post('/post')
  async create(@Body() createProduitDto: any, @UploadedFiles() files: Express.Multer.File[],){
    console.log("files : ", files)
    console.log('createProduitDto : ', createProduitDto)
    return this.productsService.postProduct(createProduitDto, files)
  }

  @Get()
  async findAllProduct() {
    return this.productsService.findAll();
  }

  @Get('/:id')
  async findOneProduct() {
    return this.productsService.findAll();
  }

}
