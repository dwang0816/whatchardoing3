/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    type ReactNode = any;
    interface FormEvent {
      preventDefault(): void;
    }
    interface ChangeEvent<T = Element> {
      target: T & { value: string };
    }
    
    function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    
    const StrictMode: any;
  }
  
  export const StrictMode: any;
}

declare module 'react-dom/client' {
  export interface Root {
    render(children: any): void;
  }
  export function createRoot(container: Element | null): Root;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'vite' {
  interface UserConfig {
    plugins?: any[];
    [key: string]: any;
  }
  export function defineConfig(config: UserConfig | (() => UserConfig)): UserConfig;
  export = Vite;
  export as namespace Vite;
}

declare module '@vitejs/plugin-react' {
  interface PluginOptions {
    [key: string]: any;
  }
  function react(options?: PluginOptions): any;
  export default react;
  export = ViteReact;
  export as namespace ViteReact;
}

declare module '*.css' {
  const content: any;
  export default content;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  
  type Element = any;
} 