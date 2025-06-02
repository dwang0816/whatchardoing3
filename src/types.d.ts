/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'react' {
  export = React;
  export as namespace React;
  
  namespace React {
    type ReactNode = any;
    interface FormEvent {
      preventDefault(): void;
    }
    
    function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  }
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
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  export default function react(options?: any): any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  
  type Element = any;
} 