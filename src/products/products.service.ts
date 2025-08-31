import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { Model } from 'mongoose';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';

@Injectable()
export class ProductsService {

  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>){}


  async uploadToCloudinary(file: Express.Multer.File): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'products',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );

      // on envoie le buffer de multer dans le stream cloudinary
      upload.end(file.buffer);
    });
  }

  // async postProduct(createProduitDto: any, files: Express.Multer.File[]): Promise<Product> {

  //   const images = [];

  //   for (const file of files) {
  //   const result = await cloudinary.uploader.upload(file.path, {
  //     folder: 'products',
  //   });
  //   images.push({ url: result.secure_url, public_id: result.public_id });
  // }


  //   const newProduit = new this.productModel({...createProduitDto, images});
  //   return newProduit.save();

  // }

   async postProduct(createProduitDto: CreateProduitDto, files: Express.Multer.File[]): Promise<Product> {
    let images: { url: string; public_id: string }[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await this.uploadToCloudinary(file);
        images.push(uploaded);
      }
    } else {
      images = [
        {
          url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/products/empty.png',
          public_id: 'default_empty_image',
        },
      ];
    }

    const newProduit = new this.productModel({
      ...createProduitDto,
      price: Number(createProduitDto.price), // ⚡ convertir string en number
      images,
    });

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
