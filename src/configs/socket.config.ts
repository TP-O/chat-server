import { env } from 'process';

export const socketConfig = {
  port: parseInt(env.CHAT_PORT, 10) || 3000,
  branch: {
    id2Sid: 'socket:ids:',
    sid2Id: 'socket:sids:',
  },
};
