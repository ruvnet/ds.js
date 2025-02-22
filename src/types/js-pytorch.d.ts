declare module 'js-pytorch' {
  interface TensorOptions {
    requiresGrad?: boolean;
  }

  interface Tensor {
    shape: number[];
    dataSync(): Float32Array;
    add(value: number | Tensor): Tensor;
    pow(value: number): Tensor;
    sum(): Tensor;
    backward(): void;
    relu(): Tensor;
    to(device: any): Tensor;
  }

  interface Module {
    forward(input: Tensor): Tensor;
    to(device: any): void;
    eval(): void;
  }

  interface Linear extends Module {
    new(inputSize: number, outputSize: number): Linear;
    copy_: (value: any) => void;
  }

  interface ReLU extends Module {
    new(): ReLU;
  }

  interface NN {
    Module: typeof Module;
    Linear: Linear;
    ReLU: ReLU;
  }

  // Mock support for testing
  interface MockTensor extends Tensor {
    copy_: (value: any) => void;
  }

  interface MockModule extends Module {
    copy_: (value: any) => void;
  }

  export const tensor: (data: number[] | Float32Array, options?: TensorOptions) => MockTensor;
  export const device: (type: string) => any;
  export const nn: NN;
  export const load: (path: string) => Promise<any>;

  // Add support for jest.mock
  export interface JestMockModule {
    device: jest.Mock;
    tensor: jest.Mock;
    load: jest.Mock;
    nn: {
      Linear: jest.Mock;
      ReLU: jest.Mock;
    };
  }
}
