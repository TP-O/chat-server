import { Server } from 'socket.io';
import { EmitedEvent, ListenedEvent } from './event.type';
import { PlayerStatus, PublicPlayerInformation } from './player.type';

export type NotificationInput<T> = {
  server: Server;
  to: string | string[];
  event: EmitedEvent;
  notification: Notification<T>;
};

export type Notification<T> = {
  event?: ListenedEvent;
  message?: string;
  data?: T;
};

export type FriendStatusNotification = PublicPlayerInformation | PlayerStatus;

export type MessageNotification = {
  sender_id: number;
  content: string;
};

export type JoinedOrLeftRoomNotification = {
  isJoined: boolean;
  player: {
    id: number;
    username: string;
  };
};
