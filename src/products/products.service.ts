import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { Model } from 'mongoose';
import { CreateProduitDto } from 'src/dto/create-produit.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import * as sharp from 'sharp';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CollectionsService } from 'src/collections/collections.service';
import { bumpCacheVersion, cacheVersion, remember } from 'src/common/list-cache';
import {
  PaginatedResponse,
  escapeRegex,
  paginateModel,
  parseListQuery,
} from 'src/common/pagination';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly collectionsService: CollectionsService,
  ) {}

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

    const saved = await newProduit.save();
    await this.invalidateLists();
    return saved;
  }

  async findPaginated(
    rawQuery: Record<string, unknown> = {},
    collectionId?: string,
  ): Promise<PaginatedResponse<Product>> {
    const listQuery = parseListQuery(rawQuery, 'product');
    const filters: Record<string, unknown>[] = [];
    let collectionSummary: PaginatedResponse<Product>['collection'];

    if (collectionId) {
      const collection = await this.collectionsService.assertExists(collectionId);
      // Les anciens produits stockent l'id en chaîne, les nouveaux en ObjectId.
      filters.push({ $expr: { $eq: [{ $toString: '$collection' }, collectionId] } });
      collectionSummary = {
        _id: String(collection._id),
        name: collection.name,
        description: collection.description,
        image: collection.image,
      };
    }

    if (listQuery.q) {
      const rx = new RegExp(escapeRegex(listQuery.q), 'i');
      filters.push({ $or: [{ name: rx }, { description: rx }] });
    }

    const baseFilter = filters.length === 0 ? {} : filters.length === 1 ? filters[0] : { $and: filters };
    const version = await cacheVersion(this.cacheManager, 'products');
    const cacheKey = `products:v${version}:${collectionId ?? 'all'}:${JSON.stringify({
      ...listQuery,
      filter: baseFilter,
    })}`;

    const page = await remember(this.cacheManager, cacheKey, 60 * 1000, () =>
      paginateModel<Product>(this.productModel, baseFilter, listQuery, { populate: 'collection' }),
    );

    return collectionSummary ? { ...page, collection: collectionSummary } : page;
  }

  async findAll(): Promise<Product[]> {
    const page = await this.findPaginated({ page: 1, limit: 100 });
    return page.items;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;

    return remember(this.cacheManager, cacheKey, 60 * 1000, async () => {
      const product = await this.productModel.findById(id).populate('collection');
      return product;
    });
  }


  // ✅ DELETE product
  async deleteProduct(id: string): Promise<{ message: string }> {
    await this.productModel.findByIdAndDelete(id);

    await this.forgetProduct(id);
    await this.invalidateLists();

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

    await this.forgetProduct(id);
    await this.invalidateLists();

    return updatedProduct;
  }

  private async forgetProduct(id: string) {
    try {
      await this.cacheManager.del(`product:${id}`);
    } catch {
      // Le détail sera recalculé à la prochaine lecture.
    }
  }

  private async invalidateLists() {
    try {
      await this.cacheManager.del('products:all');
    } catch {
      // Le numéro de version ci-dessous suffit à ignorer les pages en cache.
    }
    await bumpCacheVersion(this.cacheManager, 'products');
  }

}
