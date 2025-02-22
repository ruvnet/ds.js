# Phase 5: JS-PyTorch Integration

## Overview
This phase implements the TorchModel driver using JS-PyTorch, enabling neural network operations directly in JavaScript. While the ONNX driver handles pre-trained models, the TorchModel allows for dynamic tensor operations and potential fine-tuning capabilities.

## Implementation Steps

### 1. Torch Model Driver (src/lm/torch.ts)

```typescript
import * as torch from 'js-pytorch';
import { LMDriver, GenerationOptions, LMError } from './base';

/**
 * Configuration for the Torch model
 */
export interface TorchModelConfig {
  modelPath?: string;  // Path to saved weights (optional)
  deviceType?: 'cpu' | 'webgl';
  architecture?: {
    inputSize: number;
    hiddenSize: number;
    outputSize: number;
    numLayers?: number;
  };
}

/**
 * TorchModel implements LMDriver using JS-PyTorch.
 * This implementation can either load pre-trained weights or
 * create a new model using the specified architecture.
 */
export class TorchModel implements LMDriver {
  private model: any = null;  // Will hold the PyTorch model
  private config: TorchModelConfig;
  private device: any;  // torch.Device

  constructor(config: TorchModelConfig) {
    this.config = config;
  }

  /**
   * Initialize the Torch model
   */
  public async init(): Promise<void> {
    try {
      // Set up device
      this.device = this.config.deviceType === 'webgl' 
        ? torch.device('webgl')
        : torch.device('cpu');

      if (this.config.modelPath) {
        // Load pre-trained model
        await this.loadModel();
      } else if (this.config.architecture) {
        // Create new model with specified architecture
        await this.createModel();
      } else {
        throw new LMError('Either modelPath or architecture must be specified');
      }
    } catch (error) {
      throw new LMError('Failed to initialize Torch model', error as Error);
    }
  }

  /**
   * Generate output using the Torch model
   */
  public async generate(prompt: string, options?: GenerationOptions): Promise<string> {
    if (!this.model) {
      throw new LMError('Torch model not initialized. Call init() first.');
    }

    try {
      // Convert prompt to tensor
      const inputTensor = await this.prepareInput(prompt);

      // Move input to correct device
      const deviceInput = inputTensor.to(this.device);

      // Run forward pass
      const output = await this.model.forward(deviceInput);

      // Process output tensor to text
      return this.processOutput(output, options);
    } catch (error) {
      throw new LMError('Torch model inference failed', error as Error);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.model) {
        // Clear model from memory
        this.model = null;
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
    } catch (error) {
      throw new LMError('Failed to cleanup Torch model', error as Error);
    }
  }

  /**
   * Load a pre-trained model from path
   */
  private async loadModel(): Promise<void> {
    if (!this.config.modelPath) {
      throw new LMError('Model path not specified');
    }

    try {
      // Load state dict
      const stateDict = await torch.load(this.config.modelPath);
      
      // Create model and load weights
      this.model = new SimpleTransformer(this.config.architecture);
      this.model.load_state_dict(stateDict);
      
      // Move model to device
      this.model.to(this.device);
      this.model.eval();  // Set to evaluation mode
    } catch (error) {
      throw new LMError('Failed to load model from path', error as Error);
    }
  }

  /**
   * Create a new model with specified architecture
   */
  private async createModel(): Promise<void> {
    if (!this.config.architecture) {
      throw new LMError('Model architecture not specified');
    }

    try {
      // Create new model instance
      this.model = new SimpleTransformer(this.config.architecture);
      
      // Move to device
      this.model.to(this.device);
      this.model.eval();
    } catch (error) {
      throw new LMError('Failed to create model', error as Error);
    }
  }

  /**
   * Prepare input tensor from prompt text
   */
  private async prepareInput(prompt: string): Promise<torch.Tensor> {
    // For MVP, create a simple tensor from the prompt length
    // This will be replaced with actual tokenization in future phases
    return torch.tensor([prompt.length], {
      dtype: torch.float32
    });
  }

  /**
   * Process output tensor to text
   */
  private processOutput(output: torch.Tensor, options?: GenerationOptions): string {
    // For MVP, return a simple string based on the output tensor
    // This will be replaced with actual detokenization in future phases
    const shape = output.shape.join('x');
    const data = Array.from(output.data());
    return `Torch model output (shape: ${shape}, values: ${data.join(', ')})`;
  }
}

/**
 * Simple transformer model implementation
 * This is a basic implementation for MVP - can be expanded later
 */
class SimpleTransformer {
  private layers: any[];

  constructor(config: TorchModelConfig['architecture']) {
    if (!config) throw new Error('Architecture config required');

    const {
      inputSize,
      hiddenSize,
      outputSize,
      numLayers = 1
    } = config;

    // Create a simple feed-forward network
    this.layers = [
      torch.nn.Linear(inputSize, hiddenSize),
      torch.nn.ReLU(),
      ...Array(numLayers - 1).fill(null).map(() => [
        torch.nn.Linear(hiddenSize, hiddenSize),
        torch.nn.ReLU()
      ]).flat(),
      torch.nn.Linear(hiddenSize, outputSize)
    ];
  }

  forward(x: torch.Tensor): torch.Tensor {
    let output = x;
    for (const layer of this.layers) {
      output = layer.forward(output);
    }
    return output;
  }

  to(device: any): void {
    this.layers.forEach(layer => {
      if (layer.to) layer.to(device);
    });
  }

  eval(): void {
    this.layers.forEach(layer => {
      if (layer.eval) layer.eval();
    });
  }

  load_state_dict(stateDict: any): void {
    // Implementation for loading weights
    // This is a simplified version - real implementation would need to match state dict keys
    Object.entries(stateDict).forEach(([key, value]) => {
      const [layerIdx, param] = key.split('.');
      if (this.layers[parseInt(layerIdx)][param]) {
        this.layers[parseInt(layerIdx)][param].copy_(value);
      }
    });
  }
}
```

### 2. Torch Utilities (src/utils/torch-helpers.ts)

```typescript
import * as torch from 'js-pytorch';

/**
 * Helper functions for Torch model operations
 */
export class TorchUtils {
  /**
   * Create a tensor from array data
   */
  static createTensor(
    data: number[] | Float32Array,
    options?: {
      dtype?: any;
      device?: any;
      requiresGrad?: boolean;
    }
  ): torch.Tensor {
    const tensorOptions = {
      dtype: options?.dtype || torch.float32,
      device: options?.device || 'cpu',
      requiresGrad: options?.requiresGrad || false
    };

    return torch.tensor(Array.from(data), tensorOptions);
  }

  /**
   * Move tensor to specified device
   */
  static toDevice(tensor: torch.Tensor, device: 'cpu' | 'webgl'): torch.Tensor {
    return tensor.to(torch.device(device));
  }

  /**
   * Extract data from tensor
   */
  static extractTensorData(tensor: torch.Tensor): number[] {
    return Array.from(tensor.data());
  }

  /**
   * Calculate memory usage of tensor
   */
  static calculateTensorMemory(tensor: torch.Tensor): number {
    const numel = tensor.numel();
    const bytesPerElement = tensor.element_size();
    return numel * bytesPerElement;
  }
}
```

## TDD Implementation Steps

### 1. Torch Model Tests (tests/lm/torch.spec.ts)

```typescript
import { TorchModel, TorchModelConfig } from '../../src/lm/torch';
import { LMError } from '../../src/lm/base';
import * as torch from 'js-pytorch';

// Mock torch
jest.mock('js-pytorch', () => ({
  device: jest.fn(type => type),
  tensor: jest.fn((data) => ({
    to: jest.fn(),
    data: () => new Float32Array(data),
    shape: [1, data.length]
  })),
  load: jest.fn(),
  nn: {
    Linear: jest.fn(() => ({
      forward: jest.fn(x => x),
      to: jest.fn(),
      eval: jest.fn()
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
    });

    it('should throw error without architecture or model path', async () => {
      const invalidModel = new TorchModel({});
      await expect(invalidModel.init()).rejects.toThrow(LMError);
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

    it('should run forward pass and return output', async () => {
      const result = await model.generate('test prompt');
      expect(result).toContain('shape:');
      expect(result).toContain('values:');
    });
  });

  describe('Model Loading', () => {
    it('should load pre-trained weights', async () => {
      const modelWithPath = new TorchModel({
        modelPath: 'model.pt',
        deviceType: 'cpu'
      });

      (torch.load as jest.Mock).mockResolvedValue({
        'layer.weight': torch.tensor([1, 2, 3])
      });

      await modelWithPath.init();
      expect(torch.load).toHaveBeenCalledWith('model.pt');
    });
  });
});
```

### 2. Torch Utilities Tests (tests/utils/torch-helpers.spec.ts)

```typescript
import { TorchUtils } from '../../src/utils/torch-helpers';
import * as torch from 'js-pytorch';

jest.mock('js-pytorch');

describe('TorchUtils', () => {
  describe('createTensor', () => {
    it('should create tensor with default options', () => {
      const data = [1, 2, 3];
      TorchUtils.createTensor(data);
      
      expect(torch.tensor).toHaveBeenCalledWith(data, {
        dtype: torch.float32,
        device: 'cpu',
        requiresGrad: false
      });
    });

    it('should create tensor with custom options', () => {
      const data = [1, 2, 3];
      TorchUtils.createTensor(data, {
        dtype: torch.float64,
        device: 'webgl',
        requiresGrad: true
      });
      
      expect(torch.tensor).toHaveBeenCalledWith(data, {
        dtype: torch.float64,
        device: 'webgl',
        requiresGrad: true
      });
    });
  });

  describe('toDevice', () => {
    it('should move tensor to specified device', () => {
      const mockTensor = {
        to: jest.fn()
      };
      
      TorchUtils.toDevice(mockTensor as any, 'webgl');
      expect(torch.device).toHaveBeenCalledWith('webgl');
      expect(mockTensor.to).toHaveBeenCalled();
    });
  });

  describe('extractTensorData', () => {
    it('should extract data from tensor', () => {
      const mockTensor = {
        data: () => new Float32Array([1, 2, 3])
      };
      
      const data = TorchUtils.extractTensorData(mockTensor as any);
      expect(data).toEqual([1, 2, 3]);
    });
  });

  describe('calculateTensorMemory', () => {
    it('should calculate memory usage', () => {
      const mockTensor = {
        numel: () => 100,
        element_size: () => 4
      };
      
      const memory = TorchUtils.calculateTensorMemory(mockTensor as any);
      expect(memory).toBe(400); // 100 elements * 4 bytes
    });
  });
});
```

## Implementation Order

1. Start with Torch utilities:
   - Implement helper functions for tensor operations
   - Write tests for utility functions
   - Verify tensor creation and manipulation

2. Move to TorchModel implementation:
   - Create the basic model class structure
   - Implement model creation and loading
   - Add forward pass and output processing
   - Write comprehensive tests

3. Finally, integrate with DS.js:
   - Export TorchModel in index.ts
   - Test integration with existing modules
   - Verify end-to-end flow

## Commit Guidelines

After each component is implemented and tested:

1. Torch Utilities:
```bash
git add src/utils/torch-helpers.ts tests/utils/torch-helpers.spec.ts
git commit -m "Implement Torch utility functions with tests"
```

2. TorchModel Implementation:
```bash
git add src/lm/torch.ts tests/lm/torch.spec.ts
git commit -m "Implement TorchModel driver with comprehensive tests"
```

3. Integration:
```bash
git add src/index.ts
git commit -m "Integrate TorchModel with DS.js framework"
```

## Success Criteria

- [ ] TorchModel successfully creates and runs neural networks
- [ ] Model loading works for pre-trained weights
- [ ] Tensor operations work correctly
- [ ] Device management (CPU/WebGL) functions properly
- [ ] Memory management is efficient
- [ ] All tests pass with good coverage
- [ ] Documentation is complete and clear

## Next Steps

Once this phase is complete, proceed to Phase 6 (Module Implementations & Pipeline Orchestration) where we'll implement concrete module types and chain them together.

## Troubleshooting

### Common Issues

1. **Memory Management**
   - Monitor tensor allocations
   - Ensure proper cleanup of unused tensors
   - Watch for memory leaks in long-running operations

2. **Device Issues**
   - Verify WebGL support in environment
   - Check tensor device placement
   - Monitor GPU memory usage

3. **Model Loading**
   - Verify weight file format
   - Check architecture compatibility
   - Handle loading errors gracefully

### Version Compatibility

- JS-PyTorch: ^0.7.2
- TypeScript: ^4.9.0
- Jest: ^29.0.0
