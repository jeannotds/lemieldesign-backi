// caracteristique.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CaracteristicDocument = Caracteristic & Document;

@Schema({ timestamps: true })
export class Caracteristic {
  @Prop({ required: true })
  name: string;

  // @Prop({ required: true })
  // value: string; // ex: "Rouge", "XL", "Coton"
}

export const CaracteristicSchema = SchemaFactory.createForClass(Caracteristic);
