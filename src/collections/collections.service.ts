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




import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { cloudinary } from 'config/cloudinary.config';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { Collection, CollectionDocument } from 'src/schemas/collection.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) 
    private collectionModel: Model<CollectionDocument>
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

    return await newCollection.save();
  }

  // --- Récupérer toutes les collections ---
  async getCollections() {
    return this.collectionModel.find();
  }
}
