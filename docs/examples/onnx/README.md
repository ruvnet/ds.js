# ONNX Example

This guide demonstrates how to use ONNX models with DSPy.ts for sentiment analysis.

## Overview

The ONNX example shows how to:
- Load and use ONNX models in DSPy.ts
- Create custom modules for text processing
- Build pipelines for sentiment analysis
- Handle model inputs and outputs
- Manage resources properly

## Prerequisites

1. Install required dependencies:
   ```bash
   npm install onnxruntime-web
   ```

2. Prepare your ONNX model:
   - Convert your model to ONNX format
   - Place it in a `models` directory
   - Include any required tokenizer files

## Implementation

### 1. Create a Custom Module

```typescript
class SentimentModule extends Module<TextInput, SentimentOutput> {
  constructor(modelPath: string) {
    super({
      name: 'SentimentClassifier',
      signature: {
        inputs: [{ name: 'text', type: 'string', required: true }],
        outputs: [
          { name: 'sentiment', type: 'string', required: true },
          { name: 'confidence', type: 'number', required: true }
        ]
      },
      promptTemplate: input => input.text,
      strategy: 'Predict'
    });
    // ... initialization
  }
}
```

### 2. Set Up Feature Extraction

```typescript
private textToFeatures(text: string): Float32Array {
  const words = text.toLowerCase().split(/\s+/);
  const features = new Float32Array(this.features.length);
  
  for (const word of words) {
    const index = this.featureMap.get(word);
    if (index !== undefined) {
      features[index] += 1;
    }
  }

  return features;
}
```

### 3. Handle Model Inference

```typescript
async run(input: TextInput): Promise<SentimentOutput> {
  // Validate input
  this.validateInput(input);

  // Convert to features
  const features = this.textToFeatures(input.text);

  // Run inference
  const result = await this.model.run({
    float_input: features
  });

  // Process output
  const confidence = result.probabilities.cpuData[1];
  const sentiment = confidence > 0.5 ? 'positive' : 'negative';

  return { sentiment, confidence };
}
```

### 4. Create Pipeline

```typescript
const pipeline = new Pipeline([analyzer], {
  stopOnError: true,
  debug: true
});

const result = await pipeline.run({
  text: 'This product is amazing!'
});
```

## Model Output Format

The ONNX model outputs:
```typescript
{
  label: {
    cpuData: { 0: string },
    dataLocation: "cpu",
    type: "int64",
    dims: [1],
    size: 1
  },
  probabilities: {
    cpuData: [number, number], // [negative, positive] probabilities
    dataLocation: "cpu",
    type: "float32",
    dims: [1, 2],
    size: 2
  }
}
```

## Error Handling

The example includes comprehensive error handling:

1. Input Validation
   ```typescript
   if (!input.text || input.text.trim().length === 0) {
     throw new Error('Input text cannot be empty');
   }
   ```

2. Model Errors
   ```typescript
   try {
     const result = await model.run(input);
   } catch (error) {
     throw new Error(`Inference failed: ${error.message}`);
   }
   ```

3. Resource Cleanup
   ```typescript
   async cleanup(): Promise<void> {
     await this.model.cleanup();
   }
   ```

## Testing

The example includes comprehensive tests:

1. Model Initialization
   ```typescript
   test('should initialize pipeline with ONNX model', () => {
     expect(ONNXModel).toHaveBeenCalledWith({
       modelPath: 'test-model.onnx',
       executionProvider: 'wasm'
     });
   });
   ```

2. Inference
   ```typescript
   test('should analyze sentiment using pipeline', async () => {
     const result = await pipeline.run({ text: 'Test input' });
     expect(result.success).toBe(true);
     expect(result.finalOutput.sentiment).toBe('positive');
   });
   ```

## Best Practices

1. Resource Management
   - Always initialize models before use
   - Clean up resources after use
   - Handle initialization failures gracefully

2. Error Handling
   - Validate inputs thoroughly
   - Handle model errors appropriately
   - Provide meaningful error messages

3. Pipeline Integration
   - Use proper module configuration
   - Handle pipeline errors
   - Monitor pipeline performance

## Related Resources

- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/get-started/with-web.html)
- [Module Types Guide](../../guides/module-types.md)
- [Pipeline Guide](../../guides/pipeline-guide.md)
- [LM Backends Guide](../../guides/lm-backends.md)
