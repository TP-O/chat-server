import { IsNotEmpty, IsString } from 'class-validator';

export class GroupMessageRequest {
  /**
   * Identify sent message.
   */
  @IsNotEmpty()
  identifier: any;

  /**
   * Message's content.
   */
  @IsString()
  @IsNotEmpty()
  content: string;
}
