import { Event } from './event.type';

export type ResponseEvent<T> = {
  event: Event;
  data: Response<T>;
};

export type Response<T> = {
  event: Event;
  message?: string;
  data?: T;
};

export type PrivateMessageResponse = {
  identifier: string;
  receiver_id: number;
  message?: string;
};
