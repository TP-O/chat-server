import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class PrivateMessageBody {
  @IsInt()
  @Min(1)
  receiver_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
