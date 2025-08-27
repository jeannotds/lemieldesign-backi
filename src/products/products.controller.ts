import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('products')
export class ProductsController {

  constructor(private readonly productsService: ProductsService){}

  @UseGuards(AuthGuard('jwt'))
  @Post('/post')
  async create(@Body() createProduitDto: CreateProduitDto){
    return this.productsService.postProduct(createProduitDto)
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
