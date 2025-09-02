import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollectionDto } from 'src/dto/create-collection.dto';
import { Collection, CollectionDocument } from 'src/schemas/collection.schema';

@Injectable()
export class CollectionsService {

    constructor(@InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>){}

    async addCollection(cretaeCollection: CollectionDto){

    const newCollection = new this.collectionModel(cretaeCollection);

    const saveCollection = await newCollection.save()

    return saveCollection;
    
  }


  
  async getCollections(){

    const collection = this.collectionModel.find();
    return collection;
    
  }
  
  
}




