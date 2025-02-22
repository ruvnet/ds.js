# Phase 4: ONNX LM Driver Implementation

## Overview
This phase implements the ONNX Runtime Web integration for DS.js, allowing the framework to run ONNX-format language models directly in JavaScript environments. The ONNXModel driver will handle model loading, tensor preparation, and inference execution.

## Implementation Steps

### 1. ONNX Model Driver (src/lm/onnx.ts)

```typescript
import * as ort from 'onnxruntime-web';
import { LMDriver, GenerationOptions, LMError } from './base';

/**
 * Configuration for the ONNX model
 */
export interface ONNXModelConfig {
  modelPath: string;
  executionProvider?: 'wasm' | 'webgl' | 'webgpu';
  maxTokens?: number;
  tokenizer?: {
    vocabPath: string;
    maxLength: number;
  };
}

/**
 * ONNXModel implements LMDriver to run ONNX-format language models.
 */
export class ONNXModel implements LMDriver {
  private session: ort.InferenceSession | null = null;
  private config: ONNXModelConfig;
  private tokenizer: any = null; // Will be implemented in future phases

  constructor(config: ONNXModelConfig) {
    this.config = config;
  }

  /**
   * Initialize the ONNX model and tokenizer
   */
  public async init(): Promise<void> {
    try {
      // Configure session options
      const sessionOptions: ort.InferenceSession.SessionOptions = {
        executionProviders: [this.config.executionProvider || 'wasm']
      };

      // Create inference session
      this.session = await ort.InferenceSession.create(
        this.config.modelPath,
        sessionOptions
      );

      // Initialize tokenizer if configured
      if (this.config.tokenizer) {
        await this.initializeTokenizer();
      }
    } catch (error) {
      throw new LMError('Failed to initialize ONNX model', error as Error);
    }
  }

  /**
   * Generate text using the ONNX model
   */
  public async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.session) {
      throw new LMError('ONNX model not initialized. Call init() first.');
    }

    try {
      // Convert prompt to input tensor
      const inputTensor = await this.prepareInput(prompt);

      // Run inference
      const outputs = await this.session.run({
        input: inputTensor
      });

      // Process output tensor to text
      return this.processOutput(outputs, options);
    } catch (error) {
      throw new LMError('ONNX model inference failed', error as Error);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.session) {
        // End the session
        await this.session.end();
        this.session = null;
      }
    } catch (error) {
      throw new LMError('Failed to cleanup ONNX model', error as Error);
    }
  }

  /**
   * Initialize the tokenizer (placeholder for future implementation)
   */
  private async initializeTokenizer(): Promise<void> {
    if (!this.config.tokenizer) return;

    // TODO: Implement tokenizer initialization
    // This will be expanded in future phases to handle actual tokenization
    this.tokenizer = {
      encode: (text: string) => new Float32Array([text.length]), // Dummy implementation
      decode: (tokens: Float32Array) => 'Decoded text' // Dummy implementation
    };
  }

  /**
   * Prepare input tensor from prompt text
   */
  private async prepareInput(prompt: string): Promise<ort.Tensor> {
    // For MVP, create a simple tensor from the prompt length
    // This will be replaced with actual tokenization in future phases
    const inputData = new Float32Array([prompt.length]);
    return new ort.Tensor('float32', inputData, [1, 1]);
  }

  /**
   * Process output tensor to text
   */
  private processOutput(outputs: Record<string, ort.Tensor>, options?: GenerationOptions): string {
    // For MVP, return a simple string based on the output tensor
    // This will be replaced with actual detokenization in future phases
    const outputTensor = outputs['output'];
    const shape = outputTensor.dims.join('x');
    return `ONNX model output (shape: ${shape})`;
  }
}
```

### 2. ONNX Utilities (src/utils/onnx-helpers.ts)

```typescript
import * as ort from 'onnxruntime-web';

/**
 * Helper functions for ONNX model operations
 */
export class ONNXUtils {
  /**
   * Validate model metadata
   */
  static validateModelMetadata(session: ort.InferenceSession): void {
    const inputNames = session.inputNames;
    const outputNames = session.outputNames;

    if (!inputNames.length || !outputNames.length) {
      throw new Error('Invalid model: missing input/output names');
    }
  }

  /**
   * Create a tensor from array data
   */
  static createTensor(
    data: number[] | Float32Array,
    dims: number[],
    type: 'float32' | 'int64' = 'float32'
  ): ort.Tensor {
    const arrayData = data instanceof Float32Array ? data : new Float32Array(data);
    return new ort.Tensor(type, arrayData, dims);
  }

  /**
   * Extract data from output tensor
   */
  static extractTensorData(tensor: ort.Tensor): number[] {
    return Array.from(tensor.data as Float32Array);
  }
}
```

## TDD Implementation Steps

### 1. ONNX Model Tests (tests/lm/onnx.spec.ts)

```typescript
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

    it('should handle inference errors', async () => {
      const session = await ort.InferenceSession.create(mockConfig.modelPath);
      (session.run as jest.Mock).mockRejectedValue(new Error('Inference failed'));
      
      await expect(model.generate('test')).rejects.toThrow(LMError);
    });
  });

  describe('Cleanup', () => {
    it('should end session on cleanup', async () => {
      const mockEnd = jest.fn();
      (ort.InferenceSession.create as jest.Mock).mockResolvedValue({
        end: mockEnd
      });
      
      await model.init();
      await model.cleanup();
      
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});
```

### 2. ONNX Utilities Tests (tests/utils/onnx-helpers.spec.ts)

```typescript
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
```

## Implementation Order

1. Start with ONNX utilities:
   - Implement helper functions for tensor operations
   - Write tests for utility functions
   - Verify tensor creation and data extraction

2. Move to ONNXModel implementation:
   - Create the basic model class structure
   - Implement initialization and cleanup
   - Add tensor preparation and output processing
   - Write comprehensive tests

3. Finally, integrate with DS.js:
   - Export ONNXModel in index.ts
   - Test integration with existing modules
   - Verify end-to-end flow

## Commit Guidelines

After each component is implemented and tested:

1. ONNX Utilities:
```bash
git add src/utils/onnx-helpers.ts tests/utils/onnx-helpers.spec.ts
git commit -m "Implement ONNX utility functions with tests"
```

2. ONNXModel Implementation:
```bash
git add src/lm/onnx.ts tests/lm/onnx.spec.ts
git commit -m "Implement ONNXModel driver with comprehensive tests"
```

3. Integration:
```bash
git add src/index.ts
git commit -m "Integrate ONNXModel with DS.js framework"
```

## Success Criteria

- [ ] ONNXModel successfully loads and runs ONNX models
- [ ] Tensor operations work correctly
- [ ] Error handling is robust and informative
- [ ] Memory management (cleanup) works properly
- [ ] Integration with DS.js modules is seamless
- [ ] All tests pass with good coverage
- [ ] Documentation is complete and clear

## Next Steps

Once this phase is complete, proceed to Phase 5 (JS-PyTorch Integration) where we'll implement the TorchModel driver for neural operations using JS-PyTorch.

## Troubleshooting

### Common Issues

1. **ONNX Runtime Issues**
   - Verify WASM files are properly loaded
   - Check execution provider compatibility
   - Monitor memory usage during inference

2. **Tensor Operations**
   - Verify tensor shapes match model expectations
   - Check data type conversions
   - Monitor for memory leaks

3. **Integration Issues**
   - Verify model path resolution
   - Check error propagation
   - Test cleanup on errors

### Version Compatibility

- ONNX Runtime Web: ^1.15.0
- TypeScript: ^4.9.0
- Jest: ^29.0.0
