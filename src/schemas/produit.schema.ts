// produit.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Collection } from './collection.schema';
import { Caracteristique } from './caracteristique.schema';

export type ProduitDocument = Produit & Document;

@Schema({ timestamps: true })
export class Produit {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  price: number;

  // Référence à une Collection
  @Prop({ type: Types.ObjectId, ref: Collection.name, required: true })
  collection: Collection;

  // Liste de caractéristiques
  @Prop({ type: [{ type: Types.ObjectId, ref: Caracteristique.name }] })
  caracteristiques: Caracteristique[];
}

export const ProduitSchema = SchemaFactory.createForClass(Produit);
