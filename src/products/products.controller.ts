import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService){}

  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images')) // 'images' = nom du champ dans le form-data
  @Post('/post')
  async create(@Body() createProduitDto: any, @UploadedFiles() files: Express.Multer.File[],){
    return this.productsService.postProduct(createProduitDto, files)
  }

  @Get()
  async findAllProduct() {
    return this.productsService.findAll();
  }

  @Get('/:id')
  async findOneProduct(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // ✅ DELETE product
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(id);
  }

  // ✅ UPDATE product
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('images'))
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProduitDto: CreateProduitDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productsService.updateProduct(id, updateProduitDto, files);
  }

}
