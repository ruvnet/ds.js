// Mock implementation of js-pytorch for testing

interface Tensor {
  data: number[] | Float32Array;
  shape: number[];
  backward(): void;
  item(): number;
}

interface Parameter extends Tensor {}

class Module {
  constructor() {}
  forward(x: Tensor): Tensor { return x; }
  parameters(): Parameter[] { return []; }
  train(): void {}
}

class Linear extends Module {
  inFeatures: number;
  outFeatures: number;
  constructor(inFeatures: number, outFeatures: number) {
    super();
    this.inFeatures = inFeatures;
    this.outFeatures = outFeatures;
  }
}

class ReLU extends Module {
  constructor() { super(); }
}

class Conv2d extends Module {
  constructor(inChannels: number, outChannels: number, kernelSize: [number, number]) {
    super();
  }
}

class MaxPool2d extends Module {
  constructor(kernelSize: [number, number]) {
    super();
  }
}

class BatchNorm2d extends Module {
  constructor(numFeatures: number) {
    super();
  }
}

class Flatten extends Module {
  constructor() { super(); }
}

class Dropout extends Module {
  constructor(p: number) {
    super();
  }
}

class CrossEntropyLoss extends Module {
  constructor() { super(); }
  override forward(x: Tensor, targets?: Tensor): Tensor {
    return {
      data: [0],
      shape: [1],
      backward: () => {},
      item: () => 0
    };
  }
}

class Dataset {
  constructor() {}
}

class DataLoader {
  constructor(dataset: Dataset, options: { batchSize: number; shuffle: boolean }) {}
  *[Symbol.iterator](): Iterator<[Tensor, Tensor]> {
    yield [
      { data: [0], shape: [1], backward: () => {}, item: () => 0 },
      { data: [0], shape: [1], backward: () => {}, item: () => 0 }
    ];
  }
}

class Adam {
  constructor(parameters: Parameter[], learningRate: number) {}
  zeroGrad(): void {}
  step(): void {}
}

const nn = {
  Module,
  Linear,
  ReLU,
  Conv2d,
  MaxPool2d,
  BatchNorm2d,
  Flatten,
  Dropout,
  CrossEntropyLoss,
  // Aliases for compatibility
  Conv2D: Conv2d,
  MaxPooling2D: MaxPool2d
};

const utils = {
  data: {
    Dataset,
    DataLoader
  }
};

const optim = {
  Adam
};

const onnx = {
  exportModel: async (
    model: Module,
    args: Tensor,
    f: string,
    options: {
      input_names: string[];
      output_names: string[];
      dynamic_axes?: Record<string, Record<string, string>>;
    }
  ): Promise<void> => {
    console.log(`Mock saving model to ${f}`);
    return Promise.resolve();
  }
};

function tensor(data: number[] | Float32Array, requiresGrad = false): Tensor {
  return {
    data,
    shape: Array.isArray(data) ? [data.length] : [data.byteLength / 4],
    backward: () => {},
    item: () => 0
  };
}

function randn(shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  return tensor(new Array(size).fill(0).map(() => Math.random()));
}

async function save(model: Module, path: string): Promise<void> {
  console.log(`Mock saving model to ${path}`);
  return Promise.resolve();
}

export const torch = {
  nn,
  utils,
  optim,
  onnx,
  tensor,
  randn,
  save
};
