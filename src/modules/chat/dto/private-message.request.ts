import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class PrivateMessageRequest {
  /**
   * Identify sent message.
   */
  @IsNotEmpty()
  identifier: any;

  /**
   * Receiver's id.
   */
  @IsInt()
  @Min(1)
  receiver_id: number;

  /**
   * Message's content.
   */
  @IsString()
  @IsNotEmpty()
  content: string;
}
