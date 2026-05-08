import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { Model } from 'mongoose';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import * as sharp from 'sharp';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>,
  @Inject(CACHE_MANAGER) private cacheManager: Cache,
){}

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

    // ❌ invalidation cache
    await this.cacheManager.del('products:all');

    return newProduit.save();
  }

  async findAll(): Promise<Product[]> {

    // cacheKey = clé unique pour le cache (products:all)
    const cacheKey = 'products:all';

    // ✅ Récupérer les produits depuis le cache
      // 1. Vérifier Redis
    // const cachedProducts = await this.cacheManager.get(cacheKey);
    const cachedProducts = await this.cacheManager.get<Product[]>(cacheKey);

    // ✅ Si les produits sont déjà dans le cache, les retourner immédiatement sans aller en base de données
    if (cachedProducts) {
      console.log('📦 Produits depuis le cache');
      return cachedProducts as Product[];
    }

    console.log('📦 Produits depuis MongoDB');

      // 2. DB call (si pas dans le cache)
    const products = await this.productModel
      .find()
      .populate('collection')
      // .populate('caracteristics');
  // 3. Sauvegarder Redis (les produits dans le cache)
    await this.cacheManager.set(cacheKey, products,  60 * 1000); // 1 minute

    return products;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    const cachedProduct = await this.cacheManager.get(cacheKey);

    if(cachedProduct) {
      const product = cachedProduct as Product;
      console.log('📦 Produit depuis le cache');
      return product;
    }

    const product = await this.productModel.findById(id).populate('collection');
   
    await this.cacheManager.set(cacheKey, product, 60 * 1000); // 1 minute

    return product;
  }


  // ✅ DELETE product
  async deleteProduct(id: string): Promise<{ message: string }> {
    await this.productModel.findByIdAndDelete(id);

    // ❌ invalidation cache
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');

    return { message: 'Produit supprimé avec succès' };
  }

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
 const updatedProduct = await this.productModel.findByIdAndUpdate(
      id,
      {
        ...updateProduitDto,
        sizes,
        images: imagesToKeep,
      },
      { new: true },
    );

      // ❌ invalidation cache
    await this.cacheManager.del(`product:${id}`);
    await this.cacheManager.del('products:all');

    return updatedProduct;
  }
  

}
