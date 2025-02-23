// Mock implementation of js-pytorch for testing

// Mock implementation of js-pytorch for testing
export const nn = {
  Linear: jest.fn().mockImplementation((inputSize: number, outputSize: number) => ({
    inputSize,
    outputSize,
    forward: jest.fn().mockImplementation(x => x),
    to: jest.fn(),
    eval: jest.fn(),
    copy_: jest.fn()
  })),
  ReLU: jest.fn().mockImplementation(() => ({
    forward: jest.fn().mockImplementation(x => x),
    to: jest.fn(),
    eval: jest.fn()
  }))
};

export const tensor = jest.fn().mockImplementation((data: number[] | Float32Array, options?: { requiresGrad?: boolean }) => ({
  shape: Array.isArray(data) ? [data.length] : [data.byteLength / 4],
  dataSync: jest.fn().mockReturnValue(Array.isArray(data) ? new Float32Array(data) : data),
  add: jest.fn().mockReturnValue(tensor([0])),
  pow: jest.fn().mockReturnValue(tensor([0])),
  sum: jest.fn().mockReturnValue(tensor([0])),
  backward: jest.fn(),
  relu: jest.fn().mockReturnValue(tensor([0])),
  to: jest.fn().mockReturnValue(tensor([0])),
  copy_: jest.fn()
}));

export const device = jest.fn().mockImplementation((type: string) => ({ type }));

export const load = jest.fn().mockImplementation(async (path: string) => ({}));
