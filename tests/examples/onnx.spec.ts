import { createSentimentAnalyzer } from '../../examples/onnx';
import { ONNXModel } from '../../src/lm/onnx';
import { Pipeline } from '../../src/core/pipeline';
import * as fs from 'fs';

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('this\nis\ngreat\nterrible\nlove\nhate\nproduct\namazing\nworks\ndisappointed\nquality\n')
}));

// Mock ONNXModel
jest.mock('../../src/lm/onnx', () => ({
  ONNXModel: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    run: jest.fn().mockImplementation(() => 
      Promise.resolve({
        label: {
          cpuData: { 0: "1" },
          dataLocation: "cpu",
          type: "int64",
          dims: [1],
          size: 1
        },
        probabilities: {
          cpuData: [0.3, 0.7],
          dataLocation: "cpu",
          type: "float32",
          dims: [1, 2],
          size: 2
        }
      })),
    cleanup: jest.fn().mockResolvedValue(undefined)
  }))
}));

describe('ONNX Example', () => {
  let pipeline: Pipeline;
  let analyzer: any;

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    [pipeline, analyzer] = await createSentimentAnalyzer('test-model.onnx');
  });

  afterEach(async () => {
    await analyzer.cleanup();
  });

  test('should initialize pipeline with ONNX model', () => {
    expect(ONNXModel).toHaveBeenCalledWith({
      modelPath: 'test-model.onnx',
      executionProvider: 'wasm'
    });
  });

  test('should analyze sentiment using pipeline', async () => {
    const input = { text: 'This is great!' };
    const result = await pipeline.run(input);

    expect(result.success).toBe(true);
    expect(result.finalOutput.sentiment).toBe('positive');
    expect(result.finalOutput.confidence).toBe(0.7);
  });

  test('should handle model initialization', async () => {
    const mockModel = (ONNXModel as jest.Mock).mock.results[0].value;
    expect(mockModel.init).toHaveBeenCalled();
  });

  test('should handle model cleanup', async () => {
    await analyzer.cleanup();
    const mockModel = (ONNXModel as jest.Mock).mock.results[0].value;
    expect(mockModel.cleanup).toHaveBeenCalled();
  });

  test('should convert text to features', async () => {
    const input = { text: 'This is great' };
    await pipeline.run(input);

    const mockModel = (ONNXModel as jest.Mock).mock.results[0].value;
    expect(mockModel.run).toHaveBeenCalledWith({
      float_input: expect.any(Float32Array)
    });

    // Verify feature vector size
    const mockCall = mockModel.run.mock.calls[0][0];
    expect(mockCall.float_input.length).toBe(11); // Number of features from create_onnx_model.py
  });

  test('should handle pipeline errors', async () => {
    const mockModel = (ONNXModel as jest.Mock).mock.results[0].value;
    mockModel.run.mockRejectedValueOnce(new Error('Inference failed: Model error'));

    const input = { text: 'Error test' };
    const result = await pipeline.run(input);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Inference failed: Model error');
  });

  test('should validate input', async () => {
    const input = { text: '' };
    const result = await pipeline.run(input);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('text cannot be empty');
  });

  test('should track pipeline steps', async () => {
    const input = { text: 'Test steps' };
    const result = await pipeline.run(input);

    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].moduleName).toBe('SentimentClassifier');
    expect(result.steps[0].input).toEqual(input);
    expect(result.steps[0].output.sentiment).toBe('positive');
    expect(result.steps[0].duration).toBeGreaterThan(0);
  });
});
