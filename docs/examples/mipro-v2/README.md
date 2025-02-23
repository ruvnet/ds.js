# MIPROv2 Module Example

This example demonstrates how to use the MIPROv2 (Mixed Initiative PROmpting Version 2) module for advanced text generation with context awareness and confidence scoring.

## Overview

The MIPROv2 module extends our base Module class to provide:
- Context-aware prompt generation
- Confidence scoring for outputs
- Robust error handling
- Integration with any LMDriver

## Usage

```typescript
import { MIPROv2Module } from './mipro-v2-pipeline';
import { DummyLM } from '../../src/lm/dummy';

// Initialize the module with a language model
const model = new DummyLM();
const module = new MIPROv2Module(model);

// Basic usage
const result = await module.run({
  text: "What is machine learning?"
});
console.log(result);
// {
//   result: "Machine learning is...",
//   confidence: 0.65
// }

// With context
const contextResult = await module.run({
  text: "What is machine learning?",
  context: "Explaining AI concepts to beginners"
});
console.log(contextResult);
// {
//   result: "In simple terms, machine learning is...",
//   confidence: 0.72
// }
```

## Configuration

The module includes configurable parameters for confidence scoring:
- `minLength`: Minimum output length (default: 10)
- `maxLength`: Maximum output length (default: 100)
- Confidence ranges from 0.3 to 0.7 based on output length

## Error Handling

The module provides graceful error handling:
```typescript
try {
  const result = await module.run({
    text: "Some input"
  });
} catch (error) {
  // Module will return:
  // {
  //   result: "Error processing input",
  //   confidence: 0
  // }
}
```

## Integration

The module can be integrated with any language model that implements the LMDriver interface:

```typescript
import { ONNXModel } from '../../src/lm/onnx';
import { TorchModel } from '../../src/lm/torch';

// Use with ONNX model
const onnxModel = new ONNXModel();
const onnxModule = new MIPROv2Module(onnxModel);

// Use with PyTorch model
const torchModel = new TorchModel();
const torchModule = new MIPROv2Module(torchModel);
```

## Testing

The module comes with comprehensive tests covering:
- Basic functionality
- Context handling
- Error scenarios
- Confidence scoring

Run the tests with:
```bash
npm test tests/examples/mipro-v2.spec.ts
