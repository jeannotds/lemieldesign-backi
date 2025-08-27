import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';

@Injectable()
export class ProductsService {

  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>){}

  async postProduct(createProduitDto: CreateProduitDto): Promise<Product> {

    const newProduit = new this.productModel(createProduitDto);
    return newProduit.save();

  }

  async findAll(): Promise<Product[]> {
    return this.productModel
      .find()
      .populate('collection') // populate de la collection
      .populate('caracteristics'); // populate des caractéristiques
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel
      .findById(id)
      .populate('collection')
      .populate('caracteristics');
  }

}
