# ONNX Model Example

This example demonstrates how to use ONNX-format language models with DSPy.ts. It shows how to:

- Load and initialize an ONNX model
- Create a text generation module
- Build a processing pipeline
- Generate text using the model

## Features

- ONNX Runtime Web integration
- WebAssembly execution provider
- Configurable model parameters
- Pipeline-based processing
- Resource cleanup handling

## Prerequisites

1. Install dependencies:
   ```bash
   npm install onnxruntime-web
   ```

2. Download an ONNX model:
   ```bash
   # Example: Download a pre-trained model
   curl -O https://example.com/models/text-generation.onnx
   mkdir -p models
   mv text-generation.onnx models/
   ```

## Configuration

Set up environment variables:
```bash
export MODEL_PATH="path/to/your/model.onnx"  # Optional, defaults to models/text-generation.onnx
```

## Usage

1. Basic usage:
   ```typescript
   import { createTextGenerator } from './examples/onnx';

   // Initialize pipeline
   const [pipeline, generator] = await createTextGenerator('models/text-generation.onnx');

   // Generate text
   const result = await pipeline.run({
     text: 'Write a story about...'
   });
   console.log(result.finalOutput.generated);

   // Clean up
   await generator.cleanup();
   ```

2. Advanced configuration:
   ```typescript
   const generator = new TextGeneratorModule({
     modelPath: 'models/text-generation.onnx',
     executionProvider: 'webgl',  // Use GPU acceleration
     maxTokens: 200,
     tokenizer: {
       vocabPath: 'models/tokenizer.json',
       maxLength: 1024
     }
   });

   const pipeline = new Pipeline([generator], {
     stopOnError: true,
     debug: true,
     maxRetries: 3,
     retryDelay: 1000
   });
   ```

3. Pipeline monitoring:
   ```typescript
   const result = await pipeline.run({ text: 'Your prompt' });
   
   // Check success
   console.log('Success:', result.success);
   
   // View step metrics
   result.steps.forEach(step => {
     console.log(`Step: ${step.moduleName}`);
     console.log(`Duration: ${step.duration}ms`);
     console.log(`Output: ${step.output.generated}`);
   });

   // Total duration
   console.log(`Total time: ${result.totalDuration}ms`);
   ```

4. Error handling:
   ```typescript
   try {
     const result = await pipeline.run({ text: 'Your prompt' });
     if (!result.success) {
       console.error('Pipeline error:', result.error);
       console.log('Last successful output:', result.finalOutput);
     }
   } catch (error) {
     console.error('Execution error:', error);
   }
   ```

## Model Configuration

The ONNX model can be configured with different execution providers:

- `wasm`: WebAssembly (default, works everywhere)
- `webgl`: GPU acceleration via WebGL
- `webgpu`: Experimental WebGPU support

Example:
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

## Pipeline Features

The pipeline provides several features:

1. **Error Handling**
   - Configurable error behavior
   - Automatic retries
   - Detailed error reporting

2. **Performance Monitoring**
   - Step-by-step timing
   - Total execution time
   - Resource usage tracking

3. **Debug Mode**
   - Detailed logging
   - Step validation
   - Memory tracking

4. **Resource Management**
   - Automatic cleanup
   - Memory optimization
   - Resource pooling

## Testing

Run the tests:
```bash
npm test tests/examples/onnx.spec.ts
```

The tests cover:
- Model initialization
- Text generation
- Error handling
- Pipeline execution
- Resource cleanup

## Related Resources

- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-web.html)
- [Module Types Guide](../../docs/guides/module-types.md)
- [Pipeline Guide](../../docs/guides/pipeline-guide.md)
- [LM Backends Guide](../../docs/guides/lm-backends.md)
