import { IsArray, IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsBoolean()
  emailVerified: boolean;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsArray()
  role: string[];

  @IsOptional()
  @IsBoolean()
  banned: boolean;
}
