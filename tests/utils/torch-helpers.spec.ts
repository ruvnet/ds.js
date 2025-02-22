import { TorchUtils } from '../../src/utils/torch-helpers';
import * as torch from 'js-pytorch';

// Mock torch
jest.mock('js-pytorch', () => ({
  tensor: jest.fn((data, options) => ({
    shape: [data.length],
    dataSync: () => new Float32Array(data),
    to: jest.fn(device => ({
      shape: [data.length],
      dataSync: () => new Float32Array(data)
    }))
  })),
  device: jest.fn(type => type)
}));

describe('TorchUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTensor', () => {
    it('should create tensor with default options', () => {
      const data = [1, 2, 3];
      const tensor = TorchUtils.createTensor(data);
      
      expect(torch.tensor).toHaveBeenCalledWith(data, {
        requiresGrad: false
      });
      expect(tensor.shape).toEqual([3]);
    });

    it('should create tensor with custom options', () => {
      const data = [1, 2, 3];
      const tensor = TorchUtils.createTensor(data, { requiresGrad: true });
      
      expect(torch.tensor).toHaveBeenCalledWith(data, {
        requiresGrad: true
      });
    });

    it('should handle Float32Array input', () => {
      const data = new Float32Array([1, 2, 3]);
      const tensor = TorchUtils.createTensor(data);
      
      expect(torch.tensor).toHaveBeenCalledWith([1, 2, 3], {
        requiresGrad: false
      });
    });
  });

  describe('toDevice', () => {
    it('should move tensor to specified device', () => {
      const tensor = TorchUtils.createTensor([1, 2, 3]);
      const deviceTensor = TorchUtils.toDevice(tensor, 'webgl');
      
      expect(torch.device).toHaveBeenCalledWith('webgl');
      expect(tensor.to).toHaveBeenCalled();
    });
  });

  describe('extractTensorData', () => {
    it('should extract data from tensor', () => {
      const data = [1, 2, 3];
      const tensor = TorchUtils.createTensor(data);
      const extracted = TorchUtils.extractTensorData(tensor);
      
      expect(extracted).toEqual(data);
    });
  });

  describe('calculateTensorMemory', () => {
    it('should calculate memory usage for tensor', () => {
      const tensor = TorchUtils.createTensor([1, 2, 3, 4]);
      const memory = TorchUtils.calculateTensorMemory(tensor);
      
      // 4 elements * 4 bytes (float32)
      expect(memory).toBe(16);
    });

    it('should handle multi-dimensional tensors', () => {
      const mockTensor = {
        shape: [2, 3],
        dataSync: () => new Float32Array(6)
      };
      const memory = TorchUtils.calculateTensorMemory(mockTensor as any);
      
      // 2 * 3 = 6 elements * 4 bytes
      expect(memory).toBe(24);
    });
  });
});
