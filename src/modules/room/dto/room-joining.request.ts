import { IsOptional, IsString, Length } from 'class-validator';
import { stateConfig } from 'src/configs/state.config';

export class RoomJoiningRequest {
  /**
   * Room's id.
   */
  @IsString()
  @Length(stateConfig.roomIdLength)
  room_id: string;

  /**
   * Private room's password
   */
  @IsOptional()
  @IsString()
  @Length(5)
  password?: string;
}
