import {
  IsBoolean,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
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
  @ValidateIf((c) => c.is_private)
  @IsString()
  @Length(5)
  password?: string;
}
