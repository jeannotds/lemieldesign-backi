// collection.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
