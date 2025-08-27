// create-produit.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsMongoId, IsArray } from 'class-validator';

export class CreateProduitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsMongoId()
  collection: string; // ID de la collection choisie

  @IsArray()
  @IsMongoId({ each: true })
  caracteristics: string[]; // Liste d’IDs des caractéristiques
}
