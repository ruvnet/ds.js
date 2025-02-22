import { ONNXUtils } from '../../src/utils/onnx-helpers';
import * as ort from 'onnxruntime-web';

describe('ONNXUtils', () => {
  describe('validateModelMetadata', () => {
    it('should validate correct metadata', () => {
      const mockSession = {
        inputNames: ['input'],
        outputNames: ['output']
      };
      
      expect(() => ONNXUtils.validateModelMetadata(mockSession as any))
        .not.toThrow();
    });

    it('should throw on invalid metadata', () => {
      const mockSession = {
        inputNames: [],
        outputNames: []
      };
      
      expect(() => ONNXUtils.validateModelMetadata(mockSession as any))
        .toThrow('Invalid model');
    });
  });

  describe('createTensor', () => {
    it('should create tensor from array', () => {
      const tensor = ONNXUtils.createTensor([1, 2, 3], [1, 3]);
      expect(tensor.dims).toEqual([1, 3]);
      expect(Array.from(tensor.data as Float32Array)).toEqual([1, 2, 3]);
    });

    it('should create tensor from Float32Array', () => {
      const data = new Float32Array([1, 2, 3]);
      const tensor = ONNXUtils.createTensor(data, [3]);
      expect(tensor.dims).toEqual([3]);
      expect(tensor.data).toBe(data);
    });
  });

  describe('extractTensorData', () => {
    it('should extract data from tensor', () => {
      const mockTensor = {
        data: new Float32Array([1, 2, 3])
      };
      
      const data = ONNXUtils.extractTensorData(mockTensor as ort.Tensor);
      expect(data).toEqual([1, 2, 3]);
    });
  });
});
