declare module 'js-pytorch' {
  export namespace torch {
    interface Tensor {
      shape: number[];
      dataSync(): Float32Array;
      forward(x: Tensor): Tensor;
      to(device: any): Tensor;
    }

    namespace nn {
      class Module {
        constructor();
        forward(x: Tensor): Tensor;
        parameters(): any[];
      }

      class Linear extends Module {
        constructor(inFeatures: number, outFeatures: number);
      }

      class ReLU extends Module {
        constructor();
      }
    }

    function tensor(data: number[] | Float32Array, requiresGrad?: boolean): Tensor;
    function save(model: nn.Module, path: string): Promise<void>;
  }
}
