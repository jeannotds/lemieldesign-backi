// create-produit.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsMongoId, IsArray, IsOptional, ValidateNested } from 'class-validator';

class SizeDto {
  @IsString()
  label: string;

  @IsNotEmpty()
  price: number;
}
export class CreateProduitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description: string;

  // @IsNumber()
  // @Type(() => Number) // ✅ conversion string -> number
  // price: number;


  // ✅ Ajout du tableau des tailles
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  sizes: SizeDto[];

   // Tableau d’images Cloudinary (optionnel)
  @IsArray()
  @IsOptional()
  images?: { url: string; public_id: string }[];

  @IsMongoId()
  collection: string; // ID de la collection choisie

  // @IsArray()
  // @IsMongoId({ each: true })
  // caracteristics: string[]; // Liste d’IDs des caractéristiques
}
