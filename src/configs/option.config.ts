import { ConfigModuleOptions } from '@nestjs/config';
import { stateConfig } from './state.config';

export const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  load: [
    () => ({
      state: stateConfig,
    }),
  ],
};
