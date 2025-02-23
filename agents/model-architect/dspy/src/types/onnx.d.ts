declare module "onnxruntime-web" {
  export class Tensor {
    constructor(type: string, data: any[], dims: number[]);
    data: any;
  }

  export class InferenceSession {
    static create(modelPath: string): Promise<InferenceSession>;
    run(feeds: { [key: string]: Tensor }): Promise<{ [key: string]: Tensor }>;
  }

  export interface SessionOptions {
    executionProviders?: string[];
    graphOptimizationLevel?: "DISABLE_ALL" | "ENABLE_BASIC" | "ENABLE_EXTENDED" | "ENABLE_ALL";
    enableCpuMemArena?: boolean;
    enableMemPattern?: boolean;
    executionMode?: "sequential" | "parallel";
    logId?: string;
    logSeverityLevel?: 0 | 1 | 2 | 3 | 4;
  }
}
