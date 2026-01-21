import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { Model } from 'mongoose';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import * as sharp from 'sharp';
@Injectable()
export class ProductsService {

  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>){}

  async uploadToCloudinary(file: Express.Multer.File): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      // compression avec sharp
      sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside' }) // max 1200px, garde les proportions
        .jpeg({ quality: 80 }) // compression JPEG qualité 80%
        .toBuffer()
        .then((compressedBuffer) => {
          const upload = cloudinary.uploader.upload_stream(
            { folder: 'products' }, // tu peux rajouter d’autres options ici si besoin
            (error, result) => {
              if (error) return reject(error);
              resolve({ url: result.secure_url, public_id: result.public_id });
            },
          );
          upload.end(compressedBuffer); // envoi l'image compressée
        })
        .catch(reject);
    });
  }

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
      sizes: createProduitDto.sizes.map(s => ({
        label: s.label,
        price: Number(s.price),
      })),
      images,
    });

    return newProduit.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel
      .find()
      .populate('collection')
      // .populate('caracteristics');
  }

  async findOne(id: string): Promise<Product> {
    return this.productModel
      .findById(id)
      .populate('collection')
      // .populate('caracteristics');
  }


  // ✅ DELETE product
  async deleteProduct(id: string): Promise<{ message: string }> {
    await this.productModel.findByIdAndDelete(id);
    return { message: 'Produit supprimé avec succès' };
  }

  // ✅ UPDATE product
  // async updateProduct(id: string, updateProduitDto: CreateProduitDto, files: Express.Multer.File[]): Promise<Product> {
  //   let images: { url: string; public_id: string }[] = [];

  //   if (files && files.length > 0) {
  //     for (const file of files) {
  //       const uploaded = await this.uploadToCloudinary(file);
  //       images.push(uploaded);
  //     }
  //     updateProduitDto.images = images;
  //   }

  //   const sizes = updateProduitDto.sizes?.map(s => ({
  //     label: s.label,
  //     price: Number(s.price),
  //   }));

  //   return this.productModel.findByIdAndUpdate(
  //     id,
  //     { ...updateProduitDto, sizes },
  //     { new: true },
  //   );
  //   }

  async updateProduct(id: string, updateProduitDto: any, files: Express.Multer.File[]): Promise<Product> {
    // ----- Récupérer le produit existant -----
    const product = await this.productModel.findById(id);
    if (!product) throw new Error('Produit non trouvé');
  
    // ----- Anciennes images à conserver -----
    const productImages: { _id: any; url: string; public_id: string }[] = product.images as any;

    let imagesToKeep = [];
    if (updateProduitDto.existingImages && Array.isArray(updateProduitDto.existingImages)) {
      imagesToKeep = productImages.filter(img =>
        updateProduitDto.existingImages.includes(img._id.toString())
      );
    }
  
    // ----- Upload des nouvelles images -----
    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await this.uploadToCloudinary(file);
        imagesToKeep.push(uploaded);
      }
    }
  
    // ----- Gestion des tailles -----
    const sizes = updateProduitDto.sizes?.map(s => ({
      label: s.label,
      price: Number(s.price),
    }));
  
    // ----- Update produit -----
    return this.productModel.findByIdAndUpdate(
      id,
      {
        ...updateProduitDto,
        sizes,
        images: imagesToKeep,
      },
      { new: true },
    );
  }
  

}
