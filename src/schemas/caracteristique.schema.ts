// caracteristique.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CaracteristiqueDocument = Caracteristique & Document;

@Schema({ timestamps: true })
export class Caracteristique {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  value: string; // ex: "Rouge", "XL", "Coton"
}

export const CaracteristiqueSchema = SchemaFactory.createForClass(Caracteristique);
