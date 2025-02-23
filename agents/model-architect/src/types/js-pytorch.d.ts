declare module "js-pytorch" {
  export namespace torch {
    interface Tensor {
      data: number[] | Float32Array;
      shape: number[];
      backward(): void;
      item(): number;
    }

    namespace nn {
      class Module {
        constructor();
        forward(x: Tensor): Tensor;
        parameters(): Parameter[];
        train(): void;
      }

      class Linear extends Module {
        constructor(inFeatures: number, outFeatures: number);
      }

      class ReLU extends Module {
        constructor();
      }

      class Conv2d extends Module {
        constructor(inChannels: number, outChannels: number, kernelSize: [number, number]);
      }

      class MaxPool2d extends Module {
        constructor(kernelSize: [number, number]);
      }

      class BatchNorm2d extends Module {
        constructor(numFeatures: number);
      }

      class Flatten extends Module {
        constructor();
      }

      class Dropout extends Module {
        constructor(p: number);
      }

      class CrossEntropyLoss extends Module {
        constructor();
      }
    }

    namespace utils {
      namespace data {
        class Dataset {
          constructor();
        }

        class DataLoader {
          constructor(dataset: Dataset, options: { batchSize: number; shuffle: boolean });
          [Symbol.iterator](): Iterator<[Tensor, Tensor]>;
        }
      }
    }

    namespace optim {
      class Adam {
        constructor(parameters: Parameter[], learningRate: number);
        zeroGrad(): void;
        step(): void;
      }
    }

    namespace onnx {
      function exportModel(
        model: nn.Module,
        args: Tensor,
        f: string,
        options: {
          input_names: string[];
          output_names: string[];
          dynamic_axes?: Record<string, Record<string, string>>;
        }
      ): Promise<void>;
    }

    interface Parameter extends Tensor {}

    function tensor(data: number[] | Float32Array, requiresGrad?: boolean): Tensor;
    function randn(shape: number[]): Tensor;
  }
}
