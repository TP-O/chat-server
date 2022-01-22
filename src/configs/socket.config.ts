import { env } from 'process';

export const socketConfig = {
  port: Number(env.CHAT_PORT || 3000),
  cacheKeys: {
    ID_MAP_SOCKET_ID: 'socket:ids:',
    SOCKET_ID_MAP_ID: 'socket:sids:',
  },
};
