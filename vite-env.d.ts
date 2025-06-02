/// <reference types="vite/client" />
/* eslint-disable @typescript-eslint/no-explicit-any */

declare module 'vite' {
  interface UserConfig {
    plugins?: any[];
    [key: string]: any;
  }
  export function defineConfig(config: UserConfig | (() => UserConfig)): UserConfig;
}

declare module '@vitejs/plugin-react' {
  interface PluginOptions {
    [key: string]: any;
  }
  function react(options?: PluginOptions): any;
  export default react;
} 