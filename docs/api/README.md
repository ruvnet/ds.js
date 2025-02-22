# DSPy.ts API Reference

## Core Components

### Module System

The DSPy.ts module system provides a declarative way to define language model interactions:

```typescript
import { defineModule } from 'dspy.ts';

const module = defineModule<TInput, TOutput>({
  name: string;
  signature: {
    inputs: FieldDefinition[];
    outputs: FieldDefinition[];
  };
  promptTemplate: (input: TInput) => string;
  strategy?: 'Predict' | 'ChainOfThought' | 'ReAct';
});
```

### Language Model Integration

DSPy.ts supports multiple language model backends:

```typescript
// ONNX Runtime Web
import { ONNXModel } from 'dspy.ts';
const onnxModel = new ONNXModel({
  modelPath: string;
  executionProvider?: 'wasm' | 'webgl' | 'webgpu';
});

// JS-PyTorch
import { TorchModel } from 'dspy.ts';
const torchModel = new TorchModel({
  modelPath?: string;
  deviceType?: 'cpu' | 'webgl';
});
```

### Pipeline System

Chain multiple modules together:

```typescript
import { Pipeline } from 'dspy.ts';

const pipeline = new Pipeline(
  modules: Module<any, any>[],
  config?: {
    stopOnError?: boolean;
    debug?: boolean;
    maxRetries?: number;
    retryDelay?: number;
  }
);
```

## Type Definitions

### Core Types

```typescript
interface Module<TInput, TOutput> {
  name: string;
  signature: Signature;
  run(input: TInput): Promise<TOutput>;
}

interface Signature {
  inputs: FieldDefinition[];
  outputs: FieldDefinition[];
}

interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
}
```

### Language Model Types

```typescript
interface LMDriver {
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  init?(): Promise<void>;
  cleanup?(): Promise<void>;
}

interface GenerationOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stopSequences?: string[];
}
```

### Pipeline Types

```typescript
interface PipelineConfig {
  stopOnError?: boolean;
  debug?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

interface PipelineResult {
  success: boolean;
  finalOutput: any;
  steps: StepResult[];
  totalDuration: number;
  error?: Error;
}

interface StepResult {
  moduleName: string;
  input: any;
  output: any;
  duration: number;
  error?: Error;
}
```

## Module Types

### PredictModule

Basic module for single-step LM calls:

```typescript
const predictModule = defineModule<TInput, TOutput>({
  name: 'Predictor',
  signature: {
    inputs: [{ name: 'input', type: 'string' }],
    outputs: [{ name: 'output', type: 'string' }]
  },
  promptTemplate: (input) => input,
  strategy: 'Predict'
});
```

### ChainOfThought Module (Planned)

For complex reasoning tasks:

```typescript
const cotModule = defineModule<TInput, TOutput>({
  name: 'Reasoner',
  signature: {
    inputs: [{ name: 'problem', type: 'string' }],
    outputs: [
      { name: 'steps', type: 'string[]' },
      { name: 'solution', type: 'string' }
    ]
  },
  strategy: 'ChainOfThought'
});
```

### ReAct Module (Planned)

For tool-using agents:

```typescript
const reactModule = defineModule<TInput, TOutput>({
  name: 'Agent',
  signature: {
    inputs: [{ name: 'task', type: 'string' }],
    outputs: [{ name: 'result', type: 'string' }]
  },
  strategy: 'ReAct',
  tools: [/* tool definitions */]
});
```

## Error Handling

DSPy.ts provides several error types:

```typescript
class LMError extends Error {
  constructor(message: string, public readonly cause?: Error);
}

class ModuleError extends Error {
  constructor(
    message: string,
    public readonly moduleName: string,
    public readonly cause?: Error
  );
}

class PipelineError extends Error {
  constructor(
    message: string,
    public readonly step: number,
    public readonly cause?: Error
  );
}
```

Example error handling:

```typescript
try {
  const result = await module.run(input);
} catch (error) {
  if (error instanceof LMError) {
    // Handle LM-specific error
  } else if (error instanceof ModuleError) {
    // Handle module-specific error
  }
}
```

## Configuration

Global configuration functions:

```typescript
// Set the global LM driver
function configureLM(lm: LMDriver): void;

// Get the current LM driver
function getLM(): LMDriver;
```

## Best Practices

1. **Type Safety**
   - Use TypeScript for better type checking
   - Define clear input/output signatures
   - Validate data at runtime

2. **Error Handling**
   - Catch specific error types
   - Use pipeline error handling for graceful failures
   - Implement proper cleanup

3. **Performance**
   - Configure appropriate retry settings
   - Use caching when possible
   - Clean up resources properly

4. **Testing**
   - Use DummyLM for testing
   - Write comprehensive unit tests
   - Test error handling paths

## Examples

See the [examples directory](../examples) for complete working examples of various use cases.
