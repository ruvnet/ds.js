# Getting Started with DSPy.ts

## Introduction

DSPy.ts is a TypeScript port of DSPy, bringing declarative language model programming to the TypeScript ecosystem. This guide will help you get started with using DSPy.ts in your projects.

## Installation

Install DSPy.ts and its dependencies:

```bash
npm install dspy.ts onnxruntime-web js-pytorch
```

## Basic Concepts

DSPy.ts is built around three core concepts:

1. **Modules**: Reusable components that define input/output behavior
2. **Language Models**: Backends that perform the actual text generation
3. **Pipelines**: Chains of modules that work together

## Quick Start

### 1. Configure a Language Model

```typescript
import { configureLM, ONNXModel } from 'dspy.ts';

// For development, you can start with a local ONNX model
const model = new ONNXModel({
  modelPath: 'path/to/model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);
```

### 2. Define a Module

```typescript
import { defineModule } from 'dspy.ts';

const sentimentModule = defineModule<
  { text: string },
  { sentiment: string; confidence: number }
>({
  name: 'SentimentAnalyzer',
  signature: {
    inputs: [
      { name: 'text', type: 'string', description: 'Text to analyze' }
    ],
    outputs: [
      { name: 'sentiment', type: 'string', description: 'Predicted sentiment' },
      { name: 'confidence', type: 'number', description: 'Confidence score' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Analyze the sentiment of the following text and provide a sentiment label (positive/negative/neutral) with confidence score:\n"${text}"`
});
```

### 3. Use the Module

```typescript
const result = await sentimentModule.run({
  text: 'I absolutely love this product! Best purchase ever.'
});

console.log(result);
// {
//   sentiment: 'positive',
//   confidence: 0.95
// }
```

## Creating a Pipeline

Combine multiple modules to create more complex workflows:

```typescript
import { Pipeline } from 'dspy.ts';

// Define modules
const contextModule = defineModule<{ question: string }, { context: string }>({
  name: 'ContextRetriever',
  signature: {
    inputs: [{ name: 'question', type: 'string' }],
    outputs: [{ name: 'context', type: 'string' }]
  },
  promptTemplate: ({ question }) => `Find relevant information for: "${question}"`
});

const answerModule = defineModule<
  { question: string; context: string },
  { answer: string }
>({
  name: 'AnswerGenerator',
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'context', type: 'string' }
    ],
    outputs: [{ name: 'answer', type: 'string' }]
  },
  promptTemplate: ({ question, context }) =>
    `Question: "${question}"\nContext: "${context}"\nAnswer:`
});

// Create pipeline
const pipeline = new Pipeline(
  [contextModule, answerModule],
  { stopOnError: true, debug: true }
);

// Run pipeline
const result = await pipeline.run({
  question: 'What is the capital of France?'
});

console.log(result.finalOutput.answer);
```

## Common Use Cases

### 1. Text Classification

```typescript
const classifier = defineModule<
  { text: string },
  { category: string; confidence: number }
>({
  name: 'TextClassifier',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [
      { name: 'category', type: 'string' },
      { name: 'confidence', type: 'number' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Classify the following text into categories (news/sports/tech/entertainment):\n"${text}"`
});
```

### 2. Content Generation

```typescript
const generator = defineModule<
  { topic: string; style: string },
  { content: string }
>({
  name: 'ContentGenerator',
  signature: {
    inputs: [
      { name: 'topic', type: 'string' },
      { name: 'style', type: 'string' }
    ],
    outputs: [{ name: 'content', type: 'string' }]
  },
  promptTemplate: ({ topic, style }) =>
    `Generate ${style} content about: ${topic}`
});
```

### 3. Data Extraction

```typescript
const extractor = defineModule<
  { text: string },
  { entities: Record<string, string> }
>({
  name: 'EntityExtractor',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'entities', type: 'object' }]
  },
  promptTemplate: ({ text }) =>
    `Extract key entities (people, places, dates) from:\n"${text}"`
});
```

## Error Handling

DSPy.ts provides comprehensive error handling:

```typescript
try {
  const result = await module.run(input);
} catch (error) {
  if (error instanceof LMError) {
    console.error('Language model error:', error.message);
  } else if (error instanceof ModuleError) {
    console.error('Module error:', error.message);
  }
}
```

## Debugging

Enable debug mode in pipelines for detailed logging:

```typescript
const pipeline = new Pipeline(modules, {
  debug: true,
  stopOnError: false,
  maxRetries: 2
});
```

## Best Practices

1. **Type Safety**
   - Use TypeScript for better type checking
   - Define clear input/output signatures
   - Validate data at runtime

2. **Module Design**
   - Keep modules focused and single-purpose
   - Use clear, descriptive names
   - Document input/output requirements

3. **Error Handling**
   - Always handle potential errors
   - Use appropriate retry strategies
   - Provide meaningful error messages

4. **Testing**
   - Use DummyLM for testing
   - Write unit tests for modules
   - Test error cases

## Next Steps

- Learn about different [Module Types](module-types.md)
- Explore [Pipeline Features](pipeline-guide.md)
- Check out [Examples](../examples/README.md)
- Read the full [API Reference](../api/README.md)

## Troubleshooting

### Common Issues

1. **Model Loading**
   - Ensure ONNX model path is correct
   - Check WebAssembly support in browser
   - Verify model format compatibility

2. **Type Errors**
   - Check input/output types match signature
   - Verify all required fields are provided
   - Use TypeScript for better type checking

3. **Performance**
   - Consider using WebGL for better performance
   - Enable caching for repeated operations
   - Configure appropriate retry settings

### Getting Help

- Check the [Documentation](../README.md)
- Look through [Examples](../examples)
- File issues on GitHub
