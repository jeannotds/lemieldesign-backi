// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { CollectionDto } from 'src/dto/create-collection.dto';
// import { Collection, CollectionDocument } from 'src/schemas/collection.schema';

// @Injectable()
// export class CollectionsService {

//     constructor(@InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>){}

//     async addCollection(cretaeCollection: CollectionDto){

//     const newCollection = new this.collectionModel(cretaeCollection);

//     const saveCollection = await newCollection.save()

//     return saveCollection;
    
//   }


  
//   async getCollections(){

//     const collection = this.collectionModel.find();
//     return collection;
    
//   }
  
  
// }




import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { Collection, CollectionDocument } from 'src/schemas/collection.schema';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { bumpCacheVersion, cacheVersion, remember } from 'src/common/list-cache';
import {
  PaginatedResponse,
  escapeRegex,
  paginateModel,
  parseListQuery,
} from 'src/common/pagination';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) 
    private collectionModel: Model<CollectionDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // --- Upload vers Cloudinary ---
  async uploadToCloudinary(file: Express.Multer.File): Promise<{ url: string; public_id: string }> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: 'collections',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, public_id: result.public_id });
        },
      );
      upload.end(file.buffer);
    });
  }

  // --- Ajouter une collection ---
  async addCollection(createCollection: CollectionDto, file?: Express.Multer.File) {
    let image = {
      url: 'https://res.cloudinary.com/demo/image/upload/v1699999999/collections/empty.png',
      public_id: 'default_empty_image',
    };

    if (file) {
      const uploaded = await this.uploadToCloudinary(file);
      image = uploaded;
    }

    const newCollection = new this.collectionModel({
      ...createCollection,
      image,
    });

    const saved = await newCollection.save();
    await this.invalidateLists();
    return saved;
  }

  async assertExists(id: string): Promise<CollectionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant de collection invalide');
    }
    const collection = await this.collectionModel.findById(id);
    if (!collection) throw new NotFoundException('Collection introuvable');
    return collection;
  }

  async getCollections(rawQuery: Record<string, unknown> = {}): Promise<PaginatedResponse<Collection>> {
    const listQuery = parseListQuery(rawQuery, 'collection');
    const filters: Record<string, unknown>[] = [];

    if (listQuery.q) {
      const rx = new RegExp(escapeRegex(listQuery.q), 'i');
      filters.push({ $or: [{ name: rx }, { description: rx }] });
    }

    const baseFilter = filters.length === 1 ? filters[0] : {};
    const version = await cacheVersion(this.cacheManager, 'collections');
    const cacheKey = `collections:v${version}:${JSON.stringify({ ...listQuery, filter: baseFilter })}`;

    return remember(this.cacheManager, cacheKey, 60 * 1000, () =>
      paginateModel<Collection>(this.collectionModel, baseFilter, listQuery),
    );
  }

  async updateCollection(id: string, dto: CollectionDto, file?: Express.Multer.File): Promise<Collection> {
    const collection = await this.collectionModel.findById(id);
    if (!collection) throw new NotFoundException('Collection not found');

    if (file) {
      collection.image = await this.uploadToCloudinary(file);
    }

    collection.name = dto.name ?? collection.name;
    collection.description = dto.description ?? collection.description;

    const saved = await collection.save();
    await this.invalidateLists();
    return saved;
  }

  async deleteCollection(id: string): Promise<{ message: string }> {
    const collection = await this.collectionModel.findByIdAndDelete(id);
    if (!collection) throw new NotFoundException('Collection not found');
    await this.invalidateLists();
    return { message: 'Collection deleted successfully' };
  }

  private async invalidateLists() {
    await bumpCacheVersion(this.cacheManager, 'collections');
    await bumpCacheVersion(this.cacheManager, 'products');
  }
}
