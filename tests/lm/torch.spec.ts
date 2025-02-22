import { TorchModel, TorchModelConfig } from '../../src/lm/torch';
import { LMError } from '../../src/lm/base';
import * as torch from 'js-pytorch';

// Mock torch
jest.mock('js-pytorch', () => ({
  device: jest.fn(type => type),
  tensor: jest.fn((data, options) => ({
    shape: [data.length],
    dataSync: () => new Float32Array(data),
    to: jest.fn(device => ({
      shape: [data.length],
      dataSync: () => new Float32Array(data)
    }))
  })),
  load: jest.fn(),
  nn: {
    Linear: jest.fn(() => ({
      forward: jest.fn(x => x),
      to: jest.fn(),
      eval: jest.fn(),
      copy_: jest.fn()
    })),
    ReLU: jest.fn(() => ({
      forward: jest.fn(x => x),
      to: jest.fn(),
      eval: jest.fn()
    }))
  }
}));

describe('TorchModel', () => {
  let model: TorchModel;
  const mockConfig: TorchModelConfig = {
    deviceType: 'cpu',
    architecture: {
      inputSize: 10,
      hiddenSize: 20,
      outputSize: 10
    }
  };

  beforeEach(() => {
    model = new TorchModel(mockConfig);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create model with specified architecture', async () => {
      await model.init();
      expect(torch.nn.Linear).toHaveBeenCalledWith(10, 20);
      expect(torch.nn.Linear).toHaveBeenCalledWith(20, 10);
      expect(torch.nn.ReLU).toHaveBeenCalled();
    });

    it('should throw error without architecture or model path', async () => {
      const invalidModel = new TorchModel({});
      await expect(invalidModel.init()).rejects.toThrow(LMError);
    });

    it('should use WebGL device when specified', async () => {
      const webglModel = new TorchModel({
        ...mockConfig,
        deviceType: 'webgl'
      });
      await webglModel.init();
      expect(torch.device).toHaveBeenCalledWith('webgl');
    });
  });

  describe('Model Loading', () => {
    it('should load pre-trained weights', async () => {
      const modelWithPath = new TorchModel({
        modelPath: 'model.pt',
        deviceType: 'cpu',
        architecture: mockConfig.architecture
      });

      const mockStateDict = {
        '0.weight': torch.tensor([1, 2, 3]),
        '0.bias': torch.tensor([0.1])
      };
      (torch.load as jest.Mock).mockResolvedValue(mockStateDict);

      await modelWithPath.init();
      expect(torch.load).toHaveBeenCalledWith('model.pt');
    });

    it('should throw error if model path is specified but not found', async () => {
      const modelWithPath = new TorchModel({
        modelPath: 'nonexistent.pt',
        deviceType: 'cpu'
      });

      (torch.load as jest.Mock).mockRejectedValue(new Error('File not found'));
      await expect(modelWithPath.init()).rejects.toThrow(LMError);
    });
  });

  describe('Generation', () => {
    beforeEach(async () => {
      await model.init();
    });

    it('should throw error if not initialized', async () => {
      const uninitializedModel = new TorchModel(mockConfig);
      await expect(uninitializedModel.generate('test')).rejects.toThrow(LMError);
    });

    it('should generate output from prompt', async () => {
      const result = await model.generate('test prompt');
      expect(result).toContain('shape:');
      expect(result).toContain('values:');
    });

    it('should handle generation errors gracefully', async () => {
      // Mock a failure in tensor creation
      (torch.tensor as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Tensor creation failed');
      });

      await expect(model.generate('test')).rejects.toThrow(LMError);
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await model.init();
      await model.cleanup();
      
      // Try to generate after cleanup - should fail
      await expect(model.generate('test')).rejects.toThrow(LMError);
    });

    it('should handle cleanup errors gracefully', async () => {
      // Mock global.gc to throw error
      const originalGc = global.gc;
      global.gc = () => { throw new Error('GC failed'); };

      await model.init();
      await expect(model.cleanup()).rejects.toThrow(LMError);

      // Restore original gc
      global.gc = originalGc;
    });
  });
});
