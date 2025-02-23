declare namespace Deno {
  export interface Command {
    output(): Promise<{
      code: number;
      stdout: Uint8Array;
      stderr: Uint8Array;
    }>;
  }

  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };

  export const args: string[];
  export const stdin: {
    readonly readable: ReadableStream<Uint8Array>;
    read(p: Uint8Array): Promise<number | null>;
    readSync(p: Uint8Array): number | null;
  };

  export function mkdir(path: string | URL, options?: { recursive?: boolean }): Promise<void>;
  export function writeTextFile(path: string | URL, data: string): Promise<void>;
  export function readTextFile(path: string | URL): Promise<string>;
  export function remove(path: string | URL, options?: { recursive?: boolean }): Promise<void>;
  export function stat(path: string | URL): Promise<Deno.FileInfo>;
  export function exit(code?: number): never;

  export const Command: {
    new (command: string, options?: {
      args?: string[];
      cwd?: string;
      env?: { [key: string]: string };
      stdout?: "inherit" | "piped" | "null";
      stderr?: "inherit" | "piped" | "null";
    }): Command;
  };

  export interface FileInfo {
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
    size: number;
    mtime: Date | null;
    atime: Date | null;
    birthtime: Date | null;
    dev: number | null;
    ino: number | null;
    mode: number | null;
    nlink: number | null;
    uid: number | null;
    gid: number | null;
    rdev: number | null;
    blksize: number | null;
    blocks: number | null;
  }
}

declare interface ImportMeta {
  url: string;
  main: boolean;
  resolve(specifier: string): string;
}

declare module "https://deno.land/std@0.192.0/http/server.ts" {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: (request: Request) => Response | Promise<Response>;
  }

  export function serve(handler: (request: Request) => Response | Promise<Response>, init?: ServeInit): void;
}
