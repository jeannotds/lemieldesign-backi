import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CollectionDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

   // ✅ Une seule image (objet avec url et public_id)
  @IsOptional()
  image?: {
    url: string;
    public_id: string;
  };

}