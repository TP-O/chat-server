import { Server } from 'socket.io';
import { Event } from './event.type';

export type NotificationInput<T> = {
  server: Server;
  to: string | string[];
  event: Event;
  notification: Notification<T>;
};

export type Notification<T> = {
  event?: Event;
  message?: string;
  data?: T;
};

export type PrivateMessageNotificationData = {
  identifier: string;
  receiver_id: number;
  message?: string;
};

export type RoomCreationNotificationData = {
  room_id: string;
  slots: number;
  remaining: number;
};

export type RoomJoiningNotificationData = {
  room_id: string;
  is_private: boolean;
  slots: number;
  remaining: number;
};
