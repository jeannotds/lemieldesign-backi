// create-produit.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsMongoId, IsArray } from 'class-validator';

export class CreateCaracteristicDto {

  @IsString()
  @IsNotEmpty()
  name: string;

}
