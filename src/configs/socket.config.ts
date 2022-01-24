import { env } from 'process';

export const socketConfig = {
  port: Number(env.CHAT_PORT || 3000),
  branch: {
    id2Sid: 'socket:ids:',
    sid2Id: 'socket:sids:',
  },
};
