// Deno standard library modules
declare module "https://deno.land/std@0.220.1/fs/mod.ts" {
  export function ensureDir(path: string): Promise<void>;
  export function writeTextFile(path: string, data: string): Promise<void>;
}

declare module "https://deno.land/std@0.220.1/path/mod.ts" {
  export function join(...paths: string[]): string;
}

// js-pytorch module
declare module "js-pytorch" {
  export namespace torch {
    namespace nn {
      class Module {
        constructor();
        forward(x: any): any;
      }
      
      class Linear {
        constructor(inFeatures: number, outFeatures: number);
        forward(x: any): any;
      }
      
      class ReLU {
        constructor();
        forward(x: any): any;
      }
    }

    function tensor(data: number[], requiresGrad?: boolean): any;
    function save(model: any, path: string): Promise<void>;
  }
}

// Global Deno namespace
declare const Deno: {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
  };
  exit(code?: number): never;
  cwd(): string;
  readTextFile(path: string): Promise<string>;
  writeTextFile(path: string, data: string): Promise<void>;
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, data: Uint8Array): Promise<void>;
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  remove(path: string, options?: { recursive?: boolean }): Promise<void>;
  stat(path: string): Promise<Deno.FileInfo>;
  args: string[];
  stdin: {
    readable: ReadableStream<Uint8Array>;
    read(p: Uint8Array): Promise<number | null>;
    readSync(p: Uint8Array): number | null;
  };
  stdout: {
    writable: WritableStream<Uint8Array>;
    write(p: Uint8Array): Promise<number>;
    writeSync(p: Uint8Array): number;
  };
  stderr: {
    writable: WritableStream<Uint8Array>;
    write(p: Uint8Array): Promise<number>;
    writeSync(p: Uint8Array): number;
  };
};

interface Deno {
  FileInfo: {
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
    size: number;
    mtime: Date | null;
    atime: Date | null;
    birthtime: Date | null;
  };
}

// Import meta
interface ImportMeta {
  url: string;
  main: boolean;
}
