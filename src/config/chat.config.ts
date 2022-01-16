import { env } from 'process';

export const chatConfig = {
  port: Number(env.CHAT_PORT || 3000),
};
