import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';

export class RoomCreationRequest {
  /**
   * Check if room is private or public.
   */
  @IsBoolean()
  is_private = false;

  /**
   * Number of participants.
   */
  @IsInt()
  @Min(5)
  @Max(23)
  slots: number;

  /**
   * Private room's password
   */
  @IsOptional()
  @IsString()
  @Length(5)
  password?: string;
}
