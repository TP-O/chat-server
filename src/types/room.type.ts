export type Room = {
  id: string;
  owner_socket_id: string;
  is_private: boolean;
  password?: string;
  slots: number;
  remaining: number;
};

export type CreateRoomOutput = Pick<Room, 'id' | 'slots' | 'remaining'>;
