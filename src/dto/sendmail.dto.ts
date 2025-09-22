// create-produit.dto.ts
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsNotEmpty, IsMongoId, IsArray, IsOptional, IsEmail } from 'class-validator';

export class SendMailDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  phone: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  html: string;
}
