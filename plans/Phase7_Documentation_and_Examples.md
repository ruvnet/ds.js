# Phase 7: Documentation & Examples

## Overview
This phase creates comprehensive documentation and example implementations for DS.js. We'll provide detailed API references, usage guides, and practical examples that demonstrate the framework's capabilities.

## Documentation Structure

### 1. Main README.md

```markdown
# DS.js (Declarative Self-Learning JavaScript)

DS.js is a modular framework for building language model pipelines in JavaScript/TypeScript. It provides a declarative approach to composing LM calls and supports multiple backends including ONNX Runtime Web and JS-PyTorch.

## Features

- **Declarative DSL:** Define modules with clear input/output signatures
- **Pipeline Execution:** Chain module calls asynchronously
- **Multiple Backends:** Support for ONNX models and JS-PyTorch
- **Type Safety:** Full TypeScript support with comprehensive type definitions
- **Extensible:** Easy to add new module types and LM backends
- **Well-Tested:** Comprehensive test suite with Jest

## Installation

```bash
npm install ds.js
```

## Quick Start

```typescript
import { defineModule, configureLM, ONNXModel } from 'ds.js';

// Configure DS.js to use an ONNX model
const model = new ONNXModel({
  modelPath: 'path/to/model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define a simple sentiment analysis module
const sentimentModule = defineModule<{ text: string }, { sentiment: string }>({
  name: 'SentimentAnalyzer',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [{ name: 'sentiment', type: 'string' }]
  },
  promptTemplate: ({ text }) => `Analyze the sentiment: "${text}"`
});

// Use the module
const result = await sentimentModule.run({
  text: 'I love using DS.js!'
});
console.log(result.sentiment); // Expected: "positive"
```

## Documentation

- [API Reference](docs/api-reference.md)
- [Module Types](docs/module-types.md)
- [Pipeline Guide](docs/pipeline-guide.md)
- [LM Backends](docs/lm-backends.md)
- [Examples](examples/)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
```

### 2. API Reference (docs/api-reference.md)

```markdown
# DS.js API Reference

## Core Components

### Module Base Class

The foundation for all DS.js modules:

```typescript
abstract class Module<TInput, TOutput> {
  constructor(options: {
    name: string;
    signature: Signature;
    promptTemplate: (input: TInput) => string;
    strategy: 'Predict' | 'ChainOfThought' | 'ReAct';
  });

  abstract run(input: TInput): Promise<TOutput>;
}
```

### Pipeline Class

Orchestrates the execution of multiple modules:

```typescript
class Pipeline {
  constructor(
    modules: Module<any, any>[],
    config?: PipelineConfig
  );

  async run(initialInput: any): Promise<PipelineResult>;
}
```

### LM Driver Interface

Abstract interface for language model implementations:

```typescript
interface LMDriver {
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  init?(): Promise<void>;
  cleanup?(): Promise<void>;
}
```

## Module Types

### PredictModule

Basic module for single-step LM calls:

```typescript
const module = defineModule<TInput, TOutput>({
  name: string;
  signature: {
    inputs: FieldDefinition[];
    outputs: FieldDefinition[];
  };
  promptTemplate: (input: TInput) => string;
});
```

## LM Implementations

### ONNXModel

```typescript
const model = new ONNXModel({
  modelPath: string;
  executionProvider?: 'wasm' | 'webgl' | 'webgpu';
  maxTokens?: number;
});
```

### TorchModel

```typescript
const model = new TorchModel({
  modelPath?: string;
  deviceType?: 'cpu' | 'webgl';
  architecture?: {
    inputSize: number;
    hiddenSize: number;
    outputSize: number;
  };
});
```

## Utility Types

### Signature Definition

```typescript
interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
}

interface Signature {
  inputs: FieldDefinition[];
  outputs: FieldDefinition[];
}
```

### Pipeline Configuration

```typescript
interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}
```
```

### 3. Module Types Guide (docs/module-types.md)

```markdown
# DS.js Module Types

## Overview

DS.js supports different types of modules for various LM interaction patterns:

### 1. PredictModule

The basic module type for direct LM calls:

```typescript
const predictModule = defineModule({
  name: 'Predictor',
  signature: {
    inputs: [{ name: 'query', type: 'string' }],
    outputs: [{ name: 'answer', type: 'string' }]
  },
  promptTemplate: ({ query }) => query,
  strategy: 'Predict'  // default
});
```

Use cases:
- Simple question answering
- Classification tasks
- Direct transformations

### 2. ChainOfThought (Planned)

For complex reasoning tasks:

```typescript
const cotModule = defineModule({
  name: 'Reasoner',
  signature: {
    inputs: [{ name: 'problem', type: 'string' }],
    outputs: [
      { name: 'steps', type: 'string' },
      { name: 'solution', type: 'string' }
    ]
  },
  strategy: 'ChainOfThought'
});
```

Use cases:
- Math problem solving
- Multi-step reasoning
- Decision making

### 3. ReAct (Planned)

For tool-using agents:

```typescript
const reactModule = defineModule({
  name: 'Agent',
  signature: {
    inputs: [{ name: 'task', type: 'string' }],
    outputs: [{ name: 'result', type: 'string' }]
  },
  strategy: 'ReAct',
  tools: [/* tool definitions */]
});
```

Use cases:
- API interaction
- Web search
- Multi-tool tasks
```

### 4. Pipeline Guide (docs/pipeline-guide.md)

```markdown
# DS.js Pipeline Guide

## Creating Pipelines

Pipelines chain multiple modules together:

```typescript
const pipeline = new Pipeline(
  [module1, module2, module3],
  {
    stopOnError: true,
    debug: true,
    maxRetries: 2
  }
);
```

## Error Handling

Pipelines support different error handling strategies:

```typescript
// Stop on first error
const strictPipeline = new Pipeline(modules, {
  stopOnError: true
});

// Continue with original input on error
const lenientPipeline = new Pipeline(modules, {
  stopOnError: false
});

// Retry failed steps
const retryingPipeline = new Pipeline(modules, {
  maxRetries: 3,
  retryDelay: 1000  // ms
});
```

## Debugging

Enable debug mode for detailed logging:

```typescript
const pipeline = new Pipeline(modules, {
  debug: true
});

// Logs will show:
// - Module execution order
// - Input/output for each step
// - Errors and retry attempts
// - Timing information
```

## Pipeline Results

The pipeline returns detailed execution information:

```typescript
const result = await pipeline.run(initialInput);

console.log(result.success);        // boolean
console.log(result.finalOutput);    // final module output
console.log(result.totalDuration);  // ms
console.log(result.steps);          // step-by-step details
```
```

### 5. Example Implementations (examples/)

#### a. Sentiment Analysis (examples/sentiment.ts)

```typescript
import { defineModule, configureLM, ONNXModel } from 'ds.js';

// Configure ONNX model
const model = new ONNXModel({
  modelPath: 'sentiment-model.onnx',
  executionProvider: 'wasm'
});
await model.init();
configureLM(model);

// Define sentiment analysis module
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

// Use the module
const result = await sentimentModule.run({
  text: 'I absolutely love this product! Best purchase ever.'
});

console.log(result);
// {
//   sentiment: 'positive',
//   confidence: 0.95
// }
```

#### b. Question Answering (examples/qa.ts)

```typescript
import { defineModule, configureLM, Pipeline, TorchModel } from 'ds.js';

// Configure model
const model = new TorchModel({
  modelPath: 'qa-model.pt',
  deviceType: 'webgl'
});
await model.init();
configureLM(model);

// Define context processing module
const contextModule = defineModule<
  { question: string },
  { context: string }
>({
  name: 'ContextRetriever',
  signature: {
    inputs: [{ name: 'question', type: 'string' }],
    outputs: [{ name: 'context', type: 'string' }]
  },
  promptTemplate: ({ question }) =>
    `Find relevant information for: "${question}"`
});

// Define answer generation module
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
const pipeline = new Pipeline([
  contextModule,
  answerModule
]);

// Use the pipeline
const result = await pipeline.run({
  question: 'What is the capital of France?'
});

console.log(result.finalOutput.answer);
// "The capital of France is Paris."
```

#### c. Text Classification (examples/classification.ts)

```typescript
import { defineModule, configureLM, ONNXModel } from 'ds.js';

// Configure model
const model = new ONNXModel({
  modelPath: 'classifier.onnx'
});
await model.init();
configureLM(model);

// Define classification module
const classifierModule = defineModule<
  { text: string },
  { category: string; probabilities: Record<string, number> }
>({
  name: 'TextClassifier',
  signature: {
    inputs: [{ name: 'text', type: 'string' }],
    outputs: [
      { name: 'category', type: 'string' },
      { name: 'probabilities', type: 'object' }
    ]
  },
  promptTemplate: ({ text }) =>
    `Classify the following text into categories (news, sports, technology, entertainment):\n"${text}"`
});

// Use the module
const result = await classifierModule.run({
  text: 'Apple announces new iPhone with revolutionary AI features'
});

console.log(result);
// {
//   category: 'technology',
//   probabilities: {
//     technology: 0.85,
//     news: 0.12,
//     entertainment: 0.02,
//     sports: 0.01
//   }
// }
```

## Implementation Order

1. Start with main README:
   - Write clear introduction and features
   - Add installation and quick start
   - Include basic usage examples

2. Create API reference:
   - Document all public interfaces
   - Include type definitions
   - Add usage examples

3. Write specific guides:
   - Detail module types
   - Explain pipeline usage
   - Document LM backends

4. Create example implementations:
   - Write practical examples
   - Include common use cases
   - Add comments and explanations

## Commit Guidelines

After completing each documentation section:

1. Main Documentation:
```bash
git add README.md docs/api-reference.md docs/module-types.md docs/pipeline-guide.md
git commit -m "Add core documentation with API reference and guides"
```

2. Examples:
```bash
git add examples/
git commit -m "Add example implementations demonstrating DS.js usage"
```

## Success Criteria

- [ ] Main README is clear and informative
- [ ] API reference is complete and accurate
- [ ] Module and pipeline guides are comprehensive
- [ ] Examples demonstrate practical usage
- [ ] Documentation is well-organized
- [ ] Code samples are tested and working
- [ ] All sections are properly linked

## Next Steps

Once this phase is complete, proceed to Phase 8 (Deployment & Publishing) where we'll prepare the package for npm publication.

## Troubleshooting

### Common Issues

1. **Documentation Clarity**
   - Verify all concepts are explained
   - Check code examples work
   - Ensure links are valid

2. **Example Issues**
   - Test all example code
   - Verify dependencies
   - Check error handling

3. **API Reference**
   - Verify type definitions
   - Check method signatures
   - Validate examples

### Version Compatibility

- TypeScript: ^4.9.0
- Jest: ^29.0.0
