declare module 'npm:onnxruntime-web' {
  export class InferenceSession {
    static create(modelPath: string): Promise<InferenceSession>;
    run(feeds: { [key: string]: Tensor }): Promise<{ [key: string]: Tensor }>;
  }

  export class Tensor {
    constructor(type: string, data: any[], dims: number[]);
    data: any;
  }
}
