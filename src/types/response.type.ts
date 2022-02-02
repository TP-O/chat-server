import { GroupMessageRequest } from 'src/modules/message/dto/group-message.request';
import { PrivateMessageRequest } from 'src/modules/message/dto/private-message.request';
import { PublicPlayerInformation } from './player.type';
import { CreateRoomOutput, Room } from './room.type';

export type ConnectionResponse = PublicPlayerInformation[];

export type SendPrivateMessageResponse = Omit<PrivateMessageRequest, 'content'>;

export type SendGroupMessageResponse = Omit<GroupMessageRequest, 'content'>;

export type CreateRoomResponse = CreateRoomOutput;

export type JoinRoomResponse = Omit<Room, 'password' | 'owner_socket_id'> & {
  members: {
    id: number;
    username: string;
  }[];
};
