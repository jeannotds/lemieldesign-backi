// produit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Collection } from './collection.schema';
import { Caracteristic } from './caracteristic.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  @Prop({ type: [{ url: String, public_id: String }] }) // ⬅️ tableau pour stocker les images Cloudinary
  images: { url: string; public_id: string }[];

  // Référence à une Collection
  @Prop({ type: Types.ObjectId, ref: Collection.name, required: true })
  collection: Collection;

  // Liste de caractéristiques
  // @Prop({ type: [{ type: Types.ObjectId, ref: Caracteristic.name }] })
  // caracteristics: Caracteristic[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
