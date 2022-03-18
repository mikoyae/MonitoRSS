import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class UpdateFeedInputFiltersDto {
  @IsString()
  category: string;

  @IsString()
  value: string;
}

export class UpdateFeedInputDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title?: string;

  // @IsString()
  // @IsOptional()
  // channelId?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  webhookId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFeedInputFiltersDto)
  @IsOptional()
  filters?: UpdateFeedInputFiltersDto[];

  @IsOptional()
  @IsBoolean()
  checkTitles?: boolean;

  @IsOptional()
  @IsBoolean()
  checkDates?: boolean;

  @IsOptional()
  @IsBoolean()
  imgPreviews?: boolean;

  @IsOptional()
  @IsBoolean()
  imgLinksExistence?: boolean;

  @IsOptional()
  @IsBoolean()
  formatTables?: boolean;

  @IsOptional()
  @IsBoolean()
  splitMessage?: boolean;
}
