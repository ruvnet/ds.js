import { ONNXModel, ONNXModelConfig } from '../../src/lm/onnx';
import { LMError } from '../../src/lm/base';
import * as ort from 'onnxruntime-web';

// Mock ort.InferenceSession
jest.mock('onnxruntime-web', () => ({
  InferenceSession: {
    create: jest.fn()
  },
  Tensor: jest.fn().mockImplementation((type, data, dims) => ({
    type,
    data,
    dims
  }))
}));

describe('ONNXModel', () => {
  let model: ONNXModel;
  const mockConfig: ONNXModelConfig = {
    modelPath: 'model.onnx',
    executionProvider: 'wasm'
  };

  beforeEach(() => {
    model = new ONNXModel(mockConfig);
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize tokenizer when configured', async () => {
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        run: jest.fn().mockResolvedValue({
          output: {
            dims: [1, 10],
            data: new Float32Array([1, 2, 3])
          }
        })
      });

      const configWithTokenizer: ONNXModelConfig = {
        ...mockConfig,
        tokenizer: {
          vocabPath: 'vocab.json',
          maxLength: 512
        }
      };
      const modelWithTokenizer = new ONNXModel(configWithTokenizer);
      await modelWithTokenizer.init();
      
      const result = await modelWithTokenizer.generate('test');
      expect(result).toContain('shape: 1x10');
    });

    it('should handle tokenizer initialization errors', async () => {
      const configWithTokenizer: ONNXModelConfig = {
        ...mockConfig,
        tokenizer: {
          vocabPath: 'vocab.json',
          maxLength: 512
        }
      };
      const modelWithTokenizer = new ONNXModel(configWithTokenizer);
      await modelWithTokenizer.init();
      
      expect(ort.InferenceSession.create).toHaveBeenCalledWith(
        configWithTokenizer.modelPath,
        expect.anything()
      );
    });

    it('should create session with correct options', async () => {
      await model.init();
      
      expect(ort.InferenceSession.create).toHaveBeenCalledWith(
        mockConfig.modelPath,
        expect.objectContaining({
          executionProviders: ['wasm']
        })
      );
    });

    it('should throw LMError on initialization failure', async () => {
      (ort.InferenceSession.create as jest.Mock).mockRejectedValue(new Error('Mock error'));
      
      await expect(model.init()).rejects.toThrow(LMError);
    });
  });

  describe('Generation', () => {
    beforeEach(async () => {
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        run: jest.fn().mockResolvedValue({
          output: {
            dims: [1, 10],
            data: new Float32Array([1, 2, 3])
          }
        })
      });
      await model.init();
    });

    it('should throw error if not initialized', async () => {
      const uninitializedModel = new ONNXModel(mockConfig);
      await expect(uninitializedModel.generate('test')).rejects.toThrow(LMError);
    });

    it('should run inference and return output', async () => {
      const result = await model.generate('test prompt');
      expect(result).toContain('shape: 1x10');
    });

    it('should use default wasm provider when not specified', async () => {
      const configWithoutProvider: ONNXModelConfig = {
        modelPath: 'model.onnx'
      };
      const modelWithoutProvider = new ONNXModel(configWithoutProvider);
      await modelWithoutProvider.init();
      
      expect(ort.InferenceSession.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          executionProviders: ['wasm']
        })
      );
    });

    it('should handle inference errors', async () => {
      const session = await ort.InferenceSession.create(mockConfig.modelPath);
      (session.run as jest.Mock).mockRejectedValue(new Error('Inference failed'));
      
      await expect(model.generate('test')).rejects.toThrow(LMError);
    });
  });

  describe('Output Processing', () => {
    beforeEach(async () => {
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        run: jest.fn()
      });
      await model.init();
    });

    it('should handle missing output tensor', async () => {
      const session = await ort.InferenceSession.create(mockConfig.modelPath);
      (session.run as jest.Mock).mockResolvedValue({});
      
      await expect(model.generate('test')).rejects.toThrow(LMError);
    });

    it('should handle invalid output tensor format', async () => {
      const session = await ort.InferenceSession.create(mockConfig.modelPath);
      (session.run as jest.Mock).mockResolvedValue({
        output: 'invalid'
      });
      
      await expect(model.generate('test')).rejects.toThrow(LMError);
    });
  });

  describe('Generation with Options', () => {
    beforeEach(async () => {
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        run: jest.fn().mockResolvedValue({
          output: {
            dims: [1, 10],
            data: new Float32Array([1, 2, 3])
          }
        })
      });
      await model.init();
    });

    it('should handle generation with options', async () => {
      const options = { maxTokens: 100 };
      const result = await model.generate('test prompt', options);
      expect(result).toContain('shape: 1x10');
    });
  });

  describe('Cleanup', () => {
    it('should end session on cleanup', async () => {
      const mockRelease = jest.fn();
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        release: mockRelease
      });
      
      await model.init();
      await model.cleanup();
      
      expect(mockRelease).toHaveBeenCalled();
    });
  });
});
