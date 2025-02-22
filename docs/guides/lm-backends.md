# DSPy.ts Language Model Backends

## Overview

DSPy.ts supports multiple language model backends through its LMDriver interface. This guide covers the available backends and how to use them effectively.

## Available Backends

### 1. ONNX Runtime Web

Run ONNX-format models directly in the browser or Node.js:

```typescript
import { ONNXModel } from 'dspy.ts';

const model = new ONNXModel({
  modelPath: 'path/to/model.onnx',
  executionProvider: 'wasm',  // or 'webgl', 'webgpu'
  maxTokens: 100
});

await model.init();
configureLM(model);
```

**Features:**
- WebAssembly execution
- GPU acceleration via WebGL/WebGPU
- Offline capability
- Efficient inference

**Use Cases:**
- Local model deployment
- Edge computing
- Privacy-sensitive applications
- Low-latency requirements

### 2. JS-PyTorch

Use JS-PyTorch for neural network operations:

```typescript
import { TorchModel } from 'dspy.ts';

const model = new TorchModel({
  modelPath: 'path/to/model.pt',
  deviceType: 'webgl',  // or 'cpu'
  architecture: {
    inputSize: 768,
    hiddenSize: 512,
    outputSize: 768
  }
});

await model.init();
configureLM(model);
```

**Features:**
- PyTorch-like API
- GPU acceleration via WebGL
- Dynamic computation graphs
- Training capability

**Use Cases:**
- Custom model architectures
- Fine-tuning
- Dynamic neural operations
- Research and experimentation

### 3. DummyLM (Testing)

A mock LM implementation for testing:

```typescript
import { DummyLM } from 'dspy.ts';

const dummyLM = new DummyLM(new Map([
  ['test input', 'test output']
]));

await dummyLM.init();
configureLM(dummyLM);
```

**Features:**
- Deterministic responses
- Custom response mapping
- No external dependencies
- Fast execution

**Use Cases:**
- Unit testing
- Integration testing
- Development and debugging
- CI/CD pipelines

## Configuration

### ONNX Runtime Configuration

```typescript
const model = new ONNXModel({
  modelPath: 'model.onnx',
  executionProvider: 'webgl',
  maxTokens: 100,
  tokenizer: {
    vocabPath: 'tokenizer.json',
    maxLength: 512
  }
});
```

### JS-PyTorch Configuration

```typescript
const model = new TorchModel({
  modelPath: 'model.pt',
  deviceType: 'webgl',
  architecture: {
    inputSize: 768,
    hiddenSize: 512,
    outputSize: 768,
    numLayers: 2
  },
  training: {
    enabled: true,
    learningRate: 0.001
  }
});
```

### DummyLM Configuration

```typescript
const dummyLM = new DummyLM({
  responses: new Map([
    ['input1', 'output1'],
    ['input2', 'output2']
  ]),
  defaultResponse: 'Unknown',
  delay: 100  // ms
});
```

## Performance Optimization

### 1. ONNX Runtime Optimization

```typescript
// Use WebGL for GPU acceleration
const model = new ONNXModel({
  executionProvider: 'webgl',
  optimizationLevel: 3,
  enableProfiling: true
});

// Enable threading for WASM
const model = new ONNXModel({
  executionProvider: 'wasm',
  numThreads: 4,
  enableSIMD: true
});
```

### 2. JS-PyTorch Optimization

```typescript
// Use WebGL backend
const model = new TorchModel({
  deviceType: 'webgl',
  precision: 'float16',
  batchSize: 32
});

// Enable memory optimization
const model = new TorchModel({
  memoryConfig: {
    gcAfterInference: true,
    maxCachedTensors: 100
  }
});
```

### 3. General Optimization Tips

- Choose appropriate execution providers based on hardware
- Use batching when possible
- Enable caching for repeated operations
- Monitor memory usage
- Profile performance regularly

## Error Handling

### 1. ONNX Runtime Errors

```typescript
try {
  await model.init();
} catch (error) {
  if (error instanceof ONNXRuntimeError) {
    if (error.code === 'ERR_WASM_INIT') {
      // Handle WASM initialization error
    } else if (error.code === 'ERR_GPU_NOT_AVAILABLE') {
      // Fall back to CPU
      model.executionProvider = 'wasm';
    }
  }
}
```

### 2. JS-PyTorch Errors

```typescript
try {
  await model.forward(input);
} catch (error) {
  if (error instanceof TorchError) {
    if (error.type === 'OutOfMemory') {
      // Handle memory issues
    } else if (error.type === 'ShapeMismatch') {
      // Handle tensor shape issues
    }
  }
}
```

## Best Practices

### 1. Model Selection

- Choose appropriate model size for target platform
- Consider quantization for smaller models
- Test performance across different devices
- Validate model compatibility

### 2. Resource Management

```typescript
// Clean up resources properly
await model.cleanup();

// Monitor memory usage
const memoryInfo = await model.getMemoryInfo();
if (memoryInfo.used > threshold) {
  await model.gc();
}
```

### 3. Testing Strategy

```typescript
// Test with DummyLM first
const dummyLM = new DummyLM(testCases);
await runTests(dummyLM);

// Then test with real models
const onnxModel = new ONNXModel(config);
await runTests(onnxModel);
```

## Examples

### 1. Basic Text Generation

```typescript
const model = new ONNXModel({
  modelPath: 'gpt2-small.onnx',
  maxTokens: 100
});

const result = await model.generate('Once upon a time');
console.log(result);
```

### 2. Classification Task

```typescript
const model = new TorchModel({
  modelPath: 'classifier.pt',
  architecture: {
    inputSize: 768,
    outputSize: 10
  }
});

const result = await model.generate(
  'Classify this text into categories'
);
console.log(result);
```

### 3. Testing Example

```typescript
const dummyLM = new DummyLM(new Map([
  ['What is 2+2?', 'The answer is 4'],
  ['Who wrote Hamlet?', 'William Shakespeare wrote Hamlet']
]));

const result = await dummyLM.generate('What is 2+2?');
console.log(result);  // "The answer is 4"
```

## Troubleshooting

### Common Issues

1. **ONNX Runtime**
   - WASM not loading
   - GPU not available
   - Memory issues
   - Model compatibility

2. **JS-PyTorch**
   - WebGL initialization
   - Tensor shape mismatches
   - Memory leaks
   - Device compatibility

3. **General**
   - Model loading failures
   - Performance issues
   - Resource cleanup
   - Browser compatibility

### Solutions

1. **WASM Issues**
   ```typescript
   // Check WASM support
   if (!ONNXRuntime.isWasmSupported()) {
     // Fall back to alternative
   }
   ```

2. **GPU Issues**
   ```typescript
   // Check GPU availability
   if (!ONNXRuntime.isGPUAvailable()) {
     // Fall back to CPU
   }
   ```

3. **Memory Issues**
   ```typescript
   // Monitor and cleanup
   setInterval(async () => {
     const info = await model.getMemoryInfo();
     if (info.used > threshold) {
       await model.gc();
     }
   }, 5000);
   ```

## Future Enhancements

1. **Planned Features**
   - WebGPU support
   - Quantization tools
   - Model optimization utilities
   - Advanced caching strategies

2. **Upcoming Backends**
   - WebNN integration
   - WebAssembly SIMD
   - Custom backend support
   - Cloud fallback options

Stay tuned for updates and new features in future releases!
