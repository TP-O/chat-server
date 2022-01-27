import { env } from 'process';

export const socketConfig = {
  port: parseInt(env.SOCKET_PORT, 10) || 3000,
};
