import { IsEmail, Matches, MinLength } from "class-validator";

export class LoginUserDto {

  @IsEmail({}, { message: 'Email invalide' })
  email: string;
  
  @MinLength(8, { message: 'Le mot de passe doit avoir au moins 8 caractères' })
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Le mot de passe doit contenir au moins un chiffre et un caractère spécial',
  })
  password: string;
}