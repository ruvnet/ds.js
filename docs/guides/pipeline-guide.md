# DSPy.ts Pipeline Guide

## Overview

Pipelines in DSPy.ts allow you to chain multiple modules together to create complex workflows. This guide covers pipeline creation, configuration, and best practices.

## Basic Pipeline Usage

### Creating a Pipeline

```typescript
import { Pipeline } from 'dspy.ts';

const pipeline = new Pipeline(
  [module1, module2, module3],  // Array of modules
  {
    stopOnError: true,          // Stop on first error
    debug: true,                // Enable debug logging
    maxRetries: 2,              // Retry failed steps
    retryDelay: 1000           // Delay between retries (ms)
  }
);
```

### Running a Pipeline

```typescript
const result = await pipeline.run(initialInput);

console.log(result.success);        // boolean
console.log(result.finalOutput);    // final module output
console.log(result.totalDuration);  // ms
console.log(result.steps);          // step-by-step details
```

## Pipeline Configuration

### Error Handling Strategies

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

### Debugging

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
interface PipelineResult {
  success: boolean;          // Overall success status
  finalOutput: any;          // Final module output
  steps: StepResult[];       // Individual step results
  totalDuration: number;     // Total execution time (ms)
  error?: Error;            // Error if failed
}

interface StepResult {
  moduleName: string;        // Module name
  input: any;               // Step input
  output: any;              // Step output
  duration: number;         // Step duration (ms)
  error?: Error;           // Step error if any
}
```

## Advanced Pipeline Features

### 1. Module Dependencies

Modules can specify dependencies on other modules:

```typescript
const answerModule = defineModule({
  name: 'AnswerGenerator',
  requires: ['context'],  // Requires output from context module
  signature: {
    inputs: [
      { name: 'question', type: 'string' },
      { name: 'context', type: 'string' }
    ],
    outputs: [{ name: 'answer', type: 'string' }]
  }
});
```

### 2. Conditional Execution

Modules can be conditionally executed:

```typescript
const pipeline = new Pipeline(modules, {
  conditions: {
    'ValidationModule': (input) => input.needsValidation,
    'EnhancementModule': (input) => input.quality < 0.8
  }
});
```

### 3. Data Transformation

Transform data between modules:

```typescript
const pipeline = new Pipeline(modules, {
  transforms: {
    'Module2': (input) => ({
      ...input,
      processed: true
    })
  }
});
```

## Pipeline Patterns

### 1. Question Answering Pipeline

```typescript
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

// Create QA pipeline
const qaPipeline = new Pipeline([
  contextModule,
  answerModule
], {
  stopOnError: true,
  debug: true
});
```

### 2. Classification Pipeline

```typescript
const pipeline = new Pipeline([
  preprocessor,
  classifier,
  confidenceFilter,
  postprocessor
], {
  conditions: {
    'postprocessor': (input) => input.confidence > 0.8
  }
});
```

### 3. Content Generation Pipeline

```typescript
const pipeline = new Pipeline([
  topicExpander,
  outlineGenerator,
  contentGenerator,
  qualityChecker,
  formatter
], {
  maxRetries: 2,
  retryDelay: 1000
});
```

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await pipeline.run(input);
  if (!result.success) {
    console.error('Pipeline failed:', result.error);
    // Handle failure
  }
} catch (error) {
  // Handle unexpected errors
}
```

### 2. Resource Management

```typescript
const pipeline = new Pipeline(modules, {
  cleanup: async () => {
    // Clean up resources
  },
  maxConcurrent: 3  // Limit concurrent executions
});
```

### 3. Monitoring

```typescript
const pipeline = new Pipeline(modules, {
  onStep: (step) => {
    // Monitor step execution
    metrics.record(step);
  },
  onComplete: (result) => {
    // Monitor pipeline completion
    metrics.recordPipeline(result);
  }
});
```

## Performance Optimization

### 1. Caching

```typescript
const pipeline = new Pipeline(modules, {
  cache: {
    enabled: true,
    ttl: 3600,  // seconds
    storage: 'memory'  // or 'redis', etc.
  }
});
```

### 2. Batching

```typescript
const pipeline = new Pipeline(modules, {
  batch: {
    size: 10,
    timeout: 1000  // ms
  }
});
```

### 3. Resource Limits

```typescript
const pipeline = new Pipeline(modules, {
  limits: {
    memory: '1GB',
    timeout: 30000,  // ms
    concurrent: 5
  }
});
```

## Debugging and Testing

### 1. Debug Mode

```typescript
const pipeline = new Pipeline(modules, {
  debug: true,
  logLevel: 'verbose',
  logFile: 'pipeline.log'
});
```

### 2. Testing

```typescript
// Mock modules for testing
const mockModule = {
  run: jest.fn().mockResolvedValue({ output: 'test' })
};

const pipeline = new Pipeline([mockModule]);
const result = await pipeline.run(input);
expect(result.success).toBe(true);
```

### 3. Metrics

```typescript
const pipeline = new Pipeline(modules, {
  metrics: {
    enabled: true,
    collector: metricsCollector,
    tags: ['production', 'v1']
  }
});
```

## Examples

Check out the [examples directory](../examples) for complete pipeline implementations and use cases.
