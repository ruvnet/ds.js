// Mock implementation of js-pytorch for testing

export interface Tensor {
  data: number[] | Float32Array;
  requiresGrad: boolean;
  shape: number[];
}

export interface Module {
  forward(x: any): any;
}

export interface Linear extends Module {
  inFeatures: number;
  outFeatures: number;
}

export interface ReLU extends Module {
}

export interface Conv2D extends Module {
  filters: number;
  kernelSize: [number, number];
}

export interface MaxPooling2D extends Module {
  kernelSize: [number, number];
}

export interface Flatten extends Module {
}

export const nn = {
  Module: class implements Module {
    constructor() {}
    forward(x: any): any { return x; }
  },
  Linear: class implements Linear {
    inFeatures: number;
    outFeatures: number;
    constructor(inFeatures: number, outFeatures: number) {
      this.inFeatures = inFeatures;
      this.outFeatures = outFeatures;
    }
    forward(x: any): any { return x; }
  },
  ReLU: class implements ReLU {
    constructor() {}
    forward(x: any): any { return x; }
  },
  Conv2D: class implements Conv2D {
    filters: number;
    kernelSize: [number, number];
    constructor(filters: number, kernelSize: [number, number]) {
      this.filters = filters;
      this.kernelSize = kernelSize;
    }
    forward(x: any): any { return x; }
  },
  MaxPooling2D: class implements MaxPooling2D {
    kernelSize: [number, number];
    constructor(kernelSize: [number, number]) {
      this.kernelSize = kernelSize;
    }
    forward(x: any): any { return x; }
  },
  Flatten: class implements Flatten {
    constructor() {}
    forward(x: any): any { return x; }
  }
};

export const torch = {
  nn,
  tensor: (data: number[] | Float32Array, requiresGrad = false): Tensor => ({
    data,
    requiresGrad,
    shape: Array.isArray(data) ? [data.length] : [data.byteLength / 4]
  }),
  save: async (model: any, path: string): Promise<void> => {
    console.log(`Mock saving model to ${path}`);
    return Promise.resolve();
  }
};
